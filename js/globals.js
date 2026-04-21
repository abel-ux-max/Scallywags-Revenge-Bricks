//prevent zooming on ctrl + scroll and pinch
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
var bossSpawned = false;
var intervalId; 
var particles = []; 