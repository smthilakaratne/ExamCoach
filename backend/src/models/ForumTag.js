const mongoose = require("mongoose")

/**
 * A forum tag
 * @typedef {object} ForumTag
 * @property {string} name.required - The tag
 * @property {string} description.required - Tag description
 */

const forumTagSchema = new mongoose.Schema({
    name: {
        type: String,
        min: [3, "name must be at least 3 characters"],
        max: [25, "name cannot exceed 25 characters"],
        required: [true, "name is required"],
    },
    description: {
        type: String,
        min: [10, "description must be at least 10 characters"],
        max: [2048, "description cannot exceed 2048 characters"],
        required: [true, "description is required"],
    },
})

module.exports = mongoose.model("ForumTag", forumTagSchema)
