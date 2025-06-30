
//import { assets } from "./main.js";
import { aliens } from "./alien.js";
import { playSound } from "./utils.js";
export { scheduleBoosterDrop };

export let boosters = [];
let boosterTimeouts = [];

export function cancelBoosterDrops() {
    boosterTimeouts.forEach(clearTimeout);
    boosterTimeouts = [];
}

export function spawnBooster(type, x, y) {
    boosters.push({
        type,
        x,
        y,
        width: 30,
        height: 30,
        speed: 2,
        duration: 300
    });
}

export function updateBoosters(canvasHeight, game) {
    if (!Array.isArray(boosters)) return;

    if (game?.showGameOverScreen) return;


    for (let i = boosters.length - 1; i >= 0; i--) {
        const booster = boosters[i];
        if(!booster || booster.y === undefined) {
            boosters.splice(i, 1);
            continue;
        }

        booster.y += booster.speed;

        if (booster.y > canvasHeight) {
            boosters.splice(i, 1);
        }
    }
}

export function drawBooster(ctx, assets) {
    for ( let booster of boosters ) {
        const img = assets.boosters?.[booster.type];
        if (img && img.complete) {
            ctx.drawImage(img, booster.x, booster.y, booster.width, booster.height);
        } else {
            ctx.fillStyle = getBoosterColor(booster.type);
            ctx.fillRect(booster.x, booster.y, booster.width, booster.height);
        } 
    }
}

export function checkBoosterCollection(player, game) {
    if(!player || !game.running || !Array.isArray(boosters)) return;

    const effectBoosters = ['fireRate', 'multiShot', 'shield'];

    for (let i = boosters.length - 1; i >= 0; i--) {
        const booster = boosters[i];
        if(!booster || booster.x === undefined || booster. y === undefined) continue;

        if (isColliding(player, booster)) {
            playSound("booster");

            if (effectBoosters.includes(booster.type)) {
                if (!game.activeBooster) {
                    game.activeBooster = booster.type;
                    game.boosterExpireTime = Date.now() + 15000;
                    game.missedBooster = null;

                    applyBoosterEffect(booster.type, game, player);
                } else {
                    console.log(`Booser '${booster.type}' ignored: '${game.activeBooster}' already active.`);
                    game.missedBooster = booster.type;
                    boosters.splice(i, 1);
                    return;
                }
            } else {
                applyBoosterEffect(booster.type, game, player);
            }
            boosters.splice(i, 1);
            break;
        }
        console.log(`Booser '${booster.type}" ignored: '${game.activeBooster}' already active.`);
        game.missedBooster = booster.type;
    }
}

function applyBoosterEffect(type, game, player) {
    switch (type) {
        case 'health':
            game.health = Math.min(game.health + 50, game.maxHealth);
            console.log("Health booster applied");
            break;
        case 'shield':
            player.invulnerableFrames = 1200;
            game.shieldBoosterActive = true;
            console.log("Shield booster applied");
            break;
        case 'fireRate':
            player.fireRateBoosterFrames = 1200;
            console.log("Fire rate booster applied");
            break;
        case 'multiShot':
            player.multiShotFrames = 1200;
            console.log("Multi-shot booster applied");
            break;
        case 'bomb':
            aliens.length = 0;
            console.log("Bomb booster applied. Aliens cleared!");
            break;
    }
}

function getBoosterColor(type){
    switch (type) {
        case 'health': return 'lime';
        case 'shield': return 'cyan';
        case 'fireRate': return 'orange';
        case 'multiShot': return 'purple';
        case 'bomb': return 'red';
        default: return 'white'
    }
}

function isColliding(obj1, obj2) {
    if (!obj1 || !obj2) return false;
    return(
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj1.height &&
        obj1.y + obj1.height > obj2.y
    );
}

function scheduleBoosterDrop(type, delayMs, canvas, game) {
    const timeoutId = setTimeout(() => {
        if (!game.running) return;
        const randomX = Math.random() * (canvas.width - 30);
        spawnBooster(type, randomX, -30);
        console.log(`Booster dropped: ${type}`);
    }, delayMs);
    boosterTimeouts.push(timeoutId);
}