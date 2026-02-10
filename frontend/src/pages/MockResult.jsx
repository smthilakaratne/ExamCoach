import { submitExam } from "../services/mockExamApi";

//this page display result after submiting the mock exam, it will show the score to the user
function submit(answers, level) {
  submitExam({ level, answers }).then(res => {
    alert(`Score: ${res.data.score}%`);
  });
}
