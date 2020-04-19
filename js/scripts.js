CARD_VALUES = {1: "A", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K"};

CARD_TYPES = {1: "SPADE", 2: "HEART", 3: "CLUB", 4: "DIAMOND"};

/**
 * Initialize all possible cards
 * @returns Array
 */
function createCards() {
    let cards = [];
    for (let [typeKey] of Object.entries(CARD_TYPES)) {
        for (let [valueKey] of Object.entries(CARD_VALUES)) {
            cards.push({
                type: typeKey,
                value: valueKey
            });
        }
    }
    return cards;
}

/**
 * Shuffles Cards using Fisher-Yates
 * @param {Array} cards
 * @returns Array
 */
function shuffleCards(cards) {
    let m = cards.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);

      // And swap it with the current element.
      t = cards[m];
      cards[m] = cards[i];
      cards[i] = t;
    }

    return cards;
}

/**
 * Takes cards and lays them down in traditional Solitaire hand.
 * @param {Array} cards
 */
function setupBoardWithHand(cards) {
    let cardCount = 1;
    let board = [[],[],[],[],[],[],[]];
    for (let i = 0; i < board.length; i++) {
        let remainingCardsInSlot = cardCount++;
        while(remainingCardsInSlot-- > 0) {
            const poppedCard = cards.pop();
            poppedCard.visible = remainingCardsInSlot == 0;
            board[i].push(poppedCard);
        }
    }

    return board;
}

function balanceBoard(board) {
    for (let i = 0; i < board.length; i++) {
        if (board[i].length == 0) continue;
        // Go to the top of the stack to find the topmost card.
        stackPosition = getStackStartPosition(board, i);

        // check if it can be placed somewhere else.
        for (let j = 0; j < board.length; j++) {
            if (j == i) continue;

            // If the board is zero, only move if we're a king.
            if (board[j].length == 0) {
                if (board[i][stackPosition].value == 13) {
                    board[j] = board[j].concat(board[i].splice(stackPosition));
                    break;
                }
            } else {
                const lastCard = board[j][board[j].length - 1];
                if (!isSameColor(lastCard, board[i][stackPosition]) &&
                    ((lastCard.value - 1) == board[i][stackPosition].value)) {
                    // splice the array and move it.
                    board[j] = board[j].concat(board[i].splice(stackPosition));
                    markLastCardVisible(board, i);
                    break;
                }
            }
        }
    }
}

function addIncrementalCardToWinBoard(board, winBoard) {
    for (let i = 0; i < board.length; i++) {
        if (board[i].length == 0) continue;
        const lastCard = board[i][board[i].length - 1];

        if (winBoard[lastCard.type].length == 0 && lastCard.value != 1) {
            continue;
        }

        // If the last card can be added to the winBoard, add it!;
        if ((winBoard[lastCard.type].length == 0 && lastCard.value == 1) ||
            (winBoard[lastCard.type].slice(-1)[0].value == (lastCard.value - 1))) {
            winBoard[lastCard.type].push(board[i].pop());
            markLastCardVisible(board, i);
        }
    }

    return board;
}

function addPlayerHandToBoard(board, playerHand, winBoard) {
    for (let handI = playerHand.length - 1; handI >= 0; handI--) {
        // Check each line of the board and add if possible.
        for (let i = 0; i < board.length; i++) {
            if (board[i].length == 0) {
                if (playerHand[handI].value == 13) {
                    playerHand[handI].visible = true;
                    board[i] = board[i].concat(playerHand.splice(handI, 1));
                }
                continue;
            }
            lastCard = board[i].slice(-1)[0];
            if (!isSameColor(lastCard, playerHand[handI]) &&
            ((lastCard.value - 1) == playerHand[handI].value)) {
                playerHand[handI].visible = true;
                board[i] = board[i].concat(playerHand.splice(handI, 1));
                continue;
            }
        }

        // Check if we can add it to the winBoard otherwise.
        if (winBoard[playerHand[handI].type].length == 0 && playerHand[handI].value != 1) {
            continue;
        }

        if ((winBoard[playerHand[handI].type].length == 0 && playerHand[handI].value == 1) ||
            (winBoard[playerHand[handI].type].slice(-1)[0].value == (playerHand[handI].value - 1))) {
            playerHand[handI].visible = true;
            winBoard[playerHand[handI].type] = winBoard[playerHand[handI].type].concat(playerHand.splice(handI, 1));
        }
    }
}

