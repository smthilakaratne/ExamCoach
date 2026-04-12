const request = require("supertest")
const mongoose = require("mongoose")

//const db = require("./db")
const app = require("../src/app")

describe('Exam Flow Integration Test', () => {

    beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
})

    afterAll(async () => {
        await mongoose.connection.close()
    })

    describe('START EXAM', () => {

        it('should start an exam and return questions', async () => {
            const res = await request(app)
                .post('/api/mock-exams/start')
                .send({ level: 'Easy', subject: 'Maths' })
                .expect(200)

            expect(res.body).toHaveProperty("questions")
            expect(Array.isArray(res.body.questions)).toBe(true)
            expect(res.body.questions.length).toBeGreaterThan(0)
        })

        it('should return 400 if level or subject is missing', async () => {
            const res = await request(app)
                .post('/api/mock-exams/start')
                .send({ level: 'Easy' }) // missing subject
                .expect(400)

            expect(res.body.message).toBeDefined()
        })

        it('should return 404 if no questions found', async () => {
            const res = await request(app)
                .post('/api/mock-exams/start')
                .send({ level: 'nonexistent', subject: 'Maths' })
                .expect(404)

            expect(res.body.message).toMatch(/No questions/i)
        })
    })

    describe('SUBMIT EXAM', () => {

        it('should submit an exam and return score', async () => {

            // 1. Start exam first
            const startRes = await request(app)
                .post('/api/mock-exams/start')
                .send({ level: 'Easy', subject: 'Maths' })
                .expect(200)

            const questions = startRes.body.questions

            // 2. Build answers object (IMPORTANT FIX)
            const answers = {}
            questions.forEach(q => {
                answers[q._id] = 1 // mock answer
            })

            // 3. Submit exam
            const res = await request(app)
                .post('/api/mock-exams/submit')
                .send({
                    userId: new mongoose.Types.ObjectId().toString(), // valid ObjectId
                    level: 'Easy',
                    subject: 'Maths',
                    answers
                })
                .expect(200)

            expect(res.body.success).toBe(true)
            expect(res.body).toHaveProperty("score")
            expect(typeof res.body.score).toBe("number")
        })

        it('should return 400 for invalid userId', async () => {
            const res = await request(app)
                .post('/api/mock-exams/submit')
                .send({
                    userId: 'invalid-id',
                    level: 'Easy',
                    subject: 'Maths',
                    answers: {}
                })
                .expect(400)

            expect(res.body.message).toMatch(/Invalid userId/i)
        })

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/mock-exams/submit')
                .send({
                    level: 'Easy',
                    subject: 'Maths'
                })
                .expect(400)

            expect(res.body.message).toMatch(/Missing required fields/i)
        })
    })
})
