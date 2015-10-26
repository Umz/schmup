var Menu = function () {
  this.text = null;
  this.subtitle = null;
};

module.exports = Menu;

Menu.prototype = {

  create: function () {
    var x = this.game.width / 2;
    var y = this.game.height / 2;

    var titleStyle = { font: "65px Arial", fill: "#ffffff", align: "center" };
    var subtitleStyle = { font: "24px Arial", fill: "#ffffff", align: "center" };

    this.text = this.add.text(x - 300, y - 200, "Click to Start", titleStyle);
    this.subtitle = this.add.text(x - 300, y - 100, "Arrow keys to move, Space to fire", subtitleStyle);

    this.input.onDown.add(this.onDown, this);
  },

  update: function () {
  },

  onDown: function () {
    this.game.state.start(playerState.currentLevel);
  }
};
