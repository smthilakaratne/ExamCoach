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
            min: [10, "body must be at least 10 characters"],
            required: [true, "body is required"],
        },
        isCorrectAnswer: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        reactions: {
            up: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
            ],
            down: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
            ],
        },
    },
    { timestamps: true },
)

const forumThreadSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            minlength: [5, "title must be at least 5 characters"],
            maxlength: [120, "title cannot exceed 120 characters"],
            required: [true, "title is required"],
            trim: true,
        },
        body: {
            type: String,
            minlength: [10, "body must be at least 10 characters"],
            required: [true, "body is required"],
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
            validate: {
                validator: (arr) => arr.length <= 5,
                message: "tags cannot be more than 5",
            },
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        reactions: {
            up: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
            ],
            down: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
            ],
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
