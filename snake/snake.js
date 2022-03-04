//TO DO
/*
 1. initialize snake with both head and a tail -done
 2. create game over animation
 3. include levels (done)
 4. prevent food from being generated on the snake
 5. Add game controls: pause, restart, end etc.-partially done
 6. Add a play again button
*/

/**
 *  get the snake canvas object and the canvas context object
 */
const cvs = document.getElementById('snake');
const ctx = cvs.getContext('2d');

/**
 *  initialize global game variables and constants
 */

// create units
const box = 32;

// create game running instance
let game;

let gameState = 0; // 0:for pausing, 1:for resuming

// game over token
let gameOver = false;
// create the score var
let score = 0;

// create game level var
let level = 0;

// create the level points var
let levelPoints = 10;

// create the direction var
let d;

// set snake movement speed
let speed =  500;
let speedRate = 10;

// user speed control token
let manualSpeedControl = false;

// load images
const ground = new Image();
ground.src = "images/ground.jpg";

const apple = new Image();
apple.src = "images/red-apple.jpg";

const headerImg = new Image();
headerImg.src = "images/bg-2.jpg";

const foodImg = new Image();
foodImg.src = "images/food.png";

//load audios
const bgAudio = new Audio();
bgAudio.src = 'audios/background.mp3';

const hitAudio = new Audio();
hitAudio.src = "audios/hit-1.mp3";

const directionAudio = new Audio();
directionAudio.src = "audios/change-direction.mp3";

const wrongMoveAudio = new Audio();
wrongMoveAudio.src = "audios/wrong-move.mp3";

const swallowAudio = new Audio();
swallowAudio.src = "audios/swallow-2.wav";

const hissAudio = new Audio();
hissAudio.src = "audios/snake-hiss.ogg";


/**
 *  game logic
 */

// create the snake
let snake = [];
snake[0] = {
    x: 9 * box,
    y: 10 * box
 } // initialize the head of the snake 

 snake[1] = {
    x: 8 * box,
    y: 10 * box
 } // initialize the tail of the snake


 // generate food
function generateFood(snakeArr) {
    // no need to loop over snake coordinates
    foodPos = [];
    for(let i = 0; i<snakeArr.length; i++) {
            foodXPos = Math.floor(Math.random()*17+1)*box;
            foodYPos = Math.floor(Math.random()*15+3)*box;

            //console.log('foodX: '+foodXPos+' - '+snakeArr[i].x+' foodY: '+foodYPos+' - '+snakeArr[i].y);
            if((snakeArr[i].x !=foodXPos) && (snakeArr[i].y !=foodYPos)){

                foodPos = {
                        x: foodXPos,
                        y: foodYPos
                }
                break; // exit loop
            }  
    }
    return foodPos;
}

// create the food
// let food = {
//     x: Math.floor(Math.random()*17+1)*box,
//     y: Math.floor(Math.random()*15+3)*box
// }

let food = generateFood(snake);

// set snake direction
document.addEventListener('keydown', direction);
function direction(event) {
    let key = event.keyCode; // set key code
    
    if(key ==37 || key == 38 || key == 39 || key == 40) {
        //prevent default arrow keys behaviour
        event.preventDefault();

        // clear starter help dialog
        document.getElementById('starter').style.display = "none"; 

        //determine control keys
        if(key==37 && d !='RIGHT') {
            d = 'LEFT';
            directionAudio.play(); // add change in direction sound effect

        } else if(key==38 && d !='DOWN') {
                d = 'UP'; directionAudio.play(); // add change in direction sound effect

        } else if(key==39 && d !='LEFT') {
                d = 'RIGHT'; directionAudio.play(); // add change in direction sound effect
                
        } else if(key==40 && d !='UP') {
                d = 'DOWN'; directionAudio.play(); // add change in direction sound effect
        } else {
            // wrong movement, e.g trying to turn left when the current direction is right
            //wrongMoveAudio.play();// disabled
        }
    }
   
    
}


function changeSpeed(token, newSpeed=null) {
    if(!gameOver) {
        clearInterval(game);  // clear old game instance
        
        // please note that speed here is equivalent to the time required to 
        // update the snake movement, so the lower the value the higer the speed. 

        //increase speed
        if(token == 'accelerate') {
            speed -= speedRate;
            speed = (speed<40)? 40: speed; //set maximum speed limit
        } else if(token == 'decelerate') {
            //reduce speed
            speed += speedRate;
            speed = (speed>1000)? 1000: speed; // set minimum speed limit
        } else if(token == 'level') {
            speed = newSpeed;
        }
        
        if(gameState != 1) {
            game = setInterval(move, speed); // restart game with new speed limit
        }
        
    }
}

function changeLevel() {
    level = Math.floor(score / levelPoints);
    
    switch(level) {
        
        case 1 :
        // level one
        level = 1;
        changeSpeed('level', 400);
        break;

        case 2 :
        // level two
        level = 2;
        changeSpeed('level', 300);
        break;

        case 3 :
        // level three
        level = 3;
        changeSpeed('level', 200);
        break;

        case 4 :
        // level four
        level = 4;
        changeSpeed('level', 100);
        break;

        case 5 :
        // level five
        level = 5;
        changeSpeed('level', 50);
        break;
    }

    manualSpeedControl = false;// deny manual game speed control
}

// check collision: this is where the snake is considered to have bitten itself
function collision(head, snakeArr) {

    for(let i = 0; i<snakeArr.length; i++) {
        if((head.x == (snakeArr[i].x)) && (head.y == (snakeArr[i].y)) ) {
            return true;
        }
    }
    return false;
}

