
function drawIt() {
var x = 150;
var y = 150;
var dx = 2;
var dy = 4;
var intervalId;
var WIDTH;
var HEIGHT;
var f = 0;
var r=10;
var ctx;
var rightDown = false;
var leftDown = false;


//nastavljanje leve in desne tipke
function onKeyDown(evt) {
  if (evt.keyCode == 39)
rightDown = true;
  else if (evt.keyCode == 37) leftDown = true;
}

function onKeyUp(evt) {
  if (evt.keyCode == 39)
rightDown = false;
  else if (evt.keyCode == 37) leftDown = false;
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
  ctx.arc(x, y, r, 0, Math.PI*2, true);
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
  paddleh = 10;
  paddlew = 75;
}

function draw() {
  clear();
  circle(x, y, 10);
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
rect(paddlex, HEIGHT-paddleh, paddlew, paddleh);

//riši opeke
for (i=0; i < NROWS; i++) {
    ctx.fillStyle = rowcolors[i]; //barvanje vrstic
    for (j=0; j < NCOLS; j++) {
      if (bricks[i][j] == 1) {
        rect((j * (BRICKWIDTH + PADDING)) + PADDING,
            (i * (BRICKHEIGHT + PADDING)) + PADDING,
            BRICKWIDTH, BRICKHEIGHT);
      }
    }
  }

  rowheight = BRICKHEIGHT + PADDING + f/2; //Smo zadeli opeko?
  colwidth = BRICKWIDTH + PADDING + f/2;
  row = Math.floor(y/rowheight);
  col = Math.floor(x/colwidth);
  //Če smo zadeli opeko, vrni povratno kroglo in označi v tabeli, da opeke ni več
if (y < NROWS * rowheight && row >= 0 && col >= 0 && bricks[row][col] == 1) {
dy = -dy; bricks[row][col] = 0;
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
var rowcolors = ["#FF1C0A", "#FFFD0A", "#00A308", "#0008DB", "#EB0093"];
var paddlecolor = "#000000";
var ballcolor = "#333333";



function initbricks() { //inicializacija opek - polnjenje v tabelo
  NROWS = 5;
  NCOLS = 5;
  BRICKWIDTH = (WIDTH/NCOLS) - 1;
  BRICKHEIGHT = 15;
  PADDING = 1;
  bricks = new Array(NROWS);
  for (i=0; i < NROWS; i++) {
    bricks[i] = new Array(NCOLS);
    for (j=0; j < NCOLS; j++) {
      bricks[i][j] = 1;
    }
  }
}

initbricks();


}