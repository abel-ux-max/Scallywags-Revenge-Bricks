function startScreen() {
  Swal.fire({
    title: 'Scallywag\'s Revenge',
    html: 'Destroy the enemy fleet, collect doubloons and take your revenge!<br><br>' +
      '<strong>A / D</strong> or <strong>ARROWS</strong> to move<br>' +
      '<strong>Space</strong> to fire',
    confirmButtonText: 'Set Sail!',
    allowOutsideClick: false,
    allowEscapeKey: false,
    preConfirm: () => {
      AudioManager.init();
      AudioManager.playBackgroundMusic(); // runs directly on button click
      console.log(AudioManager.speechSounds.welcomeStore.src);
    }
  }).then(() => {
    drawIt();
  });
}



function drawIt() {
  console.log(AudioManager.speechSounds.welcomeStore.src);
  var x = $("#canvas").width() / 2;
  var y = $("#canvas").height() - 100;
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
  var speed = 5 + (upgrades.boots * 3);

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
  ball.src = "img/ball.png";
  var goldenShip = new Image();
  goldenShip.src = "img/goldenShip.png";
  var goldenShipDamaged1 = new Image();
  goldenShipDamaged1.src = "img/goldenShipD1.png";
  var goldenShipDamaged2 = new Image();
  goldenShipDamaged2.src = "img/goldenShipD2.png";


  var ships = [
    goldenShip,
    ship
  ];

  var goldenShipVariants = [
    goldenShip,
    goldenShipDamaged1,
    goldenShipDamaged2
  ];

  var idleFrames = [1, 2, 3].map(i => {
    var img = new Image();
    img.src = "img/player/idle" + i + ".png";
    return img;
  }).concat([player, player, player]);

  var moveFrames = [1, 2, 3].map(i => {
    var img = new Image();
    img.src = "img/player/moving" + i + ".png";
    return img;
  });

  var frameIndex = 0;
  var frameTick = 0;
  var FRAME_SPEED = 13;







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
    if (startLevel2) {
      startLevel2 = false;
      initLevel2();
    }
    clear();

    // Calculate bob animation for all sprites
    var bobOffset = Math.sin(Date.now() / 200) * 2;

    // Keep ball with paddle when not active, with bobbing animation
    if (!ballActive) {
      var cannonOffsetX = wasLeftDown ? 2 : -2;  // Adjust offset based on direction
      x = paddlex + paddlew / 2 + cannonOffsetX;
      y = HEIGHT - paddleh + paddlePadY - 20 + bobOffset;
    }

    circle(x, y, r);

    var moving = false;

    if (rightDown) {
      if ((paddlex + paddlew) < WIDTH) {
        paddlex += 5 + (upgrades.boots * 3);
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
        paddlex -= 5 + (upgrades.boots * 3);
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
          var shipImage;
          if (bricks[i][j] === 0) {
            // Golden ship - select sprite based on HP
            var hpIndex = Math.max(0, 3 - shipHP[i][j]);  // 4HP=0, 3HP=1, 2HP=2, 1HP=3(but max is 2)
            hpIndex = Math.min(hpIndex, 2);
            shipImage = goldenShipVariants[hpIndex];
          } else {
            // Regular ship
            shipImage = ships[bricks[i][j]];
          }

          if (flips[i][j]) {
            ctx.translate(bx + BRICKWIDTH, by);
            ctx.scale(-1, 1);
            ctx.drawImage(shipImage, 0, 0, BRICKWIDTH, BRICKHEIGHT);
          } else {
            ctx.drawImage(shipImage, bx, by, BRICKWIDTH, BRICKHEIGHT);
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

      var bx = (col * (BRICKWIDTH + PADDING)) + PADDING + BRICKWIDTH / 2;
      var by = (row * (BRICKHEIGHT + PADDING)) + PADDING + BRICKHEIGHT / 2;

      // Handle HP for golden ships
      if (bricks[row][col] === 0) {
        shipHP[row][col]--;
        AudioManager.playSoundEffect('shipHit');
        if (shipHP[row][col] <= 0) {
          bricks[row][col] = -1;
          coins += 5;  // Golden ships give 5 coins
          AudioManager.playSoundEffect('explosion');
          createExplosion(bx, by, 200);
        }
      } else {
        bricks[row][col] = -1;
        coins += 1;  // Regular ships give 1 coin
        AudioManager.playSoundEffect('explosion');
        createExplosion(bx, by, 200);
      }

      dx = 0;
      dy = 0;
      ballActive = false;
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
      else if (y + dy > HEIGHT - r) {
        clearInterval(intervalId);
        gameOver();
      }
    }
    x += dx;
    y += dy;

    // Update coins display
    $('#doubloon_score').text('Doubloons: ' + coins);

    // Check for win condition (all ships destroyed)
    if (gameActive) {
      let allDestroyed = true;
      for (let i = 0; i < NROWS; i++) {
        for (let j = 0; j < NCOLS; j++) {
          if (bricks[i][j] !== -1) {
            allDestroyed = false;
            break;
          }
        }
        if (!allDestroyed) break;
      }



      if (level === 1) {
        updateBoss(ctx, WIDTH, HEIGHT, paddlex, paddlew, paddleh, bobOffset, ball, ballActive);
        if (checkBossHit(x, y, r)) {
          dy = -dy;
        }
      } else if (level === 2) {
        updateBlackbeard(ctx, WIDTH, HEIGHT, paddlex, paddlew, paddleh, bobOffset, ball);
        if (checkBlackbeardHit(x, y, r)) {
          dy = -dy;
        }
      }

      if (allDestroyed && !bossSpawned) {
        bossSpawned = true;
        if (level === 1) {
          initBoss(WIDTH);
        } else if (level === 2) {
          initBlackbeard(WIDTH);
        }
      }
    }
  }
  init_paddle();


  var bricks;
  var flips;
  var bobOffsets;
  var shipHP;  // Track HP for golden ships
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
    shipHP = new Array(NROWS);
    for (i = 0; i < NROWS; i++) {
      bricks[i] = new Array(NCOLS);
      flips[i] = new Array(NCOLS);
      bobOffsets[i] = new Array(NCOLS);
      shipHP[i] = new Array(NCOLS);
      for (j = 0; j < NCOLS; j++) {
        bricks[i][j] = Math.random() * 2 > 0.3 ? 1 : 0;
        flips[i][j] = Math.random() > 0.5;
        bobOffsets[i][j] = Math.random() * Math.PI * 2;  // Random phase 0-2π
        shipHP[i][j] = bricks[i][j] === 0 ? 3 : 1;  // Golden ships (0) have 3 HP, regular ships (1) have 1 HP
      }
    }
  }

  initbricks();

  function initLevel2() {
    var blackShip = new Image();
    blackShip.src = "img/blackSailShip.png";
    var blackShipGolden = new Image();
    blackShipGolden.src = "img/goldenShip.png"; // reuse golden ship

    // Override ships array for level 2
    ships[1] = blackShip;

    NROWS = 5; //5
    NCOLS = 10; //10
    BRICKWIDTH = (WIDTH / NCOLS) - 1;
    BRICKHEIGHT = 80;
    PADDING = 1;

    bricks = new Array(NROWS);
    flips = new Array(NROWS);
    bobOffsets = new Array(NROWS);
    shipHP = new Array(NROWS);

    for (i = 0; i < NROWS; i++) {
      bricks[i] = new Array(NCOLS);
      flips[i] = new Array(NCOLS);
      bobOffsets[i] = new Array(NCOLS);
      shipHP[i] = new Array(NCOLS);
      for (j = 0; j < NCOLS; j++) {
        bricks[i][j] = Math.random() * 2 > 0.3 ? 1 : 0;
        flips[i][j] = Math.random() > 0.5;
        bobOffsets[i][j] = Math.random() * Math.PI * 2;
        // Black sail ships take 2 hits, golden still 3
        shipHP[i][j] = bricks[i][j] === 0 ? 3 : 2;
      }
    }
  }

}



