const video = document.getElementById('video');
const canvas = document.getElementById('gamecanvas');

const ctx = canvas.getContext('2d');

let snake = [{ x: 100, y: 100}]
let directtion = { x: 0 , y: -10}
let food = { x: 200 , y: 200}
const size = 10;

async function setupcamera() {
    video.width = 550 ;
    video.height = 350;
     
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    video.scrObject = stream;

    return new Promise ((resolve) =>{
        video.onloadedmetadata = () => {
            resolve(video)
        }
    })
}

async function loadPosenet() {
    return await posenet.load()
}

function drawSnake() { 
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    ctx.fillStyle = 'lime'; // Snake color
    snake.forEach(part => ctx.fillRect(part.x, part.y, size, size)); 
    ctx.fillStyle = 'red'; // Food color
    ctx.fillRect(food.x, food.y, size, size); 
}

function moveSnake() { // Moves the snake
    let head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head); 
    if (head.x === food.x && head.y === food.y) { 
        food = { x: Math.floor(Math.random() * canvas.width / size) * size, y: Math.floor(Math.random() * canvas.height / size) * size }; 
    } else { snake.pop(); } 
}

function checkCollision() { 
    const head = snake[0];
    if (head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height) return true; 
    for (let i = 1; i < snake.length; i++) { if (snake[i].x === head.x && snake[i].y === head.y) return true; } 
    return false; 
}

async function detectPose(net) { 
    const pose = await net.estimateSinglePose(video, { flipHorizontal: true }); 
    const nose = pose.keypoints.find(p => p.part === 'nose').position; 
    if (nose.y < 200) direction = { x: 0, y: -10 }; 
    if (nose.y > 300) direction = { x: 0, y: 10 }; 
    if (nose.x < 200) direction = { x: -10, y: 0 }; 
    if (nose.x > 400) direction = { x: 10, y: 0 }; 
}

async function gameLoop(net) { 
    moveSnake(); 
    drawSnake(); 
    if (checkCollision()) { 
        alert('Game Over!'); 
        snake = [{ x: 100, y: 100 }]; 
        direction = { x: 0, y: -10 }; 
        food = { x: 200, y: 200 }; 
    }
    await detectPose(net); 
    requestAnimationFrame(() => gameLoop(net)); 
}

async function main() { 
    await setupCamera(); 
    const net = await loadPoseNet(); 
    canvas.width = 640;
    canvas.height = 480;
    video.play(); 
    gameLoop(net); 
}

main(); 
