var player;
var starfield;

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

var timer = new Phaser.Timer(this);

var game = this; // TODO: change everywhere for readability and to maintain scope.

var Game = function() {
  this.testentity = null;
};

module.exports = Game;

Game.prototype = {

  create: function() {


    //  We're going to be using physics, so enable the Arcade Physics system
    //  The scrolling starfield background
    starfield = this.add.tileSprite(0, 0, 800, 600, 'starfield');

    // The bullet group
    bullets = this.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

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
  },

  update: function() {
    starfield.tilePosition.y += 2;

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
  },

  onInputDown: function() {
    this.game.state.start('Menu');
  }
};