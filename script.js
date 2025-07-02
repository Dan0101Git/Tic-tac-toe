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
    Game.start();

const cell=function(){
    let value="U";
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
function setPosition(row,column,tac)
{
    board[row][column].setValue(tac);
}
function getBoard(){
    return board;
}

return{getPosition,setPosition,getBoard}
})();

const displayModule=function(){
        for(let i=0;i<3;i++){
      console.log(createBoard.getBoard()[i][0].getValue() +" ",createBoard.getBoard()[i][1].getValue() +" ",createBoard.getBoard()[i][2].getValue() +" ");   // board array is a collection of Cell Object instances 
    
}
}


//create Player factory function
const Player=function(playerName,option)
{
    let position={rows:[],columns:[]};
    let name=playerName;
    let tacOption=option;
    let turn=false;
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
    return {getTacOption,setTurn,setPosition,getPosition,getName}
}

const player1=Player("danish","X");
const player2=Player("arora","O");



//game Brains!
const gameControl=(function(){
    if(Game.getState){
            let turn =player2;//PLAYER 1 TAKES FIRST TURN
    let turnCount=0;
    function myTurn(row,column){
        
        
        if(checkCell(row,column)){
            delegateTurn();
            console.log(turn.getName());
             createBoard.setPosition(row,column,turn.getTacOption());
             displayModule();
             turn.setPosition(row,column)
            turnCount++;
            checkRoundResult();
        }
     
        return;
    }
      function delegateTurn(){
            turn=(turn===player1)?player2:player1;
            player1.setTurn=(turn===player1)?true:false;
            player2.setTurn=(turn===player2)?true:false;
    }
    function checkCell(row,column){
      return createBoard.getPosition(row,column).getValue()==="U";
    }
    
    function checkRoundResult(){
        
       if(result=gameAlgo(turn)){    
        getResult(result);    
        Game.stop(); 
        return;
}
    }
    function getResult(result){
        console.log(`winner is ${result.getName()}`);
return result
    }

    function getPlayerTurn(){
        return turn;
    }

//game algorithm
    function gameAlgo(positions){
    let winner;
    const players=positions;

    if(xY() || diagnal())
        return winner;
    else if(gameControl.turnCount===9)
        return draw;
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
    if(players.getPosition().rows[i]+players.getPosition().columns[i]===2)
        counter2++;//left diagnol
}
if(counter1===3 || counter2===3){
      winner=players
    return true;
}
  
}
}


    return{myTurn,getPlayerTurn,getResult}   
    }

    
})();




//starting round
 gameControl.myTurn(1,2);
//  gameControl.myTurn(2,2);


   
        gameControl.myTurn(1,1);
    gameControl.myTurn(2,1);
        gameControl.myTurn(2,2);



