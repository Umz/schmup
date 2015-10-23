var player;
var starfield;

var explosions;
var bullets;
// var bulletTimer = 0;
var firingSpeed = 3;
var bulletCounter = firingSpeed;

var cursors;
var fireButton;

var ship = {
  'acceleration': 600,
  'drag': 350,
  'maxSpeed': 400
}


console.log(this);
 // TODO: change everywhere for readability and to maintain scope. game = this

var Game = function() {
  this.testentity = null;
};

module.exports = Game;

Game.prototype = {

  create: function() {

    //  The scrolling starfield background
    starfield = this.add.tileSprite(0, 0, 800, 600, 'starfield');

    // Enemies -- Drones
    droneScouts = this.add.group();
    droneScouts.enableBody = true;
    droneScouts.physicsBodyType = Phaser.Physics.ARCADE;
    droneScouts.createMultiple(5, 'droneScout');
    droneScouts.setAll('anchor.x', 0.5);
    droneScouts.setAll('anchor.y', 0.5);
    droneScouts.setAll('angle', 180);
    droneScouts.setAll('outOfBoundsKill', true);
    droneScouts.setAll('checkWorldBounds', true);

    // Broken enemy trail emitter code

    // droneScouts.forEach(function(enemy) {
    //   addEnemyEmitterTrail(enemy);
    //   enemy.events.onKilled.add(function() {
    //     enemy.trail.kill();
    //   });
    // });
    // function addEnemyEmitterTrail(enemy) {
    //     var enemyTrail = droneScouts.game.add.emitter(enemy.x, enemy.y - 25, 100);
    //     enemyTrail.width = 10;
    //     enemyTrail.makeParticles('enemyTrail', [1, 2, 3, 4, 5]);
    //     enemyTrail.setXSpeed(20, -20);
    //     enemyTrail.setRotation(50, -50);
    //     enemyTrail.setAlpha(0.4, 0, 800);
    //     enemyTrail.setScale(0.01, 0.1, 0.01, 0.1, 1000, Phaser.Easing.Quintic.Out);
    //     enemy.trail = enemyTrail;
    //   }

    launchDroneScouts(randomIntegerFrom(3, 7));

    // The bullet group
    bullets = this.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // Explosion group
    explosions = this.add.group();
   explosions.enableBody = true;
   explosions.physicsBodyType = Phaser.Physics.ARCADE;
   explosions.createMultiple(30, 'explosion');
   explosions.setAll('anchor.x', 0.5);
   explosions.setAll('anchor.y', 0.5);
   explosions.forEach( function(explosion) {
       explosion.animations.add('explosion');
   });

    // The player's ship
    player = this.add.sprite(400, 500, 'ship');
    this.physics.arcade.enable(player);

    // Set ship physics
    player.body
      .maxVelocity.setTo(ship.maxSpeed, ship.maxSpeed);
    player.body
      .drag.setTo(ship.drag, ship.drag);
    player.anchor.setTo(0.5, 0.5);

    // Set ship trail emitter
    shipTrail = this.add.emitter(player.x, player.y + 40, 400);
    shipTrail.width = 10;
    shipTrail.makeParticles('plasma');
    shipTrail.setXSpeed(30, -30);
    shipTrail.setYSpeed(200, 180);
    shipTrail.setRotation(50, -50);
    shipTrail.setAlpha(1, 0.01, 800);
    shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out);
    shipTrail.start(false, 5000, 10);

    // Set controls
    cursors = this.input.keyboard.createCursorKeys();
    fireButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    function randomIntegerFrom(min, max) {
      return Math.floor(Math.random() * (max - min) + min + 1);
    }

    function launchDroneScouts(quantity) {
      for (var i = 0; i < quantity; i++) {
        launchDroneScout();
      }
    }

    // Enemy creation functions
    function launchDroneScout() {
      var minSpacing = 300;
      var maxSpacing = 3000;
      var enemySpeed = 300;

      var enemy = droneScouts.getFirstExists(false);
      if (enemy) {
        enemy.reset(randomIntegerFrom(0, 600), -20);
        enemy.body.velocity.x = randomIntegerFrom(-300, 300);
        enemy.body.velocity.y = enemySpeed;
        enemy.body.drag.x = 100;
        
        // More broken enemy trail code.
        // enemy.trail.start(false, 800, 1);

        enemy.update = function() {
          // enemy.trail.x = enemy.x;
          // enemy.trail.y = enemy.y - 10;
        }
      }
    }

  },

  update: function() {
    starfield.tilePosition.y += 2;

    this.physics.arcade.overlap(player, droneScouts, shipCollide, null, this);
    this.physics.arcade.overlap(bullets, droneScouts, shipCollide, null, this);

    player.body.acceleration.x = 0;

    if (cursors.left.isDown) {
      player.body.acceleration.x = -ship.acceleration;
    } else if (cursors.right.isDown) {
      player.body.acceleration.x = ship.acceleration;
    }

    if (fireButton.isDown) {
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
    // TODO: put this in the ship object
    bank = player.body.velocity.x / ship.maxSpeed;
    player.scale.x = 1 - Math.abs(bank) / 4;
    player.angle = bank * 5;

    shipTrail.x = player.x;

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
          console.log("Firing attempt");
          // Firing speed logic
          // bulletTimer = Game.time.now += firingDelay;
        }
      }
      bulletCounter++;
    }

    function shipCollide(player, enemy){
      var explosion = explosions.getFirstExists(false);
      explosion.reset(enemy.body.x + enemy.body.halfWidth, enemy.body.y + enemy.body.halfHeight);
      explosion.body.velocity.y = enemy.body.velocity.y;
      explosion.alpha = 0.7;
      explosion.play('explosion', 30, false, true);
      enemy.kill();
    }

  },

  onInputDown: function() {
    this.game.state.start('Menu');
  }
};