import { alienBullets } from "./alien.js";
import { markPlayerHit } from "./player.js";
import { playSound } from "./utils.js";

export function isColliding(obj1, obj2){
    if(!obj1 || !obj2) return false;

    return(
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj1.height &&
        obj1.y + obj1.height > obj2.y
    );
}

export function checkBulletCollision(bullets, aliens, game) {
    if (!game.running) return;

    for(let i = bullets.length - 1; i >= 0; i--) {
        for(let j = aliens.length - 1; j >= 0; j--) {
            if(isColliding(bullets[i], aliens[j])) {
                const damage = bullets[i].damage || 1;
                bullets.splice(i, 1);
                aliens[j].health -= damage;
                aliens[j].lastHitFrames = 30;
                game.score += 100;
                playSound("explosion");

                if (aliens[j].health <= 0) {
                    game.explosion.push({
                        x: aliens[j].x, 
                        y: aliens[j].y, 
                        frames: 10
                    });

                    game.score += aliens[j].type === "boss" 
                    ? 300 
                    : aliens[j].type === "alien2" 
                    ? 200 
                    : 100;

                    aliens.splice(j, 1);
                }

                break;
            }
        }
    }
}

export function checkAlienPlayerCollision(aliens, player, game) {
    if (!game.running || game.shieldBoosterActive) return;
    
    for (let alien of aliens) {
        if (!alien || !player) continue;

        if (isColliding(alien, player) && player.invulnerableFrames <= 0) {
            let damage = 12;
            if (alien.type === 'boss') damage = 36;
            else if (alien.type === 'alien2') damage = 24;

            game.health -= damage;
            playSound("shipExplosion");
            markPlayerHit();
            player.invulnerableFrames = 80; 
        }
    }

    const bulletsToRemove = [];

    for (let i = 0; i < alienBullets.length; i++) {
        const bullet = alienBullets[i];
        if (!bullet || !player) continue;

        if (isColliding(bullet, player)) {
            bulletsToRemove.push(i);
            game.health -= 10; 
            playSound("shipExplosion");
            markPlayerHit();
        }
    }

    for (let i = bulletsToRemove.length - 1; i >= 0; i--) {
        alienBullets.splice(bulletsToRemove[i], 1);
    }
}
