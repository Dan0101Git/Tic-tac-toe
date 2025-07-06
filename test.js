//temporary file to work on modules reapir them and  return them back
//round ctntroller 
//find points wehre roundcontroller interacts with dom, find where it snds data->red flag, //70 lines total


const roundController=(function(){//controls game flow and manages game ctroller iife, form submission -> roundcontroller->game cntroller
    let roundCount=0;//tracking round count (1,2,3)
    let player1;//tracking players playing the game
    let player2;let pattern;
    let roundResult;//evaluate round  and game result//contains player who won, or stirng of draw if draw//IT IS WALWAYS GONNA BE A STRING
    function setRoundPlayers(players){//tick //entry point  POINT 1
        player1 = Player(players[0].value, "X"); // inputting players and making instances of them
        player2 = Player(players[1].value, "O");
        gameControl.setPlayers([player1,player2],initialRoundTurn);  
    }
    function setRoundResult(result){ //tick  bring result from game controller, evaluate it, store it in a vairbale and  update player score
        roundCount++;
        if(typeof result!=="string"){
            (result===player1)?player1.setScore():player2.setScore();
             pattern=result.getWinPattern();
            result=`${result.getName()} WINS!!!!`;
        }
        roundResult={result:result,pattern:pattern,score:[player1.getScore(),player2.getScore()]};
        prepareNextRound(); 
    } 
    function prepareNextRound(){    //red flag
        if(roundCount>=3){   
              game.stop();  //mark //start next game
            roundResult={result:getGameResult(),pattern:pattern,score:[player1.getScore(),player2.getScore()]};
        }  
         pattern=[];//next time, closure over pattern gets returned if next round is a draw 
    }
    function  getGameResult(){//evalate result whne round ends
        if(player1.getScore()===player2.getScore())
            return "Game is a DRAW!!";
        else{
            return player1.getScore()>player2.getScore()?`${player1.getName()} WINS THE ENTIRE GAME!!!!`:`${player2.getName()} WINS THE ENTIRE GAME!!!!`;
        }
    }
    function getRoundResult(){//a single point to get result after each round
        return roundResult;//roundSesult is an object={result(string),pattern(winner pattern array),score(scoreboard)}
    }
    return{setRoundPlayers,setRoundResult,getRoundResult}})();










        //game Brains!
const gameControl=(function(){
     const state= masterState.getState();
    let roundPlayers=[];
    let roundScore=0;//to track round score
    let InitialTurn;
            let turn ;//PLAYER 1 AKES FIRST TURN
    let turnCount=0;
    function setPlayers(playerNames){
  state.players.player1=new Player(playerNames[0],"X",0)
  state.players.player1=new Player(playerNames[1],"O",0)

}
    function myTurn(row,column){//controls the turn(master controller of each turn)
          if(checkCell(row,column)){
            turn.setPosition(row,column);//sgive that position ot player
            turnCount++;
          if( checkRoundResult()) 
           {  //resetting when you get the result
            roundPlayers.forEach((player)=>{player.resetPlayerStats()});//reset player positions
            updateDisplay(turn,turn.getTacOption());
            roundState.stop();
             render.updateRoundResult(roundController.getRoundResult());// point 2, exi tpoint ot dom//send the player won and scoreboard
            setTimeout(()=>{updateDisplay(roundPlayers[1],"");
                roundState.start();//stopping round for 3 seconds
            },3000);
                    turnCount=0;
           }
             else{
                updateDisplay(turn,turn.getTacOption());
               delegateTurn();  }      }
                return;
    }
    //helper f'ns to myturn controller
            function updateDisplay(playerTurn,tac){
                    createBoard.setPosition(row,column,tac);//first make th ebackend board
                    render.displayModule(playerTurn,createBoard.getBoard());// send current board and turn to render grid display adn set turn
         return;
            }
          function checkCell(row,column){return createBoard.getPosition(row,column).getValue()==="";}
    
          function checkRoundResult(){
       if(result=checkWinner()){       
            roundController.setRoundResult(result);//sending rond controller ot set result
           return true;}
            return false
         }
        function delegateTurn(){
            turn=(turn===roundPlayers[0])?roundPlayers[1]:roundPlayers[0];return;//switches turn
         }

//game algorithm
    function checkWinner(board,turn){
    const patterns=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const winningPattern = patterns.find(pattern =>
    pattern.every(index => board[index] === turn));
  return winningPattern || null; // null if no win
    }
            function checkGameResult(){
                if(roundScore>=3){
                    game.stop();
                    if(player1.getScore===player2.getScore())
                        return "GAME IS A DRAW"
                return player1.getScore()>player2.getScore()?`${player1.getName()} WINS THE ENTIRE GAME!!!!`:`${player2.getName()} WINS THE ENTIRE GAME!!!!`;

                }
                else return;
            }
    return{myTurn,setPlayers,checkRoundResult}  })();











