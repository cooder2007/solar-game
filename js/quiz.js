let quizOrder = [];
let quizIndex = 0;
let quizScore = 0;
let quizChosen = -1;
let quizPanel = null;
function shuffle(list)
{
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--)
  {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}
function openQuiz(panel)
{
  quizPanel = panel;
        if (quizChosen === q.answer)
        {
          quizScore++; playSound("correct");
        } 
        else
        {
          playSound("wrong");
        }
}
function restartQuiz()
{
  quizOrder = shuffle(quizQuestions);
  quizIndex = 0;
  quizScore = 0;
  quizChosen = -1;
  renderQuiz();
}
function renderQuiz()
{
  if (quizIndex >= quizOrder.length)
  {
    renderQuizEnd();
    return;
  }
  const q = quizOrder[quizIndex];
  const answered = quizChosen >= 0;
  const options = q.options.map(function (text, i)
  {
    let cls = "quiz-option";
    if (answered && i === q.answer) cls += " correct";
    else if (answered && i === quizChosen) cls += " wrong";
    return `<button class="${cls}" data-index="${i}" ${answered ? "disabled" : ""}>${text}</button>`;
  }
).join("");
  let after = "";
  if (answered)
  {
    const isLast = quizIndex === quizOrder.length - 1;
    const verdict = quizChosen === q.answer ? "✅ Correct!" : "❌ Not quite.";
    after = `
      <div class="game-feedback ${quizChosen === q.answer ? "good" : ""}">${verdict} ${q.explain}</div>
      <button id="quiz-next" class="game-btn">${isLast ? "See results" : "Next question"}</button>`;
  }
  quizPanel.innerHTML = `
    <h3>Quiz: question ${quizIndex + 1} of ${quizOrder.length}</h3>
    <p class="game-score">Score: ${quizScore}</p>
    <p>${q.question}</p>
    ${options}
    ${after}`;
  quizPanel.querySelectorAll(".quiz-option").forEach(function (button) {
    button.addEventListener("click", function ()
    {
      if (quizChosen >= 0) return;
      quizChosen = Number(button.dataset.index);
      if (quizChosen === q.answer) quizScore++;
      renderQuiz();
    }
  );
  }
);
  const next = document.getElementById("quiz-next");
  if (next)
    {
    next.addEventListener("click", function ()
    {
      quizIndex++;
      quizChosen = -1;
      renderQuiz();
    }
  );
  }
}
function renderQuizEnd()
{
  const total = quizOrder.length;
  const ratio = quizScore / total;
  const message = ratio >= 0.85 ? "Outstanding! You know your solar system."
                : ratio >= 0.5  ? "Nice work! Try again to beat your score."
                : "Good start. Explore the planets and try again!";
  quizPanel.innerHTML = `
    <h3>Quiz complete!</h3>
    <p class="game-score">You scored ${quizScore} / ${total}</p>
    <p>${message}</p>
    <button id="quiz-restart" class="game-btn">Play again</button>`;
  document.getElementById("quiz-restart").addEventListener("click", restartQuiz);
}