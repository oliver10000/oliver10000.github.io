Player = function (game) {
	this.game = game;
	this.sprite = null;
	this.jump = -1001;
	this.maxVelocity = 500;
	this.shootRight = true;
	this.cursors = null;
};

Player.prototype.preload = function() {
	this.game.load.spritesheet('dude','https://s3-us-west-2.amazonaws.com/s.cdpn.io/9353/big-apple.png',55,55);
};

Player.prototype.create = function() {
	this.sprite = game.add.sprite(100, 200, 'dude');
	this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);

	this.sprite.body.bounce.setTo(0, 0.2);
	this.sprite.body.maxVelocity.y = this.maxVelocity;
	this.sprite.body.collideWorldBounds = true;

	this.sprite.frame = 1;
	this.cursors = this.game.input.keyboard.createCursorKeys();
};

Player.prototype.update = function() {
		if (this.cursors.left.isDown) {
			if (this.sprite.body.touching.down) {
				this.sprite.body.velocity.x -= 25;
			} else {
				this.sprite.body.velocity.x = -200;
			}

			this.sprite.frame = 0;
			this.shootRight = false;
		
		} else if (this.cursors.right.isDown) {

			if (this.sprite.body.touching.down) {
				this.sprite.body.velocity.x += 25;
			} else {
				this.sprite.body.velocity.x = 200;
			}

			this.sprite.frame = 1;
			this.shootRight = true;
		} else {
			if (this.sprite.body.velocity.x > 0) {
				this.sprite.body.velocity.x -= 50;
			} else if (this.sprite.body.velocity.x < 0 ) {
				this.sprite.body.velocity.x += 50;
			} else {
				this.sprite.body.velocity.x = 0;
			}


			this.sprite.frame = this.shootRight ?  1 :  0;
		}

		if (this.cursors.up.isDown && this.sprite.body.touching.down) {
			this.sprite.body.velocity.y = this.jump;
		}
};

Level = function (game) {
	this.game = game;
	this.platforms = null;
	this.ground = null;
	this.ledge1 = null;
	this.ledge2 = null;
	this.ledge3 = null;
};

Level.prototype.preload = function() {
	this.game.load.image('ground','https://s3-us-west-2.amazonaws.com/s.cdpn.io/9353/platform800.png');
	this.game.load.image('ledge','https://s3-us-west-2.amazonaws.com/s.cdpn.io/9353/platform.png');
};

Level.prototype.create = function() {
	this.platforms = game.add.group();
	this.platforms.enableBody = true;
	this.platforms.physicsBodyType = Phaser.Physics.ARCADE;

	this.ground = this.platforms.create(0, game.world.height - 64, 'ground');
	this.ledge1 = this.platforms.create(400, 290, 'ledge');
	this.ledge2 = this.platforms.create(-150,200,'ledge');
	this.ledge3 = this.platforms.create(400,100,'ledge');
		
	this.ground.body.immovable = true;
	this.ground.body.allowGravity = false;

	this.ledge1.body.immovable = true;
	this.ledge1.body.allowGravity = false;

	this.ledge2.body.immovable = true;
	this.ledge2.body.allowGravity = false;

	this.ledge3.body.immovable = true;
	this.ledge3.body.allowGravity = false;
};

HUD = function (game) {
	this.game = game;
	this.scoreText = null;
	this.gameText = null;

	this.style = {
		font: "15px Arial",
		fill: "#0069b0"
	};

	this.bigStyle = {
		font: "30px Arial",
		fill: "#0069b0",
		align: "center"
	};
};

HUD.prototype.create = function() {
	this.scoreText = game.add.text(20,20,'Score: ' + main_state.score, this.style);
	this.gameText = game.add.text(game.world.width/2,game.world.height/2, main_state.message, this.bigStyle);
};

HUD.prototype.update = function() {
	this.scoreText.setText('Score: ' + main_state.score);
	this.gameText.setText(main_state.message);
	this.gameText.position.x = game.world.width/2 - this.gameText.width/2;
	this.gameText.position.y = 210;
};

