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
  musicTitles: [
    'Bosun Bill - Robin Beanland',
    'Sea Shanty 2 - Ian Taylor',
    'Pirates Of The Caribbean - Goblins from Mars'
  ],
  speechSounds: {
    youNeed: new Audio('sfx/not_enough.mp3'),
    moreDoubloons: new Audio('sfx/doubloons.mp3'),
    welcomeStore: new Audio('sfx/welcome.mp3'),
    numbers: []
  },
  currentMusicIndex: 0,
  isMusicPlaying: false,

  init: function () {
    // Initialize number sounds 1-25
    for (let i = 1; i <= 25; i++) {
      this.speechSounds.numbers[i] = new Audio('sfx/numbers/' + i + '.mp3');
    }
    // Set all sounds to loop if needed
    this.backgroundMusic.forEach(music => {
      music.volume = 0.3;
      music.addEventListener('ended', () => this.playNextMusic());
    });
    this.sounds.explosion.volume = 0.3;
    this.sounds.cannonFire.volume = 0.3;
    this.sounds.shipHit.volume = 0.3;
  },

  updateSongTitle: function () {
    $('#song_title').text(this.musicTitles[this.currentMusicIndex]);
  },

  playSoundEffect: function (soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName].currentTime = 0;
      this.sounds[soundName].play().catch(err => console.log('Audio play failed:', err));
    }
  },

  playInsufficientFundsSpeech: function (coinsNeeded) {
    const sounds = [];
    sounds.push(this.speechSounds.youNeed);
    if (coinsNeeded <= 25 && coinsNeeded > 0) {
      sounds.push(this.speechSounds.numbers[coinsNeeded]);
    }
    sounds.push(this.speechSounds.moreDoubloons);

    this.playSequence(sounds);
  },

  playSequence: function (audioArray) {
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

  playBackgroundMusic: function () {
    if (!this.isMusicPlaying) {
      this.isMusicPlaying = true;
      this.currentMusicIndex = Math.floor(Math.random() * this.backgroundMusic.length);
      this.updateSongTitle(); // add this
      this.backgroundMusic[this.currentMusicIndex].play().catch(err => console.log('Music play failed:', err));
    }
  },

  playNextMusic: function () {
    this.currentMusicIndex = Math.floor(Math.random() * this.backgroundMusic.length);
    this.backgroundMusic[this.currentMusicIndex].currentTime = 0;
    this.updateSongTitle(); // add this
    this.backgroundMusic[this.currentMusicIndex].play().catch(err => console.log('Music play failed:', err));
  },

  stopBackgroundMusic: function () {
    this.backgroundMusic.forEach(music => music.pause());
    this.isMusicPlaying = false;
  },

  setVolume: function (type, volume) {
    if (type === 'Music') {
      this.backgroundMusic.forEach(music => music.volume = volume);
    } else if (this.sounds[type]) {
      this.sounds[type].volume = volume;
    }
  }
};