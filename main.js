const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
  x: canvas.width / 2 - 15,
  y: canvas.height - 30,
  width: 30,
  height: 30,
  speed: 5,
  bullets: [],
  health: 100,
  points: 0 // Initialize points
};

const crosshair = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

const keys = {
  a: false,
  d: false,
  w: false,
  s: false
};

let enemies = [];
const enemyWidth = 30;
const enemyHeight = 30;
const enemySpeed = 1;
const directionChangeInterval = 100; // Enemies change direction every 100 frames
const respawnTime = 2000; // Time in milliseconds before respawning an enemy
const enemyHealth = 50; // Health for each enemy
const greenEnemyHealth = 30; // Health for green enemies
const healthGainOnKill = 5; // Health gained when an enemy is killed
const maxPlayerHealth = 100; // Maximum player health

// Function to create enemies
function spawnEnemies(count) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * (canvas.width - enemyWidth);
    const y = Math.random() * (canvas.height - enemyHeight);
    const direction = Math.random() * 2 * Math.PI; // Random direction in radians
    enemies.push({
      x: x,
      y: y,
      width: enemyWidth,
      height: enemyHeight,
      speed: enemySpeed,
      direction: direction,
      health: enemyHealth,
      type: 'normal' // Type of enemy
    });
  }
}

// Function to spawn green enemies
function spawnGreenEnemies(count) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * (canvas.width - enemyWidth);
    const y = Math.random() * (canvas.height - enemyHeight);
    const direction = Math.random() * 2 * Math.PI; // Random direction in radians
    enemies.push({
      x: x,
      y: y,
      width: enemyWidth,
      height: enemyHeight,
      speed: enemySpeed,
      direction: direction,
      health: greenEnemyHealth,
      type: 'green' // Type of enemy
    });
  }
}

// Initial spawn of enemies
spawnEnemies(10);
spawnGreenEnemies(5); // Spawn 5 green enemies

document.addEventListener('keydown', (e) => {
  if (e.key === 'a' || e.key === 'A') keys.a = true;
  if (e.key === 'd' || e.key === 'D') keys.d = true;
  if (e.key === 'w' || e.key === 'W') keys.w = true;
  if (e.key === 's' || e.key === 'S') keys.s = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'a' || e.key === 'A') keys.a = false;
  if (e.key === 'd' || e.key === 'D') keys.d = false;
  if (e.key === 'w' || e.key === 'W') keys.w = false;
  if (e.key === 's' || e.key === 'S') keys.s = false;
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  crosshair.x = e.clientX - rect.left;
  crosshair.y = e.clientY - rect.top;
});

canvas.addEventListener('click', () => {
  shootBullet();
});

function update() {
  if (keys.a && player.x > 0) player.x -= player.speed;
  if (keys.d && player.x < canvas.width - player.width) player.x += player.speed;
  if (keys.w && player.y > 0) player.y -= player.speed;
  if (keys.s && player.y < canvas.height - player.height) player.y += player.speed;

  player.bullets = player.bullets.filter(bullet => bullet.x > 0 && bullet.x < canvas.width && bullet.y > 0 && bullet.y < canvas.height);
  player.bullets.forEach(bullet => {
    bullet.x += bullet.dx * bullet.speed;
    bullet.y += bullet.dy * bullet.speed;
  });

  enemies.forEach((enemy, index) => {
    // Random movement AI
    enemy.frames++;
    if (enemy.frames % directionChangeInterval === 0) {
      enemy.direction = Math.random() * 2 * Math.PI; // New random direction
    }
    enemy.x += Math.cos(enemy.direction) * enemy.speed;
    enemy.y += Math.sin(enemy.direction) * enemy.speed;

    // Ensure enemies stay within canvas bounds
    if (enemy.x < 0) enemy.x = 0;
    if (enemy.x > canvas.width - enemy.width) enemy.x = canvas.width - enemy.width;
    if (enemy.y < 0) enemy.y = 0;
    if (enemy.y > canvas.height - enemy.height) enemy.y = canvas.height - enemy.height;

    // Check for bullet collision
    player.bullets.forEach(bullet => {
      if (bullet.active && 
          bullet.x < enemy.x + enemy.width && 
          bullet.x + bullet.width > enemy.x && 
          bullet.y < enemy.y + enemy.height && 
          bullet.y + bullet.height > enemy.y) {
        
        enemy.health -= 10; // Decrease enemy health
        bullet.active = false; // Mark the bullet as inactive

        // Check if enemy is dead
        if (enemy.health <= 0) {
          if (enemy.type === 'green') {
            player.points += 10; // Increase points for green enemy
          }
          player.health = Math.min(player.health + healthGainOnKill, maxPlayerHealth); // Gain health on kill
          setTimeout(() => {
            respawnEnemy(enemy);
          }, respawnTime);
          enemies.splice(index, 1);
        }
      }
    });

    // Check for player collision with enemy
    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      player.health -= 10; // Decrease player health
      // Optional: Move player away from enemy to avoid multiple hits in one frame
      player.x += player.speed; // Move the player a bit away
    }
  });

  // Check player health (you can implement game over logic here)
  if (player.health <= 0) {
    alert("Game Over! You have been defeated.");
    document.location.reload(); // Reload the game
  }
}

function respawnEnemy(oldEnemy) {
  const x = Math.random() * (canvas.width - enemyWidth);
  const y = Math.random() * (canvas.height - enemyHeight);
  const direction = Math.random() * 2 * Math.PI; // Random direction in radians

  enemies.push({
    x: x,
    y: y,
    width: enemyWidth,
    height: enemyHeight,
    speed: enemySpeed,
    direction: direction,
    health: oldEnemy.type === 'green' ? greenEnemyHealth : enemyHealth, // Use correct health based on enemy type
    type: oldEnemy.type // Keep the type for respawned enemy
  });
}

// Function to shoot bullets
function shootBullet() {
  const dx = crosshair.x - player.x;
  const dy = crosshair.y - player.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const speed = 5; // Bullet speed

  player.bullets.push({
    x: player.x + player.width / 2,
    y: player.y,
    dx: dx / length,
    dy: dy / length,
    speed: speed,
    width: 5,
    height: 5,
    active: true // Mark the bullet as active
  });
}

// Function to draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw player health in the top left corner
  ctx.fillStyle = 'black';
  ctx.fillText(`Health: ${player.health}`, 10, 20);

  // Draw player points in the top right corner
  ctx.fillStyle = 'black';
  ctx.fillText(`Points: ${player.points}`, canvas.width - 100, 20); // Adjust the x position for proper alignment
  
  // Draw bullets
  player.bullets.forEach(bullet => {
    if (bullet.active) {
      ctx.fillStyle = 'red';
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
  });

  // Draw enemies
  enemies.forEach(enemy => {
    ctx.fillStyle = enemy.type === 'green' ? 'green' : 'orange'; // Change color based on enemy type
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    
    // Draw enemy health
    ctx.fillStyle = 'black';
    ctx.fillText(`Health: ${enemy.health}`, enemy.x, enemy.y - 5);
  });

  // Draw crosshair
  ctx.fillStyle = 'yellow';
  ctx.fillRect(crosshair.x - 5, crosshair.y - 5, 10, 10);
}

// Main game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
