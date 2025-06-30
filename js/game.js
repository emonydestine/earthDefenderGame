import { spawnAlien } from "./alien.js";
import { getHighScore, saveHighScore } from "./utils.js";

export function drawUI(ctx, game) {
    ctx.fillStyle = '#0ff';
    ctx.font = "18px Orbitron, sans-serif";
    ctx.textAlign = "left";

    ctx.fillText(`Score: ${game.score}`, 20, 30);
    ctx.fillText(`Health: ${game.health}`, 20, 55);
    ctx.fillText(`Wave: ${game.wave}`, 20, 80);

    

    if (game.activeBooster) {
        const remaining = Math.ceil((game.boosterExpireTime - Date.now()) / 1000);
        ctx.fillStyle = "#ffff00";
        ctx.font = "16px Orbitron, sans-serif";
        ctx.fillText(`Active Booster: ${game.activeBooster} (${remaining}s left)`, 20, 105);
    }    
    
    if (game.showGameOverScreen) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = "#ff0000";
        ctx.font = "40px Orbitron, sans-serif";
        ctx.textAlign = "center";
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "24px Orbitron, sans-serif";
        ctx.fillText(`Score: ${game.score}`, ctx.canvas.width / 2, ctx.canvas.height / 2 + 10);
        ctx.fillText(`High Score: ${getHighScore()}`, ctx.canvas.width / 2, ctx.canvas.height / 2 + 50);
    }

}

export function startWave(waveNumber, canvasWidth) {
    spawnAlien(waveNumber, canvasWidth);
}

export function nextWave(game, canvasWidth) {
    game.wave += 1;
    if (game.wave % 3 === 0 && game.maxHealth < 0) {
        game.maxHealth += 50;
    }
    startWave(game.wave, canvasWidth);
}

export function checkGameOver(game) {
    if (game.showGameOverScreen) return;

    if(game.health <= 0 && game.running) {
        game.health = 0;
        game.running = false;
        game.showGameOverScreen = true;

        const pauseBtn = document.getElementById("pauseButton");
        pauseBtn.style.display = "none";
        pauseBtn.blur();
        document.getElementById("controls").style.display = "none";

        

        saveHighScore(game.score);

        setTimeout(() => {
            game.showGameOverScreen = true;
            saveHighScore(game.score);
            document.getElementById("gameOverText").style.display = "block";
            document.getElementById("gameOverButtons").style.display = "flex";

            const canvas = document.getElementById("gameCanvas");
            const ctx = canvas.getContext("2d");
            drawUI(ctx, game);
        }, 700);
        
    }
}

export function pauseGame(game) {
    game.running = false;
}

export function resumeGame(game) {
    game.running = true;
}