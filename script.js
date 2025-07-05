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
        flag? designatePlayer(requiredInputs): requiredInputs.forEach((input) => {input.className = "empty";}); // add class empty else designate players
    }

    function designatePlayer(inputs) { // internal function to designate players
        let arr = [];
        arr.push(
            { name: inputs[0].value, tac: "X" },
            { name: inputs[1].value, tac: "O" }
        );

        render.setPlayers(arr);
        render.viewRound();//edge case
        domToBackend(inputs); // setting players for the round
    }

    function domToBackend(players) {
        disableModal();
        game.start(); 
        roundState.start();
        roundController.setRoundPlayers(players); // interaction 1
    }

    function disableModal() {
        modal.close();
    }
    
    function setUserInput(e){
    if(game.getState()){
           let arr=e.target.getAttribute("data-set").split(" ");
   document.querySelector(".result").textContent=""
    gameControl.myTurn(arr[0],arr[1]); //interaction 2
    } 
}
    return {
        showModal,
        checkValidation,setUserInput
    };
})();

//////////////////////////////////////



/////////////////////////////
const eventListneres=(function(){ //#dom module 2
const grid=document.querySelector(".game-grid");
function modalDisplay(){ //adds listener
window.addEventListener("load",domController.showModal)   
}
function formValidation(){ //add listner
    document.querySelector(".modal-submit").addEventListener("click",domController.checkValidation);
   
}

grid.addEventListener("click",domController.setUserInput);
function getGrid(){
    return grid;
}
return{modalDisplay,formValidation,getGrid};
})();
eventListneres.modalDisplay();//plublic scope, add evet listners to display modal and validate form
eventListneres.formValidation();
/////////////////////////////

