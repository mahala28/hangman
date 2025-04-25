document.addEventListener('DOMContentLoaded', () => {
    const wordDisplay = document.getElementById('word-display');
    const guessedLetters = document.getElementById('guessed-letters');
    const letterInput = document.getElementById('letter-input');
    const guessBtn = document.getElementById('guess-btn');
    const message = document.getElementById('message');
    const hangmanParts = document.querySelectorAll('.hangman-part');
    let timerInterval;

    // Add start game button
    const startGameBtn = document.createElement('button');
    startGameBtn.textContent = 'Start Game';
    startGameBtn.className = 'start-btn';
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
        gameState.timerEndTime = Date.now() + 120000;

        wordDisplay.textContent = '_ '.repeat(gameState.word.length).trim();
        guessedLetters.textContent = 'Guessed letters: ';
        message.textContent = 'Click Start Game to begin!';
        letterInput.value = '';
        letterInput.disabled = true;
        guessBtn.disabled = true;
        startGameBtn.style.display = 'block';

        // Reset hangman
        hangmanParts.forEach(part => part.classList.remove('visible'));

        startGameBtn.onclick = () => {
            startGameBtn.style.display = 'none';
            letterInput.disabled = false;
            guessBtn.disabled = false;
            message.textContent = `Remaining attempts: ${gameState.remainingAttempts}`;
            
            // Start timer
            const endTime = Date.now() + 120000;
            updateTimer(120000);
            timerInterval = setInterval(() => {
                const remaining = endTime - Date.now();
                if (remaining <= 0) {
                    endGame('lost', 'Time\'s up!');
                    return;
                }
                updateTimer(remaining);
            }, 1000);
        };
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

        wordDisplay.textContent = getWordProgress();
        guessedLetters.textContent = `Guessed letters: ${gameState.guessedLetters.join(', ')}`;
        message.textContent = `Remaining attempts: ${gameState.remainingAttempts}`;
        letterInput.value = '';

        if (isWordGuessed()) {
            endGame('won', 'Congratulations! You won!');
        } else if (gameState.remainingAttempts === 0) {
            endGame('lost', `Game Over! The word was: ${gameState.word}`);
        }
    }

    function getWordProgress() {
        return gameState.word
            .split('')
            .map(letter => gameState.guessedLetters.includes(letter) ? letter : '_')
            .join(' ');
    }

    function isWordGuessed() {
        return getWordProgress().replace(/\s/g, '') === gameState.word;
    }

    // Event Listeners
    guessBtn.addEventListener('click', makeGuess);
    letterInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') makeGuess();
    });

    // Start game on page load
    startNewGame();

    // Add timer display
    const timerDisplay = document.createElement('div');
    timerDisplay.className = 'timer';
    document.querySelector('.container').insertBefore(timerDisplay, wordDisplay);

    function updateTimer(timeRemaining) {
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        timerDisplay.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateHangmanDrawing(remainingAttempts) {
        const totalParts = 10;
        const partsToShow = totalParts - remainingAttempts;
        
        hangmanParts.forEach((part, index) => {
            if (index < partsToShow) {
                part.classList.add('visible');
            } else {
                part.classList.remove('visible');
            }
        });
    }

    function endGame(status, messageText) {
        clearInterval(timerInterval);
        letterInput.disabled = true;
        guessBtn.disabled = true;
        message.textContent = messageText;
        message.classList.add(status);
        
        if (status === 'won') {
            alert('Congratulations! You won! 🎉\nThe word was: ' + gameState.word);
        } else {
            alert('Game Over! 😔\nThe word was: ' + gameState.word);
        }
    }

    // Update new game button functionality
    const newGameBtn = document.getElementById('new-game-btn');
    newGameBtn.addEventListener('click', startNewGame);
});