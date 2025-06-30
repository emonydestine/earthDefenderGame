import { getRandomInt, playSound } from "./utils.js";

export let aliens = [];
export let alienBullets = [];
let spawnTimeouts = [];

export function spawnAlien(waveNumber, canvasWidth) {
    aliens.length = 0;
    const rows = Math.min(1 +Math.floor(waveNumber / 2), 5);
    const cols = Math.min(4 + Math.floor(waveNumber / 3), 7);
    const spacing = 60;
    const totalWidth = cols * spacing;
    const startX = (canvasWidth - totalWidth) / 2;

    let delay = 0;
    for(let row = 0; row < rows; row++) {
        for(let col = 0; col < cols; col++) {
            let type = "alien1";

            if(waveNumber >= 4 && waveNumber <= 6) {
                type = "alien2";
            } else if (waveNumber >= 7 && waveNumber <= 10) {
                type = Math.random() > 0.5 ? "alien1" : "alien2";
            }
            else if (waveNumber >= 11) {
                const totalSpots = rows * cols;
                const maxBosses = Math.min(2, Math.floor(totalSpots * 0.1));
                let bossCount = aliens.filter(a => a.type === 'boss').length;

                const isGuaranteedBoss = 
                    waveNumber >= 15 &&
                    bossCount === 0 &&
                    row === Math.floor(Math.random() * row) &&
                    col === Math.floor(Math.random * cols);

                const r = Math.random();

                if (isGuaranteedBoss) {
                    type = "boss";
                } else if (bossCount < maxBosses && r < 0.15) {
                    type = "boss";
                } else if (r < 0.6) {
                    type = "alien2";
                } else {
                    type = 'alien1';
                }
            }

            let health = 1;
            if(type === "alien2") health = 2;
            if(type === "boss") health = 5;

            const timeoutId = setTimeout(() => {
                aliens.push({
                    velocityX: getRandomInt(-2, 2),
                    velocityY: Math.min(0.02 + waveNumber * 0.1, 1.5),
                    movementTimer: getRandomInt(30, 100),
                    movementCooldown: 0,
                    x: startX + col * spacing,
                    y: -row * spacing,
                    width: 70,
                    height: 35,
                    speedX: 1 + 0.1 * waveNumber,
                    speedY: 0.3,
                    direction: 1,
                    cooldown: getRandomInt(100, 300),
                    type: type,
                    health: health,
                    laserColor: 
                        type === "boss" ? "#ff00ff" :
                        type === "alien2" ? "#ff9900" :
                        "#00ffff",
                    lastHitFrames: 0,
                    maxHealth: health,
                });
            }, delay);

            spawnTimeouts.push(timeoutId);

            delay += 100 + waveNumber * 10;
        }
        delay += 200 + waveNumber * 15;
    }
    console.log(`Aliens spawned: ${aliens.length}`);
} 

export function updateAliens(canvasWidth, canvasHeight, waveNumber, game) {
    if (!game.running) return;
    for(let i = aliens.length - 1; i >= 0; i--) {
        let alien = aliens[i];

        alien.x += alien.velocityX;
        alien.y += alien.velocityY;

        if(alien.x <= 0 || alien.x + alien.width >= canvasWidth) {
            alien.velocityX *= -1;
        }
        
        if(alien. y + alien.height > canvasHeight) {
            game.score = Math.max(0, game.score - 30);

            alien.x = getRandomInt(50, canvasWidth - 100);
            alien.y = -60;
            alien.velocityX = getRandomInt(-2, 2);
            alien.velocityY = 0.4 + 0.1 * waveNumber;
            alien.cooldown = getRandomInt(30, 300);
            alien.movementCooldown = getRandomInt(30, 100);
            alien.lastHitFrames = 0;
        }

        alien.movementCooldown--;
        alien.cooldown--;
        
        if(alien.cooldown <= 0 && Math.random() < 0.5) {
            alienShoot(alien);
            alien.cooldown = getRandomInt(150, 400);
        } 
        
        if(alien.movementCooldown <= 0) {
            alien.velocityX = getRandomInt(-2, 2);
            alien.velocityY = getRandomInt(1, 2);
            alien.movementCooldown = getRandomInt(30, 100);
        }
    }
}

export function drawAlien(ctx, assets) {
    for(let alien of aliens) {
        ctx.drawImage(assets[alien.type], alien.x, alien.y, alien.width, alien.height);
        if (alien.lastHitFrames > 0) {
            const barWidth = alien.width;
            const barHeight = 4;
            const healthRatio = alien.health / alien.maxHealth;

            ctx.fillStyle = "red";
            ctx.fillRect(alien.x, alien.y -6, barWidth, barHeight);
            ctx.fillStyle = "lime";
            ctx.fillRect(alien.x, alien.y - 6, barWidth * healthRatio, barHeight);
        }

        if (alien.lastHitFrames > 0) alien.lastHitFrames--;
    }
}

export function drawAlienBullets(ctx) {
    for(let bullet of alienBullets) {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

export function updateAlienBullets(canvasHeight) {
    for(let i = alienBullets.length - 1; i >= 0; i--) {
        alienBullets[i].y += alienBullets[i].speed;

        if(alienBullets[i].y > canvasHeight) {
            alienBullets.splice(i, 1);
        }
    }
}

export function alienShoot(alien, waveNumber = 1) {
    const laserSpeed = 3 + Math.floor(waveNumber / 10);

    alienBullets.push({
        x: alien.x + alien.width / 2 + getRandomInt(-3, 3),
        y: alien.y + alien.height,
        width: 4,
        height: 10,
        speed: laserSpeed,
        color: alien.laserColor || '#ff0000'
    });
    playSound("alienLaser");
}

export function clearAliens() {
    aliens = [];
    alienBullets = [];
}

export function drawExplosion(ctx, assets, game) {
    if (!game.explosion) return;

    for (let i = game.explosion.length - 1; i >= 0; i--) {
        const exp = game.explosion[i];
        if (assets.explosion?.complete) {
            ctx.drawImage(assets.explosion, exp.x, exp.y, 40, 40);
        }

        exp.frames--;
        if (exp.frames <= 0) {
            game.explosion.splice(i, 1);
        }
    }
}

export function cancelAlienSpawns() {
    for (let id of spawnTimeouts) {
        clearTimeout(id);
    }
    spawnTimeouts = [];
}