import { initStars, updateStars, drawStars } from "./background.js";
import { createPlayer, movePlayer, drawPlayer, updateBullets, drawBullets, player, bullets } from "./player.js";
import { spawnAlien, updateAliens, drawAlien, drawAlienBullets, updateAlienBullets, clearAliens, aliens, drawExplosion, cancelAlienSpawns } from "./alien.js";
import { checkBulletCollision, checkAlienPlayerCollision } from "./collision.js";
import { drawUI, checkGameOver, pauseGame, resumeGame, nextWave, startWave } from "./game.js";
import { themeSong } from "./utils.js";
import { spawnBooster, updateBoosters, drawBooster, checkBoosterCollection, scheduleBoosterDrop, boosters, cancelBoosterDrops } from "./booster.js";

const spawnDelay = 3000;

let canvas, ctx;
let game = {};
let assets = {};
let animatedFrameId = null;
let themeMusic;
let lastWaveTime = 0;


export function initGame(){
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext("2d");
    game.showGameOverScreen = false;
    game.explosion = [];
    const wasInMenu = game.inMenu;

    game = {
        running: false,
        score: 0,
        wave: 0,
        health: 300,
        maxHealth: 300,
        activeBooster: null,
        boosterTime: 0,
        boosterExpireTime: 0,
        shieldBoosterActive: false,
        explosion: [],
        inMenu: wasInMenu ?? false
    };

    boosters.length = 0;
    lastWaveTime = performance.now();
    loadImages(() => {
        initStars(canvas);
        createPlayer();
        handleInput();
    });
    
    console.log("Aliens spawned:", aliens.length);
}

export function startGameLoop(){
    if(animatedFrameId) {
        cancelAnimationFrame(animatedFrameId);
        animatedFrameId = null;
    }

    if(!game.running){
        game.running = true;
    }

    if (performance.now() - lastWaveTime > 5000) {
        startWave();
        lastWaveTime = performance.now();
    }


    animatedFrameId = requestAnimationFrame(gameLoop);
}

function gameLoop(timeStamp){
    if(!game.running && !game.inMenu) {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (!game.showGameOverScreen) {
        if (game.wave >= 4 && Math.random() < game.healthDropChance) {
            const type = getBoosterType();
            scheduleBoosterDrop(type, 2000, canvas);
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateStars(canvas);
    movePlayer(canvas.width, game);
    updateBullets(game);
    updateAliens(canvas.width, canvas.height, game.wave, game);
    updateAlienBullets(canvas.height);
    updateBoosters(canvas.height, game);

    drawStars(ctx);
    drawPlayer(ctx, assets, game);
    drawBullets(ctx);
    drawAlienBullets(ctx);
    drawAlien(ctx, assets);
    drawExplosion(ctx, assets, game);
    drawUI(ctx, game);
    drawBooster(ctx, assets);

    checkBulletCollision(bullets, aliens, game)
    checkAlienPlayerCollision(aliens, player, game);

    if (boosters.length > 0) {
        checkBoosterCollection(player, game);
    }
    
    checkGameOver(game);

    if (game.running && aliens.length === 0 && timeStamp - lastWaveTime > spawnDelay) {
        nextWave(game, canvas.width);

        if (game.wave >= 4){

            const healthDropChance = game.wave >= 10 ? 0.95 : 0.75;

            if (game.health < game.maxHealth * 0.60 && Math.random() < healthDropChance) {
                const randomX = Math.random() * (canvas.width - 30);
                spawnBooster('health', randomX, -30);
                console.log("Emergency Health Booster!");
            }
            
            if (!game.activeBooster) {
                const boosterTypes = ['health', 'shield', 'fireRate', 'multiShot', 'bomb'];

                const boosterCount = Math.random() < (game.wave >= 10 ? 0.9 : 0.5) ? 2 : 1;

                for (let i = 0; i < boosterCount; i++) {
                    const randomType = boosterTypes[Math.floor(Math.random() * boosterTypes.length)];
                    scheduleBoosterDrop(randomType, 2000 + i * 4000, canvas, game);
                }
        
            }
        }

        lastWaveTime = timeStamp;
    }

    if (game.activeBooster && Date.now() >= game.boosterExpireTime) {
        console.log("Booster expired:", game.activeBooster);

        if (game.activeBooster === 'shield') {
            game.shieldBoosterActive = false;
            player.invulnerableFrames = 0;
        }
        game.activeBooster = null;

        if (game.missedBooster && aliens.length > 0) {
            setTimeout(() => {
                const randomX = Math.random() * (canvas.width - 30);
                spawnBooster(game.missedBooster, randomX, -30);
                game.missedBooster = null;
            }, 2500);
        }
        
    }
        
    animatedFrameId = requestAnimationFrame(gameLoop);
}


function handleInput() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        player.movingLeft = true;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        player.movingRight = true;
      }
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        player.shooting = true;
      }
    });
  
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft') player.movingLeft = false;
      if (e.key === 'ArrowRight') player.movingRight = false;
      if (e.key === ' ' || e.key === 'Spacebar') player.shooting = false;
    });
  }
  

