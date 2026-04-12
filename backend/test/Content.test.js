const { beforeAll, afterAll, describe, expect, it } = require("@jest/globals")
const request = require("supertest")
const mongoose = require("mongoose")

// ─── Mock GridFS ──────────────────────────────────────────────────────────────
jest.mock("../src/config/gridfs", () => ({
    upload: {
        fields: () => (req, res, next) => next(),
        single: () => (req, res, next) => next(),
        array: () => (req, res, next) => next(),
    },
    getGridFsBucket: jest.fn(() => ({
        openUploadStream: jest.fn(() => {
            const { EventEmitter } = require("events")
            const stream = new EventEmitter()
            stream.id = new (require("mongoose").Types.ObjectId)()
            stream.filename = `mock-gridfs-file.pdf`
            stream.end = jest.fn(() => {
                setImmediate(() => stream.emit("finish"))
            })
            return stream
        }),
    })),
}))

// ─── Mock Cloudinary ──────────────────────────────────────────────────────────
jest.mock("../src/config/cloudinary", () => ({
    uploader: {
        upload_stream: jest.fn((_options, callback) => {
            const { PassThrough } = require("stream")
            const mockStream = new PassThrough()
            mockStream.resume()
            mockStream.on("end", () => {
                callback(null, {
                    public_id: "content/files/mock-cloudinary-file",
                    secure_url: "https://res.cloudinary.com/demo/raw/upload/mock-cloudinary-file.pdf",
                    bytes: 12 * 1024 * 1024,
                    original_filename: "mock-cloudinary-file",
                })
            })
            return mockStream
        }),
    },
}))

const app = require("../src/app")
const db = require("./db")
const ExamLevel = require("../src/models/ExamLevel")
const Subject = require("../src/models/Subject")
const Content = require("../src/models/Content")

// ─── Test Setup ───────────────────────────────────────────────────────────────

let subjectId = ""
let examLevelId = ""

const mockContents = [
    {
        title: "Physics Past Paper 2023",
        contentType: "past_paper",
        year: 2023,
        term: "1st_term",
        tags: "mechanics, waves",
    },
    {
        title: "Introduction to Mechanics",
        contentType: "lesson",
        year: 2024,
        unit: "Mechanics",
        tags: "mechanics, motion",
    },
    {
        title: "Physics Video Lecture 1",
        contentType: "lecture_video",
        videoUrl: "https://youtube.com/watch?v=test1",
        year: 2024,
        tags: "mechanics, kinematics",
    },
    {
        title: "Physics Past Paper 2022",
        contentType: "past_paper",
        year: 2022,
        term: "2nd_term",
        tags: "electricity, magnetism",
    },
]

