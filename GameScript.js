//Grabbing a reference to the canvas itself
var canvas = document.getElementById('myCanvas');
//2D renderring context for Canvas
//i.e. What allows us to dick about with the canvas itself
var ctx = canvas.getContext('2d');

class Brick{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 35;
        this.height = 10;
        this.state = 1;
    }

    drawBrick(){
        if (this.state != 0){
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.closePath();
        }
    }
}

//Constants needed
var score = 0;
var win   = false;
var lives = 3;

//Ball
var x      = canvas.width/2;
var y      = canvas.height-30;
var dx     = 5;
var dy     = 1;
var radius = 10;

//Paddle
var pad_width      = 60;
var pad_height     = 10;
var pad_x          = (canvas.width/2) - (pad_width/2);
var pad_y          = canvas.height - radius;
var movement_speed = 20; //Keyboard control

//Bricks
bricks = makeBricks(); //3 x 6 array with bricks

function makeBricks(){
    //Return 3 rows with 6 bricks each
    bricks = []
    for (var row = 50; row < 150; row+= 35){
        var brick_row = []
        for (var column = 25; column < 525; column += 100){
            brick_row.push(new Brick(column, row));
        }
        bricks.push(brick_row);
    }
    return bricks;
}


function draw() { //main game loop
    if ((!win) && (lives > 0)){
        ctx.clearRect(0, 0, canvas.width, canvas.height); //Clears the screen every frame
        drawScore();
        drawLives();
        drawBall();
        drawPaddle();
        drawBricks(bricks);
        collisionHandler(x, y);
        x += dx;
        y -= dy;
    }
    requestAnimationFrame(draw);
}

function winningScreen(){
    alert('Gz ez gg');
    document.location.reload();
}

function drawScore(){
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 8, 20);
}

function drawLives(){
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Lives: ' + lives, canvas.width - 65, 20);
}

function drawPaddle(){
    ctx.beginPath();
    ctx.rect(pad_x, pad_y, pad_width, pad_height);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();
}

function drawBricks(bricks){ //Don't change this - this doesn't matter
    for (var i = 0; i < bricks.length; i++){
        //console.log(row);
        for (var j = 0; j < bricks[i].length; j++){
            bricks[i][j].drawBrick();
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
}

function collisionHandler(x, y) { //x, y are position of ball
    //Ball collides with a brick

    for (var row = 0; row < bricks.length; row++){
        for (var col = 0; col < bricks[row].length; col++){
            b = bricks[row][col];
            //Need to implement better collision detection tbh
            if ((y > b.y) && (y < b.y + b.height) && (x > b.x) && (x < b.x + b.width)){
                dy *= -1;
                b.status--;
                bricks[row].splice(col,1); //Delete the brick from bricks array
                score++;

                //Check if you've won
                if (emptyBricks(bricks.length - 1)){
                    win = true;
                    winningScreen();
                }
            }
        }
    }

    //Ball rebounds off wall or paddle
    if ((x + radius > canvas.width) || (x - radius < 0 )){ //Handles horizontal collision with walls
        dx *= -1;
    }
    if ((y -radius <= 0) || //Handles collisions with vertical wall
       ((y + radius >= pad_y) && (x >= pad_x) && (x <= pad_x + pad_width))){ //Handles collsions with paddle
        dy -= 2*dy;
    }

    //Ball hits floor
    if (y + radius >= canvas.height){
        lives--;
        if (lives <= 0){
            gameOverScreen();
        } else {
            resetScreen();
        }
    }
}

function resetScreen(){
    //Reset paddle
    pad_x = (canvas.width/2) - (pad_width/2);
    //Reset ball and projection
    x     = canvas.width/2;
    y     = canvas.height-30;
    dx    = 5;
    dy    = 1;
}

function emptyBricks(i){
    if (i == -1){
        return true;
    } else {
        return (bricks[i].length == 0) && (emptyBricks(i-1));
    }
}

function gameOverScreen(){
    lives = 0;
    drawLives();
    alert('GAME OVER');
    document.location.reload(); //Reloads game
}

function keyDownHandler(e){
    if (e.keyCode == 39){
        if (pad_x + pad_width < canvas.width) {
            pad_x += movement_speed;
        }
    }
    else if (e.keyCode == 37){
        if (pad_x > 0) {
                pad_x -= movement_speed;
        }
    }
}

function mouseMoveHandler(e){
    var relativeX = e.clientX - canvas.offsetLeft; //i.e. Mouse has moved from the center
    if ((relativeX > 0) && (relativeX < canvas.width)){
        pad_x = relativeX - pad_width/2; //fix this so that paddle can't move off screen
    }
}

document.addEventListener('mousemove', mouseMoveHandler, false);
document.addEventListener('keydown', keyDownHandler, false); //Checks every frame if you've pressed a button
draw();//setInterval(draw, 10); //This will call the function draw every 10ms
