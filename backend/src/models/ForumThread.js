const mongoose = require("mongoose")

/**
 * A forum thread
 * @typedef {object} ForumThread
 * @property {string} title.required - The title
 * @property {string} body.required - Body content
 * @property {[]string} tags - List of strings
 */

/**
 * A forum thread answer/comment
 * @typedef {object} ForumThreadAnswer
 * @property {string} body.required - Body content
 */

const answerSchema = new mongoose.Schema(
    {
        body: {
            type: String,
            required: [true, "body is required"],
        },
        isCorrectAnswer: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            name: {
                type: String,
                required: [true, "creator name is required"],
                trim: true,
            },
        },
        reactions: {
            up: { type: Number, default: 0 },
            down: { type: Number, default: 0 },
        },
    },
    { timestamps: true },
)

const forumThreadSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "title is required"],
            trim: true,
        },
        body: {
            type: String,
            required: [true, "body is required"],
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        createdBy: {
            name: {
                type: String,
                required: [true, "creator name is required"],
                trim: true,
            },
        },
        reactions: {
            up: { type: Number, default: 0 },
            down: { type: Number, default: 0 },
        },
        views: {
            type: Number,
            default: 0,
        },
        answers: {
            type: [answerSchema],
            default: [],
        },
    },
    { timestamps: true },
)

module.exports = mongoose.model("ForumThread", forumThreadSchema)
