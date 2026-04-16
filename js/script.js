
// prepreči zoomiranje s ctrl + scroll
document.addEventListener('wheel', function (e) {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

document.addEventListener('gesturestart', function (e) {
  e.preventDefault();
});


var ballActive = false;
var dx = 0;
var dy = 0;

function attack(e) {
  if (e.key === " ") {
    e.preventDefault();
    if (!ballActive) {
      ballActive = true;
      dx = 0;
      dy = -8;
    }
  }
}

document.addEventListener("keydown", attack);

function drawIt() {
  var x = $("#canvas").width() / 2;
  var y = $("#canvas").height() - 100;
  var intervalId;
  var WIDTH;
  var HEIGHT;
  var f = 0;
  var r = 10;
  var ctx;
  var rightDown = false;
  var leftDown = false;
  var wasLeftDown = false;
  var wasMoving = false;
  var paddleHeight = 120;
  var paddleWidth = 120;
  var particles = [];

  //nastavitve za razmik med elementi
  var ballPad = 6;
  var paddlePadX = 10;
  var paddlePadY = 27;
  var brickPadX = 4;
  var brickPadY = 4;

  //deklaracija in inicializacija slike
  var ship = new Image();
  ship.src = "img/enemyShip.png";
  var player = new Image();
  player.src = "img/player/main.png";
  var ball = new Image();
  ball.src = "img/ball.png"
  var goldenShip = new Image();
  goldenShip.src = "img/goldenShip.png";


  var ships = [
    goldenShip,
    ship
  ];

  var idleFrames = [1, 2, 3].map(i => {
    var img = new Image();
    img.src = "img/player/idle" + i + ".png";
    return img;
  }).concat([player, player, player]);

  var moveFrames = [1, 2].map(i => {
    var img = new Image();
    img.src = "img/player/moving" + i + ".png";
    return img;
  }).concat([player, player, player]);

  var frameIndex = 0;
  var frameTick = 0;
  var FRAME_SPEED = 10;







  //nastavljanje leve in desne tipke
  function onKeyDown(evt) {
    if (evt.keyCode == 39 || evt.key === "d")
      rightDown = true;
    else if (evt.keyCode == 37 || evt.key === "a") leftDown = true;
  }

  function onKeyUp(evt) {
    if (evt.keyCode == 39 || evt.key === "d")
      rightDown = false;
    else if (evt.keyCode == 37 || evt.key === "a") leftDown = false;
  }
  $(document).keydown(onKeyDown);
  $(document).keyup(onKeyUp);

  function init() {
    ctx = $('#canvas')[0].getContext("2d");
    WIDTH = $("#canvas").width();
    HEIGHT = $("#canvas").height();
    intervalId = setInterval(draw, 10);
    return intervalId;
  }

  function circle(x, y, r) {
    ctx.beginPath();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(ball, x - r, y - r, r * 2, r * 2);
    ctx.closePath();
    ctx.fill();
  }

  function rect(x, y, w, h) {
    ctx.beginPath();
    ctx.imageSmoothingEnabled = false;
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
  }

  function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
  }


  init();

  var paddlex;
  var paddleh;
  var paddlew;


  function init_paddle() {
    paddlex = WIDTH / 2 - paddleWidth / 2;
    paddleh = paddleHeight;
    paddlew = paddleWidth;
  }

  function draw() {
    clear();

    // Calculate bob animation for all sprites
    var bobOffset = Math.sin(Date.now() / 200) * 2;

    // Keep ball with paddle when not active, with bobbing animation
    if (!ballActive) {
      x = paddlex + paddlew / 2;
      y = HEIGHT - paddleh + paddlePadY - 5 + bobOffset;
    }

    circle(x, y, r);

    var moving = false;

    if (rightDown) {
      if ((paddlex + paddlew) < WIDTH) {
        paddlex += 5;
        moving = true;
        wasLeftDown = false;
      } else {
        paddlex = WIDTH - paddlew;
      }
    }
    else if (leftDown) {
      wasLeftDown = true;
      moving = true;
      if (paddlex > 0) {
        paddlex -= 5;
      } else {
        paddlex = 0;
      }
    }

    //animacija premikanja ladje


    frameTick++;
    if (frameTick >= FRAME_SPEED) {
      frameTick = 0;
      var frames = moving ? moveFrames : idleFrames;
      frameIndex = (frameIndex + 1) % frames.length;
    }

    if (moving !== wasMoving) {
      frameIndex = 0;
      frameTick = 0;
      wasMoving = moving;
    }


    var currentFrame = moving ? moveFrames[frameIndex] : idleFrames[frameIndex];

    ctx.save();
    ctx.translate(paddlex + paddlew / 2, HEIGHT - paddleh + paddleh / 2 + bobOffset);
    if (wasLeftDown) ctx.scale(-1, 1);
    ctx.drawImage(currentFrame, -paddlew / 2, -paddleh / 2, paddlew, paddleh);
    ctx.restore();

    //riši opeke
    for (i = 0; i < NROWS; i++) {

      for (j = 0; j < NCOLS; j++) {
        if (bricks[i][j] == 0 || bricks[i][j] == 1) {
          ctx.imageSmoothingEnabled = false;
          var bx = (j * (BRICKWIDTH + PADDING)) + PADDING;
          var by = (i * (BRICKHEIGHT + PADDING)) + PADDING + Math.sin(Date.now() / 400 + bobOffsets[i][j]) * 1;  // Random bob animation

          ctx.save();
          if (flips[i][j]) {
            ctx.translate(bx + BRICKWIDTH, by);
            ctx.scale(-1, 1);
            ctx.drawImage(ships[bricks[i][j]], 0, 0, BRICKWIDTH, BRICKHEIGHT);
          } else {
            ctx.drawImage(ships[bricks[i][j]], bx, by, BRICKWIDTH, BRICKHEIGHT);
          }
          ctx.restore();
        }
      }
    }

    rowheight = BRICKHEIGHT + PADDING + f / 2; //Smo zadeli opeko?
    colwidth = BRICKWIDTH + PADDING + f / 2;
    row = Math.floor((y - PADDING - brickPadY) / rowheight);
    col = Math.floor((x - PADDING - brickPadX) / colwidth);


    // Effekti - dodajanje delcev in posodabljanje njihovega stanja

    function createExplosion(x, y, count = 15) {
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, 'explosion'));
      }
    }

    particles = particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;

      if (p.life > 0) {
        ctx.fillStyle = p.color || `rgba(255, 200, 100, ${p.life * 0.5})`;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        return true;
      }
      return false;
    });


    if (ballActive) {
      particles.push(new Particle(x, y));
    }

    //Če smo zadeli opeko, vrni povratno kroglo in označi v tabeli, da opeke ni več
    if (y < NROWS * rowheight && row >= 0 && col >= 0 && bricks[row][col] !== -1) {
      y = HEIGHT - paddleHeight;
      x = paddlex + (paddleWidth / 2);
      bricks[row][col] = -1;
      dx = 0;
      dy = 0;
      ballActive = false;

      var bx = (col * (BRICKWIDTH + PADDING)) + PADDING + BRICKWIDTH / 2;
      var by = (row * (BRICKHEIGHT + PADDING)) + PADDING + BRICKHEIGHT / 2;
      createExplosion(bx, by, 200);
    }
    if (x + dx > WIDTH - (r - ballPad) || x + dx < 0 + (r - ballPad))
      dx = -dx;
    if (y + dy < 0 + (r - ballPad))
      dy = -dy;
    else if (y + dy + (r - ballPad) > HEIGHT - (paddleh - paddlePadY)) {
      if (x > paddlex + paddlePadX && x < paddlex + paddlew - paddlePadX) {
        dx = 8 * ((x - (paddlex + paddlew / 2)) / paddlew);
        dy = -dy;
      }
      else if (y + dy > HEIGHT - r)
        clearInterval(intervalId);
    }
    x += dx;
    y += dy;
  }
  init_paddle();


  var bricks;
  var flips;
  var bobOffsets;
  var NROWS;
  var NCOLS;
  var BRICKWIDTH;
  var BRICKHEIGHT;
  var PADDING;




  function initbricks() { //inicializacija opek - polnjenje v tabelo
    NROWS = 5;
    NCOLS = 10;
    BRICKWIDTH = (WIDTH / NCOLS) - 1;
    BRICKHEIGHT = 80;
    PADDING = 1;
    bricks = new Array(NROWS);
    flips = new Array(NROWS);
    bobOffsets = new Array(NROWS);
    for (i = 0; i < NROWS; i++) {
      bricks[i] = new Array(NCOLS);
      flips[i] = new Array(NCOLS);
      bobOffsets[i] = new Array(NCOLS);
      for (j = 0; j < NCOLS; j++) {
        bricks[i][j] = Math.random() * 2 > 0.3 ? 1 : 0;
        flips[i][j] = Math.random() > 0.5;
        bobOffsets[i][j] = Math.random() * Math.PI * 2;  // Random phase 0-2π
      }
    }
  }

  initbricks();


}


//particle objectt
function Particle(x, y, type = 'trail') {
  this.x = x;
  this.y = y;

  if (type === 'trail') {
    // Smoke trail particles
    this.vx = (Math.random() - 0.5) * 3;
    this.vy = (Math.random() - 0.5) * 3;
    this.size = Math.random() * 3 + 2;
    this.color = `rgba(255, 200, 100, ${Math.random() * 0.5 + 0.3})`;
  } else if (type === 'explosion') {
    // Explosion burst
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 4;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.size = Math.random() * 6 + 3;
    const colors = ['rgba(255, 150, 0, 0.8)', 'rgba(255, 100, 0, 0.8)', 'rgba(255, 200, 0, 0.8)'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  this.life = 1;
}
