
function drawIt() {
var x = 400;
var y = 700;
var dx = 2;
var dy = 4;
var intervalId;
var WIDTH;
var HEIGHT;
var f = 0;
var r=20;
var ctx;
var rightDown = false;
var leftDown = false;

//deklaracija in inicializacija slike
var ship = new Image();
ship.src = "img/pirateShip.png";
var paddle =  new Image();
paddle.src = "img/paddle.png";
var ball = new Image();
ball.src = "img/ball.png"
var goldenShip = new Image();
goldenShip.src = "img/crow.webp";

var ships = [
  goldenShip,
  ship
];
  


//vstavljanje slike





//nastavljanje leve in desne tipke
function onKeyDown(evt) {
  if (evt.keyCode == 39 || evt.key=== "d")
rightDown = true;
  else if (evt.keyCode == 37 || evt.key=== "a") leftDown = true;
}

function onKeyUp(evt) {
  if (evt.keyCode == 39 || evt.key=== "d")
rightDown = false;
  else if (evt.keyCode == 37 || evt.key=== "as") leftDown = false;
}
$(document).keydown(onKeyDown);
$(document).keyup(onKeyUp); 

function init() {
  ctx = $('#canvas')[0].getContext("2d");
  WIDTH = $("#canvas").width();
  HEIGHT = $("#canvas").height();
  intervalId = setInterval(draw, 10);
  return intervalId
}

function circle(x,y,r) {
  ctx.beginPath();
  ctx.drawImage(ball, x - r, y - r, r * 2, r * 2); 
  ctx.closePath();
  ctx.fill();
}

function rect(x,y,w,h) {
  ctx.beginPath();
  ctx.rect(x,y,w,h);
  ctx.closePath();
  ctx.fill();
}

function clear() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}
//END LIBRARY CODE


init();

var paddlex;
var paddleh;
var paddlew;


function init_paddle() {
  paddlex = WIDTH / 2;
  paddleh = 45;
  paddlew = 150;
}

function draw() {
  clear();
  circle(x, y, r);
  //premik ploščice levo in desno
  if(rightDown){
if((paddlex+paddlew) < WIDTH){
paddlex += 5;
}else{
paddlex = WIDTH-paddlew;
}
}
else if(leftDown){
if(paddlex>0){
paddlex -=5;
}else{
paddlex=0;
}
}
ctx.drawImage(paddle,paddlex, HEIGHT-paddleh, paddlew, paddleh);

//riši opeke
for (i=0; i < NROWS; i++) {
    
    for (j=0; j < NCOLS; j++) {
      if (bricks[i][j] == 0 || bricks[i][j]==1) {
        
        ctx.drawImage(ships[bricks[i][j]], (j * (BRICKWIDTH + PADDING)) + PADDING, (i * (BRICKHEIGHT + PADDING)) + PADDING, BRICKWIDTH, BRICKHEIGHT);
      }
    }
  }

  rowheight = BRICKHEIGHT + PADDING + f/2; //Smo zadeli opeko?
  colwidth = BRICKWIDTH + PADDING + f/2;
  row = Math.floor(y/rowheight);
  col = Math.floor(x/colwidth);
  //Če smo zadeli opeko, vrni povratno kroglo in označi v tabeli, da opeke ni več
if (y < NROWS * rowheight && row >= 0 && col >= 0 && bricks[row][col] !== -1) {
  dy = -dy;
  bricks[row][col] = -1;
}
  if (x + dx > WIDTH -r || x + dx < 0+r)
    dx = -dx;
  if (y + dy < 0+r)
    dy = -dy;
  else if (y + dy > HEIGHT -(r+f)) {
    if (x > paddlex && x < paddlex + paddlew) {
      dx = 8 * ((x-(paddlex+paddlew/2))/paddlew);
      dy = -dy;
    }
    else if (y + dy > HEIGHT-r)
      clearInterval(intervalId);
  }
  x += dx;
  y += dy;
}
init_paddle();


var bricks;
var NROWS;
var NCOLS;
var BRICKWIDTH;
var BRICKHEIGHT;
var PADDING;




function initbricks() { //inicializacija opek - polnjenje v tabelo
  NROWS = 5;
  NCOLS = 5;
  BRICKWIDTH = (WIDTH/NCOLS) - 1;
  BRICKHEIGHT = 80;
  PADDING = 1;
  bricks = new Array(NROWS);
  for (i=0; i < NROWS; i++) {
    bricks[i] = new Array(NCOLS);
    for (j=0; j < NCOLS; j++) {
      bricks[i][j] = Math.random() *2 > 0.3?1:0 ;

    }
  }
}

initbricks();


}