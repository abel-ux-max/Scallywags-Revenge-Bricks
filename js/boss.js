var boss = {
  x: 0,
  y: 100,
  width: 200,
  height: 125,
  hp: 10,
  maxHp: 10,
  speed: 2,
  direction: 1,
  active: false,
  projectiles: [],
  shootTimer: 0,
  shootInterval: 120,
  image: new Image()
};



function initBoss(WIDTH) {
  boss.x = WIDTH / 2 - boss.width / 2;
  boss.active = true;
  boss.hp = boss.maxHp;
  boss.projectiles = [];
}

function updateBoss(ctx, WIDTH, HEIGHT, paddlex, paddlew, paddleh, bobOffset, ballImg, ballActive) {
  if (!boss.active) return;

  // Movement — bounces side to side
  boss.x += boss.speed * boss.direction;
  if (boss.x + boss.width > WIDTH || boss.x < 0) {
    boss.direction *= -1;
  }

  // Draw boss
  var bossMoving = true;

  bossFrameTick++;
  if (bossFrameTick >= BOSS_FRAME_SPEED) {
    bossFrameTick = 0;
    var bossFrames = bossMoving ? bossMoveFrames : bossIdleFrames;
    bossFrameIndex = (bossFrameIndex + 1) % bossFrames.length;
  }

  if (bossMoving !== bossWasMoving) {
    bossFrameIndex = 0;
    bossFrameTick = 0;
    bossWasMoving = bossMoving;
  }

  var bossCurrent = bossMoving ? bossMoveFrames[bossFrameIndex] : bossIdleFrames[bossFrameIndex];

  // Draw boss
  ctx.save();
  ctx.translate(boss.x + boss.width / 2, boss.y + boss.height / 2 + bobOffset);
  if (boss.direction === -1) ctx.scale(-1, 1);
  if (!bossCurrent || !bossCurrent.complete) {
    ctx.restore();
  } else {
    ctx.drawImage(bossCurrent, -boss.width / 2, -boss.height / 2, boss.width, boss.height);
    ctx.restore();
  }

  // Draw HP bar
  var barWidth = 300;
  var barX = WIDTH / 2 - barWidth / 2;
  ctx.fillStyle = 'red';
  ctx.fillRect(barX, 20, barWidth, 16);
  ctx.fillStyle = 'green';
  ctx.fillRect(barX, 20, barWidth * (boss.hp / boss.maxHp), 16);
  ctx.strokeStyle = 'white';
  ctx.strokeRect(barX, 20, barWidth, 16);

  // Shooting
  boss.shootTimer++;
  if (boss.shootTimer >= boss.shootInterval) {
    boss.shootTimer = 0;
    boss.projectiles.push({
      x: boss.x + boss.width / 2,
      y: boss.y + boss.height,
      speed: 4
    });
  }


  // Update and draw projectiles
  boss.projectiles = boss.projectiles.filter(p => {
    p.y += p.speed;

    particles.push(new Particle(p.x, p.y));

    ctx.drawImage(ballImg, p.x - 10, p.y - 10, 20, 20);


    // Hit player check
    if (
      p.x > paddlex && p.x < paddlex + paddlew &&
      p.y > HEIGHT - paddleh
    ) {
      createExplosion(p.x, p.y, 80);

      setTimeout(() => {
        clearInterval(intervalId);
        gameOver();
      }, 150);
      return false;
    }

    return p.y < HEIGHT;
  });
}



function checkBossHit(x, y, r) {
  if (!boss.active) return false;

  if (
    x + r > boss.x &&
    x - r < boss.x + boss.width &&
    y - r < boss.y + boss.height &&
    y + r > boss.y
  ) {
    boss.hp--;
    AudioManager.playSoundEffect('shipHit');
    ballActive = false;
    if (boss.hp <= 0) {
      boss.active = false;
      coins += 20;
      AudioManager.playSoundEffect('explosion');
      winGame();
    }
    return true; // ball bounces
  }
  return false;
}


// Boss animation frames
var bossMain = new Image();
bossMain.src = "img/redb/idle.png";

var bossIdleFrames = [1, 2, 3].map(i => {
  var img = new Image();
  img.src = "img/redb/idle" + i + ".png";
  return img;
}).concat([bossMain, bossMain, bossMain]);

var bossMoveFrames = [1, 2, 3].map(i => {
  var img = new Image();
  img.src = "img/redb/moving" + i + ".png";
  return img;
});

var bossFrameIndex = 0;
var bossFrameTick = 0;
var BOSS_FRAME_SPEED = 13;
var bossWasMoving = false;





var blackbeard = {
  x: 0,
  y: 80,
  width: 200,
  height: 125,
  hp: 15,
  maxHp: 15,
  speed: 3,
  direction: 1,
  active: false,
  projectiles: [],
  shootTimer: 0,
  shootInterval: 90, // shoots faster than Redbeard
  image: new Image()
};

