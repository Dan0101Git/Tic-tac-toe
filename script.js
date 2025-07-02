// console.log("Let's do this danish!!");//time start :6::00pm
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
let board=[];//2-d array having cells, 3*3 array, containing 9 cells
for(let i=0;i<3;i++){
    board[i]=[];
    for(let j=0;j<3;j++){
       board[i][j]=cell();  // board array is a collection of Cell Object instances
    
    }
}

function getPosition(row,column){
     return board[row][column];
}
function setPosition(row,column)
{
    board[row][column].setValue(gameControl.getPlayerTurn().getTacOption());
    for(let i=0;i<3;i++){
      console.log(board[i][0].getValue() +" ",board[i][1].getValue() +" ",board[i][2].getValue() +" ");   // board array is a collection of Cell Object instances
    
    
}
// console.dir(board);
}
return{getPosition,setPosition}
})();




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
            let turn =player1;
    let turnCount=0;
    function myTurn(row,column){
        
        
        if(checkCell(row,column)){
            delegateTurn();
            console.log(turn.getName());
            // console.log("hey");
             createBoard.setPosition(row,column);
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
    //    console.log( createBoard.getPosition(row,column).getValue()==="U");
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

    return{myTurn,getPlayerTurn}   
    }

    
})();

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
    }

if(winner)
    return true;
}
function diagnal(){

    let array=[];
if(players.getPosition().rows.length>=3)
{
    let counter=0
for(i=0;i<4;i++)
{
    if(players.getPosition().rows[i]===players.getPosition().columns[i])
        counter++;
array.push(players.getPosition().rows[i]+players.getPosition().columns[i]);
}
if(counter===3)
{
    winner=players;
    return true;
}
array=array.filter((item)=>item%2===0).sort((a,b)=>a-b);
let c;
console.log(array);
if(array.length>=3){
    for(let i=0;i<array.length-1;i++)
{
     console.log((c && c===array[i+1]-array[i]));
    if(((c && c===array[i+1]-array[i])===0) || (c && c===array[i+1]-array[i]))
        winner=players;

    c=array[i+1]-array[i];
   
}
}
console.log(players);
}

if(winner)
    return true;
}
}





//starting round
 gameControl.myTurn(1,2);
//  gameControl.myTurn(2,2);

 gameControl.myTurn(0,0);
     gameControl.myTurn(0,1);
    //   gameControl.myTurn(0,2);
   
        gameControl.myTurn(1,1);
    gameControl.myTurn(2,1);
        gameControl.myTurn(2,2);
    //  gameControl.myTurn(0,0);
    //    gameControl.myTurn(1,0);
    //     gameControl.myTurn(2,0);





 //  console.log(Game.getState());
// console.log(player1,player2);



