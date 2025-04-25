const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 8080;
const GAME_TIME_LIMIT = 120000; // Move this to the top

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Update these lines
app.use(express.static(path.join(__dirname)));

// Update the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Word list - moved to top level
const words = [
    'JAVASCRIPT',
    'HANGMAN',
    'PROGRAMMING',
    'EXPRESS',
    'NODEJS',
    'COMPUTER',
    'DEVELOPER',
    'ALGORITHM',
    'DATABASE',
    'FRONTEND'
];

// Game state
// Update the game state initialization
let gameState = {
    word: '',
    guessedLetters: [],
    remainingAttempts: 10,  // Changed to 10 attempts
    status: 'playing',
    timerEndTime: null
};

// Update the start-game route
app.post('/api/start-game', (req, res) => {
    gameState.word = words[Math.floor(Math.random() * words.length)];
    gameState.guessedLetters = [];
    gameState.remainingAttempts = 10;  // Changed from 6 to 10
    gameState.status = 'playing';
    gameState.timerEndTime = Date.now() + GAME_TIME_LIMIT;
    
    res.json({
        wordLength: gameState.word.length,
        remainingAttempts: gameState.remainingAttempts,
        status: gameState.status,
        timeRemaining: GAME_TIME_LIMIT
    });
});

// Make a guess
// Update the guess-letter route with better error handling
app.post('/api/guess-letter', (req, res) => {
    try {
        const { letter } = req.body;
        const upperLetter = letter.toUpperCase();

        // Return current state if letter was already guessed
        if (gameState.guessedLetters.includes(upperLetter)) {
            return res.json({
                wordProgress: getWordProgress(),
                remainingAttempts: gameState.remainingAttempts,
                guessedLetters: gameState.guessedLetters,
                status: gameState.status,
                word: gameState.word
            });
        }

        gameState.guessedLetters.push(upperLetter);

        // Decrease attempts only for wrong guesses
        if (!gameState.word.includes(upperLetter)) {
            gameState.remainingAttempts--;
        }

        // Check if word is completely guessed
        const currentProgress = getWordProgress().replace(/\s/g, '');
        if (currentProgress === gameState.word) {
            gameState.status = 'won';
        } else if (gameState.remainingAttempts === 0) {
            gameState.status = 'lost';
        }

        res.json({
            wordProgress: getWordProgress(),
            remainingAttempts: gameState.remainingAttempts,
            guessedLetters: gameState.guessedLetters,
            status: gameState.status,
            word: gameState.word
        });
    } catch (error) {
        console.error('Error in guess-letter:', error);
        res.status(500).json({ error: 'Server error while processing guess' });
    }
});

function isWordGuessed() {
    return getWordProgress().replace(/\s/g, '') === gameState.word;
}

function getWordProgress() {
    return gameState.word
        .split('')
        .map(letter => gameState.guessedLetters.includes(letter) ? letter : '_')
        .join(' ');
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});