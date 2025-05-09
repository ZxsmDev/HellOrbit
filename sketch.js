let gameManager;

class GameManager {
  constructor() {
    this.StateMachine = new StateMachine(this);
    this.UpgradeManager = new UpgradeManager(this);
    this.UIManager = new UIManager(this);
    this.entityManager = new EntityManager(this);
    this.bulletManager = new BulletManager(this);

    this.bossDefeatedCount = 0;
  }
  checkBossHealth() {
    const boss = this.entityManager.entities[1];
    if (boss && boss.health <= 0) {
      this.bossDefeatedCount++;
      this.UpgradeManager.credits += boss.maxHealth;
      this.bulletManager.bullets = [];
      this.respawnBoss();
    }
  }
  respawnBoss() {
    const baseHealth = 10000;
    const healthMultiplier = 1.5;

    const newHealth = Math.floor(baseHealth * Math.pow(healthMultiplier, this.bossDefeatedCount));
    const boss = new Boss(this.entityManager);
    boss.maxHealth = newHealth;
    boss.health = newHealth;

    this.entityManager.entities[1] = boss;
  } 
  resetGame() {
    this.entityManager.entities[0].health = this.entityManager.entities[0].maxHealth;
    this.entityManager.entities[1].health = this.entityManager.entities[1].maxHealth;
    this.entityManager.entities[0].x = windowWidth / 2;
    this.entityManager.entities[0].y = windowHeight / 3 * 2;
    this.UpgradeManager.credits > 10000 ? this.UpgradeManager.credits -= 10000 : this.UpgradeManager.credits = 0;
    this.bulletManager.bullets = [];
    loop();
  }
}

class StateMachine {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.state = "menu";
    this.upgradeFlag = false;
    this.keyWait = 0;
  }
  setState(state) {
    this.state = state;
  }
  checkState() {
    noStroke();
    if (this.state === "menu") {
      gameManager.UIManager.UI[2].show();
      gameManager.UIManager.UI[3].screenVignette();
    } else if (this.state === "gameOver") {
      fill(0)
      rect(0, 0, windowWidth, windowHeight)
      gameManager.UIManager.UI[1].show();
    } else if (this.state === "playing") {
      gameManager.UIManager.UI[3].show();
      if (random(1) < 0.1) {
        gameManager.entityManager.entities[1].attack.findAttack();
      }
      gameManager.bulletManager.update(); 
      gameManager.bulletManager.show();
      gameManager.entityManager.update();
      gameManager.entityManager.show();
      gameManager.UIManager.UI[0].show();
      gameManager.UIManager.UI[5].show();
      gameManager.UIManager.UI[6].show();
      gameManager.UIManager.UI[8].show();
      gameManager.UIManager.UI[9].show();
      if (!this.upgradeFlag) {
        gameManager.UpgradeManager.setup();
        this.upgradeFlag = true;
      }
      gameManager.UIManager.UI[0].show();
      gameManager.UIManager.UI[7].show();
    }
  }
  checkGameOver() {
    if (this.gameManager.entityManager.entities[0].health <= 0) {
      this.setState("gameOver");
    }
  }
  keyPressed() {
    if (millis() - this.keyWait < 1000) return;

    if (gameManager.StateMachine.state === "menu" && keyCode === ENTER || gameManager.StateMachine.state === "menu" && key === " ") {
      gameManager.StateMachine.setState("playing");
    } else if (gameManager.StateMachine.state === "gameOver" && keyCode === ENTER || gameManager.StateMachine.state === "gameOver" && key === " ") {
      gameManager.resetGame();
      gameManager.StateMachine.setState("menu");
      this.keyWait = millis();
    }
  }
}

class UpgradeManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.upgrades = [
      { name: "Speed", cost: 100, initialCost: 100 },
      { name: "Health", cost: 200, initialCost: 200 },
      { name: "Damage", cost: 300, initialCost: 300 },
      { name: "Fire Rate", cost: 400, initialCost: 400 },
      { name: "Larger Bullets", cost: 500, initialCost: 500 },
      { name: "Health Regen", cost: 600, initialCost: 600 },
    ];
    this.buttons = [];
    this.credits = 0;
    this.spacing = 20;
    this.buttonHeight = 75;
    this.needsRegeneration = true;
    this.spanCost = [];
  }
  regenerate() {
    this.needsRegeneration = true;
  }
  setup() {
    if (!this.needsRegeneration) return;

    this.buttons.forEach(btn => btn.remove());
    this.buttons = [];

    this.buttonWidth = windowWidth / 6 - this.spacing;
    this.totalWidth =
    this.upgrades.length * this.buttonWidth + (this.upgrades.length - 1) * this.spacing;
    this.startX = (windowWidth - this.totalWidth) / 2;
    this.startY = windowHeight - this.buttonHeight - this.spacing;

    this.spanCosts = [];
    this.upgrades.forEach((upgrade, index) => {
      const buttonX = this.startX + index * (this.buttonWidth + this.spacing);
      const button = createButton("");

      const span = createSpan(index + 1);
      const span2 = createSpan(upgrade.name);
      const spanCost = createSpan(`$${upgrade.cost}`);
      this.spanCosts.push(spanCost);

      const infoDiv = createDiv();

      span.parent(button);
      span2.parent(infoDiv);
      spanCost.parent(infoDiv);
      infoDiv.parent(button);

      span.parent(button);
      span.style("font-size", "24px");
      span.style("background", "#333");
      span.style("color", "#fff");
      span.style("padding", "4px 16px");
      span.style("border-radius", "6px");
      span.style("margin-right", "0.5rem");
      span.style("display", "flex");
      span.style("align-items", "center");
      span.style("justify-content", "center");
      span.style("min-width", "30px");

      span2.parent(infoDiv);
      this.spanCosts[index].parent(infoDiv);
      infoDiv.parent(button);

      infoDiv.style("display", "flex");
      infoDiv.style("flex-direction", "column");

      span2.style("font-size", "20px");
      span2.style("color", "#fff");
      this.spanCosts[index].style("font-size", "18px");
      this.spanCosts[index].style("color", "#ccc");
      this.spanCosts[index].style("display", "flex");
      this.spanCosts[index].style("justify-content", "flex-start");

      button.style("display", "flex");
      button.style("align-items", "center");
      button.style("justify-content", "flex-start");
      button.style("gap", "10px");
      button.style("padding", "10px");
      button.style("border-radius", "8px");
      button.class("btn btn-dark");

      button.position(buttonX, this.startY);
      button.size(this.buttonWidth, this.buttonHeight);

      button.mousePressed(() => { this.handleUpgrade(index); });
      this.buttons.push(button);
    });

    this.needsRegeneration = false;
  }
  keyPressed(index) {
    if (gameManager.StateMachine.state === "playing") {
      const keyIndex = parseInt(key) - 1;
      if (keyIndex >= 0 && keyIndex < this.upgrades.length) {
        this.handleUpgrade(keyIndex);
      }
    }
  }
  handleUpgrade(index) {
    const upgrade = this.upgrades[index];
    const player = this.gameManager.entityManager.entities[0];

    if (this.credits >= upgrade.cost) {
      this.credits -= upgrade.cost;
      switch (upgrade.name) {
        case "Speed":
          player.maxSpeed += 0.5;
          break;
        case "Health":
          player.maxHealth += 20;
          break;
        case "Damage":
          player.attack.damage += 5;
          break;
        case "Fire Rate":
          player.attack.fireRate = max(50, player.attack.fireRate - 25);
          break;
        case "Larger Bullets":
          player.attack.radius += 0.5;
          break;
        case "Health Regen":
          player.regenRate = (player.regenRate || 0.05) + 0.1;
          break;
      }

      upgrade.cost = Math.floor(upgrade.cost * 1.5);
      this.spanCosts[index].html(`$${upgrade.cost}`);
    }
  }
}

class UIManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.fontSize = 20;
    this.fontColor = color(255);
    this.UI = [];
    this.UI.push(new HealthBar(this));
    this.UI.push(new GameOver(this));
    this.UI.push(new Menu(this));
    this.UI.push(new Vignette(this));
    this.UI.push(new Background(this));
    this.UI.push(new Credits(this));
    this.UI.push(new KillCount(this));
    this.UI.push(new HitIndicator(this));
    this.UI.push(new SpeedDisplay(this));
    this.UI.push(new HealthRegenDisplay(this));
  }
  addUI(UIElement) {
    this.UI.push(UIElement);
  }
  removeUI(UIElement) {
    this.UI = this.UI.filter((e) => e !== UIElement);
  }
  show() {
    for (let UIElement of this.UI) {
      fill(this.fontColor);
      textSize(this.fontSize);
      if (typeof UIElement.show === "function") {
        UIElement.show();
      }
    }
  }
  update() {
    for (let UIElement of this.UI) {
      UIElement.update();
    }
  }
}

class Menu {
  constructor(UIManager) {
    this.UIManager = UIManager;
    this.title = "Hell Orbit";
    this.startText = "Press 'Space' to Start";
  }
  show() {
    fill(255)
    textAlign(CENTER, CENTER);
    textSize(50);
    text(this.title, windowWidth / 2, windowHeight / 2);
    textSize(30);
    text(this.startText, windowWidth / 2, windowHeight / 2 + 50);
  }
}

