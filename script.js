/**@type {HTMLCanvasElement} */

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let score = 0;
let gameOver = false;
let Balls = [];

ctx.font = '50px Impact';


let timeToNextBall = 0;
let BallInterval = 500; //ms
let lastTime = 0;

class Ball {
    constructor(){
        this.spriteWidth = 320;
        this.spriteHeight = 320;
        this.sizeModifier = Math.random() * 0.3 + 0.2;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 10 + 3;
        this.directionY = Math.random() * 7 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = 'Assets/ball.png';
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ', ' + this.randomColors[1] + ', ' + this.randomColors[2] + ')';
        this.hasTrail = Math.random() > 0.5;
    }
    update(){
        if(this.y < 0 || this.y > canvas.height - this.height){
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if(this.x < 0 - this.width) this.markedForDeletion = true;
        //if (this.frame > this.maxFrame) this.frame = 0;
        //else this.frame++;
        if(this.hasTrail){
            for (let i = 0; i < 5; i++){
                particles.push(new Particle(this.x, this.y, this.width, this.color));
            } 
        }

        if(this.x < 0 - this.width) gameOver =true;
    }
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, 0, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

let explosions = [];
class Explosion {
    constructor(x, y, size){
        this.image = new Image();
        this.image.src = 'Assets/boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x =x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = 'SoundEffects/boom.wav';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200; //ms
        this.markedForDeletion = false;
    }
    update(deltaTime){
        if(this.frame == 0) this.sound.play();
        this.timeSinceLastFrame += deltaTime;
        if (this.timeSinceLastFrame > this.frameInterval){
            this.frame++;
            this.timeSinceLastFrame = 0;
            if(this.frame > 5) this.markedForDeletion = true;
        }

    }
    draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size);

    }
}

function drawScore(){
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 50, 75);
    ctx.fillStyle = 'red';
    ctx.fillText('Score: ' + score, 55, 80);
    
}
function drawGameOver(){
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('Game Over, your score is  ' + score, canvas.width/2, canvas.height/2);
    ctx.fillStyle = 'red';
    ctx.fillText('Game Over, your scor e is  ' + score, canvas.width/2, canvas.height/2 + 5);
}

let particles = [];

class Particle {
    constructor(x,y,size,color){
        this.size = size;
        this.x = x + this.size/2 + Math.random() * 50 - 25;
        this.y = y + this.size/2 + Math.random() * 50 - 25;
        this.color = color;
        this.radius = Math.random() * this.size/10;
        this.maxRadius = Math.random() * 10 + 35;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
    }
    update(){
        this.x += this.speedX;
        this.radius += 0.3; //per frame
        if(this.radius > this.maxRadius - 5) this.markedForDeletion = true;
    }
    draw(){
        ctx.save();
        ctx.globalAlpha = 1 - this.radius/this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
}


window.addEventListener('click', function(e){
    //console.log(e.x, e.y);
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1,1); //1*1 pixel
    console.log(detectPixelColor);
    const pc = detectPixelColor.data;
    Balls.forEach(object => {
        if(object.randomColors[0] == pc[0] && object.randomColors[1] == pc[1] && object.randomColors[2] == pc[2]){
            //collision detected
            object.markedForDeletion = true;
            score++;
            explosions.push(new Explosion(object.x, object.y, object.width));
        }
    });

})

function animate(timestamp){
    ctx.clearRect(0,0,canvas.width,canvas.height); //oldPaints(frames)
    collisionCtx.clearRect(0,0,canvas.width,canvas.height);
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextBall +=deltaTime;
    if (timeToNextBall > BallInterval){
        Balls.push(new Ball);
        timeToNextBall = 0;
        Balls.sort(function(a,b){ //Sort Method
            return a.width - b.width;
        });
    };
    drawScore();
    [...particles, ...Balls, ...explosions].forEach(object => object.update(deltaTime)); //spreadOperator with Arrays
    [...particles, ...Balls, ...explosions].forEach(object => object.draw());
    Balls = Balls.filter(object => !object.markedForDeletion);
    explosions = explosions.filter(object => !object.markedForDeletion);
    particles = particles.filter(object => !object.markedForDeletion);
    if(!gameOver) requestAnimationFrame(animate); //call-back function
    else drawGameOver();
}

animate(0);