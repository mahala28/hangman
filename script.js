document.addEventListener('DOMContentLoaded', () => {
    const wordDisplay = document.getElementById('word-display');
    const guessedLetters = document.getElementById('guessed-letters');
    const letterInput = document.getElementById('letter-input');
    const guessBtn = document.getElementById('guess-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const message = document.getElementById('message');
    const hangmanParts = document.querySelectorAll('.hangman-part');
    let timerInterval;

    function updateHangmanDrawing(remainingAttempts) {
        const totalParts = 10; // Total number of hangman parts
        const partsToShow = totalParts - remainingAttempts;
        
        hangmanParts.forEach((part, index) => {
            if (index < partsToShow) {
                part.classList.add('visible');
            } else {
                part.classList.remove('visible');
            }
        });
    }

    // Add timer display element at the top with other constants
    const timerDisplay = document.createElement('div');
    timerDisplay.className = 'timer';
    document.querySelector('.container').insertBefore(timerDisplay, wordDisplay);

    function updateTimer(timeRemaining) {
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        timerDisplay.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            endGame('lost', 'Time\'s up!');
        }
    }

    function endGame(status, messageText) {
        clearInterval(timerInterval);
        letterInput.disabled = true;
        guessBtn.disabled = true;
        message.textContent = messageText;
        message.classList.add(status);
        if (status === 'lost') {
            wordDisplay.textContent = gameState.word;
            alert('Time\'s up! 😔\nThe word was: ' + gameState.word);
        }
    }

    // Update startNewGame function
    // Add start game button at the top
    const startGameBtn = document.createElement('button');
    startGameBtn.textContent = 'Start Game';
    startGameBtn.className = 'start-btn';
    startGameBtn.style.display = 'none';
    document.querySelector('.container').insertBefore(startGameBtn, wordDisplay);

    let gameState = {
        word: '',
        guessedLetters: [],
        remainingAttempts: 10,
        status: 'playing',
        timerEndTime: null
    };

    function startNewGame() {
        gameState.word = words[Math.floor(Math.random() * words.length)];
        gameState.guessedLetters = [];
        gameState.remainingAttempts = 10;
        gameState.status = 'playing';
        gameState.timerEndTime = Date.now() + 120000; // 2 minutes
        
        wordDisplay.textContent = '_ '.repeat(gameState.word.length).trim();
        guessedLetters.textContent = 'Guessed letters: ';
        message.textContent = `Remaining attempts: ${gameState.remainingAttempts}`;
        letterInput.value = '';
        letterInput.disabled = false;
        guessBtn.disabled = false;
        
        // Reset hangman drawing
        hangmanParts.forEach(part => part.classList.remove('visible'));
        
        // Start timer
        updateTimer(120000);
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            const remaining = gameState.timerEndTime - Date.now();
            if (remaining <= 0) {
                endGame('lost', 'Time\'s up!');
                return;
            }
            updateTimer(remaining);
        }, 1000);
    }

    function makeGuess() {
        const letter = letterInput.value.trim().toUpperCase();
        if (!letter || letter.length !== 1) {
            letterInput.classList.add('error-shake');
            setTimeout(() => letterInput.classList.remove('error-shake'), 500);
            return;
        }

        if (gameState.guessedLetters.includes(letter)) {
            letterInput.value = '';
            return;
        }

        gameState.guessedLetters.push(letter);

        if (!gameState.word.includes(letter)) {
            gameState.remainingAttempts--;
            updateHangmanDrawing(gameState.remainingAttempts);
        }

        const progress = getWordProgress();
        wordDisplay.textContent = progress;
        guessedLetters.textContent = `Guessed letters: ${gameState.guessedLetters.join(', ')}`;
        message.textContent = `Remaining attempts: ${gameState.remainingAttempts}`;
        letterInput.value = '';

        if (progress.replace(/\s/g, '') === gameState.word) {
            endGame('won', 'Congratulations! You won!');
        } else if (gameState.remainingAttempts === 0) {
            endGame('lost', `Game Over! The word was: ${gameState.word}`);
        }
    }

    // Event Listeners
    guessBtn.addEventListener('click', makeGuess);
    
    newGameBtn.addEventListener('click', startNewGame);
    
    letterInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') makeGuess();
    });

    letterInput.addEventListener('input', () => {
        letterInput.value = letterInput.value.replace(/[^A-Za-z]/g, '').slice(0, 1);
    });

    // Start game on page load
    startNewGame();
});