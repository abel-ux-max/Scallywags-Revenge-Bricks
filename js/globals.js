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
  cannons: 0,
  boots: 0
};
var gameActive = true;
var gameStartTime = Date.now();
var welcomePlayed = false;
var level = 1;
var startLevel2 = false;
var bossSpawned = false;
var bossDefeated = false;
var intervalId; 
var particles = []; 


function saveScore(doubloons, time, won) {
  var scores = JSON.parse(localStorage.getItem('scallywag_scores') || '[]');
  scores.push({
    doubloons: doubloons,
    time: time,
    won: won,
    date: new Date().toLocaleDateString()
  });
  scores.sort((a, b) => b.doubloons - a.doubloons);
  scores = scores.slice(0, 10); // keep top 10
  localStorage.setItem('scallywag_scores', JSON.stringify(scores));
}

function getLeaderboard() {
  return JSON.parse(localStorage.getItem('scallywag_scores') || '[]');
}

function clearLeaderboard() {
  localStorage.removeItem('scallywag_scores');
}