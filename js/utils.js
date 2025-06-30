

export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function saveHighScore(score) {
    const highScore = parseInt(localStorage.getItem('highScore')) || 0;
    if(score > highScore) {
        localStorage.setItem('highScore', score);
        console.log("New high score!", score);
    }
}

export function getHighScore() {
    return parseInt(localStorage.getItem('highScore')) || 0;
}

export function themeSong(src) {
    const themeMusic = new Audio(src);
    themeMusic.loop = true;
    themeMusic.volume = 0.4;
    themeMusic.play().catch((e) => {
        console.error("Music play locked:", e.message);
    });
    return themeMusic;
}

const audioCache = {
    laser: new Audio('./assets/audio/laser.mp3'),
    alienLaser: new Audio('./assets/audio/alienLaser.mp3'),
    explosion: new Audio('./assets/audio/explosion.mp3'),
    theme: new Audio('./assets/audio/earthDefenderTheme.mp3'),
    booster: new Audio('./assets/audio/booster.mp3')
};

export function playSound(name) {
    const original = audioCache[name];
    if(!original) return;

    const sound = original.cloneNode();
    sound.volume = name === 'alienLaser' ? 0.2 + Math.random() * 0.1 : 0.4;

    sound.play().catch(e => {
        console.warn("Sound failed to play:", e);
    }); 
}
