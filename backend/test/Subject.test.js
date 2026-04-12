const { beforeAll, afterAll, describe, expect, it } = require("@jest/globals")
const request = require("supertest")
const mongoose = require("mongoose")

const app = require("../src/app")
const db = require("./db")
const ExamLevel = require("../src/models/ExamLevel")
const Subject = require("../src/models/Subject")

let examLevelId = ""
let secondExamLevelId = ""

const mockSubjects = [
    { name: "Physics", code: "PHY", description: "Physics subject", opentdbCategory: 17 },
    { name: "Chemistry", code: "CHEM", description: "Chemistry subject", opentdbCategory: 17 },
    { name: "Biology", code: "BIO", description: "Biology subject", opentdbCategory: 17 },
    { name: "Mathematics", code: "MATH", description: "Mathematics subject", opentdbCategory: 19 },
]

beforeAll(async () => {
    await db()

    await ExamLevel.deleteMany({})
    await Subject.deleteMany({})

    const examLevel = await ExamLevel.create({ name: "Advanced Level", code: "AL" })
    const secondExamLevel = await ExamLevel.create({ name: "Ordinary Level", code: "OL" })
    examLevelId = examLevel._id.toString()
    secondExamLevelId = secondExamLevel._id.toString()

    for (const subject of mockSubjects) {
        await Subject.create({ ...subject, examLevel: examLevelId })
    }
})

describe("Subjects", () => {
    describe("GET /api/subjects", () => {
        it("should return all active subjects", async () => {
            const response = await request(app).get("/api/subjects")
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.body).toBeInstanceOf(Array)
            expect(response.body.body.length).toBe(mockSubjects.length)
        })

        it("should filter subjects by exam level", async () => {
            await Subject.create({
                name: "English",
                code: "ENG",
                examLevel: secondExamLevelId,
                opentdbCategory: 10,
            })

            const response = await request(app).get(`/api/subjects?examLevel=${examLevelId}`)
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.body.length).toBe(mockSubjects.length)

            await Subject.deleteOne({ code: "ENG" })
        })

        it("should not return inactive subjects", async () => {
            const inactive = await Subject.create({
                name: "Inactive Subject",
                code: "INACT",
                examLevel: examLevelId,
                opentdbCategory: 17,
                isActive: false,
            })

            const response = await request(app).get("/api/subjects")
            expect(response.status).toBe(200)
            const codes = response.body.body.map((s) => s.code)
            expect(codes).not.toContain("INACT")

            await Subject.deleteOne({ _id: inactive._id })
        })
    })

    describe("POST /api/subjects", () => {
        it("should create a new subject", async () => {
            const newSubject = {
                name: "Economics",
                code: "ECON",
                examLevel: examLevelId,
                opentdbCategory: 17,
            }
            const response = await request(app).post("/api/subjects").send(newSubject)
            expect(response.status).toBe(201)
            expect(response.body.success).toBe(true)
            expect(response.body.body.name).toBe(newSubject.name)
            expect(response.body.body.code).toBe(newSubject.code)

            await Subject.deleteOne({ code: "ECON" })
        })

        it("should convert code to uppercase", async () => {
            const response = await request(app)
                .post("/api/subjects")
                .send({ name: "History", code: "hist", examLevel: examLevelId, opentdbCategory: 17 })
            expect(response.status).toBe(201)
            expect(response.body.body.code).toBe("HIST")

            await Subject.deleteOne({ code: "HIST" })
        })

        it("should return 400 if required fields are missing", async () => {
            const response = await request(app)
                .post("/api/subjects")
                .send({ name: "Missing Fields" })
            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
        })

        it("should return 404 for a non-existent exam level", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const response = await request(app).post("/api/subjects").send({
                name: "Ghost Subject",
                code: "GST",
                examLevel: nonExistentId,
                opentdbCategory: 17,
            })
            expect(response.status).toBe(404)
            expect(response.body.success).toBe(false)
        })

        it("should return 409 for a duplicate subject name in the same exam level", async () => {
            const response = await request(app).post("/api/subjects").send({
                name: "Physics",
                code: "PHY2",
                examLevel: examLevelId,
                opentdbCategory: 17,
            })
            expect(response.status).toBe(409)
            expect(response.body.success).toBe(false)
        })

        it("should return 400 for an invalid exam level id", async () => {
            const response = await request(app).post("/api/subjects").send({
                name: "Art",
                code: "ART",
                examLevel: "invalid-id",
                opentdbCategory: 17,
            })
            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
        })
    })

    describe("GET /api/subjects/:id", () => {
        it("should return a specific subject with populated exam level", async () => {
            const subject = await Subject.findOne({ code: "PHY" }).exec()
            const response = await request(app).get(`/api/subjects/${subject._id}`)
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.body.name).toBe("Physics")
            expect(response.body.body.examLevel.name).toBe("Advanced Level")
        })

        it("should return 400 for an invalid id", async () => {
            const response = await request(app).get("/api/subjects/invalid-id")
            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
        })

        it("should return 404 for a non-existent subject id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const response = await request(app).get(`/api/subjects/${nonExistentId}`)
            expect(response.status).toBe(404)
            expect(response.body.success).toBe(false)
        })
    })

    describe("PUT /api/subjects/:id", () => {
        it("should update a subject", async () => {
            const subject = await Subject.findOne({ code: "CHEM" }).exec()
            const updatedData = { name: "Advanced Chemistry", description: "Updated description" }
            const response = await request(app)
                .put(`/api/subjects/${subject._id}`)
                .send(updatedData)
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.body.name).toBe(updatedData.name)
            expect(response.body.body.description).toBe(updatedData.description)
        })

        it("should return 400 for an invalid id", async () => {
            const response = await request(app)
                .put("/api/subjects/invalid-id")
                .send({ name: "Invalid" })
            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
        })

        it("should return 404 for a non-existent subject id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const response = await request(app)
                .put(`/api/subjects/${nonExistentId}`)
                .send({ name: "Ghost Subject" })
            expect(response.status).toBe(404)
            expect(response.body.success).toBe(false)
        })

        it("should return 409 for a duplicate name in the same exam level on update", async () => {
            const subject = await Subject.findOne({ code: "BIO" }).exec()
            const response = await request(app)
                .put(`/api/subjects/${subject._id}`)
                .send({ name: "Physics" })
            expect(response.status).toBe(409)
            expect(response.body.success).toBe(false)
        })
    })

    describe("DELETE /api/subjects/:id", () => {
        it("should soft delete a subject", async () => {
            const subject = await Subject.findOne({ code: "MATH" }).exec()
            const response = await request(app).delete(`/api/subjects/${subject._id}`)
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)

            const deletedSubject = await Subject.findById(subject._id)
            expect(deletedSubject.isActive).toBe(false)
        })

        it("should return 400 for an invalid id", async () => {
            const response = await request(app).delete("/api/subjects/invalid-id")
            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
        })

        it("should return 404 for a non-existent subject id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const response = await request(app).delete(`/api/subjects/${nonExistentId}`)
            expect(response.status).toBe(404)
            expect(response.body.success).toBe(false)
        })
    })
})
afterAll(async () => {
    await mongoose.connection.close()})