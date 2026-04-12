const { beforeAll, afterAll, describe, expect, it } = require("@jest/globals")
const request = require("supertest")
const mongoose = require("mongoose")

const app = require("../src/app")
const db = require("./db")
const ExamLevel = require("../src/models/ExamLevel")

const mockExamLevels = [
    { name: "Advanced Level", code: "AL", description: "Advanced Level examinations" },
    { name: "Ordinary Level", code: "OL", description: "Ordinary Level examinations" },
    { name: "Primary Level", code: "PL", description: "Primary Level examinations" },
]

beforeAll(async () => {
    await db()
    await ExamLevel.deleteMany({})
})

describe("Exam Levels", () => {
    describe("POST /api/exam-levels", () => {
        it("should create a new exam level", async () => {
            const response = await request(app)
                .post("/api/exam-levels")
                .send(mockExamLevels[0])
            expect(response.status).toBe(201)
            expect(response.body.success).toBe(true)
            expect(response.body.body.name).toBe(mockExamLevels[0].name)
            expect(response.body.body.code).toBe(mockExamLevels[0].code)
            expect(response.body.body.isActive).toBe(true)
        })

        it("should create remaining exam levels for subsequent tests", async () => {
            for (const examLevel of mockExamLevels.slice(1)) {
                const response = await request(app)
                    .post("/api/exam-levels")
                    .send(examLevel)
                expect(response.status).toBe(201)
            }
        })

        it("should convert code to uppercase", async () => {
            const response = await request(app)
                .post("/api/exam-levels")
                .send({ name: "Diploma Level", code: "dl" })
            expect(response.status).toBe(201)
            expect(response.body.body.code).toBe("DL")

            await ExamLevel.deleteOne({ code: "DL" })
        })

        it("should reject exam level without required fields", async () => {
            const response = await request(app)
                .post("/api/exam-levels")
                .send({ name: "Missing Code" })
            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
        })

        it("should reject duplicate exam level code", async () => {
            const response = await request(app)
                .post("/api/exam-levels")
                .send({ name: "Another Advanced Level", code: "AL" })
            expect(response.status).toBe(409)
            expect(response.body.success).toBe(false)
        })
    })

    describe("GET /api/exam-levels", () => {
        it("should return all active exam levels", async () => {
            const response = await request(app).get("/api/exam-levels")
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.body).toBeInstanceOf(Array)
            expect(response.body.body.length).toBe(mockExamLevels.length)
        })

        it("should not return inactive exam levels", async () => {
            const inactive = await ExamLevel.create({
                name: "Inactive Level",
                code: "IL",
                isActive: false,
            })

            const response = await request(app).get("/api/exam-levels")
            expect(response.status).toBe(200)
            const codes = response.body.body.map((e) => e.code)
            expect(codes).not.toContain("IL")

            await ExamLevel.deleteOne({ _id: inactive._id })
        })
    })

    describe("GET /api/exam-levels/:id", () => {
        it("should return a specific exam level by id", async () => {
            const examLevel = await ExamLevel.findOne({ code: "AL" }).exec()
            const response = await request(app).get(`/api/exam-levels/${examLevel._id}`)
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.body.name).toBe("Advanced Level")
            expect(response.body.body.code).toBe("AL")
        })

        it("should return 404 for a non-existent exam level id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const response = await request(app).get(`/api/exam-levels/${nonExistentId}`)
            expect(response.status).toBe(404)
            expect(response.body.success).toBe(false)
        })
    })

    describe("PUT /api/exam-levels/:id", () => {
        it("should update an exam level", async () => {
            const examLevel = await ExamLevel.findOne({ code: "OL" }).exec()
            const updatedData = {
                name: "Updated Ordinary Level",
                description: "Updated description",
            }
            const response = await request(app)
                .put(`/api/exam-levels/${examLevel._id}`)
                .send(updatedData)
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.body.name).toBe(updatedData.name)
            expect(response.body.body.description).toBe(updatedData.description)
        })

        it("should return 404 when updating a non-existent exam level", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const response = await request(app)
                .put(`/api/exam-levels/${nonExistentId}`)
                .send({ name: "Ghost Level" })
            expect(response.status).toBe(404)
            expect(response.body.success).toBe(false)
        })
    })

    describe("DELETE /api/exam-levels/:id", () => {
        it("should soft delete an exam level", async () => {
            // Create a fresh one so we don't depend on PL surviving earlier tests
            const toDelete = await ExamLevel.create({ name: "Delete Me", code: "DEL" })
            const response = await request(app).delete(`/api/exam-levels/${toDelete._id}`)
            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)

            const deletedLevel = await ExamLevel.findById(toDelete._id)
            expect(deletedLevel.isActive).toBe(false)
        })

        it("should return 404 when deleting a non-existent exam level", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const response = await request(app).delete(`/api/exam-levels/${nonExistentId}`)
            expect(response.status).toBe(404)
            expect(response.body.success).toBe(false)
        })
    })
})
afterAll(async () => {
    await mongoose.connection.close()})