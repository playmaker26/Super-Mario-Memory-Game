// Start of Global variables
const cards = document.querySelectorAll('.memory-card');
let lockBoard = true;  // Initially prevent flipping
let hasFlippedCard = false;
let firstCard, secondCard;
let clickCounter = 0;
let modal = document.querySelector('#my_dialog');
let difficultyChoice = document.querySelector('#difficulty');
let instructionBtn = document.querySelector('.instruction-btn');
let lockDifficulty = false;
let resetBtn = document.querySelector('.reset');
let saveBtn = document.querySelector('.save');
let difficulty = 'none';
let counter = document.querySelector('.counter-value');
let matchedCards = 0;
const totalPairs = 6; // Adjust based on your game
let timerElement = document.querySelector('.timer-counter');
let timerInterval;
let startTime;
let isTimerRunning = false;
let remainingCards = [];
let lockCards = false;
let gameInProgress = false;
let soundOn = document.querySelector('.volume-on');
let soundOff = document.querySelector('.volume-off');
let mute = false;
// End of Global variables

document.addEventListener('DOMContentLoaded', () => {
    scoreBoard = document.querySelector('.score-board tbody');
    const historyPage = document.location.pathname.includes('history.html');

    function formatDate() {
        const date = new Date();
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }

    function addScoreRow(date, time, turns, difficulty) {
        if (!scoreBoard) {
            
            return;
        }
        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td>${date}</td>
            <td>${time}</td>
            <td>${turns}</td>
            <td>${difficulty}</td>
            <td><button class='delete-btn'>Delete</button></td>
        `;
        newRow.querySelector('.delete-btn').addEventListener('click', () => {
            newRow.remove();
        });

        scoreBoard.appendChild(newRow);
    }

    

    function saveGame() {
        if (gameInProgress) {
            alert('Game in progress! Cannot save the current game until the game is over.');
            return;
        }

        const datePlayed = formatDate();
        const elapsedTime = timerElement.textContent;
        const counterValue = clickCounter;
        const selectedDifficulty = difficultyChoice.value;

        // Add the saved game to the history table
        addScoreRow(datePlayed, elapsedTime, counterValue, selectedDifficulty);
        
        // Save to localStorage
        let savedGames = JSON.parse(localStorage.getItem('savedGames')) || [];
        savedGames.push({ date: datePlayed, time: elapsedTime, turns: counterValue, difficulty: selectedDifficulty });
        localStorage.setItem('savedGames', JSON.stringify(savedGames));
    }

    saveBtn.addEventListener('click', saveGame);
    function sounds() {
        if (!document.querySelector('.memory-card')) {
            difficultyChoice.disabled = true;
            return;
        }

        const gameSounds = {
            backgroundMusic: new Audio('sounds/main-song.mp3'),
            winningBackgroundMusic: new Audio('sounds/winning-game.mp3'),
            wrongMatch: new Audio('sounds/wrong-match.mp3'),
            marioMatch: new Audio('sounds/mario.mp3'),
            yoshiMatch: new Audio('sounds/yoshi.mp3'),
            luigiMatch: new Audio('sounds/luigi.mp3'),
            booMatch: new Audio('sounds/boo.mp3'),
            bowserMatch: new Audio('sounds/bowser.mp3'),
            koopaMatch: new Audio('sounds/koopa.mp3')
        };

        gameSounds.backgroundMusic.loop = true;
        gameSounds.winningBackgroundMusic.loop = true;

        function playBackgroundMusic() {
            gameSounds.backgroundMusic.play();
        }

        function stopBackgroundMusic() {
            gameSounds.backgroundMusic.pause();
            gameSounds.backgroundMusic.currentTime = 0;
        }

        function playWinningBackgroundMusic() {
            gameSounds.winningBackgroundMusic.play();
        }

        function stopWinningBackgroundMusic() {
            gameSounds.winningBackgroundMusic.pause();
            gameSounds.winningBackgroundMusic.currentTime = 0;
        }

        function playWrongMatchSound() {
            gameSounds.wrongMatch.play();
        }

        function playCharacterMatchSound(character) {
            switch (character) {
                case 'mario':
                    gameSounds.marioMatch.play();
                    break;

                case 'yoshi':
                    gameSounds.yoshiMatch.play();
                    break;

                case 'luigi':
                    gameSounds.luigiMatch.play();
                    break;

                case 'boo':
                    gameSounds.booMatch.play();
                    break;

                case 'bowser':
                    gameSounds.bowserMatch.play();
                    break;

                case 'koopa':
                    gameSounds.koopaMatch.play();
                    break;
            }
        }

        return {
            playBackgroundMusic,
            stopBackgroundMusic,
            playWinningBackgroundMusic,
            stopWinningBackgroundMusic,
            playWrongMatchSound,
            playCharacterMatchSound
        };
    }

    const soundControls = sounds();

    function showModal(content) {
        modal.innerHTML = `
            <div class='content'>
                ${content}
                <div class='buttons'>
                    <button class='ok'>OK</button>
                </div>
            </div>`;
        modal.classList.add('active');

        const okBtn = document.querySelector('.ok');
        okBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    function showModalWithButtons(content, confirmHandler) {
        modal.innerHTML = `
            <div class='content'>
                ${content}
                <div class='buttons'>
                    <button class='confirm'>Confirm</button>
                    <button class='cancel'>Cancel</button>
                </div>
            </div>`;
        modal.classList.add('active');

        const confirmBtn = document.querySelector('.confirm');
        const cancelBtn = document.querySelector('.cancel');

        confirmBtn.addEventListener('click', () => {
            confirmHandler();
            modal.classList.remove('active');
        });

        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    saveBtn.addEventListener('click', () => {
        showModal("<p>Your game has been saved successfully! You can see your best time by clicking the History button.</p>");
    });

    resetBtn.addEventListener('click', () => {
        if (lockBoard) {
            alert('No game is being played.');
            return;
        }
        showModalWithButtons("<p>Are you sure you want to reset the game? All progress will be lost.</p>", resetGame);
    });

    instructionBtn.addEventListener('click', () => {
        showModal(`
            <header class='header-instruction'>
                <h2>How to Play</h2>
            </header>
            <nav class='instruction-nav'>
                <ol class='order-list-instruction'>
                    <li>Select a difficulty mode: Easy or Hard.</li>
                    <li>Click on the cards to flip them and reveal their hidden images.</li>
                    <li>Match pairs of cards with the same image to remove them from the board.</li>
                    <li>In Easy mode, the cards will only shuffle once at the start of the game.</li>
                    <li>In Hard mode, the cards will reshuffle every time you make an incorrect match.</li>
                    <li>Try to match all the pairs with the fewest number of turns and in the shortest time possible.</li>
                    <li>Click the "Save" button to save your progress and best time.</li>
                    <li>Check your best times by clicking the "History" button.</li>
                    <li>Use the "Reset" button to start a new game at any time.</li>
                </ol>
            </nav>
        `);
    });

    difficultyChoice.addEventListener('change', difficultyMode);

    function difficultyMode() {
        const selectedDifficulty = difficultyChoice.value;
        if (!cards || cards.length === 0) {
            alert('You are in the History page. Please click Super Mario Memory Game in order to go to the game board.');
            return;
        }
        if (selectedDifficulty === 'easy' || selectedDifficulty === 'hard') {
            lockBoard = false;
            lockDifficulty = true;
            modal.classList.remove('active');
            difficultyChoice.disabled = true;

            // Start playing background music
            if (!mute) {
                soundControls.playBackgroundMusic();
            }
            soundOn.classList.add('active');
            soundOn.addEventListener('click', toggleBackgroundMusic);
            soundOff.addEventListener('click', toggleBackgroundMusic);

            if (selectedDifficulty === 'easy') {
                easyModeShuffle();
            } else if (selectedDifficulty === 'hard') {
                hardModeShuffle();
            }
        } else {
            lockBoard = true;
            lockDifficulty = false;
            modal.classList.add('active');
        }
    }

    function toggleBackgroundMusic() {
        if (mute) {
            mute = false;
            soundOff.classList.remove('active');
            soundOn.classList.add('active');
            soundControls.playBackgroundMusic();
        } else {
            mute = true;
            soundOn.classList.remove('active');
            soundOff.classList.add('active');
            soundControls.stopBackgroundMusic();
        }
    }

    function disableCards() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);

        soundControls.playCharacterMatchSound(firstCard.dataset.character);

        matchedCards++;
        if (matchedCards === totalPairs) {
            soundControls.stopBackgroundMusic();
            soundControls.playWinningBackgroundMusic();
            stopTimer();
        }

        resetBoard();
    }

    function unflipCards() {
        lockBoard = true;

        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');

            soundControls.playWrongMatchSound();
            resetBoard();

            if (difficultyChoice.value === 'hard') {
                hardModeShuffle();
            }
        }, 1500); // Adjust this time as per your flip animation duration
    }

    function startTimer() {
        if (isTimerRunning) return;
        isTimerRunning = true;
        startTime = Date.now();

        timerInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const minutes = Math.floor(elapsedTime / 60000);
            const seconds = Math.floor((elapsedTime % 60000) / 1000);
            timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        isTimerRunning = false;
    }

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;

        clickCounter++;
        counter.textContent = clickCounter;

        if (!isTimerRunning) {
            startTimer();
        }

        this.classList.add('flip');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        hasFlippedCard = false;
        secondCard = this;
        checkForMatch();
    }

    function checkForMatch() {
        let isMatch = firstCard.dataset.character === secondCard.dataset.character;
        if (isMatch) {
            disableCards();
        } else {
            unflipCards();
        }
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    function resetGame() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timerElement.textContent = '0:00';

        matchedCards = 0;
        clickCounter = 0;
        counter.textContent = clickCounter;

        soundControls.stopBackgroundMusic();
        soundControls.stopWinningBackgroundMusic();

        difficulty = 'none';
        lockDifficulty = false;
        difficultyChoice.disabled = false;
        difficultyChoice.value = 'none';

        soundOn.classList.remove('active');
        soundOff.classList.remove('active');
        mute = false;

        cards.forEach(card => {
            card.classList.remove('flip', 'matched', 'hide');
            card.addEventListener('click', flipCard);
            card.style.order = '';
        });

        resetBoard();
        lockBoard = true;
    }

    function easyModeShuffle() {
        hideCards();
        setTimeout(() => {
            cards.forEach(card => {
                let randomPos = Math.floor(Math.random() * 12);
                card.style.order = randomPos;
            });
            showCards();
        }, 500);
    }

    function hardModeShuffle() {
        hideCards();

        setTimeout(() => {
            remainingCards = Array.from(cards).filter(card => !card.classList.contains('matched'));

            if (lockCards) {
                cards.forEach(card => {
                    if (card.classList.contains('matched')) {
                        card.style.order = getComputedStyle(card).order;
                    }
                });
            }

            remainingCards.forEach(card => {
                let randomPos = Math.floor(Math.random() * remainingCards.length);
                card.style.order = randomPos;
            });

            showCards();
        }, 500);
    }

    function hideCards() {
        cards.forEach(card => {
            card.classList.add('hide');
        });
    }

    function showCards() {
        cards.forEach(card => card.classList.remove('hide'));
    }

    cards.forEach(card => card.addEventListener('click', flipCard));
    resetBtn.addEventListener('click', resetGame);

    // Prevent running history-related code on non-history pages
    if (historyPage) {
        loadHistory();
    }

    function loadHistory() {
        // Load saved games from local storage and add to the score board
        const savedGames = JSON.parse(localStorage.getItem('savedGames')) || [];
        savedGames.forEach(game => addScoreRow(game.date, game.time, game.turns, game.difficulty));
    }

    cards.forEach(card => card.addEventListener('click', flipCard));
});