beforeAll(async () => {
    await db()

    await ExamLevel.deleteMany({})
    await Subject.deleteMany({})
    await Content.deleteMany({})

    const examLevel = await ExamLevel.create({ name: "Advanced Level", code: "AL" })
    examLevelId = examLevel._id.toString()

    const subject = await Subject.create({
        name: "Physics",
        code: "PHY",
        examLevel: examLevelId,
        opentdbCategory: 17,
    })
    subjectId = subject._id.toString()

    for (const content of mockContents) {
        const data = { ...content, subject: subjectId }
        if (content.contentType !== "lecture_video") {
            data.fileId = new (require("mongoose").Types.ObjectId)()
            data.fileName = "mock-file.pdf"
            data.fileType = "application/pdf"
            data.fileSize = 1024
            data.fileStorage = "gridfs"
        }
        await Content.create(data)
    }
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Contents", () => {
    describe("GET /api/contents", () => {
        it("should return all active contents", async () => {
            const response = await request(app).get("/api/contents")
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.body).toBeInstanceOf(Array)
            expect(response.body.body.length).toBe(mockContents.length)
        })

        it("should filter by subject", async () => {
            const response = await request(app).get(`/api/contents?subject=${subjectId}`)
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.body.length).toBe(mockContents.length)
        })

        it("should filter by content type", async () => {
            const response = await request(app).get("/api/contents?contentType=past_paper")
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.body.length).toBe(2)
            expect(response.body.body.every((c) => c.contentType === "past_paper")).toBe(true)
        })

        it("should filter by year", async () => {
            const response = await request(app).get("/api/contents?year=2023")
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.body.length).toBe(1)
            expect(response.body.body[0].year).toBe(2023)
        })

        it("should filter by term", async () => {
            const response = await request(app).get("/api/contents?term=1st_term")
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.body.length).toBe(1)
            expect(response.body.body[0].term).toBe("1st_term")
        })

        it("should filter by exam level", async () => {
            const response = await request(app).get(`/api/contents?examLevel=${examLevelId}`)
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.body.length).toBe(mockContents.length)
        })

        it("should not return inactive contents", async () => {
            const inactive = await Content.create({
                title: "Inactive Content",
                contentType: "lesson",
                subject: subjectId,
                isActive: false,
            })

            const response = await request(app).get("/api/contents")
            expect(response.status).toBe(200)
            const titles = response.body.body.map((c) => c.title)
            expect(titles).not.toContain("Inactive Content")

            await Content.deleteOne({ _id: inactive._id })
        })
    })

    describe("POST /api/contents", () => {
        it("should create a new video content without file upload", async () => {
            const newContent = {
                title: "New Video Lecture",
                subject: subjectId,
                contentType: "lecture_video",
                videoUrl: "https://youtube.com/watch?v=newtest",
                year: 2024,
                unit: "Waves",
                tags: "waves, sound",
            }
            const response = await request(app).post("/api/contents").send(newContent)
            expect(response.status).toBe(201)
            expect(response.body.success).toBe(true)
            expect(response.body.body.title).toBe(newContent.title)
            expect(response.body.body.contentType).toBe("lecture_video")
            expect(response.body.body.videoUrl).toBe(newContent.videoUrl)
            expect(response.body.body.subject._id).toBe(subjectId)

            await Content.deleteOne({ title: "New Video Lecture" })
        })

        it("should store GridFS file fields correctly (small file)", async () => {
            const mongoose = require("mongoose")
            const gridfsContent = await Content.create({
                title: "Small PDF Lesson",
                subject: subjectId,
                contentType: "lesson",
                unit: "Mechanics",
                fileId: new mongoose.Types.ObjectId(),
                fileName: "small.pdf",
                fileType: "application/pdf",
                fileSize: 1024 * 100,
                fileStorage: "gridfs",
            })

            const response = await request(app).get(`/api/contents/${gridfsContent._id}`)
            expect(response.status).toBe(200)
            expect(response.body.body.fileStorage).toBe("gridfs")
            expect(response.body.body.fileId).toBeTruthy()
            expect(response.body.body.fileUrl).toBeFalsy()

            await Content.deleteOne({ _id: gridfsContent._id })
        })

        it("should store Cloudinary file fields correctly (large file)", async () => {
            const cloudinaryContent = await Content.create({
                title: "Large PDF Lesson",
                subject: subjectId,
                contentType: "lesson",
                unit: "Waves",
                fileUrl: "https://res.cloudinary.com/demo/raw/upload/mock-file.pdf",
                cloudinaryPublicId: "content/files/mock-file",
                fileName: "large.pdf",
                fileType: "application/pdf",
                fileSize: 12 * 1024 * 1024,
                fileStorage: "cloudinary",
            })

            const response = await request(app).get(`/api/contents/${cloudinaryContent._id}`)
            expect(response.status).toBe(200)
            expect(response.body.body.fileStorage).toBe("cloudinary")
            expect(response.body.body.fileUrl).toBeTruthy()
            expect(response.body.body.cloudinaryPublicId).toBeTruthy()
            expect(response.body.body.fileId).toBeFalsy()

            await Content.deleteOne({ _id: cloudinaryContent._id })
        })

        it("should store answer sheet fields correctly", async () => {
            const mongoose = require("mongoose")
            const paperWithAnswer = await Content.create({
                title: "Past Paper With Answer Sheet",
                subject: subjectId,
                contentType: "past_paper",
                year: 2023,
                term: "1st_term",
                fileId: new mongoose.Types.ObjectId(),
                fileName: "paper.pdf",
                fileStorage: "gridfs",
                hasAnswerSheet: true,
                answerSheetFileId: new mongoose.Types.ObjectId(),
                answerSheetFileName: "answers.pdf",
            })

            const response = await request(app).get(`/api/contents/${paperWithAnswer._id}`)
            expect(response.status).toBe(200)
            expect(response.body.body.hasAnswerSheet).toBe(true)
            expect(response.body.body.answerSheetFileId).toBeTruthy()

            await Content.deleteOne({ _id: paperWithAnswer._id })
        })

        it("should parse tags from a comma-separated string", async () => {
            const response = await request(app).post("/api/contents").send({
                title: "Tagged Video",
                subject: subjectId,
                contentType: "lecture_video",
                videoUrl: "https://youtube.com/watch?v=tags-test",
                tags: "mechanics, motion, forces",
            })

            expect(response.status).toBe(201)
            expect(response.body.body.tags).toEqual(["mechanics", "motion", "forces"])

            await Content.deleteOne({ title: "Tagged Video" })
        })

        it("should return 400 if required fields are missing", async () => {
            const response = await request(app)
                .post("/api/contents")
                .send({ title: "Missing Fields" })
            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
        })

        it("should return 400 if PDF file is missing for non-video content", async () => {
            const response = await request(app).post("/api/contents").send({
                title: "Lesson Without File",
                subject: subjectId,
                contentType: "lesson",
            })
            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
        })

        it("should return 400 for an invalid content type", async () => {
            const response = await request(app).post("/api/contents").send({
                title: "Bad Type Content",
                subject: subjectId,
                contentType: "invalid_type",
            })
            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
        })

        it("should return 404 for a non-existent subject", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const response = await request(app).post("/api/contents").send({
                title: "Ghost Content",
                subject: nonExistentId,
                contentType: "lecture_video",
                videoUrl: "https://youtube.com/watch?v=ghost",
            })
            expect(response.status).toBe(404)
            expect(response.body.success).toBe(false)
        })

        it("should return 400 for an invalid subject id", async () => {
            const response = await request(app).post("/api/contents").send({
                title: "Invalid Subject Content",
                subject: "invalid-id",
                contentType: "lecture_video",
                videoUrl: "https://youtube.com/watch?v=invalid",
            })
            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
        })
    })

    describe("GET /api/contents/:id", () => {
        it("should return a content by id and increment its view count", async () => {
            const content = await Content.findOne({ contentType: "lesson" }).exec()
            const viewsBefore = content.views

            const response = await request(app).get(`/api/contents/${content._id}`)
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.body.title).toBe(content.title)
            expect(response.body.body.views).toBe(viewsBefore + 1)
        })

        it("should return 400 for an invalid id", async () => {
            const response = await request(app).get("/api/contents/invalid-id")
            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
        })

        it("should return 404 for a non-existent content id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const response = await request(app).get(`/api/contents/${nonExistentId}`)
            expect(response.status).toBe(404)
            expect(response.body.success).toBe(false)
        })
    })

    describe("PUT /api/contents/:id", () => {
        it("should update a content by id", async () => {
            const content = await Content.findOne({ contentType: "lesson" }).exec()
            const updatedData = { title: "Updated Lesson Title", description: "New description" }
            const response = await request(app)
                .put(`/api/contents/${content._id}`)
                .send(updatedData)
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.body.title).toBe(updatedData.title)
            expect(response.body.body.description).toBe(updatedData.description)
        })

        it("should update fileStorage to gridfs when updated via PUT with gridfs fields", async () => {
            const mongoose = require("mongoose")
            const gridfsDoc = await Content.create({
                title: "GridFS Update Test Lesson",
                subject: subjectId,
                contentType: "lesson",
                unit: "Mechanics",
                fileId: new mongoose.Types.ObjectId(),
                fileName: "original.pdf",
                fileType: "application/pdf",
                fileSize: 1024,
                fileStorage: "gridfs",
            })
            const newFileId = new mongoose.Types.ObjectId()

            const response = await request(app)
                .put(`/api/contents/${gridfsDoc._id}`)
                .send({
                    fileId: newFileId,
                    fileName: "replaced.pdf",
                    fileStorage: "gridfs",
                })

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.body.fileStorage).toBe("gridfs")
            expect(response.body.body.fileId).toBeTruthy()

            await Content.deleteOne({ _id: gridfsDoc._id })
        })

        it("should return 400 for an invalid id", async () => {
            const response = await request(app)
                .put("/api/contents/invalid-id")
                .send({ title: "Invalid" })
            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
        })

        it("should return 404 for a non-existent content id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const response = await request(app)
                .put(`/api/contents/${nonExistentId}`)
                .send({ title: "Ghost Content" })
            expect(response.status).toBe(404)
            expect(response.body.success).toBe(false)
        })

        it("should return 400 for an invalid content type on update", async () => {
            const content = await Content.findOne({ contentType: "lesson" }).exec()
            const response = await request(app)
                .put(`/api/contents/${content._id}`)
                .send({ contentType: "invalid_type" })
            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
        })
    })

    describe("POST /api/contents/:id/download", () => {
        it("should increment the download count", async () => {
            const content = await Content.findOne({ contentType: "past_paper" }).exec()
            const downloadsBefore = content.downloads

            const response = await request(app).post(`/api/contents/${content._id}/download`)
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)

            const updated = await Content.findById(content._id)
            expect(updated.downloads).toBe(downloadsBefore + 1)
        })

        it("should return 400 for an invalid id", async () => {
            const response = await request(app).post("/api/contents/invalid-id/download")
            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
        })

        it("should return 404 for a non-existent content id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const response = await request(app).post(`/api/contents/${nonExistentId}/download`)
            expect(response.status).toBe(404)
            expect(response.body.success).toBe(false)
        })
    })

    describe("DELETE /api/contents/:id", () => {
        it("should soft delete a content by id", async () => {
            const content = await Content.findOne({ contentType: "lecture_video" }).exec()
            const response = await request(app).delete(`/api/contents/${content._id}`)
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)

            const deletedContent = await Content.findById(content._id)
            expect(deletedContent.isActive).toBe(false)
        })

        it("should return 400 for an invalid id", async () => {
            const response = await request(app).delete("/api/contents/invalid-id")
            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
        })

        it("should return 404 for a non-existent content id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const response = await request(app).delete(`/api/contents/${nonExistentId}`)
            expect(response.status).toBe(404)
            expect(response.body.success).toBe(false)
        })
    })
})
afterAll(async () => {
    await mongoose.connection.close()})