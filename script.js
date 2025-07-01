console.log("Let's do this danish!!");//time start :6::00pm
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
const cell=function(){
    let value;
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
    console.log(board);


})();

//create Player factory function
const Player=function(playerName,option)
{
    let name=playerName;
    let tacOption=option;
    const getTacOption=function(){
        return tacOption;
    }
    return {getTacOption}
}
const player1=Player("danish","X");
const player2=Player("arora","O");
Game.start();
console.log(Game.getState());
console.log(player1,player2);


