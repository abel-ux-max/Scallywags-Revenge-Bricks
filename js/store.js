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
      }, 2650);
    }

    welcomePlayed = true;
  }
}