blackbeard.image.src = "img/blackb/main.png";

// Animation frames
var bbMain = new Image();
bbMain.src = "img/blackb/main.png";

var bbIdleFrames = [1, 2, 3].map(i => {
  var img = new Image();
  img.src = "img/blackb/idle" + i + ".png";
  return img;
}).concat([bbMain, bbMain, bbMain]);

var bbMoveFrames = [1, 2, 3].map(i => {
  var img = new Image();
  img.src = "img/blackb/moving" + i + ".png";
  return img;
});

var bbFrameIndex = 0;
var bbFrameTick = 0;
var BB_FRAME_SPEED = 13;
var bbWasMoving = false;

function initBlackbeard(WIDTH) {
  blackbeard.x = WIDTH / 2 - blackbeard.width / 2;
  blackbeard.active = true;
  blackbeard.hp = blackbeard.maxHp;
  blackbeard.projectiles = [];
}

function updateBlackbeard(ctx, WIDTH, HEIGHT, paddlex, paddlew, paddleh, bobOffset, ballImg) {
  if (!blackbeard.active) return;

  // Speed increases as HP drops
  blackbeard.speed = 3 + (1 - blackbeard.hp / blackbeard.maxHp) * 4;

  // Movement
  blackbeard.x += blackbeard.speed * blackbeard.direction;
  if (blackbeard.x + blackbeard.width > WIDTH || blackbeard.x < 0) {
    blackbeard.direction *= -1;
  }

  // Animation
  var bbMoving = true;
  bbFrameTick++;
  if (bbFrameTick >= BB_FRAME_SPEED) {
    bbFrameTick = 0;
    bbFrameIndex = (bbFrameIndex + 1) % bbMoveFrames.length;
  }

  var bbCurrent = bbMoveFrames[bbFrameIndex];

  // Draw Blackbeard
  ctx.save();
  ctx.translate(blackbeard.x + blackbeard.width / 2, blackbeard.y + blackbeard.height / 2 + bobOffset);
  if (blackbeard.direction === -1) ctx.scale(-1, 1);
  if (bbCurrent && bbCurrent.complete) {
    ctx.drawImage(bbCurrent, -blackbeard.width / 2, -blackbeard.height / 2, blackbeard.width, blackbeard.height);
  }
  ctx.restore();

  // HP bar
 var barWidth = 300;
var barX = WIDTH / 2 - barWidth / 2;
ctx.fillStyle = 'red';
ctx.fillRect(barX, 20, barWidth, 16);
ctx.fillStyle = 'green';
ctx.fillRect(barX, 20, barWidth * (blackbeard.hp / blackbeard.maxHp), 16);
ctx.strokeStyle = 'white';
ctx.strokeRect(barX, 20, barWidth, 16);

  // Three cannons shoot at once
  blackbeard.shootTimer++;
  if (blackbeard.shootTimer >= blackbeard.shootInterval) {
    blackbeard.shootTimer = 0;
    // Left cannon, center cannon, right cannon
    [-50, 0, 50].forEach(offset => {
      blackbeard.projectiles.push({
        x: blackbeard.x + blackbeard.width / 2 + offset,
        y: blackbeard.y + blackbeard.height,
        speed: 5
      });
    });
  }

  // Update and draw projectiles
  blackbeard.projectiles = blackbeard.projectiles.filter(p => {
    p.y += p.speed;
    particles.push(new Particle(p.x, p.y));
    ctx.drawImage(ballImg, p.x - 10, p.y - 10, 20, 20);

    if (
      p.x > paddlex && p.x < paddlex + paddlew &&
      p.y > HEIGHT - paddleh
    ) {
      createExplosion(p.x, p.y, 80);
      setTimeout(() => {
        clearInterval(intervalId);
        gameOver();
      }, 250);
      return false;
    }

    return p.y < HEIGHT;
  });
}

function checkBlackbeardHit(x, y, r) {
  if (!blackbeard.active) return false;
  if (blackbeard.hitCooldown > 0) {
    blackbeard.hitCooldown--;
    return false;
  }

  if (
    x + r > blackbeard.x &&
    x - r < blackbeard.x + blackbeard.width &&
    y - r < blackbeard.y + blackbeard.height &&
    y + r > blackbeard.y
  ) {
    blackbeard.hitCooldown = 30;
    blackbeard.hp--;
    AudioManager.playSoundEffect('shipHit');

    // Return ball to player
    dx = 0;
    dy = 0;
    ballActive = false;

    if (blackbeard.hp <= 0) {
      blackbeard.active = false;
      coins += 50;
      createExplosion(blackbeard.x + blackbeard.width / 2, blackbeard.y + blackbeard.height / 2, 400);
      AudioManager.playSoundEffect('explosion');
      setTimeout(() => winGame(), 1000);
    }
    return true;
  }
  return false;
}