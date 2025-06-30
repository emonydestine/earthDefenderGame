let stars = [];

const layers = [
    {count: 50, speed: 0.3, size: 1},
    {count: 35, speed: 0.6, size: 2},
    {count: 20, speed: 1.0, size: 3}
];

export function initStars(canvas){
    stars = [];
    for(const layer of layers){
        for(let i = 0; i < layer.count; i++){
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * layer.size + 0.5,
                speed: layer.speed,
                alpha: Math.random()* 0.5 + 0.5
            });
        }
    }
}

export function updateStars(canvas){
    for(let star of stars){
        star.y += star.speed;

        if(star.y > canvas.height){
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    }
}

export function drawStars(ctx){
    ctx.save();
    for(let star of stars){
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
}