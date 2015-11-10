var Menu = function () {
  this.text = null;
  this.subtitle = null;
};

module.exports = Menu;

Menu.prototype = {

  create: function () {
    var x = this.game.width / 2;
    var y = this.game.height / 2;

    this.text = this.add.bitmapText(x - 300, y - 200, 'spacefont', "Click to Greg", 50);
    this.subtitle = this.add.bitmapText(x - 300, y - 100, 'spacefont', "Arrow keys to move, Space to fire", 20);

    this.input.onDown.add(this.onDown, this);
  },

  update: function () {
  },

  onDown: function () {
    this.game.state.start(playerState.currentLevel);
  }
};
