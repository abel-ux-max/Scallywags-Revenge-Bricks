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

boss.image.src = "img/redBeard.png";


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
  ctx.save();
  if (boss.direction === -1) {
    ctx.translate(boss.x + boss.width, boss.y + bobOffset);
    ctx.scale(-1, 1);
    ctx.drawImage(boss.image, 0, 0, boss.width, boss.height);
  } else {
    ctx.drawImage(boss.image, boss.x, boss.y + bobOffset, boss.width, boss.height);
  }
  ctx.restore();

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