class GameOver {
  constructor(UIManager) {
    this.UIManager = UIManager;
    this.title = "Game Over";
    this.restartText = "Press 'Space' to Restart";
  }
  show() {
    fill(255, 0, 0)
    textAlign(CENTER, CENTER);
    textSize(50);
    text(this.title, windowWidth / 2, windowHeight / 2);
    textSize(30);
    text(this.restartText, windowWidth / 2, windowHeight / 2 + 50);
  }
}

class HealthBar {
  constructor(UIManager) {
    this.UIManager = UIManager;
    this.healthBarWidth = 100;
    this.healthBarHeight = 10;
    this.bossHealthBarWidth = 400;
    this.bossHealthBarHeight = 20;
    this.padding = 5;
  }
  show() {
    const player = gameManager.entityManager.entities[0];
    const boss = gameManager.entityManager.entities[1];

    const playerHealthRatio = player.health / player.maxHealth;
    const px = player.x - this.healthBarWidth / 2;
    const py = player.y - player.size - this.healthBarHeight;

    stroke(255);
    strokeWeight(1);
    fill(60);
    rect(px, py, this.healthBarWidth, this.healthBarHeight, 5);

    noStroke();
    fill(24, 240, 94);
    rect(px, py, this.healthBarWidth * playerHealthRatio, this.healthBarHeight, 5);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(12);
    this.drawShadowedText(`${Math.floor(player.health)} / ${player.maxHealth}`, px + this.healthBarWidth / 2, py - 12);

    const bossHealthRatio = boss.health / boss.maxHealth;
    const bx = windowWidth / 2 - this.bossHealthBarWidth / 2;
    const by = 50;

    stroke(255);
    strokeWeight(2);
    fill(60);
    rect(bx, by, this.bossHealthBarWidth, this.bossHealthBarHeight, 8);

    noStroke();
    fill(255, 56, 56);
    rect(bx, by, this.bossHealthBarWidth * bossHealthRatio, this.bossHealthBarHeight, 8);

    fill(255);
    textSize(20);
    this.drawShadowedText(`Boss: ${Math.floor(boss.health)} / ${boss.maxHealth}`, windowWidth / 2, by - 24);
  }
  drawShadowedText(txt, x, y) {
    fill(0);
    text(txt, x + 1, y + 1);
    fill(255);
    text(txt, x, y);
  }
}

class Background {
  constructor(UIManager) {
    this.UIManager = UIManager;
    this.backgroundBuffer = createGraphics(windowWidth, windowHeight);
    this.needsRegeneration = true;
  }
  regenerate() {
    this.needsRegeneration = true;
  }
  render() {
    if (this.needsRegeneration) {
      this.backgroundBuffer.loadPixels();
      for (let x = 0; x < this.backgroundBuffer.width; x++) {
        for (let y = 0; y < this.backgroundBuffer.height; y++) {
          let noiseValue = noise(x * 0.01, y * 0.01);
          let c = lerpColor(color(17, 20, 28), color(26, 32, 46), noiseValue);
          let index = (x + y * this.backgroundBuffer.width) * 4;
          this.backgroundBuffer.pixels[index] = red(c);
          this.backgroundBuffer.pixels[index + 1] = green(c);
          this.backgroundBuffer.pixels[index + 2] = blue(c);
          this.backgroundBuffer.pixels[index + 3] = 255;
        }
      }
      this.backgroundBuffer.updatePixels();
      this.needsRegeneration = false;
    }
  }
  show() {
    this.render();
    image(this.backgroundBuffer, 0, 0);
  }
}


