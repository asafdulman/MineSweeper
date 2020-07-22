'use strict'

//note to self - see in the render board if the data id is needed
// maybe use in the renderBoard() later - data-id="${i}-${j}" 
// cellMarked function doesn't use the cell as an argument


// Global Vairables - 
var FLAG = '🏳‍🌈'
var MINE = '💣'
var gBoard;
var size = 4

var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gLevel = {
    SIZE: 4,
    MINES: 2,
    OTHERCELLS: 14
}

gBoard = buildBoard(gBoard, gLevel.SIZE)

function init() {
    
    renderBoard(gBoard, '.table-container')
    

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

function setMinesOnBoard(board,i,j) {
    var firstMine = {
        i:i,
        j:j
    }
    var minesCount = gLevel.MINES;
    while (minesCount > 0) {

        var mineLoc = {
            i: getRandomInt(0, 4),
            j: getRandomInt(0, 4)
        }
        var i = mineLoc.i;
        var j = mineLoc.j;
        if (firstMine.i === mineLoc.i && firstMine.j === mineLoc.j) continue;
        if (!board[i][j].isMine) {
            board[i][j].isMine = true;
            minesCount--
            console.log('adding mine at', i, j);
        }
    }

}

function renderBoard(board, selector) {
    var strHTML = '<table class="table" border="1"><tbody>';
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
    if (gGame.shownCount === 0) {
        setMinesOnBoard(gBoard,i,j)
        countMines()
    }

    var elCell = document.querySelector(`.cell-${i}-${j}`)


    if (!gBoard[i][j].isShown) {
        gBoard[i][j].isShown = true;
        gGame.shownCount++
        if (gBoard[i][j].isMine === true) {
            elCell.innerHTML = MINE
            elCell.style.backgroundColor = 'red'


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

function cellMarked(cell, i, j) {
    window.event.returnValue = false;
    if (gGame.shownCount === 0) {
        setMinesOnBoard(gBoard,i,j)
        countMines()
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
            var currItem = gBoard[i][j];
            if (currItem.isMine === false && currItem.isMarked === false && currItem.minesAroundCount === 0) {
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.style.backgroundColor = 'red'
                gGame.shownCount++

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
            if (currItem.isMine === true) count++;
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

function checkGameOver() {
        // console.log('mines counter',gGame.markedCount,gLevel.MINES)
        // console.log('reg cells',gGame.shownCount,gGame.OTHERCELLS)

    if (gGame.markedCount === gLevel.MINES && gGame.shownCount >= gLevel.OTHERCELLS) {
        console.log('game over you win');
    }
}

function isMineMarked() {
    var count = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine === true && currCell.isMarked === true) {
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

function getRandomInt(min, max) {
    var randomNumber = Math.floor(Math.random() * (max - min) + min);
    return randomNumber;
}