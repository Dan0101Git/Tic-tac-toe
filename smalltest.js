//////////////////////////
const domController = (function () {  // dom module 1
    const modalInput = document.querySelector("dialog");
    const modalEnd=document.querySelector(".game-end")
    function showModal() {
        modalInput.showModal();
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
        disableModal(modalInput);
        disableModal(modalEnd);
        modalEnd.classList.remove("show")
        gameController.setPlayers(players); // interaction 1
    }

    function disableModal(modal) {
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
        const finalButton=document.querySelector(".start-again");
    function modalDisplay() { // adds listener
        window.addEventListener("load", domController.showModal);
        finalButton.addEventListener("click",domController.showModal);
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
    let initialState = {
        board: ["", "", "", "", "", "", "", "", ""],
        players: {}, // this contains instances of Player
        gameState: "", // gameStart||ongoing,roundend or gameend
        roundWinner: "",
        isDraw: "false",
        turn: null,
        roundScore: 0,
    };

    let state = structuredClone(initialState);
    function getState() {
        return {...state}
    }

    function getStateCopy() {
       
        return structuredClone(initialState)
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
        const currentState = masterState.getStateCopy();
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

        if (helpers.checkTurn(newState, index) && newState.gameState !== "roundEnd" && newState.gameState!=="gameEnd") {
            newState.board[index] = currentState.turn.tac;

            if (!checkRoundResult(newState)) {
                newState.turn = helpers.switchTurn(newState.turn, newState.players);
                newState.gameState = "ongoing";
                helpers.updateCurrentstate(newState);
            } else {
                helpers.updateCurrentstate(newState);
                console.log(newState);
              if(checkGameResult(newState,[newState.players.player1.score,newState.players.player2.score]))
             {console.log(newState);
              setTimeout(()=>{helpers.updateCurrentstate(newState);},2500)
              return;
             } 
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
                }, 1300);
            }
        } else return;
    }

    function checkRoundResult(roundState) {
        if (result = helpers.checkWinner(roundState.board, roundState.turn.tac)) {
            if (typeof result === "string") {
              console.log("hey");
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
function checkGameResult(roundState,scores){
  if(roundState.roundScore>=3){
    if(scores[0]===scores[1])
      roundState.roundWinner="Its's a DRAW MAN";
    else
   roundState.roundWinner=scores[0]>scores[1]?`${roundState.players.player1.name} WON!!!`:`${roundState.players.player2.name} won the ENTIRE GAME!!!`
  roundState.gameState="gameEnd";
  console.log(roundState);
  }
else return false;

return true;
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
      let flag=0;
        const patterns = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        const winningPattern = patterns.find(pattern =>
            pattern.every(index => board[index] === turn)
        );
        board.forEach((value)=>{
        if(value)
          flag++;
        });
        if (!winningPattern && flag===9)
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
    const arr = Array.from(document.querySelectorAll(".score"));
    const modal=document.querySelector(".game-end");
    const resultPara=document.querySelector(".result")

    const finalResult=document.querySelector(".final-result")
    const playerElem = Array.from(document.querySelectorAll(".player-name"));
   
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
        else{
updateRoundResult(newState.roundWinner,newState.players);
updateFinalResult(newState.roundWinner,[[newState.players.player1.name,newState.players.player1.score],[newState.players.player2.name,newState.players.player2.score]])
resetFormInputs();       
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
        resultPara.textContent = roundResult;
        for (let i = 0; i < 2; i++)
            arr[i].textContent = scoreBoard[i];
    }
    function updateFinalResult(gameResult,players)
    {
      modal.classList.add("show");
      modal.showModal();
      console.log(finalResult);
      finalResult.textContent=gameResult;
       resultPara.textContent = "";
      console.log(playerElem[3]); 
      for(let i=2;i<=3;i++)
      {
        console.log(playerElem[i]);
        playerElem[i].textContent=players[i-2][0];
        arr[i].textContent=players[i-2][1];
      }

return;
    }
    function resetFormInputs() {
  const inputValues = document.querySelectorAll("input");
  inputValues.forEach(input => input.value = "");
}

    // Show round indicator with animation
    function viewRound(roundCount) {
        if (roundCount >= 0) {
            let roundIndicator = document.querySelector(".round");
            console.log(roundIndicator);
            setTimeout(() => {
                roundIndicator.textContent = `Round ${roundCount} ....`;
                roundIndicator.classList.add('show');
            }, 200);
            setTimeout(() => {
                roundIndicator.classList.remove('show');
                resultPara.textContent="";
            }, 700); // fade out after 700ms
        }
    }

    // Draw winning line animation
    function makeRoundAnimation(pattern) {
        if (pattern) {
          console.log(pattern)
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
            playerElem[i].textContent = `${inputs[i].name} ${inputs[i].tac}`;
            arr[i].textContent=inputs[i].score;
            playerElem[i].setAttribute("data-set", inputs[i].tac);
        }
    }

    return {
        setState
    };
})();