class Vignette {
  constructor(UIManager) {
    this.UIManager = UIManager;
    this.vignetteState = "normal";
    this.vignetteTimer = 0;
    this.vignetteDuration = 300;
  }
  triggerDamageVignette() {
    this.vignetteState = "damage";
    this.vignetteTimer = millis();
  }
  show() {
    if (this.vignetteState === "damage") {
      this.damageVignette();
      if (millis() - this.vignetteTimer > this.vignetteDuration) {
        this.vignetteState = "normal";
      }
    } else {
      this.screenVignette();
    }
  }
  screenVignette() {
    let ctx = drawingContext;
    let gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.75)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  damageVignette() {
    let ctx = drawingContext;
    let gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(255, 0, 0, 0.25)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}

class Credits {
  constructor(UIManager) {
    this.UIManager = UIManager;
    this.span = createSpan(" 0");
    this.div = createDiv();
    this.needsRegeneration = true;
    this.i = createElement("i");
  }
  regenerate() {
    this.needsRegeneration = true;
  }
  render() {
    if (this.needsRegeneration) {
      this.div.remove();
      this.i.remove();
      this.span.remove();
    }

    this.span = createSpan(" 0");
    this.div = createDiv();
    this.i = createElement("i");

    this.i.class("fa fa-coins");
    this.i.style("color", "gold")

    this.i.parent(this.div);
    this.span.parent(this.div);

    this.div.style("text-align", "right");
    this.div.style("color", "white");
    this.div.style("font-size", "28px");
    this.div.position(windowWidth - 520, 10); 
    this.div.size(500, 50);

    this.needsRegeneration = false;
  }
  show() {
    this.span.html(` ${gameManager.UpgradeManager.credits}`);
  }
}

class KillCount {
  constructor(UIManager) {
    this.UIManager = UIManager;
    this.span = createSpan(" 0");
  }
  render() {
    const div = createDiv();
    const i = createElement("i");
    i.class("fa fa-skull");
    i.style("color", "red")

    i.parent(div);
    this.span.parent(div);

    div.style("text-align", "left");
    div.style("color", "white");
    div.style("font-size", "28px");
    div.position(20, 10);
    div.size(500, 50);
  }
  show() {
    this.span.html(` ${gameManager.bossDefeatedCount}`);
  }
}

class HitIndicator {
  constructor(UIManager) {
    this.UIManager = UIManager;
    this.waitTime = 2500;
    this.hitArray = [];
    this.bossIndicator = true;
    this.size = 0;
  }
  add(x, y, damageAmount) {
    const timestamp = millis();
    let variation = Math.floor(Math.random() * 11) - 5;
    this.hitArray.push({ x, y, damageAmount, timestamp, variation });
  }
  show() {
    const now = millis();
    this.hitArray = this.hitArray.filter(hit => {
      const alive = now - hit.timestamp < this.waitTime;
      if (this.bossIndicator) {
        this.size = gameManager.entityManager.entities[1].size / 2;
      } else {
        this.size = gameManager.entityManager.entities[0].size / 2;
      }

      let x = hit.x + this.size + hit.variation;
      if (alive) {
        fill(255, 0, 0);
        stroke(2);
        textSize(20);
        text(`-${hit.damageAmount}`, x, hit.y - this.size - (now - hit.timestamp) / 20)
      }
      return alive;
    });
  }
}

class SpeedDisplay {
  constructor(UIManager) {
    this.UIManager = UIManager;
    this.span = createSpan(" 0");
  }
  render() {
    const div = createDiv();
    const i = createElement("i");
    i.class("fa fa-forward");
    i.style("color", "white")

    i.parent(div);
    this.span.parent(div);

    div.style("text-align", "left");
    div.style("color", "white");
    div.style("font-size", "28px");
    div.position(20, 60);
    div.size(500, 50);
  }
  show() {
    this.span.html(` ${gameManager.entityManager.entities[0].maxSpeed}px/s`);
  }
}

class HealthRegenDisplay {
  constructor(UIManager) {
    this.UIManager = UIManager;
    this.span = createSpan(" 0");
    this.div = createDiv();
    this.needsRegeneration = true;
    this.i = createElement("i");
  }
  regenerate() {
    this.needsRegeneration = true;
  }
  render() {
    if (this.needsRegeneration) {
      this.div.remove();
      this.i.remove();
      this.span.remove();
    }

    this.span = createSpan(" 0");
    this.div = createDiv();
    this.i = createElement("i");

    this.i.class("fa fa-heart");
    this.i.style("color", "red")

    this.i.parent(this.div);
    this.span.parent(this.div);

    this.div.style("text-align", "right");
    this.div.style("color", "white");
    this.div.style("font-size", "28px");
    this.div.position(windowWidth - 520, 60); 
    this.div.size(500, 50);

    this.needsRegeneration = false;
  }
  show() {
    this.span.html(` ${Math.round(gameManager.entityManager.entities[0].regenRate * 10) / 10}hp/s`);
  }
}

class BulletManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.bullets = [];
    this.maxBullets = 500;
  }
  show() {
    for (let bullet of this.bullets) {
      bullet.show();
    }
  }
  update() {
    for (let bullet of this.bullets) {
      bullet.update();
    }
    this.bullets = this.bullets.filter(bullet => millis() - bullet.startTime < bullet.life);
  }
}

class EntityManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.entities = [];
    this.entities.push(new Player());
    this.entities.push(new Boss());
  }
  addEntity(entity) {
    this.entities.push(entity);
  }
  removeEntity(entity) {
    this.entities = this.entities.filter((e) => e !== entity);
  }
  show() {
    for (let entity of this.entities) {
      entity.show();
    }
  }
  update() {
    for (let entity of this.entities) {
      entity.update();
    }
  }
}

