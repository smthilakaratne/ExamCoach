
const { beforeAll, afterAll, describe, expect, it } = require("@jest/globals")

const request = require("supertest")

const app = require("../src/app")
const db = require("./db")
const ForumThread = require("../src/models/ForumThread")
const User = require("../src/models/User")
const bcrypt = require("bcryptjs")

let authTokenUser1 = ""
let authTokenUser2 = ""

const mockUsers = [
    { name: "user1", email: "user1@example.com", password: "password123", isEmailVerified: true },
    { name: "user2", email: "user2@example.com", password: "password123", isEmailVerified: true },
    { name: "user3", email: "user3@example.com", password: "password123", isEmailVerified: true },
]

const mockThreads = [
    { title: "Sample title 1", body: "Sample body content 1", tags: ["tag1", "tag2"] },
    { title: "Sample title 2", body: "Sample body content 2", tags: ["tag3"] },
    { title: "Sample title 3", body: "Sample body content 3", tags: [] },
    { title: "Sample title 4", body: "Sample body content 4", tags: ["tag1"] },
]

beforeAll(async () => {
    await db()

    await User.deleteMany({})
    await ForumThread.deleteMany({})

    const usersWithHashedPasswords = await Promise.all(
        mockUsers.map(async (u) => ({
            ...u,
            password: await bcrypt.hash(u.password, 10),
        })),
    )

    await User.insertMany(usersWithHashedPasswords)
    const user1 = await User.findOne({ name: "user1" }).exec()

    const loginRes1 = await request(app)
        .post("/api/auth/login")
        .send({ email: "user1@example.com", password: "password123" })
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
    const loginRes2 = await request(app)
        .post("/api/auth/login")
        .send({ email: "user2@example.com", password: "password123" })
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
    authTokenUser1 = loginRes1.body.body.token
    authTokenUser2 = loginRes2.body.body.token

    for (const thread of mockThreads) {
        await ForumThread.create({ ...thread, createdBy: user1._id })
    }
})

