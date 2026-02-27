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
        required: [true, "name is required"],
    },
    description: {
        type: String,
        required: [true, "description is required"],
    },
})

module.exports = mongoose.model("ForumTag", forumTagSchema)
