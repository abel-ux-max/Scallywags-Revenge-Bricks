
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
var coins = 0;  // Global coins variable
var upgrades = {
  cannons: false,
  boots: false
};
var gameActive = true;
var gameStartTime = Date.now();

  var welcomePlayed = false;

// Audio Manager
var AudioManager = {
  sounds: {
    explosion: new Audio('sfx/explosion.mp3'),
    cannonFire: new Audio('sfx/cannon-fire.mp3'),
    shipHit: new Audio('sfx/ship-hit.mp3'),
    purchase: new Audio('sfx/purchase.mp3'),
    victory: new Audio('sfx/victory.mp3'),
    gameOver: new Audio('sfx/game-over.mp3')
  },
  backgroundMusic: [
    new Audio('sfx/music/bg-1.mp3'),
    new Audio('sfx/music/bg-2.mp3'),
    new Audio('sfx/music/bg-3.mp3')
  ],
  speechSounds: {
    youNeed: new Audio('sfx/not_enough.mp3'),
    moreDoubloons: new Audio('sfx/doubloons.mp3'),
    welcomeStore: new Audio('sfx/welcome.mp3'),
    numbers: []
  },
  currentMusicIndex: 0,
  isMusicPlaying: false,

  init: function() {
    // Initialize number sounds 1-25
    for (let i = 1; i <= 25; i++) {
      this.speechSounds.numbers[i] = new Audio('sfx/numbers/' + i + '.mp3');
    }
    // Set all sounds to loop if needed
    this.backgroundMusic.forEach(music => {
      music.volume = 0.3;
      music.addEventListener('ended', () => this.playNextMusic());
    });
  },

  playSoundEffect: function(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName].currentTime = 0;
      this.sounds[soundName].play().catch(err => console.log('Audio play failed:', err));
    }
  },

  playInsufficientFundsSpeech: function(coinsNeeded) {
    const sounds = [];
    sounds.push(this.speechSounds.youNeed);
    if (coinsNeeded <= 25 && coinsNeeded > 0) {
      sounds.push(this.speechSounds.numbers[coinsNeeded]);
    }
    sounds.push(this.speechSounds.moreDoubloons);
    
    this.playSequence(sounds);
  },

  playSequence: function(audioArray) {
    let index = 0;
    const playNext = () => {
      if (index < audioArray.length) {
        const audio = audioArray[index];
        audio.currentTime = 0;
        audio.play().catch(err => console.log('Audio play failed:', err));
        audio.onended = () => {
          index++;
          playNext();
        };
      }
    };
    playNext();
  },

  playBackgroundMusic: function() {
    if (!this.isMusicPlaying) {
    this.isMusicPlaying = true;
    this.currentMusicIndex = Math.floor(Math.random() * 3); 
    this.backgroundMusic[this.currentMusicIndex].play().catch(err => console.log('Music play failed:', err));
    }
  },

  playNextMusic: function() {
    this.currentMusicIndex = Math.floor(Math.random() * this.backgroundMusic.length);
    this.backgroundMusic[this.currentMusicIndex].currentTime = 0;
    this.backgroundMusic[this.currentMusicIndex].play().catch(err => console.log('Music play failed:', err));
  },

  stopBackgroundMusic: function() {
    this.backgroundMusic.forEach(music => music.pause());
    this.isMusicPlaying = false;
  },

  setVolume: function(type, volume) {
    if (type === 'Music') {
      this.backgroundMusic.forEach(music => music.volume = volume);
    } else if (this.sounds[type]) {
      this.sounds[type].volume = volume;
    }
  }
};

function attack(e) {
  if (e.key === " ") {
    e.preventDefault();
    if (!ballActive) {
      ballActive = true;
      dx = 0;
      dy = -8;
      AudioManager.playSoundEffect('cannonFire');
    }
  }
}

document.addEventListener("keydown", attack);


function startScreen() {
  Swal.fire({
    title: 'Sea of Doubloons',
    html: 'Destroy the enemy fleet and collect doubloons!<br><br>' +
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
      var cannonOffsetX = wasLeftDown ? 2 : -2;  // Adjust offset based on direction
      x = paddlex + paddlew / 2 + cannonOffsetX;
      y = HEIGHT - paddleh + paddlePadY - 20 + bobOffset;
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
      if (allDestroyed) {
        clearInterval(intervalId);
        winGame();
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

// Store functions
function purchase(item, cost) {
  if (coins >= cost) {
    coins -= cost;
    upgrades[item] = true;
    $('#doubloon_score').text('Doubloons: ' + coins);
    AudioManager.playSoundEffect('purchase');
    Swal.fire({
      title: 'Purchase Successful!',
      html: 'You purchased <strong>' + item + '</strong><br>Doubloons left: ' + coins,
      icon: 'success',
      confirmButtonText: 'Aye!'
    });
    console.log('Purchased:', item);
  } else {
    const needed = cost - coins;
    AudioManager.playInsufficientFundsSpeech(needed);
    Swal.fire({
      title: 'Not Enough Doubloons!',
      html: 'You need <strong>' + needed + '</strong> more doubloon' + (needed > 1 ? 's' : '') + '.',
      icon: 'error',
      confirmButtonText: 'Back to Plundering'
    });
  }
}

function toggleStore() {
  $('#bilge_rat_store').toggleClass('active');

  if ($('#bilge_rat_store').hasClass('active')) {
    var sound = AudioManager.speechSounds.welcomeStore;
    sound.currentTime = 0;
    sound.play().catch(err => console.log('welcome sound error:', err));

    if (welcomePlayed) {
      // Only play 2 seconds on repeat opens
      setTimeout(() => {
        sound.pause();
        sound.currentTime = 0;
      }, 2000);
    }

    welcomePlayed = true;
  }
}

function gameOver() {
  gameActive = false;
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
  gameActive = false;
  AudioManager.stopBackgroundMusic();
  AudioManager.playSoundEffect('victory');
  const timeSecs = Math.floor((Date.now() - gameStartTime) / 1000);
  Swal.fire({
    title: 'Victory!',
    html: 'Ye destroyed all the ships!<br><strong>Doubloons: ' + coins + '</strong><br><strong>Time: ' + timeSecs + 's</strong>',
    icon: 'success',
    confirmButtonText: 'Play Again'
  }).then(() => {
    restartGame();
  });
}

function restartGame() {
  location.reload();
}