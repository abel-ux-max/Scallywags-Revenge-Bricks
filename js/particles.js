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