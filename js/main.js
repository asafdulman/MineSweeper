'use strict'

var FLAG = '🏳‍🌈';
var MINE = '💣';
var WINNER = '😎';
var PLAYER = '😃';
var LOSER = '🤬';
var HINT = '💡';
var gIsHint = false;
var elMood = document.querySelector('.mood-container');
var gBoard;
var size = 4;
var gTimer;
var gLives = 3;
var gElLivesModal = document.querySelector('.lives-modal');

var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    hintsCount: 3
}

var gLevel = {
    SIZE: 4,
    MINES: 2,
    OTHERCELLS: 14
}

gBoard = buildBoard(gBoard, gLevel.SIZE);

function init() {
    gBoard = buildBoard(gBoard, gLevel.SIZE);
    renderBoard(gBoard, '.table-container');
    elMood.innerHTML = PLAYER;
    gGame.isOn = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gGame.hintsCount = 3;
    gIsHint = false;
    gLives = 3;
    
    endTime()
    renderTime()
    renderHints()
    renderLives(gLives)
    renderSafeClick()

}

function buildBoard(board, size) {
    board = [];
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {

            board[i][j] = {
                location: {
                    i: i,
                    j: j
                },
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

function setMinesOnBoard(board, i, j) {
    var firstMine = {
        i: i,
        j: j
    }
    var minesCount = gLevel.MINES;
    while (minesCount > 0) {

        var mineLoc = {
            i: getRandomInt(0, gLevel.SIZE),
            j: getRandomInt(0, gLevel.SIZE)
        }
        var i = mineLoc.i;
        var j = mineLoc.j;
        if (firstMine.i === mineLoc.i && firstMine.j === mineLoc.j) continue;
        if (!board[i][j].isMine) {
            board[i][j].isMine = true;
            minesCount--
            console.log('For debugging - adding mine at', i, j);
        }
    }
}

function renderBoard(board, selector) {
    var strHTML = '<table class="table" border="3"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var className = `cell cell-${i}-${j}`;
            strHTML += `<td oncontextmenu="cellMarked(this,${i},${j})" onclick="cellClicked(this,${i},${j})" class="${className}"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function cellClicked(cell, i, j) {
    if (!gGame.isOn) return
    if (gBoard[i][j].isMarked) return;

    if (gGame.shownCount === 0 && !gIsHint) {
        setMinesOnBoard(gBoard, i, j)
        countMines()
        startTime()
    }

    if (gIsHint) {
        revealNegs(i, j)
        setTimeout(function () {
            hideNegs(i, j)

        }, 1000)
        return;
    }
    var elCell = document.querySelector(`.cell-${i}-${j}`)

    if (!gBoard[i][j].isShown) {
        gBoard[i][j].isShown = true;
        gGame.shownCount++
        if (gBoard[i][j].isMine && gLives === 1) {
            showMines()
            elCell.style.backgroundColor = 'red'
            var elLives = document.querySelector('.lives')
            elLives.innerHTML = `BOOM!`
            gGame.isOn = false

        } else if (gBoard[i][j].isMine && gLives > 1) {
            gLives--
            renderLives(gLives)
            gGame.shownCount--
            gBoard[i][j].isShown = false;
            elCell.style.backgroundColor = 'red'
            elCell.innerHTML = MINE
            setTimeout(function () {
                elCell.style.backgroundColor = 'tomato'
                elCell.innerHTML = ''
            }, 400)
        } else if (gBoard[i][j].minesAroundCount > 0) {
            elCell.innerHTML = gBoard[i][j].minesAroundCount
            elCell.style.backgroundColor = 'red'

        } else {
            checkEmptyNegs(i, j)
            elCell.style.backgroundColor = 'red'
        }


    }
    checkGameOver()

}

function revealNegs(positionI, positionJ) {
    for (var i = positionI - 1; i <= positionI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = positionJ - 1; j <= positionJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length || i === positionI && j === positionJ) continue;
            if (gBoard[i][j].isShown) continue;
            if (gBoard[i][j].isMarked) continue;

            var elCell = document.querySelector(`.cell-${i}-${j}`)
            if (gBoard[i][j].isMine) {
                elCell.innerHTML = MINE
                elCell.style.backgroundColor = 'red'
            } else if (gBoard[i][j].minesAroundCount > 0) {
                elCell.innerHTML = gBoard[i][j].minesAroundCount
                elCell.style.backgroundColor = 'red'
            } else {
                elCell.style.backgroundColor = 'red'
            }
        }
    }
}

function hideNegs(positionI, positionJ) {
    for (var i = positionI - 1; i <= positionI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = positionJ - 1; j <= positionJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length || i === positionI && j === positionJ) continue;
            if (gBoard[i][j].isShown) continue;
            if (gBoard[i][j].isMarked) continue;
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            elCell.innerHTML = ''
            elCell.style.backgroundColor = 'tomato'
        }
    }
    gIsHint = false
}

function cellMarked(cell, i, j) {
    window.event.returnValue = false;
    if (!gGame.isOn) return;
    if (gBoard[i][j].isShown) return;
    if (gGame.shownCount === 0 && gGame.markedCount === 0) {
        startTime();
    }

    isMineMarked()
    var elCell = document.querySelector(`.cell-${i}-${j}`)

    if (!gBoard[i][j].isMarked) {
        if (elCell.innerHTML === '') {
            gBoard[i][j].isMarked = true;
            gGame.markedCount++
            var elCell = document.querySelector(`.cell-${i}-${j}`);
            elCell.innerHTML = FLAG;
        }

    } else {
        gBoard[i][j].isMarked = false;
        gGame.markedCount--
        var elCell = document.querySelector(`.cell-${i}-${j}`);
        elCell.innerHTML = '';

    }
    checkGameOver()
}

function checkEmptyNegs(positionI, positionJ) {
    for (var i = positionI - 1; i <= positionI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = positionJ - 1; j <= positionJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length || i === positionI && j === positionJ) continue;
            var currCell = gBoard[i][j];
            if (!currCell.isMine && !currCell.isMarked && currCell.minesAroundCount === 0 && !currCell.isShown) {
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.style.backgroundColor = 'red'
                currCell.isShown = true;
                gGame.shownCount++
                checkEmptyNegs(i, j)
            }
        }
    }
}

function setMinesNegsCount(positionI, positionJ) {
    var count = 0;
    for (var i = positionI - 1; i <= positionI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = positionJ - 1; j <= positionJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length || i === positionI && j === positionJ) continue;
            var currItem = gBoard[i][j];
            if (currItem.isMine) count++;
        }
    }
    gBoard[positionI][positionJ].minesAroundCount = count;
}

function countMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            setMinesNegsCount(i, j)
        }

    }
    renderBoard(gBoard, '.table-container')
}

function showMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine) {
                currCell.isShown = true
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.innerHTML = MINE
                elCell.style.backgroundColor = 'red'

            }
        }
    }
}

function isMineMarked() {
    var count = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine && currCell.isMarked) {
                count++;
            }
        }
    }
    if (count === gLevel.MINES) {
        return true;
    } else {
        return false;
    }
}

function renderHints() {
    var strHTML = ''
    for (var i = 1; i < 4; i++) {
        strHTML += `<div onclick="activateHint(${i})" class="hint hints-${i}" >${HINT}</div>`;
    }
    var elHints = document.querySelector('.hints');
    elHints.innerHTML = strHTML;
}

function activateHint(i) {
    gGame.hintsCount--
    gIsHint = true;
    var elHint = document.querySelector(`.hints-${i}`)
    elHint.style.opacity = '0'
    setTimeout(function () {
        elHint.style.display = 'none'

    }, 700)
}

function renderSafeClick() {
    var strHTML = ''
    for (var i = 1; i < 4; i++) {
        strHTML += `<button onclick="safeClick(this)" class="button safe${i}">Safe Click</button>`
    }

    var elSafe = document.querySelector('.safe')
    elSafe.innerHTML = strHTML

}

function safeClick(elBtn) {
    var cellFound = false;
    while (!cellFound) {
        var randomI = getRandomInt(0, gBoard.length);
        var randomJ = getRandomInt(0, gBoard.length);

        var randomCell = gBoard[randomI][randomJ]
        if (!randomCell.isMine && !randomCell.isShown && !randomCell.isMarked) cellFound = true;
    }
    var elCell = document.querySelector(`.cell-${randomI}-${randomJ}`)
    elCell.style.backgroundColor = 'green'
    setTimeout(function () {
        elCell.style.backgroundColor = 'tomato'
    }, 500)
    var elBtn = document.querySelector(`.${elBtn.classList[1]}`)
    elBtn.style.display = 'none'

}

function renderLives(lives) {
    var elLives = document.querySelector('.lives')
    elLives.innerHTML = `${gLives} Lives Left`
}

// Time area

function renderTime() {
    var renderedTime = '00:00'
    var minutes = Math.floor(gGame.secsPassed / 60)
    var seconds = gGame.secsPassed
    if (minutes < 10) minutes = "0" + minutes
    if (seconds > 59) seconds = seconds % 60
    if (seconds < 10) seconds = "0" + seconds
    renderedTime = minutes + ":" + seconds
    var elTimer = document.querySelector('.timer-div');
    elTimer.innerHTML = renderedTime;
}

function startTime() {
    gTimer = setInterval(() => {
        gGame.secsPassed++
        renderTime();
    }, 1000);
}

function endTime() {
    clearInterval(gTimer);
}

function setLevel(level) {
    if (level.value === 'Beginner') {
        gLevel = {
            SIZE: 4,
            MINES: 2,
            OTHERCELLS: 14
        }
    } else if (level.value === 'Medium') {
        gLevel = {
            SIZE: 8,
            MINES: 12,
            OTHERCELLS: 52
        }
    } else {
        gLevel = {
            SIZE: 12,
            MINES: 30,
            OTHERCELLS: 114
        }
    }
    init()
    gBoard = buildBoard(gBoard, gLevel.SIZE);
    renderBoard(gBoard, '.table-container');

}

function checkGameOver() {
    if (gGame.markedCount === gLevel.MINES && gGame.shownCount >= gLevel.OTHERCELLS) {
        elMood.innerHTML = WINNER
        gGame.isOn = false
        endTime()
    } else if (gGame.isOn === false) {
        elMood.innerHTML = LOSER
        endTime()
    }
}

function getRandomInt(min, max) {
    var randomNumber = Math.floor(Math.random() * (max - min) + min);
    return randomNumber;
}