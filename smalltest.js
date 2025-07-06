//////////////////////////
const domController = (function () {  // dom module 1
    const modal = document.querySelector("dialog");

    function showModal() {
        modal.showModal();
    }

    function checkValidation(e) { // check validation on form submission
        let flag = 1;
        e.preventDefault();
        const requiredInputs = Array.from(document.querySelectorAll("input"));

        requiredInputs.forEach((input) => {
            input.value ? input.className = "" : flag = 0;
        });

        flag
            ? designatePlayer(requiredInputs)
            : requiredInputs.forEach((input) => { input.className = "empty"; }); // add class empty else designate players
    }

    function designatePlayer(inputs) { // internal function to designate players
        domToBackend([inputs[0].value, inputs[1].value]); // setting players for the round
    }

    function domToBackend(players) {
        disableModal();
        gameController.setPlayers(players); // interaction 1
    }

    function disableModal() {
        modal.close();
    }

    function setUserInput(e) {
        let index = e.target.getAttribute("data-set");
        gameController.playTurn(index); // interaction 2
    }

    return {
        showModal,
        checkValidation,
        setUserInput
    };
})();

const eventListneres = (function () { //#dom module 2
    const grid = document.querySelector(".game-grid");

    function modalDisplay() { // adds listener
        window.addEventListener("load", domController.showModal);
    }

    function formValidation() { // add listener
        document.querySelector(".modal-submit").addEventListener("click", domController.checkValidation);
    }

    grid.addEventListener("click", domController.setUserInput);

    function getGrid() {
        return grid;
    }

    return {
        modalDisplay,
        formValidation,
        getGrid
    };
})();

eventListneres.modalDisplay(); // public scope, add event listeners to display modal and validate form
eventListneres.formValidation();

const Player = function (name, tac, score) {
    this.name = name;
    this.tac = tac;
    this.score = score;
};

const masterState = (function () {
    let state = {
        board: ["", "", "", "", "", "", "", "", ""],
        players: {}, // this contains instances of Player
        gameState: "", // gameStart||ongoing,roundend or gameend
        roundWinner: "",
        isDraw: "false",
        turn: null,
        roundScore: 0,
    };

    const deepCopy = structuredClone(state);

    function getState() {
        return { ...state };
    }

    function getStateCopy() {
        console.log(deepCopy);
        return { ...deepCopy };
    }

    function updateState(newState) {
        state = newState;
    }

    return {
        getState,
        updateState,
        getStateCopy
    };
})();

const gameController = (function () {
    function setPlayers(playerNames) {
        const currentState = masterState.getState();
        const players = {
            player1: new Player(playerNames[0], "X", 0),
            player2: new Player(playerNames[1], "O", 0) // FIXED: second name should be [1], not [0]
        };

        const newState = {
            ...currentState,
            players: players,
            gameState: "gameStart",
            turn: players.player1
        };

        helpers.updateCurrentstate(newState);
    }

    function playTurn(index) {
        const currentState = masterState.getState();
        const newState = { ...currentState };

        if (helpers.checkTurn(newState, index) && newState.gameState !== "roundEnd") {
            newState.board[index] = currentState.turn.tac;

            if (!checkRoundResult(newState)) {
                newState.turn = helpers.switchTurn(newState.turn, newState.players);
                newState.gameState = "ongoing";
                helpers.updateCurrentstate(newState);
            } else {
                helpers.updateCurrentstate(newState);
                console.log(newState);

                setTimeout(() => {
                    const newRoundState = masterState.getStateCopy();
                    newRoundState.board.fill('');
                    console.log(newRoundState.board);
                    newRoundState.gameState = "roundStart";
                    newRoundState.turn = newState.players.player1;
                    newRoundState.players = newState.players;
                    newRoundState.roundScore = newState.roundScore++;
                    console.log(newRoundState);
                    helpers.updateCurrentstate(newRoundState);
                }, 3000);
            }
        } else return;
    }

    function checkRoundResult(roundState) {
        if (result = helpers.checkWinner(roundState.board, roundState.turn.tac)) {
            if (typeof result === "string") {
                roundState.isDraw = true;
                roundState.roundWinner = "It's a draw";
            } else {
                roundState.winningPattern = result;
                roundState.turn.score++;
                roundState.roundWinner = `${roundState.turn.name} is the Winner!!!`;
            }
            roundState.roundScore++;
            roundState.gameState = "roundEnd";
            return true;
        } else {
            return false;
        }
    }

    return {
        setPlayers,
        playTurn
    };
})();