class Player {
  constructor(EntityManager) {
    this.entityManager = EntityManager;
    this.x = windowWidth / 2;
    this.y = windowHeight / 3 * 2;
    this.size = 50;
    this.velocityX = 0;
    this.velocityY = 0;
    this.maxHealth = 100;
    this.health = 100;
    this.acceleration = 0.5;
    this.maxSpeed = 5;
    this.friction = 0.9;
    this.lastMoveTime = millis();
    this.regenRate = 2.5;
    this.attack = new PlayerAttack(this);
    this.trails = [];
  }
  show() {
    push();
    stroke(255, 111, 0);
    strokeWeight(1 + sin(frameCount * 0.1) * 1);
    fill(0)
    ellipse(this.x, this.y, this.size + 5);
    for (let r = this.size; r > 0; r -= 10) {
        noStroke();
        let alpha = map(r, 0, this.size, 255, 25);
        fill(255, 56, 56, alpha);
        ellipse(this.x, this.y, r);
    }
    pop();
  }
  update() {
    const prevX = this.x;
    const prevY = this.y;
    
    if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) {
      this.velocityX -= this.acceleration;
    } else if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) {
      this.velocityX += this.acceleration;
    }

    if (keyIsDown(87) || keyIsDown(UP_ARROW)) {
      this.velocityY -= this.acceleration;
    } else if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) {
      this.velocityY += this.acceleration;
    }

    this.velocityX *= this.friction;
    this.velocityY *= this.friction;

    this.velocityX = constrain(this.velocityX, -this.maxSpeed, this.maxSpeed);
    this.velocityY = constrain(this.velocityY, -this.maxSpeed, this.maxSpeed);

    this.x += this.velocityX;
    this.y += this.velocityY;

    this.x = constrain(this.x, 0 + this.size / 2, windowWidth - this.size / 2);
    this.y = constrain(this.y, 0 + this.size / 2, windowHeight - this.size / 2);

    if (gameManager.StateMachine.state === "playing" && (this.x !== prevX || this.y !== prevY)) {
      this.lastMoveTime = millis();
    }

    if (this.health < this.maxHealth) {
      this.health += this.regenRate * deltaTime / 1000;
      this.health = constrain(this.health, 0, this.maxHealth);
    }

    this.attack.update();

    this.trails.push(new Trail(this.x, this.y));
    this.trails = this.trails.filter(t => !t.isFinished());
    this.trails.forEach(t => {
      t.show();
      t.update();
    });
  }
}

class Trail {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.alpha = 60;
    this.size = 20;
  }
  update() {
    this.alpha -= 5;
    this.size += 5;
  }
  show() {
    noStroke();
    fill(255, 60, 0, this.alpha);
    ellipse(this.x, this.y, this.size);
  }
  isFinished() {
    return this.alpha == 0;
  }
}


class PlayerAttack {
  constructor(Player) {
    this.player = Player;
    this.fireRate = 250;
    this.lastShotTime = 0;
    this.damage = 10;
    this.bullets = [];
    this.radius = 5;
  }
  update() {
    this.updateBullets();
    if (mouseIsPressed) {
      this.attack();
    }
  }
  attack() {
    let now = millis();
    if (now - this.lastShotTime < this.fireRate) return;
    this.lastShotTime = now;

    let target = gameManager.entityManager.entities[1];
    if (!target) return;

    let targetX = target.x;
    let targetY = target.y;

    let dx = targetX - this.player.x;
    let dy = targetY - this.player.y;
    let mag = Math.hypot(dx, dy);
    if (mag === 0) return;

    let speed = 10;
    let vx = (dx / mag) * speed;
    let vy = (dy / mag) * speed;

    this.bullets.push(new PlayerBullet(this.player.x, this.player.y, vx, vy, this.damage, this.bullets, this.radius));
  }
  updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      let b = this.bullets[i];
      b.update();
      b.show();
      if (b.isOffScreen()) this.bullets.splice(i, 1);
    }
  }
}

class PlayerBullet {
  constructor(x, y, vx, vy, damage, bullets, radius) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.radius = radius;
    this.bullets = bullets;
  }
  update() {
    let boss = gameManager.entityManager.entities[1];

    this.x += this.vx;
    this.y += this.vy;

    if (
      Math.abs(this.x - boss.x) < boss.size &&
      Math.abs(this.y - boss.y) < boss.size
    ) {
      boss.health -= this.damage;
      gameManager.UpgradeManager.credits += this.damage;
      gameManager.UIManager.UI[7].bossIndicator = true;
      gameManager.UIManager.UI[7].add(boss.x, boss.y, this.damage);

      const index = this.bullets.indexOf(this);
      if (index > -1) {
        this.bullets.splice(index, 1);
      }
    }
  }
  show() {
    fill(255, 87, 87);
    noStroke();
    ellipse(this.x, this.y, this.radius * 2);
  }
  isOffScreen() {
    return this.x < 0 || this.x > width || this.y < 0 || this.y > height;
  }
}


