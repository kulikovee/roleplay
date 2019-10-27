export default class UI {
  constructor(scene) {
    this.scene = scene;
    this.pause = false;

    this.updatePlayerLabels = this.updatePlayerLabels.bind(this);
    this.openShop = this.openShop.bind(this);
    this.closeShop = this.closeShop.bind(this);
    this.buy = this.buy.bind(this);
    this.startGame = this.startGame.bind(this);
    this.restart = this.restart.bind(this);

    document.getElementById('close-shop').onclick = () => this.closeShop();
    document.getElementById('buy-hp').onclick = () => this.buy('hp');
    document.getElementById('buy-speed').onclick = () => this.buy('speed');
    document.getElementById('buy-damage').onclick = () => this.buy('damage');
    document.getElementById('restart-button').onclick = () => this.restart();
  }

  updatePlayerLabels() {
    if (this.scene.player) {
      document.getElementById("kills").innerHTML =
        "Убито: " + this.scene.player.kills + " Уровень: " + this.scene.level.getLevel();

      document.getElementById("score").innerHTML =
        "$" + Math.round(this.scene.player.score);

      document.getElementById("hp").innerHTML =
        "HP +" +
        Math.round(this.scene.player.hp) +
        " | Скорость: " +
        Math.round(this.scene.player.speed * 1000) +
        "% | Урон: " +
        this.scene.player.damage;
    }
  }

  openShop() {
    this.pause = true;
    this.scene.renderer.exitPointerLock();
    document.getElementById("shop").style.display = "block";
  }

  closeShop() {
    this.pause = false;
    this.scene.renderer.requestPointerLock();
    document.getElementById("shop").style.display = "none";
  }
  
  restart() {
    this.startGame();
    this.openShop();
  }

  buy(type) {
    switch (type) {
      case "hp":
        if (this.scene.player.score >= 100) {
          this.scene.player.score -= 100;
          this.scene.player.hp += 10;
        }

        break;
      case "speed":
        if (this.scene.player.score >= 200) {
          this.scene.player.score -= 200;
          this.scene.player.speed += 0.005;
        }

        break;
      case "damage":
        if (this.scene.player.score >= 250) {
          this.scene.player.score -= 250;
          this.scene.player.damage += 25;
        }

        break;
      default:
        break;
    }

    this.scene.ui.updatePlayerLabels();
  }
  
  showRestart() {
    document.getElementById("restart").style.display = "block";
  }

  startGame() {
    this.scene.gameLogicService.removeAllGameObjects();
    this.scene.createPlayer({
      onCreate: () => {
        this.updatePlayerLabels();
      }
    });

    document.getElementById("restart").style.display = "none";
    this.scene.ui.updatePlayerLabels();
  }
}
