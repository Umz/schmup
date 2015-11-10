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
var scrollSpeed = 2;

var explosions;
var bullets;
var firingSpeed = 25; // higher = slower
var bulletCounter = firingSpeed;
var enemyWeapons, enemyLasers, enemyBombs;

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
  boss: 2,
  greg: 1
};

var shipTrail;

var Game = function() {
  this.testentity = null;
};

module.exports = Game;

Game.prototype = {

  create: function() {
    var game = this;

    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    initPlayerShip();
    initControls();
    initWeapons();
    initEnemies();
    initEffects();
    initMessages();

    function initPlayerShip() {
      player = game.add.sprite(400, 500, 'ship');
      game.physics.arcade.enable(player);
      player.events.onKilled.add(function() {
        shipTrail.kill();
      });
      player.body
        .maxVelocity.setTo(ship.maxSpeed, ship.maxSpeed);
      player.body
        .drag.setTo(ship.drag, ship.drag);
      player.anchor.setTo(0.5, 0.5);
      player.health = 100;
      player.size = size.greg;
      game.createShipTrail(player, 'plasma');
    }

    function initControls() {
      cursors = game.input.keyboard.createCursorKeys();
      fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    }

    function initEnemies() {

      droneScouts = game.add.group();
      droneFighters = game.add.group();
      droneBombers = game.add.group();
      enemies = [
        droneScouts,
        droneFighters,
        droneBombers
      ];

      var enemyFiring = function() {
        var enemy = this;
        var projectile = enemy.weapon.getFirstExists(false);
        if (canFire() && doesFire()) {
          enemy.lastShot = enemyReleaseCounter;
          enemy.bullets--;
          projectile.reset(enemy.x + enemy.width / 2,
            enemy.y + enemy.height * 0.75);
          projectile.damageAmount = enemy.bulletDamageAmount;
          projectile.body.velocity.y = enemy.bulletSpeed;
          projectile.body.velocity.x = 0;
          projectile.body.drag = 0;
          projectile.body.angle = 90;
        }

        function canFire() {
          return projectile &&
            enemy.alive &&
            enemy.bullets &&
            enemyReleaseCounter > enemy.firingSpeed + enemy.lastShot;
        }

        function doesFire() {
          return game.randomIntegerFrom(1, 100) >
            80;
        }
      };

      droneScouts.init = function() {
        this.createMultiple(50, 'droneScout');
        this.minWaveTiming = 140;
        this.maxWaveTiming = 380;
        this.minWaveNumber = 3;
        this.maxWaveNumber = 5;
        this.forEach(function(enemy) {
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
      };

      droneFighters.init = function() {
        this.createMultiple(15, 'droneFighter');
        this.minWaveTiming = 190;
        this.maxWaveTiming = 500;
        this.minWaveNumber = 2;
        this.maxWaveNumber = 4;
        this.scoreThreshold = 1000;
        this.forEach(function(enemy) {
          enemy.damageAmount = 25;
          enemy.level = 3;
          enemy.speed = game.randomIntegerFrom(250, 400);
          enemy.drift = game.randomIntegerFrom(200, 450);
          enemy.drag = 50;
          enemy.minX = 100;
          enemy.maxX = 700;
          enemy.scale.x = size.medium;
          enemy.scale.y = size.medium;
          enemy.weapon = enemyLasers;
          enemy.bullets = 4;
          enemy.bulletDamageAmount = 10;
          enemy.bulletSpeed = 500;
          enemy.firingSpeed = 20;
          enemy.lastShot = 0;
          enemy.update = enemyFiring;
        });
      };

      droneBombers.init = function() {
        this.createMultiple(5, 'droneBomber');
        this.minWaveTiming = 500;
        this.maxWaveTiming = 600;
        this.minWaveNumber = 0;
        this.maxWaveNumber = 1;
        this.forEach(function(enemy) {
          enemy.damageAmount = 50;
          enemy.level = 4;
          enemy.speed = 100;
          enemy.drift = 5;
          enemy.drag = 5;
          enemy.minX = 250;
          enemy.maxX = 650;
          enemy.scale.x = size.large;
          enemy.scale.y = size.large;
          enemy.weapon = enemyBombs;
          enemy.bullets = 2;
          enemy.bulletDamageAmount = 40;
          enemy.bulletSpeed = 250;
          enemy.firingSpeed = 40;
          enemy.lastShot = 0;
          enemy.update = enemyFiring;
        });
      };

      enemies.forEach(function(group) {
        configureEnemies(group);
        group.init();
      });

      game.launchEnemies(game.randomIntegerFrom(3, 5), droneScouts);
    }

    function configureEnemies(group) {
      group.physicsBodyType = Phaser.Physics.ARCADE;
      group.enableBody = true;
      group.setAll('anchor.x', 0.5);
      group.setAll('anchor.y', 0.5);
      group.setAll('angle', 180);
      group.setAll('outOfBoundsKill', true);
      group.setAll('checkWorldBounds', true);
    }

    function initWeapons() {
      bullets = game.add.group();
      bullets.enableBody = true;
      bullets.physicsBodyType = Phaser.Physics.ARCADE;
      bullets.createMultiple(15, 'bullet');
      bullets.setAll('anchor.x', 0.5);
      bullets.setAll('anchor.y', 1);
      bullets.setAll('outOfBoundsKill', true);
      bullets.setAll('checkWorldBounds', true);

      enemyLasers = game.add.group();
      enemyLasers.enableBody = true;
      enemyLasers.physicsBodyType = Phaser.Physics.ARCADE;
      enemyLasers.createMultiple(20, 'enemyLaser');
      enemyLasers.setAll('scale.x', 0.6);
      enemyLasers.setAll('scale.y', 0.6);
      enemyLasers.setAll('anchor.x', 0.5);
      enemyLasers.setAll('anchor.y', 0.5);
      enemyLasers.setAll('outOfBoundsKill', true);
      enemyLasers.setAll('checkWorldBounds', true);

      enemyBombs = game.add.group();
      enemyBombs.enableBody = true;
      enemyBombs.physicsBodyType = Phaser.Physics.ARCADE;
      enemyBombs.createMultiple(10, 'enemyBomb');
      enemyBombs.setAll('scale.x', .75);
      enemyBombs.setAll('scale.y', .75);
      enemyBombs.setAll('anchor.x', 0.5);
      enemyBombs.setAll('anchor.y', 0.5);
      enemyBombs.setAll('outOfBoundsKill', true);
      enemyBombs.setAll('checkWorldBounds', true);

      // enemy weapons
      enemyWeapons = [
        enemyLasers,
        enemyBombs
      ];
    }

    function initEffects() {
      explosions = game.add.group();
      explosions.enableBody = true;
      explosions.physicsBodyType = Phaser.Physics.ARCADE;
      explosions.createMultiple(30, 'explosion');
      explosions.setAll('anchor.x', 0.5);
      explosions.setAll('anchor.y', 0.5);
      explosions.forEach(function(explosion) {
        explosion.animations.add('explosion');
      });
    }

    function initMessages() {

      createShieldMessage();
      createScoreMessage();
      createGameOverMessage();

      playerShields.render();
      scoreText.render();

      function createShieldMessage() {
        playerShields = game.add.bitmapText(game.world.width - 250, 10, 'spacefont', '' + player.health + '%', 20);
        playerShields.render = function() {
          playerShields.text = 'Shields: ' + Math.max(player.health, 0) + '%';
        };
      }

      function createScoreMessage() {
        scoreText = game.add.bitmapText(10, 10, 'spacefont', '', 20);
        scoreText.render = function() {
          scoreText.text = 'Score: ' + score;
        };
      }

      function createGameOverMessage() {
        gameOver = game.add.bitmapText(game.world.centerX, game.world.centerY, 'spacefont', 'GREG OVER!', 50);
        gameOver.x = gameOver.x - gameOver.textWidth / 2;
        gameOver.y = gameOver.y - gameOver.textHeight / 3;
        gameOver.visible = false;
      }
    }
  },

  update: function() {
    var game = this;

    starfield.tilePosition.y += scrollSpeed;

    checkReleaseCounter()

    enemies.forEach(function(enemy) {
      var scoreThreshold = enemy.scoreThreshold || 0;
      if (score > scoreThreshold) {
        checkWaveTimer(enemy);
        launchNewWaves(enemy);
      }

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
          enemy.waveTimer = null;
        }
      }
    });

    checkCollisions();
    checkForGameOver();
    calculatePlayerMovement();

    function checkReleaseCounter() {
      enemyReleaseCounter > 1000 ? enemyReleaseCounter = 0 : enemyReleaseCounter++;
    }

    function calculatePlayerMovement() {

      player.body.acceleration.x = 0;
      game.checkForBounds(50, 750, player);
      checkForPlayerInput();
      shipTrail.x = player.x;
      game.applyBankingToShip(player);


      function checkForPlayerInput() {
        if (cursors.left.isDown) {
          player.body.acceleration.x = -ship.acceleration;
        } else if (cursors.right.isDown) {
          player.body.acceleration.x = ship.acceleration;
        }

        if (player.alive && fireButton.isDown) {
          fireBullet();
        }
      }
    }

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

      enemyWeapons.forEach(function(projectiles) {
        game.physics.arcade.overlap(projectiles, player, enemyHitsPlayer, null, this);
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

    function enemyHitsPlayer(player, bullet) {
      goBoom(player);
      bullet.kill();
      player.damage(bullet.damageAmount);
      playerShields.render();
    }

    function hitEnemy(bullet, enemy) {
      goBoom(enemy);
      enemy.kill();
      bullet.kill();
      addPointsForKilling(enemy);
    }

    function goBoom(entity) {
      var explosion = explosions.getFirstExists(false);
      explosion.reset(entity.body.x + entity.body.halfWidth, entity.body.y + entity.body.halfHeight);
      explosion.body.velocity.y = entity.body.velocity.y;
      explosion.alpha = 0.7;
      explosion.play('explosion', 30, false, true);
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

  setEnemyAttributes: function(enemy, options) {

    // Unused as of right now.
    // Could be used for powerups or abilities that change enemy attributes
    // (speed could be halved for a "Slow Time" powerup, for example)
    options = options || {};
    game.physics.enable(enemy, Phaser.Physics.ARCADE);
    for (attr in options) {
      enemy[attr] = options[attr];
    }
  },

  checkForBounds: function(min, max, entity) {
    if (entity.x > max) {
      entity.x = max;
      entity.body.acceleration.x = -50;
    }
    if (entity.x < min) {
      entity.x = min;
      entity.body.acceleration.x = 50;
    }
  },

  // TODO - Tack stuff like maxSpeed to player object
  applyBankingToShip: function(entity) {
    var bank = entity.body.velocity.x / ship.maxSpeed;
    entity.scale.x = entity.size - Math.abs(bank) / 4;
    entity.angle = bank * 5;
  },

  createShipTrail: function(ship, particleName) {
    shipTrail = this.add.emitter(ship.x, ship.y + 40, 400);
    shipTrail.width = 10;
    shipTrail.makeParticles(particleName);
    shipTrail.setXSpeed(30, -30);
    shipTrail.setYSpeed(200, 180);
    shipTrail.setRotation(50, -50);
    shipTrail.setAlpha(1, 0.01, 800);
    shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out);
    shipTrail.start(false, 5000, 10);
  },

  restart: function() {
    enemies.forEach(function(enemy) {
      enemy.callAll('kill');
    });

    enemyWeapons.forEach(function(proj) {
      proj.callAll('kill');
    });

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