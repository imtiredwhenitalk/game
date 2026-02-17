// Game variables - initialized after DOM loads
let canvas, ctx, player, game, enemies, boss, enemyBullets, bossBullets, bonuses, keys, COLORS, currentTheme;

// Theme colors
const THEMES = {
    neon: {
        player: '#00D9FF',
        enemy: '#FF006E',
        bullet: '#FFBE0B',
        enemyBullet: '#FF4444',
        bonusShield: '#00FF88',
        bonusHealth: '#FF6688',
        boss: '#FFD700',
        bossBullet: '#FF00FF',
        background: '#0a0a0a'
    },
    dark: {
        player: '#FFFFFF',
        enemy: '#808080',
        bullet: '#FFFF00',
        enemyBullet: '#FF8800',
        bonusShield: '#88FFFF',
        bonusHealth: '#FF8888',
        boss: '#FFAAFF',
        bossBullet: '#FF5500',
        background: '#1a1a1a'
    },
    fire: {
        player: '#FF9500',
        enemy: '#FF2500',
        bullet: '#FFFF00',
        enemyBullet: '#FF6600',
        bonusShield: '#FF8800',
        bonusHealth: '#FF1100',
        boss: '#FFFF00',
        bossBullet: '#FF00FF',
        background: '#331100'
    },
    ice: {
        player: '#00FFFF',
        enemy: '#0055FF',
        bullet: '#AAFFFF',
        enemyBullet: '#0088FF',
        bonusShield: '#00FFFF',
        bonusHealth: '#88CCFF',
        boss: '#FF00FF',
        bossBullet: '#00FFFF',
        background: '#001155'
    }
};

// Images
const images = {
    enemy: null,
    player: null,
    bullet: null,
    shield: null,
    health: null
};

// Load images
function loadImages() {
    return new Promise((resolve) => {
        let loaded = 0;
        const total = 5;

        images.enemy = new Image();
        images.enemy.onload = () => { loaded++; if (loaded === total) resolve(); };
        images.enemy.onerror = () => { loaded++; if (loaded === total) resolve(); };
        images.enemy.src = 'enemy.png';

        images.player = new Image();
        images.player.onload = () => { loaded++; if (loaded === total) resolve(); };
        images.player.onerror = () => { loaded++; if (loaded === total) resolve(); };
        images.player.src = 'player.png';

        images.bullet = new Image();
        images.bullet.onload = () => { loaded++; if (loaded === total) resolve(); };
        images.bullet.onerror = () => { loaded++; if (loaded === total) resolve(); };
        images.bullet.src = 'bullet.png';

        images.shield = new Image();
        images.shield.onload = () => { loaded++; if (loaded === total) resolve(); };
        images.shield.onerror = () => { loaded++; if (loaded === total) resolve(); };
        images.shield.src = 'shield.png';

        images.health = new Image();
        images.health.onload = () => { loaded++; if (loaded === total) resolve(); };
        images.health.onerror = () => { loaded++; if (loaded === total) resolve(); };
        images.health.src = 'health.png';

        setTimeout(() => {
            if (loaded < total) resolve();
        }, 2000);
    });
}

// Initialize game on DOM ready
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    currentTheme = 'neon';
    COLORS = THEMES[currentTheme];
    
    keys = {};
    enemies = [];
    enemyBullets = [];
    bossBullets = [];
    bonuses = [];
    boss = null;
    
    game = {
        running: false,
        score: 0,
        wave: 1,
        gameOver: false,
        isBossWave: false
    };
    
    player = {
        x: canvas.width / 2,
        y: canvas.height - 50,
        width: 40,
        height: 40,
        speed: 7,
        health: 100,
        maxHealth: 100,
        bullets: [],
        shield: 0
    };
    
    setupEventListeners();
    setupMenuButtons();
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

function setTheme(themeName) {
    console.log('Change theme to:', themeName);
    currentTheme = themeName;
    COLORS = THEMES[themeName];
    updateThemeButtons(themeName);
}

function updateThemeButtons(activeTheme) {
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.boxShadow = 'none';
    });
    
    const activeBtn = document.getElementById('theme' + activeTheme.charAt(0).toUpperCase() + activeTheme.slice(1));
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.6)';
    }
}

function setupMenuButtons() {
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }
    if (restartBtn) {
        restartBtn.addEventListener('click', () => location.reload());
    }
    
    const themeNeon = document.getElementById('themeNeon');
    const themeDark = document.getElementById('themeDark');
    const themeFire = document.getElementById('themeFire');
    const themeIce = document.getElementById('themeIce');
    
    if (themeNeon) themeNeon.addEventListener('click', () => setTheme('neon'));
    if (themeDark) themeDark.addEventListener('click', () => setTheme('dark'));
    if (themeFire) themeFire.addEventListener('click', () => setTheme('fire'));
    if (themeIce) themeIce.addEventListener('click', () => setTheme('ice'));
}

