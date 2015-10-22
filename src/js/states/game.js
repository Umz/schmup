var player;
var starfield;
var cursors;

var ship = {
  'acceleration': 600,
  'drag': 350,
  'maxSpeed': 400
}

var Game = function() {
  this.testentity = null;
};

module.exports = Game;

Game.prototype = {

  create: function() {
    //  We're going to be using physics, so enable the Arcade Physics system
    //  The scrolling starfield background
    starfield = this.add.tileSprite(0, 0, 800, 600, 'starfield');

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
  },

  update: function() {
    starfield.tilePosition.y += 2;

    player.body.acceleration.x = 0;

    if (cursors.left.isDown) {
      player.body.acceleration.x = -ship.acceleration;
    }
    else if (cursors.right.isDown) {
      player.body.acceleration.x = ship.acceleration;
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

  },

  onInputDown: function() {
    this.game.state.start('Menu');
  }
};