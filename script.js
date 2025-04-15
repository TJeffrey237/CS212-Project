// Initialize variables
let questions = []; // Array to hold quiz questions
let currentQuestionIndex = 0; // Index of the current question
let score = 0; // User's score
let timer; // Timer interval reference
let timeLeft = 60; // Total time for the quiz in seconds

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
    // Check if all questions have been answered
    if (currentQuestionIndex >= questions.length) {
        endQuiz(); // End the quiz if no more questions
        return;
    }

    // Get the current question
    const question = questions[currentQuestionIndex];
    // Update the question text
    document.getElementById('question-text').textContent = question.text;

    // Clear and populate the options
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';

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
                optionsContainer.appendChild(optionElement);
            });
            break;
        case "checkbox":
            question.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.innerHTML = `
                    <input type="checkbox" name="option" id="option${index}" value="${option}">
                    <label for="option${index}">${option}</label>
                `;
                optionsContainer.appendChild(optionElement);
            });
            break;
        // code below is for a future question type
        /*
        case "number_input":
            const optionElement = document.createElement('div');
            optionElement.innerHTML = `
                <input type="text" name="option" id="option1" placeholder="Enter numbers here">
            `;
            optionsContainer.appendChild(optionElement);
            break;
        */
        default:
            console.log("Issue: Undefined question type.");
    }
}

/**
 * Handles the user's answer and provides feedback.
 */
function handleNextQuestion() {
    // Get the selected option
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (!selectedOption) {
        alert('Please select an answer!'); // Alert if no option is selected
        return;
    }

    // Check if the selected answer is correct
    const answer = selectedOption.value;

    // check the answers
    if(checkAnswer(questions[currentQuestionIndex], answer)) {
        score++;
    }

    // Display feedback and move to the next question after 2 seconds
    // document.getElementById('quiz-container').appendChild(feedback);
    setTimeout(() => {
        // feedback.remove();
        currentQuestionIndex++;
        displayQuestion();
    }, 2000);
}

function checkAnswer(question, userAnswer) {
    switch(question.type) {
        case "true_false":
            return checkTrueFalse(userAnswer, question.correctAnswer);
        case "multiple_choice":
            return checkMultipleChoice(userAnswer, question.correctAnswer);
        case "checkboxes":
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
    // const feedback = document.createElement('div');
    // feedback.id = 'feedback';

    if (userAnswer === correctAnswer) {
        // feedback.textContent = 'Correct!';
        // feedback.style.color = 'green';
        return true;
    } else {
        // feedback.textContent = `Incorrect! The correct answer is: ${questions[currentQuestionIndex].correctAnswer}`;
        // feedback.style.color = 'red';
        return false;
    }
}

function checkCheckboxes(userAnswers, correctAnswers) {
    let userArr = userAnswers.sort()
    let correctArr = correctAnswers.sort()
    return JSON.stringify(userArr) === JSON.stringify(correctArr)
}

function checkNumberInput(userAnswer, correctAnswer) {
    return Number(userAnswer) === Number(correctAnswer);
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
document.getElementById('next-question').addEventListener('click', handleNextQuestion); // Handle next question
document.getElementById('restart-quiz').addEventListener('click', () => location.reload()); // Restart the quiz