export function resetGame(){
    if (!player) return; 

    game.score = 0;
    game.wave = 0;
    game.health = 300;
    game.activeBooster = null;
    game.boosterTime = 0;
    game.showGameOverScreen = false;
    game.shieldBoosterActive = false;
    game.missedBooster = null;
    game.explosion = [];

    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - player.height - 20;

    player.movingLeft = false;
    player.movingRight = false;
    player.shooting = false;
    player.shootCooldown = 0;
    player.invulnerableFrames = 0;
    player.fireRateBoosterFrames = 0;
    player.multiShotFrames = 0;

    cancelAlienSpawns();

    bullets.length = 0;
    clearAliens();
    boosters.length = 0;

    cancelAnimationFrame(animatedFrameId);
    animatedFrameId = null;

    cancelBoosterDrops();

    initStars(canvas);
    lastWaveTime = performance.now();

    game.nextWaveTime = performance.now() + 2000;

    document.getElementById("gameOverText").style.display = "none";
    document.getElementById("gameOverButtons").style.display = "none";
    document.getElementById("pauseButton").style.display = "inline-block";
}

function loadImages(callback) {
    let loaded = 0;
    let total = 5;

    function checkDone() {
        loaded++;
        if(loaded == total) callback();
    }

    assets.player = new Image();
    assets.player.onload = checkDone;
    assets.player.src = './assets/images/playerShip.png';

    assets.alien1 = new Image();
    assets.alien1.onload = checkDone;
    assets.alien1.src = './assets/images/alien1.png';

    assets.alien2 = new Image();
    assets.alien2.onload = checkDone;
    assets.alien2.src = './assets/images/alien2.png';

    assets.boss = new Image();
    assets.boss.onload = checkDone;
    assets.boss.src = './assets/images/boss.png';

    assets.bullet = new Image();
    assets.bullet.onload = checkDone;
    assets.bullet.src = './assets/images/bullet.png';

    assets.boosters = {
        health: new Image(),
        shield: new Image(),
        fireRate: new Image(),
        multiShot: new Image(),
        bomb: new Image()
    };

    assets.boosters.health.src = './assets/images/healthBooster.png';
    assets.boosters.bomb.src = './assets/images/bombBooster.png';
    assets.boosters.multiShot.src = './assets/images/multiShotBooster.png';
    assets.boosters.shield.src = './assets/images/shieldBooster.png';
    assets.boosters.fireRate.src = './assets/images/fireRateBooster.png';

    total += 5;
    for (const key in assets.boosters) {
        assets.boosters[key].onload = checkDone;
    }

    assets.explosion = new Image();
    assets.explosion.src = './assets/images/explosion.png';
    assets.explosion.onload = checkDone;
    total++;
}

let homeCanvas = null;
let homeCtx = null;
let homeAnimationId = null;

function startHomeLoop() {
    homeCanvas = document.getElementById('gameCanvas');
    homeCtx = homeCanvas.getContext('2d');
    initStars(homeCanvas);

    function loop() {
        homeCtx.clearRect(0, 0, homeCanvas.width, homeCanvas.height);
        updateStars(homeCanvas);
        drawStars(homeCtx);
        homeAnimationId = requestAnimationFrame(loop);
    }

    loop(); 
}


window.onload = () => {
    startHomeLoop();

    const startBtn = document.getElementById('startButton');
    const restartBtn = document.getElementById('restartButton');
    const pauseBtn = document.getElementById('pauseButton');
    const quitBtn = document.getElementById('quitButton');
    const homeBtn = document.getElementById('homeButton');
    const overlay = document.getElementById("homeOverlay");

    startBtn.addEventListener('click', () => {
        cancelAnimationFrame(homeAnimationId); 
        game.inMenu = false;
        initGame();
        game.running = true;

        document.getElementById("homeImageContainer").style.display = "none";
        document.getElementById("quitButton").style.display = "inline-block";
        if (overlay) overlay.style.display = "none";
        document.getElementById("ui").style.display = "none";
        startBtn.style.display = "none";

        themeMusic = themeSong('./assets/audio/earthDefenderTheme.mp3');

        startGameLoop();
        
    });

    pauseBtn.addEventListener('click', () => {
        if(game.running) {
            pauseGame(game);
            cancelAnimationFrame(animatedFrameId);
            pauseBtn.textContent = "Resume";
            if (themeMusic) themeMusic.pause();
        } else {
            resumeGame(game);
            startGameLoop();
            pauseBtn.textContent = "Pause";
            if (themeMusic) themeMusic.play();
        }
    });

    restartBtn.addEventListener('click', () => {
        cancelAnimationFrame(animatedFrameId);
        restartBtn.textContent = "Restart";
        game.running = false;
        game.inMenu = true;
        
        if (themeMusic) {
            themeMusic.pause();
            themeMusic.currentTime = 0;
            themeMusic.play();
        }

        resetGame();
        startGameLoop();
        initGame();
    });

    quitBtn.addEventListener('click', () => {
        cancelAnimationFrame(animatedFrameId);
        quitBtn.textContent = "Quit";
        game.running = false;
        game.inMenu = true;

        
    // Hide game elements
    document.getElementById("ui").style.display = "block";
    document.getElementById("controls").style.display = "flex";
    document.getElementById("pauseButton").style.display = "inline-block";
    document.getElementById("gameOverText").style.display = "none";
    document.getElementById("gameOverButtons").style.display = "none";
    document.getElementById("startButton").style.display = "inline-block";

    // Show home logo and overlay again
    document.getElementById("homeImageContainer").style.display = "block";
    if (overlay) overlay.style.display = "none";

    document.getElementById("quitButton").style.display = "none";


    // Stop music
    if (themeMusic) themeMusic.pause();

    // Start only the star animation again
    startHomeLoop();
    resetGame();
    });


    homeBtn.addEventListener('click', () => {
        location.reload();
    });
};

