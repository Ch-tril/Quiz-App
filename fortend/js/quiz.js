// Quiz Application - Main Logic

// =====================================================================
// CONSTANTS & CONFIGURATION
// =====================================================================
const QUESTION_TIME_LIMIT = 60; // seconds per question

// =====================================================================
// STATE VARIABLES
// =====================================================================
let currentQuestionIndex = 0;
let score = 0;
let timerInterval = null;
let timeRemaining = QUESTION_TIME_LIMIT;
let userAnswers = []; // Records user responses for review

// =====================================================================
// DOM ELEMENTS
// =====================================================================

// Screens
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');

// Buttons
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');

// Display Elements
const questionProgress = document.getElementById('question-progress');
const scoreDisplay = document.getElementById('score-display');
const timeLeftDisplay = document.getElementById('time-left');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const finalScoreDisplay = document.getElementById('final-score');
const resultsList = document.getElementById('results-list');

// =====================================================================
// EVENT LISTENERS
// =====================================================================
document.addEventListener('DOMContentLoaded', initializeEventListeners);

function initializeEventListeners() {
  startBtn.addEventListener('click', startQuiz);
  nextBtn.addEventListener('click', loadNextQuestion);
  restartBtn.addEventListener('click', resetQuiz);
}

// =====================================================================
// MAIN QUIZ FUNCTIONS
// =====================================================================

/**
 * Starts the quiz by hiding start screen and showing quiz screen
 */
function startQuiz() {
  startScreen.classList.add('hidden');
  quizScreen.classList.remove('hidden');
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  updateScoreDisplay();
  renderQuestion();
}

/**
 * Renders current question and its options
 */
function renderQuestion() {
  // Reset UI state
  nextBtn.classList.add('hidden');
  optionsContainer.innerHTML = '';

  const currentQ = quizData[currentQuestionIndex];
  
  // Update progress indicator
  questionProgress.textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;
  questionText.textContent = currentQ.question;

  // Render answer buttons
  currentQ.options.forEach((optionText, index) => {
    const btn = document.createElement('button');
    btn.classList.add('option-btn');
    btn.textContent = `${String.fromCharCode(65 + index)}. ${optionText}`;
    btn.addEventListener('click', () => handleOptionSelect(index));
    optionsContainer.appendChild(btn);
  });

  // Start timer for this question
  startTimer();
}

/**
 * Starts the countdown timer for the current question
 */
function startTimer() {
  clearInterval(timerInterval);
  timeRemaining = QUESTION_TIME_LIMIT;
  timeLeftDisplay.textContent = timeRemaining;

  timerInterval = setInterval(() => {
    timeRemaining--;
    timeLeftDisplay.textContent = timeRemaining;

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

/**
 * Handles user selecting an answer option
 * @param {number} selectedIndex - Index of selected option (0-3)
 */
function handleOptionSelect(selectedIndex) {
  clearInterval(timerInterval);
  const currentQ = quizData[currentQuestionIndex];
  const isCorrect = selectedIndex === currentQ.answerIndex;
  const optionButtons = optionsContainer.querySelectorAll('.option-btn');

  // Update Score
  if (isCorrect) {
    score++;
    updateScoreDisplay();
  }

  // Record Answer History
  userAnswers.push({
    question: currentQ.question,
    selectedOption: currentQ.options[selectedIndex],
    correctOption: currentQ.options[currentQ.answerIndex],
    status: isCorrect ? 'correct' : 'wrong'
  });

  // Visual feedback: green for correct, red for incorrect
  optionButtons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === currentQ.answerIndex) {
      btn.classList.add('correct');
    }
    if (index === selectedIndex && !isCorrect) {
      btn.classList.add('incorrect');
    }
  });

  // Show next button
  nextBtn.classList.remove('hidden');
}

/**
 * Handles when question timer runs out
 */
function handleTimeout() {
  const currentQ = quizData[currentQuestionIndex];
  const optionButtons = optionsContainer.querySelectorAll('.option-btn');

  // Penalty for timing out (-1 point)
  score--;
  updateScoreDisplay();

  // Record History
  userAnswers.push({
    question: currentQ.question,
    selectedOption: "Timed Out",
    correctOption: currentQ.options[currentQ.answerIndex],
    status: 'timeout'
  });

  // Reveal correct answer and disable options
  optionButtons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === currentQ.answerIndex) {
      btn.classList.add('correct');
    }
  });

  // Show next button
  nextBtn.classList.remove('hidden');
}

/**
 * Loads the next question or shows results if quiz is complete
 */
function loadNextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < quizData.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

/**
 * Updates the score display on the quiz screen
 */
function updateScoreDisplay() {
  scoreDisplay.textContent = `Score: ${score}`;
}

/**
 * Shows the results screen with final score and detailed breakdown
 */
function showResults() {
  quizScreen.classList.add('hidden');
  resultsScreen.classList.remove('hidden');
  finalScoreDisplay.textContent = score;

  // Build results list
  resultsList.innerHTML = '';
  userAnswers.forEach((ans, idx) => {
    const item = document.createElement('div');
    item.classList.add('result-item');
    
    // Add status-specific class
    if (ans.status === 'correct') {
      item.classList.add('was-correct');
    } else if (ans.status === 'wrong') {
      item.classList.add('was-wrong');
    } else {
      item.classList.add('was-timeout');
    }

    // Build result HTML
    item.innerHTML = `
      <div class="result-q">${idx + 1}. ${ans.question}</div>
      <div class="result-ans">
        <strong>Your Answer:</strong> ${ans.selectedOption} | 
        <strong>Correct:</strong> ${ans.correctOption}
      </div>
    `;
    
    resultsList.appendChild(item);
  });
}

/**
 * Resets the quiz to initial state and shows start screen
 */
function resetQuiz() {
  resultsScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  
  // Reset all state variables
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  timeRemaining = QUESTION_TIME_LIMIT;
  clearInterval(timerInterval);
}

// =====================================================================
// UTILITY FUNCTIONS
// =====================================================================

/**
 * Gets the current quiz data
 * @returns {Array} Array of question objects
 */
function getQuizData() {
  return quizData;
}

/**
 * Gets current score
 * @returns {number} Current score
 */
function getCurrentScore() {
  return score;
}

/**
 * Gets all user answers recorded
 * @returns {Array} Array of answer objects
 */
function getUserAnswers() {
  return userAnswers;
}