/* ------- UTIL FUNCTIONS --------- */


function printBoard(board, winBoard, hand) {
    const $board = $('<div class="board"/>');
    const $playBoard = $('<div class="playBoard"/>');
    for (let i = 0; i < board.length; i++) {
        const $col = $('<div class="col" />');
        for (let j = 0; j < board[i].length; j++) {
            const $item = $('<div class="item"/>').html(board[i][j].visible ? CARD_VALUES[board[i][j].value] + ' ' + CARD_TYPES[board[i][j].type] : 'X');
            $item.toggleClass('red', board[i][j].type % 2 == 0);
            $col.append($item);
        }
        $playBoard.append($col);
    }

    $board.append($playBoard);

    const $winBoard = $('<div class="winBoard"/>');
    for (let [i, value] of Object.entries(winBoard)) {
        const $col = $('<div class="col" />');
        for (let j = 0; j < winBoard[i].length; j++) {
            const $item = $('<div class="item"/>').html(CARD_VALUES[winBoard[i][j].value] + ' ' + CARD_TYPES[winBoard[i][j].type]);
            $item.toggleClass('red', winBoard[i][j].type % 2 == 0);
            $col.append($item);
        }
        $winBoard.append($col);
    }

    $board.append($winBoard);

    const $hand = $('<div class="hand"/>');
    const $col = $('<div class="col" />');
    for (let i = 0; i < hand.length; i++) {
        const $item = $('<div class="item"/>').html(CARD_VALUES[hand[i].value] + ' ' + CARD_TYPES[hand[i].type]);
        $item.toggleClass('red', hand[i].type % 2 == 0);
        $col.append($item);

    }

    $hand.append($col);
    $board.append($hand);

    $('body').html($board);
}



function markLastCardVisible(board, line) {
    if (board[line].length == 0) return;
    board[line][board[line].length - 1].visible = true;
}

/**
 * @param {Array} board
 * @param {Integer} line
 */
function getStackStartPosition(board, line) {
    let stackPosition = -1;
    for (let i = 0; i < board[line].length; i++) {
        if (board[line][i].visible) {
            stackPosition = i;
            break;
        }
    }

    if (stackPosition === -1) markLastCardVisible(board, line);

    return stackPosition;
}

function isSameColor(card1, card2) {
    card1IsBlack = ['1', '3'].includes(card1.type);
    card2IsBlack = ['1', '3'].includes(card2.type);
    if (card1IsBlack && card2IsBlack) return true;
    if (!card1IsBlack && !card2IsBlack) return true;

    return false;
}

// Populate our hand.
var cardsInHand = createCards();
// Shuffle it.
shuffleCards(cardsInHand);
// Populate the board.
let board = setupBoardWithHand(cardsInHand);
// create the empty winBoard
let winBoard = {
    1:[],
    2:[],
    3:[],
    4:[]
};

printBoard(board, winBoard, cardsInHand);

let interval;
interval = setInterval(() => {
    const clonedBoard = JSON.parse(JSON.stringify(board));
    balanceBoard(board);
    addPlayerHandToBoard(board, cardsInHand, winBoard);
    addIncrementalCardToWinBoard(board, winBoard);

    // @todo add support to swap similar numbers to potentially shake up the winboard additions.
    printBoard(board, winBoard, cardsInHand);
    if (JSON.stringify(board) == JSON.stringify(clonedBoard)) clearInterval(interval);
}, 250);