function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        if (e.key === ' ') {
            e.preventDefault();
            if (game.running && !game.gameOver) shootBullet();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });
    
    document.addEventListener('click', () => {
        if (game.running && !game.gameOver) {
            shootBullet();
        }
    });
    
    // Touch support
    document.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        
        if (touchX < canvas.width / 2) {
            keys['a'] = true;
        } else {
            keys['d'] = true;
        }
        if (game.running && !game.gameOver) shootBullet();
    });
    
    document.addEventListener('touchend', () => {
        keys['a'] = false;
        keys['d'] = false;
    });
}

// Start game
async function startGame() {
    console.log('Starting game...');
    await loadImages();
    
    document.getElementById('menuScreen').classList.add('hidden');
    
    game.running = true;
    game.gameOver = false;
    game.score = 0;
    game.wave = 1;
    game.isBossWave = false;
    
    player.health = 100;
    player.shield = 0;
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;
    player.bullets = [];
    
    boss = null;
    enemies = [];
    enemyBullets = [];
    bossBullets = [];
    bonuses = [];
    
    createWave();
    gameLoop();
}

// Create wave or boss
function createWave() {
    if (game.wave % 5 === 0) {
        game.isBossWave = true;
        boss = {
            x: canvas.width / 2,
            y: 100,
            width: 80,
            height: 80,
            health: 150 + game.wave * 20,
            maxHealth: 150 + game.wave * 20,
            speed: 1.5 + game.wave * 0.2,
            direction: 1,
            shootTimer: 0,
            spawnTimer: 0,
            attackTimer: 0,
            attackType: 0
        };
    } else {
        game.isBossWave = false;
        boss = null;
        const count = 3 + Math.floor(game.wave / 2);
        for (let i = 0; i < count; i++) {
            const x = (canvas.width / (count + 1)) * (i + 1);
            const y = 50 + Math.random() * 80;
            enemies.push({
                x: x,
                y: y,
                width: 35,
                height: 25,
                health: 25 + game.wave * 5,
                maxHealth: 25 + game.wave * 5,
                speed: 2 + game.wave * 0.3,
                direction: Math.random() > 0.5 ? 1 : -1,
                shootTimer: 0
            });
        }
    }
}