Bullets = function (game, player) {
	this.game = game;
	this.player = player;
	this.fire = false;
	this.bulletGroup = null;
	this.bulletTime = 0;
	this.shotDelayTime = 0;
	this.shotDelay = 200;
};

Bullets.prototype.preload = function() {
	this.game.load.image('bullet', 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/9353/bullet-gun.png');
};

Bullets.prototype.create = function() {
		this.bulletGroup = game.add.group();
		this.bulletGroup.enableBody = true;
		this.bulletGroup.physicsBodyType = Phaser.Physics.ARCADE;
		this.bulletGroup.createMultiple(30, 'bullet');

		for (var i = 0; i < 30; i++) {
			var b = this.bulletGroup.create(this.player.x, this.player.y, 'bullet');
			b.name = 'bullet' + i;
			b.exists = false;
			b.visible = false;
			b.checkWorldBounds = true;
		}

		this.bulletGroup.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetBullet, this);
};

Bullets.prototype.update = function() {
	if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && this.player.sprite.alive) {
			this.fireBullet();
			this.fire = true;
		} else {
			this.fire = false;
		}
};

Bullets.prototype.fireBullet = function () {
	if (game.time.now > this.bulletTime) {
		var bullet = this.bulletGroup.getFirstExists(false);

		if (bullet) {
			bullet.reset((this.player.shootRight ? this.player.sprite.x+40 : this.player.sprite.x), this.player.sprite.y+28);
			bullet.body.velocity.x = this.player.shootRight ? 600 : -600;
			bullet.body.allowGravity = false;
			this.bulletTime = game.time.now + 100;
		}
	}
};

Bullets.prototype.resetBullet = function (bullet) {
	bullet.kill();
};

Bullets.prototype.bulletCollides = function (targetA, targetB) {
	main_state.score++;

	targetA.kill();
	targetB.kill();
};

Apples = function (game,player) {
	this.game = game;
	this.player = player;
	this.sprites = null;
	this.totalApples = 10;
};

Apples.prototype.preload = function() {
	this.game.load.spritesheet('apple','https://s3-us-west-2.amazonaws.com/s.cdpn.io/9353/apple.png',32,32);
};

Apples.prototype.create = function() {
	this.sprites = game.add.group();
	this.sprites.enableBody = true;
	this.sprites.physicsBodyType = Phaser.Physics.ARCADE;

	for (var k = 0; k < this.totalApples; k++) {
		var apple = this.sprites.create(k * 80, 0, 'apple');
		apple.body.bounce.y = 0.7 + (Math.random() * 0.2);
	}

};

Apples.prototype.collectApple = function (targetA, targetB) {
	main_state.score += 10;

	targetB.kill();
};

Robots = function (game) {
	this.game = game;
	this.robotGroup1 = null;
	this.robotGroup2 = null;
	this.robotSpawnDelay = 1000;
	this.robotDelayTime1 = 0;
	this.robotDelayTime2 = 0;
};

Robots.prototype.preload = function() {
	this.game.load.spritesheet('baddie','https://s3-us-west-2.amazonaws.com/s.cdpn.io/9353/wheely-baddy.png',32,32);
};

Robots.prototype.create = function() {
	this.robotGroup1 = game.add.group();
	this.robotGroup1.enableBody = true;
	this.robotGroup1.physicsBodyType = Phaser.Physics.ARCADE;
	
	this.robotGroup2 = game.add.group();
	this.robotGroup2.enableBody = true;
	this.robotGroup2.physicsBodyType = Phaser.Physics.ARCADE;

	for (var j = 0; j < 4; j++) {
		var sprite1 = this.robotGroup1.create(game.world.width + (j*40), 10, 'baddie');
		sprite1.name = 'baddie' + j;
		sprite1.body.velocity.x = -100;
		sprite1.checkWorldBounds = true;
		sprite1.outOfBoundsKill = true;
		
		var sprite2 = this.robotGroup2.create(-(j*40), 10, 'baddie');
		sprite2.name = 'baddie' + j;
		sprite2.body.velocity.x = 100;
		sprite2.checkWorldBounds = true;
		sprite2.outOfBoundsKill = true;
	}

	this.robotGroup1.callAll('animations.add', 'animations', 'walk', [0,1], 10, true);

	this.robotGroup1.callAll('play', null, 'walk'); 
	
	this.robotGroup2.callAll('animations.add', 'animations', 'walk2', [2,3], 10, true);

	this.robotGroup2.callAll('play', null, 'walk2'); 
	
};

