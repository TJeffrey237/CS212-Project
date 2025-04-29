// Initialize variables
let questions = []; // Array to hold quiz questions
let currentQuestionIndex = 0; // Index of the current question
let score = 0; // User's score
let timer; // Timer interval reference
let timeLeft = 60; // Total time for the quiz in seconds

// Initialize an array to store user answers
let userAnswers = [];

// Load questions from the JSON file
fetch('questions.json')
.then(response => response.json())
.then(data => {
    // Randomize the order of questions
    questions = shuffleQuestions(data);
    // Display the first question
    displayQuestion();
    // Start the quiz timer
    startTimer();
});

// Function to shuffle questions
function shuffleQuestions(questions) {
    // durstenfeld shuffle
    for(var i = questions.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = questions[i];
        questions[i] = questions[j];
        questions[j] = temp;
    }

    return questions;
}

/**
 * Displays the current question and its options.
 */
function displayQuestion() {
    // enabling button and hiding loading
    document.getElementById('next-question').disabled = false;
    document.getElementById('loading').style.display = 'none';
    // Check if all questions have been answered
    if (currentQuestionIndex >= questions.length) {
        endQuiz(); // End the quiz if no more questions
        return;
    }

    // Get the current question
    const question = questions[currentQuestionIndex];

    // Update the question text and number
    document.getElementById('question-text').textContent = question.text;
    document.querySelector('#question-box h2').textContent = `Question ${currentQuestionIndex + 1}:` 

    // Clear and populate the options
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';

    // populate question based on type
    switch(question.type) {
        case "true_false":
            const trueFalseOptions = document.createElement('div');
            trueFalseOptions.innerHTML = `
                <input type="radio" name="option" id="option0" value="True">
                <label for="option0">True</label>
                <input type="radio" name="option" id="option1" value="False">
                <label for="option1">False</label>
            `;
            optionsContainer.appendChild(trueFalseOptions);
            break;
        case "multiple_choice":
            question.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.innerHTML = `
                    <input type="radio" name="option" id="option${index}" value="${option}">
                    <label for="option${index}">${option}</label>
                `;
                console.log(index);
                optionsContainer.appendChild(optionElement);
            });
            break;
        case "checkbox":
            question.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.innerHTML = `
                    <input id="text-input-box" type="checkbox" name="option" id="option${index}" value="${option}">
                    <label for="option${index}">${option}</label>
                `;
                optionsContainer.appendChild(optionElement);
            });
            break;
        case "number_input":
            const optionElement = document.createElement('div');
            optionElement.innerHTML = `
                <input type="text" name="option" id="option1" placeholder="Enter numbers here">
            `;
            optionsContainer.appendChild(optionElement);
            break;
        default:
            console.log("Issue: Undefined question type.");
    }
}

/**
 * Handles the user's answer and provides feedback.
 */
function handleNextQuestion() {
    let currentQuestion = questions[currentQuestionIndex];

    // Get selected radio button
    const selectedRadio = document.querySelector('input[name="option"]:checked');
    // Get any checked checkbox
    const checkedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    // Get any non-empty text input
    const filledTextInput = document.querySelector('input[type="text"]:not([disabled])');

    // Check if text input has value
    const hasFilledTextInput = filledTextInput && filledTextInput.value.trim() !== '';

    // Check if all types are empty
    if (!selectedRadio && checkedCheckboxes.length === 0 && !hasFilledTextInput) {
        document.getElementById('loading').style.display = 'none';
        alert('Please answer at least one question!');
        return;
    }

    // Get answers based on type
    let answer;
    switch (currentQuestion.type) {
        case "true_false":
            answer = selectedRadio.value;
            break;
        case "multiple_choice":
            answer = selectedRadio.value;
            break;
        case "checkbox":
            answer = Array.from(checkedCheckboxes).map(checkbox => checkbox.value);
            break;
        case "number_input":
            answer = filledTextInput.value.trim();
            break;
        default:
            console.log("Error: undefined question type.");
            break;
    }

    // Store the user's answer
    userAnswers.push({ question: currentQuestion.text, userAnswer: answer, correctAnswer: currentQuestion.correctAnswer });

    // Check the answers & update score
    const isCorrect = checkAnswer(currentQuestion, answer);
    if (isCorrect) {
        score++;
    }

    // Change quiz box color based on correctness
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.style.backgroundColor = isCorrect ? 'green' : 'red';

    // Display feedback and move to the next question after 2 seconds
    setTimeout(() => {
        quizContainer.style.backgroundColor = ''; // Reset to default color
        currentQuestionIndex++;
        displayQuestion();
    }, 500);
}

// checks answers based on type
function checkAnswer(question, userAnswer) {
    switch(question.type) {
        case "true_false":
            return checkTrueFalse(userAnswer, question.correctAnswer);
        case "multiple_choice":
            return checkMultipleChoice(userAnswer, question.correctAnswer);
        case "checkbox":
            return checkCheckboxes(userAnswer, question.correctAnswer);
        case "number_input":
            return checkNumberInput(userAnswer, question.correctAnswer);
        default:
            return false;
    }
}

function checkTrueFalse(userAnswer, correctAnswer) {
    return userAnswer === correctAnswer;
}

function checkMultipleChoice(userAnswer, correctAnswer) {
    return userAnswer === correctAnswer;
}

function checkCheckboxes(userAnswers, correctAnswers) {
    let userArr = userAnswers.sort()
    let correctArr = correctAnswers.sort()
    return JSON.stringify(userArr) === JSON.stringify(correctArr)
}

function checkNumberInput(userAnswer, correctAnswer) {
    return Number(userAnswer) === Number(correctAnswer);
}


function checkNotEmpty() {

}
/**
 * Starts the quiz timer and updates the timer display.
 */
function startTimer() {
    timer = setInterval(() => {
        timeLeft--; // Decrement the time left
        document.getElementById('time').textContent = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timer); // Stop the timer when time runs out
            endQuiz(); // End the quiz
        }
    }, 1000); // Update every second
}

/**
 * Ends the quiz and displays the user's score.
 */
function endQuiz() {
    clearInterval(timer); // Stop the timer
    document.getElementById('quiz-container').style.display = 'none'; // Hide the quiz container
    document.getElementById('score-container').style.display = 'block'; // Show the score container
    document.getElementById('score').textContent = `${score} / ${questions.length}`; // Display the score

    highScore = getHighestScore(score);
    document.getElementById('highest-score').textContent = `${highScore} / ${questions.length}`;

    // Store user answers in localStorage for the answers page
    localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
}

// function to update the high score
function getHighestScore(newScore) {
    let storedScore = localStorage.getItem("highScore");

    if(!storedScore || newScore > parseInt(storedScore)) {
        localStorage.setItem("highScore", newScore)
    }

    let newHighScore = localStorage.getItem("highScore");
    return newHighScore;
}

// Event listeners for buttons
document.getElementById('next-question').addEventListener('click', function() {
    const button = this;
    button.disabled = true;
    document.getElementById('loading').style.display = 'inline';
    handleNextQuestion();
});
document.getElementById('restart-quiz').addEventListener('click', () => location.reload());
document.body.addEventListener("keydown", function(event) {
    if (event.target.matches('input[name="option"]') && event.key === "Enter") {
      event.preventDefault();
    }
  });

function toggleDarkMode() {
    var element = document.body;
    element.classList.toggle("dark-mode");
 }