class Boss {
  constructor(EntityManager) {
    this.entityManager = EntityManager;
    this.size = 100;
    this.x = windowWidth / 2;
    this.y = windowHeight / 3;
    this.health = 10000;
    this.maxHealth = 10000;
    this.attack = new Attack(this);
  }
  show() {
    push();
    translate(this.x, this.y);
    noStroke();

    let renderSize = this.size * 2;

    for (let i = 0; i < 5; i++) {
      fill(255, 165, 0, 50 - i * 15);
      ellipse(0, 0, renderSize - 15 + i * 15);
    }

    fill(255, 94, 0);
    ellipse(0, 0, renderSize * 0.8);

    fill(17, 17, 17);
    let offsetX = sin(frameCount * 0.1) * 5;
    ellipse(offsetX, 0, renderSize * 0.5);

    fill(212, 212, 212);
    let offsetY = sin(frameCount * 0.1) * 5;
    ellipse(offsetX + random(1), offsetY + 15, renderSize * 0.1);

    pop();
  }
  update() {
    this.x = windowWidth / 2;
    this.y = windowHeight / 3;

    if (this.health <= this.maxHealth) {
      this.health = constrain(this.health, 0, this.maxHealth);
    }
  }
}

class Attack {
  constructor(Boss) {
    this.boss = Boss;
    this.attacks = [
      { name: "Random", damage: 10, speed: 5, description: "Randomly fires bullets in all directions.", weight: 0.5 },
      { name: "Straight", damage: 5, speed: 10, description: "Fires bullets directly at the player.", weight: 0.3 },
      { name: "Wave", damage: 10, speed: 10, description: "Fires bullets in a wave pattern.", weight: 0.2 },
      { name: "Shield", damage: 0, speed: 5, description: "Fires bullets that hover around the boss.", weight: 0.05 },
      { name: "Spiral", damage: 5, speed: 2, description: "Fires bullets in a spiral pattern.", weight: 0.1 },
      { name: "Laser", damage: 20, speed: 5, description: "Fires a powerful laser beam.", weight: 0.05 },
    ];
    this.lastLaserTime = 0;
    this.laserCooldown = 5000;
    this.stationary = false;
  }
  findAttack() {
    const playerDistance = dist(this.boss.x + this.boss.size / 2, this.boss.y + this.boss.size / 2, gameManager.entityManager.entities[0].x, gameManager.entityManager.entities[0].y);
    if (gameManager.StateMachine.state === "playing") {
      const player = gameManager.entityManager.entities[0];
      const isIdle = millis() - player.lastMoveTime > random(500, 1750);
      this.stationary = isIdle;
    } else {
      this.stationary = false;
    }

    let attackType;

    if (this.stationary && LaserBullet.prototype instanceof Bullet && millis() - this.lastLaserTime > this.laserCooldown) {
      attackType = this.attacks.find((attack) => attack.name === "Laser");
    } else {
      const adjustedAttacks = [...this.attacks];
      
      if (playerDistance < 250) {
        const spiralAttack = adjustedAttacks.find((attack) => attack.name === "Spiral");
        spiralAttack.weight += 0.2;
      }

      const nonLaserAttacks = adjustedAttacks.filter((attack) => attack.name !== "Laser");
      const totalWeight = nonLaserAttacks.reduce((sum, attack) => sum + attack.weight, 0);
      const randomNum = random(totalWeight);
      let cumulativeWeight = 0;

      for (const attack of nonLaserAttacks) {
        cumulativeWeight += attack.weight;
        if (randomNum < cumulativeWeight) {
          attackType = attack;
          break;
        }
      }
    }
    this.shoot(attackType);
  }
  shoot(attackType) {
    let bullet;
    switch (attackType.name) {
      case "Random":
        bullet = new RandomBullet(this.boss.x, this.boss.y);
        break;
      case "Straight":
        bullet = new StraightBullet(this.boss.x, this.boss.y, this.attacks[1].speed, gameManager.entityManager.entities[0].x, gameManager.entityManager.entities[0].y);
        break;
      case "Shield":
        for (let i = 0; i < 4; i++) {
          const bullet = new ShieldBullet(i * PI / 2);
          gameManager.bulletManager.bullets.push(bullet);
        }
        return;
      case "Laser":
        setTimeout(() => {
          const bullet = new LaserBullet(this.boss.x, this.boss.y, gameManager.entityManager.entities[0].x, gameManager.entityManager.entities[0].y);
          gameManager.bulletManager.bullets.push(bullet);
          this.lastLaserTime = millis();
        }, 1250);
        return;
      case "Wave":
        for (let i = 0; i < 18; i++) {
          bullet = new WaveBullet(this.boss.x, this.boss.y, i * TWO_PI / 18);
          gameManager.bulletManager.bullets.push(bullet);
        }
        return;
      case "Spiral":
        for (let i = 0; i < 12; i++) {
          setTimeout(() => {
            const rotationDelay = i * 100;
            bullet = new SpiralBullet(this.boss.x, this.boss.y, i * PI / 6, rotationDelay);
            gameManager.bulletManager.bullets.push(bullet);
          }, i * 300);
        }
        return;
    }
    gameManager.bulletManager.bullets.push(bullet);
  }
}

