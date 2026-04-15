const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const previewContainer = document.getElementById('previewContainer');
const startBtn = document.getElementById('startBtn');
const settingsPanel = document.getElementById('settingsPanel');
const gamePanel = document.getElementById('gamePanel');
const puzzleContainer = document.getElementById('puzzleContainer');
const referenceImage = document.getElementById('referenceImage');
const timerDisplay = document.getElementById('timerDisplay');
const restartBtn = document.getElementById('restartBtn');
const completionModal = document.getElementById('completionModal');
const cardImage = document.getElementById('cardImage');
const cardDifficulty = document.getElementById('cardDifficulty');
const cardTime = document.getElementById('cardTime');
const shareBtn = document.getElementById('shareBtn');
const playAgainBtn = document.getElementById('playAgainBtn');

let originalImage = null;
let gridSize = 3;
let pieces = [];
let selectedPieces = [];
let timer = 0;
let timerInterval = null;
let gameStarted = false;


imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            originalImage = event.target.result;
            previewImage.src = originalImage;
            previewContainer.classList.add('has-image');
            startBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
});


startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
playAgainBtn.addEventListener('click', resetGame);
shareBtn.addEventListener('click', shareResult);


function startGame() {
    if (!originalImage) return;
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    gridSize = parseInt(difficulty);
    settingsPanel.style.display = 'none';
    gamePanel.style.display = 'block';
    referenceImage.src = originalImage;
    createPuzzle();
    startTimer();
}


function createPuzzle() {
    puzzleContainer.innerHTML = '';
    pieces = [];
    const size = gridSize * 100 + (gridSize - 1) * 3;
    puzzleContainer.style.gridTemplateColumns = 'repeat(' + gridSize + ', 100px)';
    puzzleContainer.style.width = size + 'px';
    puzzleContainer.style.height = size + 'px';
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const index = row * gridSize + col;
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.dataset.index = index;
            piece.dataset.correctIndex = index;
            piece.dataset.row = row;
            piece.dataset.col = col;
            piece.style.backgroundImage = 'url(' + originalImage + ')';
            piece.style.backgroundSize = (gridSize * 100) + 'px ' + (gridSize * 100) + 'px';
            piece.style.backgroundPosition = (col * 100) + 'px ' + (row * 100) + 'px';
            piece.addEventListener('click', handlePieceClick);
            pieces.push(piece);
            puzzleContainer.appendChild(piece);
        }
    }
    shufflePuzzle();
}


function shufflePuzzle() {
    for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        swapPieces(i, j);
    }
}

function swapPieces(i, j) {
    if (i === j) return;
    
    const container = puzzleContainer;
    const temp = pieces[i];
    pieces[i] = pieces[j];
    pieces[j] = temp;
    
    const nodeI = container.children[i];
    const nodeJ = container.children[j];
    
    if (i < j) {
        container.insertBefore(nodeJ, nodeI);
        container.insertBefore(nodeI, container.children[Math.min(j + 1, container.children.length)]);
    } else {
        container.insertBefore(nodeI, nodeJ.nextSibling);
        container.insertBefore(nodeJ, container.children[i]);
    }
}




function handlePieceClick(e) {
    if (!gameStarted) return;
    const clickedPiece = e.target;
    const clickedIndex = Array.from(puzzleContainer.children).indexOf(clickedPiece);
    
    if (selectedPieces.length === 0) {
        selectedPieces.push(clickedIndex);
        clickedPiece.classList.add('selected');
    } else if (selectedPieces.length === 1) {
        if (selectedPieces[0] !== clickedIndex) {
            const firstIndex = selectedPieces[0];
            const firstPiece = puzzleContainer.children[firstIndex];
            
            firstPiece.classList.add('swapping');
            clickedPiece.classList.add('swapping');
            
            setTimeout(function() {
                swapPieces(firstIndex, clickedIndex);
                
                firstPiece.classList.remove('selected', 'swapping');
                clickedPiece.classList.remove('selected', 'swapping');
                selectedPieces = [];
                
                checkCompletion();
            }, 300);
        }
    }
}


function swapSelectedAndClicked(i, j) {
    const temp = pieces[i];
    pieces[i] = pieces[j];
    pieces[j] = temp;
    const container = puzzleContainer;
    container.insertBefore(pieces[i], container.children[i]);
    container.insertBefore(pieces[j], container.children[j]);
}

function checkCompletion() {
    const allCorrect = pieces.every(function(piece, index) {
        return parseInt(piece.dataset.correctIndex) === index;
    });
    if (allCorrect) {
        gameStarted = false;
        clearInterval(timerInterval);
        Array.from(puzzleContainer.children).forEach(function(piece) {
            piece.classList.add('correct');
        });
        setTimeout(showCompletionModal, 500);
    }
}


function startTimer() {
    timer = 0;
    gameStarted = true;
    updateTimerDisplay();
    timerInterval = setInterval(function() {
        timer++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    const secStr = seconds < 10 ? '0' + seconds : seconds;
    timerDisplay.textContent = minStr + ':' + secStr;
}

function stopTimer() {
    clearInterval(timerInterval);
}


function restartGame() {
    stopTimer();
    gameStarted = false;
    selectedPieces = [];
    puzzleContainer.innerHTML = '';
    createPuzzle();
    startTimer();
}

function resetGame() {
    stopTimer();
    gameStarted = false;
    selectedPieces = [];
    timer = 0;
    completionModal.style.display = 'none';
    gamePanel.style.display = 'none';
    settingsPanel.style.display = 'block';
    previewContainer.classList.remove('has-image');
    previewImage.src = '';
    startBtn.disabled = true;
    originalImage = null;
    imageInput.value = '';
}


function showCompletionModal() {
    cardImage.src = originalImage;
    if (gridSize === 3) {
        cardDifficulty.textContent = '3u00D73 (简单)';
    } else {
        cardDifficulty.textContent = '4u00D74 (困难)';
    }
    cardTime.textContent = timerDisplay.textContent;
    completionModal.style.display = 'flex';
}

function shareResult() {
    const difficultyText = gridSize === 3 ? '3u00D73 (简单)' : '4u00D74 (困难)';
    const message = '恭喜完成拼图！难度：' + difficultyText + '，完成时间：' + timerDisplay.textContent;
    alert('分享信息：\\n' + message);
}
