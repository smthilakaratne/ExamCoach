
const { beforeAll, afterAll, describe, expect, it } = require("@jest/globals")
const request = require("supertest")

const app = require("../src/app")
const db = require("./db")
const User = require("../src/models/User")
const bcrypt = require("bcryptjs")
const ForumTag = require("../src/models/ForumTag")

let authTokenAdminUser = ""
let authTokenUser = ""

const tags = [
    { name: "tag1", description: "Tag 1 description" },
    { name: "tag2", description: "Tag 2 description" },
    { name: "tag3", description: "Tag 3 description" },
    { name: "tag4", description: "Tag 4 description" },
]

beforeAll(async () => {
    await db()

    await User.deleteMany({})
    await ForumTag.deleteMany({})

    // Create admin user
    const adminUser = await User.create({
        name: "admin",
        email: "admin@example.com",
        role: "admin",
        password: "adminpassword123",
        isEmailVerified: true,
    })

    const user = await User.create({
        name: "user",
        email: "user@example.com",
        password: "userpassword123",
        isEmailVerified: true,
    })

    for (let tag of tags) {
        const t = new ForumTag({
            name: tag.name,
            description: tag.description,
            createdBy: adminUser._id,
        })
        await t.save()
    }

    const loginResAdmin = await request(app)
        .post("/api/auth/login")
        .send({ email: "admin@example.com", password: "adminpassword123" })
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
    authTokenAdminUser = loginResAdmin.body.body.token

    // Login regular user
    const loginResUser = await request(app)
        .post("/api/auth/login")
        .send({ email: "user@example.com", password: "userpassword123" })
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
    authTokenUser = loginResUser.body.body.token
})

describe("Forum Thread Tags", () => {
    describe("GET /api/forum/tags", () => {
        it("should return all forum tags", async () => {
            const res = await request(app)
                .get("/api/forum/tags")
                .set("Authorization", `Bearer ${authTokenUser}`)
            expect(res.status).toBe(200)
            expect(res.body.body.tags.length).toBe(4)
            for (let i = 0; i < tags.length; i++) {
                expect(res.body.body.tags[i].name).toBe(tags[i].name)
                expect(res.body.body.tags[i].description).toBe(tags[i].description)
            }
        })
    })

    describe("POST /api/forum/tags", () => {
        it("should create a new forum tag", async () => {
            const newTag = { name: "tag5", description: "Tag 5 description" }
            const res = await request(app)
                .post("/api/forum/tags")
                .set("Authorization", `Bearer ${authTokenAdminUser}`)
                .send(newTag)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
            expect(res.status).toBe(201)
            expect(res.body.body.tag.name).toBe(newTag.name)
            expect(res.body.body.tag.description).toBe(newTag.description)

            // Verify tag is in database
            const tagInDb = await ForumTag.findOne({ name: newTag.name })
            expect(tagInDb).not.toBeNull()
            expect(tagInDb.description).toBe(newTag.description)
        })

        it("should not allow non-admin users to create tags", async () => {
            const newTag = { name: "tag6", description: "Tag 6 description" }
            const res = await request(app)
                .post("/api/forum/tags")
                .set("Authorization", `Bearer ${authTokenUser}`)
                .send(newTag)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
            expect(res.status).toBe(403)
        })

        it("should return 400 for invalid tag data", async () => {
            const invalidTag = { name: "t", description: "short" }
            const res = await request(app)
                .post("/api/forum/tags")
                .set("Authorization", `Bearer ${authTokenAdminUser}`)
                .send(invalidTag)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
            expect(res.status).toBe(400)
        })
    })

    describe("PUT /api/forum/tags/:name", () => {
        it("should edit an existing forum tag", async () => {
            const updatedTag = { name: "tag1", description: "Updated description" }
            const res = await request(app)
                .put("/api/forum/tags/tag1")
                .set("Authorization", `Bearer ${authTokenAdminUser}`)
                .send(updatedTag)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
            expect(res.status).toBe(200)
            expect(res.body.body.tag.name).toBe(updatedTag.name)
            expect(res.body.body.tag.description).toBe(updatedTag.description)

            // Verify tag is updated in database
            const tagInDb = await ForumTag.findOne({ name: updatedTag.name })
            expect(tagInDb).not.toBeNull()
            expect(tagInDb.description).toBe(updatedTag.description)
        })

        it("should return 404 for non-existent tag", async () => {
            const updatedTag = { name: "nonexistent", description: "Does not exist" }
            const res = await request(app)
                .put("/api/forum/tags/nonexistent")
                .set("Authorization", `Bearer ${authTokenAdminUser}`)
                .send(updatedTag)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
            expect(res.status).toBe(404)
        })

        it("should not allow non-admin users to edit tags", async () => {
            const updatedTag = { name: "tag1", description: "Updated description" }
            const res = await request(app)
                .put("/api/forum/tags/tag1")
                .set("Authorization", `Bearer ${authTokenUser}`)
                .send(updatedTag)
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
            expect(res.status).toBe(403)
        })
    })

    describe("DELETE /api/forum/tags/:name", () => {
        it("should delete an existing forum tag", async () => {
            const res = await request(app)
                .delete("/api/forum/tags/tag2")
                .set("Authorization", `Bearer ${authTokenAdminUser}`)
            expect(res.status).toBe(200)
            expect(res.body.body.tag.name).toBe("tag2")

            // Verify tag is deleted from database
            const tagInDb = await ForumTag.findOne({ name: "tag2" })
            expect(tagInDb).toBeNull()
        })

        it("should return 404 for non-existent tag", async () => {
            const res = await request(app)
                .delete("/api/forum/tags/nonexistent")
                .set("Authorization", `Bearer ${authTokenAdminUser}`)
            expect(res.status).toBe(404)
        })

        it("should not allow non-admin users to delete tags", async () => {
            const res = await request(app)
                .delete("/api/forum/tags/tag3")
                .set("Authorization", `Bearer ${authTokenUser}`)
            expect(res.status).toBe(403)
        })
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})