class Bullet {
  constructor(x, y, BulletManager) {
    this.bulletManager = BulletManager;
    this.x = x;
    this.y = y;
    this.size = 10;
    this.speed = 10;
    this.velocityX = 0;
    this.velocityY = 0;
    this.damage = 0;
    this.angle = 0;
    this.life = 5000;
    this.startTime = millis();
  }
  show() {
    fill(255, 230, 150);
    ellipse(this.x, this.y, this.size);
  }
  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;

    if (
      this.x <= gameManager.entityManager.entities[0].x + gameManager.entityManager.entities[0].size / 2 &&
      this.x >= gameManager.entityManager.entities[0].x - gameManager.entityManager.entities[0].size / 2 &&
      this.y <= gameManager.entityManager.entities[0].y + gameManager.entityManager.entities[0].size / 2 &&
      this.y >= gameManager.entityManager.entities[0].y - gameManager.entityManager.entities[0].size / 2
    ) {
      gameManager.entityManager.entities[0].health -= this.damage;
      gameManager.UIManager.UI[3].triggerDamageVignette();
      gameManager.UIManager.UI[7].bossIndicator = false;
      gameManager.UIManager.UI[7].add(gameManager.entityManager.entities[0].x, gameManager.entityManager.entities[0].y, this.damage);

      const index = gameManager.bulletManager.bullets.indexOf(this);
      if (index > -1) {
        gameManager.bulletManager.bullets.splice(index, 1);
      }
    }
    if (this.x < 0 || this.x > windowWidth || this.y < 0 || this.y > windowHeight) {
      const index = gameManager.bulletManager.bullets.indexOf(this);
      if (index > -1) {
        gameManager.bulletManager.bullets.splice(index, 1);
      }
    }
    if (millis() - this.startTime > this.life) {
      const index = gameManager.bulletManager.bullets.indexOf(this);
      if (index > -1) {
        gameManager.bulletManager.bullets.splice(index, 1);
      }
    }
  }
}

class RandomBullet extends Bullet {
  constructor(x, y) {
    super(x, y);
    this.angle = random(TWO_PI);
    this.velocityX = this.speed * cos(this.angle);
    this.velocityY = this.speed * sin(this.angle);
    this.damage = gameManager.entityManager.entities[1].attack.attacks[0].damage;
    this.speed = gameManager.entityManager.entities[1].attack.attacks[0].speed;
  }
}

class StraightBullet extends Bullet {
  constructor(x, y, speed, targetX, targetY) {
    super(x, y, speed);
    this.angle = atan2(targetY - this.y, targetX - this.x);
    this.velocityX = this.speed * cos(this.angle);
    this.velocityY = this.speed * sin(this.angle);
    this.damage = gameManager.entityManager.entities[1].attack.attacks[1].damage;
    this.speed = gameManager.entityManager.entities[1].attack.attacks[1].speed;
  }
}

class ShieldBullet extends Bullet {
  constructor(angleOffset) {
    const boss = gameManager.entityManager.entities[1];
    super(boss.x, boss.y);
    this.orbitRadius = boss.size + 10;
    this.angleOffset = angleOffset;
    this.speed = 0;
    this.damage = 0;
    this.life = 3000;
    this.size = 32;
  }
  update() {
    const boss = gameManager.entityManager.entities[1];
    const player = gameManager.entityManager.entities[0];
    const angle = frameCount * 0.02 + this.angleOffset;
    this.x = boss.x + cos(angle) * this.orbitRadius;
    this.y = boss.y + sin(angle) * this.orbitRadius;

    for (let i = player.attack.bullets.length - 1; i >= 0; i--) {
      const b = player.attack.bullets[i];
      const d = dist(this.x, this.y, b.x, b.y);
      if (d < (this.size + b.radius * 2) / 2) {
        player.attack.bullets.splice(i, 1);
        const index = gameManager.bulletManager.bullets.indexOf(this);
        if (index > -1) {
          gameManager.bulletManager.bullets.splice(index, 1);
        }
        break;
      }
    }
  }

  show() {
    push();
    translate(this.x, this.y);
    rotate(frameCount * 0.05 + this.angleOffset);
    fill(255, 60, 56, 200);
    beginShape();
    vertex(0, -10);
    vertex(8, 0);
    vertex(0, 10);
    vertex(-8, 0);
    endShape(CLOSE);
    pop();
  }
}