function gameOver() {
  gameActive = false;
  const timeSecs = Math.floor((Date.now() - gameStartTime) / 1000);
  saveScore(coins, timeSecs, false);
  AudioManager.stopBackgroundMusic();
  AudioManager.playSoundEffect('gameOver');
  Swal.fire({
    title: 'Game Over!',
    html: 'Ye lost the battle!<br><strong>Doubloons Earned: ' + coins + '</strong>',
    icon: 'error',
    confirmButtonText: 'Try Again'
  }).then(() => {
    restartGame();
  });
}

function winGame() {
  if (level === 1) {
    boss.active = false;
    allDestroyed = false;
    boss.projectiles = [];
    gameActive = true;

    Swal.fire({
      title: 'The Fleet Approaches!',
      html: 'Ye defeated Redbeard!<br>But Blackbeard\'s crew has arrived...<br><strong>Black sails on the horizon!</strong>',
      confirmButtonText: 'Fight On!',
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(() => {
      startLevel2 = true;
      level = 2; 
      bossSpawned = false;
      bossDefeated = false;
      startLevel2 = true;
    });
    return;
  }

  // Level 2 win — true victory
  gameActive = false;
  AudioManager.stopBackgroundMusic();
  AudioManager.playSoundEffect('victory');
  const timeSecs = Math.floor((Date.now() - gameStartTime) / 1000);

  // Save to leaderboard
saveScore(coins, timeSecs, true);

  Swal.fire({
    title: 'Victory! Blackbeard is Defeated!',
    html: 'Scallywag has his revenge!<br><strong>Doubloons: ' + coins + '</strong><br><strong>Time: ' + timeSecs + 's</strong> <br> <strong> Made by Abel Elersič </strong>',
    icon: 'success',
    confirmButtonText: 'Play Again'
  }).then(() => {
    restartGame();
  });
}


function restartGame() {
  location.reload();
}

function attack(e) {
  if (e.key === " ") {
    e.preventDefault();
    if (!ballActive) {
      ballActive = true;
      dx = 0;
      dy = -(8 + (upgrades.cannons * 4));
      AudioManager.playSoundEffect('cannonFire');
    }
  }
}

document.addEventListener("keydown", attack);

function createExplosion(x, y, count = 15) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, 'explosion'));
  }
}



