const eventListneres=function(){
    const modal= document.querySelector("dialog");
function modalDisplay(){
 document.querySelector(".start-game").addEventListener("click",showModal)   
}
function showModal(){
   modal.showModal();
}
function formValidation(){
    document.querySelector(".modal-submit").addEventListener("click",checkValidation);
   
}
function checkValidation(e){
    let flag=1;
    e.preventDefault();
    const requiredInputs=Array.from(document.querySelectorAll("input"));    
   requiredInputs.forEach((input)=>{
    input.value? input.className="":flag=0; });
    flag?designatePlayer(requiredInputs):requiredInputs.forEach((input)=>{input.className="empty"})
}

function designatePlayer(inputs){
    const player1=Player(inputs[0].value,"X");//inputing players adn dmaking instances of them
    const player2=Player(inputs[1].value,"O");
    domToBackend([player1,player2]);//settinsg players fro the round
}
function domToBackend(players){
    disableModal();
    Game.start();//start the game
    document.querySelector(".start-game").removeEventListener("click",showModal);//no onne can start new game amidst on going rounds
    roundController.setRoundPlayers(players);//interaction 1
}
function disableModal(){
modal.close();
}
return{modalDisplay,formValidation};
}();
eventListneres.modalDisplay();
eventListneres.formValidation();



const takeInput=(function(){//take input from dom
const grid=document.querySelector(".game-grid");
grid.addEventListener("click",setUserInput);
let cell;
function setUserInput(e){
    if(Game.getState()){
           let arr=e.target.getAttribute("data-set").split(" ");
    console.log(arr,Game.getState());
   let row= arr[0];
   let column=arr[1];
   cell=e.target;
    gameControl.myTurn(row,column); //interaction 2
    }
    
}
function getGrid(){
    return grid;
}
return {getGrid}
})();




//
const Game=(function(){
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
    return {getState,start,stop}
})();
//start game
    // Game.start();

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



const createBoard=(function()//check baord state, render baord state
{
const board=[];//2-d array having cells, 3*3 array, containing 9 cells
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
      displayModule(); //interaction 4
}
function reset(){
    for(let i=0;i<3;i++){
    for(let j=0;j<3;j++){
       board[i][j].setValue("");  //reset the baord after each round or game
   
    }
}
displayModule();//interaction 3
}

function getBoard(){
    return board;
}


return{getPosition,setPosition,getBoard,reset}
})();

const displayModule=function(){//or render
    let grid=Array.from(takeInput.getGrid().children);
    let c=0;
    // console.log(grid);
        // for(let i=0;i<3;i++){
    for(let i=0;i<3;i++){
            //   console.log(createBoard.getBoard()[i][0].getValue() +" ",createBoard.getBoard()[i][1].getValue() +" ",createBoard.getBoard()[i][2].getValue() +" ");   // board array is a collection of Cell Object instances 

    for(let j=0;j<3;j++){
       grid[c].textContent=createBoard.getBoard()[i][j].getValue();
       c++;
    
    }
}
// }
}


//create Player factory function
const Player=function(playerName,option)
{
    let position={rows:[],columns:[]};
    let name=playerName;
    let tacOption=option;
    let turn=false;
    let score=0;
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
        position={rows:[],columns:[]}
     }
    return {getTacOption,setTurn,setPosition,getPosition,getName,setScore,getScore,resetPlayerStats}
}

// const player1=Player("danish","X");
// const player2=Player("arora","O");



//game Brains!
const gameControl=(function(){
    // if(Game.getState()){
    let roundPlayers=[];
        console.log(Game.getState())
            let turn ;//PLAYER 1 TAKES FIRST TURN
            let player1;
            let player2;
    let turnCount=0;
    function setPlayers(players,turn=players[1]){
    roundPlayers=players;
      

    }
    function myTurn(row,column){//controls the turn(master controller of each turn)
        
        
        if(checkCell(row,column)){
            delegateTurn();
            console.log(turn.getName());
             createBoard.setPosition(row,column,turn.getTacOption());
            
             turn.setPosition(row,column);
            turnCount++;
            checkRoundResult();
        }
     
        return;
    }
      function delegateTurn(){
            turn=(turn===roundPlayers[0])?roundPlayers[1]:roundPlayers[0];//switches turn
    }
    function checkCell(row,column){
      return createBoard.getPosition(row,column).getValue()==="";
    }
    
    function checkRoundResult(){
        
       if(result=gameAlgo(turn)){    
        getResult(result);   
         
        Game.stop(); 

        roundController.setRoundResult(result);
        return;
}
    }
    function getResult(result){
        if(result!=="draw")
        console.log(`winner is ${result.getName()}`);
    else
    console.log(`it's a ${result}`)
return result
    }

    function setPlayerTurn(InitialTurn){
         turn=InitialTurn;
    }

//game algorithm
    function gameAlgo(positions){
    let winner;
    const players=positions;
console.log(turnCount)
    if(xY() || diagnal())
        return winner;
    else if(turnCount===9)
        return "draw";
     else 
        false;
    
function xY(){
    let regex=/(?:.*([0-9]).*?\1.*?\1)/;

    if(regex.test(players.getPosition().rows.toString()) || regex.test(players.getPosition().columns.toString()) ){
        winner=players;
        return true;
    }
}
function diagnal(){
let counter1=0;
let counter2=0;
for(i=0;i<players.getPosition().rows.length;i++){
    if(players.getPosition().rows[i]===players.getPosition().columns[i])
        counter1++;//right diagnal
    if(parseInt(players.getPosition().rows[i])+parseInt(players.getPosition().columns[i])===2)
        counter2++;//left diagnol
}
if(counter1===3 || counter2===3){
      winner=players
    return true;
} 
}
}
function resetGameControl(){
    turnCount=0;
}
return{myTurn,setPlayerTurn,getResult,setPlayers,checkRoundResult,resetGameControl}   
    }
// }
   )();



   const roundController=(function(){//controls game flow and manages game ctroller iife, form submission -> roundcontroller->game cntroller
    let roundCount=0;let player1;
    let player2;
    let initialRoundTurn;
    let roundResult;
    let finalResult;

    function setRoundPlayers(players,turn=players[1]){
      player2=players[1];
        initialRoundTurn=turn;
        player1=players[0];
        console.log(players);
        gameControl.setPlayers(players,initialRoundTurn);
       
    }
    function setRoundResult(result){
        roundCount++;
        if(result!=="draw"){

            result===player1?player1.setScore():player2.setScore();
            roundResult=result.getName();
        }
        else
        {            
            roundResult="It's a draw";
        }
        console.log(roundResult,result.getScore(),roundCount,initialRoundTurn);
        prepareNextRound();
        
    }
    function prepareNextRound(){
        if(roundCount<3){   
              Game.start();
        gameControl.setPlayerTurn(initialRoundTurn);//set turn for next round
        gameControl.resetGameControl();
        player1.resetPlayerStats();
        player2.resetPlayerStats();
        }
        else{
            Game.stop();
            getGameResult();
        } 
        createBoard.reset();//reset the  entire board in the backend
   
    }
    function  getGameResult(){
        if(player1.getScore===player2.getScore)
            return "Game is a draw "
        else{
            return player1.getScore>player2.getScore?player1.name:player2.name;
        }
    }
    function getscoreBoard(){
        return [player1.getScore(),player2.getScore()];
    }
    function getRoundResult(){
        return [roundResult,getscoreBoard()];
    }
    return{setRoundPlayers,setRoundResult,getRoundResult,getGameResult}
   })();


