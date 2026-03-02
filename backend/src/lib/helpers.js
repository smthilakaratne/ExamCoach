const { generateOTP, generateToken, hashToken } = require("../src/lib/tokenUtils")

// ── Unit Tests: Token/OTP helpers ─────────────────────────────────────────────
describe("tokenUtils – generateOTP", () => {
    test("returns a 6-character string", () => {
        const otp = generateOTP()
        expect(typeof otp).toBe("string")
        expect(otp).toHaveLength(6)
    })

    test("is numeric (100000–999999)", () => {
        const otp = generateOTP()
        expect(Number(otp)).toBeGreaterThanOrEqual(100000)
        expect(Number(otp)).toBeLessThanOrEqual(999999)
    })

    test("generates different OTPs each time (probabilistic)", () => {
        const otps = new Set(Array.from({ length: 20 }, generateOTP))
        expect(otps.size).toBeGreaterThan(1)
    })
})

describe("tokenUtils – generateToken", () => {
    test("returns a 64-char hex string (32 bytes)", () => {
        const token = generateToken()
        expect(token).toHaveLength(64)
        expect(/^[a-f0-9]+$/.test(token)).toBe(true)
    })

    test("generates unique tokens", () => {
        const t1 = generateToken()
        const t2 = generateToken()
        expect(t1).not.toBe(t2)
    })
})

describe("tokenUtils – hashToken", () => {
    test("produces consistent SHA-256 hash", () => {
        const token = "test-reset-token-123"
        expect(hashToken(token)).toBe(hashToken(token))
    })

    test("different inputs produce different hashes", () => {
        expect(hashToken("abc")).not.toBe(hashToken("xyz"))
    })

    test("returns a 64-char hex string", () => {
        const hash = hashToken("anything")
        expect(hash).toHaveLength(64)
    })
})

// ── Unit Tests: createResponse ────────────────────────────────────────────────
describe("createResponse", () => {
    const createResponse = require("../src/lib/createResponse")

    const mockRes = () => {
        const res = {}
        res.status = jest.fn().mockReturnValue(res)
        res.json = jest.fn().mockReturnValue(res)
        return res
    }

    test("sets success:true for 2xx status codes", () => {
        const res = mockRes()
        createResponse(res, 200, "OK")
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })

    test("sets success:false for 4xx status codes", () => {
        const res = mockRes()
        createResponse(res, 404, "Not found")
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }))
    })

    test("includes data when provided", () => {
        const res = mockRes()
        createResponse(res, 200, "OK", { user: { id: "123" } })
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ data: { user: { id: "123" } } })
        )
    })

    test("omits data key when not provided", () => {
        const res = mockRes()
        createResponse(res, 200, "OK")
        const call = res.json.mock.calls[0][0]
        expect(call).not.toHaveProperty("data")
    })
})