/////////////////////////////

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
          if(result){
            setTimeout(()=>{roundIndicator.textContent = `Round ${round}`;
            roundIndicator.classList.add('show');},2000)
          }else{roundIndicator.textContent = `Round ${round}`;
            roundIndicator.classList.add('show');}
            setTimeout(() => {
                roundIndicator.classList.remove('show');  ++round;
            }, 2700); // fade out after 700ms
        }
       
    }

    // Draw winning line animation
    function makeRoundAnimation(pattern) {
        if (pattern) {
            const lineSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="120%" height="120%" viewBox="0 0 100 100" preserveAspectRatio="none">
  <line x1="0" y1="0" x2="100" y2="100" stroke="#575757" stroke-width="3" stroke-linecap="round" />
</svg>`
console.log(pattern);
           pattern.forEach(cell => { document.querySelector(`[data-set="${cell}"]`).insertAdjacentHTML('beforeend', lineSVG);});
        }
    }

    // Set player names and tokens in DOM
    function setPlayers(inputs) {//dom  to dom
        document.querySelector(".player1").classList.add("my-turn");//assuming player 1 takes first
        for (let i = 0; i < 2; i++) {
            const playerElem = Array.from(document.querySelectorAll(".player-name"))[i];
            playerElem.textContent = `${inputs[i].name} ${inputs[i].tac}`;
            playerElem.setAttribute("data-set", inputs[i].name);
        }}
    return { displayModule,  setPlayers, updateRoundResult, viewRound, makeRoundAnimation };}();

/////////backend logic(5 modules  Game,Player,GameController,RoundController)
//////////////////////////////////////////////////////////////////////////
const Game=function(){
let state=false;
const start=function(){
    state=true;
}
const stop=function(){
    state=false;
}
const getState=function(){
    return state;
}
    return {getState,start,stop}};
const game=Game();
const roundState=Game();

   const createBoard=(function()//check baord state, render baord state
{
const board=[];//2-d array having cells, 3*3 array, containing 9 cells
const cell=function(){
    let value="";
    function setValue(playerValue){
        value=playerValue;
    }
    function getValue(){
        return value;
    }
    return {getValue,setValue}
}
//make the baord, none intractive
for(let i=0;i<3;i++){
    board[i]=[];
    for(let j=0;j<3;j++){
       board[i][j]=cell();  // board array is a collection of Cell Object instances
    }
}
function getPosition(row,column){
     return board[row][column];
}
function setPosition(row,column,tac)//for each turn
{
    board[row][column].setValue(tac);
}
const boardReset=()=>{for(let i=0;i<3;i++){
    for(let j=0;j<3;j++){board[i][j].setValue("");   }}}
function getBoard(){
    return board;
}
return{getPosition,setPosition,getBoard,boardReset}})();


//create Player factory function
const Player=function(playerName,option)
{
    let position={rows:[],columns:[]};
    let name=playerName;
    let tacOption=option;
    let turn=false;
    let score=0;
    let winPattern=[];
    const getTacOption=function(){
        return tacOption;
    }
    
    const setTurn=function(playerTurn){
        turn=playerTurn;
    }
     function setPosition(row,column){
        position.rows.push(row);
        position.columns.push(column)
     }
     function getPosition(){
        return position;
     }
     function getName(){
        return name;
     }
     function getScore(){
        return score;
     }
     function setScore(){
        score++;
     }
     function resetPlayerStats(){
        position={rows:[],columns:[]} }
            const setWinningArray=(arr)=>{     winPattern=arr;  };
            const getWinPattern=()=>{return winPattern}
            return {getTacOption,setTurn,setPosition,getPosition,getName,setScore,getScore,resetPlayerStats,setWinningArray,getWinPattern}}
///////////////////////////////////////////////////////////

        //game Brains!
const gameControl=(function(){
    let roundPlayers=[];
    let InitialTurn;
            let turn ;//PLAYER 1 AKES FIRST TURN
    let turnCount=0;
    function setPlayers(players){
    roundPlayers=players;
        turn=players[0];
        InitialTurn=turn;
    }
    function myTurn(row,column){//controls the turn(master controller of each turn)
         
          
            if(checkCell(row,column)){
        
            turn.setPosition(row,column);//sgive that position ot player
            turnCount++;
          if( checkRoundResult()) 
           {  //resetting when you get the result
            roundPlayers.forEach((player)=>{player.resetPlayerStats()});//reset player positions
            updateDisplay(row,column,turn,turn.getTacOption());
            roundState.stop();
             render.updateRoundResult(roundController.getRoundResult());
            setTimeout(()=>{createBoard.boardReset();
                roundState.start();
                 render.displayModule(roundPlayers[1],createBoard.getBoard());//stopping round for 3 seconds
 },3000);
                    turnCount=0;
           }
             else{
                updateDisplay(row,column,turn,turn.getTacOption());
               delegateTurn();  }      }
                return;
    }
    //helper f'ns to myturn controller
            function updateDisplay(row,column,playerTurn,tac){
                    createBoard.setPosition(row,column,tac);//first make th ebackend board
                    render.displayModule(playerTurn,createBoard.getBoard());// send current board and turn to render grid display adn set turn
         return;
            }
          function checkCell(row,column){
              return createBoard.getPosition(row,column).getValue()==="";}
    
          function checkRoundResult(){
       if(result=gameAlgo()){       
                  roundController.setRoundResult(result);//sending rond controller ot set result
           return true;}
            return false
         }
        function delegateTurn(){
            turn=(turn===roundPlayers[0])?roundPlayers[1]:roundPlayers[0];return;//switches turn
         }

    //game algorithm
    function gameAlgo(){
         let winner;
         const players=turn;
        const playerPosition=players.getPosition();
        if(xY() || diagnal())
            return winner;
         else if(turnCount===9)
            return "It's a draw :((";
         else 
             false;
    
         function xY(){
                let regex=/(?:.*([0-9]).*?\1.*?\1)/;let arr=[];
             if(regex.test(playerPosition.rows.toString()) || regex.test(playerPosition.columns.toString()) ){
                winner=players;
                 arr.push(`${playerPosition.rows[i]} ${playerPosition.columns[i]}`);
                 winner.setWinningArray(arr);
             return true; }
                        }
        function diagnal(){
                let counter1=0;let arr1=[];let arr2=[];let counter2=0;
                for(i=0;i<playerPosition.rows.length;i++){
                    if(playerPosition.rows[i]===playerPosition.columns[i])
                        {   counter1++;
                            arr1.push(`${playerPosition.rows[i]} ${playerPosition.columns[i]}`);
                             } //right diagnal
                    if(parseInt(playerPosition.rows[i])+parseInt(playerPosition.columns[i])===2)
                        {   counter2++;
                            arr2.push(`${playerPosition.rows[i]} ${playerPosition.columns[i]}`); }//left diagnol
                        }
        if(counter1===3 || counter2===3){
             winner=players;
            winner.setWinningArray(counter1===3?arr1:arr2);//push th ewinning array format to winner player which ever diagnol pattern  won
            return true;}}}
    return{myTurn,setPlayers,checkRoundResult}  })();

///////////////////////////////////////

const roundController=(function(){//controls game flow and manages game ctroller iife, form submission -> roundcontroller->game cntroller
    let roundCount=0;//tracking round count (1,2,3)
    let player1;//tracking players playing the game
    let player2;let pattern;
    let roundResult;//evaluate round  and game result//contains player who won, or stirng of draw if draw//IT IS WALWAYS GONNA BE A STRING
    function setRoundPlayers(players){//tick //entry point  POINT 1
        player1 = Player(players[0].value, "X"); // inputting players and making instances of them
        player2 = Player(players[1].value, "O");
        gameControl.setPlayers([player1,player2]);  
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


