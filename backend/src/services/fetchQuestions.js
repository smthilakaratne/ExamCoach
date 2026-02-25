const axios = require("axios");

const fetchQuestionsFromAPI = async (level) => {
  const difficultyMap = {
    easy: "easy",
    intermediate: "medium",
    advanced: "hard",
  };

  const difficulty = difficultyMap[level];

  const response = await axios.get(
    `https://opentdb.com/api.php?amount=5&difficulty=${difficulty}&type=multiple`
  );

  return response.data.results;
};

module.exports = { fetchQuestionsFromAPI };