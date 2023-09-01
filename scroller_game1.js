/**   1. Game and Canvas Variables.
 *    2. Class to Handle Keyboard inputs.
 *    3. Class for Player, Backgrounde, Enemy.
 *    4. Functions to handle enemy, display text etc.
 *    5. Defining objects and time variables.
 *    6. Animate() function.
 */

window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    const CANVAS_WIDTH = canvas.width = 800;
    const CANVAS_HEIGHT = canvas.height = 540;
    let enemies =[];
    let score = 0;
    let enemySpeed = 8;
    let prevScore = 0; // it is used in 'Enemy' class to increase the speed of enemy.
    let highestScore = 0;
    let gameOver = false;

    if(this.localStorage.getItem("hScoreStored")){
        highestScore = this.localStorage.getItem("hScoreStored");
    }
    
    // to handle the keyboard inputs.
    class InputHandler {
        constructor(){
            this.keys = [];
            window.addEventListener('keydown', e=>{
                if( (e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp'   ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight')
                    && this.keys.indexOf(e.key) === -1){
                    this.keys.push(e.key);
                }
            })
            window.addEventListener('keyup', e=>{
                if(e.key === 'ArrowDown' ||
                     e.key === 'ArrowUp'   ||
                     e.key === 'ArrowLeft' ||
                     e.key === 'ArrowRight'){
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            })
        }
    }

    class Player {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.spritewidth = 200;
            this.spriteheight = 200;
            this.width = 150;
            this.height = 150;
            this.x = 0;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('playerImage');
            this.frameX = 0;
            this.maxFrame = 8;
            this.frameY = 0;
            this.fps = 20; // how fast we swap between animation frame in enemy sprite sheet.
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.speed = 0;
            this.vy = 0;
            this.weight = 1;
        }
        draw(context){
            context.fillStyle = 'white';
            // context.fillRect(this.x , this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX*this.spritewidth, this.frameY*this.spriteheight, this.spritewidth, this.spriteheight, this.x, this.y, this.width, this.height)
        }
        update(input , deltaTime, enemies){
            // collision detection -- circle method.
            enemies.forEach(enemy=>{
                const dx = (enemy.x + enemy.width/2) - (this.x + this.width/2);
                const dy = (enemy.y + enemy.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if(distance < enemy.width/2 + this.width/2){
                    gameOver = true;
                }
            })

            if(this.frameTimer > this.frameInterval){
                if(this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX ++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            // if(this.frameX >= this.maxFrame) this.frameX = 0;
            // else this.frameX++;
            if(input.keys.indexOf('ArrowRight') > -1){
                this.speed = 5;
            } else if(input.keys.indexOf('ArrowLeft') > -1){
                this.speed = -5;
            } else if(input.keys.indexOf('ArrowUp') > -1  && this.onGround()){
                this.vy -= 24;
            } else {
                this.speed = 0;
            }
            
            // horizontal movement.
            this.x += this.speed;
            if(this.x < 0) this.x = 0;
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;
            // vertical movement
            this.y += this.vy;
            if(!this.onGround()){
                this.vy += this.weight;
                this.frameY = 1;
                this.maxFrame = 6;
            }
            else {
                this.vy = 0;
                this.frameY = 0;
                this.maxFrame = 8;
            }

            if(this.y > this.gameHeight - this.height) {
                this.y = this.gameHeight - this.height;
            }
        }
        onGround(){
            return this.y >= this.gameHeight - this.height;
        }
    }

    class Background {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0; 
            this.y =0;
            this.width = 1800;
            this.height = 540;
            this.speed = 2;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y);
        }
        update(){
            this.x -= this.speed;
            if(this.x <= 0 - this.width) this.x = 0;
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('enemyImage');
            this.spritewidth = 160;
            this.spriteheight = 119;
            this.width = 120;
            this.height = 90;
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 5;
            this.fps = 20; // how fast we swap between animation frame in enemy sprite sheet.
            this.frameTimer = 0; // time of the current frame
            this.frameInterval = 1000/this.fps; 
            this.speed = enemySpeed;
            this.markedForDeletion = false;
        }
        draw(context){
            context.drawImage(this.image, this.frameX*this.spritewidth, 0, this.spritewidth, this.spriteheight, this.x, this.y, this.width, this.height)
        }
        update(deltaTime){
            if( !(score % 2) && (score > prevScore) ){
                enemySpeed += 2;
                this.speed = enemySpeed;
                console.log('speed of enemy is : '+ this.speed);
            }
            prevScore = score;  
            if(this.frameTimer > this.frameInterval){
                if(this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX ++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            this.x -= this.speed;
            if(this.x < 0 - this.width) {
                this.markedForDeletion = true;
                score++;
            }
        }
    }

    function handleEnemy(deltaTime){
        if(enemyTimer > enemyInterval + randomEnemyInterval){
            enemies.push(new Enemy(canvas.width, canvas.height));
            randomEnemyInterval = Math.random() * 1000 + 500;
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        }
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        })
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }

    function displayStatusText(context){
        context.font = '30px Helvetica';
        context.fillStyle = 'black';
        context.fillText('Score: '+ score, 20, 50);
        context.fillStyle = 'white';
        context.fillText('Score: '+ score, 22, 52);

        // writing highest score on the screen.
        context.fillStyle = 'black';
        context.fillText('Highest Score: '+ highestScore, 20, 80);
        context.fillStyle = 'white';
        context.fillText('Highest Score: '+ highestScore, 22, 82);
        // written twice just to provide shadow, if it works we can use shadow property directly also.

        if(gameOver){
            context.textAlign ='center';
            context.fillStyle = 'black';
            context.fillText('GAME OVER, Try again!', canvas.width/2, 150);
            context.fillStyle = 'white';
            context.fillText('GAME OVER, Try again!', canvas.width/2 + 2, 152);
        }
    }

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);
    // const enemy1 = new Enemy(canvas.width, canvas.height);

    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 2000;
    let randomEnemyInterval = Math.random() * 1000 + 500;

    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime; // time interval between two animation frames.(for ~60fps, its value will be around 16.67 miliSeconds)
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input, deltaTime, enemies);
        handleEnemy(deltaTime);
        displayStatusText(ctx);
        if(!gameOver){
            requestAnimationFrame(animate);
        } 
        else if(score > highestScore){
            localStorage.setItem("hScoreStored", score);
        }
        // requestAnimationFrame(animate)
    }
    animate(0);

})