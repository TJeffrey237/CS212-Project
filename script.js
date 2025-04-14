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
        questions = data.sort(() => Math.random() - 0.5);
        // Display the first question
        displayQuestion();
        // Start the quiz timer
        startTimer();
    });

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
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.innerHTML = `
            <input type="radio" name="option" id="option${index}" value="${option}">
            <label for="option${index}">${option}</label>
        `;
        optionsContainer.appendChild(optionElement);
    });
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
    const feedback = document.createElement('div');
    feedback.id = 'feedback';

    if (answer === questions[currentQuestionIndex].correctAnswer) {
        score++; // Increment score for correct answer
        feedback.textContent = 'Correct!';
        feedback.style.color = 'green';
    } else {
        feedback.textContent = `Incorrect! The correct answer is: ${questions[currentQuestionIndex].correctAnswer}`;
        feedback.style.color = 'red';
    }

    // Display feedback and move to the next question after 2 seconds
    document.getElementById('quiz-container').appendChild(feedback);
    setTimeout(() => {
        feedback.remove();
        currentQuestionIndex++;
        displayQuestion();
    }, 2000);
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
}

// Event listeners for buttons
document.getElementById('next-question').addEventListener('click', handleNextQuestion); // Handle next question
document.getElementById('restart-quiz').addEventListener('click', () => location.reload()); // Restart the quiz
