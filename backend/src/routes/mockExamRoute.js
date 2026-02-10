const express = require("express")
const router = express.Router()

router.post("/start", async (req, res) => {
  // fetch random questions from DB
})

router.post("/submit", async (req, res) => {
  // calculate score, update progress
})

router.get("/progress", async (req, res) => {
  // return user_level_progress
})

module.exports = router
