
	$(document).ready(function(){
		var game = {};
		var test = false;
		var canvas = document.getElementById("menuCanvas");
		game.contextBackground = document.getElementById("backgroundCanvas").getContext("2d");
		game.contextPlayer = document.getElementById("playerCanvas").getContext("2d");
		game.contextEnemies = document.getElementById("enemiesCanvas").getContext("2d");
		game.contextMenu = canvas.getContext("2d");

		game.width = canvas.width;
		game.height = canvas.height;
		game.x = 0;
		game.y = 0;

		game.titleText = ["EARTH INVADERS"];

		game.images = [];
		game.doneImages = 0;
		game.requiredImages = 0;

		game.player = {
			x: game.width / 2 - 15,
			y: game.height - 60,
			width: 25,
			height: 40,
			speed: 3,
			rendered: false,
			direction: 4
		};

		game.playerReset = {
			x: game.width / 2 - 15,
			y: game.height - 60,
			width: 30,
			height: 30,
			speed: 3,
			rendered: false
		};

		game.enemies = [];
		game.enemiesShoots = [];

		/*game.count = 100;
		game.division = 200;*/
		game.left = false;
		game.down = false;
		game.enemySpeed = 1;
		game.enemySpeedY = 1;
		/*game.countMoveY = 0;
		game.maxCountMoveY = 20;*/
		//https://www.youtube.com/watch?v=KI4AbBNlf68
		game.soundMusic = new Audio("sounds/SpellingPhailer_The_Leap.mp3");
		game.soundMusic.volume = .10;
		game.bigExplodeSound = new Audio("sounds/Explosion54.wav");
		game.bigExplodeSound.volume = .10;
		game.explodeSound = new Audio("sounds/Explode.wav");
		game.explodeSound.volume = .10;
		game.shootSound = new Audio("sounds/shoot.wav");
		game.shootSound.volume = .10;
		game.soundWon = new Audio("sounds/Randomize37.wav");
		game.soundWon.volume = .10;
		game.moving = false;
		game.time = 0;
		game.puntuation = 0;

		game.fullShootTimer = 20;
		game.shootTimer = game.fullShootTimer;

		game.gameOver = false;
		game.gameWon = false;
		game.stop = false;
		game.reset = false;
		game.drawGammingScreen = false;
		game.stateGame = "Stop"

		game.projectiles = [];
		game.speedProjectil = 5;

		game.keys = [];

		game.levelChoise = 1
		game.levelGame = 1
		game.numRound = 1;
		game.levels = [
			{velShootEne: 2,
			freqShootEne: 20,
			velEnemyX: 2.5,
			velEnemyY: 3,
			numEnemyX: 10,
			numEnemyY: 1},
			{velShootEne: 3,
			velEnemyX: 4.5,
			velEnemyY: 5,
			numEnemyX: 10,
			numEnemyY: 2}
		];

		$(document).keydown(function(e){
			game.keys[e.keyCode ? e.keyCode : e.which] = true;
		});
		$(document).keyup(function(e){
			delete game.keys[e.keyCode ? e.keyCode : e.which];
		});

		/***
		stateGame
			- menu
			- creatingGame
			- playingGame
			- loseGame
			- wonGame
			- pauseGame
			- reset
		**/

		function init(){
			game.soundMusic.play();
			if(test) console.log("init");
			if(stateGame == "reset"){
				console.log("reset");
				stateReset(0);
				stateGame = "creatingGame";
			}
			if(stateGame == "nextLevel"){
				console.log("nextLevel");
				stateReset(1);
				stateGame = "creatingGame";
			}

			if(stateGame == "creatingGame"){
				console.log("iniciando juego");
				createEnemies(game.levels[levelGame-1].numEnemyX,game.levels[levelGame-1].numEnemyY * game.numRound);
				drawGammingScreen();
				updateGame();
				renderGame();
				stateGame = "playingGame";
				loop();
				game.reset = false;
			}else{
				setTimeout(function(){
					init();
				},10)
			}
		}

		function loop(){
			if(test) console.log("loop");
			if(stateGame == "playingGame"){
				requestAnimFrame(function(){
					loop();
				});	
				if(!game.stop){
					if(!game.gameOver && !game.gameWon){
						renderGame();
						updateGame();	
					}
					if(game.gameOver){
						renderStateOver();
						updateGameStatus();
					}
					if(game.gameWon){
						renderStateWon();
						updateGameStatus();
					}
				}else{
					renderStatePause();
					updateGameStatus();
				}

			}else{
				init();
			}
				
		}		


		/******
		******* Player functions
		*******/
		function updatePlayer(){
			if(test) console.log("updatePlayer");
			if(game.shootTimer > 0 ) game.shootTimer--;
			if((game.keys[37] || game.keys[65]) && !game.gameOver){
				if(game.player.x > 30){
					game.player.x -= game.player.speed;
					game.player.rendered = false;
					game.player.direction = 1;
				}
			}

			if((game.keys[39] || game.keys[68])  && !game.gameOver){
				if(game.player.x < game.width - 60){
					game.player.x += game.player.speed;
					game.player.rendered = false;
					game.player.direction = 2;
				}
			}
			if((game.keys[38] || game.keys[87])  && !game.gameOver){
				if(game.player.y > 30){
					game.player.y -= game.player.speed;
					game.player.rendered = false;
					game.player.direction = 0;
				}
			}
			if((game.keys[40] || game.keys[65]) && !game.gameOver){
				if(game.player.y < game.height - 60){
					game.player.y += game.player.speed;
					game.player.rendered = false;
					game.player.direction = 3;
				}
			}
			if((game.keys[32] || game.keys[96]) && game.shootTimer <= 0 && !game.gameOver){
				addBullet();
				game.shootSound.play();
				game.shootTimer = game.fullShootTimer;
			}
			if(game.keys[27] && !game.gameOver && !game.gameWon){
				// PRESSED ESC
				game.stop = true

			}
			if(game.keys[80] && !game.gameOver && !game.gameWon){
				// PRESSED P
			}
		}

		function renderPlayer(){
			if(!game.player.rendered){
				game.contextPlayer.clearRect(game.player.x-1, game.player.y-3, game.player.width+2, game.player.height+6);
				game.contextPlayer.drawImage(game.images[game.player.direction], game.player.x, game.player.y, game.player.width, game.player.height);
				game.player.rendered = false;
				game.player.direction = 4;
			}
		}

		function updatePlayerShoots(){
			for(i in game.projectiles){
				game.projectiles[i].y -= game.speedProjectil;
				if(game.projectiles[i] <= -game.projectiles[i].height){
					game.projectiles.splice(i,1);
				}				
			}
			game.projectiles = game.projectiles.filter(function(shoot){
				return (shoot.collisionBullets == false);
			})
		}

		function renderPlayerShoots(){
			for(i in game.projectiles){
				var proj = game.projectiles[i];
				game.contextEnemies.clearRect(proj.x + (game.player.width - proj.width) / 2 , proj.y, proj.width, proj.height + 4);
				game.contextEnemies.drawImage(game.images[proj.image], proj.x + (game.player.width - proj.width) / 2 , proj.y, proj.width, proj.height);
			}			
		}

		function addBullet(){
			game.projectiles.push({
				x: game.player.x,
				y: game.player.y,
				width: 12,
				height: 12,
				image: 7,
				collisionBullets: false
			});
		}
		/******
		******* Enemies functions
		*******/
		function createEnemies(numX, numY){
			if(test) console.log("createEnemies");
			for(y = 0 ; y < numY; y++){
				for(x = 0 ; x < numX ; x ++){
					game.enemies.push({
						y: y * 30 + 50,
						x: (canvas.height + 10) / numX * x + canvas.height / numX,
						width: 30,
						height: 30,
						image: 5,
						dead: false,
						deadTime: 20
					})
				}
			}
		}

		function updateEnemies(){
			if(test) console.log("updateEnemies");
			/*if(game.count > 100000) game.count = 0;
			
			game.count++;*/
			//Deleting dead enemies
			for(i in game.enemies){
				if(game.enemies[i].dead){
					game.enemies[i].deadTime--;
				}
				if(game.enemies[i].dead && game.enemies[i].deadTime <= 0){
					game.contextEnemies.clearRect(game.enemies[i].x-2, game.enemies[i].y, game.enemies[i].width+5 , game.enemies[i].height);
					game.enemies.splice(i,1);

				}
			}

			/*if(game.count % game.division == 0){
				game.left = !game.left;
			}*/
			game.down = false;
			for(i in game.enemies){
				if(game.enemies[i].x <= 40){
					game.left = false;
					game.down = true;
				}else if(game.enemies[i].x >= game.width - 60){					
					game.left = true;
					game.down = true;
				}
			}

			for(i in game.enemies){
					if(game.left){
						game.enemies[i].x -= game.levels[game.levelGame-1].velEnemyX * game.levelChoise;
					}else{
						game.enemies[i].x += game.levels[game.levelGame-1].velEnemyX * game.levelChoise;
				}

				if(game.down){
					game.enemies[i].y += game.levels[game.levelGame-1].velEnemyY;
				}


				if(game.enemies[i].y >= game.height - game.enemies[i].height - 50){
					game.gameOver = true;
				}
			}


			//END GAME
			if(game.enemies.length <= 0){
				game.numRound ++;
				game.gameWon = true;
				game.soundWon.play();
			}
		}

		function renderEnemies(){
			game.contextEnemies.clearRect(0, 0, game.width, game.height);
			if(test) console.log("renderEnemies");
			for(i in game.enemies){
				var enemy = game.enemies[i];
				//game.contextEnemies.clearRect(enemy.x-2, enemy.y, enemy.width+5, enemy.height);
				if(game.left){
					if(!enemy.dead)
						enemy.image = 5
					else
						enemy.image = 11
				}	
				else{
					if(!enemy.dead)
						enemy.image = 6
					else
						enemy.image = 12
				}
				if(randomShoots(0,game.enemies.length * 20) == 4){
					game.enemiesShoots.push(addEnemiesShoots(enemy));
				}	
				
				game.contextEnemies.drawImage(game.images[enemy.image], enemy.x, enemy.y, enemy.width, enemy.height)
			}
		}

		function addEnemiesShoots(enemy){
			return{
				x: enemy.x + enemy.width/2,
				y: enemy.y + enemy.height,
				width: 7,
				height: 7,
				counter: 0,
				collision: false
			}
		}
		function randomShoots(inf, sup){
			var posibilities = sup - inf;
			var rand = Math.random() * posibilities;
			rand = Math.floor(rand);
			return parseInt(inf) + rand;
		}

		function updateEnemiesShoots(){	
			for(var i in game.enemiesShoots){
				var shoot = game.enemiesShoots[i];
				shoot.y += game.levels[game.levelGame-1].velShootEne;
			}
			game.enemiesShoots = game.enemiesShoots.filter(function(shoot){
				return shoot.y < canvas.height;
			})
			
		}
		function renderEnemiesShoots(){
			for(var i in game.enemiesShoots){
				var shoot = game.enemiesShoots[i];
				game.contextEnemies.save();
				game.contextEnemies.drawImage(game.images[8], shoot.x, shoot.y, shoot.width, shoot.height);
				game.contextEnemies.restore();
			}
		}
		/******
		******* Collision functions
		*******/
		function collision(first, second){
			return !(first.x > second.x + second.width || 
					first.x + first.width < second.x   || 
					first.y > second.y + second.height ||
					first.y + first.height < second.y)
		}

		function updateCollisions(){
			//Update collisions
			for(m in game.enemies){
				for(p in game.projectiles){
					if(collision(game.enemies[m], game.projectiles[p])){
						game.puntuation += 10;
						game.enemies[m].dead = true;
						game.explodeSound.play();
						game.contextEnemies.clearRect(game.projectiles[p].x, game.projectiles[p].y, game.projectiles[p].width + 20 , game.projectiles[p].height+10);
						game.projectiles.splice(p,1);
					}
				}
				if(collision(game.enemies[m], game.player)){
					game.gameOver = true;
				}
			}

			
			for(var i in game.enemiesShoots){
				var shoot = game.enemiesShoots[i];
				if(collision(shoot, game.player)){
					game.gameOver = true;
				}
			}
			
			for(p in game.projectiles){
				for(var i in game.enemiesShoots){
					var shoot = game.enemiesShoots[i];
					if(collision(shoot, game.projectiles[p])){
						shoot.collisionBullets = true;
						game.enemiesShoots.collisionBullets = true;
					}
				}
			}
			if(game.gameOver)
				game.bigExplodeSound.play();

		}

		/******
		******* Game Status functions
		*******/
		function updateGameStatus(){
			if(test) console.log("updateGameStatus");
			if(game.keys[13] && game.gameOver){
				if(!game.stop){
					game.levelGame = levelGame;
					setFrameHidden("canvasContainer");
					setFrameHidden('menuContainer');
					game.gameOver = false;
					game.stop = true;
					stateGame = "menu"
				}
			}else{

			}
			if(game.keys[13] && game.gameWon){
				if(!game.stop){
					game.gameWon = false;
					game.stop = true;
					stateGame = "nextLevel"
					if(game.numRound == 4 && game.levelGame == 1){
						game.levelGame = 2;
						game.numRound = 1;
					}
					if(game.numRound == 3 && game.levelGame == 2){
						game.numRound = 1;
						game.levels[game.levelGame-1].velShootEne++ ;
					}
				}
			}
			if(game.keys[82] && game.gameOver && !game.gameWon){
				// PRESSED R
				game.numRound = 1;
				game.levelGame = 1
				game.gameWon = false;
				game.stop = true;
				stateGame = "reset"	
			}
			if(game.keys[89] && game.stop){
				// PRESSED Y
				game.levelGame = levelGame;
				setFrameHidden("canvasContainer");
				setFrameHidden('menuContainer');
				game.gameOver = false;
				game.stop = true;
				stateGame = "menu";
			}
			if(game.keys[78] && game.stop){
				// PRESSED N
				game.stop = false;
				game.contextMenu.clearRect(game.width / 2 - 160, game.height - 250, 360, 200);
			}
		}

		function updateGame(){
			if(test) console.log("updateGame");
			updateCollisions();
			updatePlayer();
			updateEnemies();
			updateGameStatus();
			updatePlayerShoots();
			updateEnemiesShoots();
		}

		function renderGame(){
			if(test) console.log("renderGame");
			renderPlayer();
			renderEnemies();
			renderPlayerShoots();
			renderEnemiesShoots();
			if(game.gameWon){
				renderStateWon();
			}
			if(game.gameOver){
				renderStateOver();
			}
			if(!game.gameOver && !game.gameWon){
				renderStatePlaying();
			}
			
			
		}

		/*Game states
		**** PLAYING
		**** PAUSE
		**** WON
		**** OVER
		****/


		function renderStatePlaying(){
			if(test) console.log("renderStatePlaying");
			game.time++;
			game.contextMenu.font = "bold 25px monaco";
			game.contextMenu.fillStyle = "#00ff00";				
			game.contextMenu.clearRect(45, 29, 710, 50);
			game.contextMenu.fillText("Level: " + game.levelGame, 100, 50);
			game.contextMenu.fillText("Round: " + game.numRound, 220, 50);
			game.contextMenu.fillText("Score: " + game.puntuation, 410, 50);
			game.contextMenu.fillText("Time: " + game.time/100, 550, 50);
		}

		function renderStatePause(){
			if(test) console.log("renderStateOver");
			game.contextMenu.save();
			game.contextMenu.shadowColor = '#111';
			game.contextMenu.shadowBlur = 2;
			game.contextMenu.shadowOffsetX = 0;
			game.contextMenu.shadowOffsetY = 0;
			game.contextMenu.font = "bold 25px monaco";
			game.contextMenu.fillStyle = "#DDffDD";
			game.contextMenu.fillText("Do you want to exit?",game.width / 2 - 140, game.height - 150);
			game.contextMenu.fillText("Press Y (Yes) or N (No)",game.width / 2 - 130, game.height - 100);
			game.contextMenu.restore();
		}

		function renderStateWon(){
			if(test) console.log("renderStateWon");
			game.contextPlayer.save();
			game.contextPlayer.fillStyle = "#00ff00";	
			game.contextPlayer.font = "bold 80px monaco";
			game.contextPlayer.shadowColor = '#111';
			game.contextPlayer.shadowBlur = 2;
			game.contextPlayer.shadowOffsetX = 0;
			game.contextPlayer.shadowOffsetY = 0;
			game.contextPlayer.fillText("You won!",game.width / 2 - 165, game.height / 2 - 25);
			game.contextPlayer.font = "bold 25px monaco";
			game.contextPlayer.fillStyle = "#DDffDD";
			game.contextPlayer.fillText("Press ENTER to continue",game.width / 2 - 140, game.height - 150);
			game.contextPlayer.restore();

		}

		function renderStateOver(){
			if(test) console.log("renderStateOver");
			game.contextEnemies.clearRect(0, 0, game.width, game.height);
			game.contextPlayer.save();
			game.contextPlayer.fillStyle = "#00ff00";	
			game.contextPlayer.font = "bold 50px monaco";
			game.contextPlayer.shadowColor = '#111';
			game.contextPlayer.shadowBlur = 2;
			game.contextPlayer.shadowOffsetX = 0;
			game.contextPlayer.shadowOffsetY = 0;
			game.contextPlayer.fillText("Game Over", game.width / 2 - 120, game.height / 2 - 25);
			game.contextPlayer.font = "bold 25px monaco";
			game.contextPlayer.fillStyle = "#DDffDD";
			game.contextPlayer.fillText("Press ENTER to continue",game.width / 2 - 140, game.height - 150);
			game.contextPlayer.fillText("Press R to restard game",game.width / 2 - 130, game.height - 100);
			game.contextPlayer.restore();
		}

		function stateReset(all){
			if(test) console.log("stateReset");
			if(!all){
				game.puntuation = 0;
				game.time = 0;
				game.numRound = 1;
				game.levelChoise = levelGame;
				game.levelGame = 1;
			}
			game.contextMenu.clearRect(game.width / 2 - 160, game.height - 250, 360, 200);
			game.enemiesShoots = [];
			game.player.x = game.playerReset.x;
			game.player.y= game.playerReset.y;
			game.player.speed = game.playerReset.speed;
			game.player.rendered = game.playerReset.rendered;
			game.projectiles = [];
			game.keys = [];
			game.enemies = [];
			game.contextEnemies.clearRect(0,0,game.width,game.height);
			game.contextPlayer.clearRect(0,0,game.width,game.height);
			game.gameOver = false;
			game.gameWon = false;
			game.stop = false;
		}

		function initImages(paths){
			if(test) console.log("initImages");
			game.requiredImages = paths.length;
			for(i in paths){
				var img = new Image;
				img.src = paths[i];
				game.images[i] = img;
				game.images[i].onload = function (){
					game.doneImages ++;
				}
			}
		}

		function checkImages(){
			if(test) console.log("checkImages");
			if(game.doneImages >= game.requiredImages){
				init();
			}else{
				setTimeout(function(){
					checkImages();
				},1)
			}
		}

		function drawGammingScreen(){
			if(test) console.log("drawGammingScreen");
			if(!game.drawGammingScreen){
				var rectWidth = canvas.width-50;
				var rectHeight = canvas.height-50;
				var rectX = 25;
				var rectY = 25;
				var cornerRadius = 25;
				game.contextMenu.beginPath();
				game.contextMenu.strokeStyle  = "#00ff00";
				game.contextMenu.moveTo(rectX + cornerRadius, rectY);
				game.contextMenu.arcTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + cornerRadius, cornerRadius);
				game.contextMenu.arcTo(rectWidth + rectX, rectHeight + rectY, rectWidth - cornerRadius, rectHeight + rectY, cornerRadius);
				game.contextMenu.arcTo(rectX, rectHeight + rectY, rectX, rectHeight, cornerRadius);
				game.contextMenu.arcTo(rectX, rectY, rectX + cornerRadius, rectY, cornerRadius);
				game.contextMenu.lineWidth = 2;
				game.contextMenu.stroke();
				game.drawGammingScreen = true;
			}
		}

		//initImages(["player.png", "enemy.png", "bullet.png", "explosion.png"]);
		initImages(["images/player-up.png", "images/player-left.png", "images/player-right.png", "images/player-down.png", "images/player-stop.png", "images/enemy-left.png", "images/enemy-right.png","images/bullet.png", "images/bullet_enemy.png","images/explosion.png", "images/background2.jpg", "images/enemy-left-explosion.png", "images/enemy-right-explosion.png"]);
		checkImages();
	});


window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function( callback ){
          	console.log("setTimeout");
            window.setTimeout(callback, 1000 / 60);
          };
})();

function setStateGame(state){
	stateGame = state;
}

