const mongoose = require("mongoose")

/**
 * @typedef {object} Reply
 * @property {string} author - Author user ID (ref: User)
 * @property {string} content.required - Reply text
 * @property {boolean} isEdited - Whether the reply was edited
 */
const replySchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: [true, "Reply content is required"],
            trim: true,
            minlength: [2, "Reply must be at least 2 characters"],
            maxlength: [1000, "Reply cannot exceed 1000 characters"],
        },
        isEdited: { type: Boolean, default: false },
    },
    { timestamps: true }
)

/**
 * @typedef {object} Reaction
 * @property {string} user - User ID
 * @property {string} type - Reaction type - enum:like,helpful,agree,disagree
 */
const reactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["like", "helpful", "agree", "disagree"],
        required: true,
    },
})

/**
 * @typedef {object} Feedback
 * @property {string} author.required - Author user ID (ref: User)
 * @property {string} title.required - Feedback title
 * @property {string} content.required - Feedback content
 * @property {string} category - Category - enum:general,course,platform,suggestion,bug,other
 * @property {string} status - Status - enum:pending,reviewed,resolved,rejected
 * @property {boolean} isPublic - Visible to all students
 * @property {array<Reply>} replies - Replies array
 * @property {array<Reaction>} reactions - Reactions array
 * @property {string} adminNote - Admin-only internal note
 * @property {boolean} isEdited - Whether feedback was edited after posting
 */
const feedbackSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: [true, "Feedback title is required"],
            trim: true,
            minlength: [5, "Title must be at least 5 characters"],
            maxlength: [150, "Title cannot exceed 150 characters"],
        },
        content: {
            type: String,
            required: [true, "Feedback content is required"],
            trim: true,
            minlength: [10, "Content must be at least 10 characters"],
            maxlength: [2000, "Content cannot exceed 2000 characters"],
        },
        category: {
            type: String,
            enum: ["general", "course", "platform", "suggestion", "bug", "other"],
            default: "general",
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "resolved", "rejected"],
            default: "pending",
        },
        isPublic: { type: Boolean, default: true },
        replies: [replySchema],
        reactions: [reactionSchema],
        adminNote: {
            type: String,
            maxlength: [500, "Admin note cannot exceed 500 characters"],
            default: "",
        },
        isEdited: { type: Boolean, default: false },
    },
    { timestamps: true }
)

// Virtual: summarise reactions by type
feedbackSchema.virtual("reactionSummary").get(function () {
    const summary = {}
    this.reactions.forEach((r) => {
        summary[r.type] = (summary[r.type] || 0) + 1
    })
    return summary
})

feedbackSchema.set("toJSON", { virtuals: true })
feedbackSchema.set("toObject", { virtuals: true })

feedbackSchema.index({ author: 1, createdAt: -1 })
feedbackSchema.index({ status: 1 })
feedbackSchema.index({ category: 1 })

module.exports = mongoose.model("Feedback", feedbackSchema)