// write text on the canvas
function writeText(text, xpos, ypos, color, font) {
    ctx.fillStyle = color;
    fontStr = '';
    ctx.font = font;
    ctx.fillText(text, xpos, ypos);
}

// draw everything

function reDraw() {

    ctx.clearRect(0, 0, cvs.width, cvs.height); // clear the canvas

    //draw background
    //ctx.drawImage(headerImg, 0, 0, cvs.width, cvs.height);

    // draw ground
    ctx.drawImage(ground, box, 3*box, (cvs.width-2*box), (cvs.height-4*box));

    // draw snake
    
    for(let i = 0; i<snake.length; i++) {
        ctx.fillStyle = (i==0)?'green':'white';
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = 'red';
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
        //ctx.clearRect(snakeX, snakeY, box, box);
    }
    // draw food
    ctx.drawImage(foodImg, food.x, food.y, 30,30);

    // draw top block
    ctx.drawImage(headerImg, 0, 0, cvs.width, (3*box));

    // draw left side block
    ctx.drawImage(headerImg, 0, 3*box, box , (cvs.height-3*box));

    // draw right side block
    ctx.drawImage(headerImg, (cvs.width-box), 3*box, box , (cvs.height-3*box));

    // draw bottom block
    ctx.drawImage(headerImg, box, (cvs.height-box), (cvs.width-2*box), box);

    let vSpace = 2.3; // for the header elements
    let fontSize = '30px';

    // write title of game
    writeText('Snake Hero', 6.5*box, 1*box, 'gray', '40px Changa one')
    
    //draw apple
    ctx.drawImage(apple, 14.5*box, (vSpace-0.8)*box, 30,30);
    // draw score
    writeText(score, 15.8*box, vSpace*box, 'white', fontSize+' Changa one');

    // draw game level
    writeText('Level: '+level, 2.5*box, vSpace*box, 'white', fontSize+' Changa one');
    // draw speed level
    speedLevel = Math.round(box/(speed/1000));
    writeText('Speed: '+speedLevel, 7*box, vSpace*box, 'white', fontSize+' Changa one');

    // draw game developer details
    writeText('Developed by: William Agyapong || Version 1.0', 1.6*box, 18.6*box, 'white', '20px Changa one');
    
    requestAnimationFrame(reDraw);//schedule this function to be run on the next frame
}

function move() {
    if(level == 0){
        changeLevel(); // change game level with the appropriate speed
    }
    else if(!manualSpeedControl) {
        changeLevel();
    }
    // get old head position
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;
    
    // move snake in the required direction
    if(d =='LEFT') snakeX -= box;
    if(d =='UP') snakeY -= box;
    if(d =='RIGHT') snakeX += box;
    if(d =='DOWN') snakeY += box;

    // when game starts - direction is set
    if(typeof d !='undefined') {
        
        let xDiff = Math.abs(food.x-snakeX); //horizontal distance between food and snake head
        let  yDiff = Math.abs(food.y-snakeY); // vertical distance between food and snake head
        //console.log('X: '+xDiff+', Y: '+yDiff);

         // detect when the snake misses the food
        if(xDiff==32 && yDiff == 32 ){
            // play this effect only when sanke misses the food
            hissAudio.play();
            
        }
        
        // detect when snake eats the food
        if((xDiff==0) && (yDiff==0)) {
            //create eating effect
            swallowAudio.play();

            //increase score
            score += 2; 


            // generate new food
            // food = {
            //     x: Math.floor(Math.random()*17+1)*box,
            //     y: Math.floor(Math.random()*15+3)*box
            // }
            food = generateFood(snake);
        } else {
            // remove the tail
            snake.pop();
        }

        // create new head
        let newHead = {
            x:snakeX,
            y:snakeY
            };
    
        // set game over rules
        if(snakeX < box || snakeX > 17*box || snakeY < 3*box || snakeY>17*box || collision(newHead, snake)) {
            //add dead sound effect
            hitAudio.play();

            // flag game over message
            document.getElementById('msg-board').style.display = 'block';
            //writeText('Game Over', 4*box, 1.6*box, 'red', '45px Changa one');

            // stop game
            gameOver = true;
            clearInterval(game);
           
        }
        
        // add new head
        snake.unshift(newHead);    
    }
    
}

reDraw();  // call the function to draw on the canvas
 game = setInterval(move, speed);
 
 document.addEventListener('keydown', function(event) {

    let key = event.keyCode;

    // control speed
    if(key ==33) {
        event.preventDefault;
        changeSpeed('accelerate');
        manualSpeedControl = true;
    } else if(key == 34) {
        event.preventDefault;
        changeSpeed('decelerate');
        manualSpeedControl = true;
    } 
    
    // handle game pausing and resuming
    if(key ==32) { //space bar
        event.preventDefault;
       
       if(!gameOver) {
            if(gameState == 0) {
                gameState = 1;
                document.getElementById('paused').style.display = 'block';
                clearInterval(game);  // pause game
               
                
            } else if(gameState == 1) {
                gameState = 0;
                document.getElementById('paused').style.display = 'none';
                game = setInterval(move, speed); // resume game
            
            }
       }
            
    }
});

//buttons
// start game
document.getElementById('start').addEventListener('click', function(){
    document.getElementById('starter').style.display = 'none';
})

// restart game
document.getElementById('restart').addEventListener('click', function() {
    window.location = 'snake-game.html';
    document.getElementById('msg-board').style.display = 'none';
});