// Draw functions
function drawPlayer() {
    ctx.save();
    
    if (images.player && images.player.complete) {
        ctx.drawImage(images.player, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
    } else {
        ctx.translate(player.x, player.y);
        ctx.fillStyle = COLORS.player;
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(-12, 15);
        ctx.lineTo(0, 8);
        ctx.lineTo(12, 15);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
    
    if (player.shield > 0) {
        ctx.strokeStyle = COLORS.bonusShield;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    ctx.fillStyle = 'rgba(255, 68, 68, 0.5)';
    ctx.fillRect(player.x - 20, player.y - 25, 40, 4);
    const healthColor = player.health > 50 ? '#00FF00' : player.health > 20 ? '#FFFF00' : '#FF0000';
    ctx.fillStyle = healthColor;
    ctx.fillRect(player.x - 20, player.y - 25, 40 * (player.health / player.maxHealth), 4);
}

function drawEnemy(enemy) {
    ctx.save();
    
    if (images.enemy && images.enemy.complete) {
        ctx.drawImage(images.enemy, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height);
    } else {
        ctx.translate(enemy.x, enemy.y);
        ctx.fillStyle = COLORS.enemy;
        ctx.beginPath();
        ctx.moveTo(-10, -8);
        ctx.lineTo(10, -8);
        ctx.lineTo(12, 0);
        ctx.lineTo(10, 8);
        ctx.lineTo(-10, 8);
        ctx.lineTo(-12, 0);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
    
    ctx.fillStyle = 'rgba(255, 68, 68, 0.5)';
    ctx.fillRect(enemy.x - 17.5, enemy.y - 18, 35, 3);
    ctx.fillStyle = COLORS.enemyBullet;
    ctx.fillRect(enemy.x - 17.5, enemy.y - 18, 35 * (enemy.health / enemy.maxHealth), 3);
}

function drawBoss(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    
    ctx.fillStyle = COLORS.boss;
    ctx.globalAlpha = 0.9;
    const sides = 6;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * 40;
        const y = Math.sin(angle) * 40;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = COLORS.boss;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = COLORS.boss;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(0, 0, 50 + Math.sin(Date.now() / 100) * 5, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
    
    ctx.fillStyle = 'rgba(255, 68, 68, 0.5)';
    ctx.fillRect(b.x - 50, b.y - 50, 100, 5);
    ctx.fillStyle = COLORS.boss;
    ctx.fillRect(b.x - 50, b.y - 50, 100 * (b.health / b.maxHealth), 5);
}

function drawBullet(bullet) {
    if (images.bullet && images.bullet.complete) {
        ctx.drawImage(images.bullet, bullet.x - 4, bullet.y - 8, 8, 16);
    } else {
        ctx.fillStyle = COLORS.bullet;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawEnemyBullet(bullet) {
    ctx.fillStyle = COLORS.enemyBullet;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawBossBullet(bullet) {
    ctx.fillStyle = COLORS.bossBullet;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.bossBullet;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function drawBonus(bonus) {
    ctx.save();
    ctx.translate(bonus.x, bonus.y);
    ctx.rotate((Math.PI / 180) * bonus.rotation);
    
    if (bonus.type === 'shield' && images.shield && images.shield.complete) {
        ctx.drawImage(images.shield, -15, -15, 30, 30);
    } else if (bonus.type === 'health' && images.health && images.health.complete) {
        ctx.drawImage(images.health, -15, -15, 30, 30);
    } else {
        const color = bonus.type === 'shield' ? COLORS.bonusShield : COLORS.bonusHealth;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

// Update functions
function updatePlayer() {
    if (keys['arrowleft'] || keys['a']) player.x -= player.speed;
    if (keys['arrowright'] || keys['d']) player.x += player.speed;
    player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
}

function shootBullet() {
    player.bullets.push({
        x: player.x,
        y: player.y - 20,
        speed: 8,
        damage: 10
    });
}

function updateBullets() {
    player.bullets = player.bullets.filter(b => {
        b.y -= b.speed;
        return b.y > -10;
    });
    
    enemyBullets = enemyBullets.filter(b => {
        b.y += b.speed;
        return b.y < canvas.height + 10;
    });
    
    bossBullets = bossBullets.filter(b => {
        b.x += b.vx;
        b.y += b.vy;
        return b.x > -20 && b.x < canvas.width + 20 && b.y > -20 && b.y < canvas.height + 20;
    });
}

function updateEnemies() {
    enemies.forEach(e => {
        e.x += e.speed * e.direction;
        if (e.x - e.width / 2 < 0 || e.x + e.width / 2 > canvas.width) {
            e.direction *= -1;
        }
        
        e.shootTimer++;
        if (e.shootTimer > 100) {
            enemyBullets.push({
                x: e.x,
                y: e.y + 15,
                speed: 4,
                damage: 10
            });
            e.shootTimer = 0;
        }
    });
    
    enemies = enemies.filter(e => e.health > 0);
}

function updateBoss() {
    if (!boss) return;
    
    boss.x += boss.speed * boss.direction;
    if (boss.x - boss.width / 2 < 0 || boss.x + boss.width / 2 > canvas.width) {
        boss.direction *= -1;
    }
    
    boss.spawnTimer++;
    if (boss.spawnTimer > 120) {
        const angle = Math.random() * Math.PI * 2;
        enemies.push({
            x: boss.x + Math.cos(angle) * 60,
            y: boss.y + Math.sin(angle) * 60,
            width: 30,
            height: 20,
            health: 15 + game.wave * 2,
            maxHealth: 15 + game.wave * 2,
            speed: 2.5 + game.wave * 0.2,
            direction: Math.random() > 0.5 ? 1 : -1,
            shootTimer: 0
        });
        boss.spawnTimer = 0;
    }
    
    boss.attackTimer++;
    boss.shootTimer++;
    
    if (boss.shootTimer > 50) {
        boss.attackType = Math.floor(boss.attackTimer / 100) % 2;
        
        if (boss.attackType === 0) {
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + boss.attackTimer * 0.05;
                const speed = 4;
                bossBullets.push({
                    x: boss.x,
                    y: boss.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    damage: 15
                });
            }
        } else {
            const dx = player.x - boss.x;
            const dy = player.y - boss.y;
            const targetAngle = Math.atan2(dy, dx);
            
            for (let i = 0; i < 6; i++) {
                const angle = targetAngle + (i - 2.5) * 0.3;
                const speed = 5;
                bossBullets.push({
                    x: boss.x,
                    y: boss.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    damage: 15
                });
            }
        }
        
        boss.shootTimer = 0;
    }
}

function updateBonuses() {
    bonuses = bonuses.filter(b => {
        b.y += b.speed;
        b.rotation += 5;
        return b.y < canvas.height + 50;
    });
}

function checkCollisions() {
    // Player bullets vs enemies
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        const bullet = player.bullets[i];
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (Math.abs(bullet.x - enemy.x) < 20 && Math.abs(bullet.y - enemy.y) < 20) {
                enemy.health -= bullet.damage;
                player.bullets.splice(i, 1);
                game.score += 10;
                
                if (enemy.health <= 0) {
                    game.score += 50;
                    if (Math.random() < 0.3) {
                        bonuses.push({
                            x: enemy.x,
                            y: enemy.y,
                            type: Math.random() > 0.5 ? 'shield' : 'health',
                            speed: 2,
                            rotation: 0
                        });
                    }
                }
                break;
            }
        }
    }
    
    // Player bullets vs boss
    if (boss) {
        for (let i = player.bullets.length - 1; i >= 0; i--) {
            const bullet = player.bullets[i];
            if (Math.abs(bullet.x - boss.x) < 50 && Math.abs(bullet.y - boss.y) < 50) {
                boss.health -= bullet.damage;
                player.bullets.splice(i, 1);
                game.score += 25;
                break;
            }
        }
    }
    
    // Enemy bullets vs player
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        if (Math.abs(bullet.x - player.x) < 20 && Math.abs(bullet.y - player.y) < 20) {
            if (player.shield > 0) {
                player.shield -= bullet.damage;
            } else {
                player.health -= bullet.damage;
            }
            enemyBullets.splice(i, 1);
            if (player.health <= 0) endGame();
        }
    }
    
    // Boss bullets vs player
    for (let i = bossBullets.length - 1; i >= 0; i--) {
        const bullet = bossBullets[i];
        if (Math.abs(bullet.x - player.x) < 20 && Math.abs(bullet.y - player.y) < 20) {
            if (player.shield > 0) {
                player.shield -= bullet.damage;
            } else {
                player.health -= bullet.damage;
            }
            bossBullets.splice(i, 1);
            if (player.health <= 0) endGame();
        }
    }
    
    // Enemy vs player
    enemies.forEach(e => {
        if (Math.abs(e.x - player.x) < 40 && Math.abs(e.y - player.y) < 40) {
            if (player.shield > 0) {
                player.shield = 0;
            } else {
                player.health -= 20;
            }
            if (player.health <= 0) endGame();
        }
    });
    
    // Boss vs player
    if (boss) {
        if (Math.abs(boss.x - player.x) < 70 && Math.abs(boss.y - player.y) < 70) {
            if (player.shield > 0) {
                player.shield -= 20;
            } else {
                player.health -= 30;
            }
            if (player.health <= 0) endGame();
        }
    }
    
    // Bonuses vs player
    bonuses = bonuses.filter(b => {
        if (Math.abs(b.x - player.x) < 25 && Math.abs(b.y - player.y) < 25) {
            if (b.type === 'shield') {
                player.shield = Math.min(100, player.shield + 50);
            } else {
                player.health = Math.min(player.maxHealth, player.health + 30);
            }
            game.score += 25;
            return false;
        }
        return true;
    });
}

function updateHUD() {
    const scoreEl = document.getElementById('score');
    const wavesEl = document.getElementById('waves');
    const healthEl = document.getElementById('health');
    
    if (scoreEl) scoreEl.textContent = game.score;
    if (wavesEl) wavesEl.textContent = game.wave + (game.isBossWave ? ' [BOSS]' : '');
    if (healthEl) {
        const hp = Math.max(0, Math.round((player.health / player.maxHealth) * 100));
        healthEl.textContent = hp + '%';
    }
}

function endGame() {
    game.running = false;
    game.gameOver = true;
    const finalScoreEl = document.getElementById('finalScore');
    if (finalScoreEl) finalScoreEl.textContent = game.score;
    const gameOverScreen = document.getElementById('gameOverScreen');
    if (gameOverScreen) gameOverScreen.classList.remove('hidden');
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!game.running || game.gameOver) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Draw stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 20; i++) {
        const x = (i * 100 + Date.now() / 50) % canvas.width;
        const y = (i * 50 + i * 20) % canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Update
    updatePlayer();
    updateBullets();
    updateEnemies();
    updateBoss();
    updateBonuses();
    checkCollisions();
    updateHUD();
    
    // Draw
    drawPlayer();
    if (boss) drawBoss(boss);
    enemies.forEach(drawEnemy);
    player.bullets.forEach(drawBullet);
    enemyBullets.forEach(drawEnemyBullet);
    bossBullets.forEach(drawBossBullet);
    bonuses.forEach(drawBonus);
    
    // Check wave completion
    if (game.isBossWave && boss && boss.health <= 0) {
        game.score += 500;
        game.wave++;
        boss = null;
        enemies = [];
        enemyBullets = [];
        bossBullets = [];
        createWave();
    } else if (!game.isBossWave && enemies.length === 0) {
        game.wave++;
        createWave();
    }
    
    requestAnimationFrame(gameLoop);
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    initGame();
    const menuScreen = document.getElementById('menuScreen');
    if (menuScreen) menuScreen.classList.remove('hidden');
});