describe("Forum", () => {
    describe("GET /api/forum", () => {
        it("should retrieve all forum threads", async () => {
            const res = await request(app).get("/api/forum")
            expect(res.status).toBe(200)
            expect(res.body.body).toBeInstanceOf(Array)
            expect(res.body.body.length).toBe(4)
            for (let id = 0; id < res.body.body.length; id++) {
                const thread = res.body.body[id]
                expect(thread.title).toBe(mockThreads[id].title)
                expect(thread.body).toBe(mockThreads[id].body)
                expect(thread.tags).toEqual(mockThreads[id].tags)
            }
        })
    })

    describe("POST /api/forum", () => {
        it("should create a new forum thread", async () => {
            const newThread = {
                title: "New Thread Title",
                body: "New Thread Body",
                tags: ["new", "thread"],
            }
            const res = await request(app)
                .post("/api/forum")
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send(newThread)
            expect(res.status).toBe(201)
            expect(res.body.body.thread.title).toBe(newThread.title)
            expect(res.body.body.thread.body).toBe(newThread.body)
            expect(res.body.body.thread.tags).toEqual(newThread.tags)
        })

        it("should return 401 if not authenticated", async () => {
            const newThread = {
                title: "Unauthorized Thread",
                body: "This should not be created",
                tags: [],
            }
            const res = await request(app).post("/api/forum").send(newThread)
            expect(res.status).toBe(401)
        })

        it("should return 400 if required fields are missing", async () => {
            const res = await request(app)
                .post("/api/forum")
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ title: "Missing Body" })
            expect(res.status).toBe(400)
        })

        it("should return 400 if title is too short", async () => {
            const res = await request(app)
                .post("/api/forum")
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ title: "Smol", body: "Valid body", tags: ["tag1"] })
            expect(res.status).toBe(400)
        })

        it("should return 400 if body is too short", async () => {
            const res = await request(app)
                .post("/api/forum")
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ title: "Valid Title", body: "Smol", tags: ["tag1"] })
            expect(res.status).toBe(400)
        })

        it("should return 400 if title is too long", async () => {
            const longTitle = "A".repeat(121)
            const res = await request(app)
                .post("/api/forum")
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ title: longTitle, body: "Valid body", tags: ["tag1"] })
            expect(res.status).toBe(400)
        })

        it("should return 400 if there are too many tags", async () => {
            const res = await request(app)
                .post("/api/forum")
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ title: "Valid Title", body: "Valid body", tags: Array(11).fill("tag") })
            expect(res.status).toBe(400)
        })
    })

    describe("GET /api/forum/:id", () => {
        it("should retrieve a forum thread by id", async () => {
            const thread = await ForumThread.findOne().exec()
            const res = await request(app).get(`/api/forum/${thread._id}`)
            expect(res.status).toBe(200)
            expect(res.body.body.thread.title).toBe(thread.title)
            expect(res.body.body.thread.body).toBe(thread.body)
            expect(res.body.body.thread.tags).toEqual(thread.tags)
        })

        it("should return 400 for invalid thread id", async () => {
            const res = await request(app).get("/api/forum/invalid-id")
            expect(res.status).toBe(400)
        })

        it("should return 404 for non-existent thread id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const res = await request(app).get(`/api/forum/${nonExistentId}`)
            expect(res.status).toBe(404)
        })
    })

    describe("PUT /api/forum/:id", () => {
        it("should update a forum thread by id", async () => {
            const thread = await ForumThread.findOne().exec()
            const updatedData = {
                title: "Updated Title",
                body: "Updated Body",
                tags: ["updated", "tags"],
            }
            const res = await request(app)
                .put(`/api/forum/${thread._id}`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send(updatedData)
            expect(res.status).toBe(200)
            expect(res.body.body.thread.title).toBe(updatedData.title)
            expect(res.body.body.thread.body).toBe(updatedData.body)
            expect(res.body.body.thread.tags).toEqual(updatedData.tags)
        })

        it("should return 401 if not authenticated", async () => {
            const thread = await ForumThread.findOne().exec()
            const res = await request(app)
                .put(`/api/forum/${thread._id}`)
                .send({ title: "Unauthorized Update" })
            expect(res.status).toBe(401)
        })

        it("should return 400 for invalid thread id", async () => {
            const res = await request(app)
                .put("/api/forum/invalid-id")
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ title: "Invalid ID Update" })
            expect(res.status).toBe(400)
        })

        it("should return 404 for non-existent thread id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const res = await request(app)
                .put(`/api/forum/${nonExistentId}`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ title: "Non-existent ID Update" })
            expect(res.status).toBe(404)
        })

        it("should return 404 if user does not own the thread", async () => {
            const thread = await ForumThread.findOne().exec()
            const res = await request(app)
                .put(`/api/forum/${thread._id}`)
                .set("Authorization", `Bearer ${authTokenUser2}`)
                .send({ title: "Unauthorized Update" })
            expect(res.status).toBe(404)
        })

        it("should return 400 if title is too short", async () => {
            const thread = await ForumThread.findOne().exec()
            const res = await request(app)
                .put(`/api/forum/${thread._id}`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ title: "Smol" })
            expect(res.status).toBe(400)
        })

        it("should return 400 if body is too short", async () => {
            const thread = await ForumThread.findOne().exec()
            const res = await request(app)
                .put(`/api/forum/${thread._id}`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ body: "Smol" })
            expect(res.status).toBe(400)
        })

        it("should return 400 if title is too long", async () => {
            const thread = await ForumThread.findOne().exec()
            const longTitle = "A".repeat(121)
            const res = await request(app)
                .put(`/api/forum/${thread._id}`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ title: longTitle })
            expect(res.status).toBe(400)
        })

        it("should return 400 if there are too many tags", async () => {
            const thread = await ForumThread.findOne().exec()
            const res = await request(app)
                .put(`/api/forum/${thread._id}`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ tags: Array(11).fill("tag") })
            expect(res.status).toBe(400)
        })
    })

    describe("POST /api/forum/:id/vote", () => {
        it("should cast an upvote on a thread", async () => {
            const thread = await ForumThread.findOne().exec()
            const res = await request(app)
                .post(`/api/forum/${thread._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ value: 1 })
            expect(res.status).toBe(200)
            expect(res.body.body.thread.reactions.up).toContainEqual(expect.any(String))
        })

        it("should cast a downvote on a thread", async () => {
            const thread = await ForumThread.findOne().exec()
            const res = await request(app)
                .post(`/api/forum/${thread._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser2}`)
                .send({ value: -1 })
            expect(res.status).toBe(200)
            expect(res.body.body.thread.reactions.down).toContainEqual(expect.any(String))
        })

        it("should return 401 if not authenticated", async () => {
            const thread = await ForumThread.findOne().exec()
            const res = await request(app).post(`/api/forum/${thread._id}/vote`).send({ value: 1 })
            expect(res.status).toBe(401)
        })

        it("should return 400 for invalid thread id", async () => {
            const res = await request(app)
                .post("/api/forum/invalid-id/vote")
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ value: 1 })
            expect(res.status).toBe(400)
        })

        it("should return 404 for non-existent thread id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const res = await request(app)
                .post(`/api/forum/${nonExistentId}/vote`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ value: 1 })
            expect(res.status).toBe(404)
        })

        it("should return 400 for invalid vote value", async () => {
            const thread = await ForumThread.findOne().exec()
            const res = await request(app)
                .post(`/api/forum/${thread._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ value: 2 })
            expect(res.status).toBe(400)
        })
    })

    describe("DELETE /api/forum/:id/vote", () => {
        it("should remove an upvote from a thread", async () => {
            const thread = await ForumThread.findOne().exec()
            await request(app)
                .post(`/api/forum/${thread._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ value: 1 })
            const res = await request(app)
                .delete(`/api/forum/${thread._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(200)
            expect(res.body.body.thread.reactions.up).not.toContainEqual(expect.any(String))
        })

        it("should remove a downvote from a thread", async () => {
            const thread = await ForumThread.findOne().exec()
            await request(app)
                .post(`/api/forum/${thread._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser2}`)
                .send({ value: -1 })
            const res = await request(app)
                .delete(`/api/forum/${thread._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser2}`)
            expect(res.status).toBe(200)
            expect(res.body.body.thread.reactions.down).not.toContainEqual(expect.any(String))
        })

        it("should return 401 if not authenticated", async () => {
            const thread = await ForumThread.findOne().exec()
            const res = await request(app).delete(`/api/forum/${thread._id}/vote`)
            expect(res.status).toBe(401)
        })

        it("should return 400 for invalid thread id", async () => {
            const res = await request(app)
                .delete("/api/forum/invalid-id/vote")
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(400)
        })

        it("should return 404 for non-existent thread id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const res = await request(app)
                .delete(`/api/forum/${nonExistentId}/vote`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(404)
        })
    })

    describe("DELETE /api/forum/:id", () => {
        it("should delete a forum thread by id", async () => {
            const thread = await ForumThread.findOne().exec()
            const res = await request(app)
                .delete(`/api/forum/${thread._id}`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(200)
            expect(res.body.body).toBe("Thread deleted")
        })

        it("should return 401 if not authenticated", async () => {
            const thread = await ForumThread.findOne({}).exec()
            const res = await request(app).delete(`/api/forum/${thread._id}`)
            expect(res.status).toBe(401)
        })

        it("should return 404 if not authorized", async () => {
            const thread = await ForumThread.findOne().exec()
            const res = await request(app)
                .delete(`/api/forum/${thread._id}`)
                .set("Authorization", `Bearer ${authTokenUser2}`)
            expect(res.status).toBe(404)
        })

        it("should return 400 for invalid thread id", async () => {
            const res = await request(app)
                .delete("/api/forum/invalid-id")
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(400)
        })

        it("should return 404 for non-existent thread id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const res = await request(app)
                .delete(`/api/forum/${nonExistentId}`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(404)
        })
    })

    describe("POST /api/forum/:id/comments", () => {
        it("should post a comment on a thread", async () => {
            const thread = await ForumThread.findOne().exec()
            const newComment = { body: "This is a comment" }
            const res = await request(app)
                .post(`/api/forum/${thread._id}/comments`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send(newComment)
            expect(res.status).toBe(201)
            expect(res.body.body.thread.answers).toContainEqual(
                expect.objectContaining({ body: newComment.body }),
            )
        })

        it("should return 401 if not authenticated", async () => {
            const thread = await ForumThread.findOne().exec()
            const res = await request(app)
                .post(`/api/forum/${thread._id}/comments`)
                .send({ body: "Unauthorized comment" })
            expect(res.status).toBe(401)
        })

        it("should return 400 if body is missing", async () => {
            const thread = await ForumThread.findOne().exec()
            const res = await request(app)
                .post(`/api/forum/${thread._id}/comments`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({})
            expect(res.status).toBe(400)
        })

        it("should return 400 for invalid thread id", async () => {
            const res = await request(app)
                .post("/api/forum/invalid-id/comments")
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ body: "Invalid thread comment" })
            expect(res.status).toBe(400)
        })

        it("should return 404 for non-existent thread id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const res = await request(app)
                .post(`/api/forum/${nonExistentId}/comments`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ body: "Non-existent thread comment" })
            expect(res.status).toBe(404)
        })
    })

    describe("PATCH /api/forum/:id/comments/:comment", () => {
        it("should edit a comment from a thread", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const updatedComment = { body: "Updated comment body" }
            const res = await request(app)
                .patch(`/api/forum/${thread._id}/comments/${comment._id}`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send(updatedComment)
            expect(res.status).toBe(200)
            expect(res.body.body.thread.answers).toContainEqual(
                expect.objectContaining({ body: updatedComment.body }),
            )
        })

        it("should return 401 if not authenticated", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .patch(`/api/forum/${thread._id}/comments/${comment._id}`)
                .send({ body: "Unauthorized comment edit" })
            expect(res.status).toBe(401)
        })

        it("should return 400 for invalid thread id", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .patch(`/api/forum/invalid-id/comments/${comment._id}`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ body: "Invalid thread comment edit" })
            expect(res.status).toBe(400)
        })

        it("should return 404 for non-existent thread id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .patch(`/api/forum/${nonExistentId}/comments/${comment._id}`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ body: "Non-existent thread comment edit" })
            expect(res.status).toBe(404)
        })

        it("should return 404 for non-existent comment id", async () => {
            const thread = await ForumThread.findOne().exec()
            const nonExistentCommentId = "6123456789abcdef01234567"
            const res = await request(app)
                .patch(`/api/forum/${thread._id}/comments/${nonExistentCommentId}`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ body: "Non-existent comment edit" })
            expect(res.status).toBe(404)
        })

        it("should return 404 if user does not own the comment", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .patch(`/api/forum/${thread._id}/comments/${comment._id}`)
                .set("Authorization", `Bearer ${authTokenUser2}`)
                .send({ body: "Unauthorized comment edit" })
            expect(res.status).toBe(404)
        })
    })

    describe("POST /api/forum/:id/comments/:comment/vote", () => {
        it("should cast an upvote on a comment", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .post(`/api/forum/${thread._id}/comments/${comment._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ value: 1 })
            expect(res.status).toBe(200)
            expect(res.body.body.thread.answers[0].reactions.up).toContainEqual(expect.any(String))
        })

        it("should cast a downvote on a comment", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .post(`/api/forum/${thread._id}/comments/${comment._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser2}`)
                .send({ value: -1 })
            expect(res.status).toBe(200)
            expect(res.body.body.thread.answers[0].reactions.down).toContainEqual(
                expect.any(String),
            )
        })

        it("should return 400 for invalid vote value", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .post(`/api/forum/${thread._id}/comments/${comment._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ value: 2 })
            expect(res.status).toBe(400)
        })

        it("should return 401 if not authenticated", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .post(`/api/forum/${thread._id}/comments/${comment._id}/vote`)
                .send({ value: 1 })
            expect(res.status).toBe(401)
        })

        it("should return 400 for invalid thread id", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .post(`/api/forum/invalid-id/comments/${comment._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ value: 1 })
            expect(res.status).toBe(400)
        })

        it("should return 404 for non-existent thread id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .post(`/api/forum/${nonExistentId}/comments/${comment._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ value: 1 })
            expect(res.status).toBe(404)
        })

        it("should return 404 for non-existent comment id", async () => {
            const thread = await ForumThread.findOne().exec()
            const nonExistentCommentId = "6123456789abcdef01234567"
            const res = await request(app)
                .post(`/api/forum/${thread._id}/comments/${nonExistentCommentId}/vote`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ value: 1 })
            expect(res.status).toBe(404)
        })
    })

    describe("DELETE /api/forum/:id/comments/:comment/vote", () => {
        it("should remove an upvote from a comment", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            await request(app)
                .post(`/api/forum/${thread._id}/comments/${comment._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
                .send({ value: 1 })
            const res = await request(app)
                .delete(`/api/forum/${thread._id}/comments/${comment._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(200)
            expect(res.body.body.thread.answers[0].reactions.up).not.toContainEqual(
                expect.any(String),
            )
        })

        it("should remove a downvote from a comment", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            await request(app)
                .post(`/api/forum/${thread._id}/comments/${comment._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser2}`)
                .send({ value: -1 })
            const res = await request(app)
                .delete(`/api/forum/${thread._id}/comments/${comment._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser2}`)
            expect(res.status).toBe(200)
            expect(res.body.body.thread.answers[0].reactions.down).not.toContainEqual(
                expect.any(String),
            )
        })

        it("should return 401 if not authenticated", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app).delete(
                `/api/forum/${thread._id}/comments/${comment._id}/vote`,
            )
            expect(res.status).toBe(401)
        })

        it("should return 400 for invalid thread id", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .delete(`/api/forum/invalid-id/comments/${comment._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(400)
        })

        it("should return 404 for non-existent thread id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .delete(`/api/forum/${nonExistentId}/comments/${comment._id}/vote`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(404)
        })

        it("should return 404 for non-existent comment id", async () => {
            const thread = await ForumThread.findOne().exec()
            const nonExistentCommentId = "6123456789abcdef01234567"
            const res = await request(app)
                .delete(`/api/forum/${thread._id}/comments/${nonExistentCommentId}/vote`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(404)
        })
    })

    describe("PATCH /api/forum/:id/comments/:comment/mark", () => {
        it("should mark a comment as the correct answer", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .patch(`/api/forum/${thread._id}/comments/${comment._id}/mark`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(200)
            expect(res.body.body.thread.answers[0].isCorrectAnswer).toBe(true)
        })

        it("should return 401 if not authenticated", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app).patch(
                `/api/forum/${thread._id}/comments/${comment._id}/mark`,
            )
            expect(res.status).toBe(401)
        })

        it("should return 400 for invalid thread id", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .patch(`/api/forum/invalid-id/comments/${comment._id}/mark`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(400)
        })

        it("should return 404 for non-existent thread id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .patch(`/api/forum/${nonExistentId}/comments/${comment._id}/mark`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(404)
        })

        it("should return 404 for non-existent comment id", async () => {
            const thread = await ForumThread.findOne().exec()
            const nonExistentCommentId = "6123456789abcdef01234567"
            const res = await request(app)
                .patch(`/api/forum/${thread._id}/comments/${nonExistentCommentId}/mark`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(404)
        })

        it("should return 404 if user does not own the thread", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .patch(`/api/forum/${thread._id}/comments/${comment._id}/mark`)
                .set("Authorization", `Bearer ${authTokenUser2}`)
            expect(res.status).toBe(404)
        })
    })

    describe("DELETE /api/forum/:id/comments/:comment/mark", () => {
        it("should unmark a comment as the correct answer", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            await request(app)
                .patch(`/api/forum/${thread._id}/comments/${comment._id}/mark`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            const res = await request(app)
                .delete(`/api/forum/${thread._id}/comments/${comment._id}/mark`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(200)
            expect(res.body.body.thread.answers[0].isCorrectAnswer).toBe(false)
        })

        it("should return 401 if not authenticated", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app).delete(
                `/api/forum/${thread._id}/comments/${comment._id}/mark`,
            )
            expect(res.status).toBe(401)
        })

        it("should return 400 for invalid thread id", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .delete(`/api/forum/invalid-id/comments/${comment._id}/mark`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(400)
        })

        it("should return 404 for non-existent thread id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .delete(`/api/forum/${nonExistentId}/comments/${comment._id}/mark`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(404)
        })

        it("should return 404 for non-existent comment id", async () => {
            const thread = await ForumThread.findOne().exec()
            const nonExistentCommentId = "6123456789abcdef01234567"
            const res = await request(app)
                .delete(`/api/forum/${thread._id}/comments/${nonExistentCommentId}/mark`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(404)
        })

        it("should return 404 if user does not own the thread", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .delete(`/api/forum/${thread._id}/comments/${comment._id}/mark`)
                .set("Authorization", `Bearer ${authTokenUser2}`)
            expect(res.status).toBe(404)
        })
    })

    describe("DELETE /api/forum/:id/comments/:comment", () => {
        it("should delete a comment from a thread", async () => {
            const thread = await ForumThread.findOne().exec()
            const comment = thread.answers[0]
            const res = await request(app)
                .delete(`/api/forum/${thread._id}/comments/${comment._id}`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(200)
            expect(res.body.body).toBe("Comment deleted")
        })

        it("should return 401 if not authenticated", async () => {
            const thread = await ForumThread.findOne().exec()
            const res = await request(app).delete(`/api/forum/${thread._id}/comments/id`)
            expect(res.status).toBe(401)
        })

        it("should return 400 for invalid thread id", async () => {
            const res = await request(app)
                .delete(`/api/forum/invalid-id/comments/invalid-comment`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(400)
        })

        it("should return 404 for non-existent thread id", async () => {
            const nonExistentId = "6123456789abcdef01234567"
            const res = await request(app)
                .delete(`/api/forum/${nonExistentId}/comments/${nonExistentId}`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(404)
        })

        it("should return 404 for non-existent comment id", async () => {
            const thread = await ForumThread.findOne().exec()
            const nonExistentCommentId = "6123456789abcdef01234567"
            const res = await request(app)
                .delete(`/api/forum/${thread._id}/comments/${nonExistentCommentId}`)
                .set("Authorization", `Bearer ${authTokenUser1}`)
            expect(res.status).toBe(404)
        })
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})
