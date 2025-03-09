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

function drawSnake() { // Draws snake and food
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clears canvas
    ctx.fillStyle = 'lime'; // Snake color
    snake.forEach(part => ctx.fillRect(part.x, part.y, size, size)); // Draws snake parts
    ctx.fillStyle = 'red'; // Food color
    ctx.fillRect(food.x, food.y, size, size); // Draws food
}

function moveSnake() { // Moves the snake
    let head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y }; // New head position
    snake.unshift(head); // Add new head
    if (head.x === food.x && head.y === food.y) { // Check if food eaten
        food = { x: Math.floor(Math.random() * canvas.width / size) * size, y: Math.floor(Math.random() * canvas.height / size) * size }; // New food
    } else { snake.pop(); } // Remove last part if no food eaten
}

function checkCollision() { // Checks for collisions
    const head = snake[0]; // Snake head
    if (head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height) return true; // Wall collision
    for (let i = 1; i < snake.length; i++) { if (snake[i].x === head.x && snake[i].y === head.y) return true; } // Self collision
    return false; // No collision
}

async function detectPose(net) { // Detects pose
    const pose = await net.estimateSinglePose(video, { flipHorizontal: true }); // Estimate pose
    const nose = pose.keypoints.find(p => p.part === 'nose').position; // Get nose position
    if (nose.y < 200) direction = { x: 0, y: -10 }; // Move up
    if (nose.y > 300) direction = { x: 0, y: 10 }; // Move down
    if (nose.x < 200) direction = { x: -10, y: 0 }; // Move left
    if (nose.x > 400) direction = { x: 10, y: 0 }; // Move right
}

async function gameLoop(net) { // Main game loop
    moveSnake(); // Move snake
    drawSnake(); // Draw snake
    if (checkCollision()) { // Check collision
        alert('Game Over!'); // Show game over
        snake = [{ x: 100, y: 100 }]; // Reset snake
        direction = { x: 0, y: -10 }; // Reset direction
        food = { x: 200, y: 200 }; // Reset food
    }
    await detectPose(net); // Detect pose
    requestAnimationFrame(() => gameLoop(net)); // Next frame
}

async function main() { // Main function
    await setupCamera(); // Setup camera
    const net = await loadPoseNet(); // Load PoseNet
    canvas.width = 640;
    canvas.height = 480;
    video.play(); // Play video
    gameLoop(net); // Start game loop
}

main(); // Call main