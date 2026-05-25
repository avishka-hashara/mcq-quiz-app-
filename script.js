const questions = window.quizQuestions ?? [];

const appShell = document.querySelector('.app-shell');
const heroPanel = document.querySelector('.hero-panel');
const quizCard = document.getElementById('quizCard');
const modeCard = document.getElementById('modeCard');
const resultCard = document.getElementById('resultCard');
const quizTopbar = document.getElementById('quizTopbar');
const quizToolbar = document.getElementById('quizToolbar');
const quizForm = document.getElementById('quizForm');
const questionCount = document.getElementById('questionCount');
const progressLabel = document.getElementById('progressLabel');
const progressFill = document.getElementById('progressFill');
const sourceNumber = document.getElementById('sourceNumber');
const questionIndex = document.getElementById('questionIndex');
const questionText = document.getElementById('questionText');
const errorMessage = document.getElementById('errorMessage');
const feedbackBox = document.getElementById('feedbackBox');
const feedbackLabel = document.getElementById('feedbackLabel');
const feedbackAnswer = document.getElementById('feedbackAnswer');
const resultTitle = document.getElementById('resultTitle');
const resultSummary = document.getElementById('resultSummary');
const restartButton = document.getElementById('restartButton');
const quizRestartButton = document.getElementById('quizRestartButton');
const submitButton = document.getElementById('submitButton');
const modeScoreLaterButton = document.getElementById('modeScoreLater');
const modeRevealEachButton = document.getElementById('modeRevealEach');

let currentQuestionIndex = 0;
const answers = [];
let selectedMode = null;
let awaitingNextQuestion = false;

if (questionCount) {
  questionCount.textContent = String(questions.length);
}

function getCorrectAnswerText(question) {
  return question.options[question.correctIndex];
}

function resetQuizState() {
  currentQuestionIndex = 0;
  answers.length = 0;
  awaitingNextQuestion = false;
  errorMessage.hidden = true;
  feedbackBox.hidden = true;
  feedbackLabel.textContent = '';
  feedbackAnswer.textContent = '';
}

function showQuizShell() {
  heroPanel.hidden = true;
  appShell.classList.add('quiz-active');
  modeCard.hidden = true;
  quizTopbar.hidden = false;
  quizToolbar.hidden = false;
  quizCard.hidden = false;
  resultCard.hidden = true;
}

function returnToHome() {
  selectedMode = null;
  resetQuizState();
  resultCard.hidden = true;
  quizCard.hidden = true;
  quizTopbar.hidden = true;
  quizToolbar.hidden = true;
  heroPanel.hidden = false;
  appShell.classList.remove('quiz-active');
  modeCard.hidden = false;
}

function renderQuestion() {
  const question = questions[currentQuestionIndex];

  if (!question) {
    showResult();
    return;
  }

  errorMessage.hidden = true;
  feedbackBox.hidden = true;
  questionIndex.textContent = String(currentQuestionIndex + 1);
  questionText.textContent = question.question;
  sourceNumber.textContent = `Q${question.number}`;
  progressLabel.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  progressFill.style.width = `${((currentQuestionIndex) / questions.length) * 100}%`;
  submitButton.textContent =
    selectedMode === 'revealEach'
      ? awaitingNextQuestion
        ? currentQuestionIndex === questions.length - 1
          ? 'Finish quiz'
          : 'Next question'
        : 'Submit answer'
      : currentQuestionIndex === questions.length - 1
        ? 'Finish quiz'
        : 'Submit answer';

  quizForm.innerHTML = question.options
    .map(
      (option, optionIndex) => `
        <div class="option">
          <input
            type="radio"
            name="answer"
            id="q${currentQuestionIndex}-option${optionIndex}"
            value="${optionIndex}"
          />
          <label for="q${currentQuestionIndex}-option${optionIndex}">${option}</label>
        </div>
      `
    )
    .join('');
}

function showResult() {
  const score = questions.reduce((total, question, index) => {
    return total + (answers[index] === question.correctIndex ? 1 : 0);
  }, 0);
  const percent = Math.round((score / questions.length) * 100);

  quizCard.hidden = true;
  resultCard.hidden = false;
  progressFill.style.width = '100%';
  progressLabel.textContent = 'Completed';
  sourceNumber.textContent = 'Done';
  resultTitle.textContent = `You scored ${score} out of ${questions.length}`;
  resultSummary.textContent =
    selectedMode === 'revealEach'
      ? `Final score: ${percent}%. The correct answer was shown after each submit.`
      : `Final score: ${percent}%. No correct answers were shown during the quiz.`;
}

quizForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (selectedMode === 'revealEach' && awaitingNextQuestion) {
    awaitingNextQuestion = false;
    currentQuestionIndex += 1;

    if (currentQuestionIndex >= questions.length) {
      showResult();
      return;
    }

    renderQuestion();
    return;
  }

  const selected = quizForm.querySelector('input[name="answer"]:checked');

  if (!selected) {
    errorMessage.hidden = false;
    return;
  }

  answers.push(Number(selected.value));

  if (selectedMode === 'revealEach') {
    const question = questions[currentQuestionIndex];
    const chosenIndex = Number(selected.value);
    const isCorrect = chosenIndex === question.correctIndex;
    feedbackBox.hidden = false;
    feedbackLabel.textContent = isCorrect ? 'Correct' : 'Correct answer';
    feedbackAnswer.textContent = isCorrect
      ? `You selected the correct answer: ${getCorrectAnswerText(question)}`
      : `Correct answer: ${getCorrectAnswerText(question)}.`;
    awaitingNextQuestion = true;
    quizForm.querySelectorAll('input').forEach((input) => {
      input.disabled = true;
    });
    submitButton.textContent = currentQuestionIndex === questions.length - 1 ? 'Finish quiz' : 'Next question';
    return;
  }

  currentQuestionIndex += 1;

  if (currentQuestionIndex >= questions.length) {
    showResult();
    return;
  }

  renderQuestion();
});

restartButton.addEventListener('click', () => {
  returnToHome();
});

quizRestartButton.addEventListener('click', () => {
  returnToHome();
});

modeScoreLaterButton.addEventListener('click', () => {
  selectedMode = 'scoreLater';
  resetQuizState();
  showQuizShell();
  renderQuestion();
});

modeRevealEachButton.addEventListener('click', () => {
  selectedMode = 'revealEach';
  resetQuizState();
  showQuizShell();
  renderQuestion();
});

modeCard.hidden = false;
quizCard.hidden = true;
resultCard.hidden = true;
quizTopbar.hidden = true;
quizToolbar.hidden = true;
heroPanel.hidden = false;
