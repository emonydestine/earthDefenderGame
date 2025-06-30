export { bullets };
import { playSound } from "./utils.js";

export let player;
let bullets = [];
let playerHitFrames = 0;

export function createPlayer() {
    player = {
        x: 400,
        y: 530,
        width: 50,
        height: 50,
        speed: 5, 
        movingLeft: false,
        movingRight: false,
        shooting: false,
        shootCooldown: 0,
        hitFrames: 0,
        invulnerableFrames: 0
    };
}

export function movePlayer(canvasWidth, game) {
    if (!game.running) return;
    if (!player) return;
    
    if (player.movingLeft) {
        player.x -= player.speed;
    }

    if (player.movingRight) {
        player.x += player.speed;
    }

    if (player.shooting && player.shootCooldown <= 0) {
        shoot(game);

        if (game.activeBooster === 'fireRate' && Date.now() < game.boosterExpireTime) {
            player.shootCooldown = 10;
        } else {
            player.shootCooldown = 20;
        }
    }

    if (player.shootCooldown > 0) {
        player.shootCooldown--;
    }

    if (player.invulnerableFrames > 0) {
        player.invulnerableFrames--;
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvasWidth) {
        player.x = canvasWidth - player.width;
    }
}

export function drawPlayer(ctx, assets, game){
    if(!player) return;
    
   if (assets.player && assets.player.complete && assets.player.naturalWidth !== 0) { 
        ctx.save();

        if(playerHitFrames > 0) {
            const offsetX = (Math.random() - 0.5) * 8;
            const offsetY = (Math.random() - 0.5) * 8;
            ctx.translate(offsetX, offsetY);
            playerHitFrames--;
        } 

        if (game.shieldBoosterActive && game.running) {
            ctx.beginPath();
            ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(0, 200, 255, 0.6)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        ctx.drawImage(assets.player, player.x, player.y, player.width, player.height);
        ctx.restore();
    } else {
        console.warn("Player image not yet loaded.");
    }
}

function shoot(game) {
    if (!game.running || game.inMenu) return;

    console.log("Bullet fired!");
    const centerX = player.x + player.width / 2;
    bullets.push({
        x:  centerX - 2,
        y: player.y,
        width: 4,
        height: 10,
        speed: 7
    });

    if (game.activeBooster === 'multiShot' && Date.now() < game.boosterExpireTime) {
        bullets.push({
            x: centerX - 10,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7,
            dx: -1,
            damage: 2
        });
        bullets.push({
            x: centerX + 6,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7,
            dx: 1,
            damage: 2
        })
    }
    playSound("laser");
}

export function updateBullets(game) {
    if (!game.running || game.inMenu) return;
    for(let i = bullets.length - 1; i >= 0; i--){
        const bullet = bullets[i];
        bullet.y -= bullet.speed;

        if(bullets.dx) bullet.x += bullet.dx * 2;

        if (bullet.y + bullet.height < 0) {
            bullets.splice(i, 1);
        }
    }
}

export function drawBullets(ctx) {
    for(let bullet of bullets){
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

export function markPlayerHit() {
    if (!player) return;
    if (playerHitFrames <= 0) {
    playerHitFrames = 10;
    }
    playSound("shipExplosion");
}