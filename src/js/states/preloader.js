var Preloader = function (game) {
  this.asset = null;
  this.ready = false;
};

module.exports = Preloader;


Preloader.prototype = {

  preload: function () {
    this.asset = this.add.sprite(320, 240, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.physics.startSystem(Phaser.Physics.ARCADE);


    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    this.load.image('starfield', 'assets/starfield.png');
    this.load.image('ship', 'assets/player.png');
    this.load.image('plasma', 'assets/bluePlasma.png');
    this.load.image('laser', 'assets/blueLaser.png');
    this.load.image('bullet', 'assets/blueBullet.png');

  },

  create: function () {
    this.asset.cropEnabled = false;
  },

  update: function () {
    if (!!this.ready) {
      this.game.state.start('Menu');
    }
  },

  onLoadComplete: function () {
    this.ready = true;
  }
};