Robots.prototype.update = function() {
	if (game.time.now > this.robotDelayTime1) {
		var robot1 = this.robotGroup1.getFirstDead();

		if (robot1) {
			robot1.reset(game.world.width-40, 10);
			robot1.body.velocity.x = -100;
			this.robotDelayTime1 = game.time.now + 2500;
		}
	}

	if (game.time.now > this.robotDelayTime2) {
		var robot2 = this.robotGroup2.getFirstDead();

		if (robot2) {
			robot2.reset(10, 10);
			robot2.body.velocity.x = 100;
			this.robotDelayTime2 = game.time.now + 2500;
		}
	}
};

Robots.prototype.robotKillsPlayer = function (targetA,targetB) {
	main_state.message = 'GAME OVER!!!! \nClick the screen to play again';
	targetA.kill();
};

var game = new Phaser.Game(800, 480, Phaser.AUTO, 'game_div');

/*	Creates a new 'main' state that will contain the game */
var main_state = {

	score: 0,
	message: '',
	gravity: 1000,
	player: null,
	level: null,
	bullets: null,
	apples: null,
	hud: null,
	robots: null,

	preload: function() { 
    // this is neccessary so that can load images as codepen assets cross domain.
    this.game.load.crossOrigin = true;
		// Change the background color of the game
	  this.game.stage.backgroundColor = '#FFDE73';
    
		
		/*	Function called first to load all the assets */
		this.player = new Player(game);
		this.player.preload();

		this.level = new Level(game);
		this.level.preload();

		this.bullets = new Bullets(game,this.player);
		this.bullets.preload();

		this.apples = new Apples(game,this.player);
		this.apples.preload();

		this.hud = new HUD(game);

		this.robots = new Robots(game);
		this.robots.preload();
	},

	create: function() { 
		/*	Fuction called after 'preload' to setup the game */

		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.physics.arcade.gravity.y = this.gravity;

		this.player.create();

		this.level.create();

		this.bullets.create();

		this.apples.create();

		this.robots.create();

		this.hud.create();
	
		/* Stop the following keys from propagating up to the browser */
		game.input.keyboard.addKeyCapture([ Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.SPACEBAR ]);

		game.input.onDown.add(this.newGame, this);
	},
	
	update: function() {
		/*	Function called 60 times per second */
				
		game.physics.arcade.collide(	this.player.sprite, 
										[this.robots.robotGroup1, this.robots.robotGroup2], 
										this.robots.robotKillsPlayer, 
										null, 
										this
									);

		game.physics.arcade.overlap(	this.player.sprite,
										this.apples.sprites,
										this.apples.collectApple,
										null,
										this
									);


		game.physics.arcade.collide(	this.level.platforms, 
										[this.player.sprite, this.apples.sprites, this.robots.robotGroup1, this.robots.robotGroup2]
									);

		game.physics.arcade.collide(	this.bullets.bulletGroup, 
										[this.robots.robotGroup1, this.robots.robotGroup2], 
										this.bullets.bulletCollides, 
										null, 
										this
									);

		if (this.apples.sprites.countDead() == this.apples.totalApples) {
			this.message = 'YOU WIN!!!\nClick the screen to play again';
			this.player.sprite.kill();
			this.robots.robotGroup1.removeAll();
			this.robots.robotGroup2.removeAll();
		}

		this.player.update();

		this.bullets.update();

		this.robots.update();

		this.hud.update();

	},

	newGame: function() {
		if (!this.player.sprite.alive) {
			this.score = 0;
			this.message = '';
			this.game.state.start('main');
		}
	}

};

/*	Add and start the 'main' state to start the game */
game.state.add('main', main_state);  
game.state.start('main');