const render = function () { // render the DOM (receives updates from backend)
    let previousTurn = document.querySelector(".player2");
    let player1Dom=document.querySelector(".player1");
    let round;let arr = Array.from(document.querySelectorAll(".score"));
    // Render board state and update turn indicator
    const displayModule = function (turn,board) {
        let grid = Array.from(eventListneres.getGrid().children); // grid cells//getting data from dom controller
        let c = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                grid[c].textContent = board[i][j].getValue();
                c++;
            }
        }
        setTurn(turn);
    };

    // Highlight current player's turn
    function setTurn(turn) {//sets green border around  player's turn
        document.querySelector(`div[data-set=${turn.getName()}]`).classList.remove("my-turn");//might bug if no class found wth my-turn in edge case
        if(!roundState.getState()){//when the round is "paused, set turn to player 1 again for next round"
            previousTurn=player1Dom;
             previousTurn.classList.add("my-turn");
        }
        else{      previousTurn.classList.add("my-turn");
        previousTurn = document.querySelector(`div[data-set=${turn.getName()}]`);}
  
    }

    // Update scoreboard and round view after result
    function updateRoundResult(roundResult) {//roundResult is an object={result(string),pattern(winner pattern array),score(scoreboard)}
        let scoreBoard = roundResult.score;
        console.log(scoreBoard);
        document.querySelector(".result").textContent =roundResult.result;
        for (let i = 0; i < 2; i++)
            arr[i].textContent = scoreBoard[i];
        makeRoundAnimation(roundResult.pattern);
        viewRound(1);
       
    }

    // Show round indicator with animation
    function viewRound(result) {//only connected to dom
        if (!round) round = 1;

        if (round < 4) {
            let roundIndicator = document.querySelector(".round");
           result? setTimeout(()=>{roundIndicator.textContent = `Round ${round}`;
            roundIndicator.classList.add('show');},2700):roundIndicator.textContent = `Round ${round}`;
            roundIndicator.classList.add('show');
            setTimeout(() => {
                roundIndicator.classList.remove('show');
            }, 700); // fade out after 700ms

            round++;
        }
    }

    // Draw winning line animation
    function makeRoundAnimation(pattern) {
        if (pattern) {
            const lineSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="120%" height="120%" viewBox="0 0 100 100" preserveAspectRatio="none">
  <line x1="0" y1="0" x2="100" y2="100" stroke="#575757" stroke-width="3" stroke-linecap="round" />
</svg>`
           result.forEach(cell => { document.querySelector(`[data-set="${cell}"]`).insertAdjacentHTML('beforeend', lineSVG);});
        }
    }

    // Set player names and tokens in DOM
    function setPlayers(inputs) {//dom  to dom
        document.querySelector(".player1").classList.add("my-turn");//assuming player 1 takes first
        for (let i = 0; i < 2; i++) {
            const playerElem = Array.from(document.querySelectorAll(".player-name"))[i];
            playerElem.textContent = `${inputs[i].name} ${inputs[i].tac}`;
            playerElem.setAttribute("data-set", inputs[i].name);
        }
    }
    return { displayModule,  setPlayers, updateRoundResult, viewRound, makeRoundAnimation };}();



const masterState=(function(){
    const state={
        board:Array(9),
        players:{} ,//this contains insatnecs of Player
        state:"", //gameStart||ongoing,roundend or gameend
        roundWinner:"",
        isDraw:"false",
    };
const copyMasterState=Object.assign(state);
function getState(){
    return copyMasterState;
}
function updateState(newSate){
copyMasterState=newSate;
}
return {getState,updateState}
})();