class SpiralBullet extends Bullet {
  constructor(x, y, angleOffset, rotationDelay) {
    super(x, y);
    this.angle = angleOffset;
    this.radius = 0;
    this.speed = gameManager.entityManager.entities[1].attack.attacks[4].speed;
    this.angularSpeed = 0.05;
    this.rotationDelay = rotationDelay;
    this.startTime = millis();
    this.life = 4000;
    this.damage = gameManager.entityManager.entities[1].attack.attacks[4].damage;
  }
  update() {
    this.radius += this.speed;
    if (millis() - this.startTime > this.rotationDelay) {
      this.angle += this.angularSpeed;
    }
    this.x = gameManager.entityManager.entities[1].x + gameManager.entityManager.entities[1].size / 2 + this.radius * cos(this.angle);
    this.y = gameManager.entityManager.entities[1].y + gameManager.entityManager.entities[1].size / 2 + this.radius * sin(this.angle);
    super.update();
  }
}

class WaveBullet extends Bullet {
  constructor(x, y, angle) {
    super(x, y);
    this.angle = angle;
    this.speed = gameManager.entityManager.entities[1].attack.attacks[2].speed;
    this.damage = gameManager.entityManager.entities[1].attack.attacks[2].damage;
    this.velocityX = this.speed * cos(this.angle);
    this.velocityY = this.speed * sin(this.angle);
  }
}

class LaserBullet extends Bullet {
  constructor(x, y, targetX, targetY) {
    super(x, y);
    const aimVariation = random(-PI / 12, PI / 12);
    this.angle = atan2(targetY - this.y, targetX - this.x) + aimVariation;
    this.width = 10;
    this.height = dist(x, y, windowWidth + gameManager.entityManager.entities[0].size, targetY);
    this.angle = atan2(targetY - this.y, targetX - this.x);
    this.velocityX = this.speed * cos(this.angle);
    this.velocityY = this.speed * sin(this.angle);
    this.life = 2000;
    this.x = x + this.width / 2 * cos(this.angle);
    this.y = y + this.width / 2 * sin(this.angle);
    this.startTime = millis();
    this.damage = gameManager.entityManager.entities[1].attack.attacks[5].damage;
    this.speed = gameManager.entityManager.entities[1].attack.attacks[5].speed;
  }
  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    noStroke();

    for (let i = 3; i > 0; i--) {
      fill(255, 50, 50, 20 * i);
      rect(0, -this.width / 2 * i, this.height, this.width * i);
    }

    fill(255, 0, 0);
    rect(0, -this.width / 2, this.height, this.width);

    fill(255);
    rect(0, -1, this.height, 2);

    pop();
  }
  update() {
    if (millis() - this.startTime > this.life) {
      const index = gameManager.bulletManager.bullets.indexOf(this);
      if (index > -1) {
        gameManager.bulletManager.bullets.splice(index, 1);
      }
      return;
    }

    const collision = this.checkCollisionWithPlayer();
    if (collision) {
      gameManager.entityManager.entities[0].health -= this.damage * deltaTime / 1000;
      gameManager.UIManager.UI[3].damageVignette();
      if (millis() - gameManager.UIManager.UI[3].vignetteTimer > 250) {
        gameManager.UIManager.UI[3].vignetteState = "normal";
        gameManager.UIManager.UI[3].vignetteTimer = millis();
      }
    }
  }
  checkCollisionWithPlayer() {
    return collideLineRect(
      this.x, this.y,
      this.x + this.height * cos(this.angle),
      this.y + this.height * sin(this.angle),
      gameManager.entityManager.entities[0].x - gameManager.entityManager.entities[0].size / 2,
      gameManager.entityManager.entities[0].y - gameManager.entityManager.entities[0].size / 2,
      gameManager.entityManager.entities[0].size,
      gameManager.entityManager.entities[0].size
    );
  }
}

function keyPressed() {
  gameManager.StateMachine.keyPressed();
  gameManager.UpgradeManager.keyPressed();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Cascadia Code");
  gameManager = new GameManager();
  const bg = gameManager.UIManager.UI.find(ui => ui instanceof Background);
  bg?.render();
  gameManager.UIManager.UI[5].render();
  gameManager.UIManager.UI[6].render();
  gameManager.UIManager.UI[8].render();
  gameManager.UIManager.UI[9].render();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  const bg = gameManager.UIManager.UI.find(ui => ui instanceof Background);
  bg?.regenerate();
  bg?.render();

  gameManager.UIManager.UI[5]?.regenerate();
  gameManager.UIManager.UI[5]?.render();

  gameManager.UIManager.UI[9]?.regenerate();
  gameManager.UIManager.UI[9]?.render();

  gameManager.UpgradeManager?.regenerate();
  gameManager.UpgradeManager?.setup();
}

function draw() {
  background(19, 24, 33);
  gameManager.UIManager.UI.find(ui => ui instanceof Background)?.show();

  gameManager.checkBossHealth();

  gameManager.StateMachine.checkGameOver();
  gameManager.StateMachine.checkState();
}