const helpers = (function () {
    function checkTurn(state, index) {
        return !state.board[index];
    }

    function switchTurn(currentTurn, players) {
        return currentTurn === players.player1 ? players.player2 : players.player1;
    }

    function checkWinner(board, turn) {
        const patterns = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        const winningPattern = patterns.find(pattern =>
            pattern.every(index => board[index] === turn)
        );
        if (!winningPattern && board.every(index => board[index]))
            return "draw";
        return winningPattern || null; // null if no win
    }

    function updateCurrentstate(state) {
        masterState.updateState(state);
        render.setState(masterState.getState());
    }

    return {
        checkTurn,
        checkWinner,
        updateCurrentstate,
        switchTurn
    };
})();

const render = (function () { // render the DOM (receives updates from backend)
    let player1Dom = document.querySelector(".player1");
    let round;
    let arr = Array.from(document.querySelectorAll(".score"));

    function setState(newState) {
        console.log(newState);
        displayModule(newState.board);

        if (newState.gameState === "gameStart") {
            setPlayers([newState.players.player1, newState.players.player2]);
            setTurn(newState.gameState, newState.turn.tac);
            viewRound(newState.roundScore);
        } else if (newState.gameState === "ongoing") {
            setTurn(newState.gameState, newState.turn.tac);
        } else if (newState.gameState === "roundEnd") {
            makeRoundAnimation(newState.winningPattern);
            updateRoundResult(newState.roundWinner, newState.players);
        } else if (newState.gameState === "roundStart") {
            console.log(newState.roundScore);
            viewRound(newState.roundScore);
        }
    }

    // Render board state and update turn indicator
    const displayModule = function (board) {
        let grid = Array.from(eventListneres.getGrid().children); // grid cells
        for (let i = 0; i < 9; i++) {
            console.log(board[i]);
            grid[i].textContent = board[i];
        }
    };

    // Highlight current player's turn
    function setTurn(state, turn) {
        console.log(state);
        if (state !== "gameStart")
            document.querySelector(".my-turn").classList.remove("my-turn");
        document.querySelector(`div[data-set=${turn}]`).classList.add("my-turn");
    }

    // Update scoreboard and round view after result
    function updateRoundResult(roundResult, players) {
        let scoreBoard = [];
        scoreBoard.push(players.player1.score);
        scoreBoard.push(players.player2.score);
        document.querySelector(".result").textContent = roundResult;
        for (let i = 0; i < 2; i++)
            arr[i].textContent = scoreBoard[i];
    }

    // Show round indicator with animation
    function viewRound(roundCount) {
        if (roundCount >= 0) {
            let roundIndicator = document.querySelector(".round");
            console.log(roundIndicator);
            setTimeout(() => {
                roundIndicator.textContent = `Round ${roundCount} ....`;
                roundIndicator.classList.add('show');
            }, 1200);
            setTimeout(() => {
                roundIndicator.classList.remove('show');
            }, 2700); // fade out after 700ms
        }
    }

    // Draw winning line animation
    function makeRoundAnimation(pattern) {
        if (pattern) {
            const lineSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="120%" height="120%" viewBox="0 0 100 100" preserveAspectRatio="none">
  <line x1="0" y1="0" x2="100" y2="100" stroke="#575757" stroke-width="3" stroke-linecap="round" />
</svg>`;
            pattern.forEach(cell => {
                document.querySelector(`[data-set="${cell}"]`).insertAdjacentHTML('beforeend', lineSVG);
            });
        }
    }

    // Set player names and tokens in DOM
    function setPlayers(inputs) {
        for (let i = 0; i < 2; i++) {
            const playerElem = Array.from(document.querySelectorAll(".player-name"))[i];
            playerElem.textContent = `${inputs[i].name} ${inputs[i].tac}`;
            playerElem.setAttribute("data-set", inputs[i].tac);
        }
    }

    return {
        setState
    };
})();
