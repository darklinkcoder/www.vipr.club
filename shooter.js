// Get the canvas element and its 2D context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set the canvas dimensions to the window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Circle/Player object
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  speed: 5,
  angle: 0, // Angle in radians
  canShoot: true,
  shootCooldown: 500, // Cooldown time in milliseconds (e.g., 500ms)
};

let score = 0;

const enemies = [];

// Other variables
let lives = 3; // Initial number of lives
const projectiles = []; // Array to store projectiles
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};

// Event listeners
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
document.addEventListener('mousemove', handleMouseMove);

// Function to handle keydown events
function handleKeyDown(event) {
  const key = event.key.toLowerCase();
  if (key in keys) {
    event.preventDefault();
    keys[key] = true;
  }

  const barrier = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 100,
    width: 100,
    height: 10,
    color: 'gray',
  };

  // Function to draw the barrier
  function drawBarrier() {
    ctx.fillStyle = barrier.color;
    ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
  }

  if (key === ' ' && player.canShoot) { // Spacebar key and can shoot
    const bulletSpeed = player.speed * 2; // Double the speed of the player

    const projectile = {
      x: player.x,
      y: player.y,
      size: 3,
      speed: bulletSpeed,
      velocityX: Math.cos(player.angle) * bulletSpeed,
      velocityY: Math.sin(player.angle) * bulletSpeed
    };

    projectiles.push(projectile);

    // Prevent shooting until the cooldown period is over
    player.canShoot = false;
    setTimeout(() => {
      player.canShoot = true;
    }, player.shootCooldown);
  }
}

// Function to update the player's position based on the key states
function updatePosition() {
  // Calculate the movement in the x and y directions
  let moveX = 0;
  let moveY = 0;

  // Check which keys are currently pressed and update movement values accordingly
  if (keys.w) {
    moveY -= player.speed;
  }
  if (keys.a) {
    moveX -= player.speed;
  }
  if (keys.s) {
    moveY += player.speed;
  }
  if (keys.d) {
    moveX += player.speed;
  }

  // Adjust diagonal movement speed
  if (moveX !== 0 && moveY !== 0) {
    const diagonalSpeed = Math.sqrt(player.speed * player.speed / 2); // Adjusted speed for diagonal movement
    moveX = (moveX / Math.abs(moveX)) * diagonalSpeed;
    moveY = (moveY / Math.abs(moveY)) * diagonalSpeed;
  }

  // Calculate the new player's position
  const newPlayerX = player.x + moveX;
  const newPlayerY = player.y + moveY;

  const playerLeft = newPlayerX - player.radius;
  const playerRight = newPlayerX + player.radius;
  const playerTop = newPlayerY - player.radius;
  const playerBottom = newPlayerY + player.radius;

  // Perform the boundary checks and update the player's position if within the canvas boundaries
  if (newPlayerX - player.radius >= 0 && newPlayerX + player.radius <= canvas.width) {
    player.x = newPlayerX;
  }

  if (newPlayerY - player.radius >= 0 && newPlayerY + player.radius <= canvas.height) {
    player.y = newPlayerY;
  }
}

// Function to handle keyup events
function handleKeyUp(event) {
  const key = event.key.toLowerCase();
  if (key in keys) {
    event.preventDefault();
    keys[key] = false;
  }
}

// Function to handle mousemove events
function handleMouseMove(event) {
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  const dx = mouseX - player.x;
  const dy = mouseY - player.y;
  player.angle = Math.atan2(dy, dx);
}

// Function to update the score
function updateScore(points) {
  score += points;
}

// Function to draw the game over screen
function drawGameOverScreen() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.font = '40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);

  // Display final score
  ctx.font = '20px Arial';
  ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
}

// Function to draw the gun rectangle
function drawGun() {
  const gunWidth = 30;
  const gunHeight = 5;

  // Translate and rotate the canvas context
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);

  const gunX = player.radius - gunWidth / 2;
  const gunY = -gunHeight / 2;

  ctx.fillStyle = 'grey';
  ctx.fillRect(gunX, gunY, gunWidth, gunHeight);

  // Reset the canvas context transformation
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// Function to draw the circle/player and projectiles
function draw() {
  

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (enemies.length === 0 && wave <= maxWave) {
    wave++;
    startWave();
  }

  // Check if game over
  if (lives <= 0) {
    drawGameOverScreen();
    return; // Stop the game loop
  }

  // Display the score in the top corner
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 20, 30);

  // Update and draw enemies
  ctx.fillStyle = 'red';
  enemies.forEach((enemy, enemyIndex) => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.hypot(dx, dy);

    enemy.x += (dx / distance) * enemy.speed;
    enemy.y += (dy / distance) * enemy.speed;

    ctx.fillRect(enemy.x - enemy.size / 2, enemy.y - enemy.size / 2, enemy.size, enemy.size);

    // Check collision with player
    if (distance - enemy.size / 2 - player.radius < 1) {
      lives--;
      enemies.splice(enemyIndex, 1);
    }

    // Check collision with projectiles
    projectiles.forEach((projectile, projectileIndex) => {
      const projEnemyDistance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      if (projEnemyDistance - enemy.size / 2 - projectile.size / 2 < 1) {
        // Bullet hit enemy
        projectiles.splice(projectileIndex, 1);
        enemies.splice(enemyIndex, 1);

        // Increment the score by 1 when an enemy is defeated
        updateScore(1);
      }
    });
  });

  // Draw the circle/player
  drawGun();

  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = 'blue';
  ctx.fill();
  ctx.closePath();

  // Draw projectiles
  ctx.fillStyle = 'black';
  projectiles.forEach((projectile, index) => {
    projectile.x += projectile.velocityX;
    projectile.y += projectile.velocityY;

    ctx.beginPath();
    ctx.arc(
      projectile.x,
      projectile.y,
      projectile.size,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Remove projectiles that are out of bounds
    if (
      projectile.x - projectile.size / 2 > canvas.width ||
      projectile.x + projectile.size / 2 < 0 ||
      projectile.y - projectile.size / 2 > canvas.height ||
      projectile.y + projectile.size / 2 < 0
    ) {
      projectiles.splice(index, 1);
    }
  });

  // Check if all waves are completed
  if (wave > maxWave && enemies.length === 0) {
    drawWinScreen();
    return; // Stop the game loop
  }

  // Draw the life counter
  const counterSize = 20; // Size of the counter
  const counterMargin = 10; // Margin from the top-right corner of the canvas
  const counterSpacing = 5; // Spacing between individual life icons

  ctx.fillStyle = 'green';
  for (let i = 0; i < lives; i++) {
    const xPos = canvas.width - counterMargin - (counterSize + counterSpacing) * (i + 1);
    const yPos = counterMargin;

    ctx.fillRect(xPos, yPos, counterSize, counterSize);
  }

  // Check if game over
  if (lives <= 0) {
    drawGameOverScreen();
    return; // Stop the game loop
  }

  // Update player's position
  updatePosition();

  // Continue the game loop
  requestAnimationFrame(draw);
}

// Function to start a new wave
function startWave() {
  // Clear existing enemies and projectiles
  enemies.length = 0;
  projectiles.length = 0;

  // Generate new enemies for the wave
  const enemyCount = wave * 5;
  for (let i = 0; i < enemyCount; i++) {
    const enemy = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 10,
      speed: Math.random() * 2 + 1,
    };
    enemies.push(enemy);
  }
}

// Start the game loop
let wave = 1;
const maxWave = 4; // Maximum number of waves
startWave();
draw();
