var upgradeTiers = {
  cannons: [
    { name: 'Cannons I',   cost: 10, desc: 'Faster cannonballs' },
    { name: 'Cannons II',  cost: 20, desc: 'Even faster!' },
    { name: 'Cannons III', cost: 35, desc: 'Maximum firepower!' }
  ],
  boots: [
    { name: 'Speed Boots I',   cost: 10, desc: 'Faster movement' },
    { name: 'Speed Boots II',  cost: 20, desc: 'Even faster!' },
    { name: 'Speed Boots III', cost: 35, desc: 'Blistering speed!' }
  ]
};

function purchase(item) {
  var currentLevel = upgrades[item];
  var tiers = upgradeTiers[item];

  if (currentLevel >= tiers.length) {
    Swal.fire({
      title: 'Fully Upgraded!',
      text: 'Ye already have the best ' + item + '!',
      icon: 'info',
      confirmButtonText: 'Aye'
    });
    updateStoreDisplay();
    return;
  }

  var tier = tiers[currentLevel];

  if (coins >= tier.cost) {
    coins -= tier.cost;
    upgrades[item]++;
    $('#doubloon_score').text('Doubloons: ' + coins);
    AudioManager.playSoundEffect('purchase');
    updateStoreDisplay(); // update after successful purchase
    Swal.fire({
      title: 'Purchase Successful!',
      html: 'You purchased <strong>' + tier.name + '</strong><br>' + tier.desc + '<br>Doubloons left: ' + coins,
      icon: 'success',
      confirmButtonText: 'Aye!'
    });
  } else {
    const needed = tier.cost - coins;
    AudioManager.playInsufficientFundsSpeech(needed);
    Swal.fire({
      title: 'Not Enough Doubloons!',
      html: 'You need <strong>' + needed + '</strong> more doubloon' + (needed > 1 ? 's' : '') + ' for <strong>' + tier.name + '</strong>.',
      icon: 'error',
      confirmButtonText: 'Back to Plundering'
    });
  }
}
function updateStoreDisplay() {
  ['cannons', 'boots'].forEach(item => {
    var level = upgrades[item];
    var tiers = upgradeTiers[item];
    var btn = document.getElementById('btn_' + item);
    var price = document.getElementById('price_' + item);

    if (level >= tiers.length) {
      btn.textContent = 'Maxed Out';
      btn.disabled = true;
      price.textContent = '';
    } else {
      price.textContent = tiers[level].cost + ' Doubloons';
    }
  });
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
      }, 2650);
    }

    welcomePlayed = true;
  }
}

function showLeaderboard() {
  var scores = getLeaderboard();

  if (scores.length === 0) {
    Swal.fire({
      title: 'Leaderboard',
      html: 'No scores yet... get plundering!',
      confirmButtonText: 'Close'
    });
    return;
  }

  var rows = scores.map((s, i) =>
    '<tr>' +
    '<td>' + (i + 1) + '</td>' +
    '<td>' + s.doubloons + ' doubloons</td>' +
    '<td>' + s.time + 's</td>' +
    '<td>' + (s.won ? 'Victory' : 'Defeat') + '</td>' +
    '<td>' + s.date + '</td>' +
    '</tr>'
  ).join('');

  Swal.fire({
    title: 'Leaderboard',
    html: '<table style="width:100%;text-align:center">' +
          '<tr><th>#</th><th>Doubloons</th><th>Time</th><th>Result</th><th>Date</th></tr>' +
          rows +
          '</table>' +
          '<br><button onclick="clearLeaderboard(); Swal.close();" style="font-size:12px;opacity:0.6">Clear scores</button>',
    confirmButtonText: 'Close',
    width: 600
  });
}