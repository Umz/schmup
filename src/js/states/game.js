'use strict';
var player;

var playerShields;
var gameOver;

var score = 0;
var scoreText;

var enemies;
var enemyOptions;
var droneScouts;
var droneFighters;
var droneBombers;
var enemyReleaseCounter = 0;

var starfield;

var explosions;
var bullets;
var firingSpeed = 10; // higher = slower
var bulletCounter = firingSpeed;

var cursors;
var fireButton;

var ship = {
  acceleration: 600,
  drag: 350,
  maxSpeed: 400
};

var size = {
  xSmall: 0.4,
  small: 0.5,
  medium: 0.75,
  large: 1,
  xLarge: 1.25,
  miniBoss: 1.5,
  boss: 2
};

var shipTrail;

var Game = function() {
  this.testentity = null;
};

module.exports = Game;

Game.prototype = {

  create: function() {
    var game = this;

    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    // The player's ship
    player = game.add.sprite(400, 500, 'ship');
    game.physics.arcade.enable(player);
    player.events.onKilled.add(function() {
      shipTrail.kill();
    });

    // Set ship physics
    player.body
      .maxVelocity.setTo(ship.maxSpeed, ship.maxSpeed);
    player.body
      .drag.setTo(ship.drag, ship.drag);
    player.anchor.setTo(0.5, 0.5);

    // Set ship trail emitter
    shipTrail = game.add.emitter(player.x, player.y + 40, 400);
    shipTrail.width = 10;
    shipTrail.makeParticles('plasma');
    shipTrail.setXSpeed(30, -30);
    shipTrail.setYSpeed(200, 180);
    shipTrail.setRotation(50, -50);
    shipTrail.setAlpha(1, 0.01, 800);
    shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out);
    shipTrail.start(false, 5000, 10);

    // Set controls
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // Creating enemies groups
    droneScouts = game.add.group();
    droneFighters = game.add.group();
    droneBombers = game.add.group();
    enemies = [
      droneScouts,
      droneFighters,
      droneBombers
    ];

    // Default enemy configuration
    enemies.forEach(function(group) {
      configureEnemies(group);
    });

    // Enemies -- Drone Scouts
    droneScouts.createMultiple(50, 'droneScout');
    droneScouts.minWaveTiming = 140;
    droneScouts.maxWaveTiming = 380;
    droneScouts.minWaveNumber = 3;
    droneScouts.maxWaveNumber = 5;
    droneScouts.forEach(function(enemy) {
      enemy.damageAmount = 10;
      enemy.level = 2;
      enemy.speed = game.randomIntegerFrom(250, 450);
      enemy.drift = 30;
      enemy.drag = game.randomIntegerFrom(100, 200);
      enemy.minX = 50;
      enemy.maxX = 750;
      enemy.scale.x = size.xSmall;
      enemy.scale.y = size.xSmall;
    });

    // Enemies - Drone Fighters
    droneFighters.createMultiple(10, 'droneFighter');
    droneFighters.minWaveTiming = 190;
    droneFighters.maxWaveTiming = 500;
    droneFighters.minWaveNumber = 2;
    droneFighters.maxWaveNumber = 4;
    droneFighters.forEach(function(enemy) {
      enemy.damageAmount = 25;
      enemy.level = 3;
      enemy.speed = game.randomIntegerFrom(100, 400);
      enemy.drift = game.randomIntegerFrom(200, 300);
      enemy.drag = 50;
      enemy.minX = 100;
      enemy.maxX = 700;
      enemy.scale.x = size.medium;
      enemy.scale.y = size.medium;
    });

    // Enemies = Drone Bombers
    droneBombers.createMultiple(5, 'droneBomber');
    droneBombers.minWaveTiming = 500;
    droneBombers.maxWaveTiming = 600;
    droneBombers.minWaveNumber = 1;
    droneBombers.maxWaveNumber = 2;
    droneBombers.forEach(function(enemy) {
      enemy.damageAmount = 50;
      enemy.level = 4;
      enemy.speed = 100;
      enemy.drift = 5;
      enemy.drag = 5;
      enemy.minX = 250;
      enemy.maxX = 650;
      enemy.scale.x = size.large;
      enemy.scale.y = size.large;
    });

    function configureEnemies(group) {
      group.physicsBodyType = Phaser.Physics.ARCADE;
      group.enableBody = true;
      group.setAll('anchor.x', 0.5);
      group.setAll('anchor.y', 0.5);
      group.setAll('angle', 180);
      group.setAll('outOfBoundsKill', true);
      group.setAll('checkWorldBounds', true);
    }


    // Unused as of right now.
    function setEnemyAttributes(enemy, options) {
      options = options || {};
      game.physics.enable(enemy, Phaser.Physics.ARCADE);
      for (attr in options) {
        enemy[attr] = options[attr];
      }
    }

    game.launchEnemies(game.randomIntegerFrom(3, 5), droneScouts);

    // The bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(15, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // Explosion group
    explosions = game.add.group();
    explosions.enableBody = true;
    explosions.physicsBodyType = Phaser.Physics.ARCADE;
    explosions.createMultiple(30, 'explosion');
    explosions.setAll('anchor.x', 0.5);
    explosions.setAll('anchor.y', 0.5);
    explosions.forEach(function(explosion) {
      explosion.animations.add('explosion');
    });

    //Ship HUD and stats
    player.health = 100;
    playerShields = game.add.bitmapText(game.world.width - 250, 10, 'spacefont', '' + player.health + '%', 20);
    playerShields.render = function() {
      playerShields.text = 'Shields: ' + Math.max(player.health, 0) + '%';
    };
    playerShields.render();

    // Score
    scoreText = game.add.bitmapText(10, 10, 'spacefont', '', 20);
    scoreText.render = function() {
      scoreText.text = 'Score: ' + score;
    };
    scoreText.render();

    // Messages
    gameOver = game.add.bitmapText(game.world.centerX, game.world.centerY, 'spacefont', 'GAME OVER!', 50);
    gameOver.x = gameOver.x - gameOver.textWidth / 2;
    gameOver.y = gameOver.y - gameOver.textHeight / 3;
    gameOver.visible = false;

  },

  update: function() {
    var game = this;

    starfield.tilePosition.y += 2;
    enemyReleaseCounter++;

    enemies.forEach(function(enemy) {
      checkWaveTimer(enemy);
      launchNewWaves(enemy);

      function checkWaveTimer(enemy) {
        if (!enemy.waveTimer) {
          enemy.waveTimer =
            roundToNearestTen(
              game.randomIntegerFrom(
                enemy.minWaveTiming,
                enemy.maxWaveTiming
              ));
        }

        function roundToNearestTen(num) {
          return Math.ceil(num / 10) * 10;
        }
      }

      function launchNewWaves(enemy) {
        if (enemyReleaseCounter % enemy.waveTimer === 0) {
          game.launchEnemies(
            game.randomIntegerFrom(
              enemy.minWaveNumber,
              enemy.maxWaveNumber),
            enemy);
          console.log("Wave launched?!");
          enemy.waveTimer = null;
        }
      }
    });

    checkCollisions();
    checkForGameOver();

    // Ship movement logic
    player.body.acceleration.x = 0;

    if (cursors.left.isDown) {
      player.body.acceleration.x = -ship.acceleration;
    } else if (cursors.right.isDown) {
      player.body.acceleration.x = ship.acceleration;
    }

    if (player.alive && fireButton.isDown) {
      fireBullet();
    }

    // TODO: Refactor to be DRY
    if (player.x > 750) {
      player.x = 750;
      player.body.acceleration.x = 0;
    }
    if (player.x < 50) {
      player.x = 50;
      player.body.acceleration.x = 0;
    }

    // Ship banking logic
    var bank = player.body.velocity.x / ship.maxSpeed;
    player.scale.x = 1 - Math.abs(bank) / 4;
    player.angle = bank * 5;

    shipTrail.x = player.x;

    function checkForGameOver() {
      if (!player.alive && gameOver.visible == false) {
        gameOver.visible = true;
        gameOver.alpha = 0;
        var fadeInGameOver = game.add.tween(gameOver);
        fadeInGameOver.to({
          alpha: 1
        }, 1000, Phaser.Easing.Quintic.Out);
        fadeInGameOver.onComplete.add(setResetHandlers);
        fadeInGameOver.start();

        function setResetHandlers() {
          var tapRestart = game.input.onTap.addOnce(_restart, game);
          var spaceRestart = fireButton.onDown.addOnce(_restart, game);

          function _restart() {
            tapRestart.detach();
            spaceRestart.detach();
            game.restart();
          }
        }
      }
    }

    function checkCollisions() {
      enemies.forEach(function(group) {
        game.physics.arcade.overlap(player, group, shipCollide, null, game);
        game.physics.arcade.overlap(bullets, group, hitEnemy, null, game);
      });
    }

    function fireBullet() {
      var bullet = bullets.getFirstExists(false);
      var bulletSpeed = 400;

      if (bulletCounter > firingSpeed) {

        bulletCounter = 0;

        // Bullet physics
        if (bullet) {
          bullet.reset(player.x, player.y - 25);

          bullet.body.velocity.y = -200;
          bullet.body.velocity.x += player.body.velocity.x / 5;
        }
      }
      bulletCounter++;
    }

    function shipCollide(player, enemy) {
      var explosion = explosions.getFirstExists(false);
      explosion.reset(enemy.body.x + enemy.body.halfWidth, enemy.body.y + enemy.body.halfHeight);
      explosion.body.velocity.y = enemy.body.velocity.y;
      explosion.alpha = 0.7;
      explosion.play('explosion', 30, false, true);
      enemy.kill();

      player.damage(enemy.damageAmount);
      playerShields.render();
      addPointsForKilling(enemy);
    }

    function hitEnemy(bullet, enemy) {
      var explosion = explosions.getFirstExists(false);
      explosion.reset(enemy.body.x + enemy.body.halfWidth, enemy.body.y + enemy.body.halfHeight);
      explosion.body.velocity.y = enemy.body.velocity.y;
      explosion.alpha = 0.7;
      explosion.play('explosion', 30, false, true);
      enemy.kill();
      bullet.kill();
      addPointsForKilling(enemy);
    }

    function addPointsForKilling(enemy) {
      score += enemy.damageAmount * enemy.level;
      scoreText.render();
    }

  },

  launchEnemies: function(quantity, enemyGroup) {
    var game = this;
    for (var i = 0; i < quantity; i++) {
      launchEnemy();
    }

    function launchEnemy() {
      var enemy = enemyGroup.getFirstExists(false);
      if (enemy) {
        var enemyLocation = game.randomIntegerFrom(
          enemy.minX, enemy.maxX);
        enemy.reset(enemyLocation, -20);
        enemy.body.velocity.x = game.randomIntegerFrom(-enemy.drift, enemy.drift);
        enemy.body.velocity.y = enemy.speed;
        enemy.body.drag.x = enemy.drag;
      }
    }
  },

  restart: function() {
    droneScouts.callAll('kill');
    enemyReleaseCounter = 0;
    player.revive();
    player.health = 100;
    playerShields.render();
    score = 0;
    scoreText.render();
    gameOver.visible = false;
  },

  // Utility functions
  randomIntegerFrom: function(min, max) {
    return Math.floor(Math.random() * (max - min) + min + 1);
  },

  onInputDown: function() {
    this.game.state.start('Menu');
  }
};