var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/Scene.js
var Scene_exports = {};
__export(Scene_exports, {
  initScene: () => initScene
});
module.exports = __toCommonJS(Scene_exports);

// ../client/src/js/AutoBindMethods.js
var AutoBindMethods = class _AutoBindMethods {
  constructor() {
    let functionNames = [];
    let obj = Object.getPrototypeOf(this);
    while (obj) {
      if (obj === Object.prototype || obj === _AutoBindMethods.prototype) {
        obj = Object.getPrototypeOf(obj);
        continue;
      }
      functionNames = functionNames.concat(
        Object.getOwnPropertyNames(obj).filter((name) => name !== "constructor" && functionNames.indexOf(name) === -1 && typeof this[name] === "function")
      );
      obj = Object.getPrototypeOf(obj);
    }
    for (let functionName of functionNames) {
      this[functionName] = this[functionName].bind(this);
    }
  }
};

// ../client/src/js/Renderer.js
var Renderer = class extends AutoBindMethods {
  /**
   * @param {HTMLElement} container
   */
  constructor(container = null, params = {}) {
    super();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true,
      alpha: true,
      powerPreference: "high-performance",
      ...params
    });
    this.fps = 60;
    this.targetFps = 70;
    this.lastRender = 0;
    if (container) {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
      container.appendChild(this.renderer.domElement);
    }
  }
  /**
   * @param {number|string} width
   * @param {number|string} height
   */
  setSize(width, height) {
    this.renderer.setSize(width, height);
  }
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   */
  render(time, deltaTime, scene, camera) {
    if (!this.lastRender) {
      this.lastRender = time - deltaTime;
    }
    const timeSinceLastRender = time - this.lastRender;
    const currentFPS = 1e3 / timeSinceLastRender;
    this.fps -= (this.fps - currentFPS) / 60;
    if (timeSinceLastRender >= 1e3 / this.targetFps) {
      this.renderer.render(scene, camera);
      this.lastRender = time;
    }
    this.targetFps = this.fps + 10;
  }
};

// ../client/src/js/GameObjects/GameObject.js
var GameObject = class extends AutoBindMethods {
  constructor(params = {}) {
    super();
    this.params = { ...params };
    this.object = params.object;
    if (params.object) {
      this.position = params.object.position;
      this.rotation = params.object.rotation;
    }
    this.events = {};
  }
  update() {
  }
  /**
   * @param {string} eventName
   * @param {object[]} args
   */
  dispatchEvent(eventName, ...args) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((callback) => callback(...args));
    }
  }
  /**
   * @param {string} eventName
   * @param {function} callback
   */
  addEventListener(eventName, callback) {
    if (typeof callback === "function") {
      if (this.events[eventName]) {
        this.events[eventName].push(callback);
      } else {
        this.events[eventName] = [callback];
      }
    }
  }
  getChildByName(name) {
    return this.object.getObjectByName(name, true);
  }
  getChildDirection(arg, vector = new THREE.Vector3(0, 0, 1)) {
    const child = typeof arg === "string" ? this.getChildByName(arg) : arg;
    return vector.applyQuaternion(this.getChildRotation(child));
  }
  getChildPosition(arg) {
    const child = typeof arg === "string" ? this.getChildByName(arg) : arg;
    return new THREE.Vector3().setFromMatrixPosition((child || this.object).matrixWorld);
  }
  getChildRotation(arg) {
    const child = typeof arg === "string" ? this.getChildByName(arg) : arg;
    let target = new THREE.Quaternion();
    (child || this.object).getWorldQuaternion(target);
    return target;
  }
};

// ../client/src/js/GameObjects/AnimatedGameObject.js
var animationNames = {
  stand: "Stand",
  run: "Run",
  jump: "Jump",
  attack: "Attack",
  rotateLeft: "Rotate Left",
  rotateRight: "Rotate Right",
  runLeft: "Run Left",
  runRight: "Run Right",
  walkBack: "Walk Back",
  die: "Die",
  spawn: "Spawn",
  hit: "Hit",
  // Complex animimations
  topRun: "Top Run",
  bottomRun: "Bottom Run",
  topWalkBack: "Top Walk Back",
  bottomWalkBack: "Bottom Walk Back",
  topAttack: "Top Attack",
  topAttackWeapon1: "Top Attack Weapon 1",
  bottomAttack: "Bottom Attack",
  bottomAttackWeapon1: "Bottom Attack",
  topStand: "Top Stand",
  bottomStand: "Bottom Stand",
  topRunRight: "Top Run Right",
  topRunLeft: "Top Run Left",
  topJump: "Top Jump",
  topHit: "Top Hit",
  bottomRunRight: "Bottom Run Right",
  bottomRunLeft: "Bottom Run Left",
  bottomJump: "Bottom Jump",
  bottomHit: "Bottom Hit",
  topDie: "Top Die",
  bottomDie: "Bottom Die",
  topSpawn: "Top Spawn",
  bottomSpawn: "Bottom Spawn"
};
var topAnimations = [
  "topRun",
  "topWalkBack",
  "topAttack",
  "topAttackWeapon1",
  "topStand",
  "topRunRight",
  "topRunLeft",
  "topJump",
  "topHit",
  "topDie"
];
var bottomAnimations = [
  "bottomRun",
  "bottomWalkBack",
  "bottomAttack",
  "bottomAttackWeapon1",
  "bottomStand",
  "bottomRunRight",
  "bottomRunLeft",
  "bottomJump",
  "bottomHit",
  "bottomDie"
];
var topBones = [
  "Right_Forearm",
  "Right_Arm",
  "Right_Hand",
  "Right_Hand_end",
  "Right_Shoulder",
  "Left_Shoulder",
  "Left_Forearm",
  "Left_Arm",
  "Left_Hand",
  "Left_Hand_end",
  "Chest",
  "Neck",
  "Head",
  "Head_end"
];
var bottomBones = [
  "Main_Bone",
  "Right_Leg",
  "Right_Middle_Foot",
  "Right_Foot",
  "Right_Foot_end",
  "Left_Leg",
  "Left_Middle_Foot",
  "Left_Foot",
  "Left_Foot_end",
  "Legs_Rotation"
];
var AnimatedGameObject = class extends GameObject {
  constructor(params = {}) {
    super({
      animationNames: { ...animationNames },
      topBones: [...topBones],
      bottomBones: [...bottomBones],
      topAnimations: [...topAnimations],
      bottomAnimations: [...bottomAnimations],
      spawnTimeout: 1,
      ...params
    });
    this.animationState = {
      isMovingForward: false,
      isMovingRight: false,
      isMovingLeft: false,
      isMovingBackward: false,
      isRotateLeft: false,
      isRotateRight: false,
      isAttack: false,
      isAttackWeapon1: false,
      isJump: false,
      isDie: false,
      isHit: false,
      isSpawn: true
    };
    this.playingAnimations = {};
    this.legsRotationY = 0;
    this.spawnTime = 0;
    this.mixer = new THREE.AnimationMixer(this.params.object);
    this.initAnimations(this.params.animationNames);
  }
  update(time, deltaTime) {
    super.update(time, deltaTime);
    if (!this.spawnTime) {
      this.spawnTime = time;
    } else if (this.animationState.isSpawn && this.isSpawnFinished(time)) {
      this.animationState.isSpawn = false;
    }
    if (this.mixer) {
      this.mixer.update(deltaTime / 1e3);
    }
    if (this._attachedModels) {
      Object.values(this._attachedModels).forEach((attachedModel) => {
        if (attachedModel && attachedModel._mixer) {
          attachedModel._mixer.update(deltaTime / 1e3);
        }
      });
    }
    if (this.params.complexAnimations) {
      this.updateComplexAnimations();
    } else {
      const animation = this.getCurrentAnimation();
      animation && this.playAnimation(animation);
    }
  }
  playAnimation(animation, { force } = {}) {
    if (!animation || !animation._clip) return;
    const animationName = animation._clip.name;
    const shouldUpdate = this.playingAnimationName !== animationName || force;
    if (shouldUpdate) {
      this.playingAnimationName = animationName;
      animation.reset();
      animation.play();
      if (this.playingAnimation) {
        var from = this.playingAnimation;
        from.enabled = true;
        animation.enabled = true;
        from.crossFadeTo(animation, 0.3);
      }
      this.playingAnimation = animation;
    }
  }
  initAnimations(animationNames2) {
    const {
      topAnimations: topAnimations2,
      bottomAnimations: bottomAnimations2,
      topBones: topBones2,
      bottomBones: bottomBones2,
      complexAnimations
    } = this.params;
    this.animations = Object.keys(animationNames2).reduce(
      (result, key) => {
        let excludedBones = [];
        if (complexAnimations) {
          if (topAnimations2.includes(key)) {
            excludedBones = bottomBones2;
          } else if (bottomAnimations2.includes(key)) {
            excludedBones = topBones2;
          }
        }
        const modelAnimation = this.findModelAnimation(animationNames2[key], { excludedBones });
        let initedAnimation = this.createClipAction(modelAnimation);
        return { ...result, [key]: initedAnimation };
      },
      {}
    );
    const {
      animations: {
        jump,
        attack,
        topAttack,
        topAttackWeapon1,
        die,
        spawn,
        topDie,
        bottomDie,
        topJump,
        bottomJump,
        bottomAttack,
        bottomAttackWeapon1
      } = {}
    } = this;
    [jump, die, spawn, topDie, bottomDie, topJump, bottomJump].forEach((clampAnimation) => {
      if (clampAnimation) {
        clampAnimation.setLoop(THREE.LoopOnce, 0);
        clampAnimation.clampWhenFinished = true;
      }
    });
    [attack, topAttack, bottomAttack, topAttackWeapon1, bottomAttackWeapon1].forEach((attackAnimation) => {
      if (attackAnimation) {
        attackAnimation.setDuration(this.params.attackTimeout);
      }
    });
  }
  createClipAction(action) {
    return action && this.mixer.clipAction(action).stop();
  }
  findModelAnimation(name, { excludedBones = [] } = {}) {
    const { animations = [] } = this.params;
    let animation = animations.find((animation2) => animation2.name === name);
    if (animation && excludedBones.length) {
      return this.clearAnimationBones(animation, excludedBones);
    }
    return animation;
  }
  isMoving() {
    return this.animationState.isMovingLeft || this.animationState.isMovingRight || this.animationState.isMovingForward || this.animationState.isMovingBackward;
  }
  isSpawnFinished(time) {
    return time - this.spawnTime > this.params.spawnTimeout * 1e3;
  }
  clearAnimationBones(animation, bones) {
    if (animation) {
      const getBoneName = (item) => item.name.split(".")[0], isNotExcluded = (item) => !bones.includes(getBoneName(item));
      animation.tracks = animation.tracks.filter(isNotExcluded);
      return animation;
    }
  }
  updateComplexAnimations() {
    const {
      animations: {
        topAttack,
        bottomAttack,
        topAttackWeapon1,
        bottomAttackWeapon1,
        topWalkBack,
        bottomWalkBack,
        topRun,
        bottomRun,
        topRunRight,
        topRunLeft,
        topStand,
        bottomStand,
        topJump,
        bottomJump,
        topHit,
        bottomHit,
        topDie,
        bottomDie,
        topSpawn,
        bottomSpawn
      } = {}
    } = this;
    const {
      isAttack,
      isAttackWeapon1,
      isMovingRight,
      isMovingLeft,
      isMovingBackward,
      isMovingForward,
      isJump,
      isDie,
      isHit,
      isSpawn
    } = this.animationState;
    const playingAnimations = {
      top: isDie && topDie || isHit && topHit || isAttackWeapon1 && topAttackWeapon1 || isAttack && topAttack || isJump && topJump || isMovingBackward && isMovingRight && topRunLeft || isMovingBackward && isMovingLeft && topRunRight || isMovingBackward && topWalkBack || isMovingRight && topRunRight || isMovingLeft && topRunLeft || isMovingForward && topRun || isSpawn && topSpawn || topStand,
      bottom: isDie && bottomDie || isJump && bottomJump || isMovingBackward && isMovingRight && bottomWalkBack || isMovingBackward && isMovingLeft && bottomWalkBack || isMovingBackward && bottomWalkBack || isMovingRight && bottomRun || isMovingLeft && bottomRun || isMovingForward && bottomRun || isAttackWeapon1 && bottomAttackWeapon1 || isAttack && bottomAttack || isHit && bottomHit || isSpawn && bottomSpawn || bottomStand
    };
    const legsRotationBone = this.getChildByName("Legs_Rotation");
    if (legsRotationBone) {
      const { rotation } = legsRotationBone;
      let y = -0.3;
      if (isMovingLeft) {
        y = isMovingForward ? 0.5 : isMovingBackward ? -0.7 : 1;
      } else if (isMovingRight) {
        y = isMovingForward ? -1.2 : isMovingBackward ? 0.4 : -1.7;
      }
      this.legsRotationY = this.legsRotationY - (this.legsRotationY - y) / 10;
      rotation.set(rotation.x, this.legsRotationY, rotation.z);
    }
    this.blendAnimations(playingAnimations);
  }
  blendAnimations({ top, bottom }) {
    if (!(top && bottom && top._clip && bottom._clip)) return;
    const getAnimationName = (a) => a._clip.name, playAnimation = (fromAnimation, animation) => {
      const animationName = getAnimationName(animation);
      const fromAnimationName = fromAnimation && getAnimationName(fromAnimation);
      if (fromAnimationName !== animationName) {
        animation.reset();
        animation.play();
        if (fromAnimation) {
          fromAnimation.crossFadeTo(animation, 0.3);
        }
      }
    };
    playAnimation(this.playingAnimations.top, top);
    playAnimation(this.playingAnimations.bottom, bottom);
    this.playingAnimations.top = top;
    this.playingAnimations.bottom = bottom;
  }
  getCurrentAnimation() {
    const {
      animations: {
        stand,
        attack,
        walkBack,
        runLeft,
        runRight,
        run,
        jump,
        hit,
        rotateLeft,
        rotateRight,
        die,
        spawn
      } = {}
    } = this;
    const {
      isAttack,
      isMovingForward,
      isJump,
      isMovingLeft,
      isMovingRight,
      isMovingBackward,
      isRotateLeft,
      isRotateRight,
      isDie,
      isHit,
      isSpawn
    } = this.animationState;
    return isDie && die || isHit && hit || isAttack && attack || isJump && jump || isMovingBackward && walkBack || isMovingLeft && runLeft || isMovingRight && runRight || isMovingForward && run || isRotateLeft && rotateLeft || isRotateRight && rotateRight || isSpawn && spawn || stand;
  }
};

// ../client/src/js/GameObjects/MovingGameObject.js
var MovingGameObject = class extends AnimatedGameObject {
  constructor(params = {}) {
    super({
      speed: 0.1,
      gravity: 1,
      slideThrottling: new THREE.Vector3(1, 1, 1),
      throttling: new THREE.Vector3(0.5, 0.95, 0.5),
      acceleration: new THREE.Vector3(0, 0, 0),
      checkWay: () => true,
      ...params
    });
  }
  update(time, deltaTime) {
    super.update(time, deltaTime);
    const { acceleration, throttling, gravity, slideThrottling, fromNetwork, getEnvironmentY } = this.params;
    if (!fromNetwork) {
      acceleration.y -= gravity / 100 * (deltaTime * 0.06);
      this.isGrounded = !this.checkWay(0, -0.2, 0);
      this.animationState.isJump = !this.isGrounded;
      const hasAccelerationX = Boolean(acceleration.x);
      const hasAccelerationY = Boolean(acceleration.y);
      const hasAccelerationZ = Boolean(acceleration.z);
      const canMoveX = hasAccelerationX && this.checkWay(acceleration.x, 0, 0);
      const canMoveY = hasAccelerationY && this.checkWay(0, acceleration.y, 0);
      const canMoveZ = hasAccelerationZ && this.checkWay(0, 0, acceleration.z);
      if (hasAccelerationX && !canMoveX || hasAccelerationY && !canMoveY || hasAccelerationZ && !canMoveZ) {
        acceleration.multiply(slideThrottling);
        if (hasAccelerationX && !canMoveX) {
          const isClimbing = acceleration.x && this.isGrounded && acceleration.y <= 0 && this.checkWay(acceleration.x, 0.1, 0);
          if (isClimbing) {
            let climbingValue = 0.1;
            if (getEnvironmentY) {
              climbingValue = getEnvironmentY({ x: this.position.x + acceleration.x, y: 0, z: this.position.z }) - this.position.y;
            }
            this.position.y += climbingValue;
          } else {
            acceleration.x = 0;
          }
        }
        if (!canMoveY) {
          acceleration.y = 0;
        }
        if (hasAccelerationZ && !canMoveZ) {
          const isClimbing = acceleration.z && this.isGrounded && acceleration.y <= 0 && this.checkWay(0, 0.1, acceleration.z);
          if (isClimbing) {
            let climbingValue = 0.1;
            if (getEnvironmentY) {
              climbingValue = getEnvironmentY({ x: this.position.x, y: 0, z: this.position.z + acceleration.z }) - this.position.y;
            }
            this.position.y += climbingValue;
          } else {
            acceleration.z = 0;
          }
        }
      }
    }
    acceleration.x *= throttling.x;
    acceleration.y *= throttling.y;
    acceleration.z *= throttling.z;
    const isMoving = Math.abs(acceleration.x) > 1e-3 || Math.abs(acceleration.y) > 1e-3 || Math.abs(acceleration.z) > 1e-3;
    if (isMoving) {
      this.position.add(acceleration);
    }
  }
  checkWay(x = 0, y = 0, z = 0) {
    const { position, params: { checkWay } } = this;
    const nextPosition = new THREE.Vector3(position.x + x, position.y + y, position.z + z);
    return checkWay(nextPosition, this);
  }
  getLeft() {
    return this.getDirection(new THREE.Vector3(1, 0, 0));
  }
  getUp() {
    return this.getDirection(new THREE.Vector3(0, 1, 0));
  }
  getForward() {
    return this.getDirection(new THREE.Vector3(0, 0, 1));
  }
  /**
   * @param {THREE.Vector3} direction
   */
  getDirection(direction) {
    direction.applyQuaternion(this.object.quaternion);
    return direction;
  }
  getScalarAcceleration() {
    return this.params.acceleration.toArray().map(Math.abs).reduce((r, v) => r + v, 0);
  }
};

// ../client/src/js/GameObjects/Unit.js
var Unit = class extends MovingGameObject {
  constructor(params = {}) {
    super({
      hp: 100,
      hpMax: params.hp || 100,
      damage: 10,
      attackTimeout: 0.9,
      hitTime: 0.3,
      attackDamageTimeout: 0.3,
      equippedItems: {
        leftHand: null
      },
      ...params
    });
    this._attachedModels = {};
    this.shouldAttack = false;
    this.latestAttackTimestamp = 0;
    this.latestHitTimestamp = 0;
    ["onDamageTaken", "onDamageDeal", "onKill", "onDie"].forEach((eventName) => {
      if (typeof params[eventName] === "function") {
        this.addEventListener(eventName, params[eventName]);
      }
    });
  }
  update(time, deltaTime) {
    super.update(time, deltaTime);
    if (this.isDead()) {
      return;
    }
    const hitReleased = this.isHitReleased(time);
    this.animationState.isHit = !hitReleased;
    if (this.isAttackReleased(time) && hitReleased) {
      this.animationState.isAttack = false;
      this.animationState.isAttackWeapon1 = false;
      if (this.shouldAttack) {
        if (this.params.equippedItems.leftHand) {
          this.animationState.isAttackWeapon1 = true;
        } else {
          this.animationState.isAttack = true;
        }
        this.latestAttackTimestamp = time;
        this.params.attack && this.params.attack();
      }
    } else {
      this.shouldAttack = false;
    }
  }
  getFraction() {
    return this.params.fraction;
  }
  getCollider(position) {
    const diffY = position.y - this.position.y;
    return Math.sqrt(
      Math.pow(position.x - this.position.x, 2) + Math.pow(position.z - this.position.z, 2)
    ) < 1 && diffY >= 0 && diffY < 1.7;
  }
  releaseAttack(time) {
    this.latestAttackTimestamp = time - this.params.attackTimeout * 1e3;
    this.animationState.isAttack = false;
    this.animationState.isAttackWeaponAttach1 = false;
  }
  isAttackReleased(time) {
    return time - this.latestAttackTimestamp >= this.params.attackTimeout * 1e3;
  }
  isAttackInterrupted(time) {
    return time - this.latestHitTimestamp <= this.params.attackDamageTimeout * 1e3;
  }
  isHitReleased(time) {
    return time - this.latestHitTimestamp >= this.params.hitTime * 1e3;
  }
  attack() {
    this.shouldAttack = true;
  }
  isDead() {
    return this.params.hp <= 0;
  }
  isAlive() {
    return !this.isDead();
  }
  isEnemy(unit) {
    return unit.params.fraction !== this.params.fraction && unit.params.fraction !== "neutral" && this.params.fraction !== "neutral";
  }
  getLevel() {
    return this.params.level;
  }
  getName() {
    return this.params.name;
  }
  getAttackTimeout() {
    return this.params.attackDamageTimeout * 1e3;
  }
  damageTaken({ damage, unit: attacker } = {}, time) {
    if (damage && attacker) {
      this.params.hp -= damage;
      this.dispatchEvent("onDamageTaken", attacker);
      if (attacker) {
        attacker.dispatchEvent("onDamageDeal", this);
      }
      const interruptByChance = Math.random() < 0.33;
      const interruptByLevel = attacker.getLevel() - this.getLevel() > 2;
      const shouldBeInterrupted = interruptByLevel || interruptByChance;
      if (shouldBeInterrupted) {
        this.latestHitTimestamp = time;
      }
      if (this.isDead()) {
        this.die(attacker);
      }
    }
  }
  die(killingUnit) {
    this.params.hp = 0;
    this.dispatchEvent("onDie", killingUnit);
    this.animationState.isDie = true;
    if (killingUnit) {
      killingUnit.dispatchEvent("onKill", this);
    }
  }
  addSpeed(speed) {
    this.params.speed += speed;
  }
  addDamage(damage) {
    this.params.damage += damage;
  }
  addHP(hp) {
    if (this.isAlive()) {
      this.params.hp = Math.min(this.params.hp + hp, this.params.hpMax);
    }
  }
  getMoney() {
    return this.params.money;
  }
  addMoney(money) {
    this.params.money += money;
  }
  addMaxHP(hp) {
    if (this.isAlive()) {
      this.params.hpMax += hp;
      this.params.hp += hp;
    }
  }
  getHP() {
    return this.params.hp;
  }
  getMaxHP() {
    return this.params.hpMax;
  }
  getSpeed() {
    return this.params.speed;
  }
  getDamage() {
    return this.params.damage + this.getDamageFromEffects();
  }
  getDamageFromEffects() {
    let damage = 0;
    const { equippedItems } = this.params;
    if (equippedItems) {
      const { leftHand } = equippedItems;
      if (leftHand) {
        leftHand.effects.forEach((effect) => {
          if (effect.damage) {
            damage += effect.damage;
          }
        });
      }
    }
    return damage;
  }
};

// ../client/src/js/GameObjects/FiringUnit.js
var FiringUnit = class extends Unit {
  constructor(params = {}) {
    super({
      fireDamage: 10,
      fireTimeOffset: 0.4,
      fireTimeout: 1.5,
      fireShellSpeed: 3,
      ...params
    });
    this.isFire = false;
    this.shouldFire = false;
    this.latestFire = 0;
  }
  getFireInitialPosition() {
    return this.position.clone().add(
      this.getUp().multiplyScalar(1.5).add(this.getForward().multiplyScalar(0.5)).add(this.getLeft().multiplyScalar(0.2))
    );
  }
  getFireInitialRotation() {
    return this.rotation;
  }
  getFireDamage() {
    return this.params.fireDamage;
  }
  addFireDamage(fireDamage) {
    return this.params.fireDamage += fireDamage;
  }
  update(time, deltaTime) {
    super.update(time, deltaTime);
    if (this.isDead()) {
      return;
    }
    if (this.shouldFire && this.params.fire && this.isFireReleased(time) && this.isAttackReleased(time)) {
      this.isFire = true;
      this.shouldFire = false;
      this.latestFire = time;
    } else {
      this.shouldFire = false;
    }
    if (this.isFire && time - this.latestFire >= this.params.fireTimeOffset * 1e3) {
      this.params.fire();
      this.isFire = false;
    }
    if (!this.animationState.isAttack && !this.animationState.isAttackWeapon1) {
      this.animationState.isAttack = !this.isFireReleased(time);
    }
  }
  isFireReleased(time) {
    return time - this.latestFire >= this.params.fireTimeout * 1e3;
  }
  fire() {
    this.shouldFire = true;
  }
};

// ../client/src/js/GameObjects/AI.js
var AI = class extends FiringUnit {
  constructor(params = {}) {
    super({
      speed: 0.5,
      damage: 10,
      hp: 100,
      name: "Unnamed Unit",
      fraction: "neutral",
      fireTimeout: 1.5,
      attackTimeout: 1.5,
      jumpTimeout: 1.5,
      startRunTimeout: 1,
      nextPointUpdateTimeout: 0.1,
      updateTargetTimeout: 3,
      type: "ai",
      ...params
    });
    const { hp, damage, speed } = this.params;
    this.params.bounty = hp / 4 + damage + speed * 30;
    this.lastRun = 0;
    this.lastTargetUpdate = 0;
    this.lastNextPointUpdate = 0;
    this.lastJumpTimestamp = 0;
    this.isRunning = false;
    this.isAttack = false;
  }
  update(time, deltaTime) {
    super.update(time, deltaTime);
    if (this.isDead()) {
      return;
    }
    const { object, target, acceleration, speed, getNextPoint, fromNetwork } = this.params;
    if (!fromNetwork) {
      if (this.params.findTarget && this.isUpdateTargetReleased(time)) {
        this.params.target = this.params.findTarget();
      }
      if (target) {
        if (getNextPoint) {
          if (this.isNextPointUpdateReleased(time)) {
            this.lastNextPointUpdate = time;
            this.nextPoint = getNextPoint(this.position, target.position);
          }
        } else {
          this.nextPoint = target.position;
        }
      }
      const isTargetNear = target && object.position.distanceTo(target.position) < 1.75;
      this.isAttack = isTargetNear && this.isEnemy(target) && target.isAlive();
      if (this.isAttack) {
        this.rotateToPosition(target.position);
      } else if (this.nextPoint) {
        this.rotateToPosition(this.nextPoint);
      }
      const isNextPointNear = !this.nextPoint;
      this.isRunning = target && !isTargetNear && !isNextPointNear && (this.isRunning || this.isRunReleased(time)) && this.isAttackReleased(time) && this.isHitReleased(time);
    }
    if (this.isAttack) {
      this.attack();
    }
    this.animationState.isMovingForward = this.isRunning && (fromNetwork || this.isAcceleration());
    if (!fromNetwork && this.isRunning) {
      const checkWay = (jumpHeight) => {
        const { params: { acceleration: { x: dx, y: dy, z: dz } } } = this;
        return this.checkWay(dx, dy + jumpHeight, dz);
      };
      this.lastRun = time;
      acceleration.add(this.getForward().multiplyScalar(speed * 0.1 * (deltaTime * 0.06)));
      const isJumpNeeded = this.isGrounded && (acceleration.x || acceleration.z) && time - this.lastJumpTimestamp > this.params.jumpTimeout * 1e3 && !checkWay(0.1) && checkWay(1.5);
      if (isJumpNeeded) {
        this.lastJumpTimestamp = time;
        acceleration.y += 0.25;
      }
    }
  }
  rotateToPosition(position) {
    const { object } = this.params;
    const rotationToTargetRadians = Math.atan2(
      position.x - object.position.x,
      position.z - object.position.z
    );
    const targetQuaternion = new THREE.Quaternion();
    targetQuaternion.setFromEuler(object.rotation.clone().set(0, rotationToTargetRadians, 0));
    object.quaternion.slerp(targetQuaternion, 0.1);
  }
  isAcceleration() {
    return Math.abs(this.params.acceleration.x) + Math.abs(this.params.acceleration.y) + Math.abs(this.params.acceleration.z) > 0.01;
  }
  isRunReleased(time) {
    return time - this.lastRun > this.params.startRunTimeout * 1e3;
  }
  isNextPointUpdateReleased(time) {
    return time - this.lastNextPointUpdate > this.params.nextPointUpdateTimeout * 1e3;
  }
  isUpdateTargetReleased(time) {
    return time - this.lastTargetUpdate > this.params.updateTargetTimeout * 1e3;
  }
  damageTaken({ damage, unit: attacker } = {}, time) {
    super.damageTaken({ damage, unit: attacker }, time);
    if (!this.params.target) {
      this.params.target = attacker;
      this.lastTargetUpdate = time;
    }
  }
};

// ../client/src/js/GameObjects/Player.js
var Player = class extends FiringUnit {
  constructor(params = {}) {
    super({
      speed: 0.55,
      fireTimeout: 1,
      fireDamage: 25,
      damage: 50,
      hp: 100,
      experience: 0,
      unspentTalents: 0,
      money: 500,
      isFire: false,
      level: 1,
      jumpTimeout: 0.9,
      fraction: "friendly",
      sensitivity: 1,
      type: "player",
      equippedItems: {},
      ...params
    });
    this.lastJumpTimestamp = 0;
    this.rotationAcceleration = 0;
    params.onLevelUp && this.addEventListener("onLevelUp", params.onLevelUp);
  }
  update(time, deltaTime) {
    super.update(time, deltaTime);
    if (this.isDead()) {
      return;
    }
    const { input, object, acceleration, fromNetwork, equippedItems } = this.params;
    acceleration.add(this.getMovingAcceleration(time, deltaTime));
    if (input.attack1) {
      this.attack();
    }
    if (input.attack2) {
      this.fire();
    }
    this.animationState.isMovingLeft = input.horizontal === -1;
    this.animationState.isMovingRight = input.horizontal === 1;
    this.animationState.isMovingForward = input.vertical === 1;
    this.animationState.isMovingBackward = input.vertical === -1;
    if (!fromNetwork) {
      if (input.isThirdPerson) {
        if (input.look.horizontal) {
          const horizontalLook = input.look.horizontal;
          this.animationState.isRotateLeft = horizontalLook < 0;
          this.animationState.isRotateRight = horizontalLook > 0;
          this.rotationAcceleration += -horizontalLook / 5e3 * input.look.sensitivity;
          input.resetHorizontalLook();
        }
        const CALC_ROTATE_THRESHOLD = 1e-7;
        if (Math.abs(this.rotationAcceleration) > CALC_ROTATE_THRESHOLD) {
          object.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), this.rotationAcceleration);
          this.rotationAcceleration *= 0.7;
        }
      } else {
        const deltaX = window.innerWidth / 2 - input.cursor.x;
        const deltaY = input.cursor.y - window.innerHeight / 2;
        const rotationY = Math.atan2(deltaY, deltaX);
        this.animationState.isRotateLeft = rotationY > object.rotation.y;
        this.animationState.isRotateRight = rotationY < object.rotation.y;
        object.rotation.set(0, rotationY, 0);
      }
    }
    if (input.isDrop && equippedItems.leftHand && this.params.dropItem) {
      this.params.dropItem(this.params.equippedItems.leftHand);
    }
  }
  getUnspentTalents() {
    return this.params.unspentTalents;
  }
  decreaseUnspentTalents() {
    return this.params.unspentTalents--;
  }
  addExperience(experience) {
    this.params.experience += experience;
    const level = this.getLevel();
    if (this.params.level !== level) {
      const levelsUp = level - this.params.level;
      this.params.level = level;
      this.params.unspentTalents += 3 * levelsUp;
      this.params.hp = this.params.hpMax;
      this.dispatchEvent("onLevelUp", level);
    }
  }
  getExperience() {
    return this.params.experience;
  }
  getLevelExperience() {
    return Math.pow(this.getLevel(), 2) * 100;
  }
  getLevel() {
    return Math.floor(Math.sqrt(this.params.experience / 100)) + 1;
  }
  getMovingAcceleration(time, deltaTime) {
    const { input: { horizontal, vertical, jump } } = this.params;
    const speed = vertical && horizontal ? this.params.speed * 0.1 * 0.7 * (deltaTime * 0.06) : this.params.speed * 0.1 * (deltaTime * 0.06);
    const addForward = vertical === 1 ? speed : vertical === -1 ? -speed * 0.6 : 0;
    const addSide = vertical === -1 ? -horizontal * speed * 0.6 : -horizontal * speed;
    const isJump = Boolean(
      time - this.lastJumpTimestamp > this.params.jumpTimeout * 1e3 && jump && this.isGrounded
    );
    if (isJump) {
      this.lastJumpTimestamp = time;
    }
    return this.getDirection(new THREE.Vector3(addSide, Number(isJump) * 0.25, addForward));
  }
};

// ../client/src/js/GameObjects/Fire.js
var Fire = class extends MovingGameObject {
  constructor(params = {}) {
    super({
      gravity: 0.05,
      slideThrottling: new THREE.Vector3(0.5, 0.5, 0.5),
      throttling: new THREE.Vector3(1, 1, 1),
      ...params
    });
    this.params.acceleration.add(
      this.getForward().multiplyScalar(this.params.speed * 0.1)
    );
  }
  update(time, deltaTime) {
    super.update(time, deltaTime);
    if (this.params.getCollisions) {
      const collisions = this.params.getCollisions(this);
      collisions.filter((collisionGameObject) => collisionGameObject instanceof Unit && collisionGameObject.isEnemy(this.params.parent)).forEach((collisionGameObject) => collisionGameObject.damageTaken({
        damage: this.params.damage,
        unit: this.params.parent
      }, time));
      if (collisions.length && this.params.destroy) {
        this.params.destroy(this);
      }
    }
  }
};

// ../client/src/js/GameObjects.js
var GameObjectsService = class extends AutoBindMethods {
  /**
   * @param {Scene} scene
   */
  constructor(scene) {
    super();
    this.gameObjects = [];
    this.nextGameObjectId = 0;
    this.scene = scene;
  }
  update(time, deltaTime) {
    const player = this.scene.getPlayer();
    this.gameObjects.filter((go) => (
      // Performance optimization
      this.scene.intervals.getTimePassed() < 3e4 || !go.params.fromNetwork || go.position.distanceTo(player.position) < 100
    )).forEach((gameObject) => gameObject.update(time, deltaTime));
  }
  /**
   * @param {Unit} attackingUnit
   */
  attack(attackingUnit) {
    if (attackingUnit.isDead()) {
      return;
    }
    this.scene.intervals.setTimeout(() => {
      const gameTime = this.scene.intervals.getTimePassed();
      if (attackingUnit.isAttackInterrupted(gameTime)) {
        attackingUnit.releaseAttack(gameTime);
        return;
      }
      const attackedUnits = this.getUnits().filter((gameObject) => gameObject !== attackingUnit && gameObject.isAlive() && gameObject.isEnemy(attackingUnit) && gameObject.position.distanceTo(attackingUnit.position) < 2);
      attackedUnits.forEach((collisionGameObject) => {
        collisionGameObject.damageTaken({
          damage: attackingUnit.getDamage(),
          unit: attackingUnit
        }, gameTime);
      });
    }, attackingUnit.getAttackTimeout());
  }
  /**
   * @param {FiringUnit} firingGameObject
   */
  fire(firingGameObject) {
    if (firingGameObject.isDead()) {
      return;
    }
    const object3d = this.scene.models.createGeometry({
      x: 0.1,
      y: 0.1,
      z: 0.1,
      emissive: "#ff1100",
      color: 16716032,
      localPosition: new THREE.Vector3(0, 0.1, 0),
      rotation: firingGameObject.getFireInitialRotation(),
      position: firingGameObject.getFireInitialPosition(),
      geometry: new THREE.SphereGeometry(1)
    });
    const fireGameObject = this.hookGameObject(new Fire({
      object: object3d,
      speed: firingGameObject.params.fireShellSpeed,
      damage: firingGameObject.params.fireDamage,
      parent: firingGameObject,
      checkWay: this.scene.colliders.checkWay,
      getCollisions: () => this.scene.units.getAliveUnits().filter((unit) => unit !== fireGameObject.params.parent && unit.isEnemy(fireGameObject.params.parent) && fireGameObject.position.distanceTo(unit.position) < 2),
      destroy: () => this.destroyGameObject(fireGameObject)
    }));
    const particlesLifeTime = 0.5;
    const textureLoader = new THREE.TextureLoader();
    const particlesSpeed = 0.01;
    const fireParticles = this.scene.particles.createAttachedParticles({
      size: 1.5,
      count: 30,
      color: 16716032,
      lifeTime: particlesLifeTime,
      parent: fireGameObject.object,
      texture: textureLoader.load("./assets/textures/fire.png"),
      getDefaultParticleVelocity: () => new THREE.Vector3(
        Math.random() * particlesSpeed - particlesSpeed / 2,
        Math.random() * particlesSpeed * 1.5 + 0.02,
        Math.random() * particlesSpeed - particlesSpeed / 2
      )
    });
    this.scene.intervals.setTimeout(
      () => {
        fireGameObject && this.destroyGameObject(fireGameObject);
        fireParticles.pause = true;
        this.scene.intervals.setTimeout(
          () => this.scene.particles.destroy(fireParticles),
          particlesLifeTime * 1500
        );
      },
      2e3
    );
  }
  createItem({
    scale = 1.5,
    model = "item-heal",
    name,
    type,
    effects,
    position = {},
    boneName,
    attachModelName,
    onLoad,
    canPickup,
    onPickup
  }) {
    const item = {
      name,
      type,
      effects,
      boneName,
      attachModelName,
      model
    };
    this.scene.models.loadGLTF({
      baseUrl: "./assets/models/items/" + model,
      noScene: true,
      callback: (loadedObject) => {
        const positionVector = new THREE.Vector3(position.x || 0, position.y || 0, position.z || 0);
        const object = loadedObject.scene;
        object.scale.set(scale, scale, scale);
        object.traverse((child) => {
          if (child.isMesh) {
            child.material.transparent = true;
            child.material.alphaTest = 0.5;
          }
        });
        object.position.set(positionVector.x, positionVector.y, positionVector.z);
        if (onLoad) {
          onLoad(object);
        }
        this.scene.scene.add(object);
        const gameItem = new AnimatedGameObject({
          object,
          animations: loadedObject.animations
        });
        this.scene.gameObjectsService.hookGameObject(gameItem);
        const checkPickup = () => {
          this.scene.intervals.setTimeout(
            () => {
              const getPriority = (unit) => 1 / Math.ceil(positionVector.distanceTo(unit.position));
              const nearUnits = this.scene.units.getAliveUnits().filter((unit) => positionVector.distanceTo(unit.position) < 2 && (!canPickup || canPickup(unit))).sort((unitA, unitB) => getPriority(unitB) - getPriority(unitA));
              if (nearUnits.length) {
                if (onPickup) {
                  onPickup(nearUnits[0]);
                }
                gameItem.animationState.isDie = true;
                this.scene.intervals.setTimeout(
                  () => this.scene.gameObjectsService.destroyGameObject(gameItem),
                  500
                );
              } else {
                checkPickup();
              }
            },
            1e3
          );
        };
        checkPickup();
      }
    });
    return item;
  }
  updateAttachedItems(unit) {
    if (!this.scene.isServer) {
      Object.values(unit.params.equippedItems).filter((i) => i).forEach((equippedItem) => {
        if (!unit._attachedModels[equippedItem.name]) {
          this.attachItem(unit, equippedItem);
        }
      });
    }
  }
  attachItem(unit, item) {
    let bone;
    const {
      boneName,
      name: itemName,
      attachModelName: modelName
    } = item;
    unit._attachedModels[itemName] = {};
    this.scene.models.loadGLTF({
      baseUrl: "./assets/models/items/" + modelName,
      noScene: true,
      callback: (loadedModel) => {
        const itemObject = loadedModel.scene;
        unit._attachedModels[itemName] = itemObject;
        unit.object.traverse((object) => {
          if (object.name === boneName) {
            bone = object;
          }
        });
        if (bone) {
          bone.add(itemObject);
          const mixer = new THREE.AnimationMixer(itemObject);
          const idleAnimation = loadedModel.animations.find((animation) => animation.name === "Idle");
          const idleAction = mixer.clipAction(idleAnimation);
          idleAction.play();
          itemObject._mixer = mixer;
        }
      }
    });
  }
  dropItem(unit, item) {
    const attached = unit._attachedModels;
    const equipped = unit.params.equippedItems;
    const leftHand = equipped.leftHand;
    if (leftHand === item) {
      const {
        model,
        name,
        type,
        boneName,
        attachModelName,
        effects
      } = item;
      equipped.leftHand = null;
      this.createWeaponItem({
        model,
        name,
        type,
        boneName,
        attachModelName,
        effects,
        position: unit.position.clone()
      });
      const attachedModel = attached[item.name];
      if (attachedModel) {
        const parent = attachedModel && attachedModel.parent;
        if (parent && parent.remove) {
          parent.remove(attachedModel);
        } else {
          console.error("Cannot find object parent of attached item to remove the object", attachedModel);
        }
      }
    }
  }
  createWeaponItem({
    model,
    name,
    type,
    boneName,
    attachModelName,
    effects,
    position,
    onPickup
  }) {
    const _canPickup = (pickingUnit) => {
      const { equippedItems } = pickingUnit.params;
      if (pickingUnit === this.scene.getPlayer()) {
        if (!equippedItems.leftHand) {
          this.scene.notify("Press and Hold 'E' to pickup '" + item.name + "'", 1e3);
        } else {
          this.scene.notify("Press 'G' to drop your '" + equippedItems.leftHand.name + "' first and then you can pick up '" + item.name + "'", 1e3);
        }
      }
      if (equippedItems.leftHand) {
        return false;
      }
      if (pickingUnit instanceof Player) {
        return pickingUnit.params.input && pickingUnit.params.input.isAction;
      }
    };
    const _onPickup = (pickingUnit) => {
      const { equippedItems } = pickingUnit.params;
      equippedItems.leftHand = item;
      this.scene.gameObjectsService.attachItem(pickingUnit, item);
      if (pickingUnit === this.scene.getPlayer()) {
        this.scene.notify("Press 'G' if you need to drop '" + item.name + "'");
      }
      if (onPickup) {
        onPickup(pickingUnit);
      }
    };
    const item = this.scene.gameObjectsService.createItem({
      model,
      name,
      type,
      boneName,
      attachModelName,
      effects,
      position,
      canPickup: _canPickup,
      onPickup: _onPickup
    });
  }
  /**
   * @param {GameObject} gameObject
   */
  hookGameObject(gameObject) {
    this.gameObjects.push(gameObject);
    gameObject.__game_object_id = this.nextGameObjectId++;
    return gameObject;
  }
  removeAll() {
    while (this.gameObjects.length) {
      this.destroyGameObject(this.gameObjects[0]);
    }
  }
  removeAllExceptPlayer() {
    const getNextNonPlayerIndex = () => this.gameObjects.findIndex((go) => go !== this.scene.getPlayer());
    let removeIdx = getNextNonPlayerIndex();
    while (removeIdx > -1) {
      const gameObject = this.gameObjects[removeIdx];
      this.gameObjects.splice(removeIdx, 1);
      this._removeGameObjectFromScene(gameObject);
      removeIdx = getNextNonPlayerIndex();
    }
  }
  /**
   * @param {GameObject} gameObject
   */
  destroyGameObject(gameObject) {
    const index = this.gameObjects.indexOf(gameObject);
    if (index > -1) {
      this.gameObjects.splice(index, 1);
    }
    this._removeGameObjectFromScene(gameObject);
  }
  /**
   * @param {GameObject} gameObject
   */
  _removeGameObjectFromScene(gameObject) {
    const parent = gameObject.object && gameObject.object.parent || this.scene;
    if (gameObject.__unit_hp_bar) {
      gameObject.__unit_hp_bar.remove();
      gameObject.__unit_hp_bar = null;
    }
    if (parent.remove) {
      parent.remove(gameObject.object);
    } else {
      console.error("Cannot find object parent to remove the object", gameObject);
    }
  }
  getUnits() {
    return this.gameObjects.filter((go) => go instanceof Unit);
  }
};

// ../client/src/js/Camera.js
var Camera = class extends AutoBindMethods {
  /**
   * @param {Scene} scene
   */
  constructor(scene) {
    super();
    this.scene = scene;
    const ratio = this.getWidth() / this.getHeight();
    this.camera = new THREE.PerspectiveCamera(45, ratio, 1, 300);
    this.camera.position.set(5, 3, 15);
    this.deltaY = 10;
    this.rotateY = 0.25;
    this.defaultDistance = 10;
    this.distance = this.defaultDistance;
    this.raycaster = new THREE.Raycaster();
  }
  update(gameTime, deltaTime) {
    const { scene: { input } } = this;
    const player = this.scene.getPlayer();
    if (!player) return;
    if (input.look.cinematic) {
      this.camera.position.set(-40, 15, 10);
      this.camera.lookAt(new THREE.Vector3(-50, 0, 0));
      return;
    }
    const rotateY = this.rotateY + input.look.sensitivity * input.look.vertical / 2e3;
    if (rotateY > -0.75 && rotateY < 1.25) {
      this.rotateY = rotateY;
    }
    if (input.isThirdPerson) {
      this.updateThirdPerson(player);
    } else {
      this.camera.position.copy(
        player.position.clone().add(new THREE.Vector3(7.5, this.deltaY, 0))
      );
      this.camera.lookAt(player.position);
    }
  }
  addY(y) {
    if (this.deltaY + y > 1 && this.deltaY + y < 25) {
      this.deltaY += y;
    }
  }
  getWidth() {
    const renderer = this.scene.renderer.renderer;
    const canvas = renderer.getContext().canvas;
    return canvas ? canvas.width : 1;
  }
  getHeight() {
    const renderer = this.scene.renderer.renderer;
    const canvas = renderer.getContext().canvas;
    return canvas ? canvas.height : 1;
  }
  updateThirdPerson(player) {
    const { scene: { scene: { children } }, deltaY } = this, playerHeadPosition = player.position.clone().add(new THREE.Vector3(0, 1.5, 0)), origin = playerHeadPosition, destination = this.camera.position, direction = new THREE.Vector3();
    const getChildrenFlat = (objects) => [].concat(...objects.map(
      (obj) => obj.children ? [obj, ...getChildrenFlat(obj.children)] : [obj]
    ));
    const environment = [children.find((c) => c.name === "LEVEL_ENVIRONMENT")];
    const flatChildrenMeshes = getChildrenFlat(environment).filter((obj) => obj.type === "Mesh");
    this.raycaster.set(origin, direction.subVectors(destination, origin).normalize());
    this.raycaster.far = deltaY * 1.5;
    const intersects = this.raycaster.intersectObjects(flatChildrenMeshes);
    let distance = Math.min(deltaY, ...intersects.map((i) => i.distance - this.distance * 0.5));
    this.distance += (distance - this.distance) / 2;
    const playerForward = player.getForward().multiplyScalar(this.scene.input.look.back ? 1 : -1);
    playerForward.y = this.rotateY;
    this.camera.position.copy(playerHeadPosition.clone().add(playerForward));
    this.camera.lookAt(playerHeadPosition);
    const cameraForward = new THREE.Vector3(0, 0, -1);
    cameraForward.applyQuaternion(this.camera.quaternion);
    this.camera.position.sub(cameraForward.multiplyScalar(this.distance));
  }
  toScreenPosition(position) {
    const widthHalf = 0.5 * this.getWidth();
    const heightHalf = 0.5 * this.getHeight();
    const copiedProjectVector = position.clone().project(this.camera);
    return {
      x: Math.round((copiedProjectVector.x + 1) * widthHalf),
      y: Math.round((-copiedProjectVector.y + 1) * heightHalf),
      z: copiedProjectVector.z
    };
  }
};

// ../common/Units.js
var unitToNetwork = (unit, connectionId, locationName) => {
  if (unit) {
    const unitRotation = unit.object.rotation.toVector3();
    if (!unit.params.unitNetworkId) {
      const getRandomString = () => Math.random().toString(36).substr(2);
      unit.params.unitNetworkId = getRandomString() + getRandomString();
    }
    const unitNetworkId = unit.params.unitNetworkId;
    const {
      isRunning,
      isAttack
    } = unit;
    const {
      hp,
      hpMax,
      acceleration,
      damage,
      fireDamage,
      level,
      experience,
      fraction,
      name,
      speed,
      unspentTalents,
      money,
      equippedItems,
      loot
    } = unit.params;
    const {
      vertical,
      horizontal,
      attack1,
      attack2,
      isDrop,
      isAction
    } = unit.params.input || {};
    const vectorToObject = (vector, eps = 1e3) => ({
      x: Math.round(vector.x * eps) / eps,
      y: Math.round(vector.y * eps) / eps,
      z: Math.round(vector.z * eps) / eps
    });
    const isPostponedAttack = unit.params.__network_last_sent_attack1 < unit.latestAttackTimestamp;
    const isPostponedFire = typeof unit.params.__network_last_sent_attack2 === "number" && unit.params.__network_last_sent_attack2 < unit.latestFire;
    unit.params.__network_last_sent_attack1 = unit.latestAttackTimestamp;
    unit.params.__network_last_sent_attack2 = unit.latestFire;
    return {
      type: unit.params.type,
      locationName,
      animationState: unit.animationState,
      isRunning,
      isAttack,
      position: vectorToObject(unit.position),
      rotation: vectorToObject(unitRotation),
      scale: vectorToObject(unit.object.scale),
      params: {
        connectionId,
        unitNetworkId,
        name,
        hp,
        hpMax,
        fraction,
        damage,
        fireDamage,
        level,
        experience,
        speed,
        money,
        unspentTalents,
        equippedItems,
        acceleration: vectorToObject(acceleration),
        loot,
        input: {
          vertical,
          horizontal,
          attack1: attack1 || isPostponedAttack,
          attack2: attack2 || isPostponedFire,
          isDrop,
          isAction
        }
      }
    };
  }
};

// ../client/src/js/Connection.js
var Connection = class extends AutoBindMethods {
  /**
   * @param {Scene} scene
   * @param {string|number} ip
   * @param {string|number} port
   * @param {boolean} isSecure
   */
  constructor(scene, ip = "localhost", port = "1337", isSecure = true) {
    super();
    this.scene = scene;
    this.meta = {};
    this.networkPlayers = {};
    this.networkAIs = {};
    this.lastRequestAt = Date.now();
    this.ping = 0;
    const WebSocket = window.WebSocket || window.MozWebSocket;
    this.connection = new WebSocket(`${isSecure ? "wss" : "ws"}://${ip}:${port}`);
    this.connection.onopen = () => console.log("open connection");
    this.connection.onerror = (error) => console.log("error connection", error);
    this.connection.onmessage = this.onMessage;
    this.scene.intervals.setInterval(() => {
      this.sendGameObjects();
      this.lastRequestAt = Date.now();
    }, 100);
  }
  update() {
  }
  onMessage({ data }) {
    const { meta, data: response, messageType } = JSON.parse(data);
    if (meta.role && this.meta.role !== meta.role) {
      this.scene.ui.setConnectionRole(meta.role);
      if (this.meta.role && meta.role === "host") {
        this.hostUnitsFromNetwork();
      } else if (!this.meta.debug) {
        this.clearLocalUnits();
      }
    }
    this.meta = meta;
    try {
      switch (messageType) {
        case "handshake": {
          this.send("login");
          break;
        }
        case "badLogin": {
          alert(response);
          window.location.reload();
          break;
        }
        case "restartServer": {
          this.networkAIs = {};
          break;
        }
        case "setUserPlayer": {
          const player = this.scene.getPlayer();
          if (player) {
            this.setPlayerParams(player, response);
          } else {
            this.scene.units.setDefaultPlayerParams(response);
          }
          break;
        }
        case "updateGameObjects": {
          this.ping = Date.now() - this.lastRequestAt;
          this.updateGameObjects(response);
          break;
        }
        case "disconnected": {
          this.removeDisconnectedPlayer(response);
          break;
        }
      }
    } catch (e) {
      console.log("Connection error", e);
    }
  }
  restartServer() {
    this.send("restartServer");
  }
  // There is race condition between
  // clearLocalUnits and Location.createInteractiveGameObjects
  clearLocalUnits() {
    const gameObjectsService = this.scene.gameObjectsService;
    const player = this.scene.getPlayer();
    gameObjectsService.getUnits().forEach((unit) => {
      if (!unit.params.fromNetwork && unit !== player) {
        gameObjectsService.destroyGameObject(unit);
      }
    });
  }
  send(messageType, data) {
    const { userName, password } = this.scene.user;
    const meta = {
      token: this.getHash(userName + password)
    };
    this.connection.send(JSON.stringify({ messageType, meta, data }));
  }
  removeArtefactUnits() {
    const gameObjectsService = this.scene.gameObjectsService;
    const networkAIs = this.networkAIs;
    const networkPlayers = this.networkPlayers;
    const player = this.scene.getPlayer();
    this.scene.units.getUnits().filter((unit) => unit instanceof AI && !networkAIs[unit.params.unitNetworkId]).forEach(gameObjectsService.destroyGameObject);
  }
  updateGameObjects(gameObjects) {
    this.removeArtefactUnits();
    gameObjects.forEach((gameObject) => {
      switch (gameObject.type) {
        case "player": {
          this.updateNetworkPlayer(gameObject);
          break;
        }
        case "ai": {
          this.updateNetworkAI(gameObject);
          break;
        }
      }
    });
  }
  removeDisconnectedPlayer({ connectionId }) {
    const gameObjectsService = this.scene.gameObjectsService;
    const disconnectedPlayer = gameObjectsService.getUnits().find(
      (unit) => unit instanceof Player && unit.params.connectionId === connectionId
    );
    if (disconnectedPlayer) {
      if (this.scene.ui) {
        this.scene.ui.notify(disconnectedPlayer.params.name + " disconnected");
      }
      gameObjectsService.destroyGameObject(disconnectedPlayer);
      delete this.networkPlayers[disconnectedPlayer.params.unitNetworkId];
    }
  }
  /**
   * @param {String} str
   * @returns {string}
   */
  getHash(str) {
    function hash32(str2) {
      let i;
      let l;
      let hval = 2166136261;
      for (i = 0, l = str2.length; i < l; i++) {
        hval ^= str2.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
      }
      return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
    }
    let h1 = hash32(str);
    return h1 + hash32(h1 + str);
  }
  hostUnitsFromNetwork() {
    this.scene.units.getAliveUnits().forEach((unit) => {
      if (unit.params.fromNetwork) {
        unit.params.fromNetwork = false;
      }
    });
  }
  updateNetworkPlayer(playerData) {
    const { locationName, position, rotation, animationState, params } = playerData;
    const { params: { unitNetworkId } } = playerData;
    if (unitNetworkId === this.meta.unitNetworkId || locationName !== this.scene.location.getLocationName()) {
      return;
    }
    let networkPlayer = this.networkPlayers[unitNetworkId];
    if (!networkPlayer) {
      this.networkPlayers[unitNetworkId] = "loading";
      if (this.scene.ui) {
        this.scene.ui.notify(playerData.params.name + " connected");
      }
      this.scene.units.createNetworkPlayer(
        playerData,
        (networkPlayer2) => {
          this.networkPlayers[unitNetworkId] = networkPlayer2;
        }
      );
    } else if (networkPlayer !== "loading") {
      this.setPlayerParams(networkPlayer, { position, rotation, animationState, params });
    }
  }
  /**
   * @param {Player} player
   * @param position
   * @param rotation
   * @param animationState
   * @param params
   */
  setPlayerParams(player, { position, rotation, animationState, params }) {
    player.position.set(position.x, position.y, position.z);
    player.rotation.set(rotation.x, rotation.y, rotation.z);
    player.animationState = animationState;
    if (params) {
      const { input, acceleration } = params;
      const playerParams = player.params;
      playerParams.input.vertical = input.vertical;
      playerParams.input.horizontal = input.horizontal;
      playerParams.input.attack1 = input.attack1;
      playerParams.input.attack2 = input.attack2;
      playerParams.input.isDrop = input.isDrop;
      playerParams.input.isAction = input.isAction;
      playerParams.hp = params.hp;
      playerParams.hpMax = params.hpMax;
      playerParams.fraction = params.fraction;
      playerParams.damage = params.damage;
      playerParams.fireDamage = params.fireDamage;
      playerParams.speed = params.speed;
      playerParams.money = params.money;
      playerParams.level = params.level;
      playerParams.unspentTalents = params.unspentTalents;
      playerParams.experience = params.experience;
      playerParams.acceleration.set(acceleration.x, acceleration.y, acceleration.z);
      if (params.equippedItems && params.equippedItems.leftHand) {
        playerParams.equippedItems.leftHand = params.equippedItems.leftHand;
      }
      this.scene.gameObjectsService.updateAttachedItems(player);
    }
  }
  updateNetworkAI(unitData) {
    const { locationName, position, rotation, isRunning, isAttack, animationState, scale, params } = unitData;
    const { unitNetworkId } = params;
    if (locationName !== this.scene.location.getLocationName()) {
      return;
    }
    let networkAI = this.networkAIs[unitNetworkId];
    if (!networkAI) {
      this.networkAIs[unitNetworkId] = "loading";
      this.scene.units.createNetworkAI(unitData, (networkAI2) => {
        this.networkAIs[unitNetworkId] = networkAI2;
      });
    } else if (networkAI !== "loading") {
      networkAI.position.set(position.x, position.y, position.z);
      networkAI.rotation.set(rotation.x, rotation.y, rotation.z);
      networkAI.object.scale.set(scale.x, scale.y, scale.z);
      networkAI.isRunning = isRunning;
      networkAI.isAttack = isAttack;
      networkAI.animationState = animationState;
      if (params) {
        const { acceleration } = params;
        const networkAIParams = networkAI.params;
        networkAIParams.hp = params.hp;
        networkAIParams.hpMax = params.hpMax;
        networkAIParams.fraction = params.fraction;
        networkAIParams.damage = params.damage;
        networkAIParams.fireDamage = params.fireDamage;
        networkAIParams.level = params.level;
        networkAIParams.loot = params.loot;
        networkAIParams.acceleration.set(acceleration.x, acceleration.y, acceleration.z);
      }
    }
  }
  sendGameObjects() {
    const connectionId = this.meta.id;
    if (this.connection.readyState !== 1 || !connectionId) {
      return;
    }
    const player = this.scene.getPlayer();
    const units = this.meta.role === "host" ? [
      player,
      ...this.scene.units.getAliveUnits().filter((unit) => !unit.params.fromNetwork)
    ] : [player];
    const data = [];
    units.forEach((unit) => {
      const unitData = unitToNetwork(
        unit,
        connectionId,
        this.scene.location.getLocationName()
      );
      if (unitData) {
        data.push(unitData);
      }
    });
    if (this.meta.role === "host") {
      this.send("updateGameObjects", data);
    } else if (data[0]) {
      this.send("updatePlayer", data[0]);
    }
  }
};

// ../client/src/js/Input.js
var KEYS = {
  MOUSE_LEFT: 1,
  MOUSE_RIGHT: 3,
  SPACE: 32,
  ENTER: 13,
  ESC: 27,
  C: 67,
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  X: 88,
  Z: 90,
  Q: 81,
  E: 69,
  R: 82,
  F: 70,
  V: 86,
  G: 71,
  1: 49,
  2: 50,
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39,
  ARROW_UP: 38,
  ARROW_DOWN: 40
};
var Input = class extends AutoBindMethods {
  constructor(params) {
    super();
    this.params = params;
    this.vertical = 0;
    this.horizontal = 0;
    this.attack1 = false;
    this.attack2 = false;
    this.look = {
      vertical: 0,
      horizontal: 0,
      back: false,
      sensitivity: 1
    };
    this.resetHorizontalLook = () => this.look.horizontal = 0;
    this.isThirdPerson = true;
    this.cursor = {
      x: 0,
      y: 0
    };
    this.mouse = {
      x: 0,
      y: 0
    };
    this.addEventListeners();
  }
  update() {
    this.look.horizontal = 0;
    this.look.vertical = 0;
  }
  addEventListeners() {
    document.addEventListener("mousedown", (e) => {
      if (e.which === KEYS.MOUSE_LEFT) {
        this.attack1 = true;
      }
      if (e.which === KEYS.MOUSE_RIGHT) {
        this.attack2 = true;
      }
    });
    document.addEventListener("mouseup", (e) => {
      if (e.which === KEYS.MOUSE_LEFT) {
        this.attack1 = false;
      }
      if (e.which === KEYS.MOUSE_RIGHT) {
        this.attack2 = false;
      }
    });
    let timeout;
    document.addEventListener("mousemove", (e) => {
      this.look.horizontal += e.movementX || 0;
      this.look.vertical += e.movementY || 0;
      this.mouse.x = e.x;
      this.mouse.y = e.y;
      const cursorX = this.cursor.x + (e.movementX || 0);
      const cursorY = this.cursor.y + (e.movementY || 0);
      if (cursorX > 0 && cursorX < window.innerWidth) {
        this.cursor.x = cursorX;
      }
      if (cursorY > 0 && cursorY < window.innerHeight) {
        this.cursor.y = cursorY;
      }
      if (timeout !== void 0) {
        window.clearTimeout(timeout);
      }
      timeout = window.setTimeout(function() {
        document.dispatchEvent(new Event("onmousemoveend"));
      }, 100);
    });
    document.addEventListener("onmousemoveend", (e) => {
      this.look.vertical = 0;
    });
    document.addEventListener("keydown", (e) => {
      switch (e.which) {
        case KEYS.ENTER:
          this.params.onAction && this.params.onAction();
          break;
        case KEYS.ESC:
          this.params.onExit && this.params.onExit();
          break;
        case KEYS.C:
          this.params.onSwitchCamera && this.params.onSwitchCamera();
          break;
        case KEYS.W:
        case KEYS.ARROW_UP:
          this.vertical = 1;
          break;
        case KEYS.S:
        case KEYS.ARROW_DOWN:
          this.vertical = -1;
          break;
        case KEYS.A:
        case KEYS.ARROW_LEFT:
          this.horizontal = -1;
          break;
        case KEYS.D:
        case KEYS.ARROW_RIGHT:
          this.horizontal = 1;
          break;
        case KEYS.X:
          this.look.back = true;
          break;
        case KEYS.F:
          this.look.cinematic = true;
          break;
        case KEYS.E:
          this.isAction = true;
          break;
        case KEYS.G:
          this.isDrop = true;
          break;
        case KEYS.SPACE:
          this.jump = 1;
          break;
      }
    });
    document.addEventListener("keyup", (e) => {
      switch (e.which) {
        case KEYS.W:
        case KEYS.ARROW_UP:
          if (this.vertical === 1) {
            this.vertical = 0;
          }
          break;
        case KEYS.S:
        case KEYS.ARROW_DOWN:
          if (this.vertical === -1) {
            this.vertical = 0;
          }
          break;
        case KEYS.A:
        case KEYS.ARROW_LEFT:
          if (this.horizontal === -1) {
            this.horizontal = 0;
          }
          break;
        case KEYS.D:
        case KEYS.ARROW_RIGHT:
          if (this.horizontal === 1) {
            this.horizontal = 0;
          }
          break;
        case KEYS.X:
          this.look.back = false;
          break;
        case KEYS.F:
          this.look.cinematic = false;
          break;
        case KEYS.E:
          this.isAction = false;
          break;
        case KEYS.G:
          this.isDrop = false;
          break;
        case KEYS.SPACE:
          this.jump = 0;
          break;
      }
    });
    window.addEventListener("wheel", (e) => this.params.onZoom && this.params.onZoom(e.deltaY / 100));
    return this;
  }
};

// ../client/src/js/Intervals.js
var Intervals = class extends AutoBindMethods {
  constructor(scene) {
    super();
    this.scene = scene;
    this.timePassed = 0;
    this.lastFrame = Date.now();
    this.intervals = [];
    this.intervalIndex = 0;
  }
  update(now) {
    this.timePassed += now - this.lastFrame;
    this.intervals.filter((i) => this.timePassed - i.calledAt > i.interval).forEach((interval) => {
      interval.calledAt = this.timePassed;
      interval.fn();
      if (interval.loops && --interval.loops === 0) {
        this.clearInterval(interval.id);
      }
    });
    this.lastFrame = now;
  }
  getTimePassed() {
    return this.timePassed;
  }
  getDeltaTime(now) {
    return now - this.lastFrame;
  }
  setInterval(fn, interval, immediately, loops) {
    if (fn && interval) {
      const calledAt = immediately ? this.timePassed - interval : this.timePassed;
      this.intervals.push({
        fn,
        interval,
        calledAt,
        loops,
        id: ++this.intervalIndex
      });
    }
  }
  setTimeout(fn, timeout) {
    if (fn && timeout) {
      this.intervals.push({
        fn,
        interval: timeout,
        loops: 1,
        calledAt: this.timePassed,
        id: ++this.intervalIndex
      });
    }
  }
  clearInterval(id) {
    const intervalIdx = this.intervals.findIndex((i) => i.id === id);
    if (intervalIdx > -1) {
      this.intervals.splice(intervalIdx, 1);
    }
  }
};

// ../client/src/js/Locations/AbstractLocation.js
var AbstractLocation = class extends AutoBindMethods {
  /**
   * @param {Scene} scene
   */
  constructor(scene, id = "unknown-level") {
    super();
    this.scene = scene;
    this.id = id;
  }
  update() {
  }
  startLocation() {
  }
  restartLocation() {
  }
  stopLocation() {
  }
  onAction() {
  }
  getLocationName() {
    return this.id;
  }
  createAmbientLight() {
    const ambientLight = new THREE.AmbientLight(8947848);
    ambientLight.castShadow = false;
    return ambientLight;
  }
  createShadowLight() {
    const light = new THREE.DirectionalLight(16777215, 10, 150);
    light.intensity = 1;
    light.shadow.bias = -1e-5;
    const shadowSize = 25;
    light.castShadow = true;
    light.shadow.camera.left = -shadowSize;
    light.shadow.camera.right = shadowSize;
    light.shadow.camera.top = shadowSize;
    light.shadow.camera.bottom = -shadowSize;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 10;
    light.shadow.camera.far = 250;
    light.shadow.camera.visible = true;
    return light;
  }
  createSkybox(skyboxName) {
    const materialArray = [
      "skyboxRT",
      "skyboxLF",
      "skyboxUP",
      "skyboxDN",
      "skyboxFT",
      "skyboxBK"
    ].map((filename) => `./assets/textures/${skyboxName}/${filename}.jpg`);
    return new THREE.CubeTextureLoader().load(materialArray);
  }
};

// ../client/src/js/Locations/DreamTown/Environment.js
var createEnvironment = function({
  load,
  onLoad
}) {
  const pivot = new THREE.Object3D();
  pivot.matrixAutoUpdate = false;
  pivot.name = "LEVEL_ENVIRONMENT";
  let isEnvironmentLoaded = false;
  let isStaticLoaded = false;
  const checkIsAllLoaded = () => {
    if (isEnvironmentLoaded && isStaticLoaded) {
      onLoad && onLoad();
    }
  };
  load({
    baseUrl: "./assets/models/environment/island",
    noScene: true,
    receiveShadow: true,
    castShadow: false,
    callback: (object) => {
      pivot.add(object.scene);
      object.scene.matrixAutoUpdate = false;
      object.scene.updateMatrix();
      isEnvironmentLoaded = true;
      checkIsAllLoaded();
    }
  });
  load({
    baseUrl: "./assets/models/environment/water",
    castShadow: false,
    receiveShadow: false,
    callback: (object) => {
      object.scene.matrixAutoUpdate = false;
      object.scene.updateMatrix();
    }
  });
  load({
    baseUrl: "./assets/models/environment/static-objects",
    noScene: true,
    receiveShadow: false,
    castShadow: true,
    callback: (object) => {
      pivot.add(object.scene);
      object.scene.matrixAutoUpdate = false;
      object.scene.updateMatrix();
      isStaticLoaded = true;
      checkIsAllLoaded();
    }
  });
  return pivot;
};

// ../client/src/js/Locations/DreamTown/Areas.js
var buildArea = (areaId, map) => {
  const { width, height } = AreaSizes[areaId];
  const waypointXToWorldX = (position) => position - width / 2;
  const waypointYToWorldZ = (position) => position - height / 2;
  const worldXToWaypointX = (position) => {
    const graphX = Math.round(position + width / 2);
    return Math.min(Math.max(graphX, 4), width - 5);
  };
  const worldZToWaypointY = (position) => {
    const graphY = Math.round(position + height / 2);
    return Math.min(Math.max(graphY, 4), height - 5);
  };
  const area = {
    id: areaId,
    waypointXToWorldX,
    waypointYToWorldZ,
    worldXToWaypointX,
    worldZToWaypointY,
    width,
    height
  };
  return map(area);
};
var AreaSizes = {
  FLOOR_0: {
    width: 300,
    height: 300
  }
};
var Areas = {
  FLOOR_0: buildArea("FLOOR_0", (area) => ({
    ...area,
    includesPosition: (position) => position.y < 250,
    getWorldWaypointByXY: (x, y) => ({ x: area.waypointXToWorldX(x), y: 10.2, z: area.waypointYToWorldZ(y) }),
    getWaypointPortals: () => []
  }))
};
var Areas_default = Areas;

// ../client/src/js/Locations/DreamTown/Location.js
var Location = class extends AbstractLocation {
  /**
   * @param {Scene} scene
   */
  constructor(scene) {
    super(scene);
    this.id = "dream-town";
    this.shadowLightPosition = new THREE.Vector3(25, 50, 25);
    this.scene.ui.setLoading(true);
    this.scene.ui.setPause(true);
    this.environment = createEnvironment({
      load: this.scene.models.loadGLTF,
      onLoad: () => {
        this.scene.ui.setLoading(false);
        this.scene.notify("Smoke Island");
        const getChildrenFlat = (objects) => [].concat(...objects.map(
          (obj) => obj.children ? [obj, ...getChildrenFlat(obj.children)] : [obj]
        ));
        const environment = [this.scene.scene.children.find((c) => c.name === "LEVEL_ENVIRONMENT")];
        this.environmentMeshes = getChildrenFlat(environment).filter((obj) => obj.type === "Mesh");
        this.startLocation();
        this.createLocationColliders();
        this.scene.pathFinder.rebuildAreas();
        this.isLoaded = true;
        if (this.onLoad) {
          this.onLoad();
        }
      }
    });
    this.environmentMeshes = [];
    const raycastFar = 500;
    this.raycaster = {
      raycaster: new THREE.Raycaster(),
      origin: new THREE.Vector3(),
      target: new THREE.Vector3(),
      direction: new THREE.Vector3(),
      raycastFar,
      intersectTo: -raycastFar / 2,
      cache: {}
    };
    this.raycaster.raycaster.far = this.raycaster.raycastFar;
    this.ambientLight = this.createAmbientLight();
    this.shadowLight = this.createShadowLight();
    this.scene.scene.background = this.createSkybox("sky-blue");
    this.scene.add(this.environment);
    this.scene.add(this.ambientLight);
    this.scene.add(this.shadowLight);
    const color = 14149363;
    const near = 100;
    const far = 300;
    this.scene.scene.fog = new THREE.Fog(color, near, far);
    this.scene.intervals.setInterval(() => {
      this.scene.units.getAliveUnits().forEach((unit) => {
        if (unit.position.y < -100) {
          unit.die();
        }
      });
    }, 1e3);
    this.scene.intervals.setInterval(() => {
      this.raycaster.cache = {};
    }, 6e4);
  }
  update() {
    super.update();
    const player = this.scene.getPlayer();
    if (player) {
      this.shadowLight.position.copy(player.position).add(this.shadowLightPosition);
      if (this.shadowLight.target !== player.object) {
        this.shadowLight.target = player.object;
      }
    }
  }
  reviveHero() {
    const player = this.scene.getPlayer();
    player.params.hp = player.params.hpMax / 2;
    player.position.set(-80, 4, 130);
    player.animationState.isDie = false;
    this.scene.particles.createEffect({
      effect: "level-up/level-up",
      scale: 1.5,
      attachTo: player.object
    });
  }
  afterClear() {
    this.scene.units.createPlayer({
      /**
       * @param {Player} player
       */
      onCreate: (player) => {
        this.scene.camera.player = player;
        this.scene.ui.updatePlayerParams();
        player.position.set(-80, 4, 130);
      },
      onDie: () => window.setTimeout(() => {
        this.scene.ui.setPause(true);
      }, 2500),
      onKill: (dyingUnit) => this.onKill(dyingUnit, this.scene.getPlayer()),
      onDamageTaken: () => this.scene.ui.updatePlayerParams(),
      onLocationUp: () => this.scene.ui.updatePlayerParams()
    });
    this.createInteractiveGameObjects();
  }
  onKill(dyingUnit, killingUnit) {
    this.scene.units.getAliveUnits().filter((unit) => !unit.isEnemy(killingUnit) && unit.addExperience && unit.position.distanceTo(dyingUnit.position) < 40).forEach((unit) => unit.addExperience(dyingUnit.params.bounty / 2));
    if (killingUnit.addExperience) {
      killingUnit.addExperience(dyingUnit.params.bounty / 2);
    }
    if (killingUnit.addMoney) {
      killingUnit.addMoney(dyingUnit.params.bounty);
    }
  }
  startLocation() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
  restartLocation() {
    this.scene.clearScene();
  }
  stopLocation() {
    this.scene.remove(this.environment);
    this.scene.remove(this.ambientLight);
    this.scene.remove(this.shadowLight);
    this.scene.gameObjectsService.removeAllExceptPlayer();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
  createInteractiveGameObjects(skipItemsCreation) {
    if (!skipItemsCreation) {
      const createHealItem = () => this.scene.intervals.setTimeout(() => {
        const itemHealPosition = new THREE.Vector3(-52.5, -1.6, 117);
        this.scene.gameObjectsService.createItem({
          model: "item-heal",
          position: itemHealPosition,
          canPickup: (unit) => unit.getMaxHP() - unit.getHP() > 0,
          onPickup: (unit) => {
            unit.addHP(Math.round(unit.params.hpMax * 0.25));
            createHealItem();
          }
        });
      }, 1e4);
      const createSwordItem = () => this.scene.intervals.setTimeout(() => {
        this.scene.gameObjectsService.createWeaponItem({
          model: "item-sword",
          name: "Starter's Sword (+10 Damage)",
          type: "One Handed",
          boneName: "Right_Hand",
          attachModelName: "item-sword",
          effects: [{ damage: 10 }],
          position: new THREE.Vector3(-26.5, 0, 102),
          onPickup: () => createSwordItem()
        });
      }, 1e4);
      createHealItem();
      createSwordItem();
    }
    const getAIParams = ({ level, ...params }) => {
      return {
        ...params,
        level,
        scale: 1 + (level <= 20 ? level / 20 : 1 + level / 40),
        onDie: () => this.scene.units.createAI(getAIParams({
          ...params,
          level: level + 1 + Math.round(Math.random() * level)
        }))
      };
    };
    const getGoatsParams = (level, position, rotation, name) => getAIParams({
      level,
      position,
      rotation,
      fraction: "goats",
      name: name || (level <= 10 ? "Goat Warrior" : level <= 20 ? "Goat Elite" : level <= 35 ? "Goat Commando" : "Goat Destroyer")
    });
    const getFriendlyParams = (level, position, rotation, params = {}) => getAIParams({
      level,
      position,
      rotation,
      fraction: "friendly",
      name: "Friendly Citizen",
      ...params
    });
    this.units = [
      getGoatsParams(25, { x: -210, y: 3, z: 15 }),
      getGoatsParams(15, { x: -210, y: 3, z: 30 }),
      getGoatsParams(15, { x: -195, y: 3, z: 15 }),
      getGoatsParams(5, { x: -130, y: 3, z: -1.5 }),
      getGoatsParams(1, { x: -117, y: 3, z: -1 }),
      getGoatsParams(1, { x: -120, y: 3, z: -5 }),
      getGoatsParams(1, { x: -88, y: 3, z: 50 }),
      getGoatsParams(1, { x: -86, y: 3, z: 68 }),
      getGoatsParams(3, { x: -145, y: 6, z: 103 }),
      getGoatsParams(1, { x: -147, y: 6, z: 105 }),
      getGoatsParams(1, { x: -33, y: 6, z: -1 }),
      getGoatsParams(99, { x: 103, y: 155, z: 92 }, { y: 0.3 }, "God of Goats"),
      getFriendlyParams(10, { x: -25, y: 1, z: 108 }, { y: -1.53 }, { name: "Siltent Bob" }),
      getFriendlyParams(2, { x: -69, y: 0, z: 117 }, { y: 0.13 }, { name: "Talking John" }),
      getFriendlyParams(3, { x: -69, y: 0, z: 119 }, { y: 3.1 }, { name: "Talking Ien" }),
      getFriendlyParams(8, { x: -48, y: 6, z: 84 }, { y: 2.8 }, { name: "Warlike Ken" }),
      getFriendlyParams(3, { x: -80, y: 0, z: 97 }, { y: 1.1 }, { name: "Scarring Dominic" }),
      getFriendlyParams(3, { x: -33, y: 0, z: 137 }, { y: 2.8 }, { name: "Arrogant Glen" })
    ].forEach(this.scene.units.createAI);
  }
  createLocationColliders() {
    this.scene.colliders.addColliderFunction((position, gameObject) => {
      const { x, y, z } = position;
      if (!this.environmentMeshes.length) {
        return true;
      }
      const environmentY = this.getEnvironmentY(position);
      return environmentY === this.raycaster.intersectTo || y < environmentY;
    });
  }
  getEnvironmentY({ x, z }) {
    const { intersectTo } = this.raycaster;
    if (!this.environmentMeshes.length) {
      return intersectTo;
    }
    const raycastCacheKey = `${Math.round(x * 100) / 100}, 0, ${Math.round(z * 100) / 100}`;
    const isCache = typeof this.raycaster.cache[raycastCacheKey] === "number";
    if (isCache) {
      return this.raycaster.cache[raycastCacheKey];
    }
    const {
      raycastFar,
      direction,
      origin,
      target,
      raycaster
    } = this.raycaster;
    origin.set(x, raycastFar / 2, z);
    target.set(x, -raycastFar / 2, z);
    raycaster.set(origin, direction.subVectors(target, origin).normalize());
    const intersects = raycaster.intersectObjects(this.environmentMeshes);
    const environmentY = Math.max(intersectTo, ...intersects.map((i) => raycastFar / 2 - i.distance));
    if (!isCache && environmentY !== this.raycaster.intersectTo) {
      this.raycaster.cache[raycastCacheKey] = environmentY;
    }
    return environmentY;
  }
  getAreas() {
    const areas = Object.values(Areas_default);
    const generateWaypoints = (width, height, map) => {
      return new Array(width).fill(null).map(
        (null1, x) => new Array(height).fill(null).map(
          (null2, y) => map(x, y)
        )
      );
    };
    return areas.map((area) => {
      const result = { ...area };
      result.getWaypoints = () => generateWaypoints(
        area.width,
        area.height,
        (x, y) => {
          return Number(this.checkWayForWaypoint(area.getWorldWaypointByXY(x, y)));
        }
      );
      return result;
    });
  }
  checkWayForWaypoint({ x, y, z }) {
    const checkWay = this.scene.colliders.checkWay;
    const checkNear = (range, diagonal) => checkWay(new THREE.Vector3(x + range, y, z)) && checkWay(new THREE.Vector3(x - range, y, z)) && checkWay(new THREE.Vector3(x, y, z + range)) && checkWay(new THREE.Vector3(x, y, z - range)) && (!diagonal || checkWay(new THREE.Vector3(x + range, y, z + range)) && checkWay(new THREE.Vector3(x - range, y, z - range)) && checkWay(new THREE.Vector3(x - range, y, z + range)) && checkWay(new THREE.Vector3(x + range, y, z - range)));
    return checkWay(new THREE.Vector3(x, y, z)) && checkNear(1, true) && checkNear(2);
  }
};

// ../client/src/js/Colliders.js
var Colliders = class extends AutoBindMethods {
  constructor(scene) {
    super();
    this.scene = scene;
    this.colliders = [];
    this.nextId = 0;
  }
  checkWay(position, gameObject) {
    for (let collider of this.colliders) {
      if (collider.fn(position, gameObject)) {
        return false;
      }
    }
    return true;
  }
  resetColliders() {
    this.colliders = [];
  }
  removeCollider(id) {
    const idx = this.colliders.findIndex((c) => c.id === id);
    if (idx > -1) {
      this.colliders.splice(idx, 1);
    }
  }
  addColliderFunction(fn) {
    this.colliders.push({
      id: this.nextId++,
      fn
    });
  }
};

// ../client/src/js/Models.js
var Models = class extends AutoBindMethods {
  constructor(scene) {
    super();
    this.scene = scene;
  }
  /**
   * @param {Object} params
   * @param {number} params.repeatX
   * @param {number} params.repeatY
   * @param {number} params.emissive
   * @param {THREE.Vector3} params.position
   * @returns {THREE.Mesh}
   */
  createGeometry(params) {
    params = params || {};
    const materialParams = {};
    if (params.image) {
      const texture = new THREE.TextureLoader().load(params.image);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(params.repeatX || 1, params.repeatY || 1);
      materialParams.map = texture;
    }
    if (params.emissive) {
      materialParams.emissive = new THREE.Color(params.emissive);
      materialParams.emissiveIntensity = 1;
      materialParams.emissiveMap = null;
    }
    if (params.color) {
      materialParams.color = params.color;
    }
    const geometry = new THREE.Mesh(
      params.geometry || new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshLambertMaterial(materialParams)
    );
    if (params.rotation) {
      geometry.rotation.copy(params.rotation);
    }
    geometry.scale.set(params.x || 1, params.y || 1, params.z || 1);
    const pivot = new THREE.Object3D();
    pivot.add(geometry);
    if (params.rotation) {
      pivot.rotation.copy(params.rotation);
    }
    if (params.localPosition) {
      geometry.position.set(
        params.localPosition.x || 0,
        params.localPosition.y || 0,
        params.localPosition.z || 0
      );
    }
    if (params.position) {
      pivot.position.set(
        params.position.x || 0,
        params.position.y || 0,
        params.position.z || 0
      );
    }
    if (params.rotation) {
      pivot.rotation.set(
        params.rotation.x || 0,
        params.rotation.y || 0,
        params.rotation.z || 0
      );
    }
    if (!params.noScene) {
      this.scene.add(pivot);
    }
    return pivot;
  }
  loadGLTF({
    baseUrl,
    isGLTF = false,
    noScene = false,
    callback = () => null,
    castShadow = true,
    receiveShadow = true
  }) {
    const loader = new GLTFLoader();
    const url = `${baseUrl}.glb${isGLTF ? ".gltf" : ""}`;
    loader.load(url, (loadedModel) => {
      loadedModel.scene.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
          child.castShadow = castShadow;
          child.receiveShadow = receiveShadow;
        }
      });
      callback(loadedModel);
      if (!noScene) {
        this.scene.add(loadedModel.scene);
      }
    });
  }
};

// ../client/src/js/Particles.js
var Particles = class extends AutoBindMethods {
  /**
   * @param {Scene} scene
   */
  constructor(scene) {
    super();
    this.scene = scene;
    this.particles = [];
  }
  update(time) {
    this.particles.forEach((p) => p.update(time));
  }
  destroy(particleSystem) {
    const index = this.particles.indexOf(particleSystem);
    if (index > -1) {
      this.particles.splice(index, 1);
    }
    this.scene.remove(particleSystem.object);
  }
  createSnow() {
    const area = new THREE.Vector3(100, 25, 100);
    this.createInstantParticles({
      particleCount: 1e4,
      color: 8947848,
      blending: THREE.NormalBlending,
      position: new THREE.Vector3(-area.x / 2, 0, -area.z / 2),
      getParticlePosition: (i, position = this.getRandomPosition(area)) => {
        if (position.y < 0) {
          const newPosition = this.getRandomPosition(area);
          position.x = newPosition.x;
          position.y = area.y;
          position.z = newPosition.z;
        }
        return position;
      }
    });
  }
  createEffect({
    scale = 1.5,
    effect = "level-up-alt/level-up",
    position = {},
    attachTo,
    lifeTime = 2080
  }) {
    this.scene.models.loadGLTF({
      baseUrl: "./assets/models/effects/" + effect,
      noScene: true,
      castShadow: false,
      receiveShadow: false,
      callback: (loadedObject) => {
        loadedObject.scene.scale.set(scale, scale, scale);
        loadedObject.scene.traverse((child) => {
          if (child.isMesh) {
            child.material.transparent = true;
            child.material.alphaTest = 0.5;
          }
        });
        loadedObject.scene.position.set(position.x || 0, position.y || 0, position.z || 0);
        if (attachTo) {
          attachTo.add(loadedObject.scene);
        }
        const effect2 = new AnimatedGameObject({
          object: loadedObject.scene,
          animations: loadedObject.animations
        });
        this.scene.gameObjectsService.hookGameObject(effect2);
        this.scene.intervals.setTimeout(
          () => this.scene.gameObjectsService.destroyGameObject(effect2),
          lifeTime
        );
      }
    });
  }
  loadEffect({
    particleName = "blood",
    position = new THREE.Vector3(),
    scale = new THREE.Vector3(1, 1, 1)
  } = {}) {
    const gameObjectsService = this.scene.gameObjectsService;
    return this.scene.models.loadGLTF({
      baseUrl: `./assets/models/effects/${particleName}`,
      castShadow: false,
      receiveShadow: false,
      callback: (gltf) => {
        gltf.scene.position.copy(position);
        gltf.scene.scale.copy(scale);
        gltf.scene.rotation.set(0, Math.random() * Math.PI, 0);
        const particleSystem = gameObjectsService.hookGameObject(new AnimatedGameObject({
          object: gltf.scene,
          animations: gltf.animations
        }));
        this.scene.intervals.setTimeout(
          () => this.scene.gameObjectsService.destroyGameObject(particleSystem),
          625
        );
      }
    });
  }
  createAttachedParticles({
    count = 1e3,
    noScene = false,
    size = 0.02,
    color = 16777215,
    blending = THREE.AdditiveBlending,
    depthTest = true,
    depthWrite = false,
    transparent = true,
    lifeTime,
    parent,
    texture,
    getDefaultParticleVelocity = () => new THREE.Vector3(
      Math.random() * 0.01 - 5e-3,
      Math.random() * 0.01 - 25e-4,
      Math.random() * 0.01 - 5e-3
    ),
    getDefaultParticlePosition = () => new THREE.Vector3(
      Math.random() * 0.2 - 0.1,
      Math.random() * 0.2 - 0.1,
      Math.random() * 0.2 - 0.1
    )
  } = {}) {
    const particalesCount = count;
    const particles = new THREE.BufferGeometry();
    const vertices = [];
    const positions = new Float32Array(particalesCount * 3);
    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const syncPositions = () => {
      for (let i = 0; i < vertices.length; i++) {
        positions[i * 3] = vertices[i].x;
        positions[i * 3 + 1] = vertices[i].y;
        positions[i * 3 + 2] = vertices[i].z;
      }
      particles.attributes.position.needsUpdate = true;
    };
    const particlesInitialPositions = {};
    const particlesCreatedAt = {};
    const particlesLocalPosition = {};
    const velocities = {};
    const materialParameters = { color, size, blending, depthTest, depthWrite, transparent };
    if (texture) {
      materialParameters.map = texture;
    }
    const material = new THREE.PointsMaterial(materialParameters);
    for (let i = 0; i < particalesCount; i++) {
      const particle = getDefaultParticlePosition(i);
      particlesInitialPositions[i] = parent.position.clone();
      velocities[i] = getDefaultParticleVelocity(i);
      particlesLocalPosition[i] = { x: 0, y: 0, z: 0 };
      vertices.push(particle);
    }
    syncPositions();
    const particleObject = new THREE.Points(particles, material);
    particleObject.position.copy(parent.position);
    const lifeTimeMs = lifeTime * 1e3;
    const getCreatedAt = (time, offset = 0) => time + offset + Math.random() * lifeTime * 1e3 - lifeTime * 1e3 / 2;
    const particleSystem = {
      object: particleObject,
      pause: false,
      update: function(time) {
        particleObject.position.copy(parent.position);
        vertices.forEach((particle, i) => {
          if (!particlesCreatedAt[i]) {
            particlesCreatedAt[i] = getCreatedAt(time, -500);
          } else if (time - particlesCreatedAt[i] > lifeTimeMs) {
            if (particleSystem.pause) {
              particlesInitialPositions[i] = { x: 0, y: -9999, z: 0 };
              velocities[i] = new THREE.Vector3();
            } else {
              const defaultParticalPosition = getDefaultParticlePosition(i);
              particlesInitialPositions[i] = parent.position.clone().add(defaultParticalPosition);
            }
            particlesLocalPosition[i] = { x: 0, y: 0, z: 0 };
            particlesCreatedAt[i] = getCreatedAt(time);
          }
          const currentDelta = {
            x: particlesInitialPositions[i].x - particleObject.position.x,
            y: particlesInitialPositions[i].y - particleObject.position.y,
            z: particlesInitialPositions[i].z - particleObject.position.z
          };
          particlesLocalPosition[i].x += velocities[i].x;
          particlesLocalPosition[i].y += velocities[i].y;
          particlesLocalPosition[i].z += velocities[i].z;
          particle.x = particlesLocalPosition[i].x + currentDelta.x;
          particle.y = particlesLocalPosition[i].y + currentDelta.y;
          particle.z = particlesLocalPosition[i].z + currentDelta.z;
        });
        syncPositions();
      }
    };
    this.particles.push(particleSystem);
    if (!noScene) {
      this.scene.add(particleSystem.object);
    }
    return particleSystem;
  }
  getRandomPosition(area) {
    const random = (from, to) => Math.random() * (to - from) + from;
    return new THREE.Vector3(
      random(0, area.x),
      random(0, area.y),
      random(0, area.z)
    );
  }
  createInstantParticles({
    particleCount = 1e3,
    noScene = false,
    position = new THREE.Vector3(0, 5, 0),
    size = 0.01,
    color = 16777215,
    blending = THREE.AdditiveBlending,
    depthTest = true,
    transparent = true,
    area = new THREE.Vector3(10, 5, 10),
    getParticleVelocity = () => new THREE.Vector3(-0.01, -0.01, 0),
    getParticlePosition = (i, position2 = this.getRandomPosition(area)) => position2
  } = {}) {
    const particles = new THREE.BufferGeometry();
    const vertices = [];
    const positions = new Float32Array(particleCount * 3);
    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const syncPositions = () => {
      for (let i2 = 0; i2 < vertices.length; i2++) {
        positions[i2 * 3] = vertices[i2].x;
        positions[i2 * 3 + 1] = vertices[i2].y;
        positions[i2 * 3 + 2] = vertices[i2].z;
      }
      particles.attributes.position.needsUpdate = true;
    };
    const material = new THREE.PointsMaterial({ color, size, blending, depthTest, transparent });
    for (var i = 0; i < particleCount; i++) {
      const particle = getParticlePosition(i);
      vertices.push(particle);
    }
    syncPositions();
    const particleSystem = new THREE.Points(particles, material);
    particleSystem.position.copy(position);
    this.particles.push({
      object: particleSystem,
      update: function() {
        let index = particleCount;
        while (index--) {
          const particle = vertices[index];
          particle.velocity = getParticleVelocity(index, particle);
          particle.x += particle.velocity.x;
          particle.y += particle.velocity.y;
          particle.z += particle.velocity.z;
          const particlePosition = getParticlePosition(index, particle);
          particle.x = particlePosition.x;
          particle.y = particlePosition.y;
          particle.z = particlePosition.z;
        }
        syncPositions();
      }
    });
    if (!noScene) {
      this.scene.add(particleSystem);
    }
    return particleSystem;
  }
};

// ../client/src/js/Utils/AStar.js
var AStar = (function() {
  function pathTo(node) {
    var curr = node;
    var path = [];
    while (curr.parent) {
      path.unshift(curr);
      curr = curr.parent;
    }
    return path;
  }
  function getHeap() {
    return new BinaryHeap(function(node) {
      return node.f;
    });
  }
  var astar = {
    /**
     * Perform an A* Search on a graph given a start and end node.
     * @param {Graph} graph
     * @param {GridNode} start
     * @param {GridNode} end
     * @param {Object} [options]
     * @param {bool} [options.closest] Specifies whether to return the
     path to the closest node if the target is unreachable.
     * @param {Function} [options.heuristic] Heuristic function (see
     *          astar.heuristics).
     */
    search: function(graph, start, end, options) {
      graph.cleanDirty();
      options = options || {};
      var heuristic = options.heuristic || astar.heuristics.manhattan;
      var closest = options.closest || false;
      var openHeap = getHeap();
      var closestNode = start;
      start.h = heuristic(start, end);
      graph.markDirty(start);
      openHeap.push(start);
      while (openHeap.size() > 0) {
        var currentNode = openHeap.pop();
        if (currentNode === end) {
          return pathTo(currentNode);
        }
        currentNode.closed = true;
        var neighbors = graph.neighbors(currentNode);
        for (var i = 0, il = neighbors.length; i < il; ++i) {
          var neighbor = neighbors[i];
          if (neighbor.closed || neighbor.isWall()) {
            continue;
          }
          var gScore = currentNode.g + neighbor.getCost(currentNode);
          var beenVisited = neighbor.visited;
          if (!beenVisited || gScore < neighbor.g) {
            neighbor.visited = true;
            neighbor.parent = currentNode;
            neighbor.h = neighbor.h || heuristic(neighbor, end);
            neighbor.g = gScore;
            neighbor.f = neighbor.g + neighbor.h;
            graph.markDirty(neighbor);
            if (closest) {
              if (neighbor.h < closestNode.h || neighbor.h === closestNode.h && neighbor.g < closestNode.g) {
                closestNode = neighbor;
              }
            }
            if (!beenVisited) {
              openHeap.push(neighbor);
            } else {
              openHeap.rescoreElement(neighbor);
            }
          }
        }
      }
      if (closest) {
        return pathTo(closestNode);
      }
      return [];
    },
    // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
    heuristics: {
      manhattan: function(pos0, pos1) {
        var d1 = Math.abs(pos1.x - pos0.x);
        var d2 = Math.abs(pos1.y - pos0.y);
        return d1 + d2;
      },
      diagonal: function(pos0, pos1) {
        var D = 1;
        var D2 = Math.sqrt(2);
        var d1 = Math.abs(pos1.x - pos0.x);
        var d2 = Math.abs(pos1.y - pos0.y);
        return D * (d1 + d2) + (D2 - 2 * D) * Math.min(d1, d2);
      }
    },
    cleanNode: function(node) {
      node.f = 0;
      node.g = 0;
      node.h = 0;
      node.visited = false;
      node.closed = false;
      node.parent = null;
    }
  };
  function Graph(gridIn, options) {
    options = options || {};
    this.nodes = [];
    this.diagonal = !!options.diagonal;
    this.grid = [];
    for (var x = 0; x < gridIn.length; x++) {
      this.grid[x] = [];
      for (var y = 0, row = gridIn[x]; y < row.length; y++) {
        var node = new GridNode(x, y, row[y]);
        this.grid[x][y] = node;
        this.nodes.push(node);
      }
    }
    this.init();
  }
  Graph.prototype.init = function() {
    this.dirtyNodes = [];
    for (var i = 0; i < this.nodes.length; i++) {
      astar.cleanNode(this.nodes[i]);
    }
  };
  Graph.prototype.cleanDirty = function() {
    for (var i = 0; i < this.dirtyNodes.length; i++) {
      astar.cleanNode(this.dirtyNodes[i]);
    }
    this.dirtyNodes = [];
  };
  Graph.prototype.markDirty = function(node) {
    this.dirtyNodes.push(node);
  };
  Graph.prototype.neighbors = function(node) {
    var ret = [];
    var x = node.x;
    var y = node.y;
    var grid = this.grid;
    if (grid[x - 1] && grid[x - 1][y]) {
      ret.push(grid[x - 1][y]);
    }
    if (grid[x + 1] && grid[x + 1][y]) {
      ret.push(grid[x + 1][y]);
    }
    if (grid[x] && grid[x][y - 1]) {
      ret.push(grid[x][y - 1]);
    }
    if (grid[x] && grid[x][y + 1]) {
      ret.push(grid[x][y + 1]);
    }
    if (this.diagonal) {
      if (grid[x - 1] && grid[x - 1][y - 1]) {
        ret.push(grid[x - 1][y - 1]);
      }
      if (grid[x + 1] && grid[x + 1][y - 1]) {
        ret.push(grid[x + 1][y - 1]);
      }
      if (grid[x - 1] && grid[x - 1][y + 1]) {
        ret.push(grid[x - 1][y + 1]);
      }
      if (grid[x + 1] && grid[x + 1][y + 1]) {
        ret.push(grid[x + 1][y + 1]);
      }
    }
    return ret;
  };
  Graph.prototype.toString = function() {
    var graphString = [];
    var nodes = this.grid;
    for (var x = 0; x < nodes.length; x++) {
      var rowDebug = [];
      var row = nodes[x];
      for (var y = 0; y < row.length; y++) {
        rowDebug.push(row[y].weight);
      }
      graphString.push(rowDebug.join(" "));
    }
    return graphString.join("\n");
  };
  function GridNode(x, y, weight) {
    this.x = x;
    this.y = y;
    this.weight = weight;
  }
  GridNode.prototype.toString = function() {
    return "[" + this.x + " " + this.y + "]";
  };
  GridNode.prototype.getCost = function(fromNeighbor) {
    if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
      return this.weight * 1.41421;
    }
    return this.weight;
  };
  GridNode.prototype.isWall = function() {
    return this.weight === 0;
  };
  function BinaryHeap(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
  }
  BinaryHeap.prototype = {
    push: function(element) {
      this.content.push(element);
      this.sinkDown(this.content.length - 1);
    },
    pop: function() {
      var result = this.content[0];
      var end = this.content.pop();
      if (this.content.length > 0) {
        this.content[0] = end;
        this.bubbleUp(0);
      }
      return result;
    },
    remove: function(node) {
      var i = this.content.indexOf(node);
      var end = this.content.pop();
      if (i !== this.content.length - 1) {
        this.content[i] = end;
        if (this.scoreFunction(end) < this.scoreFunction(node)) {
          this.sinkDown(i);
        } else {
          this.bubbleUp(i);
        }
      }
    },
    size: function() {
      return this.content.length;
    },
    rescoreElement: function(node) {
      this.sinkDown(this.content.indexOf(node));
    },
    sinkDown: function(n) {
      var element = this.content[n];
      while (n > 0) {
        var parentN = (n + 1 >> 1) - 1;
        var parent = this.content[parentN];
        if (this.scoreFunction(element) < this.scoreFunction(parent)) {
          this.content[parentN] = element;
          this.content[n] = parent;
          n = parentN;
        } else {
          break;
        }
      }
    },
    bubbleUp: function(n) {
      var length = this.content.length;
      var element = this.content[n];
      var elemScore = this.scoreFunction(element);
      while (true) {
        var child2N = n + 1 << 1;
        var child1N = child2N - 1;
        var swap = null;
        var child1Score;
        if (child1N < length) {
          var child1 = this.content[child1N];
          child1Score = this.scoreFunction(child1);
          if (child1Score < elemScore) {
            swap = child1N;
          }
        }
        if (child2N < length) {
          var child2 = this.content[child2N];
          var child2Score = this.scoreFunction(child2);
          if (child2Score < (swap === null ? elemScore : child1Score)) {
            swap = child2N;
          }
        }
        if (swap !== null) {
          this.content[n] = this.content[swap];
          this.content[swap] = element;
          n = swap;
        } else {
          break;
        }
      }
    }
  };
  return {
    astar,
    Graph
  };
})();
var AStar_default = AStar;

// ../client/src/js/PathFinder.js
var Colliders2 = class extends AutoBindMethods {
  constructor(scene) {
    super();
    this.scene = scene;
    this.areas = [];
  }
  getNextPoint(from, to) {
    const area = this.getAreaByPosition(from), fromX = area.worldXToWaypointX(from.x), fromY = area.worldZToWaypointY(from.z), areaTo = this.getAreaByPosition(to);
    let toX;
    let toY;
    let portal;
    if (area.id === areaTo.id) {
      toX = area.worldXToWaypointX(to.x);
      toY = area.worldZToWaypointY(to.z);
    } else {
      portal = area.getWaypointPortals().find((portal2) => portal2.to.areaId === areaTo.id);
      if (portal) {
        toX = portal.from.x;
        toY = portal.from.y;
      } else {
        return to;
      }
    }
    let start = this.getFreeGraphPoint(area.graph, fromX, fromY);
    let end = this.getFreeGraphPoint(area.graph, toX, toY);
    if (start && end) {
      let result = AStar_default.astar.search(
        area.graph,
        start,
        end,
        { heuristic: AStar_default.astar.heuristics.diagonal }
      );
      const nextGraphPoint = result[2] || result[1];
      if (nextGraphPoint) {
        const nextWorldPoint = new THREE.Vector3(
          area.waypointXToWorldX(nextGraphPoint.x),
          to.y,
          area.waypointYToWorldZ(nextGraphPoint.y)
        );
        return nextWorldPoint;
      } else {
        return null;
      }
    }
    return to;
  }
  getFreeGraphPoint(graph, x, y) {
    const grid = graph.grid;
    const getWeight = (x2, y2) => grid[x2] && grid[x2][y2] && grid[x2][y2].weight;
    const getNearFreePoint = (range) => getWeight(x + range, y) && grid[x + range][y] || getWeight(x - range, y) && grid[x - range][y] || getWeight(x, y + range) && grid[x][y + range] || getWeight(x, y - range) && grid[x][y - range];
    return getWeight(grid[x][y]) && grid[x][y] || getNearFreePoint(1) || getNearFreePoint(2) || getNearFreePoint(3) || getNearFreePoint(4) || null;
  }
  rebuildAreas() {
    if (this.scene.location) {
      this.areas = this.scene.location.getAreas().map((area) => ({
        ...area,
        graph: new AStar_default.Graph(area.getWaypoints(), { diagonal: true })
      }));
    }
  }
  getAreaByPosition(position) {
    return this.areas.find((area) => area.includesPosition(position));
  }
};

// ../client/src/js/Units.js
var Units = class extends AutoBindMethods {
  constructor(scene) {
    super();
    this.scene = scene;
    this.player = void 0;
  }
  getUnits() {
    return this.scene.gameObjectsService.getUnits();
  }
  getAliveUnits() {
    return this.getUnits().filter((gameObject) => gameObject.isAlive());
  }
  getPlayer() {
    return this.player;
  }
  setDefaultPlayerParams(defaultParams) {
    this.defaultParams = defaultParams;
  }
  createPlayer({
    onCreate = () => null,
    onKill = () => null,
    onDamageDeal = () => null,
    onDamageTaken = () => null,
    onDie = () => null,
    onLevelUp = () => null
  } = {}) {
    const gameObjectsService = this.scene.gameObjectsService;
    return this.scene.models.loadGLTF({
      baseUrl: "./assets/models/units/player",
      callback: (loadedModel) => {
        const defaultParams = this.defaultParams;
        loadedModel.scene.position.set(0, 0.1, 0);
        const player = gameObjectsService.hookGameObject(new Player({
          animations: loadedModel.animations,
          object: loadedModel.scene,
          input: this.scene.input,
          complexAnimations: true,
          checkWay: this.scene.colliders.checkWay,
          getEnvironmentY: this.scene.location.getEnvironmentY,
          name: this.scene.user ? this.scene.user.userName : " ",
          onDamageDeal: (damagedUnit) => onDamageDeal(damagedUnit),
          onDamageTaken: (attacker) => {
            onDamageTaken(attacker);
            this.scene.particles.loadEffect({
              position: player.position.clone().add(new THREE.Vector3(0, 0.75, 0))
            });
          },
          onKill: (object) => onKill(object),
          onDie: (killer) => onDie(killer),
          onLevelUp: () => {
            this.scene.particles.createEffect({
              effect: "level-up-alt/level-up",
              scale: 1.5,
              attachTo: player.object
            });
            onLevelUp();
          },
          attack: () => gameObjectsService.attack(player),
          fire: () => gameObjectsService.fire(player),
          destroy: () => gameObjectsService.destroyGameObject(player),
          dropItem: (item) => gameObjectsService.dropItem(player, item)
        }));
        this.player = player;
        onCreate(player);
        if (defaultParams && defaultParams.params) {
          const { position, rotation, params } = defaultParams;
          const playerParams = player.params;
          player.position.set(position.x, position.y, position.z);
          player.rotation.set(rotation.x, rotation.y, rotation.z);
          playerParams.hp = params.hp;
          playerParams.hpMax = params.hpMax;
          playerParams.fraction = params.fraction;
          playerParams.level = params.level;
          playerParams.damage = params.damage;
          playerParams.fireDamage = params.fireDamage;
          playerParams.speed = params.speed;
          playerParams.experience = params.experience;
          playerParams.money = params.money;
          playerParams.unspentTalents = params.unspentTalents;
          if (params.equippedItems) {
            playerParams.equippedItems = params.equippedItems;
          }
          this.scene.gameObjectsService.updateAttachedItems(player);
          if (!playerParams.hp) {
            player.animationState.isDie = true;
          }
        }
      }
    });
  }
  createAI({ fraction, level, position: { x, y, z }, rotation = {}, scale, onDie, name }) {
    const gameObjectsService = this.scene.gameObjectsService;
    const getPriority = (unit, target) => (target instanceof Player ? 0.75 : 0) + 1 / Math.ceil(target.position.distanceTo(unit.position));
    this.scene.models.loadGLTF({
      baseUrl: fraction === "goats" ? "./assets/models/units/goat-warrior" : "./assets/models/units/enemy",
      noScene: true,
      callback: (gltf) => {
        const networkConnection = this.scene.connection;
        if (!networkConnection || !networkConnection.meta || !networkConnection.meta.role || networkConnection.meta.role === "host") {
          this.scene.add(gltf.scene);
          const ai = gameObjectsService.hookGameObject(new AI({
            animations: gltf.animations,
            object: gltf.scene,
            speed: 0.35 + level * 0.025,
            damage: 5 + level * 1,
            hp: 70 + level * 30,
            fraction,
            name,
            level,
            loot: this.getLoot(level),
            checkWay: this.scene.colliders.checkWay,
            getNextPoint: this.scene.pathFinder.getNextPoint,
            attack: () => gameObjectsService.attack(ai),
            onKill: (dyingUnit) => {
              if (this.scene.location.onKill) {
                this.scene.location.onKill(dyingUnit, ai);
              }
            },
            onDamageTaken: () => this.scene.particles.loadEffect({
              position: ai.position.clone().add(new THREE.Vector3(0, 0.75, 0))
            }),
            onDie: () => {
              if (ai.params.loot) {
                Object.values(ai.params.loot).forEach((loot) => this.scene.gameObjectsService.createWeaponItem({
                  ...loot,
                  position: ai.position.clone()
                }));
              }
              ai.params.loot = [];
              this.scene.intervals.setTimeout(() => {
                if (ai.isDead()) {
                  gameObjectsService.destroyGameObject(ai);
                  if (onDie) {
                    onDie();
                  }
                }
              }, 1e4);
            },
            findTarget: () => {
              const nearEnemyUnits = this.getAliveUnits().filter((unit) => unit !== ai && unit.getFraction() !== fraction && unit.position.distanceTo(ai.position) < 15).sort((unitA, unitB) => getPriority(ai, unitB) - getPriority(ai, unitA));
              return nearEnemyUnits.length ? nearEnemyUnits[0] : null;
            }
          }));
          ai.position.set(x || 0, y || 0, z || 0);
          ai.rotation.set(rotation.x || 0, rotation.y || 0, rotation.z || 0);
          if (scale) {
            ai.object.scale.set(scale, scale, scale);
          }
        }
      }
    });
  }
  getLoot(level) {
    let loot = [];
    if (level > 10 && level < 20 && Math.random() < 0.1 + level / 20) {
      const damage = 15 + Math.round(Math.random() * 5);
      loot = [{
        model: "item-sword-1",
        name: `Advanced Saber (+${damage} Damage)`,
        type: "One Handed",
        boneName: "Right_Hand",
        attachModelName: "item-sword-1",
        effects: [{ damage }]
      }];
    }
    if (level > 20 && level < 30 && Math.random() < 0.1 + level / 40) {
      const damage = 25 + Math.round(Math.random() * 5);
      loot = [{
        model: "item-sword-4",
        name: `Capitan Saber (+${damage} Damage)`,
        type: "One Handed",
        boneName: "Right_Hand",
        attachModelName: "item-sword-4",
        effects: [{ damage }]
      }];
    }
    if (level > 30 && level < 40 && Math.random() < 0.1 + level / 60) {
      const damage = 35 + Math.round(Math.random() * 5);
      loot = [{
        model: "item-sword-2",
        name: `Dark Saber (+${damage} Damage)`,
        type: "One Handed",
        boneName: "Right_Hand",
        attachModelName: "item-sword-2",
        effects: [{ damage }]
      }];
    }
    if (level > 40 && level < 60 && Math.random() < 0.1 + level / 80) {
      const damage = 45 + Math.round(Math.random() * 2) * 5;
      loot = [{
        model: "item-sword-3",
        name: `Sea King Saber (+${damage} Damage)`,
        type: "One Handed",
        boneName: "Right_Hand",
        attachModelName: "item-sword-3",
        effects: [{ damage }]
      }];
    }
    if (level > 60 && Math.random() < 0.1 + level / 100) {
      const damage = 55 + Math.round(Math.random() * 2) * 5;
      loot = [{
        model: "item-sword-5",
        name: `Black Unholy Saber (+${damage} Damage)`,
        type: "One Handed",
        boneName: "Right_Hand",
        attachModelName: "item-sword-5",
        effects: [{ damage }]
      }];
    }
    return loot;
  }
  createNetworkAI({
    params: {
      fraction,
      unitNetworkId,
      level,
      name,
      hp,
      hpMax,
      damage,
      fromNetwork = true
    },
    position,
    onDie
  }, callback = () => {
  }) {
    const gameObjectsService = this.scene.gameObjectsService;
    const getPriority = (unit, target) => (target instanceof Player ? 0.75 : 0) + 1 / Math.ceil(target.position.distanceTo(unit.position));
    return this.scene.models.loadGLTF({
      baseUrl: fraction === "goats" ? "./assets/models/units/goat-warrior" : "./assets/models/units/enemy",
      callback: (loadedObject) => {
        const ai = gameObjectsService.hookGameObject(new AI({
          object: loadedObject.scene,
          animations: loadedObject.animations,
          unitNetworkId,
          fraction,
          level,
          name,
          hp,
          hpMax,
          damage,
          fromNetwork,
          checkWay: this.scene.colliders.checkWay,
          getNextPoint: this.scene.pathFinder.getNextPoint,
          attack: () => gameObjectsService.attack(ai),
          onDamageTaken: () => this.scene.particles.loadEffect({
            position: ai.position.clone().add(new THREE.Vector3(0, 0.75, 0))
          }),
          onKill: (dyingUnit) => {
            if (this.scene.location.onKill) {
              this.scene.location.onKill(dyingUnit, ai);
            }
          },
          onDie: () => {
            if (ai.params.loot) {
              Object.values(ai.params.loot).forEach((loot) => this.scene.gameObjectsService.createWeaponItem({
                ...loot,
                position: ai.position.clone()
              }));
            }
            this.scene.intervals.setTimeout(() => {
              if (ai.isDead()) {
                gameObjectsService.destroyGameObject(ai);
                if (!ai.params.fromNetwork) {
                  this.createNetworkAI({
                    fraction,
                    unitNetworkId,
                    name,
                    hp,
                    hpMax,
                    damage,
                    fromNetwork: false,
                    level: level + 1 + Math.round(Math.random() * level / 4)
                  });
                }
              }
            }, 1e4);
          },
          findTarget: () => {
            if (!ai.params.fromNetwork) {
              const nearEnemyUnits = this.getAliveUnits().filter((unit) => unit !== ai && unit.getFraction() !== fraction && unit.position.distanceTo(ai.position) < 15).sort((unitA, unitB) => getPriority(ai, unitB) - getPriority(ai, unitA));
              return nearEnemyUnits.length ? nearEnemyUnits[0] : null;
            }
          }
        }));
        callback(ai);
      }
    });
  }
  createNetworkPlayer({
    params: { connectionId, unitNetworkId, name, damage, fireDamage },
    onDamageDeal,
    onKill,
    onDie,
    onLevelUp,
    onDamageTaken
  }, callback) {
    const gameObjectsService = this.scene.gameObjectsService;
    return this.scene.models.loadGLTF({
      baseUrl: "./assets/models/units/player",
      callback: (loadedObject) => {
        const player = gameObjectsService.hookGameObject(new Player({
          object: loadedObject.scene,
          animations: loadedObject.animations,
          unitNetworkId,
          connectionId,
          name,
          damage,
          fireDamage,
          fromNetwork: true,
          complexAnimations: true,
          checkWay: this.scene.colliders.checkWay,
          dropItem: (item) => gameObjectsService.dropItem(player, item),
          input: {
            vertical: 0,
            horizontal: 0,
            jump: false,
            cursor: {
              x: 0,
              y: 0
            },
            look: {
              vertical: 0,
              horizontal: 0
            }
          },
          onDie: (killer) => onDie && onDie(killer),
          onDamageDeal: (damagedUnit) => onDamageDeal && onDamageDeal(damagedUnit),
          onDamageTaken: (attacker) => {
            onDamageTaken && onDamageTaken(attacker);
            this.scene.particles.loadEffect({
              position: player.position.clone().add(new THREE.Vector3(0, 0.75, 0))
            });
          },
          onKill: (dyingUnit) => {
            if (onKill) {
              onKill(dyingUnit);
            }
            if (this.scene.location.onKill) {
              this.scene.location.onKill(dyingUnit, player);
            }
          },
          onLevelUp: () => {
            this.scene.particles.createEffect({
              effect: "level-up-alt/level-up",
              scale: 1.5,
              attachTo: player.object
            });
            onLevelUp && onLevelUp();
          },
          attack: () => gameObjectsService.attack(player),
          fire: () => gameObjectsService.fire(player),
          destroy: () => gameObjectsService.destroyGameObject(player)
        }));
        callback(player);
      }
    });
  }
};

// ../client/src/js/Scene.js
var Scene = class extends AutoBindMethods {
  /**
   * @param {Renderer} renderer
   * @param {{
   *  setRestartButtonVisible: function,
   *  setPause: function,
   *  restartGame: function,
   *  isPause: function,
   *  isThirdPerson: function,
   *  update: function,
   *  updatePlayerParams: function,
   *  clearHpBars: function,
   *  switchCamera: function,
   *  setFps: function,
   *  notify: function,
   * }} ui
   * @param {boolean} isServer
   */
  constructor(renderer, ui, isServer = false) {
    super();
    this.isServer = isServer;
    this.intervals = new Intervals(this);
    this.renderer = renderer;
    this.ui = ui;
    this.models = new Models(this);
    this.scene = new THREE.Scene();
    this.pathFinder = new Colliders2(this);
    this.colliders = new Colliders(this);
    this.units = new Units(this);
    this.camera = new Camera(this);
    this.input = new Input({
      onAction: () => this.level.onAction(),
      onExit: () => this.ui.setPause(!this.ui.isPause()),
      onZoom: (zoom) => this.camera.addY(zoom),
      onSwitchCamera: () => this.ui.switchCamera()
    });
    this.gameObjectsService = new GameObjectsService(this);
    this.particles = new Particles(this);
    const connectionHostname = window.location.hostname === "localhost" ? "localhost" : "gohtml.ru";
    const isSSL = window.location.hostname !== "localhost";
    this.connection = new Connection(this, connectionHostname, 1337, isSSL);
    this.location = new Location(this);
    this.intervals.setInterval(() => {
      this.ui.setFps(this.renderer.fps, this.renderer.targetFps);
      this.ui.setPing(this.connection.ping);
      this.ui.updatePlayerParams();
    }, 1e3);
    this.input.isThirdPerson = ui.isThirdPerson();
    this.clearScene();
    this.animate();
    window.goto = (password, x, y, z) => {
      if (this.connection.getHash(password) === "811c9dc594051559") {
        this.getPlayer().position.set(x, y, z);
      }
    };
  }
  clearScene() {
    this.gameObjectsService.removeAll();
    this.location.afterClear();
  }
  animate() {
    const now = Date.now();
    const deltaTime = this.intervals.getDeltaTime(now);
    this.intervals.update(now);
    const gameTime = this.intervals.getTimePassed();
    if (this.location.isLoaded) {
      this.gameObjectsService.update(gameTime, deltaTime);
      if (!this.ui.isPause()) {
        this.camera.update(gameTime, deltaTime);
        this.input.update();
      }
      this.ui.update();
      this.location.update();
      this.particles.update(gameTime);
      this.connection.update(gameTime, deltaTime);
      this.renderer.render(gameTime, deltaTime, this.scene, this.camera.camera);
    }
    window.requestAnimationFrame(this.animate);
  }
  setLoggedUser(userName, password) {
    this.user = { userName, password };
  }
  /**
   * @returns {Player}
   */
  getPlayer() {
    return this.units.getPlayer();
  }
  /**
   * @param {THREE.Object3D} object
   */
  add(object) {
    this.scene.add(object);
  }
  /**
   * @param {THREE.Object3D} object
   */
  remove(object) {
    this.scene.remove(object);
  }
  notify(text, timeout) {
    this.ui.notify(text, timeout);
  }
};

// src/Scene.js
var initScene = (rendererParams, MockGUI) => {
  debug("Starting server scene initialization ...");
  const scene = new Scene(new Renderer(null, rendererParams), MockGUI, true);
  scene.particles.update = () => {
  };
  scene.particles.createSnow = () => ({});
  scene.particles.createEffect = () => ({});
  scene.particles.loadEffect = () => ({});
  scene.particles.createAttachedParticles = () => ({});
  scene.particles.getRandomPosition = () => {
  };
  scene.particles.createInstantParticles = () => ({});
  scene.particles.destroy = () => {
  };
  scene.camera.update = () => ({});
  scene.camera.addY = () => ({});
  scene.camera.getWidth = () => 1;
  scene.camera.getHeight = () => 1;
  scene.camera.updateThirdPerson = () => ({});
  scene.camera.toScreenPosition = () => ({});
  return scene;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  initScene
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL1NjZW5lLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvanMvQXV0b0JpbmRNZXRob2RzLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvanMvUmVuZGVyZXIuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9qcy9HYW1lT2JqZWN0cy9HYW1lT2JqZWN0LmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvanMvR2FtZU9iamVjdHMvQW5pbWF0ZWRHYW1lT2JqZWN0LmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvanMvR2FtZU9iamVjdHMvTW92aW5nR2FtZU9iamVjdC5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2pzL0dhbWVPYmplY3RzL1VuaXQuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9qcy9HYW1lT2JqZWN0cy9GaXJpbmdVbml0LmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvanMvR2FtZU9iamVjdHMvQUkuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9qcy9HYW1lT2JqZWN0cy9QbGF5ZXIuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9qcy9HYW1lT2JqZWN0cy9GaXJlLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvanMvR2FtZU9iamVjdHMuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9qcy9DYW1lcmEuanMiLCAiLi4vLi4vY29tbW9uL1VuaXRzLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvanMvQ29ubmVjdGlvbi5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2pzL0lucHV0LmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvanMvSW50ZXJ2YWxzLmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvanMvTG9jYXRpb25zL0Fic3RyYWN0TG9jYXRpb24uanMiLCAiLi4vLi4vY2xpZW50L3NyYy9qcy9Mb2NhdGlvbnMvRHJlYW1Ub3duL0Vudmlyb25tZW50LmpzIiwgIi4uLy4uL2NsaWVudC9zcmMvanMvTG9jYXRpb25zL0RyZWFtVG93bi9BcmVhcy5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2pzL0xvY2F0aW9ucy9EcmVhbVRvd24vTG9jYXRpb24uanMiLCAiLi4vLi4vY2xpZW50L3NyYy9qcy9Db2xsaWRlcnMuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9qcy9Nb2RlbHMuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9qcy9QYXJ0aWNsZXMuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9qcy9VdGlscy9BU3Rhci5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2pzL1BhdGhGaW5kZXIuanMiLCAiLi4vLi4vY2xpZW50L3NyYy9qcy9Vbml0cy5qcyIsICIuLi8uLi9jbGllbnQvc3JjL2pzL1NjZW5lLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi4vLi4vY2xpZW50L3NyYy9qcy9SZW5kZXJlcic7XHJcbmltcG9ydCBTY2VuZSBmcm9tICcuLi8uLi9jbGllbnQvc3JjL2pzL1NjZW5lJztcclxuXHJcbmV4cG9ydCBjb25zdCBpbml0U2NlbmUgPSAocmVuZGVyZXJQYXJhbXMsIE1vY2tHVUkpID0+IHtcclxuICAgZGVidWcoJ1N0YXJ0aW5nIHNlcnZlciBzY2VuZSBpbml0aWFsaXphdGlvbiAuLi4nKTtcclxuXHJcbiAgIGNvbnN0IHNjZW5lID0gbmV3IFNjZW5lKG5ldyBSZW5kZXJlcihudWxsLCByZW5kZXJlclBhcmFtcyksIE1vY2tHVUksIHRydWUpO1xyXG5cclxuICAgc2NlbmUucGFydGljbGVzLnVwZGF0ZSA9ICgpID0+IHt9O1xyXG4gICBzY2VuZS5wYXJ0aWNsZXMuY3JlYXRlU25vdyA9ICgpID0+ICh7fSk7XHJcbiAgIHNjZW5lLnBhcnRpY2xlcy5jcmVhdGVFZmZlY3QgPSAoKSA9PiAoe30pO1xyXG4gICBzY2VuZS5wYXJ0aWNsZXMubG9hZEVmZmVjdCA9ICgpID0+ICh7fSk7XHJcbiAgIHNjZW5lLnBhcnRpY2xlcy5jcmVhdGVBdHRhY2hlZFBhcnRpY2xlcyA9ICgpID0+ICh7fSk7XHJcbiAgIHNjZW5lLnBhcnRpY2xlcy5nZXRSYW5kb21Qb3NpdGlvbiA9ICgpID0+IHt9O1xyXG4gICBzY2VuZS5wYXJ0aWNsZXMuY3JlYXRlSW5zdGFudFBhcnRpY2xlcyA9ICgpID0+ICh7fSk7XHJcbiAgIHNjZW5lLnBhcnRpY2xlcy5kZXN0cm95ID0gKCkgPT4ge307XHJcblxyXG4gICAvLyBzY2VuZS5tb2RlbHMuY3JlYXRlR2VvbWV0cnkgPSAoKSA9PiBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcclxuXHJcbiAgIHNjZW5lLmNhbWVyYS51cGRhdGUgPSAoKSA9PiAoe30pO1xyXG4gICBzY2VuZS5jYW1lcmEuYWRkWSA9ICgpID0+ICh7fSk7XHJcbiAgIHNjZW5lLmNhbWVyYS5nZXRXaWR0aCA9ICgpID0+IDE7XHJcbiAgIHNjZW5lLmNhbWVyYS5nZXRIZWlnaHQgPSAoKSA9PiAxO1xyXG4gICBzY2VuZS5jYW1lcmEudXBkYXRlVGhpcmRQZXJzb24gPSAoKSA9PiAoe30pO1xyXG4gICBzY2VuZS5jYW1lcmEudG9TY3JlZW5Qb3NpdGlvbiA9ICgpID0+ICh7fSk7XHJcblxyXG4gICByZXR1cm4gc2NlbmU7XHJcbn07XHJcbiIsICJleHBvcnQgZGVmYXVsdCBjbGFzcyBBdXRvQmluZE1ldGhvZHMge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgbGV0IGZ1bmN0aW9uTmFtZXMgPSBbXTtcclxuICAgICAgICBsZXQgb2JqID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpO1xyXG5cclxuICAgICAgICB3aGlsZSAob2JqKSB7XHJcbiAgICAgICAgICAgIGlmIChvYmogPT09IE9iamVjdC5wcm90b3R5cGUgfHwgb2JqID09PSBBdXRvQmluZE1ldGhvZHMucHJvdG90eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBvYmogPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbk5hbWVzID0gZnVuY3Rpb25OYW1lcy5jb25jYXQoXHJcbiAgICAgICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmZpbHRlcihuYW1lID0+IChcclxuICAgICAgICAgICAgICAgICAgICBuYW1lICE9PSAnY29uc3RydWN0b3InXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgZnVuY3Rpb25OYW1lcy5pbmRleE9mKG5hbWUpID09PSAtMVxyXG4gICAgICAgICAgICAgICAgICAgICYmIHR5cGVvZiB0aGlzW25hbWVdID09PSAnZnVuY3Rpb24nXHJcbiAgICAgICAgICAgICAgICApKVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgb2JqID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBmdW5jdGlvbk5hbWUgb2YgZnVuY3Rpb25OYW1lcykge1xyXG4gICAgICAgICAgICB0aGlzW2Z1bmN0aW9uTmFtZV0gPSB0aGlzW2Z1bmN0aW9uTmFtZV0uYmluZCh0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbiIsICJpbXBvcnQgQXV0b0JpbmRNZXRob2RzIGZyb20gJy4vQXV0b0JpbmRNZXRob2RzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlcmVyIGV4dGVuZHMgQXV0b0JpbmRNZXRob2RzIHtcclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGNvbnRhaW5lciA9IG51bGwsIHBhcmFtcyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe1xyXG4gICAgICAgICAgICBhbnRpYWxpYXM6IHRydWUsXHJcbiAgICAgICAgICAgIGxvZ2FyaXRobWljRGVwdGhCdWZmZXI6IHRydWUsXHJcbiAgICAgICAgICAgIGFscGhhOiB0cnVlLFxyXG4gICAgICAgICAgICBwb3dlclByZWZlcmVuY2U6ICdoaWdoLXBlcmZvcm1hbmNlJyxcclxuICAgICAgICAgICAgLi4ucGFyYW1zLFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmZwcyA9IDYwO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0RnBzID0gNzA7XHJcbiAgICAgICAgdGhpcy5sYXN0UmVuZGVyID0gMDtcclxuXHJcbiAgICAgICAgaWYgKGNvbnRhaW5lcikge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMucmVuZGVyZXIuc2V0Q2xlYXJDb2xvcigweGZmZmZmZiwgMCk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMucmVuZGVyZXIuYXV0b0NsZWFyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIub3V0cHV0Q29sb3JTcGFjZSA9IFRIUkVFLlNSR0JDb2xvclNwYWNlO1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnNoYWRvd01hcC5lbmFibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXAudHlwZSA9IFRIUkVFLlBDRlNoYWRvd01hcDtcclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfHN0cmluZ30gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfHN0cmluZ30gaGVpZ2h0XHJcbiAgICAgKi9cclxuICAgIHNldFNpemUod2lkdGgsIGhlaWdodCkge1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7VEhSRUUuU2NlbmV9IHNjZW5lXHJcbiAgICAgKiBAcGFyYW0ge1RIUkVFLkNhbWVyYX0gY2FtZXJhXHJcbiAgICAgKi9cclxuICAgIHJlbmRlcih0aW1lLCBkZWx0YVRpbWUsIHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgICBpZiAoIXRoaXMubGFzdFJlbmRlcikge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3RSZW5kZXIgPSB0aW1lIC0gZGVsdGFUaW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdGltZVNpbmNlTGFzdFJlbmRlciA9IHRpbWUgLSB0aGlzLmxhc3RSZW5kZXI7XHJcbiAgICAgICAgY29uc3QgY3VycmVudEZQUyA9IDEwMDAgLyB0aW1lU2luY2VMYXN0UmVuZGVyO1xyXG4gICAgICAgIHRoaXMuZnBzIC09ICh0aGlzLmZwcyAtIGN1cnJlbnRGUFMpIC8gNjA7XHJcblxyXG4gICAgICAgIGlmICh0aW1lU2luY2VMYXN0UmVuZGVyID49IDEwMDAgLyB0aGlzLnRhcmdldEZwcykge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcclxuICAgICAgICAgICAgdGhpcy5sYXN0UmVuZGVyID0gdGltZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0RnBzID0gdGhpcy5mcHMgKyAxMDtcclxuICAgIH1cclxufVxyXG4iLCAiaW1wb3J0IEF1dG9CaW5kTWV0aG9kcyBmcm9tICcuLi9BdXRvQmluZE1ldGhvZHMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZU9iamVjdCBleHRlbmRzIEF1dG9CaW5kTWV0aG9kcyB7XHJcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5wYXJhbXMgPSB7IC4uLnBhcmFtcyB9O1xyXG4gICAgICAgIHRoaXMub2JqZWN0ID0gcGFyYW1zLm9iamVjdDtcclxuXHJcbiAgICAgICAgaWYgKHBhcmFtcy5vYmplY3QpIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHBhcmFtcy5vYmplY3QucG9zaXRpb247XHJcbiAgICAgICAgICAgIHRoaXMucm90YXRpb24gPSBwYXJhbXMub2JqZWN0LnJvdGF0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ldmVudHMgPSB7fTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdFtdfSBhcmdzXHJcbiAgICAgKi9cclxuICAgIGRpc3BhdGNoRXZlbnQoZXZlbnROYW1lLCAuLi5hcmdzKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0pIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5mb3JFYWNoKGNhbGxiYWNrID0+IGNhbGxiYWNrKC4uLmFyZ3MpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xyXG4gICAgICovXHJcbiAgICBhZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmV2ZW50c1tldmVudE5hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdLnB1c2goY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXSA9IFtjYWxsYmFja107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q2hpbGRCeU5hbWUobmFtZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9iamVjdC5nZXRPYmplY3RCeU5hbWUobmFtZSwgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q2hpbGREaXJlY3Rpb24oYXJnLCB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAxKSkge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkID0gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZydcclxuICAgICAgICAgICAgPyB0aGlzLmdldENoaWxkQnlOYW1lKGFyZylcclxuICAgICAgICAgICAgOiBhcmc7XHJcblxyXG4gICAgICAgIHJldHVybiB2ZWN0b3IuYXBwbHlRdWF0ZXJuaW9uKHRoaXMuZ2V0Q2hpbGRSb3RhdGlvbihjaGlsZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENoaWxkUG9zaXRpb24oYXJnKSB7XHJcbiAgICAgICAgY29uc3QgY2hpbGQgPSB0eXBlb2YgYXJnID09PSAnc3RyaW5nJ1xyXG4gICAgICAgICAgICA/IHRoaXMuZ2V0Q2hpbGRCeU5hbWUoYXJnKVxyXG4gICAgICAgICAgICA6IGFyZztcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IzKCkuc2V0RnJvbU1hdHJpeFBvc2l0aW9uKChjaGlsZCB8fCB0aGlzLm9iamVjdCkubWF0cml4V29ybGQpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENoaWxkUm90YXRpb24oYXJnKSB7XHJcbiAgICAgICAgY29uc3QgY2hpbGQgPSB0eXBlb2YgYXJnID09PSAnc3RyaW5nJ1xyXG4gICAgICAgICAgICA/IHRoaXMuZ2V0Q2hpbGRCeU5hbWUoYXJnKVxyXG4gICAgICAgICAgICA6IGFyZztcclxuXHJcbiAgICAgICAgbGV0IHRhcmdldCA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCk7XHJcbiAgICAgICAgKGNoaWxkIHx8IHRoaXMub2JqZWN0KS5nZXRXb3JsZFF1YXRlcm5pb24odGFyZ2V0KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcclxuICAgIH1cclxufSIsICJpbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3QnO1xyXG5cclxuY29uc3QgYW5pbWF0aW9uTmFtZXMgPSB7XHJcbiAgICBzdGFuZDogJ1N0YW5kJyxcclxuICAgIHJ1bjogJ1J1bicsXHJcbiAgICBqdW1wOiAnSnVtcCcsXHJcbiAgICBhdHRhY2s6ICdBdHRhY2snLFxyXG4gICAgcm90YXRlTGVmdDogJ1JvdGF0ZSBMZWZ0JyxcclxuICAgIHJvdGF0ZVJpZ2h0OiAnUm90YXRlIFJpZ2h0JyxcclxuICAgIHJ1bkxlZnQ6ICdSdW4gTGVmdCcsXHJcbiAgICBydW5SaWdodDogJ1J1biBSaWdodCcsXHJcbiAgICB3YWxrQmFjazogJ1dhbGsgQmFjaycsXHJcbiAgICBkaWU6ICdEaWUnLFxyXG4gICAgc3Bhd246ICdTcGF3bicsXHJcbiAgICBoaXQ6ICdIaXQnLFxyXG5cclxuICAgIC8vIENvbXBsZXggYW5pbWltYXRpb25zXHJcbiAgICB0b3BSdW46ICdUb3AgUnVuJyxcclxuICAgIGJvdHRvbVJ1bjogJ0JvdHRvbSBSdW4nLFxyXG4gICAgdG9wV2Fsa0JhY2s6ICdUb3AgV2FsayBCYWNrJyxcclxuICAgIGJvdHRvbVdhbGtCYWNrOiAnQm90dG9tIFdhbGsgQmFjaycsXHJcbiAgICB0b3BBdHRhY2s6ICdUb3AgQXR0YWNrJyxcclxuICAgIHRvcEF0dGFja1dlYXBvbjE6ICdUb3AgQXR0YWNrIFdlYXBvbiAxJyxcclxuICAgIGJvdHRvbUF0dGFjazogJ0JvdHRvbSBBdHRhY2snLFxyXG4gICAgYm90dG9tQXR0YWNrV2VhcG9uMTogJ0JvdHRvbSBBdHRhY2snLFxyXG4gICAgdG9wU3RhbmQ6ICdUb3AgU3RhbmQnLFxyXG4gICAgYm90dG9tU3RhbmQ6ICdCb3R0b20gU3RhbmQnLFxyXG4gICAgdG9wUnVuUmlnaHQ6ICdUb3AgUnVuIFJpZ2h0JyxcclxuICAgIHRvcFJ1bkxlZnQ6ICdUb3AgUnVuIExlZnQnLFxyXG4gICAgdG9wSnVtcDogJ1RvcCBKdW1wJyxcclxuICAgIHRvcEhpdDogJ1RvcCBIaXQnLFxyXG4gICAgYm90dG9tUnVuUmlnaHQ6ICdCb3R0b20gUnVuIFJpZ2h0JyxcclxuICAgIGJvdHRvbVJ1bkxlZnQ6ICdCb3R0b20gUnVuIExlZnQnLFxyXG4gICAgYm90dG9tSnVtcDogJ0JvdHRvbSBKdW1wJyxcclxuICAgIGJvdHRvbUhpdDogJ0JvdHRvbSBIaXQnLFxyXG4gICAgdG9wRGllOiAnVG9wIERpZScsXHJcbiAgICBib3R0b21EaWU6ICdCb3R0b20gRGllJyxcclxuICAgIHRvcFNwYXduOiAnVG9wIFNwYXduJyxcclxuICAgIGJvdHRvbVNwYXduOiAnQm90dG9tIFNwYXduJyxcclxufTtcclxuXHJcbmNvbnN0IHRvcEFuaW1hdGlvbnMgPSBbXHJcbiAgICAndG9wUnVuJyxcclxuICAgICd0b3BXYWxrQmFjaycsXHJcbiAgICAndG9wQXR0YWNrJyxcclxuICAgICd0b3BBdHRhY2tXZWFwb24xJyxcclxuICAgICd0b3BTdGFuZCcsXHJcbiAgICAndG9wUnVuUmlnaHQnLFxyXG4gICAgJ3RvcFJ1bkxlZnQnLFxyXG4gICAgJ3RvcEp1bXAnLFxyXG4gICAgJ3RvcEhpdCcsXHJcbiAgICAndG9wRGllJyxcclxuXTtcclxuXHJcbmNvbnN0IGJvdHRvbUFuaW1hdGlvbnMgPSBbXHJcbiAgICAnYm90dG9tUnVuJyxcclxuICAgICdib3R0b21XYWxrQmFjaycsXHJcbiAgICAnYm90dG9tQXR0YWNrJyxcclxuICAgICdib3R0b21BdHRhY2tXZWFwb24xJyxcclxuICAgICdib3R0b21TdGFuZCcsXHJcbiAgICAnYm90dG9tUnVuUmlnaHQnLFxyXG4gICAgJ2JvdHRvbVJ1bkxlZnQnLFxyXG4gICAgJ2JvdHRvbUp1bXAnLFxyXG4gICAgJ2JvdHRvbUhpdCcsXHJcbiAgICAnYm90dG9tRGllJyxcclxuXTtcclxuXHJcbmNvbnN0IHRvcEJvbmVzID0gW1xyXG4gICAgJ1JpZ2h0X0ZvcmVhcm0nLFxyXG4gICAgJ1JpZ2h0X0FybScsXHJcbiAgICAnUmlnaHRfSGFuZCcsXHJcbiAgICAnUmlnaHRfSGFuZF9lbmQnLFxyXG4gICAgJ1JpZ2h0X1Nob3VsZGVyJyxcclxuICAgICdMZWZ0X1Nob3VsZGVyJyxcclxuICAgICdMZWZ0X0ZvcmVhcm0nLFxyXG4gICAgJ0xlZnRfQXJtJyxcclxuICAgICdMZWZ0X0hhbmQnLFxyXG4gICAgJ0xlZnRfSGFuZF9lbmQnLFxyXG4gICAgJ0NoZXN0JyxcclxuICAgICdOZWNrJyxcclxuICAgICdIZWFkJyxcclxuICAgICdIZWFkX2VuZCdcclxuXTtcclxuXHJcbmNvbnN0IGJvdHRvbUJvbmVzID0gW1xyXG4gICAgJ01haW5fQm9uZScsXHJcbiAgICAnUmlnaHRfTGVnJyxcclxuICAgICdSaWdodF9NaWRkbGVfRm9vdCcsXHJcbiAgICAnUmlnaHRfRm9vdCcsXHJcbiAgICAnUmlnaHRfRm9vdF9lbmQnLFxyXG4gICAgJ0xlZnRfTGVnJyxcclxuICAgICdMZWZ0X01pZGRsZV9Gb290JyxcclxuICAgICdMZWZ0X0Zvb3QnLFxyXG4gICAgJ0xlZnRfRm9vdF9lbmQnLFxyXG4gICAgJ0xlZ3NfUm90YXRpb24nLFxyXG5dO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5pbWF0ZWRHYW1lT2JqZWN0IGV4dGVuZHMgR2FtZU9iamVjdCB7XHJcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKHtcclxuICAgICAgICAgICAgYW5pbWF0aW9uTmFtZXM6IHsgLi4uYW5pbWF0aW9uTmFtZXMgfSxcclxuICAgICAgICAgICAgdG9wQm9uZXM6IFsuLi50b3BCb25lc10sXHJcbiAgICAgICAgICAgIGJvdHRvbUJvbmVzOiBbLi4uYm90dG9tQm9uZXNdLFxyXG4gICAgICAgICAgICB0b3BBbmltYXRpb25zOiBbLi4udG9wQW5pbWF0aW9uc10sXHJcbiAgICAgICAgICAgIGJvdHRvbUFuaW1hdGlvbnM6IFsuLi5ib3R0b21BbmltYXRpb25zXSxcclxuICAgICAgICAgICAgc3Bhd25UaW1lb3V0OiAxLFxyXG4gICAgICAgICAgICAuLi5wYXJhbXNcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25TdGF0ZSA9IHtcclxuICAgICAgICAgICAgaXNNb3ZpbmdGb3J3YXJkOiBmYWxzZSxcclxuICAgICAgICAgICAgaXNNb3ZpbmdSaWdodDogZmFsc2UsXHJcbiAgICAgICAgICAgIGlzTW92aW5nTGVmdDogZmFsc2UsXHJcbiAgICAgICAgICAgIGlzTW92aW5nQmFja3dhcmQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBpc1JvdGF0ZUxlZnQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBpc1JvdGF0ZVJpZ2h0OiBmYWxzZSxcclxuICAgICAgICAgICAgaXNBdHRhY2s6IGZhbHNlLFxyXG4gICAgICAgICAgICBpc0F0dGFja1dlYXBvbjE6IGZhbHNlLFxyXG4gICAgICAgICAgICBpc0p1bXA6IGZhbHNlLFxyXG4gICAgICAgICAgICBpc0RpZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGlzSGl0OiBmYWxzZSxcclxuICAgICAgICAgICAgaXNTcGF3bjogdHJ1ZSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnBsYXlpbmdBbmltYXRpb25zID0ge307XHJcbiAgICAgICAgdGhpcy5sZWdzUm90YXRpb25ZID0gMDtcclxuICAgICAgICB0aGlzLnNwYXduVGltZSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMubWl4ZXIgPSBuZXcgVEhSRUUuQW5pbWF0aW9uTWl4ZXIodGhpcy5wYXJhbXMub2JqZWN0KTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0QW5pbWF0aW9ucyh0aGlzLnBhcmFtcy5hbmltYXRpb25OYW1lcyk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKHRpbWUsIGRlbHRhVGltZSkge1xyXG4gICAgICAgIHN1cGVyLnVwZGF0ZSh0aW1lLCBkZWx0YVRpbWUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICghdGhpcy5zcGF3blRpbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5zcGF3blRpbWUgPSB0aW1lO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5hbmltYXRpb25TdGF0ZS5pc1NwYXduICYmIHRoaXMuaXNTcGF3bkZpbmlzaGVkKHRpbWUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uU3RhdGUuaXNTcGF3biA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMubWl4ZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5taXhlci51cGRhdGUoZGVsdGFUaW1lIC8gMTAwMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5fYXR0YWNoZWRNb2RlbHMpIHtcclxuICAgICAgICAgICAgT2JqZWN0LnZhbHVlcyh0aGlzLl9hdHRhY2hlZE1vZGVscykuZm9yRWFjaCgoYXR0YWNoZWRNb2RlbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGF0dGFjaGVkTW9kZWwgJiYgYXR0YWNoZWRNb2RlbC5fbWl4ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBhdHRhY2hlZE1vZGVsLl9taXhlci51cGRhdGUoZGVsdGFUaW1lIC8gMTAwMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLmNvbXBsZXhBbmltYXRpb25zKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ29tcGxleEFuaW1hdGlvbnMoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBhbmltYXRpb24gPSB0aGlzLmdldEN1cnJlbnRBbmltYXRpb24oKTtcclxuICAgICAgICAgICAgYW5pbWF0aW9uICYmIHRoaXMucGxheUFuaW1hdGlvbihhbmltYXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwbGF5QW5pbWF0aW9uKGFuaW1hdGlvbiwgeyBmb3JjZSB9ID0ge30pIHtcclxuICAgICAgICBpZiAoIWFuaW1hdGlvbiB8fCAhYW5pbWF0aW9uLl9jbGlwKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IGFuaW1hdGlvbk5hbWUgPSBhbmltYXRpb24uX2NsaXAubmFtZTtcclxuICAgICAgICBjb25zdCBzaG91bGRVcGRhdGUgPSB0aGlzLnBsYXlpbmdBbmltYXRpb25OYW1lICE9PSBhbmltYXRpb25OYW1lIHx8IGZvcmNlO1xyXG5cclxuICAgICAgICBpZiAoc2hvdWxkVXBkYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWluZ0FuaW1hdGlvbk5hbWUgPSBhbmltYXRpb25OYW1lO1xyXG4gICAgICAgICAgICBhbmltYXRpb24ucmVzZXQoKTtcclxuICAgICAgICAgICAgYW5pbWF0aW9uLnBsYXkoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXlpbmdBbmltYXRpb24pIHtcclxuICAgICAgICAgICAgICAgIHZhciBmcm9tID0gdGhpcy5wbGF5aW5nQW5pbWF0aW9uO1xyXG5cclxuICAgICAgICAgICAgICAgIGZyb20uZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb24uZW5hYmxlZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgZnJvbS5jcm9zc0ZhZGVUbyhhbmltYXRpb24sIDAuMyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMucGxheWluZ0FuaW1hdGlvbiA9IGFuaW1hdGlvbjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdEFuaW1hdGlvbnMoYW5pbWF0aW9uTmFtZXMpIHtcclxuICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgIHRvcEFuaW1hdGlvbnMsXHJcbiAgICAgICAgICAgIGJvdHRvbUFuaW1hdGlvbnMsXHJcbiAgICAgICAgICAgIHRvcEJvbmVzLFxyXG4gICAgICAgICAgICBib3R0b21Cb25lcyxcclxuICAgICAgICAgICAgY29tcGxleEFuaW1hdGlvbnMsXHJcbiAgICAgICAgfSA9IHRoaXMucGFyYW1zO1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1hdGlvbnMgPSBPYmplY3Qua2V5cyhhbmltYXRpb25OYW1lcykucmVkdWNlKFxyXG4gICAgICAgICAgICAocmVzdWx0LCBrZXkpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBleGNsdWRlZEJvbmVzID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBsZXhBbmltYXRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvcEFuaW1hdGlvbnMuaW5jbHVkZXMoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleGNsdWRlZEJvbmVzID0gYm90dG9tQm9uZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChib3R0b21BbmltYXRpb25zLmluY2x1ZGVzKGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhjbHVkZWRCb25lcyA9IHRvcEJvbmVzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBtb2RlbEFuaW1hdGlvbiA9IHRoaXMuZmluZE1vZGVsQW5pbWF0aW9uKGFuaW1hdGlvbk5hbWVzW2tleV0sIHsgZXhjbHVkZWRCb25lcyB9KTtcclxuICAgICAgICAgICAgICAgIGxldCBpbml0ZWRBbmltYXRpb24gPSB0aGlzLmNyZWF0ZUNsaXBBY3Rpb24obW9kZWxBbmltYXRpb24pO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB7IC4uLnJlc3VsdCwgW2tleV06IGluaXRlZEFuaW1hdGlvbiB9O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7fVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHtcclxuICAgICAgICAgICAgYW5pbWF0aW9uczoge1xyXG4gICAgICAgICAgICAgICAganVtcCxcclxuICAgICAgICAgICAgICAgIGF0dGFjayxcclxuICAgICAgICAgICAgICAgIHRvcEF0dGFjayxcclxuICAgICAgICAgICAgICAgIHRvcEF0dGFja1dlYXBvbjEsXHJcbiAgICAgICAgICAgICAgICBkaWUsXHJcbiAgICAgICAgICAgICAgICBzcGF3bixcclxuICAgICAgICAgICAgICAgIHRvcERpZSxcclxuICAgICAgICAgICAgICAgIGJvdHRvbURpZSxcclxuICAgICAgICAgICAgICAgIHRvcEp1bXAsXHJcbiAgICAgICAgICAgICAgICBib3R0b21KdW1wLFxyXG4gICAgICAgICAgICAgICAgYm90dG9tQXR0YWNrLFxyXG4gICAgICAgICAgICAgICAgYm90dG9tQXR0YWNrV2VhcG9uMVxyXG4gICAgICAgICAgICB9ID0ge31cclxuICAgICAgICB9ID0gdGhpcztcclxuXHJcbiAgICAgICAgW2p1bXAsIGRpZSwgc3Bhd24sIHRvcERpZSwgYm90dG9tRGllLCB0b3BKdW1wLCBib3R0b21KdW1wXS5mb3JFYWNoKChjbGFtcEFuaW1hdGlvbikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY2xhbXBBbmltYXRpb24pIHtcclxuICAgICAgICAgICAgICAgIGNsYW1wQW5pbWF0aW9uLnNldExvb3AoVEhSRUUuTG9vcE9uY2UsIDApO1xyXG4gICAgICAgICAgICAgICAgY2xhbXBBbmltYXRpb24uY2xhbXBXaGVuRmluaXNoZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIFthdHRhY2ssIHRvcEF0dGFjaywgYm90dG9tQXR0YWNrLCB0b3BBdHRhY2tXZWFwb24xLCBib3R0b21BdHRhY2tXZWFwb24xXS5mb3JFYWNoKChhdHRhY2tBbmltYXRpb24pID0+IHtcclxuICAgICAgICAgICAgaWYgKGF0dGFja0FuaW1hdGlvbikge1xyXG4gICAgICAgICAgICAgICAgYXR0YWNrQW5pbWF0aW9uLnNldER1cmF0aW9uKHRoaXMucGFyYW1zLmF0dGFja1RpbWVvdXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlQ2xpcEFjdGlvbihhY3Rpb24pIHtcclxuICAgICAgICByZXR1cm4gYWN0aW9uICYmIHRoaXMubWl4ZXIuY2xpcEFjdGlvbihhY3Rpb24pLnN0b3AoKTtcclxuICAgIH1cclxuXHJcbiAgICBmaW5kTW9kZWxBbmltYXRpb24obmFtZSwgeyBleGNsdWRlZEJvbmVzID0gW10gfSA9IHt9KSB7XHJcbiAgICAgICAgY29uc3QgeyBhbmltYXRpb25zID0gW10gfSA9IHRoaXMucGFyYW1zO1xyXG5cclxuICAgICAgICBsZXQgYW5pbWF0aW9uID0gYW5pbWF0aW9ucy5maW5kKGFuaW1hdGlvbiA9PiBhbmltYXRpb24ubmFtZSA9PT0gbmFtZSk7XHJcblxyXG4gICAgICAgIGlmIChhbmltYXRpb24gJiYgZXhjbHVkZWRCb25lcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xlYXJBbmltYXRpb25Cb25lcyhhbmltYXRpb24sIGV4Y2x1ZGVkQm9uZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGFuaW1hdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBpc01vdmluZygpIHtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvblN0YXRlLmlzTW92aW5nTGVmdFxyXG4gICAgICAgICAgICB8fCB0aGlzLmFuaW1hdGlvblN0YXRlLmlzTW92aW5nUmlnaHRcclxuICAgICAgICAgICAgfHwgdGhpcy5hbmltYXRpb25TdGF0ZS5pc01vdmluZ0ZvcndhcmRcclxuICAgICAgICAgICAgfHwgdGhpcy5hbmltYXRpb25TdGF0ZS5pc01vdmluZ0JhY2t3YXJkXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBpc1NwYXduRmluaXNoZWQodGltZSkge1xyXG4gICAgICAgIHJldHVybiB0aW1lIC0gdGhpcy5zcGF3blRpbWUgPiB0aGlzLnBhcmFtcy5zcGF3blRpbWVvdXQgKiAxMDAwO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyQW5pbWF0aW9uQm9uZXMoYW5pbWF0aW9uLCBib25lcykge1xyXG4gICAgICAgIGlmIChhbmltYXRpb24pIHtcclxuICAgICAgICAgICAgY29uc3QgZ2V0Qm9uZU5hbWUgPSBpdGVtID0+IGl0ZW0ubmFtZS5zcGxpdCgnLicpWzBdLFxyXG4gICAgICAgICAgICAgICAgaXNOb3RFeGNsdWRlZCA9IGl0ZW0gPT4gIWJvbmVzLmluY2x1ZGVzKGdldEJvbmVOYW1lKGl0ZW0pKTtcclxuXHJcbiAgICAgICAgICAgIGFuaW1hdGlvbi50cmFja3MgPSBhbmltYXRpb24udHJhY2tzLmZpbHRlcihpc05vdEV4Y2x1ZGVkKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBhbmltYXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUNvbXBsZXhBbmltYXRpb25zKCkge1xyXG4gICAgICAgIGNvbnN0IHtcclxuICAgICAgICAgICAgYW5pbWF0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgdG9wQXR0YWNrLCBib3R0b21BdHRhY2ssXHJcbiAgICAgICAgICAgICAgICB0b3BBdHRhY2tXZWFwb24xLCBib3R0b21BdHRhY2tXZWFwb24xLFxyXG4gICAgICAgICAgICAgICAgdG9wV2Fsa0JhY2ssIGJvdHRvbVdhbGtCYWNrLFxyXG4gICAgICAgICAgICAgICAgdG9wUnVuLCBib3R0b21SdW4sXHJcbiAgICAgICAgICAgICAgICB0b3BSdW5SaWdodCxcclxuICAgICAgICAgICAgICAgIHRvcFJ1bkxlZnQsXHJcbiAgICAgICAgICAgICAgICB0b3BTdGFuZCwgYm90dG9tU3RhbmQsXHJcbiAgICAgICAgICAgICAgICB0b3BKdW1wLCBib3R0b21KdW1wLFxyXG4gICAgICAgICAgICAgICAgdG9wSGl0LCBib3R0b21IaXQsXHJcbiAgICAgICAgICAgICAgICB0b3BEaWUsIGJvdHRvbURpZSxcclxuICAgICAgICAgICAgICAgIHRvcFNwYXduLCBib3R0b21TcGF3bixcclxuICAgICAgICAgICAgfSA9IHt9XHJcbiAgICAgICAgfSA9IHRoaXM7XHJcblxyXG4gICAgICAgIGNvbnN0IHtcclxuICAgICAgICAgICAgaXNBdHRhY2ssXHJcbiAgICAgICAgICAgIGlzQXR0YWNrV2VhcG9uMSxcclxuICAgICAgICAgICAgaXNNb3ZpbmdSaWdodCxcclxuICAgICAgICAgICAgaXNNb3ZpbmdMZWZ0LFxyXG4gICAgICAgICAgICBpc01vdmluZ0JhY2t3YXJkLFxyXG4gICAgICAgICAgICBpc01vdmluZ0ZvcndhcmQsXHJcbiAgICAgICAgICAgIGlzSnVtcCxcclxuICAgICAgICAgICAgaXNEaWUsXHJcbiAgICAgICAgICAgIGlzSGl0LFxyXG4gICAgICAgICAgICBpc1NwYXduLFxyXG4gICAgICAgIH0gPSB0aGlzLmFuaW1hdGlvblN0YXRlO1xyXG5cclxuICAgICAgICBjb25zdCBwbGF5aW5nQW5pbWF0aW9ucyA9IHtcclxuICAgICAgICAgICAgdG9wOiAoXHJcbiAgICAgICAgICAgICAgICAoaXNEaWUgJiYgdG9wRGllKVxyXG4gICAgICAgICAgICAgICAgfHwgKGlzSGl0ICYmIHRvcEhpdClcclxuICAgICAgICAgICAgICAgIHx8IChpc0F0dGFja1dlYXBvbjEgJiYgdG9wQXR0YWNrV2VhcG9uMSlcclxuICAgICAgICAgICAgICAgIHx8IChpc0F0dGFjayAmJiB0b3BBdHRhY2spXHJcbiAgICAgICAgICAgICAgICB8fCAoaXNKdW1wICYmIHRvcEp1bXApXHJcbiAgICAgICAgICAgICAgICB8fCAoaXNNb3ZpbmdCYWNrd2FyZCAmJiBpc01vdmluZ1JpZ2h0ICYmIHRvcFJ1bkxlZnQpXHJcbiAgICAgICAgICAgICAgICB8fCAoaXNNb3ZpbmdCYWNrd2FyZCAmJiBpc01vdmluZ0xlZnQgJiYgdG9wUnVuUmlnaHQpXHJcbiAgICAgICAgICAgICAgICB8fCAoaXNNb3ZpbmdCYWNrd2FyZCAmJiB0b3BXYWxrQmFjaylcclxuICAgICAgICAgICAgICAgIHx8IChpc01vdmluZ1JpZ2h0ICYmIHRvcFJ1blJpZ2h0KVxyXG4gICAgICAgICAgICAgICAgfHwgKGlzTW92aW5nTGVmdCAmJiB0b3BSdW5MZWZ0KVxyXG4gICAgICAgICAgICAgICAgfHwgKGlzTW92aW5nRm9yd2FyZCAmJiB0b3BSdW4pXHJcbiAgICAgICAgICAgICAgICB8fCAoaXNTcGF3biAmJiB0b3BTcGF3bilcclxuICAgICAgICAgICAgICAgIHx8ICh0b3BTdGFuZClcclxuICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgYm90dG9tOiAoXHJcbiAgICAgICAgICAgICAgICAoaXNEaWUgJiYgYm90dG9tRGllKVxyXG4gICAgICAgICAgICAgICAgfHwgKGlzSnVtcCAmJiBib3R0b21KdW1wKVxyXG4gICAgICAgICAgICAgICAgfHwgKGlzTW92aW5nQmFja3dhcmQgJiYgaXNNb3ZpbmdSaWdodCAmJiBib3R0b21XYWxrQmFjaylcclxuICAgICAgICAgICAgICAgIHx8IChpc01vdmluZ0JhY2t3YXJkICYmIGlzTW92aW5nTGVmdCAmJiBib3R0b21XYWxrQmFjaylcclxuICAgICAgICAgICAgICAgIHx8IChpc01vdmluZ0JhY2t3YXJkICYmIGJvdHRvbVdhbGtCYWNrKVxyXG4gICAgICAgICAgICAgICAgfHwgKGlzTW92aW5nUmlnaHQgJiYgYm90dG9tUnVuKVxyXG4gICAgICAgICAgICAgICAgfHwgKGlzTW92aW5nTGVmdCAmJiBib3R0b21SdW4pXHJcbiAgICAgICAgICAgICAgICB8fCAoaXNNb3ZpbmdGb3J3YXJkICYmIGJvdHRvbVJ1bilcclxuICAgICAgICAgICAgICAgIHx8IChpc0F0dGFja1dlYXBvbjEgJiYgYm90dG9tQXR0YWNrV2VhcG9uMSlcclxuICAgICAgICAgICAgICAgIHx8IChpc0F0dGFjayAmJiBib3R0b21BdHRhY2spXHJcbiAgICAgICAgICAgICAgICB8fCAoaXNIaXQgJiYgYm90dG9tSGl0KVxyXG4gICAgICAgICAgICAgICAgfHwgKGlzU3Bhd24gJiYgYm90dG9tU3Bhd24pXHJcbiAgICAgICAgICAgICAgICB8fCAoYm90dG9tU3RhbmQpXHJcbiAgICAgICAgICAgICksXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgbGVnc1JvdGF0aW9uQm9uZSA9IHRoaXMuZ2V0Q2hpbGRCeU5hbWUoJ0xlZ3NfUm90YXRpb24nKTtcclxuICAgICAgICBpZiAobGVnc1JvdGF0aW9uQm9uZSkge1xyXG4gICAgICAgICAgICBjb25zdCB7IHJvdGF0aW9uIH0gPSBsZWdzUm90YXRpb25Cb25lO1xyXG4gICAgICAgICAgICBsZXQgeSA9IC0wLjM7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNNb3ZpbmdMZWZ0KSB7XHJcbiAgICAgICAgICAgICAgICB5ID0gaXNNb3ZpbmdGb3J3YXJkXHJcbiAgICAgICAgICAgICAgICAgICAgPyAwLjVcclxuICAgICAgICAgICAgICAgICAgICA6IGlzTW92aW5nQmFja3dhcmQgPyAtMC43IDogMTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc01vdmluZ1JpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICB5ID0gaXNNb3ZpbmdGb3J3YXJkXHJcbiAgICAgICAgICAgICAgICAgICAgPyAtMS4yXHJcbiAgICAgICAgICAgICAgICAgICAgOiBpc01vdmluZ0JhY2t3YXJkID8gMC40IDogLTEuNztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5sZWdzUm90YXRpb25ZID0gdGhpcy5sZWdzUm90YXRpb25ZIC0gKHRoaXMubGVnc1JvdGF0aW9uWSAtIHkpIC8gMTA7XHJcbiAgICAgICAgICAgIHJvdGF0aW9uLnNldChyb3RhdGlvbi54LCB0aGlzLmxlZ3NSb3RhdGlvblksIHJvdGF0aW9uLnopO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ibGVuZEFuaW1hdGlvbnMocGxheWluZ0FuaW1hdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIGJsZW5kQW5pbWF0aW9ucyh7IHRvcCwgYm90dG9tIH0pIHtcclxuICAgICAgICBpZiAoISh0b3AgJiYgYm90dG9tICYmIHRvcC5fY2xpcCAmJiBib3R0b20uX2NsaXApKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IGdldEFuaW1hdGlvbk5hbWUgPSBhID0+IGEuX2NsaXAubmFtZSxcclxuICAgICAgICAgICAgcGxheUFuaW1hdGlvbiA9IChmcm9tQW5pbWF0aW9uLCBhbmltYXRpb24pID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGFuaW1hdGlvbk5hbWUgPSBnZXRBbmltYXRpb25OYW1lKGFuaW1hdGlvbik7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmcm9tQW5pbWF0aW9uTmFtZSA9IGZyb21BbmltYXRpb24gJiYgZ2V0QW5pbWF0aW9uTmFtZShmcm9tQW5pbWF0aW9uKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZnJvbUFuaW1hdGlvbk5hbWUgIT09IGFuaW1hdGlvbk5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb24ucmVzZXQoKTtcclxuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb24ucGxheSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZnJvbUFuaW1hdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tQW5pbWF0aW9uLmNyb3NzRmFkZVRvKGFuaW1hdGlvbiwgMC4zKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXlBbmltYXRpb24odGhpcy5wbGF5aW5nQW5pbWF0aW9ucy50b3AsIHRvcCk7XHJcbiAgICAgICAgcGxheUFuaW1hdGlvbih0aGlzLnBsYXlpbmdBbmltYXRpb25zLmJvdHRvbSwgYm90dG9tKTtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5aW5nQW5pbWF0aW9ucy50b3AgPSB0b3A7XHJcbiAgICAgICAgdGhpcy5wbGF5aW5nQW5pbWF0aW9ucy5ib3R0b20gPSBib3R0b207XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q3VycmVudEFuaW1hdGlvbigpIHtcclxuICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIHN0YW5kLFxyXG4gICAgICAgICAgICAgICAgYXR0YWNrLFxyXG4gICAgICAgICAgICAgICAgd2Fsa0JhY2ssXHJcbiAgICAgICAgICAgICAgICBydW5MZWZ0LFxyXG4gICAgICAgICAgICAgICAgcnVuUmlnaHQsXHJcbiAgICAgICAgICAgICAgICBydW4sXHJcbiAgICAgICAgICAgICAgICBqdW1wLFxyXG4gICAgICAgICAgICAgICAgaGl0LFxyXG4gICAgICAgICAgICAgICAgcm90YXRlTGVmdCxcclxuICAgICAgICAgICAgICAgIHJvdGF0ZVJpZ2h0LFxyXG4gICAgICAgICAgICAgICAgZGllLFxyXG4gICAgICAgICAgICAgICAgc3Bhd24sXHJcbiAgICAgICAgICAgIH0gPSB7fVxyXG4gICAgICAgIH0gPSB0aGlzO1xyXG5cclxuICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgIGlzQXR0YWNrLFxyXG4gICAgICAgICAgICBpc01vdmluZ0ZvcndhcmQsXHJcbiAgICAgICAgICAgIGlzSnVtcCxcclxuICAgICAgICAgICAgaXNNb3ZpbmdMZWZ0LFxyXG4gICAgICAgICAgICBpc01vdmluZ1JpZ2h0LFxyXG4gICAgICAgICAgICBpc01vdmluZ0JhY2t3YXJkLFxyXG4gICAgICAgICAgICBpc1JvdGF0ZUxlZnQsXHJcbiAgICAgICAgICAgIGlzUm90YXRlUmlnaHQsXHJcbiAgICAgICAgICAgIGlzRGllLFxyXG4gICAgICAgICAgICBpc0hpdCxcclxuICAgICAgICAgICAgaXNTcGF3bixcclxuICAgICAgICB9ID0gdGhpcy5hbmltYXRpb25TdGF0ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgKGlzRGllICYmIGRpZSlcclxuICAgICAgICAgICAgfHwgKGlzSGl0ICYmIGhpdClcclxuICAgICAgICAgICAgfHwgKGlzQXR0YWNrICYmIGF0dGFjaylcclxuICAgICAgICAgICAgfHwgKGlzSnVtcCAmJiBqdW1wKVxyXG4gICAgICAgICAgICB8fCAoaXNNb3ZpbmdCYWNrd2FyZCAmJiB3YWxrQmFjaylcclxuICAgICAgICAgICAgfHwgKGlzTW92aW5nTGVmdCAmJiBydW5MZWZ0KVxyXG4gICAgICAgICAgICB8fCAoaXNNb3ZpbmdSaWdodCAmJiBydW5SaWdodClcclxuICAgICAgICAgICAgfHwgKGlzTW92aW5nRm9yd2FyZCAmJiBydW4pXHJcbiAgICAgICAgICAgIHx8IChpc1JvdGF0ZUxlZnQgJiYgcm90YXRlTGVmdClcclxuICAgICAgICAgICAgfHwgKGlzUm90YXRlUmlnaHQgJiYgcm90YXRlUmlnaHQpXHJcbiAgICAgICAgICAgIHx8IChpc1NwYXduICYmIHNwYXduKVxyXG4gICAgICAgICAgICB8fCBzdGFuZFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn0iLCAiaW1wb3J0IEFuaW1hdGVkR2FtZU9iamVjdCBmcm9tICcuL0FuaW1hdGVkR2FtZU9iamVjdCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb3ZpbmdHYW1lT2JqZWN0IGV4dGVuZHMgQW5pbWF0ZWRHYW1lT2JqZWN0IHtcclxuICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoe1xyXG4gICAgICAgICAgICBzcGVlZDogMC4xLFxyXG4gICAgICAgICAgICBncmF2aXR5OiAxLFxyXG4gICAgICAgICAgICBzbGlkZVRocm90dGxpbmc6IG5ldyBUSFJFRS5WZWN0b3IzKDEsIDEsIDEpLFxyXG4gICAgICAgICAgICB0aHJvdHRsaW5nOiBuZXcgVEhSRUUuVmVjdG9yMygwLjUsIDAuOTUsIDAuNSksXHJcbiAgICAgICAgICAgIGFjY2VsZXJhdGlvbjogbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCksXHJcbiAgICAgICAgICAgIGNoZWNrV2F5OiAoKSA9PiB0cnVlLFxyXG4gICAgICAgICAgICAuLi5wYXJhbXNcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUodGltZSwgZGVsdGFUaW1lKSB7XHJcbiAgICAgICAgc3VwZXIudXBkYXRlKHRpbWUsIGRlbHRhVGltZSk7XHJcbiAgICAgICAgY29uc3QgeyBhY2NlbGVyYXRpb24sIHRocm90dGxpbmcsIGdyYXZpdHksIHNsaWRlVGhyb3R0bGluZywgZnJvbU5ldHdvcmssIGdldEVudmlyb25tZW50WSB9ID0gdGhpcy5wYXJhbXM7XHJcblxyXG4gICAgICAgIGlmICghZnJvbU5ldHdvcmspIHtcclxuICAgICAgICAgICAgYWNjZWxlcmF0aW9uLnkgLT0gKGdyYXZpdHkgLyAxMDApICogKGRlbHRhVGltZSAqIDAuMDYpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pc0dyb3VuZGVkID0gIXRoaXMuY2hlY2tXYXkoMCwgLTAuMiwgMCk7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uU3RhdGUuaXNKdW1wID0gIXRoaXMuaXNHcm91bmRlZDtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGhhc0FjY2VsZXJhdGlvblggPSBCb29sZWFuKGFjY2VsZXJhdGlvbi54KTtcclxuICAgICAgICAgICAgY29uc3QgaGFzQWNjZWxlcmF0aW9uWSA9IEJvb2xlYW4oYWNjZWxlcmF0aW9uLnkpO1xyXG4gICAgICAgICAgICBjb25zdCBoYXNBY2NlbGVyYXRpb25aID0gQm9vbGVhbihhY2NlbGVyYXRpb24ueik7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBjYW5Nb3ZlWCA9IGhhc0FjY2VsZXJhdGlvblggJiYgdGhpcy5jaGVja1dheShhY2NlbGVyYXRpb24ueCwgMCwgMCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGNhbk1vdmVZID0gaGFzQWNjZWxlcmF0aW9uWSAmJiB0aGlzLmNoZWNrV2F5KDAsIGFjY2VsZXJhdGlvbi55LCAwKTtcclxuICAgICAgICAgICAgY29uc3QgY2FuTW92ZVogPSBoYXNBY2NlbGVyYXRpb25aICYmIHRoaXMuY2hlY2tXYXkoMCwgMCwgYWNjZWxlcmF0aW9uLnopO1xyXG5cclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAoaGFzQWNjZWxlcmF0aW9uWCAmJiAhY2FuTW92ZVgpXHJcbiAgICAgICAgICAgICAgIHx8IChoYXNBY2NlbGVyYXRpb25ZICYmICFjYW5Nb3ZlWSlcclxuICAgICAgICAgICAgICAgfHwgKGhhc0FjY2VsZXJhdGlvblogJiYgIWNhbk1vdmVaKVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIGFjY2VsZXJhdGlvbi5tdWx0aXBseShzbGlkZVRocm90dGxpbmcpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChoYXNBY2NlbGVyYXRpb25YICYmICFjYW5Nb3ZlWCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzQ2xpbWJpbmcgPSAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgYWNjZWxlcmF0aW9uLnhcclxuICAgICAgICAgICAgICAgICAgICAgICAmJiB0aGlzLmlzR3JvdW5kZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAmJiBhY2NlbGVyYXRpb24ueSA8PSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJiYgdGhpcy5jaGVja1dheShhY2NlbGVyYXRpb24ueCwgMC4xLCAwKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0NsaW1iaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjbGltYmluZ1ZhbHVlID0gMC4xO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdldEVudmlyb25tZW50WSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpbWJpbmdWYWx1ZSA9IChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldEVudmlyb25tZW50WSh7IHg6IHRoaXMucG9zaXRpb24ueCArIGFjY2VsZXJhdGlvbi54LCB5OiAwLCB6OiB0aGlzLnBvc2l0aW9uLnogfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gdGhpcy5wb3NpdGlvbi55XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgKz0gY2xpbWJpbmdWYWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY2NlbGVyYXRpb24ueCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICghY2FuTW92ZVkpIHtcclxuICAgICAgICAgICAgICAgICAgICBhY2NlbGVyYXRpb24ueSA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGhhc0FjY2VsZXJhdGlvblogJiYgIWNhbk1vdmVaKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNDbGltYmluZyA9IChcclxuICAgICAgICAgICAgICAgICAgICAgICBhY2NlbGVyYXRpb24uelxyXG4gICAgICAgICAgICAgICAgICAgICAgICYmIHRoaXMuaXNHcm91bmRlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICYmIGFjY2VsZXJhdGlvbi55IDw9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAmJiB0aGlzLmNoZWNrV2F5KDAsIDAuMSwgYWNjZWxlcmF0aW9uLnopXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQ2xpbWJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNsaW1iaW5nVmFsdWUgPSAwLjE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0RW52aXJvbm1lbnRZKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGltYmluZ1ZhbHVlID0gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0RW52aXJvbm1lbnRZKHsgeDogdGhpcy5wb3NpdGlvbi54LCB5OiAwLCB6OiB0aGlzLnBvc2l0aW9uLnogKyBhY2NlbGVyYXRpb24ueiB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSB0aGlzLnBvc2l0aW9uLnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSArPSBjbGltYmluZ1ZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY2VsZXJhdGlvbi56ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFjY2VsZXJhdGlvbi54ICo9IHRocm90dGxpbmcueDtcclxuICAgICAgICBhY2NlbGVyYXRpb24ueSAqPSB0aHJvdHRsaW5nLnk7XHJcbiAgICAgICAgYWNjZWxlcmF0aW9uLnogKj0gdGhyb3R0bGluZy56O1xyXG5cclxuICAgICAgICBjb25zdCBpc01vdmluZyA9IChcclxuICAgICAgICAgICBNYXRoLmFicyhhY2NlbGVyYXRpb24ueCkgPiAwLjAwMVxyXG4gICAgICAgICAgIHx8IE1hdGguYWJzKGFjY2VsZXJhdGlvbi55KSA+IDAuMDAxXHJcbiAgICAgICAgICAgfHwgTWF0aC5hYnMoYWNjZWxlcmF0aW9uLnopID4gMC4wMDFcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoaXNNb3ZpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQoYWNjZWxlcmF0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tXYXkoeCA9IDAsIHkgPSAwLCB6ID0gMCkge1xyXG4gICAgICAgIGNvbnN0IHsgcG9zaXRpb24sIHBhcmFtczogeyBjaGVja1dheSB9IH0gPSB0aGlzO1xyXG4gICAgICAgIGNvbnN0IG5leHRQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKHBvc2l0aW9uLnggKyB4LCBwb3NpdGlvbi55ICsgeSwgcG9zaXRpb24ueiArIHopO1xyXG5cclxuICAgICAgICByZXR1cm4gY2hlY2tXYXkobmV4dFBvc2l0aW9uLCB0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRMZWZ0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldERpcmVjdGlvbihuZXcgVEhSRUUuVmVjdG9yMygxLCAwLCAwKSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VXAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGlyZWN0aW9uKG5ldyBUSFJFRS5WZWN0b3IzKDAsIDEsIDApKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRGb3J3YXJkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldERpcmVjdGlvbihuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAxKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge1RIUkVFLlZlY3RvcjN9IGRpcmVjdGlvblxyXG4gICAgICovXHJcbiAgICBnZXREaXJlY3Rpb24oZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgZGlyZWN0aW9uLmFwcGx5UXVhdGVybmlvbih0aGlzLm9iamVjdC5xdWF0ZXJuaW9uKTtcclxuICAgICAgICByZXR1cm4gZGlyZWN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFNjYWxhckFjY2VsZXJhdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMuYWNjZWxlcmF0aW9uLnRvQXJyYXkoKVxyXG4gICAgICAgICAgICAubWFwKE1hdGguYWJzKVxyXG4gICAgICAgICAgICAucmVkdWNlKChyLCB2KSA9PiByICsgdiwgMClcclxuICAgIH1cclxufSIsICJpbXBvcnQgTW92aW5nR2FtZU9iamVjdCBmcm9tICcuL01vdmluZ0dhbWVPYmplY3QnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVW5pdCBleHRlbmRzIE1vdmluZ0dhbWVPYmplY3Qge1xyXG4gICAgY29uc3RydWN0b3IocGFyYW1zID0ge30pIHtcclxuICAgICAgICBzdXBlcih7XHJcbiAgICAgICAgICAgIGhwOiAxMDAsXHJcbiAgICAgICAgICAgIGhwTWF4OiBwYXJhbXMuaHAgfHwgMTAwLFxyXG4gICAgICAgICAgICBkYW1hZ2U6IDEwLFxyXG4gICAgICAgICAgICBhdHRhY2tUaW1lb3V0OiAwLjksXHJcbiAgICAgICAgICAgIGhpdFRpbWU6IDAuMyxcclxuICAgICAgICAgICAgYXR0YWNrRGFtYWdlVGltZW91dDogMC4zLFxyXG4gICAgICAgICAgICBlcXVpcHBlZEl0ZW1zOiB7XHJcbiAgICAgICAgICAgICAgICBsZWZ0SGFuZDogbnVsbCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLi4ucGFyYW1zLFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9hdHRhY2hlZE1vZGVscyA9IHt9O1xyXG5cclxuICAgICAgICB0aGlzLnNob3VsZEF0dGFjayA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubGF0ZXN0QXR0YWNrVGltZXN0YW1wID0gMDtcclxuICAgICAgICB0aGlzLmxhdGVzdEhpdFRpbWVzdGFtcCA9IDA7XHJcblxyXG4gICAgICAgIFsnb25EYW1hZ2VUYWtlbicsICdvbkRhbWFnZURlYWwnLCAnb25LaWxsJywgJ29uRGllJ10uZm9yRWFjaCgoZXZlbnROYW1lKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW1zW2V2ZW50TmFtZV0gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHBhcmFtc1tldmVudE5hbWVdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSh0aW1lLCBkZWx0YVRpbWUpIHtcclxuICAgICAgICBzdXBlci51cGRhdGUodGltZSwgZGVsdGFUaW1lKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNEZWFkKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaGl0UmVsZWFzZWQgPSB0aGlzLmlzSGl0UmVsZWFzZWQodGltZSk7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uU3RhdGUuaXNIaXQgPSAhaGl0UmVsZWFzZWQ7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzQXR0YWNrUmVsZWFzZWQodGltZSkgJiYgaGl0UmVsZWFzZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25TdGF0ZS5pc0F0dGFjayA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvblN0YXRlLmlzQXR0YWNrV2VhcG9uMSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvdWxkQXR0YWNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJhbXMuZXF1aXBwZWRJdGVtcy5sZWZ0SGFuZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uU3RhdGUuaXNBdHRhY2tXZWFwb24xID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb25TdGF0ZS5pc0F0dGFjayA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXRlc3RBdHRhY2tUaW1lc3RhbXAgPSB0aW1lO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJhbXMuYXR0YWNrICYmIHRoaXMucGFyYW1zLmF0dGFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zaG91bGRBdHRhY2sgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RnJhY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zLmZyYWN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvbGxpZGVyKHBvc2l0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgZGlmZlkgPSBwb3NpdGlvbi55IC0gdGhpcy5wb3NpdGlvbi55O1xyXG5cclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICBNYXRoLnNxcnQoXHJcbiAgICAgICAgICAgICAgICBNYXRoLnBvdyhwb3NpdGlvbi54IC0gdGhpcy5wb3NpdGlvbi54LCAyKVxyXG4gICAgICAgICAgICAgICAgKyBNYXRoLnBvdyhwb3NpdGlvbi56IC0gdGhpcy5wb3NpdGlvbi56LCAyKVxyXG4gICAgICAgICAgICApIDwgMVxyXG4gICAgICAgICAgICAmJiBkaWZmWSA+PSAwXHJcbiAgICAgICAgICAgICYmIGRpZmZZIDwgMS43XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZWxlYXNlQXR0YWNrKHRpbWUpIHtcclxuICAgICAgICB0aGlzLmxhdGVzdEF0dGFja1RpbWVzdGFtcCA9IHRpbWUgLSB0aGlzLnBhcmFtcy5hdHRhY2tUaW1lb3V0ICogMTAwMDtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvblN0YXRlLmlzQXR0YWNrID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25TdGF0ZS5pc0F0dGFja1dlYXBvbkF0dGFjaDEgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpc0F0dGFja1JlbGVhc2VkKHRpbWUpIHtcclxuICAgICAgICByZXR1cm4gKHRpbWUgLSB0aGlzLmxhdGVzdEF0dGFja1RpbWVzdGFtcCA+PSB0aGlzLnBhcmFtcy5hdHRhY2tUaW1lb3V0ICogMTAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNBdHRhY2tJbnRlcnJ1cHRlZCh0aW1lKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aW1lIC0gdGhpcy5sYXRlc3RIaXRUaW1lc3RhbXAgPD0gdGhpcy5wYXJhbXMuYXR0YWNrRGFtYWdlVGltZW91dCAqIDEwMDApO1xyXG4gICAgfVxyXG5cclxuICAgIGlzSGl0UmVsZWFzZWQodGltZSkge1xyXG4gICAgICAgIHJldHVybiAodGltZSAtIHRoaXMubGF0ZXN0SGl0VGltZXN0YW1wID49IHRoaXMucGFyYW1zLmhpdFRpbWUgKiAxMDAwKTtcclxuICAgIH1cclxuXHJcbiAgICBhdHRhY2soKSB7XHJcbiAgICAgICAgdGhpcy5zaG91bGRBdHRhY2sgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlzRGVhZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMuaHAgPD0gMDtcclxuICAgIH1cclxuXHJcbiAgICBpc0FsaXZlKCkge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5pc0RlYWQoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaXNFbmVteSh1bml0KSB7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgdW5pdC5wYXJhbXMuZnJhY3Rpb24gIT09IHRoaXMucGFyYW1zLmZyYWN0aW9uXHJcbiAgICAgICAgICAgICYmIHVuaXQucGFyYW1zLmZyYWN0aW9uICE9PSAnbmV1dHJhbCdcclxuICAgICAgICAgICAgJiYgdGhpcy5wYXJhbXMuZnJhY3Rpb24gIT09ICduZXV0cmFsJ1xyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zLmxldmVsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE5hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zLm5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QXR0YWNrVGltZW91dCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMuYXR0YWNrRGFtYWdlVGltZW91dCAqIDEwMDA7XHJcbiAgICB9XHJcblxyXG4gICAgZGFtYWdlVGFrZW4oeyBkYW1hZ2UsIHVuaXQ6IGF0dGFja2VyIH0gPSB7fSwgdGltZSkge1xyXG4gICAgICAgIGlmIChkYW1hZ2UgJiYgYXR0YWNrZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuaHAgLT0gZGFtYWdlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KCdvbkRhbWFnZVRha2VuJywgYXR0YWNrZXIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGF0dGFja2VyKSB7XHJcbiAgICAgICAgICAgICAgICBhdHRhY2tlci5kaXNwYXRjaEV2ZW50KCdvbkRhbWFnZURlYWwnLCB0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgaW50ZXJydXB0QnlDaGFuY2UgPSBNYXRoLnJhbmRvbSgpIDwgMC4zMztcclxuICAgICAgICAgICAgY29uc3QgaW50ZXJydXB0QnlMZXZlbCA9IGF0dGFja2VyLmdldExldmVsKCkgLSB0aGlzLmdldExldmVsKCkgPiAyO1xyXG4gICAgICAgICAgICBjb25zdCBzaG91bGRCZUludGVycnVwdGVkID0gaW50ZXJydXB0QnlMZXZlbCB8fCBpbnRlcnJ1cHRCeUNoYW5jZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzaG91bGRCZUludGVycnVwdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhdGVzdEhpdFRpbWVzdGFtcCA9IHRpbWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRGVhZCgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpZShhdHRhY2tlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGllKGtpbGxpbmdVbml0KSB7XHJcbiAgICAgICAgdGhpcy5wYXJhbXMuaHAgPSAwO1xyXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCgnb25EaWUnLCBraWxsaW5nVW5pdCk7XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25TdGF0ZS5pc0RpZSA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmIChraWxsaW5nVW5pdCkge1xyXG4gICAgICAgICAgICBraWxsaW5nVW5pdC5kaXNwYXRjaEV2ZW50KCdvbktpbGwnLCB0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYWRkU3BlZWQoc3BlZWQpIHtcclxuICAgICAgICB0aGlzLnBhcmFtcy5zcGVlZCArPSBzcGVlZDtcclxuICAgIH1cclxuXHJcbiAgICBhZGREYW1hZ2UoZGFtYWdlKSB7XHJcbiAgICAgICAgdGhpcy5wYXJhbXMuZGFtYWdlICs9IGRhbWFnZTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRIUChocCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzQWxpdmUoKSkge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5ocCA9IE1hdGgubWluKHRoaXMucGFyYW1zLmhwICsgaHAsIHRoaXMucGFyYW1zLmhwTWF4KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TW9uZXkoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zLm1vbmV5O1xyXG4gICAgfVxyXG5cclxuICAgIGFkZE1vbmV5KG1vbmV5KSB7XHJcbiAgICAgICAgdGhpcy5wYXJhbXMubW9uZXkgKz0gbW9uZXk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkTWF4SFAoaHApIHtcclxuICAgICAgICBpZiAodGhpcy5pc0FsaXZlKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuaHBNYXggKz0gaHA7XHJcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLmhwICs9IGhwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRIUCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMuaHA7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TWF4SFAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zLmhwTWF4O1xyXG4gICAgfVxyXG5cclxuICAgIGdldFNwZWVkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcy5zcGVlZDtcclxuICAgIH1cclxuXHJcbiAgICBnZXREYW1hZ2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyYW1zLmRhbWFnZSArIHRoaXMuZ2V0RGFtYWdlRnJvbUVmZmVjdHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXREYW1hZ2VGcm9tRWZmZWN0cygpIHtcclxuICAgICAgICBsZXQgZGFtYWdlID0gMDtcclxuICAgICAgICBjb25zdCB7IGVxdWlwcGVkSXRlbXMgfSA9IHRoaXMucGFyYW1zO1xyXG5cclxuICAgICAgICBpZiAoZXF1aXBwZWRJdGVtcykge1xyXG4gICAgICAgICAgICBjb25zdCB7IGxlZnRIYW5kIH0gPSBlcXVpcHBlZEl0ZW1zO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxlZnRIYW5kKSB7XHJcbiAgICAgICAgICAgICAgICBsZWZ0SGFuZC5lZmZlY3RzLmZvckVhY2goKGVmZmVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlZmZlY3QuZGFtYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhbWFnZSArPSBlZmZlY3QuZGFtYWdlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZGFtYWdlO1xyXG4gICAgfVxyXG59IiwgImltcG9ydCBVbml0IGZyb20gJy4vVW5pdCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGaXJpbmdVbml0IGV4dGVuZHMgVW5pdCB7XHJcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKHtcclxuICAgICAgICAgICAgZmlyZURhbWFnZTogMTAsXHJcbiAgICAgICAgICAgIGZpcmVUaW1lT2Zmc2V0OiAwLjQsXHJcbiAgICAgICAgICAgIGZpcmVUaW1lb3V0OiAxLjUsXHJcbiAgICAgICAgICAgIGZpcmVTaGVsbFNwZWVkOiAzLFxyXG4gICAgICAgICAgICAuLi5wYXJhbXNcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0ZpcmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNob3VsZEZpcmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmxhdGVzdEZpcmUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEZpcmVJbml0aWFsUG9zaXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb24uY2xvbmUoKS5hZGQoXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0VXAoKVxyXG4gICAgICAgICAgICAgICAgLm11bHRpcGx5U2NhbGFyKDEuNSlcclxuICAgICAgICAgICAgICAgIC5hZGQodGhpcy5nZXRGb3J3YXJkKCkubXVsdGlwbHlTY2FsYXIoMC41KSlcclxuICAgICAgICAgICAgICAgIC5hZGQodGhpcy5nZXRMZWZ0KCkubXVsdGlwbHlTY2FsYXIoMC4yKSlcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEZpcmVJbml0aWFsUm90YXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm90YXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RmlyZURhbWFnZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMuZmlyZURhbWFnZTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRGaXJlRGFtYWdlKGZpcmVEYW1hZ2UpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMuZmlyZURhbWFnZSArPSBmaXJlRGFtYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSh0aW1lLCBkZWx0YVRpbWUpIHtcclxuICAgICAgICBzdXBlci51cGRhdGUodGltZSwgZGVsdGFUaW1lKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNEZWFkKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkRmlyZSAmJiB0aGlzLnBhcmFtcy5maXJlICYmIHRoaXMuaXNGaXJlUmVsZWFzZWQodGltZSkgJiYgdGhpcy5pc0F0dGFja1JlbGVhc2VkKHRpbWUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaXNGaXJlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5zaG91bGRGaXJlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMubGF0ZXN0RmlyZSA9IHRpbWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zaG91bGRGaXJlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5pc0ZpcmUgJiYgdGltZSAtIHRoaXMubGF0ZXN0RmlyZSA+PSB0aGlzLnBhcmFtcy5maXJlVGltZU9mZnNldCAqIDEwMDApIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuZmlyZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmlzRmlyZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmFuaW1hdGlvblN0YXRlLmlzQXR0YWNrICYmICF0aGlzLmFuaW1hdGlvblN0YXRlLmlzQXR0YWNrV2VhcG9uMSkge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvblN0YXRlLmlzQXR0YWNrID0gIXRoaXMuaXNGaXJlUmVsZWFzZWQodGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzRmlyZVJlbGVhc2VkKHRpbWUpIHtcclxuICAgICAgICByZXR1cm4gdGltZSAtIHRoaXMubGF0ZXN0RmlyZSA+PSB0aGlzLnBhcmFtcy5maXJlVGltZW91dCAqIDEwMDA7XHJcbiAgICB9XHJcblxyXG4gICAgZmlyZSgpIHtcclxuICAgICAgICB0aGlzLnNob3VsZEZpcmUgPSB0cnVlO1xyXG4gICAgfVxyXG59IiwgImltcG9ydCBGaXJpbmdVbml0IGZyb20gJy4vRmlyaW5nVW5pdCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBSSBleHRlbmRzIEZpcmluZ1VuaXQge1xyXG4gICAgY29uc3RydWN0b3IocGFyYW1zID0ge30pIHtcclxuICAgICAgICBzdXBlcih7XHJcbiAgICAgICAgICAgIHNwZWVkOiAwLjUsXHJcbiAgICAgICAgICAgIGRhbWFnZTogMTAsXHJcbiAgICAgICAgICAgIGhwOiAxMDAsXHJcbiAgICAgICAgICAgIG5hbWU6ICdVbm5hbWVkIFVuaXQnLFxyXG4gICAgICAgICAgICBmcmFjdGlvbjogJ25ldXRyYWwnLFxyXG4gICAgICAgICAgICBmaXJlVGltZW91dDogMS41LFxyXG4gICAgICAgICAgICBhdHRhY2tUaW1lb3V0OiAxLjUsXHJcbiAgICAgICAgICAgIGp1bXBUaW1lb3V0OiAxLjUsXHJcbiAgICAgICAgICAgIHN0YXJ0UnVuVGltZW91dDogMSxcclxuICAgICAgICAgICAgbmV4dFBvaW50VXBkYXRlVGltZW91dDogMC4xLFxyXG4gICAgICAgICAgICB1cGRhdGVUYXJnZXRUaW1lb3V0OiAzLFxyXG4gICAgICAgICAgICB0eXBlOiAnYWknLFxyXG4gICAgICAgICAgICAuLi5wYXJhbXMsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHsgaHAsIGRhbWFnZSwgc3BlZWQgfSA9IHRoaXMucGFyYW1zO1xyXG5cclxuICAgICAgICB0aGlzLnBhcmFtcy5ib3VudHkgPSBocCAvIDQgKyBkYW1hZ2UgKyBzcGVlZCAqIDMwO1xyXG4gICAgICAgIHRoaXMubGFzdFJ1biA9IDA7XHJcbiAgICAgICAgdGhpcy5sYXN0VGFyZ2V0VXBkYXRlID0gMDtcclxuICAgICAgICB0aGlzLmxhc3ROZXh0UG9pbnRVcGRhdGUgPSAwO1xyXG4gICAgICAgIHRoaXMubGFzdEp1bXBUaW1lc3RhbXAgPSAwO1xyXG4gICAgICAgIHRoaXMuaXNSdW5uaW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc0F0dGFjayA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSh0aW1lLCBkZWx0YVRpbWUpIHtcclxuICAgICAgICBzdXBlci51cGRhdGUodGltZSwgZGVsdGFUaW1lKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNEZWFkKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgeyBvYmplY3QsIHRhcmdldCwgYWNjZWxlcmF0aW9uLCBzcGVlZCwgZ2V0TmV4dFBvaW50LCBmcm9tTmV0d29yayB9ID0gdGhpcy5wYXJhbXM7XHJcblxyXG4gICAgICAgIGlmICghZnJvbU5ldHdvcmspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyYW1zLmZpbmRUYXJnZXQgJiYgdGhpcy5pc1VwZGF0ZVRhcmdldFJlbGVhc2VkKHRpbWUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmFtcy50YXJnZXQgPSB0aGlzLnBhcmFtcy5maW5kVGFyZ2V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChnZXROZXh0UG9pbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc05leHRQb2ludFVwZGF0ZVJlbGVhc2VkKHRpbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdE5leHRQb2ludFVwZGF0ZSA9IHRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dFBvaW50ID0gZ2V0TmV4dFBvaW50KHRoaXMucG9zaXRpb24sIHRhcmdldC5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5leHRQb2ludCA9IHRhcmdldC5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgaXNUYXJnZXROZWFyID0gdGFyZ2V0ICYmIG9iamVjdC5wb3NpdGlvbi5kaXN0YW5jZVRvKHRhcmdldC5wb3NpdGlvbikgPCAxLjc1O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pc0F0dGFjayA9IChcclxuICAgICAgICAgICAgICAgaXNUYXJnZXROZWFyXHJcbiAgICAgICAgICAgICAgICYmIHRoaXMuaXNFbmVteSh0YXJnZXQpXHJcbiAgICAgICAgICAgICAgICYmIHRhcmdldC5pc0FsaXZlKClcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXR0YWNrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvdGF0ZVRvUG9zaXRpb24odGFyZ2V0LnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm5leHRQb2ludCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb3RhdGVUb1Bvc2l0aW9uKHRoaXMubmV4dFBvaW50KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgaXNOZXh0UG9pbnROZWFyID0gIXRoaXMubmV4dFBvaW50O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSAoXHJcbiAgICAgICAgICAgICAgICB0YXJnZXRcclxuICAgICAgICAgICAgICAgICYmICFpc1RhcmdldE5lYXJcclxuICAgICAgICAgICAgICAgICYmICFpc05leHRQb2ludE5lYXJcclxuICAgICAgICAgICAgICAgICYmICh0aGlzLmlzUnVubmluZyB8fCB0aGlzLmlzUnVuUmVsZWFzZWQodGltZSkpXHJcbiAgICAgICAgICAgICAgICAmJiB0aGlzLmlzQXR0YWNrUmVsZWFzZWQodGltZSlcclxuICAgICAgICAgICAgICAgICYmIHRoaXMuaXNIaXRSZWxlYXNlZCh0aW1lKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNBdHRhY2spIHtcclxuICAgICAgICAgICAgdGhpcy5hdHRhY2soKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uU3RhdGUuaXNNb3ZpbmdGb3J3YXJkID0gdGhpcy5pc1J1bm5pbmcgJiYgKGZyb21OZXR3b3JrIHx8IHRoaXMuaXNBY2NlbGVyYXRpb24oKSk7XHJcblxyXG4gICAgICAgIGlmICghZnJvbU5ldHdvcmsgJiYgdGhpcy5pc1J1bm5pbmcpIHtcclxuICAgICAgICAgICAgY29uc3QgY2hlY2tXYXkgPSAoanVtcEhlaWdodCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeyBwYXJhbXM6IHsgYWNjZWxlcmF0aW9uOiB7IHg6IGR4LCB5OiBkeSwgejogZHogfSB9IH0gPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2tXYXkoZHgsIGR5ICsganVtcEhlaWdodCwgZHopO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5sYXN0UnVuID0gdGltZTtcclxuICAgICAgICAgICAgYWNjZWxlcmF0aW9uLmFkZCh0aGlzLmdldEZvcndhcmQoKS5tdWx0aXBseVNjYWxhcigoc3BlZWQgKiAwLjEpICogKGRlbHRhVGltZSAqIDAuMDYpKSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBpc0p1bXBOZWVkZWQgPSAoXHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzR3JvdW5kZWRcclxuICAgICAgICAgICAgICAgICYmIChhY2NlbGVyYXRpb24ueCB8fCBhY2NlbGVyYXRpb24ueilcclxuICAgICAgICAgICAgICAgICYmIHRpbWUgLSB0aGlzLmxhc3RKdW1wVGltZXN0YW1wID4gdGhpcy5wYXJhbXMuanVtcFRpbWVvdXQgKiAxMDAwXHJcbiAgICAgICAgICAgICAgICAmJiAhY2hlY2tXYXkoMC4xKVxyXG4gICAgICAgICAgICAgICAgJiYgY2hlY2tXYXkoMS41KVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzSnVtcE5lZWRlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0SnVtcFRpbWVzdGFtcCA9IHRpbWU7XHJcbiAgICAgICAgICAgICAgICBhY2NlbGVyYXRpb24ueSArPSAwLjI1O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0ZVRvUG9zaXRpb24ocG9zaXRpb24pIHtcclxuICAgICAgICBjb25zdCB7IG9iamVjdCB9ID0gdGhpcy5wYXJhbXM7XHJcblxyXG4gICAgICAgIGNvbnN0IHJvdGF0aW9uVG9UYXJnZXRSYWRpYW5zID0gTWF0aC5hdGFuMihcclxuICAgICAgICAgICAgcG9zaXRpb24ueCAtIG9iamVjdC5wb3NpdGlvbi54LFxyXG4gICAgICAgICAgICBwb3NpdGlvbi56IC0gb2JqZWN0LnBvc2l0aW9uLnpcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyB0aGlzLmFuaW1hdGlvblN0YXRlLmlzUm90YXRlTGVmdCA9IHJvdGF0aW9uVG9UYXJnZXRSYWRpYW5zIC0gb2JqZWN0LnJvdGF0aW9uLnkgPiAwLjE7XHJcbiAgICAgICAgLy8gdGhpcy5hbmltYXRpb25TdGF0ZS5pc1JvdGF0ZVJpZ2h0ID0gcm90YXRpb25Ub1RhcmdldFJhZGlhbnMgLSBvYmplY3Qucm90YXRpb24ueSA8IC0wLjE7XHJcblxyXG4gICAgICAgIGNvbnN0IHRhcmdldFF1YXRlcm5pb24gPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpO1xyXG4gICAgICAgIHRhcmdldFF1YXRlcm5pb24uc2V0RnJvbUV1bGVyKG9iamVjdC5yb3RhdGlvbi5jbG9uZSgpLnNldCgwLCByb3RhdGlvblRvVGFyZ2V0UmFkaWFucywgMCkpO1xyXG4gICAgICAgIG9iamVjdC5xdWF0ZXJuaW9uLnNsZXJwKHRhcmdldFF1YXRlcm5pb24sIDAuMSk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNBY2NlbGVyYXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgTWF0aC5hYnModGhpcy5wYXJhbXMuYWNjZWxlcmF0aW9uLngpXHJcbiAgICAgICAgICAgICsgTWF0aC5hYnModGhpcy5wYXJhbXMuYWNjZWxlcmF0aW9uLnkpXHJcbiAgICAgICAgICAgICsgTWF0aC5hYnModGhpcy5wYXJhbXMuYWNjZWxlcmF0aW9uLnopXHJcbiAgICAgICAgKSA+IDAuMDE7XHJcbiAgICB9XHJcblxyXG4gICAgaXNSdW5SZWxlYXNlZCh0aW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIHRpbWUgLSB0aGlzLmxhc3RSdW4gPiB0aGlzLnBhcmFtcy5zdGFydFJ1blRpbWVvdXQgKiAxMDAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlzTmV4dFBvaW50VXBkYXRlUmVsZWFzZWQodGltZSkge1xyXG4gICAgICAgIHJldHVybiB0aW1lIC0gdGhpcy5sYXN0TmV4dFBvaW50VXBkYXRlID4gdGhpcy5wYXJhbXMubmV4dFBvaW50VXBkYXRlVGltZW91dCAqIDEwMDA7XHJcbiAgICB9XHJcblxyXG4gICAgaXNVcGRhdGVUYXJnZXRSZWxlYXNlZCh0aW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIHRpbWUgLSB0aGlzLmxhc3RUYXJnZXRVcGRhdGUgPiB0aGlzLnBhcmFtcy51cGRhdGVUYXJnZXRUaW1lb3V0ICogMTAwMDtcclxuICAgIH1cclxuXHJcbiAgICBkYW1hZ2VUYWtlbih7IGRhbWFnZSwgdW5pdDogYXR0YWNrZXIgfSA9IHt9LCB0aW1lKSB7XHJcbiAgICAgICAgc3VwZXIuZGFtYWdlVGFrZW4oeyBkYW1hZ2UsIHVuaXQ6IGF0dGFja2VyIH0sIHRpbWUpO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMucGFyYW1zLnRhcmdldCkge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy50YXJnZXQgPSBhdHRhY2tlcjtcclxuICAgICAgICAgICAgdGhpcy5sYXN0VGFyZ2V0VXBkYXRlID0gdGltZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCAiaW1wb3J0IEZpcmluZ1VuaXQgZnJvbSAnLi9GaXJpbmdVbml0JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllciBleHRlbmRzIEZpcmluZ1VuaXQge1xyXG4gICAgY29uc3RydWN0b3IocGFyYW1zID0ge30pIHtcclxuICAgICAgICBzdXBlcih7XHJcbiAgICAgICAgICAgIHNwZWVkOiAwLjU1LFxyXG4gICAgICAgICAgICBmaXJlVGltZW91dDogMSxcclxuICAgICAgICAgICAgZmlyZURhbWFnZTogMjUsXHJcbiAgICAgICAgICAgIGRhbWFnZTogNTAsXHJcbiAgICAgICAgICAgIGhwOiAxMDAsXHJcbiAgICAgICAgICAgIGV4cGVyaWVuY2U6IDAsXHJcbiAgICAgICAgICAgIHVuc3BlbnRUYWxlbnRzOiAwLFxyXG4gICAgICAgICAgICBtb25leTogNTAwLFxyXG4gICAgICAgICAgICBpc0ZpcmU6IGZhbHNlLFxyXG4gICAgICAgICAgICBsZXZlbDogMSxcclxuICAgICAgICAgICAganVtcFRpbWVvdXQ6IDAuOSxcclxuICAgICAgICAgICAgZnJhY3Rpb246ICdmcmllbmRseScsXHJcbiAgICAgICAgICAgIHNlbnNpdGl2aXR5OiAxLFxyXG4gICAgICAgICAgICB0eXBlOiAncGxheWVyJyxcclxuICAgICAgICAgICAgZXF1aXBwZWRJdGVtczoge30sXHJcbiAgICAgICAgICAgIC4uLnBhcmFtcyxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5sYXN0SnVtcFRpbWVzdGFtcCA9IDA7XHJcbiAgICAgICAgdGhpcy5yb3RhdGlvbkFjY2VsZXJhdGlvbiA9IDA7XHJcblxyXG4gICAgICAgIHBhcmFtcy5vbkxldmVsVXAgJiYgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdvbkxldmVsVXAnLCBwYXJhbXMub25MZXZlbFVwKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUodGltZSwgZGVsdGFUaW1lKSB7XHJcbiAgICAgICAgc3VwZXIudXBkYXRlKHRpbWUsIGRlbHRhVGltZSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzRGVhZCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHsgaW5wdXQsIG9iamVjdCwgYWNjZWxlcmF0aW9uLCBmcm9tTmV0d29yaywgZXF1aXBwZWRJdGVtcyB9ID0gdGhpcy5wYXJhbXM7XHJcblxyXG4gICAgICAgIGFjY2VsZXJhdGlvbi5hZGQodGhpcy5nZXRNb3ZpbmdBY2NlbGVyYXRpb24odGltZSwgZGVsdGFUaW1lKSk7XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5hdHRhY2sxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXR0YWNrKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5wdXQuYXR0YWNrMikge1xyXG4gICAgICAgICAgICB0aGlzLmZpcmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uU3RhdGUuaXNNb3ZpbmdMZWZ0ID0gaW5wdXQuaG9yaXpvbnRhbCA9PT0gLTE7XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25TdGF0ZS5pc01vdmluZ1JpZ2h0ID0gaW5wdXQuaG9yaXpvbnRhbCA9PT0gMTtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvblN0YXRlLmlzTW92aW5nRm9yd2FyZCA9IGlucHV0LnZlcnRpY2FsID09PSAxO1xyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uU3RhdGUuaXNNb3ZpbmdCYWNrd2FyZCA9IGlucHV0LnZlcnRpY2FsID09PSAtMTtcclxuXHJcbiAgICAgICAgaWYgKCFmcm9tTmV0d29yaykge1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQuaXNUaGlyZFBlcnNvbikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlucHV0Lmxvb2suaG9yaXpvbnRhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhvcml6b250YWxMb29rID0gaW5wdXQubG9vay5ob3Jpem9udGFsO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uU3RhdGUuaXNSb3RhdGVMZWZ0ID0gaG9yaXpvbnRhbExvb2sgPCAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uU3RhdGUuaXNSb3RhdGVSaWdodCA9IGhvcml6b250YWxMb29rID4gMDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvdGF0aW9uQWNjZWxlcmF0aW9uICs9ICgtaG9yaXpvbnRhbExvb2sgLyA1MDAwKSAqIGlucHV0Lmxvb2suc2Vuc2l0aXZpdHk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQucmVzZXRIb3Jpem9udGFsTG9vaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IENBTENfUk9UQVRFX1RIUkVTSE9MRCA9IDAuMDAwMDAwMTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnModGhpcy5yb3RhdGlvbkFjY2VsZXJhdGlvbikgPiBDQUxDX1JPVEFURV9USFJFU0hPTEQpIHtcclxuICAgICAgICAgICAgICAgICAgICBvYmplY3Qucm90YXRlT25Xb3JsZEF4aXMobmV3IFRIUkVFLlZlY3RvcjMoMCwgMSwgMCksIHRoaXMucm90YXRpb25BY2NlbGVyYXRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm90YXRpb25BY2NlbGVyYXRpb24gKj0gMC43O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGVsdGFYID0gd2luZG93LmlubmVyV2lkdGggLyAyIC0gaW5wdXQuY3Vyc29yLng7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkZWx0YVkgPSBpbnB1dC5jdXJzb3IueSAtIHdpbmRvdy5pbm5lckhlaWdodCAvIDI7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByb3RhdGlvblkgPSBNYXRoLmF0YW4yKGRlbHRhWSwgZGVsdGFYKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvblN0YXRlLmlzUm90YXRlTGVmdCA9IHJvdGF0aW9uWSA+IG9iamVjdC5yb3RhdGlvbi55O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb25TdGF0ZS5pc1JvdGF0ZVJpZ2h0ID0gcm90YXRpb25ZIDwgb2JqZWN0LnJvdGF0aW9uLnk7XHJcblxyXG4gICAgICAgICAgICAgICAgb2JqZWN0LnJvdGF0aW9uLnNldCgwLCByb3RhdGlvblksIDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5wdXQuaXNEcm9wICYmIGVxdWlwcGVkSXRlbXMubGVmdEhhbmQgJiYgdGhpcy5wYXJhbXMuZHJvcEl0ZW0pIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJhbXMuZHJvcEl0ZW0odGhpcy5wYXJhbXMuZXF1aXBwZWRJdGVtcy5sZWZ0SGFuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldFVuc3BlbnRUYWxlbnRzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcy51bnNwZW50VGFsZW50cztcclxuICAgIH1cclxuXHJcbiAgICBkZWNyZWFzZVVuc3BlbnRUYWxlbnRzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcmFtcy51bnNwZW50VGFsZW50cy0tO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZEV4cGVyaWVuY2UoZXhwZXJpZW5jZSkge1xyXG4gICAgICAgIHRoaXMucGFyYW1zLmV4cGVyaWVuY2UgKz0gZXhwZXJpZW5jZTtcclxuXHJcbiAgICAgICAgY29uc3QgbGV2ZWwgPSB0aGlzLmdldExldmVsKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5sZXZlbCAhPT0gbGV2ZWwpIHtcclxuICAgICAgICAgICAgY29uc3QgbGV2ZWxzVXAgPSBsZXZlbCAtIHRoaXMucGFyYW1zLmxldmVsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5wYXJhbXMubGV2ZWwgPSBsZXZlbDtcclxuICAgICAgICAgICAgdGhpcy5wYXJhbXMudW5zcGVudFRhbGVudHMgKz0gMyAqIGxldmVsc1VwO1xyXG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5ocCA9IHRoaXMucGFyYW1zLmhwTWF4O1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoJ29uTGV2ZWxVcCcsIGxldmVsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RXhwZXJpZW5jZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJhbXMuZXhwZXJpZW5jZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRMZXZlbEV4cGVyaWVuY2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KHRoaXMuZ2V0TGV2ZWwoKSwgMikgKiAxMDA7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TGV2ZWwoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5zcXJ0KHRoaXMucGFyYW1zLmV4cGVyaWVuY2UgLyAxMDApKSArIDE7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TW92aW5nQWNjZWxlcmF0aW9uKHRpbWUsIGRlbHRhVGltZSkge1xyXG4gICAgICAgIGNvbnN0IHsgaW5wdXQ6IHsgaG9yaXpvbnRhbCwgdmVydGljYWwsIGp1bXAgfSB9ID0gdGhpcy5wYXJhbXM7XHJcblxyXG4gICAgICAgIGNvbnN0IHNwZWVkID0gdmVydGljYWwgJiYgaG9yaXpvbnRhbFxyXG4gICAgICAgICAgICA/IHRoaXMucGFyYW1zLnNwZWVkICogMC4xICogMC43ICogKGRlbHRhVGltZSAqIDAuMDYpXHJcbiAgICAgICAgICAgIDogdGhpcy5wYXJhbXMuc3BlZWQgKiAwLjEgKiAoZGVsdGFUaW1lICogMC4wNik7XHJcblxyXG4gICAgICAgIGNvbnN0IGFkZEZvcndhcmQgPSB2ZXJ0aWNhbCA9PT0gMVxyXG4gICAgICAgICAgICA/IHNwZWVkXHJcbiAgICAgICAgICAgIDogKHZlcnRpY2FsID09PSAtMSA/IC1zcGVlZCAqIDAuNiA6IDApO1xyXG5cclxuICAgICAgICBjb25zdCBhZGRTaWRlID0gdmVydGljYWwgPT09IC0xXHJcbiAgICAgICAgICAgID8gKC1ob3Jpem9udGFsICogc3BlZWQgKiAwLjYpXHJcbiAgICAgICAgICAgIDogKC1ob3Jpem9udGFsICogc3BlZWQgKTtcclxuXHJcbiAgICAgICAgY29uc3QgaXNKdW1wID0gQm9vbGVhbihcclxuICAgICAgICAgICAgdGltZSAtIHRoaXMubGFzdEp1bXBUaW1lc3RhbXAgPiB0aGlzLnBhcmFtcy5qdW1wVGltZW91dCAqIDEwMDBcclxuICAgICAgICAgICAgJiYganVtcFxyXG4gICAgICAgICAgICAmJiB0aGlzLmlzR3JvdW5kZWRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoaXNKdW1wKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdEp1bXBUaW1lc3RhbXAgPSB0aW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGlyZWN0aW9uKG5ldyBUSFJFRS5WZWN0b3IzKGFkZFNpZGUsIE51bWJlcihpc0p1bXApICogMC4yNSwgYWRkRm9yd2FyZCkpO1xyXG4gICAgfVxyXG59IiwgImltcG9ydCBVbml0IGZyb20gJy4vVW5pdCc7XHJcbmltcG9ydCBNb3ZpbmdHYW1lT2JqZWN0IGZyb20gJy4vTW92aW5nR2FtZU9iamVjdCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGaXJlIGV4dGVuZHMgTW92aW5nR2FtZU9iamVjdCB7XHJcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKHtcclxuICAgICAgICAgICAgZ3Jhdml0eTogMC4wNSxcclxuICAgICAgICAgICAgc2xpZGVUaHJvdHRsaW5nOiBuZXcgVEhSRUUuVmVjdG9yMygwLjUsIDAuNSwgMC41KSxcclxuICAgICAgICAgICAgdGhyb3R0bGluZzogbmV3IFRIUkVFLlZlY3RvcjMoMSwgMSwgMSksXHJcbiAgICAgICAgICAgIC4uLnBhcmFtcyxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJhbXMuYWNjZWxlcmF0aW9uLmFkZChcclxuICAgICAgICAgICAgdGhpcy5nZXRGb3J3YXJkKCkubXVsdGlwbHlTY2FsYXIodGhpcy5wYXJhbXMuc3BlZWQgKiAwLjEpXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUodGltZSwgZGVsdGFUaW1lKSB7XHJcbiAgICAgICAgc3VwZXIudXBkYXRlKHRpbWUsIGRlbHRhVGltZSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5nZXRDb2xsaXNpb25zKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbGxpc2lvbnMgPSB0aGlzLnBhcmFtcy5nZXRDb2xsaXNpb25zKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgY29sbGlzaW9uc1xyXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoY29sbGlzaW9uR2FtZU9iamVjdCkgPT4gKFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvbkdhbWVPYmplY3QgaW5zdGFuY2VvZiBVbml0XHJcbiAgICAgICAgICAgICAgICAgICAgJiYgY29sbGlzaW9uR2FtZU9iamVjdC5pc0VuZW15KHRoaXMucGFyYW1zLnBhcmVudClcclxuICAgICAgICAgICAgICAgICkpXHJcbiAgICAgICAgICAgICAgICAuZm9yRWFjaChjb2xsaXNpb25HYW1lT2JqZWN0ID0+IChcclxuICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb25HYW1lT2JqZWN0LmRhbWFnZVRha2VuKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGFtYWdlOiB0aGlzLnBhcmFtcy5kYW1hZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaXQ6IHRoaXMucGFyYW1zLnBhcmVudCxcclxuICAgICAgICAgICAgICAgICAgICB9LCB0aW1lKVxyXG4gICAgICAgICAgICAgICAgKSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoY29sbGlzaW9ucy5sZW5ndGggJiYgdGhpcy5wYXJhbXMuZGVzdHJveSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJhbXMuZGVzdHJveSh0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsICJpbXBvcnQgQXV0b0JpbmRNZXRob2RzIGZyb20gJy4vQXV0b0JpbmRNZXRob2RzJztcclxuaW1wb3J0IEFJIGZyb20gJy4vR2FtZU9iamVjdHMvQUknO1xyXG5pbXBvcnQgUGxheWVyIGZyb20gJy4vR2FtZU9iamVjdHMvUGxheWVyJztcclxuaW1wb3J0IEZpcmUgZnJvbSAnLi9HYW1lT2JqZWN0cy9GaXJlJztcclxuaW1wb3J0IFVuaXQgZnJvbSAnLi9HYW1lT2JqZWN0cy9Vbml0JztcclxuaW1wb3J0IEFuaW1hdGVkR2FtZU9iamVjdCBmcm9tICcuL0dhbWVPYmplY3RzL0FuaW1hdGVkR2FtZU9iamVjdCc7XHJcblxyXG5leHBvcnQge1xyXG5cdEFJLFxyXG5cdFBsYXllcixcclxuXHRGaXJlLFxyXG5cdFVuaXQsXHJcblx0QW5pbWF0ZWRHYW1lT2JqZWN0LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZU9iamVjdHNTZXJ2aWNlIGV4dGVuZHMgQXV0b0JpbmRNZXRob2RzIHtcclxuXHQvKipcclxuXHQgKiBAcGFyYW0ge1NjZW5lfSBzY2VuZVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKHNjZW5lKSB7XHJcblx0XHRzdXBlcigpO1xyXG5cdFx0dGhpcy5nYW1lT2JqZWN0cyA9IFtdO1xyXG5cdFx0dGhpcy5uZXh0R2FtZU9iamVjdElkID0gMDtcclxuXHRcdHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSh0aW1lLCBkZWx0YVRpbWUpIHtcclxuXHRcdGNvbnN0IHBsYXllciA9IHRoaXMuc2NlbmUuZ2V0UGxheWVyKCk7XHJcblxyXG5cdFx0dGhpcy5nYW1lT2JqZWN0c1xyXG5cdFx0XHQuZmlsdGVyKGdvID0+IChcclxuXHRcdFx0XHQvLyBQZXJmb3JtYW5jZSBvcHRpbWl6YXRpb25cclxuXHRcdFx0XHR0aGlzLnNjZW5lLmludGVydmFscy5nZXRUaW1lUGFzc2VkKCkgPCAzMDAwMFxyXG5cdFx0XHRcdHx8ICFnby5wYXJhbXMuZnJvbU5ldHdvcmtcclxuXHRcdFx0XHR8fCBnby5wb3NpdGlvbi5kaXN0YW5jZVRvKHBsYXllci5wb3NpdGlvbikgPCAxMDBcclxuXHRcdFx0KSlcclxuXHRcdFx0LmZvckVhY2goZ2FtZU9iamVjdCA9PiBnYW1lT2JqZWN0LnVwZGF0ZSh0aW1lLCBkZWx0YVRpbWUpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEBwYXJhbSB7VW5pdH0gYXR0YWNraW5nVW5pdFxyXG5cdCAqL1xyXG5cdGF0dGFjayhhdHRhY2tpbmdVbml0KSB7XHJcblx0XHRpZiAoYXR0YWNraW5nVW5pdC5pc0RlYWQoKSkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5zY2VuZS5pbnRlcnZhbHMuc2V0VGltZW91dCgoKSA9PiB7XHJcblx0XHRcdGNvbnN0IGdhbWVUaW1lID0gdGhpcy5zY2VuZS5pbnRlcnZhbHMuZ2V0VGltZVBhc3NlZCgpO1xyXG5cclxuXHRcdFx0aWYgKGF0dGFja2luZ1VuaXQuaXNBdHRhY2tJbnRlcnJ1cHRlZChnYW1lVGltZSkpIHtcclxuXHRcdFx0XHRhdHRhY2tpbmdVbml0LnJlbGVhc2VBdHRhY2soZ2FtZVRpbWUpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Y29uc3QgYXR0YWNrZWRVbml0cyA9IHRoaXMuZ2V0VW5pdHMoKS5maWx0ZXIoZ2FtZU9iamVjdCA9PiAoXHJcblx0XHRcdFx0Z2FtZU9iamVjdCAhPT0gYXR0YWNraW5nVW5pdFxyXG5cdFx0XHRcdCYmIGdhbWVPYmplY3QuaXNBbGl2ZSgpXHJcblx0XHRcdFx0JiYgZ2FtZU9iamVjdC5pc0VuZW15KGF0dGFja2luZ1VuaXQpXHJcblx0XHRcdFx0JiYgZ2FtZU9iamVjdC5wb3NpdGlvbi5kaXN0YW5jZVRvKGF0dGFja2luZ1VuaXQucG9zaXRpb24pIDwgMlxyXG5cdFx0XHQpKTtcclxuXHJcblx0XHRcdGF0dGFja2VkVW5pdHMuZm9yRWFjaCgoY29sbGlzaW9uR2FtZU9iamVjdCkgPT4ge1xyXG5cdFx0XHRcdGNvbGxpc2lvbkdhbWVPYmplY3QuZGFtYWdlVGFrZW4oe1xyXG5cdFx0XHRcdFx0ZGFtYWdlOiBhdHRhY2tpbmdVbml0LmdldERhbWFnZSgpLFxyXG5cdFx0XHRcdFx0dW5pdDogYXR0YWNraW5nVW5pdCxcclxuXHRcdFx0XHR9LCBnYW1lVGltZSlcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHQvLyBpZiAoYXR0YWNrZWRVbml0cy5sZW5ndGgpIHtcclxuXHRcdFx0Ly8gICAgIHRoaXMuc2NlbmUuYXVkaW8ucGxheVNvdW5kKGF0dGFja2luZ1VuaXQucG9zaXRpb24sICdBdHRhY2sgU29mdCcpO1xyXG5cdFx0XHQvLyB9XHJcblx0XHR9LCBhdHRhY2tpbmdVbml0LmdldEF0dGFja1RpbWVvdXQoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcGFyYW0ge0ZpcmluZ1VuaXR9IGZpcmluZ0dhbWVPYmplY3RcclxuXHQgKi9cclxuXHRmaXJlKGZpcmluZ0dhbWVPYmplY3QpIHtcclxuXHRcdGlmIChmaXJpbmdHYW1lT2JqZWN0LmlzRGVhZCgpKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRjb25zdCBvYmplY3QzZCA9IHRoaXMuc2NlbmUubW9kZWxzLmNyZWF0ZUdlb21ldHJ5KHtcclxuXHRcdFx0eDogMC4xLFxyXG5cdFx0XHR5OiAwLjEsXHJcblx0XHRcdHo6IDAuMSxcclxuXHRcdFx0ZW1pc3NpdmU6ICcjZmYxMTAwJyxcclxuXHRcdFx0Y29sb3I6IDB4ZmYxMTAwLFxyXG5cdFx0XHRsb2NhbFBvc2l0aW9uOiBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLjEsIDApLFxyXG5cdFx0XHRyb3RhdGlvbjogZmlyaW5nR2FtZU9iamVjdC5nZXRGaXJlSW5pdGlhbFJvdGF0aW9uKCksXHJcblx0XHRcdHBvc2l0aW9uOiBmaXJpbmdHYW1lT2JqZWN0LmdldEZpcmVJbml0aWFsUG9zaXRpb24oKSxcclxuXHRcdFx0Z2VvbWV0cnk6IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgxKSxcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQHR5cGUge0ZpcmV9XHJcblx0XHQgKi9cclxuXHRcdGNvbnN0IGZpcmVHYW1lT2JqZWN0ID0gdGhpcy5ob29rR2FtZU9iamVjdChuZXcgRmlyZSh7XHJcblx0XHRcdG9iamVjdDogb2JqZWN0M2QsXHJcblx0XHRcdHNwZWVkOiBmaXJpbmdHYW1lT2JqZWN0LnBhcmFtcy5maXJlU2hlbGxTcGVlZCxcclxuXHRcdFx0ZGFtYWdlOiBmaXJpbmdHYW1lT2JqZWN0LnBhcmFtcy5maXJlRGFtYWdlLFxyXG5cdFx0XHRwYXJlbnQ6IGZpcmluZ0dhbWVPYmplY3QsXHJcblx0XHRcdGNoZWNrV2F5OiB0aGlzLnNjZW5lLmNvbGxpZGVycy5jaGVja1dheSxcclxuXHRcdFx0Z2V0Q29sbGlzaW9uczogKCkgPT4gdGhpcy5zY2VuZS51bml0c1xyXG5cdFx0XHRcdC5nZXRBbGl2ZVVuaXRzKClcclxuXHRcdFx0XHQuZmlsdGVyKHVuaXQgPT4gKFxyXG5cdFx0XHRcdFx0dW5pdCAhPT0gZmlyZUdhbWVPYmplY3QucGFyYW1zLnBhcmVudFxyXG5cdFx0XHRcdFx0JiYgdW5pdC5pc0VuZW15KGZpcmVHYW1lT2JqZWN0LnBhcmFtcy5wYXJlbnQpXHJcblx0XHRcdFx0XHQmJiBmaXJlR2FtZU9iamVjdC5wb3NpdGlvbi5kaXN0YW5jZVRvKHVuaXQucG9zaXRpb24pIDwgMlxyXG5cdFx0XHRcdCkpLFxyXG5cdFx0XHRkZXN0cm95OiAoKSA9PiB0aGlzLmRlc3Ryb3lHYW1lT2JqZWN0KGZpcmVHYW1lT2JqZWN0KSxcclxuXHRcdH0pKTtcclxuXHJcblx0XHRjb25zdCBwYXJ0aWNsZXNMaWZlVGltZSA9IDAuNTtcclxuXHJcblx0XHRjb25zdCB0ZXh0dXJlTG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcclxuXHJcblx0XHRjb25zdCBwYXJ0aWNsZXNTcGVlZCA9IDAuMDE7XHJcblxyXG5cdFx0Y29uc3QgZmlyZVBhcnRpY2xlcyA9IHRoaXMuc2NlbmUucGFydGljbGVzLmNyZWF0ZUF0dGFjaGVkUGFydGljbGVzKHtcclxuXHRcdFx0c2l6ZTogMS41LFxyXG5cdFx0XHRjb3VudDogMzAsXHJcblx0XHRcdGNvbG9yOiAweGZmMTEwMCxcclxuXHRcdFx0bGlmZVRpbWU6IHBhcnRpY2xlc0xpZmVUaW1lLFxyXG5cdFx0XHRwYXJlbnQ6IGZpcmVHYW1lT2JqZWN0Lm9iamVjdCxcclxuXHRcdFx0dGV4dHVyZTogdGV4dHVyZUxvYWRlci5sb2FkKCcuL2Fzc2V0cy90ZXh0dXJlcy9maXJlLnBuZycpLFxyXG5cdFx0XHRnZXREZWZhdWx0UGFydGljbGVWZWxvY2l0eTogKCkgPT4gbmV3IFRIUkVFLlZlY3RvcjMoXHJcblx0XHRcdFx0TWF0aC5yYW5kb20oKSAqIHBhcnRpY2xlc1NwZWVkIC0gcGFydGljbGVzU3BlZWQgLyAyLFxyXG5cdFx0XHRcdE1hdGgucmFuZG9tKCkgKiBwYXJ0aWNsZXNTcGVlZCAqIDEuNSArIDAuMDIsXHJcblx0XHRcdFx0TWF0aC5yYW5kb20oKSAqIHBhcnRpY2xlc1NwZWVkIC0gcGFydGljbGVzU3BlZWQgLyAyLFxyXG5cdFx0XHQpLFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5zY2VuZS5pbnRlcnZhbHMuc2V0VGltZW91dChcclxuXHRcdFx0KCkgPT4ge1xyXG5cdFx0XHRcdGZpcmVHYW1lT2JqZWN0ICYmIHRoaXMuZGVzdHJveUdhbWVPYmplY3QoZmlyZUdhbWVPYmplY3QpO1xyXG5cdFx0XHRcdGZpcmVQYXJ0aWNsZXMucGF1c2UgPSB0cnVlO1xyXG5cclxuXHRcdFx0XHR0aGlzLnNjZW5lLmludGVydmFscy5zZXRUaW1lb3V0KFxyXG5cdFx0XHRcdFx0KCkgPT4gdGhpcy5zY2VuZS5wYXJ0aWNsZXMuZGVzdHJveShmaXJlUGFydGljbGVzKSxcclxuXHRcdFx0XHRcdHBhcnRpY2xlc0xpZmVUaW1lICogMTUwMCxcclxuXHRcdFx0XHQpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHQyMDAwLFxyXG5cdFx0KTtcclxuXHJcblx0XHQvLyB0aGlzLnNjZW5lLmF1ZGlvLnBsYXlTb3VuZChmaXJpbmdHYW1lT2JqZWN0LnBvc2l0aW9uLCAnTGFzZXJzJyk7XHJcblx0fVxyXG5cclxuXHRjcmVhdGVJdGVtKHtcclxuXHRcdHNjYWxlID0gMS41LFxyXG5cdFx0bW9kZWwgPSAnaXRlbS1oZWFsJyxcclxuXHRcdG5hbWUsXHJcblx0XHR0eXBlLFxyXG5cdFx0ZWZmZWN0cyxcclxuXHRcdHBvc2l0aW9uID0ge30sXHJcblx0XHRib25lTmFtZSxcclxuXHRcdGF0dGFjaE1vZGVsTmFtZSxcclxuXHRcdG9uTG9hZCxcclxuXHRcdGNhblBpY2t1cCxcclxuXHRcdG9uUGlja3VwLFxyXG5cdH0pIHtcclxuXHRcdGNvbnN0IGl0ZW0gPSB7XHJcblx0XHRcdG5hbWUsXHJcblx0XHRcdHR5cGUsXHJcblx0XHRcdGVmZmVjdHMsXHJcblx0XHRcdGJvbmVOYW1lLFxyXG5cdFx0XHRhdHRhY2hNb2RlbE5hbWUsXHJcblx0XHRcdG1vZGVsLFxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLnNjZW5lLm1vZGVscy5sb2FkR0xURih7XHJcblx0XHRcdGJhc2VVcmw6ICcuL2Fzc2V0cy9tb2RlbHMvaXRlbXMvJyArIG1vZGVsLFxyXG5cdFx0XHRub1NjZW5lOiB0cnVlLFxyXG5cdFx0XHRjYWxsYmFjazogbG9hZGVkT2JqZWN0ID0+IHtcclxuXHRcdFx0XHRjb25zdCBwb3NpdGlvblZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKHBvc2l0aW9uLnggfHwgMCwgcG9zaXRpb24ueSB8fCAwLCBwb3NpdGlvbi56IHx8IDApO1xyXG5cclxuXHRcdFx0XHRjb25zdCBvYmplY3QgPSBsb2FkZWRPYmplY3Quc2NlbmU7XHJcblx0XHRcdFx0b2JqZWN0LnNjYWxlLnNldChzY2FsZSwgc2NhbGUsIHNjYWxlKTtcclxuXHJcblx0XHRcdFx0b2JqZWN0LnRyYXZlcnNlKChjaGlsZCkgPT4ge1xyXG5cdFx0XHRcdFx0aWYgKGNoaWxkLmlzTWVzaCkge1xyXG5cdFx0XHRcdFx0XHRjaGlsZC5tYXRlcmlhbC50cmFuc3BhcmVudCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdGNoaWxkLm1hdGVyaWFsLmFscGhhVGVzdCA9IDAuNTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0b2JqZWN0LnBvc2l0aW9uLnNldChwb3NpdGlvblZlY3Rvci54LCBwb3NpdGlvblZlY3Rvci55LCBwb3NpdGlvblZlY3Rvci56KTtcclxuXHJcblx0XHRcdFx0aWYgKG9uTG9hZCkge1xyXG5cdFx0XHRcdFx0b25Mb2FkKG9iamVjdCk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR0aGlzLnNjZW5lLnNjZW5lLmFkZChvYmplY3QpO1xyXG5cclxuXHRcdFx0XHRjb25zdCBnYW1lSXRlbSA9IG5ldyBBbmltYXRlZEdhbWVPYmplY3Qoe1xyXG5cdFx0XHRcdFx0b2JqZWN0LFxyXG5cdFx0XHRcdFx0YW5pbWF0aW9uczogbG9hZGVkT2JqZWN0LmFuaW1hdGlvbnMsXHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdHRoaXMuc2NlbmUuZ2FtZU9iamVjdHNTZXJ2aWNlLmhvb2tHYW1lT2JqZWN0KGdhbWVJdGVtKTtcclxuXHJcblx0XHRcdFx0Y29uc3QgY2hlY2tQaWNrdXAgPSAoKSA9PiB7XHJcblx0XHRcdFx0XHR0aGlzLnNjZW5lLmludGVydmFscy5zZXRUaW1lb3V0KFxyXG5cdFx0XHRcdFx0XHQoKSA9PiB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgZ2V0UHJpb3JpdHkgPSB1bml0ID0+IDEgLyBNYXRoLmNlaWwocG9zaXRpb25WZWN0b3IuZGlzdGFuY2VUbyh1bml0LnBvc2l0aW9uKSk7XHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgbmVhclVuaXRzID0gdGhpcy5zY2VuZS51bml0c1xyXG5cdFx0XHRcdFx0XHRcdFx0LmdldEFsaXZlVW5pdHMoKVxyXG5cdFx0XHRcdFx0XHRcdFx0LmZpbHRlcigodW5pdCkgPT4gKFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRwb3NpdGlvblZlY3Rvci5kaXN0YW5jZVRvKHVuaXQucG9zaXRpb24pIDwgMlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQmJiAoIWNhblBpY2t1cCB8fCBjYW5QaWNrdXAodW5pdCkpXHJcblx0XHRcdFx0XHRcdFx0XHQpKVxyXG5cdFx0XHRcdFx0XHRcdFx0LnNvcnQoKHVuaXRBLCB1bml0QikgPT4gZ2V0UHJpb3JpdHkodW5pdEIpIC0gZ2V0UHJpb3JpdHkodW5pdEEpKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKG5lYXJVbml0cy5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChvblBpY2t1cCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRvblBpY2t1cChuZWFyVW5pdHNbMF0pO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRcdGdhbWVJdGVtLmFuaW1hdGlvblN0YXRlLmlzRGllID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnNjZW5lLmludGVydmFscy5zZXRUaW1lb3V0KFxyXG5cdFx0XHRcdFx0XHRcdFx0XHQoKSA9PiB0aGlzLnNjZW5lLmdhbWVPYmplY3RzU2VydmljZS5kZXN0cm95R2FtZU9iamVjdChnYW1lSXRlbSksXHJcblx0XHRcdFx0XHRcdFx0XHRcdDUwMCxcclxuXHRcdFx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdGNoZWNrUGlja3VwKCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHQxMDAwLFxyXG5cdFx0XHRcdFx0KTtcclxuXHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHRjaGVja1BpY2t1cCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gaXRlbTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZUF0dGFjaGVkSXRlbXModW5pdCkge1xyXG5cdFx0aWYgKCF0aGlzLnNjZW5lLmlzU2VydmVyKSB7XHJcblx0XHRcdE9iamVjdC52YWx1ZXModW5pdC5wYXJhbXMuZXF1aXBwZWRJdGVtcylcclxuXHRcdFx0XHQuZmlsdGVyKGkgPT4gaSlcclxuXHRcdFx0XHQuZm9yRWFjaChlcXVpcHBlZEl0ZW0gPT4ge1xyXG5cdFx0XHRcdFx0aWYgKCF1bml0Ll9hdHRhY2hlZE1vZGVsc1tlcXVpcHBlZEl0ZW0ubmFtZV0pIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5hdHRhY2hJdGVtKHVuaXQsIGVxdWlwcGVkSXRlbSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhdHRhY2hJdGVtKHVuaXQsIGl0ZW0pIHtcclxuXHRcdGxldCBib25lO1xyXG5cclxuXHRcdGNvbnN0IHtcclxuXHRcdFx0Ym9uZU5hbWUsXHJcblx0XHRcdG5hbWU6IGl0ZW1OYW1lLFxyXG5cdFx0XHRhdHRhY2hNb2RlbE5hbWU6IG1vZGVsTmFtZSxcclxuXHRcdH0gPSBpdGVtO1xyXG5cclxuXHRcdHVuaXQuX2F0dGFjaGVkTW9kZWxzW2l0ZW1OYW1lXSA9IHt9O1xyXG5cclxuXHRcdHRoaXMuc2NlbmUubW9kZWxzLmxvYWRHTFRGKHtcclxuXHRcdFx0YmFzZVVybDogJy4vYXNzZXRzL21vZGVscy9pdGVtcy8nICsgbW9kZWxOYW1lLFxyXG5cdFx0XHRub1NjZW5lOiB0cnVlLFxyXG5cdFx0XHRjYWxsYmFjazogKGxvYWRlZE1vZGVsKSA9PiB7XHJcblx0XHRcdFx0Y29uc3QgaXRlbU9iamVjdCA9IGxvYWRlZE1vZGVsLnNjZW5lO1xyXG5cclxuXHRcdFx0XHR1bml0Ll9hdHRhY2hlZE1vZGVsc1tpdGVtTmFtZV0gPSBpdGVtT2JqZWN0O1xyXG5cclxuXHRcdFx0XHR1bml0Lm9iamVjdC50cmF2ZXJzZShvYmplY3QgPT4ge1xyXG5cdFx0XHRcdFx0aWYgKG9iamVjdC5uYW1lID09PSBib25lTmFtZSkge1xyXG5cdFx0XHRcdFx0XHRib25lID0gb2JqZWN0O1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRpZiAoYm9uZSkge1xyXG5cdFx0XHRcdFx0Ym9uZS5hZGQoaXRlbU9iamVjdCk7XHJcblxyXG5cdFx0XHRcdFx0Y29uc3QgbWl4ZXIgPSBuZXcgVEhSRUUuQW5pbWF0aW9uTWl4ZXIoaXRlbU9iamVjdCk7XHJcblx0XHRcdFx0XHRjb25zdCBpZGxlQW5pbWF0aW9uID0gbG9hZGVkTW9kZWwuYW5pbWF0aW9ucy5maW5kKGFuaW1hdGlvbiA9PiBhbmltYXRpb24ubmFtZSA9PT0gJ0lkbGUnKTtcclxuXHRcdFx0XHRcdGNvbnN0IGlkbGVBY3Rpb24gPSBtaXhlci5jbGlwQWN0aW9uKGlkbGVBbmltYXRpb24pO1xyXG5cdFx0XHRcdFx0aWRsZUFjdGlvbi5wbGF5KCk7XHJcblx0XHRcdFx0XHRpdGVtT2JqZWN0Ll9taXhlciA9IG1peGVyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRkcm9wSXRlbSh1bml0LCBpdGVtKSB7XHJcblx0XHRjb25zdCBhdHRhY2hlZCA9IHVuaXQuX2F0dGFjaGVkTW9kZWxzO1xyXG5cdFx0Y29uc3QgZXF1aXBwZWQgPSB1bml0LnBhcmFtcy5lcXVpcHBlZEl0ZW1zO1xyXG5cdFx0Y29uc3QgbGVmdEhhbmQgPSBlcXVpcHBlZC5sZWZ0SGFuZDtcclxuXHJcblx0XHRpZiAobGVmdEhhbmQgPT09IGl0ZW0pIHtcclxuXHRcdFx0Y29uc3Qge1xyXG5cdFx0XHRcdG1vZGVsLFxyXG5cdFx0XHRcdG5hbWUsXHJcblx0XHRcdFx0dHlwZSxcclxuXHRcdFx0XHRib25lTmFtZSxcclxuXHRcdFx0XHRhdHRhY2hNb2RlbE5hbWUsXHJcblx0XHRcdFx0ZWZmZWN0cyxcclxuXHRcdFx0fSA9IGl0ZW07XHJcblxyXG5cdFx0XHRlcXVpcHBlZC5sZWZ0SGFuZCA9IG51bGw7XHJcblxyXG5cdFx0XHR0aGlzLmNyZWF0ZVdlYXBvbkl0ZW0oe1xyXG5cdFx0XHRcdG1vZGVsLFxyXG5cdFx0XHRcdG5hbWUsXHJcblx0XHRcdFx0dHlwZSxcclxuXHRcdFx0XHRib25lTmFtZSxcclxuXHRcdFx0XHRhdHRhY2hNb2RlbE5hbWUsXHJcblx0XHRcdFx0ZWZmZWN0cyxcclxuXHRcdFx0XHRwb3NpdGlvbjogdW5pdC5wb3NpdGlvbi5jbG9uZSgpXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0Y29uc3QgYXR0YWNoZWRNb2RlbCA9IGF0dGFjaGVkW2l0ZW0ubmFtZV07XHJcblxyXG5cdFx0XHRpZiAoYXR0YWNoZWRNb2RlbCkge1xyXG5cdFx0XHRcdGNvbnN0IHBhcmVudCA9IGF0dGFjaGVkTW9kZWwgJiYgYXR0YWNoZWRNb2RlbC5wYXJlbnQ7XHJcblxyXG5cdFx0XHRcdGlmIChwYXJlbnQgJiYgcGFyZW50LnJlbW92ZSkge1xyXG5cdFx0XHRcdFx0cGFyZW50LnJlbW92ZShhdHRhY2hlZE1vZGVsKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignQ2Fubm90IGZpbmQgb2JqZWN0IHBhcmVudCBvZiBhdHRhY2hlZCBpdGVtIHRvIHJlbW92ZSB0aGUgb2JqZWN0JywgYXR0YWNoZWRNb2RlbCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRjcmVhdGVXZWFwb25JdGVtKHtcclxuXHRcdG1vZGVsLFxyXG5cdFx0bmFtZSxcclxuXHRcdHR5cGUsXHJcblx0XHRib25lTmFtZSxcclxuXHRcdGF0dGFjaE1vZGVsTmFtZSxcclxuXHRcdGVmZmVjdHMsXHJcblx0XHRwb3NpdGlvbixcclxuXHRcdG9uUGlja3VwLFxyXG5cdH0pIHtcclxuXHRcdGNvbnN0IF9jYW5QaWNrdXAgPSAocGlja2luZ1VuaXQpID0+IHtcclxuXHRcdFx0Y29uc3QgeyBlcXVpcHBlZEl0ZW1zIH0gPSBwaWNraW5nVW5pdC5wYXJhbXM7XHJcblxyXG5cdFx0XHRpZiAocGlja2luZ1VuaXQgPT09IHRoaXMuc2NlbmUuZ2V0UGxheWVyKCkpIHtcclxuXHRcdFx0XHRpZiAoIWVxdWlwcGVkSXRlbXMubGVmdEhhbmQpIHtcclxuXHRcdFx0XHRcdHRoaXMuc2NlbmUubm90aWZ5KCdQcmVzcyBhbmQgSG9sZCBcXCdFXFwnIHRvIHBpY2t1cCBcXCcnICsgaXRlbS5uYW1lICsgJ1xcJycsIDEwMDApO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR0aGlzLnNjZW5lLm5vdGlmeSgnUHJlc3MgXFwnR1xcJyB0byBkcm9wIHlvdXIgXFwnJyArIGVxdWlwcGVkSXRlbXMubGVmdEhhbmQubmFtZSArICdcXCcgZmlyc3QgYW5kIHRoZW4geW91IGNhbiBwaWNrIHVwIFxcJycgKyBpdGVtLm5hbWUgKyAnXFwnJywgMTAwMCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoZXF1aXBwZWRJdGVtcy5sZWZ0SGFuZCkge1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKHBpY2tpbmdVbml0IGluc3RhbmNlb2YgUGxheWVyKSB7XHJcblx0XHRcdFx0cmV0dXJuIHBpY2tpbmdVbml0LnBhcmFtcy5pbnB1dCAmJiBwaWNraW5nVW5pdC5wYXJhbXMuaW5wdXQuaXNBY3Rpb247XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdFx0Y29uc3QgX29uUGlja3VwID0gKHBpY2tpbmdVbml0KSA9PiB7XHJcblx0XHRcdGNvbnN0IHsgZXF1aXBwZWRJdGVtcyB9ID0gcGlja2luZ1VuaXQucGFyYW1zO1xyXG5cclxuXHRcdFx0ZXF1aXBwZWRJdGVtcy5sZWZ0SGFuZCA9IGl0ZW07XHJcblx0XHRcdHRoaXMuc2NlbmUuZ2FtZU9iamVjdHNTZXJ2aWNlLmF0dGFjaEl0ZW0ocGlja2luZ1VuaXQsIGl0ZW0pO1xyXG5cclxuXHRcdFx0aWYgKHBpY2tpbmdVbml0ID09PSB0aGlzLnNjZW5lLmdldFBsYXllcigpKSB7XHJcblx0XHRcdFx0dGhpcy5zY2VuZS5ub3RpZnkoJ1ByZXNzIFxcJ0dcXCcgaWYgeW91IG5lZWQgdG8gZHJvcCBcXCcnICsgaXRlbS5uYW1lICsgJ1xcJycpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAob25QaWNrdXApIHtcclxuXHRcdFx0XHRvblBpY2t1cChwaWNraW5nVW5pdCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdFx0Y29uc3QgaXRlbSA9IHRoaXMuc2NlbmUuZ2FtZU9iamVjdHNTZXJ2aWNlLmNyZWF0ZUl0ZW0oe1xyXG5cdFx0XHRtb2RlbCxcclxuXHRcdFx0bmFtZSxcclxuXHRcdFx0dHlwZSxcclxuXHRcdFx0Ym9uZU5hbWUsXHJcblx0XHRcdGF0dGFjaE1vZGVsTmFtZSxcclxuXHRcdFx0ZWZmZWN0cyxcclxuXHRcdFx0cG9zaXRpb24sXHJcblx0XHRcdGNhblBpY2t1cDogX2NhblBpY2t1cCxcclxuXHRcdFx0b25QaWNrdXA6IF9vblBpY2t1cCxcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHBhcmFtIHtHYW1lT2JqZWN0fSBnYW1lT2JqZWN0XHJcblx0ICovXHJcblx0aG9va0dhbWVPYmplY3QoZ2FtZU9iamVjdCkge1xyXG5cdFx0dGhpcy5nYW1lT2JqZWN0cy5wdXNoKGdhbWVPYmplY3QpO1xyXG5cdFx0Z2FtZU9iamVjdC5fX2dhbWVfb2JqZWN0X2lkID0gdGhpcy5uZXh0R2FtZU9iamVjdElkKys7XHJcblxyXG5cdFx0cmV0dXJuIGdhbWVPYmplY3Q7XHJcblx0fVxyXG5cclxuXHRyZW1vdmVBbGwoKSB7XHJcblx0XHR3aGlsZSAodGhpcy5nYW1lT2JqZWN0cy5sZW5ndGgpIHtcclxuXHRcdFx0dGhpcy5kZXN0cm95R2FtZU9iamVjdCh0aGlzLmdhbWVPYmplY3RzWzBdKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJlbW92ZUFsbEV4Y2VwdFBsYXllcigpIHtcclxuXHRcdGNvbnN0IGdldE5leHROb25QbGF5ZXJJbmRleCA9ICgpID0+IHRoaXMuZ2FtZU9iamVjdHMuZmluZEluZGV4KGdvID0+IGdvICE9PSB0aGlzLnNjZW5lLmdldFBsYXllcigpKTtcclxuXHRcdGxldCByZW1vdmVJZHggPSBnZXROZXh0Tm9uUGxheWVySW5kZXgoKTtcclxuXHJcblx0XHR3aGlsZSAocmVtb3ZlSWR4ID4gLTEpIHtcclxuXHRcdFx0Y29uc3QgZ2FtZU9iamVjdCA9IHRoaXMuZ2FtZU9iamVjdHNbcmVtb3ZlSWR4XTtcclxuXHRcdFx0dGhpcy5nYW1lT2JqZWN0cy5zcGxpY2UocmVtb3ZlSWR4LCAxKTtcclxuXHJcblx0XHRcdHRoaXMuX3JlbW92ZUdhbWVPYmplY3RGcm9tU2NlbmUoZ2FtZU9iamVjdCk7XHJcblxyXG5cdFx0XHRyZW1vdmVJZHggPSBnZXROZXh0Tm9uUGxheWVySW5kZXgoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEBwYXJhbSB7R2FtZU9iamVjdH0gZ2FtZU9iamVjdFxyXG5cdCAqL1xyXG5cdGRlc3Ryb3lHYW1lT2JqZWN0KGdhbWVPYmplY3QpIHtcclxuXHRcdGNvbnN0IGluZGV4ID0gdGhpcy5nYW1lT2JqZWN0cy5pbmRleE9mKGdhbWVPYmplY3QpO1xyXG5cclxuXHRcdGlmIChpbmRleCA+IC0xKSB7XHJcblx0XHRcdHRoaXMuZ2FtZU9iamVjdHMuc3BsaWNlKGluZGV4LCAxKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9yZW1vdmVHYW1lT2JqZWN0RnJvbVNjZW5lKGdhbWVPYmplY3QpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHBhcmFtIHtHYW1lT2JqZWN0fSBnYW1lT2JqZWN0XHJcblx0ICovXHJcblx0X3JlbW92ZUdhbWVPYmplY3RGcm9tU2NlbmUoZ2FtZU9iamVjdCkge1xyXG5cdFx0Y29uc3QgcGFyZW50ID0gKGdhbWVPYmplY3Qub2JqZWN0ICYmIGdhbWVPYmplY3Qub2JqZWN0LnBhcmVudCkgfHwgdGhpcy5zY2VuZTtcclxuXHJcblx0XHRpZiAoZ2FtZU9iamVjdC5fX3VuaXRfaHBfYmFyKSB7XHJcblx0XHRcdGdhbWVPYmplY3QuX191bml0X2hwX2Jhci5yZW1vdmUoKTtcclxuXHRcdFx0Z2FtZU9iamVjdC5fX3VuaXRfaHBfYmFyID0gbnVsbDtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAocGFyZW50LnJlbW92ZSkge1xyXG5cdFx0XHRwYXJlbnQucmVtb3ZlKGdhbWVPYmplY3Qub2JqZWN0KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCBmaW5kIG9iamVjdCBwYXJlbnQgdG8gcmVtb3ZlIHRoZSBvYmplY3QnLCBnYW1lT2JqZWN0KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGdldFVuaXRzKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2FtZU9iamVjdHMuZmlsdGVyKGdvID0+IGdvIGluc3RhbmNlb2YgVW5pdCk7XHJcblx0fVxyXG59XHJcblxyXG4iLCAiaW1wb3J0IEF1dG9CaW5kTWV0aG9kcyBmcm9tICcuL0F1dG9CaW5kTWV0aG9kcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDYW1lcmEgZXh0ZW5kcyBBdXRvQmluZE1ldGhvZHMge1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge1NjZW5lfSBzY2VuZVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgICAgIGNvbnN0IHJhdGlvID0gdGhpcy5nZXRXaWR0aCgpIC8gdGhpcy5nZXRIZWlnaHQoKTtcclxuICAgICAgICB0aGlzLmNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg0NSwgcmF0aW8sIDEsIDMwMCk7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEucG9zaXRpb24uc2V0KDUsIDMsIDE1KTtcclxuICAgICAgICB0aGlzLmRlbHRhWSA9IDEwO1xyXG4gICAgICAgIHRoaXMucm90YXRlWSA9IDAuMjU7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0RGlzdGFuY2UgPSAxMDtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlID0gdGhpcy5kZWZhdWx0RGlzdGFuY2U7XHJcbiAgICAgICAgdGhpcy5yYXljYXN0ZXIgPSBuZXcgVEhSRUUuUmF5Y2FzdGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGdhbWVUaW1lLCBkZWx0YVRpbWUpIHtcclxuICAgICAgICBjb25zdCB7IHNjZW5lOiB7IGlucHV0IH0gfSA9IHRoaXM7XHJcbiAgICAgICAgY29uc3QgcGxheWVyID0gdGhpcy5zY2VuZS5nZXRQbGF5ZXIoKTtcclxuXHJcbiAgICAgICAgaWYgKCFwbGF5ZXIpIHJldHVybjtcclxuICAgIFxyXG4gICAgICAgIC8vIEVuYWJsZWQgaWYgXCJGXCIgaXMgcHJlc3NlZFxyXG4gICAgICAgIGlmIChpbnB1dC5sb29rLmNpbmVtYXRpYykge1xyXG4gICAgICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi5zZXQoLTQwLCAxNSwgMTApO1xyXG4gICAgICAgICAgICB0aGlzLmNhbWVyYS5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoLTUwLCAwLCAwKSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICBjb25zdCByb3RhdGVZID0gdGhpcy5yb3RhdGVZICsgKGlucHV0Lmxvb2suc2Vuc2l0aXZpdHkgKiBpbnB1dC5sb29rLnZlcnRpY2FsIC8gMjAwMCk7XHJcblxyXG4gICAgICAgIGlmIChyb3RhdGVZID4gLTAuNzUgJiYgcm90YXRlWSA8IDEuMjUpIHtcclxuICAgICAgICAgICAgdGhpcy5yb3RhdGVZID0gcm90YXRlWTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5pc1RoaXJkUGVyc29uKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVGhpcmRQZXJzb24ocGxheWVyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi5jb3B5KFxyXG4gICAgICAgICAgICAgICAgcGxheWVyLnBvc2l0aW9uLmNsb25lKClcclxuICAgICAgICAgICAgICAgICAgICAuYWRkKG5ldyBUSFJFRS5WZWN0b3IzKDcuNSwgdGhpcy5kZWx0YVksIDApKVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jYW1lcmEubG9va0F0KHBsYXllci5wb3NpdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFkZFkoeSkge1xyXG4gICAgICAgIGlmICh0aGlzLmRlbHRhWSArIHkgPiAxICYmIHRoaXMuZGVsdGFZICsgeSA8IDI1KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsdGFZICs9IHk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldFdpZHRoKCkge1xyXG4gICAgICAgIGNvbnN0IHJlbmRlcmVyID0gdGhpcy5zY2VuZS5yZW5kZXJlci5yZW5kZXJlcjtcclxuICAgICAgICBjb25zdCBjYW52YXMgPSByZW5kZXJlci5nZXRDb250ZXh0KCkuY2FudmFzO1xyXG4gICAgICAgIHJldHVybiBjYW52YXMgPyBjYW52YXMud2lkdGggOiAxO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEhlaWdodCgpIHtcclxuICAgICAgICBjb25zdCByZW5kZXJlciA9IHRoaXMuc2NlbmUucmVuZGVyZXIucmVuZGVyZXI7XHJcbiAgICAgICAgY29uc3QgY2FudmFzID0gcmVuZGVyZXIuZ2V0Q29udGV4dCgpLmNhbnZhcztcclxuICAgICAgICByZXR1cm4gY2FudmFzID8gY2FudmFzLmhlaWdodCA6IDE7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlVGhpcmRQZXJzb24ocGxheWVyKSB7XHJcbiAgICAgICAgY29uc3QgeyBzY2VuZTogeyBzY2VuZTogeyBjaGlsZHJlbiB9IH0sIGRlbHRhWSB9ID0gdGhpcyxcclxuICAgICAgICAgICAgcGxheWVySGVhZFBvc2l0aW9uID0gcGxheWVyLnBvc2l0aW9uLmNsb25lKCkuYWRkKG5ldyBUSFJFRS5WZWN0b3IzKDAsIDEuNSwgMCkpLFxyXG4gICAgICAgICAgICBvcmlnaW4gPSBwbGF5ZXJIZWFkUG9zaXRpb24sXHJcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uID0gdGhpcy5jYW1lcmEucG9zaXRpb24sXHJcbiAgICAgICAgICAgIGRpcmVjdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGdldENoaWxkcmVuRmxhdCA9IG9iamVjdHMgPT4gW10uY29uY2F0KC4uLm9iamVjdHMubWFwKFxyXG4gICAgICAgICAgICBvYmogPT4gb2JqLmNoaWxkcmVuXHJcbiAgICAgICAgICAgICAgICA/IFtvYmosIC4uLmdldENoaWxkcmVuRmxhdChvYmouY2hpbGRyZW4pXVxyXG4gICAgICAgICAgICAgICAgOiBbb2JqXVxyXG4gICAgICAgICkpO1xyXG5cclxuICAgICAgICBjb25zdCBlbnZpcm9ubWVudCA9IFtjaGlsZHJlbi5maW5kKGMgPT4gYy5uYW1lID09PSAnTEVWRUxfRU5WSVJPTk1FTlQnKV07XHJcbiAgICAgICAgY29uc3QgZmxhdENoaWxkcmVuTWVzaGVzID0gZ2V0Q2hpbGRyZW5GbGF0KGVudmlyb25tZW50KS5maWx0ZXIob2JqID0+IG9iai50eXBlID09PSAnTWVzaCcpO1xyXG5cclxuICAgICAgICB0aGlzLnJheWNhc3Rlci5zZXQob3JpZ2luLCBkaXJlY3Rpb24uc3ViVmVjdG9ycyhkZXN0aW5hdGlvbiwgb3JpZ2luKS5ub3JtYWxpemUoKSk7XHJcbiAgICAgICAgdGhpcy5yYXljYXN0ZXIuZmFyID0gZGVsdGFZICogMS41O1xyXG4gICAgICAgIGNvbnN0IGludGVyc2VjdHMgPSB0aGlzLnJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKGZsYXRDaGlsZHJlbk1lc2hlcyk7XHJcblxyXG4gICAgICAgIGxldCBkaXN0YW5jZSA9IE1hdGgubWluKGRlbHRhWSwgLi4uaW50ZXJzZWN0cy5tYXAoaSA9PiBpLmRpc3RhbmNlIC0gdGhpcy5kaXN0YW5jZSAqIDAuNSkpO1xyXG4gICAgICAgIHRoaXMuZGlzdGFuY2UgKz0gKGRpc3RhbmNlIC0gdGhpcy5kaXN0YW5jZSkgLyAyO1xyXG5cclxuICAgICAgICBjb25zdCBwbGF5ZXJGb3J3YXJkID0gcGxheWVyLmdldEZvcndhcmQoKS5tdWx0aXBseVNjYWxhcih0aGlzLnNjZW5lLmlucHV0Lmxvb2suYmFjayA/IDEgOiAtMSk7XHJcblxyXG4gICAgICAgIHBsYXllckZvcndhcmQueSA9IHRoaXMucm90YXRlWTtcclxuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi5jb3B5KHBsYXllckhlYWRQb3NpdGlvbi5jbG9uZSgpLmFkZChwbGF5ZXJGb3J3YXJkKSk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FtZXJhLmxvb2tBdChwbGF5ZXJIZWFkUG9zaXRpb24pO1xyXG5cclxuICAgICAgICBjb25zdCBjYW1lcmFGb3J3YXJkID0gbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgLTEpO1xyXG4gICAgICAgIGNhbWVyYUZvcndhcmQuYXBwbHlRdWF0ZXJuaW9uKHRoaXMuY2FtZXJhLnF1YXRlcm5pb24pO1xyXG5cclxuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi5zdWIoY2FtZXJhRm9yd2FyZC5tdWx0aXBseVNjYWxhcih0aGlzLmRpc3RhbmNlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgdG9TY3JlZW5Qb3NpdGlvbihwb3NpdGlvbikge1xyXG4gICAgICAgIGNvbnN0IHdpZHRoSGFsZiA9IDAuNSAqIHRoaXMuZ2V0V2lkdGgoKTtcclxuICAgICAgICBjb25zdCBoZWlnaHRIYWxmID0gMC41ICogdGhpcy5nZXRIZWlnaHQoKTtcclxuICAgICAgICBjb25zdCBjb3BpZWRQcm9qZWN0VmVjdG9yID0gcG9zaXRpb24uY2xvbmUoKS5wcm9qZWN0KHRoaXMuY2FtZXJhKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgeDogTWF0aC5yb3VuZCgoY29waWVkUHJvamVjdFZlY3Rvci54ICsgMSkgKiB3aWR0aEhhbGYpLFxyXG4gICAgICAgICAgICB5OiBNYXRoLnJvdW5kKCgtY29waWVkUHJvamVjdFZlY3Rvci55ICsgMSkgKiBoZWlnaHRIYWxmKSxcclxuICAgICAgICAgICAgejogY29waWVkUHJvamVjdFZlY3Rvci56XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwgImV4cG9ydCBjb25zdCB1bml0VG9OZXR3b3JrID0gKHVuaXQsIGNvbm5lY3Rpb25JZCwgbG9jYXRpb25OYW1lKSA9PiB7XHJcbiAgIGlmICh1bml0KSB7XHJcbiAgICAgIGNvbnN0IHVuaXRSb3RhdGlvbiA9IHVuaXQub2JqZWN0LnJvdGF0aW9uLnRvVmVjdG9yMygpO1xyXG5cclxuICAgICAgaWYgKCF1bml0LnBhcmFtcy51bml0TmV0d29ya0lkKSB7XHJcbiAgICAgICAgIGNvbnN0IGdldFJhbmRvbVN0cmluZyA9ICgpID0+IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyKTtcclxuICAgICAgICAgdW5pdC5wYXJhbXMudW5pdE5ldHdvcmtJZCA9IGdldFJhbmRvbVN0cmluZygpICsgZ2V0UmFuZG9tU3RyaW5nKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHVuaXROZXR3b3JrSWQgPSB1bml0LnBhcmFtcy51bml0TmV0d29ya0lkO1xyXG4gICAgICBjb25zdCB7XHJcbiAgICAgICAgIGlzUnVubmluZyxcclxuICAgICAgICAgaXNBdHRhY2ssXHJcbiAgICAgIH0gPSB1bml0O1xyXG4gICAgICBjb25zdCB7XHJcbiAgICAgICAgIGhwLFxyXG4gICAgICAgICBocE1heCxcclxuICAgICAgICAgYWNjZWxlcmF0aW9uLFxyXG4gICAgICAgICBkYW1hZ2UsXHJcbiAgICAgICAgIGZpcmVEYW1hZ2UsXHJcbiAgICAgICAgIGxldmVsLFxyXG4gICAgICAgICBleHBlcmllbmNlLFxyXG4gICAgICAgICBmcmFjdGlvbixcclxuICAgICAgICAgbmFtZSxcclxuICAgICAgICAgc3BlZWQsXHJcbiAgICAgICAgIHVuc3BlbnRUYWxlbnRzLFxyXG4gICAgICAgICBtb25leSxcclxuICAgICAgICAgZXF1aXBwZWRJdGVtcyxcclxuICAgICAgICAgbG9vdCxcclxuICAgICAgfSA9IHVuaXQucGFyYW1zO1xyXG5cclxuICAgICAgY29uc3Qge1xyXG4gICAgICAgICB2ZXJ0aWNhbCxcclxuICAgICAgICAgaG9yaXpvbnRhbCxcclxuICAgICAgICAgYXR0YWNrMSxcclxuICAgICAgICAgYXR0YWNrMixcclxuICAgICAgICAgaXNEcm9wLFxyXG4gICAgICAgICBpc0FjdGlvbixcclxuICAgICAgfSA9IHVuaXQucGFyYW1zLmlucHV0IHx8IHt9O1xyXG5cclxuICAgICAgY29uc3QgdmVjdG9yVG9PYmplY3QgPSAodmVjdG9yLCBlcHMgPSAxMDAwKSA9PiAoe1xyXG4gICAgICAgICB4OiBNYXRoLnJvdW5kKHZlY3Rvci54ICogZXBzKSAvIGVwcyxcclxuICAgICAgICAgeTogTWF0aC5yb3VuZCh2ZWN0b3IueSAqIGVwcykgLyBlcHMsXHJcbiAgICAgICAgIHo6IE1hdGgucm91bmQodmVjdG9yLnogKiBlcHMpIC8gZXBzLFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnN0IGlzUG9zdHBvbmVkQXR0YWNrID0gdW5pdC5wYXJhbXMuX19uZXR3b3JrX2xhc3Rfc2VudF9hdHRhY2sxIDwgdW5pdC5sYXRlc3RBdHRhY2tUaW1lc3RhbXA7XHJcbiAgICAgIGNvbnN0IGlzUG9zdHBvbmVkRmlyZSA9IHR5cGVvZiB1bml0LnBhcmFtcy5fX25ldHdvcmtfbGFzdF9zZW50X2F0dGFjazIgPT09ICdudW1iZXInICYmIHVuaXQucGFyYW1zLl9fbmV0d29ya19sYXN0X3NlbnRfYXR0YWNrMiA8IHVuaXQubGF0ZXN0RmlyZTtcclxuXHJcbiAgICAgIHVuaXQucGFyYW1zLl9fbmV0d29ya19sYXN0X3NlbnRfYXR0YWNrMSA9IHVuaXQubGF0ZXN0QXR0YWNrVGltZXN0YW1wO1xyXG4gICAgICB1bml0LnBhcmFtcy5fX25ldHdvcmtfbGFzdF9zZW50X2F0dGFjazIgPSB1bml0LmxhdGVzdEZpcmU7XHJcblxyXG4gICAgICByZXR1cm4gKHtcclxuICAgICAgICAgdHlwZTogdW5pdC5wYXJhbXMudHlwZSxcclxuICAgICAgICAgbG9jYXRpb25OYW1lLFxyXG4gICAgICAgICBhbmltYXRpb25TdGF0ZTogdW5pdC5hbmltYXRpb25TdGF0ZSxcclxuICAgICAgICAgaXNSdW5uaW5nLFxyXG4gICAgICAgICBpc0F0dGFjayxcclxuICAgICAgICAgcG9zaXRpb246IHZlY3RvclRvT2JqZWN0KHVuaXQucG9zaXRpb24pLFxyXG4gICAgICAgICByb3RhdGlvbjogdmVjdG9yVG9PYmplY3QodW5pdFJvdGF0aW9uKSxcclxuICAgICAgICAgc2NhbGU6IHZlY3RvclRvT2JqZWN0KHVuaXQub2JqZWN0LnNjYWxlKSxcclxuICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgIGNvbm5lY3Rpb25JZCxcclxuICAgICAgICAgICAgdW5pdE5ldHdvcmtJZCxcclxuICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgaHAsXHJcbiAgICAgICAgICAgIGhwTWF4LFxyXG4gICAgICAgICAgICBmcmFjdGlvbixcclxuICAgICAgICAgICAgZGFtYWdlLFxyXG4gICAgICAgICAgICBmaXJlRGFtYWdlLFxyXG4gICAgICAgICAgICBsZXZlbCxcclxuICAgICAgICAgICAgZXhwZXJpZW5jZSxcclxuICAgICAgICAgICAgc3BlZWQsXHJcbiAgICAgICAgICAgIG1vbmV5LFxyXG4gICAgICAgICAgICB1bnNwZW50VGFsZW50cyxcclxuICAgICAgICAgICAgZXF1aXBwZWRJdGVtcyxcclxuICAgICAgICAgICAgYWNjZWxlcmF0aW9uOiB2ZWN0b3JUb09iamVjdChhY2NlbGVyYXRpb24pLFxyXG4gICAgICAgICAgICBsb290LFxyXG4gICAgICAgICAgICBpbnB1dDoge1xyXG4gICAgICAgICAgICAgICB2ZXJ0aWNhbCwgaG9yaXpvbnRhbCxcclxuICAgICAgICAgICAgICAgYXR0YWNrMTogYXR0YWNrMSB8fCBpc1Bvc3Rwb25lZEF0dGFjayxcclxuICAgICAgICAgICAgICAgYXR0YWNrMjogYXR0YWNrMiB8fCBpc1Bvc3Rwb25lZEZpcmUsXHJcbiAgICAgICAgICAgICAgIGlzRHJvcCxcclxuICAgICAgICAgICAgICAgaXNBY3Rpb24sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG4gICB9XHJcbn1cclxuIiwgImltcG9ydCBBdXRvQmluZE1ldGhvZHMgZnJvbSAnLi9BdXRvQmluZE1ldGhvZHMnO1xyXG5pbXBvcnQgeyBQbGF5ZXIsIEFJIH0gZnJvbSAnLi9HYW1lT2JqZWN0cyc7XHJcbmltcG9ydCB7IHVuaXRUb05ldHdvcmsgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL1VuaXRzXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25uZWN0aW9uIGV4dGVuZHMgQXV0b0JpbmRNZXRob2RzIHtcclxuXHQvKipcclxuXHQgKiBAcGFyYW0ge1NjZW5lfSBzY2VuZVxyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gaXBcclxuXHQgKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IHBvcnRcclxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IGlzU2VjdXJlXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3Ioc2NlbmUsIGlwID0gJ2xvY2FsaG9zdCcsIHBvcnQgPSAnMTMzNycsIGlzU2VjdXJlID0gdHJ1ZSkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuXHRcdHRoaXMubWV0YSA9IHt9O1xyXG5cdFx0dGhpcy5uZXR3b3JrUGxheWVycyA9IHt9O1xyXG5cdFx0dGhpcy5uZXR3b3JrQUlzID0ge307XHJcblxyXG5cdFx0dGhpcy5sYXN0UmVxdWVzdEF0ID0gRGF0ZS5ub3coKTtcclxuXHRcdHRoaXMucGluZyA9IDA7XHJcblxyXG5cdFx0Y29uc3QgV2ViU29ja2V0ID0gd2luZG93LldlYlNvY2tldCB8fCB3aW5kb3cuTW96V2ViU29ja2V0O1xyXG5cclxuXHRcdHRoaXMuY29ubmVjdGlvbiA9IG5ldyBXZWJTb2NrZXQoYCR7aXNTZWN1cmUgPyAnd3NzJyA6ICd3cyd9Oi8vJHtpcH06JHtwb3J0fWApO1xyXG5cdFx0dGhpcy5jb25uZWN0aW9uLm9ub3BlbiA9ICgpID0+IGNvbnNvbGUubG9nKCdvcGVuIGNvbm5lY3Rpb24nKTtcclxuXHRcdHRoaXMuY29ubmVjdGlvbi5vbmVycm9yID0gKGVycm9yKSA9PiBjb25zb2xlLmxvZygnZXJyb3IgY29ubmVjdGlvbicsIGVycm9yKTtcclxuXHRcdHRoaXMuY29ubmVjdGlvbi5vbm1lc3NhZ2UgPSB0aGlzLm9uTWVzc2FnZTtcclxuXHJcblx0XHR0aGlzLnNjZW5lLmludGVydmFscy5zZXRJbnRlcnZhbCgoKSA9PiB7XHJcblx0XHRcdHRoaXMuc2VuZEdhbWVPYmplY3RzKCk7XHJcblx0XHRcdHRoaXMubGFzdFJlcXVlc3RBdCA9IERhdGUubm93KCk7XHJcblx0XHR9LCAxMDApO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlKCkge31cclxuXHJcblx0b25NZXNzYWdlKHsgZGF0YSB9KSB7XHJcblx0XHQvKipcclxuXHRcdCAqIEBwYXJhbSB7b2JqZWN0fSBtZXRhXHJcblx0XHQgKiBAcGFyYW0ge2FueX0gcmVzcG9uc2VcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlVHlwZVxyXG5cdFx0ICovXHJcblx0XHRjb25zdCB7IG1ldGEsIGRhdGE6IHJlc3BvbnNlLCBtZXNzYWdlVHlwZSB9ID0gSlNPTi5wYXJzZShkYXRhKTtcclxuXHJcblx0XHRpZiAobWV0YS5yb2xlICYmIHRoaXMubWV0YS5yb2xlICE9PSBtZXRhLnJvbGUpIHtcclxuXHRcdFx0dGhpcy5zY2VuZS51aS5zZXRDb25uZWN0aW9uUm9sZShtZXRhLnJvbGUpO1xyXG5cclxuXHRcdFx0aWYgKHRoaXMubWV0YS5yb2xlICYmIG1ldGEucm9sZSA9PT0gJ2hvc3QnKSB7XHJcblx0XHRcdFx0dGhpcy5ob3N0VW5pdHNGcm9tTmV0d29yaygpO1xyXG5cdFx0XHR9IGVsc2UgaWYgKCF0aGlzLm1ldGEuZGVidWcpIHtcclxuXHRcdFx0XHR0aGlzLmNsZWFyTG9jYWxVbml0cygpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5tZXRhID0gbWV0YTtcclxuXHJcblx0XHR0cnkge1xyXG5cdFx0XHRzd2l0Y2ggKG1lc3NhZ2VUeXBlKSB7XHJcblx0XHRcdFx0Y2FzZSAnaGFuZHNoYWtlJzoge1xyXG5cdFx0XHRcdFx0dGhpcy5zZW5kKCdsb2dpbicpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhc2UgJ2JhZExvZ2luJzoge1xyXG5cdFx0XHRcdFx0YWxlcnQocmVzcG9uc2UpO1xyXG5cdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhc2UgJ3Jlc3RhcnRTZXJ2ZXInOiB7XHJcblx0XHRcdFx0XHR0aGlzLm5ldHdvcmtBSXMgPSB7fTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYXNlICdzZXRVc2VyUGxheWVyJzoge1xyXG5cdFx0XHRcdFx0Y29uc3QgcGxheWVyID0gdGhpcy5zY2VuZS5nZXRQbGF5ZXIoKTtcclxuXHJcblx0XHRcdFx0XHRpZiAocGxheWVyKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuc2V0UGxheWVyUGFyYW1zKHBsYXllciwgcmVzcG9uc2UpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5zY2VuZS51bml0cy5zZXREZWZhdWx0UGxheWVyUGFyYW1zKHJlc3BvbnNlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYXNlICd1cGRhdGVHYW1lT2JqZWN0cyc6IHtcclxuXHRcdFx0XHRcdHRoaXMucGluZyA9IERhdGUubm93KCkgLSB0aGlzLmxhc3RSZXF1ZXN0QXQ7XHJcblx0XHRcdFx0XHR0aGlzLnVwZGF0ZUdhbWVPYmplY3RzKHJlc3BvbnNlKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYXNlICdkaXNjb25uZWN0ZWQnOiB7XHJcblx0XHRcdFx0XHR0aGlzLnJlbW92ZURpc2Nvbm5lY3RlZFBsYXllcihyZXNwb25zZSk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ0Nvbm5lY3Rpb24gZXJyb3InLCBlKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJlc3RhcnRTZXJ2ZXIoKSB7XHJcblx0XHR0aGlzLnNlbmQoJ3Jlc3RhcnRTZXJ2ZXInKTtcclxuXHR9XHJcblxyXG5cdC8vIFRoZXJlIGlzIHJhY2UgY29uZGl0aW9uIGJldHdlZW5cclxuXHQvLyBjbGVhckxvY2FsVW5pdHMgYW5kIExvY2F0aW9uLmNyZWF0ZUludGVyYWN0aXZlR2FtZU9iamVjdHNcclxuXHRjbGVhckxvY2FsVW5pdHMoKSB7XHJcblx0XHRjb25zdCBnYW1lT2JqZWN0c1NlcnZpY2UgPSB0aGlzLnNjZW5lLmdhbWVPYmplY3RzU2VydmljZTtcclxuXHRcdGNvbnN0IHBsYXllciA9IHRoaXMuc2NlbmUuZ2V0UGxheWVyKCk7XHJcblxyXG5cdFx0Ly8gQ2xlYXIgbG9jYWwgZ2FtZU9iamVjdHMgdG8gcmVwbGFjZSB0aGVtIGJ5IG5ldHdvcmsgdW5pdHMgKGV4Y2VwdCBwbGF5ZXIpXHJcblx0XHRnYW1lT2JqZWN0c1NlcnZpY2UuZ2V0VW5pdHMoKS5mb3JFYWNoKCh1bml0KSA9PiB7XHJcblx0XHRcdGlmICghdW5pdC5wYXJhbXMuZnJvbU5ldHdvcmsgJiYgdW5pdCAhPT0gcGxheWVyKSB7XHJcblx0XHRcdFx0Z2FtZU9iamVjdHNTZXJ2aWNlLmRlc3Ryb3lHYW1lT2JqZWN0KHVuaXQpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHNlbmQobWVzc2FnZVR5cGUsIGRhdGEpIHtcclxuXHRcdGNvbnN0IHsgdXNlck5hbWUsIHBhc3N3b3JkIH0gPSB0aGlzLnNjZW5lLnVzZXI7XHJcblxyXG5cdFx0Y29uc3QgbWV0YSA9IHtcclxuXHRcdFx0dG9rZW46IHRoaXMuZ2V0SGFzaCh1c2VyTmFtZSArIHBhc3N3b3JkKSxcclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5jb25uZWN0aW9uLnNlbmQoSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlVHlwZSwgbWV0YSwgZGF0YSB9KSlcclxuXHR9XHJcblxyXG5cdHJlbW92ZUFydGVmYWN0VW5pdHMoKSB7XHJcblx0XHRjb25zdCBnYW1lT2JqZWN0c1NlcnZpY2UgPSB0aGlzLnNjZW5lLmdhbWVPYmplY3RzU2VydmljZTtcclxuXHRcdGNvbnN0IG5ldHdvcmtBSXMgPSB0aGlzLm5ldHdvcmtBSXM7XHJcblx0XHRjb25zdCBuZXR3b3JrUGxheWVycyA9IHRoaXMubmV0d29ya1BsYXllcnM7XHJcblx0XHRjb25zdCBwbGF5ZXIgPSB0aGlzLnNjZW5lLmdldFBsYXllcigpO1xyXG5cclxuXHRcdHRoaXMuc2NlbmUudW5pdHMuZ2V0VW5pdHMoKVxyXG5cdFx0XHQuZmlsdGVyKHVuaXQgPT4gKFxyXG5cdFx0XHRcdCh1bml0IGluc3RhbmNlb2YgQUkgJiYgIW5ldHdvcmtBSXNbdW5pdC5wYXJhbXMudW5pdE5ldHdvcmtJZF0pXHJcblx0XHRcdFx0Ly8gfHwgKHVuaXQgaW5zdGFuY2VvZiBQbGF5ZXIgJiYgIW5ldHdvcmtQbGF5ZXJzW3VuaXQucGFyYW1zLmNvbm5lY3Rpb25JZF0gJiYgdW5pdCAhPT0gcGxheWVyKVxyXG5cdFx0XHQpKVxyXG5cdFx0XHQuZm9yRWFjaChnYW1lT2JqZWN0c1NlcnZpY2UuZGVzdHJveUdhbWVPYmplY3QpO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlR2FtZU9iamVjdHMoZ2FtZU9iamVjdHMpIHtcclxuXHRcdHRoaXMucmVtb3ZlQXJ0ZWZhY3RVbml0cygpO1xyXG5cclxuXHRcdGdhbWVPYmplY3RzLmZvckVhY2goKGdhbWVPYmplY3QpID0+IHtcclxuXHRcdFx0c3dpdGNoIChnYW1lT2JqZWN0LnR5cGUpIHtcclxuXHRcdFx0XHRjYXNlICdwbGF5ZXInOiB7XHJcblx0XHRcdFx0XHR0aGlzLnVwZGF0ZU5ldHdvcmtQbGF5ZXIoZ2FtZU9iamVjdCk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2FzZSAnYWknOiB7XHJcblx0XHRcdFx0XHR0aGlzLnVwZGF0ZU5ldHdvcmtBSShnYW1lT2JqZWN0KTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRyZW1vdmVEaXNjb25uZWN0ZWRQbGF5ZXIoeyBjb25uZWN0aW9uSWQgfSkge1xyXG5cdFx0Y29uc3QgZ2FtZU9iamVjdHNTZXJ2aWNlID0gdGhpcy5zY2VuZS5nYW1lT2JqZWN0c1NlcnZpY2U7XHJcblx0XHRjb25zdCBkaXNjb25uZWN0ZWRQbGF5ZXIgPSBnYW1lT2JqZWN0c1NlcnZpY2UuZ2V0VW5pdHMoKS5maW5kKHVuaXQgPT5cclxuXHRcdFx0dW5pdCBpbnN0YW5jZW9mIFBsYXllclxyXG5cdFx0XHQmJiB1bml0LnBhcmFtcy5jb25uZWN0aW9uSWQgPT09IGNvbm5lY3Rpb25JZFxyXG5cdFx0KTtcclxuXHJcblx0XHRpZiAoZGlzY29ubmVjdGVkUGxheWVyKSB7XHJcblx0XHRcdGlmICh0aGlzLnNjZW5lLnVpKSB7XHJcblx0XHRcdFx0dGhpcy5zY2VuZS51aS5ub3RpZnkoZGlzY29ubmVjdGVkUGxheWVyLnBhcmFtcy5uYW1lICsgJyBkaXNjb25uZWN0ZWQnKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Z2FtZU9iamVjdHNTZXJ2aWNlLmRlc3Ryb3lHYW1lT2JqZWN0KGRpc2Nvbm5lY3RlZFBsYXllcik7XHJcblx0XHRcdGRlbGV0ZSB0aGlzLm5ldHdvcmtQbGF5ZXJzW2Rpc2Nvbm5lY3RlZFBsYXllci5wYXJhbXMudW5pdE5ldHdvcmtJZF07XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc3RyXHJcblx0ICogQHJldHVybnMge3N0cmluZ31cclxuXHQgKi9cclxuXHRnZXRIYXNoKHN0cikge1xyXG5cdFx0ZnVuY3Rpb24gaGFzaDMyKHN0cikge1xyXG5cdFx0XHRsZXQgaTtcclxuXHRcdFx0bGV0IGw7XHJcblx0XHRcdGxldCBodmFsID0gMHg4MTFjOWRjNTtcclxuXHJcblx0XHRcdGZvciAoaSA9IDAsIGwgPSBzdHIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcblx0XHRcdFx0aHZhbCBePSBzdHIuY2hhckNvZGVBdChpKTtcclxuXHRcdFx0XHRodmFsICs9IChodmFsIDw8IDEpICsgKGh2YWwgPDwgNCkgKyAoaHZhbCA8PCA3KSArIChodmFsIDw8IDgpICsgKGh2YWwgPDwgMjQpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gKFwiMDAwMDAwMFwiICsgKGh2YWwgPj4+IDApLnRvU3RyaW5nKDE2KSkuc3Vic3RyKC04KTtcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgaDEgPSBoYXNoMzIoc3RyKTtcclxuXHRcdHJldHVybiBoMSArIGhhc2gzMihoMSArIHN0cik7XHJcblx0fVxyXG5cclxuXHRob3N0VW5pdHNGcm9tTmV0d29yaygpIHtcclxuXHRcdHRoaXMuc2NlbmUudW5pdHNcclxuXHRcdFx0LmdldEFsaXZlVW5pdHMoKVxyXG5cdFx0XHQuZm9yRWFjaCgodW5pdCkgPT4ge1xyXG5cdFx0XHRcdGlmICh1bml0LnBhcmFtcy5mcm9tTmV0d29yaykge1xyXG5cdFx0XHRcdFx0dW5pdC5wYXJhbXMuZnJvbU5ldHdvcmsgPSBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlTmV0d29ya1BsYXllcihwbGF5ZXJEYXRhKSB7XHJcblx0XHRjb25zdCB7IGxvY2F0aW9uTmFtZSwgcG9zaXRpb24sIHJvdGF0aW9uLCBhbmltYXRpb25TdGF0ZSwgcGFyYW1zIH0gPSBwbGF5ZXJEYXRhO1xyXG5cdFx0Y29uc3QgeyBwYXJhbXM6IHsgdW5pdE5ldHdvcmtJZCB9IH0gPSBwbGF5ZXJEYXRhO1xyXG5cclxuXHRcdGlmIChcclxuXHRcdFx0dW5pdE5ldHdvcmtJZCA9PT0gdGhpcy5tZXRhLnVuaXROZXR3b3JrSWRcclxuXHRcdFx0fHwgbG9jYXRpb25OYW1lICE9PSB0aGlzLnNjZW5lLmxvY2F0aW9uLmdldExvY2F0aW9uTmFtZSgpXHJcblx0XHQpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQHR5cGUgUGxheWVyIHwgc3RyaW5nXHJcblx0XHQgKi9cclxuXHRcdGxldCBuZXR3b3JrUGxheWVyID0gdGhpcy5uZXR3b3JrUGxheWVyc1t1bml0TmV0d29ya0lkXTtcclxuXHJcblx0XHRpZiAoIW5ldHdvcmtQbGF5ZXIpIHtcclxuXHRcdFx0dGhpcy5uZXR3b3JrUGxheWVyc1t1bml0TmV0d29ya0lkXSA9ICdsb2FkaW5nJztcclxuXHJcblx0XHRcdGlmICh0aGlzLnNjZW5lLnVpKSB7XHJcblx0XHRcdFx0dGhpcy5zY2VuZS51aS5ub3RpZnkocGxheWVyRGF0YS5wYXJhbXMubmFtZSArICcgY29ubmVjdGVkJyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuc2NlbmUudW5pdHMuY3JlYXRlTmV0d29ya1BsYXllcihcclxuXHRcdFx0XHRwbGF5ZXJEYXRhLFxyXG5cdFx0XHRcdChuZXR3b3JrUGxheWVyKSA9PiB7XHJcblx0XHRcdFx0XHR0aGlzLm5ldHdvcmtQbGF5ZXJzW3VuaXROZXR3b3JrSWRdID0gbmV0d29ya1BsYXllcjtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHQpO1xyXG5cdFx0fSBlbHNlIGlmIChuZXR3b3JrUGxheWVyICE9PSAnbG9hZGluZycpIHtcclxuXHRcdFx0dGhpcy5zZXRQbGF5ZXJQYXJhbXMobmV0d29ya1BsYXllciwgeyBwb3NpdGlvbiwgcm90YXRpb24sIGFuaW1hdGlvblN0YXRlLCBwYXJhbXMgfSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcGFyYW0ge1BsYXllcn0gcGxheWVyXHJcblx0ICogQHBhcmFtIHBvc2l0aW9uXHJcblx0ICogQHBhcmFtIHJvdGF0aW9uXHJcblx0ICogQHBhcmFtIGFuaW1hdGlvblN0YXRlXHJcblx0ICogQHBhcmFtIHBhcmFtc1xyXG5cdCAqL1xyXG5cdHNldFBsYXllclBhcmFtcyhwbGF5ZXIsIHsgcG9zaXRpb24sIHJvdGF0aW9uLCBhbmltYXRpb25TdGF0ZSwgcGFyYW1zIH0pIHtcclxuXHRcdHBsYXllci5wb3NpdGlvbi5zZXQocG9zaXRpb24ueCwgcG9zaXRpb24ueSwgcG9zaXRpb24ueik7XHJcblx0XHRwbGF5ZXIucm90YXRpb24uc2V0KHJvdGF0aW9uLngsIHJvdGF0aW9uLnksIHJvdGF0aW9uLnopO1xyXG5cdFx0cGxheWVyLmFuaW1hdGlvblN0YXRlID0gYW5pbWF0aW9uU3RhdGU7XHJcblxyXG5cdFx0aWYgKHBhcmFtcykge1xyXG5cdFx0XHRjb25zdCB7IGlucHV0LCBhY2NlbGVyYXRpb24gfSA9IHBhcmFtcztcclxuXHRcdFx0Y29uc3QgcGxheWVyUGFyYW1zID0gcGxheWVyLnBhcmFtcztcclxuXHJcblx0XHRcdHBsYXllclBhcmFtcy5pbnB1dC52ZXJ0aWNhbCA9IGlucHV0LnZlcnRpY2FsO1xyXG5cdFx0XHRwbGF5ZXJQYXJhbXMuaW5wdXQuaG9yaXpvbnRhbCA9IGlucHV0Lmhvcml6b250YWw7XHJcblx0XHRcdHBsYXllclBhcmFtcy5pbnB1dC5hdHRhY2sxID0gaW5wdXQuYXR0YWNrMTtcclxuXHRcdFx0cGxheWVyUGFyYW1zLmlucHV0LmF0dGFjazIgPSBpbnB1dC5hdHRhY2syO1xyXG5cdFx0XHRwbGF5ZXJQYXJhbXMuaW5wdXQuaXNEcm9wID0gaW5wdXQuaXNEcm9wO1xyXG5cdFx0XHRwbGF5ZXJQYXJhbXMuaW5wdXQuaXNBY3Rpb24gPSBpbnB1dC5pc0FjdGlvbjtcclxuXHRcdFx0cGxheWVyUGFyYW1zLmhwID0gcGFyYW1zLmhwO1xyXG5cdFx0XHRwbGF5ZXJQYXJhbXMuaHBNYXggPSBwYXJhbXMuaHBNYXg7XHJcblx0XHRcdHBsYXllclBhcmFtcy5mcmFjdGlvbiA9IHBhcmFtcy5mcmFjdGlvbjtcclxuXHRcdFx0cGxheWVyUGFyYW1zLmRhbWFnZSA9IHBhcmFtcy5kYW1hZ2U7XHJcblx0XHRcdHBsYXllclBhcmFtcy5maXJlRGFtYWdlID0gcGFyYW1zLmZpcmVEYW1hZ2U7XHJcblx0XHRcdHBsYXllclBhcmFtcy5zcGVlZCA9IHBhcmFtcy5zcGVlZDtcclxuXHRcdFx0cGxheWVyUGFyYW1zLm1vbmV5ID0gcGFyYW1zLm1vbmV5O1xyXG5cdFx0XHRwbGF5ZXJQYXJhbXMubGV2ZWwgPSBwYXJhbXMubGV2ZWw7XHJcblx0XHRcdHBsYXllclBhcmFtcy51bnNwZW50VGFsZW50cyA9IHBhcmFtcy51bnNwZW50VGFsZW50cztcclxuXHRcdFx0cGxheWVyUGFyYW1zLmV4cGVyaWVuY2UgPSBwYXJhbXMuZXhwZXJpZW5jZTtcclxuXHRcdFx0cGxheWVyUGFyYW1zLmFjY2VsZXJhdGlvbi5zZXQoYWNjZWxlcmF0aW9uLngsIGFjY2VsZXJhdGlvbi55LCBhY2NlbGVyYXRpb24ueik7XHJcblxyXG5cdFx0XHRpZiAocGFyYW1zLmVxdWlwcGVkSXRlbXMgJiYgcGFyYW1zLmVxdWlwcGVkSXRlbXMubGVmdEhhbmQpIHtcclxuXHRcdFx0XHRwbGF5ZXJQYXJhbXMuZXF1aXBwZWRJdGVtcy5sZWZ0SGFuZCA9IHBhcmFtcy5lcXVpcHBlZEl0ZW1zLmxlZnRIYW5kO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLnNjZW5lLmdhbWVPYmplY3RzU2VydmljZS51cGRhdGVBdHRhY2hlZEl0ZW1zKHBsYXllcik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR1cGRhdGVOZXR3b3JrQUkodW5pdERhdGEpIHtcclxuXHRcdGNvbnN0IHsgbG9jYXRpb25OYW1lLCBwb3NpdGlvbiwgcm90YXRpb24sIGlzUnVubmluZywgaXNBdHRhY2ssIGFuaW1hdGlvblN0YXRlLCBzY2FsZSwgcGFyYW1zIH0gPSB1bml0RGF0YTtcclxuXHRcdGNvbnN0IHsgdW5pdE5ldHdvcmtJZCB9ID0gcGFyYW1zO1xyXG5cclxuXHRcdGlmIChsb2NhdGlvbk5hbWUgIT09IHRoaXMuc2NlbmUubG9jYXRpb24uZ2V0TG9jYXRpb25OYW1lKCkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQHR5cGUgQUkgfCBzdHJpbmdcclxuXHRcdCAqL1xyXG5cdFx0bGV0IG5ldHdvcmtBSSA9IHRoaXMubmV0d29ya0FJc1t1bml0TmV0d29ya0lkXTtcclxuXHJcblx0XHRpZiAoIW5ldHdvcmtBSSkge1xyXG5cdFx0XHR0aGlzLm5ldHdvcmtBSXNbdW5pdE5ldHdvcmtJZF0gPSAnbG9hZGluZyc7XHJcblxyXG5cdFx0XHR0aGlzLnNjZW5lLnVuaXRzLmNyZWF0ZU5ldHdvcmtBSSh1bml0RGF0YSwgKG5ldHdvcmtBSSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMubmV0d29ya0FJc1t1bml0TmV0d29ya0lkXSA9IG5ldHdvcmtBSTtcclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2UgaWYgKG5ldHdvcmtBSSAhPT0gJ2xvYWRpbmcnKSB7XHJcblx0XHRcdG5ldHdvcmtBSS5wb3NpdGlvbi5zZXQocG9zaXRpb24ueCwgcG9zaXRpb24ueSwgcG9zaXRpb24ueik7XHJcblx0XHRcdG5ldHdvcmtBSS5yb3RhdGlvbi5zZXQocm90YXRpb24ueCwgcm90YXRpb24ueSwgcm90YXRpb24ueik7XHJcblx0XHRcdG5ldHdvcmtBSS5vYmplY3Quc2NhbGUuc2V0KHNjYWxlLngsIHNjYWxlLnksIHNjYWxlLnopO1xyXG5cdFx0XHRuZXR3b3JrQUkuaXNSdW5uaW5nID0gaXNSdW5uaW5nO1xyXG5cdFx0XHRuZXR3b3JrQUkuaXNBdHRhY2sgPSBpc0F0dGFjaztcclxuXHRcdFx0bmV0d29ya0FJLmFuaW1hdGlvblN0YXRlID0gYW5pbWF0aW9uU3RhdGU7XHJcblxyXG5cdFx0XHRpZiAocGFyYW1zKSB7XHJcblx0XHRcdFx0Y29uc3QgeyBhY2NlbGVyYXRpb24gfSA9IHBhcmFtcztcclxuXHRcdFx0XHRjb25zdCBuZXR3b3JrQUlQYXJhbXMgPSBuZXR3b3JrQUkucGFyYW1zO1xyXG5cclxuXHRcdFx0XHRuZXR3b3JrQUlQYXJhbXMuaHAgPSBwYXJhbXMuaHA7XHJcblx0XHRcdFx0bmV0d29ya0FJUGFyYW1zLmhwTWF4ID0gcGFyYW1zLmhwTWF4O1xyXG5cdFx0XHRcdG5ldHdvcmtBSVBhcmFtcy5mcmFjdGlvbiA9IHBhcmFtcy5mcmFjdGlvbjtcclxuXHRcdFx0XHRuZXR3b3JrQUlQYXJhbXMuZGFtYWdlID0gcGFyYW1zLmRhbWFnZTtcclxuXHRcdFx0XHRuZXR3b3JrQUlQYXJhbXMuZmlyZURhbWFnZSA9IHBhcmFtcy5maXJlRGFtYWdlO1xyXG5cdFx0XHRcdG5ldHdvcmtBSVBhcmFtcy5sZXZlbCA9IHBhcmFtcy5sZXZlbDtcclxuXHRcdFx0XHRuZXR3b3JrQUlQYXJhbXMubG9vdCA9IHBhcmFtcy5sb290O1xyXG5cdFx0XHRcdG5ldHdvcmtBSVBhcmFtcy5hY2NlbGVyYXRpb24uc2V0KGFjY2VsZXJhdGlvbi54LCBhY2NlbGVyYXRpb24ueSwgYWNjZWxlcmF0aW9uLnopO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRzZW5kR2FtZU9iamVjdHMoKSB7XHJcblx0XHRjb25zdCBjb25uZWN0aW9uSWQgPSB0aGlzLm1ldGEuaWQ7XHJcblxyXG5cdFx0aWYgKHRoaXMuY29ubmVjdGlvbi5yZWFkeVN0YXRlICE9PSAxIHx8ICFjb25uZWN0aW9uSWQpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IHBsYXllciA9IHRoaXMuc2NlbmUuZ2V0UGxheWVyKCk7XHJcblx0XHRjb25zdCB1bml0cyA9IChcclxuXHRcdFx0dGhpcy5tZXRhLnJvbGUgPT09ICdob3N0J1xyXG5cdFx0XHRcdD8gW1xyXG5cdFx0XHRcdFx0cGxheWVyLFxyXG5cdFx0XHRcdFx0Li4udGhpcy5zY2VuZS51bml0c1xyXG5cdFx0XHRcdFx0XHQuZ2V0QWxpdmVVbml0cygpXHJcblx0XHRcdFx0XHRcdC5maWx0ZXIodW5pdCA9PiAhdW5pdC5wYXJhbXMuZnJvbU5ldHdvcmspXHJcblx0XHRcdFx0XVxyXG5cdFx0XHRcdDogW3BsYXllcl1cclxuXHRcdCk7XHJcblxyXG5cdFx0Y29uc3QgZGF0YSA9IFtdO1xyXG5cclxuXHRcdHVuaXRzLmZvckVhY2goKHVuaXQpID0+IHtcclxuXHRcdFx0Y29uc3QgdW5pdERhdGEgPSB1bml0VG9OZXR3b3JrKFxyXG5cdFx0XHRcdHVuaXQsXHJcblx0XHRcdFx0Y29ubmVjdGlvbklkLFxyXG5cdFx0XHRcdHRoaXMuc2NlbmUubG9jYXRpb24uZ2V0TG9jYXRpb25OYW1lKCksXHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHRpZiAodW5pdERhdGEpIHtcclxuXHRcdFx0XHRkYXRhLnB1c2godW5pdERhdGEpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHRpZiAodGhpcy5tZXRhLnJvbGUgPT09ICdob3N0Jykge1xyXG5cdFx0XHR0aGlzLnNlbmQoJ3VwZGF0ZUdhbWVPYmplY3RzJywgZGF0YSk7XHJcblx0XHR9IGVsc2UgaWYgKGRhdGFbMF0pIHtcclxuXHRcdFx0dGhpcy5zZW5kKCd1cGRhdGVQbGF5ZXInLCBkYXRhWzBdKTtcclxuXHRcdH1cclxuXHR9XHJcbn0iLCAiaW1wb3J0IEF1dG9CaW5kTWV0aG9kcyBmcm9tICcuL0F1dG9CaW5kTWV0aG9kcyc7XHJcblxyXG5jb25zdCBLRVlTID0ge1xyXG4gICAgTU9VU0VfTEVGVDogMSxcclxuICAgIE1PVVNFX1JJR0hUOiAzLFxyXG4gICAgU1BBQ0U6IDMyLFxyXG4gICAgRU5URVI6IDEzLFxyXG4gICAgRVNDOiAyNyxcclxuICAgIEM6IDY3LFxyXG4gICAgVzogODcsXHJcbiAgICBBOiA2NSxcclxuICAgIFM6IDgzLFxyXG4gICAgRDogNjgsXHJcbiAgICBYOiA4OCxcclxuICAgIFo6IDkwLFxyXG4gICAgUTogODEsXHJcbiAgICBFOiA2OSxcclxuICAgIFI6IDgyLFxyXG4gICAgRjogNzAsXHJcbiAgICBWOiA4NixcclxuICAgIEc6IDcxLFxyXG4gICAgMTogNDksXHJcbiAgICAyOiA1MCxcclxuICAgIEFSUk9XX0xFRlQ6IDM3LFxyXG4gICAgQVJST1dfUklHSFQ6IDM5LFxyXG4gICAgQVJST1dfVVA6IDM4LFxyXG4gICAgQVJST1dfRE9XTjogNDAsXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnB1dCBleHRlbmRzIEF1dG9CaW5kTWV0aG9kcyB7XHJcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMucGFyYW1zID0gcGFyYW1zO1xyXG4gICAgICAgIHRoaXMudmVydGljYWwgPSAwO1xyXG4gICAgICAgIHRoaXMuaG9yaXpvbnRhbCA9IDA7XHJcbiAgICAgICAgdGhpcy5hdHRhY2sxID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hdHRhY2syID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5sb29rID0ge1xyXG4gICAgICAgICAgICB2ZXJ0aWNhbDogMCxcclxuICAgICAgICAgICAgaG9yaXpvbnRhbDogMCxcclxuICAgICAgICAgICAgYmFjazogZmFsc2UsXHJcbiAgICAgICAgICAgIHNlbnNpdGl2aXR5OiAxLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5yZXNldEhvcml6b250YWxMb29rID0gKCkgPT4gdGhpcy5sb29rLmhvcml6b250YWwgPSAwO1xyXG4gICAgICAgIHRoaXMuaXNUaGlyZFBlcnNvbiA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yID0ge1xyXG4gICAgICAgICAgICB4OiAwLFxyXG4gICAgICAgICAgICB5OiAwLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubW91c2UgPSB7XHJcbiAgICAgICAgICAgIHg6IDAsXHJcbiAgICAgICAgICAgIHk6IDAsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLmxvb2suaG9yaXpvbnRhbCA9IDA7XHJcbiAgICAgICAgdGhpcy5sb29rLnZlcnRpY2FsID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBhZGRFdmVudExpc3RlbmVycygpIHtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PT0gS0VZUy5NT1VTRV9MRUZUKSB7IHRoaXMuYXR0YWNrMSA9IHRydWU7IH1cclxuICAgICAgICAgICAgaWYgKGUud2hpY2ggPT09IEtFWVMuTU9VU0VfUklHSFQpIHsgdGhpcy5hdHRhY2syID0gdHJ1ZTsgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUud2hpY2ggPT09IEtFWVMuTU9VU0VfTEVGVCkgeyB0aGlzLmF0dGFjazEgPSBmYWxzZTsgfVxyXG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PT0gS0VZUy5NT1VTRV9SSUdIVCkgeyB0aGlzLmF0dGFjazIgPSBmYWxzZTsgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgdGltZW91dDtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmxvb2suaG9yaXpvbnRhbCArPSBlLm1vdmVtZW50WCB8fCAwO1xyXG4gICAgICAgICAgICB0aGlzLmxvb2sudmVydGljYWwgKz0gZS5tb3ZlbWVudFkgfHwgMDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubW91c2UueCA9IGUueDtcclxuICAgICAgICAgICAgdGhpcy5tb3VzZS55ID0gZS55O1xyXG5cclxuICAgICAgICAgICAgY29uc3QgY3Vyc29yWCA9IHRoaXMuY3Vyc29yLnggKyAoZS5tb3ZlbWVudFggfHwgMCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnNvclkgPSB0aGlzLmN1cnNvci55ICsgKGUubW92ZW1lbnRZIHx8IDApO1xyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnNvclggPiAwICYmIGN1cnNvclggPCB3aW5kb3cuaW5uZXJXaWR0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJzb3IueCA9IGN1cnNvclg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJzb3JZID4gMCAmJiBjdXJzb3JZIDwgd2luZG93LmlubmVySGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnNvci55ID0gY3Vyc29yWTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRpbWVvdXQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aW1lb3V0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdvbm1vdXNlbW92ZWVuZCcpKTtcclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignb25tb3VzZW1vdmVlbmQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBIb3Jpem9udGFsIGxvb2sgaXMgY2xlYW5pbmcgYnkgUGxheWVyLnVwZGF0ZSBhZnRlciByb3RhdGlvbiBpcyBhcHBsaWVkXHJcbiAgICAgICAgICAgIC8vIHRoaXMubG9vay5ob3Jpem9udGFsID0gMDtcclxuICAgICAgICAgICAgdGhpcy5sb29rLnZlcnRpY2FsID0gMDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBLRVlTLkVOVEVSOiB0aGlzLnBhcmFtcy5vbkFjdGlvbiAmJiB0aGlzLnBhcmFtcy5vbkFjdGlvbigpOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgS0VZUy5FU0M6IHRoaXMucGFyYW1zLm9uRXhpdCAmJiB0aGlzLnBhcmFtcy5vbkV4aXQoKTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEtFWVMuQzogdGhpcy5wYXJhbXMub25Td2l0Y2hDYW1lcmEgJiYgdGhpcy5wYXJhbXMub25Td2l0Y2hDYW1lcmEoKTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEtFWVMuVzogY2FzZSBLRVlTLkFSUk9XX1VQOiB0aGlzLnZlcnRpY2FsID0gMTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEtFWVMuUzogY2FzZSBLRVlTLkFSUk9XX0RPV046IHRoaXMudmVydGljYWwgPSAtMTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEtFWVMuQTogY2FzZSBLRVlTLkFSUk9XX0xFRlQ6IHRoaXMuaG9yaXpvbnRhbCA9IC0xOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgS0VZUy5EOiBjYXNlIEtFWVMuQVJST1dfUklHSFQ6IHRoaXMuaG9yaXpvbnRhbCA9IDE7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBLRVlTLlg6IHRoaXMubG9vay5iYWNrID0gdHJ1ZTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEtFWVMuRjogdGhpcy5sb29rLmNpbmVtYXRpYyA9IHRydWU7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBLRVlTLkU6IHRoaXMuaXNBY3Rpb24gPSB0cnVlOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgS0VZUy5HOiB0aGlzLmlzRHJvcCA9IHRydWU7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBLRVlTLlNQQUNFOiB0aGlzLmp1bXAgPSAxOyBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBLRVlTLlc6XHJcbiAgICAgICAgICAgICAgICBjYXNlIEtFWVMuQVJST1dfVVA6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmVydGljYWwgPT09IDEpIHsgdGhpcy52ZXJ0aWNhbCA9IDA7IH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgS0VZUy5TOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBLRVlTLkFSUk9XX0RPV046XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmVydGljYWwgPT09IC0xKSB7IHRoaXMudmVydGljYWwgPSAwOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEtFWVMuQTpcclxuICAgICAgICAgICAgICAgIGNhc2UgS0VZUy5BUlJPV19MRUZUOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmhvcml6b250YWwgPT09IC0xKSB7IHRoaXMuaG9yaXpvbnRhbCA9IDA7IH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgS0VZUy5EOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBLRVlTLkFSUk9XX1JJR0hUOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmhvcml6b250YWwgPT09IDEpIHsgdGhpcy5ob3Jpem9udGFsID0gMDsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBLRVlTLlg6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb29rLmJhY2sgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgS0VZUy5GOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9vay5jaW5lbWF0aWMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgS0VZUy5FOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNBY3Rpb24gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgS0VZUy5HOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNEcm9wID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEtFWVMuU1BBQ0U6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5qdW1wID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBlID0+IHRoaXMucGFyYW1zLm9uWm9vbSAmJiB0aGlzLnBhcmFtcy5vblpvb20oZS5kZWx0YVkgLyAxMDApKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn1cclxuIiwgImltcG9ydCBBdXRvQmluZE1ldGhvZHMgZnJvbSAnLi9BdXRvQmluZE1ldGhvZHMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZXJ2YWxzIGV4dGVuZHMgQXV0b0JpbmRNZXRob2RzIHtcclxuICAgIGNvbnN0cnVjdG9yKHNjZW5lKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICAgICAgdGhpcy50aW1lUGFzc2VkID0gMDtcclxuICAgICAgICB0aGlzLmxhc3RGcmFtZSA9IERhdGUubm93KCk7XHJcbiAgICAgICAgdGhpcy5pbnRlcnZhbHMgPSBbXTtcclxuICAgICAgICB0aGlzLmludGVydmFsSW5kZXggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShub3cpIHtcclxuICAgICAgICB0aGlzLnRpbWVQYXNzZWQgKz0gbm93IC0gdGhpcy5sYXN0RnJhbWU7XHJcblxyXG4gICAgICAgIHRoaXMuaW50ZXJ2YWxzXHJcbiAgICAgICAgICAgIC5maWx0ZXIoaSA9PiB0aGlzLnRpbWVQYXNzZWQgLSBpLmNhbGxlZEF0ID4gaS5pbnRlcnZhbClcclxuICAgICAgICAgICAgLmZvckVhY2goKGludGVydmFsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpbnRlcnZhbC5jYWxsZWRBdCA9IHRoaXMudGltZVBhc3NlZDtcclxuICAgICAgICAgICAgICAgIGludGVydmFsLmZuKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGludGVydmFsLmxvb3BzICYmIC0taW50ZXJ2YWwubG9vcHMgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwuaWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5sYXN0RnJhbWUgPSBub3c7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VGltZVBhc3NlZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50aW1lUGFzc2VkO1xyXG4gICAgfVxyXG5cclxuICAgIGdldERlbHRhVGltZShub3cpIHtcclxuICAgICAgICByZXR1cm4gbm93IC0gdGhpcy5sYXN0RnJhbWU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0SW50ZXJ2YWwoZm4sIGludGVydmFsLCBpbW1lZGlhdGVseSwgbG9vcHMpIHtcclxuICAgICAgICBpZiAoZm4gJiYgaW50ZXJ2YWwpIHtcclxuICAgICAgICAgICAgY29uc3QgY2FsbGVkQXQgPSBpbW1lZGlhdGVseSA/IHRoaXMudGltZVBhc3NlZCAtIGludGVydmFsIDogdGhpcy50aW1lUGFzc2VkO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pbnRlcnZhbHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBmbixcclxuICAgICAgICAgICAgICAgIGludGVydmFsLFxyXG4gICAgICAgICAgICAgICAgY2FsbGVkQXQsXHJcbiAgICAgICAgICAgICAgICBsb29wcyxcclxuICAgICAgICAgICAgICAgIGlkOiArK3RoaXMuaW50ZXJ2YWxJbmRleCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldFRpbWVvdXQoZm4sIHRpbWVvdXQpIHtcclxuICAgICAgICBpZiAoZm4gJiYgdGltZW91dCkge1xyXG4gICAgICAgICAgICB0aGlzLmludGVydmFscy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGZuLFxyXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWw6IHRpbWVvdXQsXHJcbiAgICAgICAgICAgICAgICBsb29wczogMSxcclxuICAgICAgICAgICAgICAgIGNhbGxlZEF0OiB0aGlzLnRpbWVQYXNzZWQsXHJcbiAgICAgICAgICAgICAgICBpZDogKyt0aGlzLmludGVydmFsSW5kZXgsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjbGVhckludGVydmFsKGlkKSB7XHJcbiAgICAgICAgY29uc3QgaW50ZXJ2YWxJZHggPSB0aGlzLmludGVydmFscy5maW5kSW5kZXgoaSA9PiBpLmlkID09PSBpZCk7XHJcblxyXG4gICAgICAgIGlmIChpbnRlcnZhbElkeCA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW50ZXJ2YWxzLnNwbGljZShpbnRlcnZhbElkeCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwgImltcG9ydCBBdXRvQmluZE1ldGhvZHMgZnJvbSAnLi4vQXV0b0JpbmRNZXRob2RzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFic3RyYWN0TG9jYXRpb24gZXh0ZW5kcyBBdXRvQmluZE1ldGhvZHMge1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge1NjZW5lfSBzY2VuZVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZSwgaWQgPSAndW5rbm93bi1sZXZlbCcpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge31cclxuXHJcbiAgICBzdGFydExvY2F0aW9uKCkge31cclxuICAgIHJlc3RhcnRMb2NhdGlvbigpIHt9XHJcbiAgICBzdG9wTG9jYXRpb24oKSB7fVxyXG4gICAgb25BY3Rpb24oKSB7fVxyXG5cclxuICAgIGdldExvY2F0aW9uTmFtZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pZDtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVBbWJpZW50TGlnaHQoKSB7XHJcbiAgICAgICAgY29uc3QgYW1iaWVudExpZ2h0ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweDg4ODg4OCk7XHJcbiAgICAgICAgYW1iaWVudExpZ2h0LmNhc3RTaGFkb3cgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm4gYW1iaWVudExpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVNoYWRvd0xpZ2h0KCkge1xyXG4gICAgICAgIGNvbnN0IGxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYsIDEwLCAxNTApO1xyXG4gICAgICAgIGxpZ2h0LmludGVuc2l0eSA9IDE7XHJcbiAgICAgICAgbGlnaHQuc2hhZG93LmJpYXMgPSAtMC4wMDAwMTtcclxuICAgICAgICBjb25zdCBzaGFkb3dTaXplID0gMjU7XHJcbiAgICAgICAgbGlnaHQuY2FzdFNoYWRvdyA9IHRydWU7XHJcbiAgICAgICAgbGlnaHQuc2hhZG93LmNhbWVyYS5sZWZ0ID0gLXNoYWRvd1NpemU7XHJcbiAgICAgICAgbGlnaHQuc2hhZG93LmNhbWVyYS5yaWdodCA9IHNoYWRvd1NpemU7XHJcbiAgICAgICAgbGlnaHQuc2hhZG93LmNhbWVyYS50b3AgPSBzaGFkb3dTaXplO1xyXG4gICAgICAgIGxpZ2h0LnNoYWRvdy5jYW1lcmEuYm90dG9tID0gLXNoYWRvd1NpemU7XHJcbiAgICAgICAgbGlnaHQuc2hhZG93Lm1hcFNpemUud2lkdGggPSA1MTI7XHJcbiAgICAgICAgbGlnaHQuc2hhZG93Lm1hcFNpemUuaGVpZ2h0ID0gNTEyO1xyXG4gICAgICAgIGxpZ2h0LnNoYWRvdy5jYW1lcmEubmVhciA9IDEwO1xyXG4gICAgICAgIGxpZ2h0LnNoYWRvdy5jYW1lcmEuZmFyID0gMjUwO1xyXG4gICAgICAgIGxpZ2h0LnNoYWRvdy5jYW1lcmEudmlzaWJsZSA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiBsaWdodDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgY3JlYXRlU2t5Ym94KHNreWJveE5hbWUpIHtcclxuICAgICAgICBjb25zdCBtYXRlcmlhbEFycmF5ID0gW1xyXG4gICAgICAgICAgICAnc2t5Ym94UlQnLFxyXG4gICAgICAgICAgICAnc2t5Ym94TEYnLFxyXG4gICAgICAgICAgICAnc2t5Ym94VVAnLFxyXG4gICAgICAgICAgICAnc2t5Ym94RE4nLFxyXG4gICAgICAgICAgICAnc2t5Ym94RlQnLFxyXG4gICAgICAgICAgICAnc2t5Ym94QksnLFxyXG4gICAgICAgIF0ubWFwKGZpbGVuYW1lID0+IGAuL2Fzc2V0cy90ZXh0dXJlcy8ke3NreWJveE5hbWV9LyR7ZmlsZW5hbWV9LmpwZ2ApO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFRIUkVFLkN1YmVUZXh0dXJlTG9hZGVyKCkubG9hZChtYXRlcmlhbEFycmF5KTtcclxuICAgIH1cclxufSIsICJjb25zdCBjcmVhdGVFbnZpcm9ubWVudCA9IGZ1bmN0aW9uKHtcclxuICAgbG9hZCxcclxuICAgb25Mb2FkLFxyXG59KSB7XHJcbiAgIGNvbnN0IHBpdm90ID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XHJcbiAgIHBpdm90Lm1hdHJpeEF1dG9VcGRhdGUgPSBmYWxzZTtcclxuICAgcGl2b3QubmFtZSA9ICdMRVZFTF9FTlZJUk9OTUVOVCc7XHJcblxyXG4gICBsZXQgaXNFbnZpcm9ubWVudExvYWRlZCA9IGZhbHNlO1xyXG4gICBsZXQgaXNTdGF0aWNMb2FkZWQgPSBmYWxzZTtcclxuXHJcbiAgIGNvbnN0IGNoZWNrSXNBbGxMb2FkZWQgPSAoKSA9PiB7XHJcbiAgICAgIGlmIChpc0Vudmlyb25tZW50TG9hZGVkICYmIGlzU3RhdGljTG9hZGVkKSB7XHJcbiAgICAgICAgIG9uTG9hZCAmJiBvbkxvYWQoKTtcclxuICAgICAgfVxyXG4gICB9O1xyXG5cclxuICAgbG9hZCh7XHJcbiAgICAgIGJhc2VVcmw6ICcuL2Fzc2V0cy9tb2RlbHMvZW52aXJvbm1lbnQvaXNsYW5kJyxcclxuICAgICAgbm9TY2VuZTogdHJ1ZSxcclxuICAgICAgcmVjZWl2ZVNoYWRvdzogdHJ1ZSxcclxuICAgICAgY2FzdFNoYWRvdzogZmFsc2UsXHJcbiAgICAgIGNhbGxiYWNrOiBvYmplY3QgPT4ge1xyXG4gICAgICAgICBwaXZvdC5hZGQob2JqZWN0LnNjZW5lKTtcclxuICAgICAgICAgb2JqZWN0LnNjZW5lLm1hdHJpeEF1dG9VcGRhdGUgPSBmYWxzZTtcclxuICAgICAgICAgb2JqZWN0LnNjZW5lLnVwZGF0ZU1hdHJpeCgpO1xyXG4gICAgICAgICBpc0Vudmlyb25tZW50TG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgY2hlY2tJc0FsbExvYWRlZCgpO1xyXG4gICAgICB9XHJcbiAgIH0pO1xyXG5cclxuICAgbG9hZCh7XHJcbiAgICAgIGJhc2VVcmw6ICcuL2Fzc2V0cy9tb2RlbHMvZW52aXJvbm1lbnQvd2F0ZXInLFxyXG4gICAgICBjYXN0U2hhZG93OiBmYWxzZSxcclxuICAgICAgcmVjZWl2ZVNoYWRvdzogZmFsc2UsXHJcbiAgICAgIGNhbGxiYWNrOiBvYmplY3QgPT4ge1xyXG4gICAgICAgICBvYmplY3Quc2NlbmUubWF0cml4QXV0b1VwZGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICBvYmplY3Quc2NlbmUudXBkYXRlTWF0cml4KCk7XHJcbiAgICAgIH1cclxuICAgfSk7XHJcblxyXG4gICBsb2FkKHtcclxuICAgICAgYmFzZVVybDogJy4vYXNzZXRzL21vZGVscy9lbnZpcm9ubWVudC9zdGF0aWMtb2JqZWN0cycsXHJcbiAgICAgIG5vU2NlbmU6IHRydWUsXHJcbiAgICAgIHJlY2VpdmVTaGFkb3c6IGZhbHNlLFxyXG4gICAgICBjYXN0U2hhZG93OiB0cnVlLFxyXG4gICAgICBjYWxsYmFjazogb2JqZWN0ID0+IHtcclxuICAgICAgICAgcGl2b3QuYWRkKG9iamVjdC5zY2VuZSk7XHJcbiAgICAgICAgIG9iamVjdC5zY2VuZS5tYXRyaXhBdXRvVXBkYXRlID0gZmFsc2U7XHJcbiAgICAgICAgIG9iamVjdC5zY2VuZS51cGRhdGVNYXRyaXgoKTtcclxuICAgICAgICAgaXNTdGF0aWNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgICBjaGVja0lzQWxsTG9hZGVkKCk7XHJcbiAgICAgIH1cclxuICAgfSk7XHJcblxyXG4gICByZXR1cm4gcGl2b3Q7XHJcbn07XHJcblxyXG5leHBvcnQgeyBjcmVhdGVFbnZpcm9ubWVudCB9O1xyXG4iLCAiY29uc3QgYnVpbGRBcmVhID0gKGFyZWFJZCwgbWFwKSA9PiB7XHJcbiAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IEFyZWFTaXplc1thcmVhSWRdO1xyXG5cclxuICAgIGNvbnN0IHdheXBvaW50WFRvV29ybGRYID0gcG9zaXRpb24gPT4gcG9zaXRpb24gLSB3aWR0aCAvIDI7XHJcbiAgICBjb25zdCB3YXlwb2ludFlUb1dvcmxkWiA9IHBvc2l0aW9uID0+IHBvc2l0aW9uIC0gaGVpZ2h0IC8gMjtcclxuXHJcbiAgICBjb25zdCB3b3JsZFhUb1dheXBvaW50WCA9IChwb3NpdGlvbikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGdyYXBoWCA9IE1hdGgucm91bmQocG9zaXRpb24gKyB3aWR0aCAvIDIpO1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChncmFwaFgsIDQpLCB3aWR0aCAtIDUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCB3b3JsZFpUb1dheXBvaW50WSA9IChwb3NpdGlvbikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGdyYXBoWSA9IE1hdGgucm91bmQocG9zaXRpb24gKyBoZWlnaHQgLyAyKTtcclxuICAgICAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgoZ3JhcGhZLCA0KSwgaGVpZ2h0IC0gNSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGFyZWEgPSB7XHJcbiAgICAgICAgaWQ6IGFyZWFJZCxcclxuICAgICAgICB3YXlwb2ludFhUb1dvcmxkWCxcclxuICAgICAgICB3YXlwb2ludFlUb1dvcmxkWixcclxuICAgICAgICB3b3JsZFhUb1dheXBvaW50WCxcclxuICAgICAgICB3b3JsZFpUb1dheXBvaW50WSxcclxuICAgICAgICB3aWR0aCxcclxuICAgICAgICBoZWlnaHQsXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBtYXAoYXJlYSk7XHJcbn07XHJcblxyXG5jb25zdCBBcmVhU2l6ZXMgPSB7XHJcbiAgICBGTE9PUl8wOiB7XHJcbiAgICAgICAgd2lkdGg6IDMwMCxcclxuICAgICAgICBoZWlnaHQ6IDMwMCxcclxuICAgIH0sXHJcbn07XHJcblxyXG5jb25zdCBBcmVhcyA9IHtcclxuICAgIEZMT09SXzA6IGJ1aWxkQXJlYSgnRkxPT1JfMCcsIGFyZWEgPT4gKHtcclxuICAgICAgICAuLi5hcmVhLFxyXG4gICAgICAgIGluY2x1ZGVzUG9zaXRpb246IHBvc2l0aW9uID0+IHBvc2l0aW9uLnkgPCAyNTAsXHJcbiAgICAgICAgZ2V0V29ybGRXYXlwb2ludEJ5WFk6ICh4LCB5KSA9PiAoeyB4OiBhcmVhLndheXBvaW50WFRvV29ybGRYKHgpLCB5OiAxMC4yLCB6OiBhcmVhLndheXBvaW50WVRvV29ybGRaKHkpIH0pLFxyXG4gICAgICAgIGdldFdheXBvaW50UG9ydGFsczogKCkgPT4gW10sXHJcbiAgICB9KSksXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBcmVhczsiLCAiaW1wb3J0IEFic3RyYWN0TG9jYXRpb24gZnJvbSAnLi4vQWJzdHJhY3RMb2NhdGlvbic7XHJcbmltcG9ydCB7IFBsYXllciB9IGZyb20gJy4uLy4uL0dhbWVPYmplY3RzJztcclxuaW1wb3J0IHsgY3JlYXRlRW52aXJvbm1lbnQgfSBmcm9tICcuL0Vudmlyb25tZW50JztcclxuaW1wb3J0IEFyZWFzIGZyb20gJy4vQXJlYXMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9jYXRpb24gZXh0ZW5kcyBBYnN0cmFjdExvY2F0aW9uIHtcclxuICAgLyoqXHJcbiAgICAqIEBwYXJhbSB7U2NlbmV9IHNjZW5lXHJcbiAgICAqL1xyXG4gICBjb25zdHJ1Y3RvcihzY2VuZSkge1xyXG4gICAgICBzdXBlcihzY2VuZSk7XHJcbiAgICAgIHRoaXMuaWQgPSAnZHJlYW0tdG93bic7XHJcblxyXG4gICAgICB0aGlzLnNoYWRvd0xpZ2h0UG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygyNSwgNTAsIDI1KTtcclxuXHJcbiAgICAgIHRoaXMuc2NlbmUudWkuc2V0TG9hZGluZyh0cnVlKTtcclxuICAgICAgdGhpcy5zY2VuZS51aS5zZXRQYXVzZSh0cnVlKTtcclxuXHJcbiAgICAgIHRoaXMuZW52aXJvbm1lbnQgPSBjcmVhdGVFbnZpcm9ubWVudCh7XHJcbiAgICAgICAgIGxvYWQ6IHRoaXMuc2NlbmUubW9kZWxzLmxvYWRHTFRGLFxyXG4gICAgICAgICBvbkxvYWQ6ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zY2VuZS51aS5zZXRMb2FkaW5nKGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2NlbmUubm90aWZ5KCdTbW9rZSBJc2xhbmQnKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGdldENoaWxkcmVuRmxhdCA9IG9iamVjdHMgPT4gW10uY29uY2F0KC4uLm9iamVjdHMubWFwKFxyXG4gICAgICAgICAgICAgICBvYmogPT4gb2JqLmNoaWxkcmVuXHJcbiAgICAgICAgICAgICAgICAgID8gW29iaiwgLi4uZ2V0Q2hpbGRyZW5GbGF0KG9iai5jaGlsZHJlbildXHJcbiAgICAgICAgICAgICAgICAgIDogW29ial1cclxuICAgICAgICAgICAgKSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGVudmlyb25tZW50ID0gW3RoaXMuc2NlbmUuc2NlbmUuY2hpbGRyZW4uZmluZChjID0+IGMubmFtZSA9PT0gJ0xFVkVMX0VOVklST05NRU5UJyldO1xyXG4gICAgICAgICAgICB0aGlzLmVudmlyb25tZW50TWVzaGVzID0gZ2V0Q2hpbGRyZW5GbGF0KGVudmlyb25tZW50KS5maWx0ZXIob2JqID0+IG9iai50eXBlID09PSAnTWVzaCcpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zdGFydExvY2F0aW9uKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlTG9jYXRpb25Db2xsaWRlcnMoKTtcclxuICAgICAgICAgICAgdGhpcy5zY2VuZS5wYXRoRmluZGVyLnJlYnVpbGRBcmVhcygpO1xyXG4gICAgICAgICAgICB0aGlzLmlzTG9hZGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9uTG9hZCkge1xyXG4gICAgICAgICAgICAgICB0aGlzLm9uTG9hZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuZW52aXJvbm1lbnRNZXNoZXMgPSBbXTtcclxuXHJcbiAgICAgIGNvbnN0IHJheWNhc3RGYXIgPSA1MDA7XHJcbiAgICAgIHRoaXMucmF5Y2FzdGVyID0ge1xyXG4gICAgICAgICByYXljYXN0ZXI6IG5ldyBUSFJFRS5SYXljYXN0ZXIoKSxcclxuICAgICAgICAgb3JpZ2luOiBuZXcgVEhSRUUuVmVjdG9yMygpLFxyXG4gICAgICAgICB0YXJnZXQ6IG5ldyBUSFJFRS5WZWN0b3IzKCksXHJcbiAgICAgICAgIGRpcmVjdGlvbjogbmV3IFRIUkVFLlZlY3RvcjMoKSxcclxuICAgICAgICAgcmF5Y2FzdEZhcixcclxuICAgICAgICAgaW50ZXJzZWN0VG86IC1yYXljYXN0RmFyIC8gMixcclxuICAgICAgICAgY2FjaGU6IHt9LFxyXG4gICAgICB9O1xyXG4gICAgICB0aGlzLnJheWNhc3Rlci5yYXljYXN0ZXIuZmFyID0gdGhpcy5yYXljYXN0ZXIucmF5Y2FzdEZhcjtcclxuXHJcbiAgICAgIHRoaXMuYW1iaWVudExpZ2h0ID0gdGhpcy5jcmVhdGVBbWJpZW50TGlnaHQoKTtcclxuICAgICAgdGhpcy5zaGFkb3dMaWdodCA9IHRoaXMuY3JlYXRlU2hhZG93TGlnaHQoKTtcclxuICAgICAgdGhpcy5zY2VuZS5zY2VuZS5iYWNrZ3JvdW5kID0gdGhpcy5jcmVhdGVTa3lib3goXCJza3ktYmx1ZVwiKTtcclxuXHJcbiAgICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMuZW52aXJvbm1lbnQpO1xyXG4gICAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLmFtYmllbnRMaWdodCk7XHJcbiAgICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMuc2hhZG93TGlnaHQpO1xyXG5cclxuICAgICAgY29uc3QgY29sb3IgPSAweGQ3ZTZmMztcclxuICAgICAgY29uc3QgbmVhciA9IDEwMDtcclxuICAgICAgY29uc3QgZmFyID0gMzAwO1xyXG4gICAgICB0aGlzLnNjZW5lLnNjZW5lLmZvZyA9IG5ldyBUSFJFRS5Gb2coY29sb3IsIG5lYXIsIGZhcik7XHJcblxyXG4gICAgICB0aGlzLnNjZW5lLmludGVydmFscy5zZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgIHRoaXMuc2NlbmUudW5pdHMuZ2V0QWxpdmVVbml0cygpLmZvckVhY2goKHVuaXQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHVuaXQucG9zaXRpb24ueSA8IC0xMDApIHtcclxuICAgICAgICAgICAgICAgdW5pdC5kaWUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICB9KTtcclxuICAgICAgfSwgMTAwMCk7XHJcblxyXG4gICAgICB0aGlzLnNjZW5lLmludGVydmFscy5zZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgIHRoaXMucmF5Y2FzdGVyLmNhY2hlID0ge307XHJcbiAgICAgIH0sIDYwMDAwKTtcclxuICAgfVxyXG5cclxuICAgdXBkYXRlKCkge1xyXG4gICAgICBzdXBlci51cGRhdGUoKTtcclxuXHJcbiAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMuc2NlbmUuZ2V0UGxheWVyKCk7XHJcblxyXG4gICAgICBpZiAocGxheWVyKSB7XHJcbiAgICAgICAgIHRoaXMuc2hhZG93TGlnaHQucG9zaXRpb25cclxuICAgICAgICAgICAgLmNvcHkocGxheWVyLnBvc2l0aW9uKVxyXG4gICAgICAgICAgICAuYWRkKHRoaXMuc2hhZG93TGlnaHRQb3NpdGlvbik7XHJcblxyXG4gICAgICAgICBpZiAodGhpcy5zaGFkb3dMaWdodC50YXJnZXQgIT09IHBsYXllci5vYmplY3QpIHtcclxuICAgICAgICAgICAgdGhpcy5zaGFkb3dMaWdodC50YXJnZXQgPSBwbGF5ZXIub2JqZWN0O1xyXG4gICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgfVxyXG5cclxuICAgcmV2aXZlSGVybygpIHtcclxuICAgICAgY29uc3QgcGxheWVyID0gdGhpcy5zY2VuZS5nZXRQbGF5ZXIoKTtcclxuICAgICAgcGxheWVyLnBhcmFtcy5ocCA9IHBsYXllci5wYXJhbXMuaHBNYXggLyAyO1xyXG4gICAgICBwbGF5ZXIucG9zaXRpb24uc2V0KC04MCwgNCwgMTMwKTtcclxuICAgICAgcGxheWVyLmFuaW1hdGlvblN0YXRlLmlzRGllID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuc2NlbmUucGFydGljbGVzLmNyZWF0ZUVmZmVjdCh7XHJcbiAgICAgICAgIGVmZmVjdDogJ2xldmVsLXVwL2xldmVsLXVwJyxcclxuICAgICAgICAgc2NhbGU6IDEuNSxcclxuICAgICAgICAgYXR0YWNoVG86IHBsYXllci5vYmplY3QsXHJcbiAgICAgIH0pO1xyXG4gICB9XHJcblxyXG4gICBhZnRlckNsZWFyKCkge1xyXG4gICAgICB0aGlzLnNjZW5lLnVuaXRzLmNyZWF0ZVBsYXllcih7XHJcbiAgICAgICAgIC8qKlxyXG4gICAgICAgICAgKiBAcGFyYW0ge1BsYXllcn0gcGxheWVyXHJcbiAgICAgICAgICAqL1xyXG4gICAgICAgICBvbkNyZWF0ZTogKHBsYXllcikgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNjZW5lLmNhbWVyYS5wbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgICAgICAgICAgIHRoaXMuc2NlbmUudWkudXBkYXRlUGxheWVyUGFyYW1zKCk7XHJcbiAgICAgICAgICAgIHBsYXllci5wb3NpdGlvbi5zZXQoLTgwLCA0LCAxMzApO1xyXG4gICAgICAgICB9LFxyXG4gICAgICAgICBvbkRpZTogKCkgPT4gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNjZW5lLnVpLnNldFBhdXNlKHRydWUpO1xyXG4gICAgICAgICB9LCAyNTAwKSxcclxuICAgICAgICAgb25LaWxsOiBkeWluZ1VuaXQgPT4gdGhpcy5vbktpbGwoZHlpbmdVbml0LCB0aGlzLnNjZW5lLmdldFBsYXllcigpKSxcclxuICAgICAgICAgb25EYW1hZ2VUYWtlbjogKCkgPT4gdGhpcy5zY2VuZS51aS51cGRhdGVQbGF5ZXJQYXJhbXMoKSxcclxuICAgICAgICAgb25Mb2NhdGlvblVwOiAoKSA9PiB0aGlzLnNjZW5lLnVpLnVwZGF0ZVBsYXllclBhcmFtcygpLFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuY3JlYXRlSW50ZXJhY3RpdmVHYW1lT2JqZWN0cygpO1xyXG4gICB9XHJcblxyXG4gICBvbktpbGwoZHlpbmdVbml0LCBraWxsaW5nVW5pdCkge1xyXG4gICAgICB0aGlzLnNjZW5lLnVuaXRzLmdldEFsaXZlVW5pdHMoKVxyXG4gICAgICAgICAuZmlsdGVyKHVuaXQgPT4gKFxyXG4gICAgICAgICAgICAhdW5pdC5pc0VuZW15KGtpbGxpbmdVbml0KVxyXG4gICAgICAgICAgICAmJiB1bml0LmFkZEV4cGVyaWVuY2VcclxuICAgICAgICAgICAgJiYgdW5pdC5wb3NpdGlvbi5kaXN0YW5jZVRvKGR5aW5nVW5pdC5wb3NpdGlvbikgPCA0MFxyXG4gICAgICAgICApKVxyXG4gICAgICAgICAuZm9yRWFjaCh1bml0ID0+IHVuaXQuYWRkRXhwZXJpZW5jZShkeWluZ1VuaXQucGFyYW1zLmJvdW50eSAvIDIpKTtcclxuXHJcbiAgICAgIGlmIChraWxsaW5nVW5pdC5hZGRFeHBlcmllbmNlKSB7XHJcbiAgICAgICAgIGtpbGxpbmdVbml0LmFkZEV4cGVyaWVuY2UoZHlpbmdVbml0LnBhcmFtcy5ib3VudHkgLyAyKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGtpbGxpbmdVbml0LmFkZE1vbmV5KSB7XHJcbiAgICAgICAgIGtpbGxpbmdVbml0LmFkZE1vbmV5KGR5aW5nVW5pdC5wYXJhbXMuYm91bnR5KTtcclxuICAgICAgfVxyXG4gICB9XHJcblxyXG4gICBzdGFydExvY2F0aW9uKCkge1xyXG4gICAgICBpZiAodGhpcy5pbnRlcnZhbCkge1xyXG4gICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xyXG4gICAgICB9XHJcbiAgIH1cclxuXHJcbiAgIHJlc3RhcnRMb2NhdGlvbigpIHtcclxuICAgICAgdGhpcy5zY2VuZS5jbGVhclNjZW5lKCk7XHJcbiAgIH1cclxuXHJcbiAgIHN0b3BMb2NhdGlvbigpIHtcclxuICAgICAgdGhpcy5zY2VuZS5yZW1vdmUodGhpcy5lbnZpcm9ubWVudCk7XHJcbiAgICAgIC8vIHRoaXMuc2NlbmUucmVtb3ZlKHRoaXMuc2t5Ym94KTtcclxuICAgICAgdGhpcy5zY2VuZS5yZW1vdmUodGhpcy5hbWJpZW50TGlnaHQpO1xyXG4gICAgICB0aGlzLnNjZW5lLnJlbW92ZSh0aGlzLnNoYWRvd0xpZ2h0KTtcclxuICAgICAgdGhpcy5zY2VuZS5nYW1lT2JqZWN0c1NlcnZpY2UucmVtb3ZlQWxsRXhjZXB0UGxheWVyKCk7XHJcbiAgICAgIGlmICh0aGlzLmludGVydmFsKSB7XHJcbiAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XHJcbiAgICAgIH1cclxuICAgfVxyXG5cclxuICAgY3JlYXRlSW50ZXJhY3RpdmVHYW1lT2JqZWN0cyhza2lwSXRlbXNDcmVhdGlvbikge1xyXG4gICAgICBpZiAoIXNraXBJdGVtc0NyZWF0aW9uKSB7XHJcbiAgICAgICAgIGNvbnN0IGNyZWF0ZUhlYWxJdGVtID0gKCkgPT4gKFxyXG4gICAgICAgICAgICB0aGlzLnNjZW5lLmludGVydmFscy5zZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgY29uc3QgaXRlbUhlYWxQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKC01Mi41LCAtMS42LCAxMTcpO1xyXG5cclxuICAgICAgICAgICAgICAgdGhpcy5zY2VuZS5nYW1lT2JqZWN0c1NlcnZpY2UuY3JlYXRlSXRlbSh7XHJcbiAgICAgICAgICAgICAgICAgIG1vZGVsOiAnaXRlbS1oZWFsJyxcclxuICAgICAgICAgICAgICAgICAgcG9zaXRpb246IGl0ZW1IZWFsUG9zaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgIGNhblBpY2t1cDogKHVuaXQpID0+ICh1bml0LmdldE1heEhQKCkgLSB1bml0LmdldEhQKCkgPiAwKSxcclxuICAgICAgICAgICAgICAgICAgb25QaWNrdXA6ICh1bml0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgIHVuaXQuYWRkSFAoTWF0aC5yb3VuZCh1bml0LnBhcmFtcy5ocE1heCAqIDAuMjUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgY3JlYXRlSGVhbEl0ZW0oKTtcclxuICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sIDEwMDAwKVxyXG4gICAgICAgICApO1xyXG5cclxuICAgICAgICAgY29uc3QgY3JlYXRlU3dvcmRJdGVtID0gKCkgPT4gKFxyXG4gICAgICAgICAgICB0aGlzLnNjZW5lLmludGVydmFscy5zZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgdGhpcy5zY2VuZS5nYW1lT2JqZWN0c1NlcnZpY2UuY3JlYXRlV2VhcG9uSXRlbSh7XHJcbiAgICAgICAgICAgICAgICAgIG1vZGVsOiAnaXRlbS1zd29yZCcsXHJcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTdGFydGVyXFwncyBTd29yZCAoKzEwIERhbWFnZSknLFxyXG4gICAgICAgICAgICAgICAgICB0eXBlOiAnT25lIEhhbmRlZCcsXHJcbiAgICAgICAgICAgICAgICAgIGJvbmVOYW1lOiAnUmlnaHRfSGFuZCcsXHJcbiAgICAgICAgICAgICAgICAgIGF0dGFjaE1vZGVsTmFtZTogJ2l0ZW0tc3dvcmQnLFxyXG4gICAgICAgICAgICAgICAgICBlZmZlY3RzOiBbeyBkYW1hZ2U6ICsxMCB9XSxcclxuICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBUSFJFRS5WZWN0b3IzKC0yNi41LCAwLCAxMDIpLFxyXG4gICAgICAgICAgICAgICAgICBvblBpY2t1cDogKCkgPT4gY3JlYXRlU3dvcmRJdGVtKCksXHJcbiAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LCAxMDAwMClcclxuICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgIGNyZWF0ZUhlYWxJdGVtKCk7XHJcbiAgICAgICAgIGNyZWF0ZVN3b3JkSXRlbSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBnZXRBSVBhcmFtcyA9ICh7IGxldmVsLCAuLi5wYXJhbXMgfSkgPT4ge1xyXG4gICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAuLi5wYXJhbXMsXHJcbiAgICAgICAgICAgIGxldmVsLFxyXG4gICAgICAgICAgICBzY2FsZTogMSArIChcclxuICAgICAgICAgICAgICAgbGV2ZWwgPD0gMjBcclxuICAgICAgICAgICAgICAgICAgPyBsZXZlbCAvIDIwXHJcbiAgICAgICAgICAgICAgICAgIDogMSArIGxldmVsIC8gNDBcclxuICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgb25EaWU6ICgpID0+IHRoaXMuc2NlbmUudW5pdHMuY3JlYXRlQUkoZ2V0QUlQYXJhbXMoe1xyXG4gICAgICAgICAgICAgICAuLi5wYXJhbXMsXHJcbiAgICAgICAgICAgICAgIGxldmVsOiBsZXZlbCArIDEgKyBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiBsZXZlbCksXHJcbiAgICAgICAgICAgIH0pKSxcclxuICAgICAgICAgfTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGNvbnN0IGdldEdvYXRzUGFyYW1zID0gKGxldmVsLCBwb3NpdGlvbiwgcm90YXRpb24sIG5hbWUpID0+IGdldEFJUGFyYW1zKHtcclxuICAgICAgICAgbGV2ZWwsXHJcbiAgICAgICAgIHBvc2l0aW9uLFxyXG4gICAgICAgICByb3RhdGlvbixcclxuICAgICAgICAgZnJhY3Rpb246ICdnb2F0cycsXHJcbiAgICAgICAgIG5hbWU6IG5hbWUgfHwgKFxyXG4gICAgICAgICAgICAgIGxldmVsIDw9IDEwID8gJ0dvYXQgV2FycmlvcidcclxuICAgICAgICAgICAgOiBsZXZlbCA8PSAyMCA/ICdHb2F0IEVsaXRlJ1xyXG4gICAgICAgICAgICA6IGxldmVsIDw9IDM1ID8gICdHb2F0IENvbW1hbmRvJ1xyXG4gICAgICAgICAgICA6ICdHb2F0IERlc3Ryb3llcidcclxuICAgICAgICAgKSxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb25zdCBnZXRGcmllbmRseVBhcmFtcyA9IChsZXZlbCwgcG9zaXRpb24sIHJvdGF0aW9uLCBwYXJhbXMgPSB7fSkgPT4gZ2V0QUlQYXJhbXMoe1xyXG4gICAgICAgICBsZXZlbCwgcG9zaXRpb24sIHJvdGF0aW9uLCBmcmFjdGlvbjogJ2ZyaWVuZGx5JywgbmFtZTogJ0ZyaWVuZGx5IENpdGl6ZW4nLCAuLi5wYXJhbXNcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnVuaXRzID0gW1xyXG4gICAgICAgICBnZXRHb2F0c1BhcmFtcygyNSwgeyB4OiAtMjEwLCB5OiAzLCB6OiAxNSB9KSxcclxuICAgICAgICAgZ2V0R29hdHNQYXJhbXMoMTUsIHsgeDogLTIxMCwgeTogMywgejogMzAgfSksXHJcbiAgICAgICAgIGdldEdvYXRzUGFyYW1zKDE1LCB7IHg6IC0xOTUsIHk6IDMsIHo6IDE1IH0pLFxyXG5cclxuICAgICAgICAgZ2V0R29hdHNQYXJhbXMoNSwgeyB4OiAtMTMwLCB5OiAzLCB6OiAtMS41IH0pLFxyXG4gICAgICAgICBnZXRHb2F0c1BhcmFtcygxLCB7IHg6IC0xMTcsIHk6IDMsIHo6IC0xIH0pLFxyXG4gICAgICAgICBnZXRHb2F0c1BhcmFtcygxLCB7IHg6IC0xMjAsIHk6IDMsIHo6IC01IH0pLFxyXG5cclxuICAgICAgICAgZ2V0R29hdHNQYXJhbXMoMSwgeyB4OiAtODgsIHk6IDMsIHo6IDUwIH0pLFxyXG4gICAgICAgICBnZXRHb2F0c1BhcmFtcygxLCB7IHg6IC04NiwgeTogMywgejogNjggfSksXHJcblxyXG4gICAgICAgICBnZXRHb2F0c1BhcmFtcygzLCB7IHg6IC0xNDUsIHk6IDYsIHo6IDEwMyB9KSxcclxuICAgICAgICAgZ2V0R29hdHNQYXJhbXMoMSwgeyB4OiAtMTQ3LCB5OiA2LCB6OiAxMDUgfSksXHJcblxyXG4gICAgICAgICBnZXRHb2F0c1BhcmFtcygxLCB7IHg6IC0zMywgeTogNiwgejogLTEgfSksXHJcblxyXG4gICAgICAgICBnZXRHb2F0c1BhcmFtcyg5OSwgeyB4OiAxMDMsIHk6IDE1NSwgejogOTIgfSwgeyB5OiAwLjMgfSwgJ0dvZCBvZiBHb2F0cycpLFxyXG5cclxuICAgICAgICAgZ2V0RnJpZW5kbHlQYXJhbXMoMTAsIHsgeDogLTI1LCB5OiAxLCB6OiAxMDggfSwgeyB5OiAtMS41MyB9LCB7IG5hbWU6ICdTaWx0ZW50IEJvYicgfSksXHJcbiAgICAgICAgIGdldEZyaWVuZGx5UGFyYW1zKDIsIHsgeDogLTY5LCB5OiAwLCB6OiAxMTcgfSwgeyB5OiAwLjEzIH0sIHsgbmFtZTogJ1RhbGtpbmcgSm9obicgfSksXHJcbiAgICAgICAgIGdldEZyaWVuZGx5UGFyYW1zKDMsIHsgeDogLTY5LCB5OiAwLCB6OiAxMTkgfSwgeyB5OiAzLjEgfSwgeyBuYW1lOiAnVGFsa2luZyBJZW4nIH0pLFxyXG4gICAgICAgICBnZXRGcmllbmRseVBhcmFtcyg4LCB7IHg6IC00OCwgeTogNiwgejogODQgfSwgeyB5OiAyLjggfSwgeyBuYW1lOiAnV2FybGlrZSBLZW4nIH0pLFxyXG4gICAgICAgICBnZXRGcmllbmRseVBhcmFtcygzLCB7IHg6IC04MCwgeTogMCwgejogOTcgfSwgeyB5OiAxLjEgfSwgeyBuYW1lOiAnU2NhcnJpbmcgRG9taW5pYycgfSksXHJcbiAgICAgICAgIGdldEZyaWVuZGx5UGFyYW1zKDMsIHsgeDogLTMzLCB5OiAwLCB6OiAxMzcgfSwgeyB5OiAyLjggfSwgeyBuYW1lOiAnQXJyb2dhbnQgR2xlbicgfSksXHJcbiAgICAgIF0uZm9yRWFjaCh0aGlzLnNjZW5lLnVuaXRzLmNyZWF0ZUFJKTtcclxuICAgfVxyXG5cclxuICAgY3JlYXRlTG9jYXRpb25Db2xsaWRlcnMoKSB7XHJcbiAgICAgIHRoaXMuc2NlbmUuY29sbGlkZXJzLmFkZENvbGxpZGVyRnVuY3Rpb24oKHBvc2l0aW9uLCBnYW1lT2JqZWN0KSA9PiB7XHJcbiAgICAgICAgIGNvbnN0IHsgeCwgeSwgeiB9ID0gcG9zaXRpb247XHJcblxyXG4gICAgICAgICBpZiAoIXRoaXMuZW52aXJvbm1lbnRNZXNoZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICB9XHJcblxyXG4gICAgICAgICBjb25zdCBlbnZpcm9ubWVudFkgPSB0aGlzLmdldEVudmlyb25tZW50WShwb3NpdGlvbik7XHJcblxyXG4gICAgICAgICByZXR1cm4gZW52aXJvbm1lbnRZID09PSB0aGlzLnJheWNhc3Rlci5pbnRlcnNlY3RUbyB8fCB5IDwgZW52aXJvbm1lbnRZO1xyXG4gICAgICB9KTtcclxuICAgfVxyXG5cclxuICAgZ2V0RW52aXJvbm1lbnRZKHsgeCwgeiB9KSB7XHJcbiAgICAgIGNvbnN0IHsgaW50ZXJzZWN0VG8gfSA9IHRoaXMucmF5Y2FzdGVyO1xyXG5cclxuICAgICAgaWYgKCF0aGlzLmVudmlyb25tZW50TWVzaGVzLmxlbmd0aCkge1xyXG4gICAgICAgICByZXR1cm4gaW50ZXJzZWN0VG87XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHJheWNhc3RDYWNoZUtleSA9IGAke01hdGgucm91bmQoeCAqIDEwMCkgLyAxMDB9LCAwLCAke01hdGgucm91bmQoeiAqIDEwMCkgLyAxMDB9YDtcclxuICAgICAgY29uc3QgaXNDYWNoZSA9IHR5cGVvZiB0aGlzLnJheWNhc3Rlci5jYWNoZVtyYXljYXN0Q2FjaGVLZXldID09PSAnbnVtYmVyJztcclxuXHJcbiAgICAgIGlmIChpc0NhY2hlKSB7XHJcbiAgICAgICAgIHJldHVybiB0aGlzLnJheWNhc3Rlci5jYWNoZVtyYXljYXN0Q2FjaGVLZXldO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCB7XHJcbiAgICAgICAgIHJheWNhc3RGYXIsXHJcbiAgICAgICAgIGRpcmVjdGlvbixcclxuICAgICAgICAgb3JpZ2luLFxyXG4gICAgICAgICB0YXJnZXQsXHJcbiAgICAgICAgIHJheWNhc3RlcixcclxuICAgICAgfSA9IHRoaXMucmF5Y2FzdGVyO1xyXG5cclxuICAgICAgb3JpZ2luLnNldCh4LCByYXljYXN0RmFyIC8gMiwgeik7XHJcbiAgICAgIHRhcmdldC5zZXQoeCwgLXJheWNhc3RGYXIgLyAyLCB6KTtcclxuICAgICAgcmF5Y2FzdGVyLnNldChvcmlnaW4sIGRpcmVjdGlvbi5zdWJWZWN0b3JzKHRhcmdldCwgb3JpZ2luKS5ub3JtYWxpemUoKSk7XHJcbiAgICAgIGNvbnN0IGludGVyc2VjdHMgPSByYXljYXN0ZXIuaW50ZXJzZWN0T2JqZWN0cyh0aGlzLmVudmlyb25tZW50TWVzaGVzKTtcclxuICAgICAgY29uc3QgZW52aXJvbm1lbnRZID0gTWF0aC5tYXgoaW50ZXJzZWN0VG8sIC4uLmludGVyc2VjdHMubWFwKGkgPT4gcmF5Y2FzdEZhciAvIDIgLSBpLmRpc3RhbmNlKSk7XHJcblxyXG4gICAgICBpZiAoIWlzQ2FjaGUgJiYgZW52aXJvbm1lbnRZICE9PSB0aGlzLnJheWNhc3Rlci5pbnRlcnNlY3RUbykge1xyXG4gICAgICAgICB0aGlzLnJheWNhc3Rlci5jYWNoZVtyYXljYXN0Q2FjaGVLZXldID0gZW52aXJvbm1lbnRZO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gZW52aXJvbm1lbnRZO1xyXG4gICB9XHJcblxyXG4gICBnZXRBcmVhcygpIHtcclxuICAgICAgY29uc3QgYXJlYXMgPSBPYmplY3QudmFsdWVzKEFyZWFzKTtcclxuXHJcbiAgICAgIGNvbnN0IGdlbmVyYXRlV2F5cG9pbnRzID0gKHdpZHRoLCBoZWlnaHQsIG1hcCkgPT4ge1xyXG4gICAgICAgICByZXR1cm4gbmV3IEFycmF5KHdpZHRoKS5maWxsKG51bGwpLm1hcChcclxuICAgICAgICAgICAgKG51bGwxLCB4KSA9PiBuZXcgQXJyYXkoaGVpZ2h0KS5maWxsKG51bGwpLm1hcChcclxuICAgICAgICAgICAgICAgKG51bGwyLCB5KSA9PiBtYXAoeCwgeSksXHJcbiAgICAgICAgICAgICksXHJcbiAgICAgICAgICk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICByZXR1cm4gYXJlYXMubWFwKChhcmVhKSA9PiB7XHJcbiAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHsgLi4uYXJlYSB9O1xyXG5cclxuICAgICAgICAgcmVzdWx0LmdldFdheXBvaW50cyA9ICgpID0+IGdlbmVyYXRlV2F5cG9pbnRzKFxyXG4gICAgICAgICAgICBhcmVhLndpZHRoLFxyXG4gICAgICAgICAgICBhcmVhLmhlaWdodCxcclxuICAgICAgICAgICAgKHgsIHkpID0+IHtcclxuICAgICAgICAgICAgICAgcmV0dXJuIE51bWJlcih0aGlzLmNoZWNrV2F5Rm9yV2F5cG9pbnQoYXJlYS5nZXRXb3JsZFdheXBvaW50QnlYWSh4LCB5KSkpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICk7XHJcblxyXG4gICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9KTtcclxuICAgfVxyXG5cclxuICAgY2hlY2tXYXlGb3JXYXlwb2ludCh7IHgsIHksIHogfSkge1xyXG4gICAgICBjb25zdCBjaGVja1dheSA9IHRoaXMuc2NlbmUuY29sbGlkZXJzLmNoZWNrV2F5O1xyXG4gICAgICBjb25zdCBjaGVja05lYXIgPSAocmFuZ2UsIGRpYWdvbmFsKSA9PiAoXHJcbiAgICAgICAgIGNoZWNrV2F5KG5ldyBUSFJFRS5WZWN0b3IzKHggKyByYW5nZSwgeSwgeikpXHJcbiAgICAgICAgICYmIChjaGVja1dheShuZXcgVEhSRUUuVmVjdG9yMyh4IC0gcmFuZ2UsIHksIHopKSlcclxuICAgICAgICAgJiYgKGNoZWNrV2F5KG5ldyBUSFJFRS5WZWN0b3IzKHgsIHksIHogKyByYW5nZSkpKVxyXG4gICAgICAgICAmJiAoY2hlY2tXYXkobmV3IFRIUkVFLlZlY3RvcjMoeCwgeSwgeiAtIHJhbmdlKSkpXHJcbiAgICAgICAgICYmIChcclxuICAgICAgICAgICAgIWRpYWdvbmFsIHx8IChcclxuICAgICAgICAgICAgICAgY2hlY2tXYXkobmV3IFRIUkVFLlZlY3RvcjMoeCArIHJhbmdlLCB5LCB6ICsgcmFuZ2UpKVxyXG4gICAgICAgICAgICAgICAmJiBjaGVja1dheShuZXcgVEhSRUUuVmVjdG9yMyh4IC0gcmFuZ2UsIHksIHogLSByYW5nZSkpXHJcbiAgICAgICAgICAgICAgICYmIGNoZWNrV2F5KG5ldyBUSFJFRS5WZWN0b3IzKHggLSByYW5nZSwgeSwgeiArIHJhbmdlKSlcclxuICAgICAgICAgICAgICAgJiYgY2hlY2tXYXkobmV3IFRIUkVFLlZlY3RvcjMoeCArIHJhbmdlLCB5LCB6IC0gcmFuZ2UpKVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgIClcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHJldHVybiAoXHJcbiAgICAgICAgIGNoZWNrV2F5KG5ldyBUSFJFRS5WZWN0b3IzKHgsIHksIHopKVxyXG4gICAgICAgICAmJiBjaGVja05lYXIoMSwgdHJ1ZSlcclxuICAgICAgICAgJiYgY2hlY2tOZWFyKDIpXHJcbiAgICAgICk7XHJcbiAgIH1cclxufVxyXG4iLCAiaW1wb3J0IEF1dG9CaW5kTWV0aG9kcyBmcm9tICcuL0F1dG9CaW5kTWV0aG9kcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2xsaWRlcnMgZXh0ZW5kcyBBdXRvQmluZE1ldGhvZHMge1xyXG4gICAgY29uc3RydWN0b3Ioc2NlbmUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgICAgICB0aGlzLmNvbGxpZGVycyA9IFtdO1xyXG4gICAgICAgIHRoaXMubmV4dElkID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBjaGVja1dheShwb3NpdGlvbiwgZ2FtZU9iamVjdCkge1xyXG4gICAgICAgIGZvcihsZXQgY29sbGlkZXIgb2YgdGhpcy5jb2xsaWRlcnMpIHtcclxuICAgICAgICAgICAgaWYgKGNvbGxpZGVyLmZuKHBvc2l0aW9uLCBnYW1lT2JqZWN0KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXNldENvbGxpZGVycygpIHtcclxuICAgICAgICB0aGlzLmNvbGxpZGVycyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZUNvbGxpZGVyKGlkKSB7XHJcbiAgICAgICAgY29uc3QgaWR4ID0gdGhpcy5jb2xsaWRlcnMuZmluZEluZGV4KGMgPT4gYy5pZCA9PT0gaWQpO1xyXG5cclxuICAgICAgICBpZiAoaWR4ID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5jb2xsaWRlcnMuc3BsaWNlKGlkeCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFkZENvbGxpZGVyRnVuY3Rpb24oZm4pIHtcclxuICAgICAgICB0aGlzLmNvbGxpZGVycy5wdXNoKHtcclxuICAgICAgICAgICAgaWQ6IHRoaXMubmV4dElkKyssXHJcbiAgICAgICAgICAgIGZuLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwgImltcG9ydCBBdXRvQmluZE1ldGhvZHMgZnJvbSAnLi9BdXRvQmluZE1ldGhvZHMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kZWxzIGV4dGVuZHMgQXV0b0JpbmRNZXRob2RzIHtcclxuICAgIGNvbnN0cnVjdG9yKHNjZW5lKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcGFyYW1zLnJlcGVhdFhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwYXJhbXMucmVwZWF0WVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5lbWlzc2l2ZVxyXG4gICAgICogQHBhcmFtIHtUSFJFRS5WZWN0b3IzfSBwYXJhbXMucG9zaXRpb25cclxuICAgICAqIEByZXR1cm5zIHtUSFJFRS5NZXNofVxyXG4gICAgICovXHJcbiAgICBjcmVhdGVHZW9tZXRyeShwYXJhbXMpIHtcclxuICAgICAgICBwYXJhbXMgPSBwYXJhbXMgfHwge307XHJcblxyXG4gICAgICAgIGNvbnN0IG1hdGVyaWFsUGFyYW1zID0ge307XHJcblxyXG4gICAgICAgIGlmIChwYXJhbXMuaW1hZ2UpIHtcclxuICAgICAgICAgICAgY29uc3QgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCkubG9hZChwYXJhbXMuaW1hZ2UpO1xyXG4gICAgICAgICAgICB0ZXh0dXJlLndyYXBTID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7XHJcbiAgICAgICAgICAgIHRleHR1cmUud3JhcFQgPSBUSFJFRS5SZXBlYXRXcmFwcGluZztcclxuICAgICAgICAgICAgdGV4dHVyZS5yZXBlYXQuc2V0KHBhcmFtcy5yZXBlYXRYIHx8IDEsIHBhcmFtcy5yZXBlYXRZIHx8IDEpO1xyXG4gICAgICAgICAgICBtYXRlcmlhbFBhcmFtcy5tYXAgPSB0ZXh0dXJlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBhcmFtcy5lbWlzc2l2ZSkge1xyXG4gICAgICAgICAgICBtYXRlcmlhbFBhcmFtcy5lbWlzc2l2ZSA9IG5ldyBUSFJFRS5Db2xvcihwYXJhbXMuZW1pc3NpdmUpO1xyXG4gICAgICAgICAgICBtYXRlcmlhbFBhcmFtcy5lbWlzc2l2ZUludGVuc2l0eSA9IDEuMDtcclxuICAgICAgICAgICAgbWF0ZXJpYWxQYXJhbXMuZW1pc3NpdmVNYXAgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBhcmFtcy5jb2xvcikge1xyXG4gICAgICAgICAgICBtYXRlcmlhbFBhcmFtcy5jb2xvciA9IHBhcmFtcy5jb2xvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLk1lc2goXHJcbiAgICAgICAgICAgIHBhcmFtcy5nZW9tZXRyeSB8fCBuZXcgVEhSRUUuQm94R2VvbWV0cnkoMSwgMSwgMSksXHJcbiAgICAgICAgICAgIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKG1hdGVyaWFsUGFyYW1zKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChwYXJhbXMucm90YXRpb24pIHtcclxuICAgICAgICAgICAgZ2VvbWV0cnkucm90YXRpb24uY29weShwYXJhbXMucm90YXRpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2VvbWV0cnkuc2NhbGUuc2V0KHBhcmFtcy54IHx8IDEsIHBhcmFtcy55IHx8IDEsIHBhcmFtcy56IHx8IDEpO1xyXG5cclxuICAgICAgICBjb25zdCBwaXZvdCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xyXG4gICAgICAgIHBpdm90LmFkZChnZW9tZXRyeSk7XHJcblxyXG4gICAgICAgIGlmIChwYXJhbXMucm90YXRpb24pIHtcclxuICAgICAgICAgICAgcGl2b3Qucm90YXRpb24uY29weShwYXJhbXMucm90YXRpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBhcmFtcy5sb2NhbFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGdlb21ldHJ5LnBvc2l0aW9uLnNldChcclxuICAgICAgICAgICAgICAgIHBhcmFtcy5sb2NhbFBvc2l0aW9uLnggfHwgMCxcclxuICAgICAgICAgICAgICAgIHBhcmFtcy5sb2NhbFBvc2l0aW9uLnkgfHwgMCxcclxuICAgICAgICAgICAgICAgIHBhcmFtcy5sb2NhbFBvc2l0aW9uLnogfHwgMFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBhcmFtcy5wb3NpdGlvbikge1xyXG4gICAgICAgICAgICBwaXZvdC5wb3NpdGlvbi5zZXQoXHJcbiAgICAgICAgICAgICAgICBwYXJhbXMucG9zaXRpb24ueCB8fCAwLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zLnBvc2l0aW9uLnkgfHwgMCxcclxuICAgICAgICAgICAgICAgIHBhcmFtcy5wb3NpdGlvbi56IHx8IDBcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwYXJhbXMucm90YXRpb24pIHtcclxuICAgICAgICAgICAgcGl2b3Qucm90YXRpb24uc2V0KFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zLnJvdGF0aW9uLnggfHwgMCxcclxuICAgICAgICAgICAgICAgIHBhcmFtcy5yb3RhdGlvbi55IHx8IDAsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXMucm90YXRpb24ueiB8fCAwXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXBhcmFtcy5ub1NjZW5lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKHBpdm90KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBwaXZvdDtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkR0xURih7XHJcbiAgICAgICAgYmFzZVVybCxcclxuICAgICAgICBpc0dMVEYgPSBmYWxzZSxcclxuICAgICAgICBub1NjZW5lID0gZmFsc2UsXHJcbiAgICAgICAgY2FsbGJhY2sgPSAoKSA9PiBudWxsLFxyXG4gICAgICAgIGNhc3RTaGFkb3cgPSB0cnVlLFxyXG4gICAgICAgIHJlY2VpdmVTaGFkb3cgPSB0cnVlLFxyXG4gICAgfSkge1xyXG4gICAgICAgIGNvbnN0IGxvYWRlciA9IG5ldyBHTFRGTG9hZGVyKCk7XHJcbiAgICAgICAgY29uc3QgdXJsID0gYCR7YmFzZVVybH0uZ2xiJHtpc0dMVEYgPyAnLmdsdGYnIDogJyd9YDtcclxuICAgICAgICBcclxuICAgICAgICBsb2FkZXIubG9hZCh1cmwsIChsb2FkZWRNb2RlbCkgPT4ge1xyXG4gICAgICAgICAgICBsb2FkZWRNb2RlbC5zY2VuZS50cmF2ZXJzZShmdW5jdGlvbiAoY2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIFRIUkVFLk1lc2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5jYXN0U2hhZG93ID0gY2FzdFNoYWRvdztcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5yZWNlaXZlU2hhZG93ID0gcmVjZWl2ZVNoYWRvdztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBjYWxsYmFjayhsb2FkZWRNb2RlbCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5vU2NlbmUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKGxvYWRlZE1vZGVsLnNjZW5lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwgImltcG9ydCBTY2VuZSBmcm9tICcuL1NjZW5lJztcclxuaW1wb3J0IEF1dG9CaW5kTWV0aG9kcyBmcm9tICcuL0F1dG9CaW5kTWV0aG9kcyc7XHJcbmltcG9ydCBBbmltYXRlZEdhbWVPYmplY3QgZnJvbSAnLi9HYW1lT2JqZWN0cy9BbmltYXRlZEdhbWVPYmplY3QnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFydGljbGVzIGV4dGVuZHMgQXV0b0JpbmRNZXRob2RzIHtcclxuXHQvKipcclxuXHQgKiBAcGFyYW0ge1NjZW5lfSBzY2VuZVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKHNjZW5lKSB7XHJcblx0XHRzdXBlcigpO1xyXG5cdFx0dGhpcy5zY2VuZSA9IHNjZW5lO1xyXG5cdFx0dGhpcy5wYXJ0aWNsZXMgPSBbXTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSh0aW1lKSB7XHJcblx0XHR0aGlzLnBhcnRpY2xlcy5mb3JFYWNoKHAgPT4gcC51cGRhdGUodGltZSkpO1xyXG5cdH1cclxuXHJcblx0ZGVzdHJveShwYXJ0aWNsZVN5c3RlbSkge1xyXG5cdFx0Y29uc3QgaW5kZXggPSB0aGlzLnBhcnRpY2xlcy5pbmRleE9mKHBhcnRpY2xlU3lzdGVtKTtcclxuXHJcblx0XHRpZiAoaW5kZXggPiAtMSkge1xyXG5cdFx0XHR0aGlzLnBhcnRpY2xlcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuc2NlbmUucmVtb3ZlKHBhcnRpY2xlU3lzdGVtLm9iamVjdCk7XHJcblx0fVxyXG5cclxuXHRjcmVhdGVTbm93KCkge1xyXG5cdFx0Y29uc3QgYXJlYSA9IG5ldyBUSFJFRS5WZWN0b3IzKDEwMCwgMjUsIDEwMCk7XHJcblxyXG5cdFx0dGhpcy5jcmVhdGVJbnN0YW50UGFydGljbGVzKHtcclxuXHRcdFx0cGFydGljbGVDb3VudDogMTAwMDAsXHJcblx0XHRcdGNvbG9yOiAweDg4ODg4OCxcclxuXHRcdFx0YmxlbmRpbmc6IFRIUkVFLk5vcm1hbEJsZW5kaW5nLFxyXG5cdFx0XHRwb3NpdGlvbjogbmV3IFRIUkVFLlZlY3RvcjMoLWFyZWEueCAvIDIsIDAsIC1hcmVhLnogLyAyKSxcclxuXHRcdFx0Z2V0UGFydGljbGVQb3NpdGlvbjogKGksIHBvc2l0aW9uID0gdGhpcy5nZXRSYW5kb21Qb3NpdGlvbihhcmVhKSkgPT4ge1xyXG5cdFx0XHRcdGlmIChwb3NpdGlvbi55IDwgMCkge1xyXG5cdFx0XHRcdFx0Y29uc3QgbmV3UG9zaXRpb24gPSB0aGlzLmdldFJhbmRvbVBvc2l0aW9uKGFyZWEpO1xyXG5cdFx0XHRcdFx0cG9zaXRpb24ueCA9IG5ld1Bvc2l0aW9uLng7XHJcblx0XHRcdFx0XHRwb3NpdGlvbi55ID0gYXJlYS55O1xyXG5cdFx0XHRcdFx0cG9zaXRpb24ueiA9IG5ld1Bvc2l0aW9uLno7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gcG9zaXRpb247XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Y3JlYXRlRWZmZWN0KHtcclxuXHRcdHNjYWxlID0gMS41LFxyXG5cdFx0ZWZmZWN0ID0gJ2xldmVsLXVwLWFsdC9sZXZlbC11cCcsXHJcblx0XHRwb3NpdGlvbiA9IHt9LFxyXG5cdFx0YXR0YWNoVG8sXHJcblx0XHRsaWZlVGltZSA9IDIwODAsXHJcblx0fSkge1xyXG5cdFx0dGhpcy5zY2VuZS5tb2RlbHMubG9hZEdMVEYoe1xyXG5cdFx0XHRiYXNlVXJsOiAnLi9hc3NldHMvbW9kZWxzL2VmZmVjdHMvJyArIGVmZmVjdCxcclxuXHRcdFx0bm9TY2VuZTogdHJ1ZSxcclxuXHRcdFx0Y2FzdFNoYWRvdzogZmFsc2UsXHJcblx0XHRcdHJlY2VpdmVTaGFkb3c6IGZhbHNlLFxyXG5cdFx0XHRjYWxsYmFjazogbG9hZGVkT2JqZWN0ID0+IHtcclxuXHRcdFx0XHRsb2FkZWRPYmplY3Quc2NlbmUuc2NhbGUuc2V0KHNjYWxlLCBzY2FsZSwgc2NhbGUpO1xyXG5cclxuXHRcdFx0XHRsb2FkZWRPYmplY3Quc2NlbmUudHJhdmVyc2UoKGNoaWxkKSA9PiB7XHJcblx0XHRcdFx0XHRpZiAoY2hpbGQuaXNNZXNoKSB7XHJcblx0XHRcdFx0XHRcdGNoaWxkLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0Y2hpbGQubWF0ZXJpYWwuYWxwaGFUZXN0ID0gMC41O1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRsb2FkZWRPYmplY3Quc2NlbmUucG9zaXRpb24uc2V0KHBvc2l0aW9uLnggfHwgMCwgcG9zaXRpb24ueSB8fCAwLCBwb3NpdGlvbi56IHx8IDApO1xyXG5cclxuXHRcdFx0XHRpZiAoYXR0YWNoVG8pIHtcclxuXHRcdFx0XHRcdGF0dGFjaFRvLmFkZChsb2FkZWRPYmplY3Quc2NlbmUpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Y29uc3QgZWZmZWN0ID0gbmV3IEFuaW1hdGVkR2FtZU9iamVjdCh7XHJcblx0XHRcdFx0XHRvYmplY3Q6IGxvYWRlZE9iamVjdC5zY2VuZSxcclxuXHRcdFx0XHRcdGFuaW1hdGlvbnM6IGxvYWRlZE9iamVjdC5hbmltYXRpb25zLFxyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHR0aGlzLnNjZW5lLmdhbWVPYmplY3RzU2VydmljZS5ob29rR2FtZU9iamVjdChlZmZlY3QpO1xyXG5cclxuXHRcdFx0XHR0aGlzLnNjZW5lLmludGVydmFscy5zZXRUaW1lb3V0KFxyXG5cdFx0XHRcdFx0KCkgPT4gdGhpcy5zY2VuZS5nYW1lT2JqZWN0c1NlcnZpY2UuZGVzdHJveUdhbWVPYmplY3QoZWZmZWN0KSxcclxuXHRcdFx0XHRcdGxpZmVUaW1lLFxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0bG9hZEVmZmVjdCh7XHJcblx0XHRwYXJ0aWNsZU5hbWUgPSAnYmxvb2QnLFxyXG5cdFx0cG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxyXG5cdFx0c2NhbGUgPSBuZXcgVEhSRUUuVmVjdG9yMygxLCAxLCAxKVxyXG5cdH0gPSB7fSkge1xyXG5cdFx0Y29uc3QgZ2FtZU9iamVjdHNTZXJ2aWNlID0gdGhpcy5zY2VuZS5nYW1lT2JqZWN0c1NlcnZpY2U7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuc2NlbmUubW9kZWxzLmxvYWRHTFRGKHtcclxuXHRcdFx0YmFzZVVybDogYC4vYXNzZXRzL21vZGVscy9lZmZlY3RzLyR7cGFydGljbGVOYW1lfWAsXHJcblx0XHRcdGNhc3RTaGFkb3c6IGZhbHNlLFxyXG5cdFx0XHRyZWNlaXZlU2hhZG93OiBmYWxzZSxcclxuXHRcdFx0Y2FsbGJhY2s6IChnbHRmKSA9PiB7XHJcblx0XHRcdFx0Z2x0Zi5zY2VuZS5wb3NpdGlvbi5jb3B5KHBvc2l0aW9uKTtcclxuXHRcdFx0XHRnbHRmLnNjZW5lLnNjYWxlLmNvcHkoc2NhbGUpO1xyXG5cdFx0XHRcdGdsdGYuc2NlbmUucm90YXRpb24uc2V0KDAsIE1hdGgucmFuZG9tKCkgKiBNYXRoLlBJLCAwKTtcclxuXHJcblx0XHRcdFx0Y29uc3QgcGFydGljbGVTeXN0ZW0gPSBnYW1lT2JqZWN0c1NlcnZpY2UuaG9va0dhbWVPYmplY3QobmV3IEFuaW1hdGVkR2FtZU9iamVjdCh7XHJcblx0XHRcdFx0XHRvYmplY3Q6IGdsdGYuc2NlbmUsXHJcblx0XHRcdFx0XHRhbmltYXRpb25zOiBnbHRmLmFuaW1hdGlvbnMsXHJcblx0XHRcdFx0fSkpO1xyXG5cclxuXHRcdFx0XHR0aGlzLnNjZW5lLmludGVydmFscy5zZXRUaW1lb3V0KFxyXG5cdFx0XHRcdFx0KCkgPT4gdGhpcy5zY2VuZS5nYW1lT2JqZWN0c1NlcnZpY2UuZGVzdHJveUdhbWVPYmplY3QocGFydGljbGVTeXN0ZW0pLFxyXG5cdFx0XHRcdFx0NjI1XHJcblx0XHRcdFx0KTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRjcmVhdGVBdHRhY2hlZFBhcnRpY2xlcyh7XHJcblx0XHRjb3VudCA9IDEwMDAsXHJcblx0XHRub1NjZW5lID0gZmFsc2UsXHJcblx0XHRzaXplID0gMC4wMixcclxuXHRcdGNvbG9yID0gMHhGRkZGRkYsXHJcblx0XHRibGVuZGluZyA9IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXHJcblx0XHRkZXB0aFRlc3QgPSB0cnVlLFxyXG5cdFx0ZGVwdGhXcml0ZSA9IGZhbHNlLFxyXG5cdFx0dHJhbnNwYXJlbnQgPSB0cnVlLFxyXG5cdFx0bGlmZVRpbWUsXHJcblx0XHRwYXJlbnQsXHJcblx0XHR0ZXh0dXJlLFxyXG5cdFx0Z2V0RGVmYXVsdFBhcnRpY2xlVmVsb2NpdHkgPSAoKSA9PiBuZXcgVEhSRUUuVmVjdG9yMyhcclxuXHRcdFx0TWF0aC5yYW5kb20oKSAqIDAuMDEgLSAwLjAwNSxcclxuXHRcdFx0TWF0aC5yYW5kb20oKSAqIDAuMDEgLSAwLjAwMjUsXHJcblx0XHRcdE1hdGgucmFuZG9tKCkgKiAwLjAxIC0gMC4wMDUsXHJcblx0XHQpLFxyXG5cdFx0Z2V0RGVmYXVsdFBhcnRpY2xlUG9zaXRpb24gPSAoKSA9PiBuZXcgVEhSRUUuVmVjdG9yMyhcclxuXHRcdFx0TWF0aC5yYW5kb20oKSAqIDAuMiAtIDAuMSxcclxuXHRcdFx0TWF0aC5yYW5kb20oKSAqIDAuMiAtIDAuMSxcclxuXHRcdFx0TWF0aC5yYW5kb20oKSAqIDAuMiAtIDAuMSxcclxuXHRcdCksXHJcblx0fSA9IHt9KSB7XHJcblx0XHRjb25zdCBwYXJ0aWNhbGVzQ291bnQgPSBjb3VudDtcclxuXHRcdGNvbnN0IHBhcnRpY2xlcyA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xyXG5cdFx0Y29uc3QgdmVydGljZXMgPSBbXTtcclxuXHRcdGNvbnN0IHBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGljYWxlc0NvdW50ICogMyk7XHJcblx0XHRwYXJ0aWNsZXMuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocG9zaXRpb25zLCAzKSk7XHJcblx0XHRjb25zdCBzeW5jUG9zaXRpb25zID0gKCkgPT4ge1xyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0cG9zaXRpb25zW2kgKiAzXSA9IHZlcnRpY2VzW2ldLng7XHJcblx0XHRcdFx0cG9zaXRpb25zW2kgKiAzICsgMV0gPSB2ZXJ0aWNlc1tpXS55O1xyXG5cdFx0XHRcdHBvc2l0aW9uc1tpICogMyArIDJdID0gdmVydGljZXNbaV0uejtcclxuXHRcdFx0fVxyXG5cdFx0XHRwYXJ0aWNsZXMuYXR0cmlidXRlcy5wb3NpdGlvbi5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcblx0XHR9O1xyXG5cdFx0Y29uc3QgcGFydGljbGVzSW5pdGlhbFBvc2l0aW9ucyA9IHt9O1xyXG5cdFx0Y29uc3QgcGFydGljbGVzQ3JlYXRlZEF0ID0ge307XHJcblx0XHRjb25zdCBwYXJ0aWNsZXNMb2NhbFBvc2l0aW9uID0ge307XHJcblx0XHRjb25zdCB2ZWxvY2l0aWVzID0ge307XHJcblx0XHRjb25zdCBtYXRlcmlhbFBhcmFtZXRlcnMgPSB7IGNvbG9yLCBzaXplLCBibGVuZGluZywgZGVwdGhUZXN0LCBkZXB0aFdyaXRlLCB0cmFuc3BhcmVudCB9O1xyXG5cclxuXHRcdGlmICh0ZXh0dXJlKSB7XHJcblx0XHRcdG1hdGVyaWFsUGFyYW1ldGVycy5tYXAgPSB0ZXh0dXJlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IG1hdGVyaWFsID0gbmV3IFRIUkVFLlBvaW50c01hdGVyaWFsKG1hdGVyaWFsUGFyYW1ldGVycyk7XHJcblxyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBwYXJ0aWNhbGVzQ291bnQ7IGkrKykge1xyXG5cdFx0XHRjb25zdCBwYXJ0aWNsZSA9IGdldERlZmF1bHRQYXJ0aWNsZVBvc2l0aW9uKGkpO1xyXG5cdFx0XHRwYXJ0aWNsZXNJbml0aWFsUG9zaXRpb25zW2ldID0gcGFyZW50LnBvc2l0aW9uLmNsb25lKCk7XHJcblxyXG5cdFx0XHR2ZWxvY2l0aWVzW2ldID0gZ2V0RGVmYXVsdFBhcnRpY2xlVmVsb2NpdHkoaSk7XHJcblx0XHRcdHBhcnRpY2xlc0xvY2FsUG9zaXRpb25baV0gPSB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcclxuXHRcdFx0dmVydGljZXMucHVzaChwYXJ0aWNsZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0c3luY1Bvc2l0aW9ucygpO1xyXG5cclxuXHRcdGNvbnN0IHBhcnRpY2xlT2JqZWN0ID0gbmV3IFRIUkVFLlBvaW50cyhwYXJ0aWNsZXMsIG1hdGVyaWFsKTtcclxuXHRcdHBhcnRpY2xlT2JqZWN0LnBvc2l0aW9uLmNvcHkocGFyZW50LnBvc2l0aW9uKTtcclxuXHRcdGNvbnN0IGxpZmVUaW1lTXMgPSBsaWZlVGltZSAqIDEwMDA7XHJcblxyXG5cdFx0Y29uc3QgZ2V0Q3JlYXRlZEF0ID0gKHRpbWUsIG9mZnNldCA9IDApID0+IHRpbWUgICsgb2Zmc2V0ICsgTWF0aC5yYW5kb20oKSAqIGxpZmVUaW1lICogMTAwMCAtIGxpZmVUaW1lICogMTAwMCAvIDI7XHJcblxyXG5cdFx0Y29uc3QgcGFydGljbGVTeXN0ZW0gPSB7XHJcblx0XHRcdG9iamVjdDogcGFydGljbGVPYmplY3QsXHJcblx0XHRcdHBhdXNlOiBmYWxzZSxcclxuXHRcdFx0dXBkYXRlOiBmdW5jdGlvbih0aW1lKSB7XHJcblx0XHRcdFx0cGFydGljbGVPYmplY3QucG9zaXRpb24uY29weShwYXJlbnQucG9zaXRpb24pO1xyXG5cclxuXHRcdFx0XHR2ZXJ0aWNlcy5mb3JFYWNoKChwYXJ0aWNsZSwgaSkgPT4ge1xyXG5cdFx0XHRcdFx0aWYgKCFwYXJ0aWNsZXNDcmVhdGVkQXRbaV0pIHtcclxuXHRcdFx0XHRcdFx0cGFydGljbGVzQ3JlYXRlZEF0W2ldID0gZ2V0Q3JlYXRlZEF0KHRpbWUsIC01MDApO1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0aW1lIC0gcGFydGljbGVzQ3JlYXRlZEF0W2ldID4gbGlmZVRpbWVNcykge1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKHBhcnRpY2xlU3lzdGVtLnBhdXNlKSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8gSGlkZSBwYXJ0aWNsZXMgZmFyIGF3YXkgZnJvbSB0aGUgc2NlbmVcclxuXHRcdFx0XHRcdFx0XHRwYXJ0aWNsZXNJbml0aWFsUG9zaXRpb25zW2ldID0geyB4OiAwLCB5OiAtOTk5OSwgejogMCB9O1xyXG5cdFx0XHRcdFx0XHRcdHZlbG9jaXRpZXNbaV0gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnN0IGRlZmF1bHRQYXJ0aWNhbFBvc2l0aW9uID0gZ2V0RGVmYXVsdFBhcnRpY2xlUG9zaXRpb24oaSk7XHJcblx0XHRcdFx0XHRcdFx0cGFydGljbGVzSW5pdGlhbFBvc2l0aW9uc1tpXSA9IHBhcmVudC5wb3NpdGlvbi5jbG9uZSgpLmFkZChkZWZhdWx0UGFydGljYWxQb3NpdGlvbik7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdHBhcnRpY2xlc0xvY2FsUG9zaXRpb25baV0gPSB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcclxuXHRcdFx0XHRcdFx0cGFydGljbGVzQ3JlYXRlZEF0W2ldID0gZ2V0Q3JlYXRlZEF0KHRpbWUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGNvbnN0IGN1cnJlbnREZWx0YSA9IHtcclxuXHRcdFx0XHRcdFx0eDogcGFydGljbGVzSW5pdGlhbFBvc2l0aW9uc1tpXS54IC0gcGFydGljbGVPYmplY3QucG9zaXRpb24ueCxcclxuXHRcdFx0XHRcdFx0eTogcGFydGljbGVzSW5pdGlhbFBvc2l0aW9uc1tpXS55IC0gcGFydGljbGVPYmplY3QucG9zaXRpb24ueSxcclxuXHRcdFx0XHRcdFx0ejogcGFydGljbGVzSW5pdGlhbFBvc2l0aW9uc1tpXS56IC0gcGFydGljbGVPYmplY3QucG9zaXRpb24ueixcclxuXHRcdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdFx0cGFydGljbGVzTG9jYWxQb3NpdGlvbltpXS54ICs9IHZlbG9jaXRpZXNbaV0ueDtcclxuXHRcdFx0XHRcdHBhcnRpY2xlc0xvY2FsUG9zaXRpb25baV0ueSArPSB2ZWxvY2l0aWVzW2ldLnk7XHJcblx0XHRcdFx0XHRwYXJ0aWNsZXNMb2NhbFBvc2l0aW9uW2ldLnogKz0gdmVsb2NpdGllc1tpXS56O1xyXG5cclxuXHRcdFx0XHRcdHBhcnRpY2xlLnggPSBwYXJ0aWNsZXNMb2NhbFBvc2l0aW9uW2ldLnggKyBjdXJyZW50RGVsdGEueDtcclxuXHRcdFx0XHRcdHBhcnRpY2xlLnkgPSBwYXJ0aWNsZXNMb2NhbFBvc2l0aW9uW2ldLnkgKyBjdXJyZW50RGVsdGEueTtcclxuXHRcdFx0XHRcdHBhcnRpY2xlLnogPSBwYXJ0aWNsZXNMb2NhbFBvc2l0aW9uW2ldLnogKyBjdXJyZW50RGVsdGEuejtcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0c3luY1Bvc2l0aW9ucygpO1xyXG5cdFx0XHR9LFxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLnBhcnRpY2xlcy5wdXNoKHBhcnRpY2xlU3lzdGVtKTtcclxuXHJcblx0XHRpZiAoIW5vU2NlbmUpIHtcclxuXHRcdFx0dGhpcy5zY2VuZS5hZGQocGFydGljbGVTeXN0ZW0ub2JqZWN0KTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gcGFydGljbGVTeXN0ZW07XHJcblx0fVxyXG5cclxuXHRnZXRSYW5kb21Qb3NpdGlvbihhcmVhKSB7XHJcblx0XHRjb25zdCByYW5kb20gPSAoZnJvbSwgdG8pID0+IE1hdGgucmFuZG9tKCkgKiAodG8gLSBmcm9tKSArIGZyb207XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IzKFxyXG5cdFx0XHRyYW5kb20oMCwgYXJlYS54KSxcclxuXHRcdFx0cmFuZG9tKDAsIGFyZWEueSksXHJcblx0XHRcdHJhbmRvbSgwLCBhcmVhLnopLFxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cdGNyZWF0ZUluc3RhbnRQYXJ0aWNsZXMoe1xyXG5cdFx0cGFydGljbGVDb3VudCA9IDEwMDAsXHJcblx0XHRub1NjZW5lID0gZmFsc2UsXHJcblx0XHRwb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDUsIDApLFxyXG5cdFx0c2l6ZSA9IDAuMDEsXHJcblx0XHRjb2xvciA9IDB4RkZGRkZGLFxyXG5cdFx0YmxlbmRpbmcgPSBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxyXG5cdFx0ZGVwdGhUZXN0ID0gdHJ1ZSxcclxuXHRcdHRyYW5zcGFyZW50ID0gdHJ1ZSxcclxuXHRcdGFyZWEgPSBuZXcgVEhSRUUuVmVjdG9yMygxMCwgNSwgMTApLFxyXG5cdFx0Z2V0UGFydGljbGVWZWxvY2l0eSA9ICgpID0+IG5ldyBUSFJFRS5WZWN0b3IzKC0wLjAxLCAtMC4wMSwgMCksXHJcblx0XHRnZXRQYXJ0aWNsZVBvc2l0aW9uID0gKGksIHBvc2l0aW9uID0gdGhpcy5nZXRSYW5kb21Qb3NpdGlvbihhcmVhKSkgPT4gcG9zaXRpb24sXHJcblx0fSA9IHt9KSB7XHJcblx0XHRjb25zdCBwYXJ0aWNsZXMgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuXHRcdGNvbnN0IHZlcnRpY2VzID0gW107XHJcblx0XHRjb25zdCBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlQ291bnQgKiAzKTtcclxuXHRcdHBhcnRpY2xlcy5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShwb3NpdGlvbnMsIDMpKTtcclxuXHRcdGNvbnN0IHN5bmNQb3NpdGlvbnMgPSAoKSA9PiB7XHJcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRwb3NpdGlvbnNbaSAqIDNdID0gdmVydGljZXNbaV0ueDtcclxuXHRcdFx0XHRwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IHZlcnRpY2VzW2ldLnk7XHJcblx0XHRcdFx0cG9zaXRpb25zW2kgKiAzICsgMl0gPSB2ZXJ0aWNlc1tpXS56O1xyXG5cdFx0XHR9XHJcblx0XHRcdHBhcnRpY2xlcy5hdHRyaWJ1dGVzLnBvc2l0aW9uLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuXHRcdH07XHJcblxyXG5cdFx0Y29uc3QgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoeyBjb2xvciwgc2l6ZSwgYmxlbmRpbmcsIGRlcHRoVGVzdCwgdHJhbnNwYXJlbnQgfSk7XHJcblxyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0aWNsZUNvdW50OyBpKyspIHtcclxuXHRcdFx0Y29uc3QgcGFydGljbGUgPSBnZXRQYXJ0aWNsZVBvc2l0aW9uKGkpO1xyXG5cdFx0XHR2ZXJ0aWNlcy5wdXNoKHBhcnRpY2xlKTtcclxuXHRcdH1cclxuXHJcblx0XHRzeW5jUG9zaXRpb25zKCk7XHJcblxyXG5cdFx0Y29uc3QgcGFydGljbGVTeXN0ZW0gPSBuZXcgVEhSRUUuUG9pbnRzKHBhcnRpY2xlcywgbWF0ZXJpYWwpO1xyXG5cdFx0cGFydGljbGVTeXN0ZW0ucG9zaXRpb24uY29weShwb3NpdGlvbik7XHJcblxyXG5cdFx0dGhpcy5wYXJ0aWNsZXMucHVzaCh7XHJcblx0XHRcdG9iamVjdDogcGFydGljbGVTeXN0ZW0sXHJcblx0XHRcdHVwZGF0ZTogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0bGV0IGluZGV4ID0gcGFydGljbGVDb3VudDtcclxuXHJcblx0XHRcdFx0d2hpbGUgKGluZGV4LS0pIHtcclxuXHRcdFx0XHRcdGNvbnN0IHBhcnRpY2xlID0gdmVydGljZXNbaW5kZXhdO1xyXG5cclxuXHRcdFx0XHRcdHBhcnRpY2xlLnZlbG9jaXR5ID0gZ2V0UGFydGljbGVWZWxvY2l0eShpbmRleCwgcGFydGljbGUpO1xyXG5cclxuXHRcdFx0XHRcdHBhcnRpY2xlLnggKz0gcGFydGljbGUudmVsb2NpdHkueDtcclxuXHRcdFx0XHRcdHBhcnRpY2xlLnkgKz0gcGFydGljbGUudmVsb2NpdHkueTtcclxuXHRcdFx0XHRcdHBhcnRpY2xlLnogKz0gcGFydGljbGUudmVsb2NpdHkuejtcclxuXHJcblx0XHRcdFx0XHRjb25zdCBwYXJ0aWNsZVBvc2l0aW9uID0gZ2V0UGFydGljbGVQb3NpdGlvbihpbmRleCwgcGFydGljbGUpO1xyXG5cclxuXHRcdFx0XHRcdHBhcnRpY2xlLnggPSBwYXJ0aWNsZVBvc2l0aW9uLng7XHJcblx0XHRcdFx0XHRwYXJ0aWNsZS55ID0gcGFydGljbGVQb3NpdGlvbi55O1xyXG5cdFx0XHRcdFx0cGFydGljbGUueiA9IHBhcnRpY2xlUG9zaXRpb24uejtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHN5bmNQb3NpdGlvbnMoKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cclxuXHRcdGlmICghbm9TY2VuZSkge1xyXG5cdFx0XHR0aGlzLnNjZW5lLmFkZChwYXJ0aWNsZVN5c3RlbSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHBhcnRpY2xlU3lzdGVtO1xyXG5cdH1cclxufSIsICIvLyBqYXZhc2NyaXB0LWFzdGFyIDAuNC4xXHJcbi8vIGh0dHA6Ly9naXRodWIuY29tL2Jncmlucy9qYXZhc2NyaXB0LWFzdGFyXHJcbi8vIEZyZWVseSBkaXN0cmlidXRhYmxlIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cclxuLy8gSW1wbGVtZW50cyB0aGUgYXN0YXIgc2VhcmNoIGFsZ29yaXRobSBpbiBqYXZhc2NyaXB0IHVzaW5nIGEgQmluYXJ5IEhlYXAuXHJcbi8vIEluY2x1ZGVzIEJpbmFyeSBIZWFwICh3aXRoIG1vZGlmaWNhdGlvbnMpIGZyb20gTWFyaWpuIEhhdmVyYmVrZS5cclxuLy8gaHR0cDovL2Vsb3F1ZW50amF2YXNjcmlwdC5uZXQvYXBwZW5kaXgyLmh0bWxcclxuY29uc3QgQVN0YXIgPSAoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgZnVuY3Rpb24gcGF0aFRvKG5vZGUpIHtcclxuICAgICAgICB2YXIgY3VyciA9IG5vZGU7XHJcbiAgICAgICAgdmFyIHBhdGggPSBbXTtcclxuICAgICAgICB3aGlsZSAoY3Vyci5wYXJlbnQpIHtcclxuICAgICAgICAgICAgcGF0aC51bnNoaWZ0KGN1cnIpO1xyXG4gICAgICAgICAgICBjdXJyID0gY3Vyci5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYXRoO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldEhlYXAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCaW5hcnlIZWFwKGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGUuZjtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgYXN0YXIgPSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUGVyZm9ybSBhbiBBKiBTZWFyY2ggb24gYSBncmFwaCBnaXZlbiBhIHN0YXJ0IGFuZCBlbmQgbm9kZS5cclxuICAgICAgICAgKiBAcGFyYW0ge0dyYXBofSBncmFwaFxyXG4gICAgICAgICAqIEBwYXJhbSB7R3JpZE5vZGV9IHN0YXJ0XHJcbiAgICAgICAgICogQHBhcmFtIHtHcmlkTm9kZX0gZW5kXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICAgICAqIEBwYXJhbSB7Ym9vbH0gW29wdGlvbnMuY2xvc2VzdF0gU3BlY2lmaWVzIHdoZXRoZXIgdG8gcmV0dXJuIHRoZVxyXG4gICAgICAgICBwYXRoIHRvIHRoZSBjbG9zZXN0IG5vZGUgaWYgdGhlIHRhcmdldCBpcyB1bnJlYWNoYWJsZS5cclxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb3B0aW9ucy5oZXVyaXN0aWNdIEhldXJpc3RpYyBmdW5jdGlvbiAoc2VlXHJcbiAgICAgICAgICogICAgICAgICAgYXN0YXIuaGV1cmlzdGljcykuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2VhcmNoOiBmdW5jdGlvbihncmFwaCwgc3RhcnQsIGVuZCwgb3B0aW9ucykge1xyXG4gICAgICAgICAgICBncmFwaC5jbGVhbkRpcnR5KCk7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG4gICAgICAgICAgICB2YXIgaGV1cmlzdGljID0gb3B0aW9ucy5oZXVyaXN0aWMgfHwgYXN0YXIuaGV1cmlzdGljcy5tYW5oYXR0YW47XHJcbiAgICAgICAgICAgIHZhciBjbG9zZXN0ID0gb3B0aW9ucy5jbG9zZXN0IHx8IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgdmFyIG9wZW5IZWFwID0gZ2V0SGVhcCgpO1xyXG4gICAgICAgICAgICB2YXIgY2xvc2VzdE5vZGUgPSBzdGFydDsgLy8gc2V0IHRoZSBzdGFydCBub2RlIHRvIGJlIHRoZSBjbG9zZXN0IGlmIHJlcXVpcmVkXHJcblxyXG4gICAgICAgICAgICBzdGFydC5oID0gaGV1cmlzdGljKHN0YXJ0LCBlbmQpO1xyXG4gICAgICAgICAgICBncmFwaC5tYXJrRGlydHkoc3RhcnQpO1xyXG5cclxuICAgICAgICAgICAgb3BlbkhlYXAucHVzaChzdGFydCk7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAob3BlbkhlYXAuc2l6ZSgpID4gMCkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEdyYWIgdGhlIGxvd2VzdCBmKHgpIHRvIHByb2Nlc3MgbmV4dC4gIEhlYXAga2VlcHMgdGhpcyBzb3J0ZWQgZm9yIHVzLlxyXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnROb2RlID0gb3BlbkhlYXAucG9wKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRW5kIGNhc2UgLS0gcmVzdWx0IGhhcyBiZWVuIGZvdW5kLCByZXR1cm4gdGhlIHRyYWNlZCBwYXRoLlxyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnROb2RlID09PSBlbmQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGF0aFRvKGN1cnJlbnROb2RlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBOb3JtYWwgY2FzZSAtLSBtb3ZlIGN1cnJlbnROb2RlIGZyb20gb3BlbiB0byBjbG9zZWQsIHByb2Nlc3MgZWFjaCBvZiBpdHMgbmVpZ2hib3JzLlxyXG4gICAgICAgICAgICAgICAgY3VycmVudE5vZGUuY2xvc2VkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBGaW5kIGFsbCBuZWlnaGJvcnMgZm9yIHRoZSBjdXJyZW50IG5vZGUuXHJcbiAgICAgICAgICAgICAgICB2YXIgbmVpZ2hib3JzID0gZ3JhcGgubmVpZ2hib3JzKGN1cnJlbnROb2RlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWwgPSBuZWlnaGJvcnMubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZWlnaGJvciA9IG5laWdoYm9yc1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5laWdoYm9yLmNsb3NlZCB8fCBuZWlnaGJvci5pc1dhbGwoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3QgYSB2YWxpZCBub2RlIHRvIHByb2Nlc3MsIHNraXAgdG8gbmV4dCBuZWlnaGJvci5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZyBzY29yZSBpcyB0aGUgc2hvcnRlc3QgZGlzdGFuY2UgZnJvbSBzdGFydCB0byBjdXJyZW50IG5vZGUuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgbmVlZCB0byBjaGVjayBpZiB0aGUgcGF0aCB3ZSBoYXZlIGFycml2ZWQgYXQgdGhpcyBuZWlnaGJvciBpcyB0aGUgc2hvcnRlc3Qgb25lIHdlIGhhdmUgc2VlbiB5ZXQuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdTY29yZSA9IGN1cnJlbnROb2RlLmcgKyBuZWlnaGJvci5nZXRDb3N0KGN1cnJlbnROb2RlKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYmVlblZpc2l0ZWQgPSBuZWlnaGJvci52aXNpdGVkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWJlZW5WaXNpdGVkIHx8IGdTY29yZSA8IG5laWdoYm9yLmcpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvdW5kIGFuIG9wdGltYWwgKHNvIGZhcikgcGF0aCB0byB0aGlzIG5vZGUuICBUYWtlIHNjb3JlIGZvciBub2RlIHRvIHNlZSBob3cgZ29vZCBpdCBpcy5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbmVpZ2hib3IudmlzaXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5laWdoYm9yLnBhcmVudCA9IGN1cnJlbnROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZWlnaGJvci5oID0gbmVpZ2hib3IuaCB8fCBoZXVyaXN0aWMobmVpZ2hib3IsIGVuZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5laWdoYm9yLmcgPSBnU2NvcmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5laWdoYm9yLmYgPSBuZWlnaGJvci5nICsgbmVpZ2hib3IuaDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JhcGgubWFya0RpcnR5KG5laWdoYm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNsb3Nlc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBuZWlnaGJvdXIgaXMgY2xvc2VyIHRoYW4gdGhlIGN1cnJlbnQgY2xvc2VzdE5vZGUgb3IgaWYgaXQncyBlcXVhbGx5IGNsb3NlIGJ1dCBoYXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEgY2hlYXBlciBwYXRoIHRoYW4gdGhlIGN1cnJlbnQgY2xvc2VzdCBub2RlIHRoZW4gaXQgYmVjb21lcyB0aGUgY2xvc2VzdCBub2RlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmVpZ2hib3IuaCA8IGNsb3Nlc3ROb2RlLmggfHwgKG5laWdoYm9yLmggPT09IGNsb3Nlc3ROb2RlLmggJiYgbmVpZ2hib3IuZyA8IGNsb3Nlc3ROb2RlLmcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VzdE5vZGUgPSBuZWlnaGJvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFiZWVuVmlzaXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHVzaGluZyB0byBoZWFwIHdpbGwgcHV0IGl0IGluIHByb3BlciBwbGFjZSBiYXNlZCBvbiB0aGUgJ2YnIHZhbHVlLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbkhlYXAucHVzaChuZWlnaGJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBbHJlYWR5IHNlZW4gdGhlIG5vZGUsIGJ1dCBzaW5jZSBpdCBoYXMgYmVlbiByZXNjb3JlZCB3ZSBuZWVkIHRvIHJlb3JkZXIgaXQgaW4gdGhlIGhlYXBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW5IZWFwLnJlc2NvcmVFbGVtZW50KG5laWdoYm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNsb3Nlc3QpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwYXRoVG8oY2xvc2VzdE5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBObyByZXN1bHQgd2FzIGZvdW5kIC0gZW1wdHkgYXJyYXkgc2lnbmlmaWVzIGZhaWx1cmUgdG8gZmluZCBwYXRoLlxyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyBTZWUgbGlzdCBvZiBoZXVyaXN0aWNzOiBodHRwOi8vdGhlb3J5LnN0YW5mb3JkLmVkdS9+YW1pdHAvR2FtZVByb2dyYW1taW5nL0hldXJpc3RpY3MuaHRtbFxyXG4gICAgICAgIGhldXJpc3RpY3M6IHtcclxuICAgICAgICAgICAgbWFuaGF0dGFuOiBmdW5jdGlvbihwb3MwLCBwb3MxKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZDEgPSBNYXRoLmFicyhwb3MxLnggLSBwb3MwLngpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGQyID0gTWF0aC5hYnMocG9zMS55IC0gcG9zMC55KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkMSArIGQyO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkaWFnb25hbDogZnVuY3Rpb24ocG9zMCwgcG9zMSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIEQgPSAxO1xyXG4gICAgICAgICAgICAgICAgdmFyIEQyID0gTWF0aC5zcXJ0KDIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGQxID0gTWF0aC5hYnMocG9zMS54IC0gcG9zMC54KTtcclxuICAgICAgICAgICAgICAgIHZhciBkMiA9IE1hdGguYWJzKHBvczEueSAtIHBvczAueSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKEQgKiAoZDEgKyBkMikpICsgKChEMiAtICgyICogRCkpICogTWF0aC5taW4oZDEsIGQyKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNsZWFuTm9kZTogZnVuY3Rpb24obm9kZSkge1xyXG4gICAgICAgICAgICBub2RlLmYgPSAwO1xyXG4gICAgICAgICAgICBub2RlLmcgPSAwO1xyXG4gICAgICAgICAgICBub2RlLmggPSAwO1xyXG4gICAgICAgICAgICBub2RlLnZpc2l0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgbm9kZS5jbG9zZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgbm9kZS5wYXJlbnQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIGdyYXBoIG1lbW9yeSBzdHJ1Y3R1cmVcclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGdyaWRJbiAyRCBhcnJheSBvZiBpbnB1dCB3ZWlnaHRzXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2x9IFtvcHRpb25zLmRpYWdvbmFsXSBTcGVjaWZpZXMgd2hldGhlciBkaWFnb25hbCBtb3ZlcyBhcmUgYWxsb3dlZFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBHcmFwaChncmlkSW4sIG9wdGlvbnMpIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuICAgICAgICB0aGlzLm5vZGVzID0gW107XHJcbiAgICAgICAgdGhpcy5kaWFnb25hbCA9ICEhb3B0aW9ucy5kaWFnb25hbDtcclxuICAgICAgICB0aGlzLmdyaWQgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IGdyaWRJbi5sZW5ndGg7IHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLmdyaWRbeF0gPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSAwLCByb3cgPSBncmlkSW5beF07IHkgPCByb3cubGVuZ3RoOyB5KyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBub2RlID0gbmV3IEdyaWROb2RlKHgsIHksIHJvd1t5XSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRbeF1beV0gPSBub2RlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIEdyYXBoLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5kaXJ0eU5vZGVzID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGFzdGFyLmNsZWFuTm9kZSh0aGlzLm5vZGVzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIEdyYXBoLnByb3RvdHlwZS5jbGVhbkRpcnR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRpcnR5Tm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgYXN0YXIuY2xlYW5Ob2RlKHRoaXMuZGlydHlOb2Rlc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGlydHlOb2RlcyA9IFtdO1xyXG4gICAgfTtcclxuXHJcbiAgICBHcmFwaC5wcm90b3R5cGUubWFya0RpcnR5ID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgICAgIHRoaXMuZGlydHlOb2Rlcy5wdXNoKG5vZGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBHcmFwaC5wcm90b3R5cGUubmVpZ2hib3JzID0gZnVuY3Rpb24obm9kZSkge1xyXG4gICAgICAgIHZhciByZXQgPSBbXTtcclxuICAgICAgICB2YXIgeCA9IG5vZGUueDtcclxuICAgICAgICB2YXIgeSA9IG5vZGUueTtcclxuICAgICAgICB2YXIgZ3JpZCA9IHRoaXMuZ3JpZDtcclxuXHJcbiAgICAgICAgLy8gV2VzdFxyXG4gICAgICAgIGlmIChncmlkW3ggLSAxXSAmJiBncmlkW3ggLSAxXVt5XSkge1xyXG4gICAgICAgICAgICByZXQucHVzaChncmlkW3ggLSAxXVt5XSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFYXN0XHJcbiAgICAgICAgaWYgKGdyaWRbeCArIDFdICYmIGdyaWRbeCArIDFdW3ldKSB7XHJcbiAgICAgICAgICAgIHJldC5wdXNoKGdyaWRbeCArIDFdW3ldKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNvdXRoXHJcbiAgICAgICAgaWYgKGdyaWRbeF0gJiYgZ3JpZFt4XVt5IC0gMV0pIHtcclxuICAgICAgICAgICAgcmV0LnB1c2goZ3JpZFt4XVt5IC0gMV0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTm9ydGhcclxuICAgICAgICBpZiAoZ3JpZFt4XSAmJiBncmlkW3hdW3kgKyAxXSkge1xyXG4gICAgICAgICAgICByZXQucHVzaChncmlkW3hdW3kgKyAxXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5kaWFnb25hbCkge1xyXG4gICAgICAgICAgICAvLyBTb3V0aHdlc3RcclxuICAgICAgICAgICAgaWYgKGdyaWRbeCAtIDFdICYmIGdyaWRbeCAtIDFdW3kgLSAxXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0LnB1c2goZ3JpZFt4IC0gMV1beSAtIDFdKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gU291dGhlYXN0XHJcbiAgICAgICAgICAgIGlmIChncmlkW3ggKyAxXSAmJiBncmlkW3ggKyAxXVt5IC0gMV0pIHtcclxuICAgICAgICAgICAgICAgIHJldC5wdXNoKGdyaWRbeCArIDFdW3kgLSAxXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIE5vcnRod2VzdFxyXG4gICAgICAgICAgICBpZiAoZ3JpZFt4IC0gMV0gJiYgZ3JpZFt4IC0gMV1beSArIDFdKSB7XHJcbiAgICAgICAgICAgICAgICByZXQucHVzaChncmlkW3ggLSAxXVt5ICsgMV0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBOb3J0aGVhc3RcclxuICAgICAgICAgICAgaWYgKGdyaWRbeCArIDFdICYmIGdyaWRbeCArIDFdW3kgKyAxXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0LnB1c2goZ3JpZFt4ICsgMV1beSArIDFdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH07XHJcblxyXG4gICAgR3JhcGgucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGdyYXBoU3RyaW5nID0gW107XHJcbiAgICAgICAgdmFyIG5vZGVzID0gdGhpcy5ncmlkO1xyXG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgbm9kZXMubGVuZ3RoOyB4KyspIHtcclxuICAgICAgICAgICAgdmFyIHJvd0RlYnVnID0gW107XHJcbiAgICAgICAgICAgIHZhciByb3cgPSBub2Rlc1t4XTtcclxuICAgICAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCByb3cubGVuZ3RoOyB5KyspIHtcclxuICAgICAgICAgICAgICAgIHJvd0RlYnVnLnB1c2gocm93W3ldLndlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZ3JhcGhTdHJpbmcucHVzaChyb3dEZWJ1Zy5qb2luKFwiIFwiKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBncmFwaFN0cmluZy5qb2luKFwiXFxuXCIpO1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBHcmlkTm9kZSh4LCB5LCB3ZWlnaHQpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy53ZWlnaHQgPSB3ZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgR3JpZE5vZGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIFwiW1wiICsgdGhpcy54ICsgXCIgXCIgKyB0aGlzLnkgKyBcIl1cIjtcclxuICAgIH07XHJcblxyXG4gICAgR3JpZE5vZGUucHJvdG90eXBlLmdldENvc3QgPSBmdW5jdGlvbihmcm9tTmVpZ2hib3IpIHtcclxuICAgICAgICAvLyBUYWtlIGRpYWdvbmFsIHdlaWdodCBpbnRvIGNvbnNpZGVyYXRpb24uXHJcbiAgICAgICAgaWYgKGZyb21OZWlnaGJvciAmJiBmcm9tTmVpZ2hib3IueCAhPSB0aGlzLnggJiYgZnJvbU5laWdoYm9yLnkgIT0gdGhpcy55KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndlaWdodCAqIDEuNDE0MjE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLndlaWdodDtcclxuICAgIH07XHJcblxyXG4gICAgR3JpZE5vZGUucHJvdG90eXBlLmlzV2FsbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLndlaWdodCA9PT0gMDtcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gQmluYXJ5SGVhcChzY29yZUZ1bmN0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZW50ID0gW107XHJcbiAgICAgICAgdGhpcy5zY29yZUZ1bmN0aW9uID0gc2NvcmVGdW5jdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBCaW5hcnlIZWFwLnByb3RvdHlwZSA9IHtcclxuICAgICAgICBwdXNoOiBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgbmV3IGVsZW1lbnQgdG8gdGhlIGVuZCBvZiB0aGUgYXJyYXkuXHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudC5wdXNoKGVsZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWxsb3cgaXQgdG8gc2luayBkb3duLlxyXG4gICAgICAgICAgICB0aGlzLnNpbmtEb3duKHRoaXMuY29udGVudC5sZW5ndGggLSAxKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBvcDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIFN0b3JlIHRoZSBmaXJzdCBlbGVtZW50IHNvIHdlIGNhbiByZXR1cm4gaXQgbGF0ZXIuXHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmNvbnRlbnRbMF07XHJcbiAgICAgICAgICAgIC8vIEdldCB0aGUgZWxlbWVudCBhdCB0aGUgZW5kIG9mIHRoZSBhcnJheS5cclxuICAgICAgICAgICAgdmFyIGVuZCA9IHRoaXMuY29udGVudC5wb3AoKTtcclxuICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIGFueSBlbGVtZW50cyBsZWZ0LCBwdXQgdGhlIGVuZCBlbGVtZW50IGF0IHRoZVxyXG4gICAgICAgICAgICAvLyBzdGFydCwgYW5kIGxldCBpdCBidWJibGUgdXAuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRlbnQubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50WzBdID0gZW5kO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWJibGVVcCgwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihub2RlKSB7XHJcbiAgICAgICAgICAgIHZhciBpID0gdGhpcy5jb250ZW50LmluZGV4T2Yobm9kZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBXaGVuIGl0IGlzIGZvdW5kLCB0aGUgcHJvY2VzcyBzZWVuIGluICdwb3AnIGlzIHJlcGVhdGVkXHJcbiAgICAgICAgICAgIC8vIHRvIGZpbGwgdXAgdGhlIGhvbGUuXHJcbiAgICAgICAgICAgIHZhciBlbmQgPSB0aGlzLmNvbnRlbnQucG9wKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaSAhPT0gdGhpcy5jb250ZW50Lmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFtpXSA9IGVuZDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zY29yZUZ1bmN0aW9uKGVuZCkgPCB0aGlzLnNjb3JlRnVuY3Rpb24obm9kZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNpbmtEb3duKGkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1YmJsZVVwKGkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaXplOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udGVudC5sZW5ndGg7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNjb3JlRWxlbWVudDogZnVuY3Rpb24obm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNpbmtEb3duKHRoaXMuY29udGVudC5pbmRleE9mKG5vZGUpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNpbmtEb3duOiBmdW5jdGlvbihuKSB7XHJcbiAgICAgICAgICAgIC8vIEZldGNoIHRoZSBlbGVtZW50IHRoYXQgaGFzIHRvIGJlIHN1bmsuXHJcbiAgICAgICAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5jb250ZW50W25dO1xyXG5cclxuICAgICAgICAgICAgLy8gV2hlbiBhdCAwLCBhbiBlbGVtZW50IGNhbiBub3Qgc2luayBhbnkgZnVydGhlci5cclxuICAgICAgICAgICAgd2hpbGUgKG4gPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ29tcHV0ZSB0aGUgcGFyZW50IGVsZW1lbnQncyBpbmRleCwgYW5kIGZldGNoIGl0LlxyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmVudE4gPSAoKG4gKyAxKSA+PiAxKSAtIDE7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5jb250ZW50W3BhcmVudE5dO1xyXG4gICAgICAgICAgICAgICAgLy8gU3dhcCB0aGUgZWxlbWVudHMgaWYgdGhlIHBhcmVudCBpcyBncmVhdGVyLlxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2NvcmVGdW5jdGlvbihlbGVtZW50KSA8IHRoaXMuc2NvcmVGdW5jdGlvbihwYXJlbnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50W3BhcmVudE5dID0gZWxlbWVudDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRbbl0gPSBwYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVXBkYXRlICduJyB0byBjb250aW51ZSBhdCB0aGUgbmV3IHBvc2l0aW9uLlxyXG4gICAgICAgICAgICAgICAgICAgIG4gPSBwYXJlbnROO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gRm91bmQgYSBwYXJlbnQgdGhhdCBpcyBsZXNzLCBubyBuZWVkIHRvIHNpbmsgYW55IGZ1cnRoZXIuXHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnViYmxlVXA6IGZ1bmN0aW9uKG4pIHtcclxuICAgICAgICAgICAgLy8gTG9vayB1cCB0aGUgdGFyZ2V0IGVsZW1lbnQgYW5kIGl0cyBzY29yZS5cclxuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IHRoaXMuY29udGVudC5sZW5ndGg7XHJcbiAgICAgICAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5jb250ZW50W25dO1xyXG4gICAgICAgICAgICB2YXIgZWxlbVNjb3JlID0gdGhpcy5zY29yZUZ1bmN0aW9uKGVsZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIC8vIENvbXB1dGUgdGhlIGluZGljZXMgb2YgdGhlIGNoaWxkIGVsZW1lbnRzLlxyXG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkMk4gPSAobiArIDEpIDw8IDE7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGQxTiA9IGNoaWxkMk4gLSAxO1xyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB1c2VkIHRvIHN0b3JlIHRoZSBuZXcgcG9zaXRpb24gb2YgdGhlIGVsZW1lbnQsIGlmIGFueS5cclxuICAgICAgICAgICAgICAgIHZhciBzd2FwID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHZhciBjaGlsZDFTY29yZTtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBmaXJzdCBjaGlsZCBleGlzdHMgKGlzIGluc2lkZSB0aGUgYXJyYXkpLi4uXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQxTiA8IGxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIExvb2sgaXQgdXAgYW5kIGNvbXB1dGUgaXRzIHNjb3JlLlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZDEgPSB0aGlzLmNvbnRlbnRbY2hpbGQxTl07XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQxU2NvcmUgPSB0aGlzLnNjb3JlRnVuY3Rpb24oY2hpbGQxKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIHNjb3JlIGlzIGxlc3MgdGhhbiBvdXIgZWxlbWVudCdzLCB3ZSBuZWVkIHRvIHN3YXAuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkMVNjb3JlIDwgZWxlbVNjb3JlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3YXAgPSBjaGlsZDFOO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBEbyB0aGUgc2FtZSBjaGVja3MgZm9yIHRoZSBvdGhlciBjaGlsZC5cclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZDJOIDwgbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkMiA9IHRoaXMuY29udGVudFtjaGlsZDJOXTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGQyU2NvcmUgPSB0aGlzLnNjb3JlRnVuY3Rpb24oY2hpbGQyKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQyU2NvcmUgPCAoc3dhcCA9PT0gbnVsbCA/IGVsZW1TY29yZSA6IGNoaWxkMVNjb3JlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2FwID0gY2hpbGQyTjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIGVsZW1lbnQgbmVlZHMgdG8gYmUgbW92ZWQsIHN3YXAgaXQsIGFuZCBjb250aW51ZS5cclxuICAgICAgICAgICAgICAgIGlmIChzd2FwICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50W25dID0gdGhpcy5jb250ZW50W3N3YXBdO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFtzd2FwXSA9IGVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgbiA9IHN3YXA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UsIHdlIGFyZSBkb25lLlxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgYXN0YXI6IGFzdGFyLFxyXG4gICAgICAgIEdyYXBoOiBHcmFwaFxyXG4gICAgfTtcclxufSkoKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFTdGFyOyIsICJpbXBvcnQgQXV0b0JpbmRNZXRob2RzIGZyb20gJy4vQXV0b0JpbmRNZXRob2RzJztcclxuaW1wb3J0IEFTdGFyIGZyb20gJy4vVXRpbHMvQVN0YXInO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29sbGlkZXJzIGV4dGVuZHMgQXV0b0JpbmRNZXRob2RzIHtcclxuICAgIGNvbnN0cnVjdG9yKHNjZW5lKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICAgICAgdGhpcy5hcmVhcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE5leHRQb2ludChmcm9tLCB0bykge1xyXG4gICAgICAgIGNvbnN0IGFyZWEgPSB0aGlzLmdldEFyZWFCeVBvc2l0aW9uKGZyb20pLFxyXG4gICAgICAgICAgICBmcm9tWCA9IGFyZWEud29ybGRYVG9XYXlwb2ludFgoZnJvbS54KSxcclxuICAgICAgICAgICAgZnJvbVkgPSBhcmVhLndvcmxkWlRvV2F5cG9pbnRZKGZyb20ueiksXHJcbiAgICAgICAgICAgIGFyZWFUbyA9IHRoaXMuZ2V0QXJlYUJ5UG9zaXRpb24odG8pO1xyXG5cclxuICAgICAgICBsZXQgdG9YO1xyXG4gICAgICAgIGxldCB0b1k7XHJcbiAgICAgICAgbGV0IHBvcnRhbDtcclxuXHJcbiAgICAgICAgaWYgKGFyZWEuaWQgPT09IGFyZWFUby5pZCkge1xyXG4gICAgICAgICAgICB0b1ggPSBhcmVhLndvcmxkWFRvV2F5cG9pbnRYKHRvLngpO1xyXG4gICAgICAgICAgICB0b1kgPSBhcmVhLndvcmxkWlRvV2F5cG9pbnRZKHRvLnopO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBvcnRhbCA9IGFyZWEuZ2V0V2F5cG9pbnRQb3J0YWxzKCkuZmluZChwb3J0YWwgPT4gcG9ydGFsLnRvLmFyZWFJZCA9PT0gYXJlYVRvLmlkKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChwb3J0YWwpIHtcclxuICAgICAgICAgICAgICAgIHRvWCA9IHBvcnRhbC5mcm9tLng7XHJcbiAgICAgICAgICAgICAgICB0b1kgPSBwb3J0YWwuZnJvbS55O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgc3RhcnQgPSB0aGlzLmdldEZyZWVHcmFwaFBvaW50KGFyZWEuZ3JhcGgsIGZyb21YLCBmcm9tWSk7XHJcbiAgICAgICAgbGV0IGVuZCA9IHRoaXMuZ2V0RnJlZUdyYXBoUG9pbnQoYXJlYS5ncmFwaCwgdG9YLCB0b1kpO1xyXG5cclxuICAgICAgICBpZiAoc3RhcnQgJiYgZW5kKSB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBBU3Rhci5hc3Rhci5zZWFyY2goXHJcbiAgICAgICAgICAgICAgICBhcmVhLmdyYXBoLFxyXG4gICAgICAgICAgICAgICAgc3RhcnQsXHJcbiAgICAgICAgICAgICAgICBlbmQsXHJcbiAgICAgICAgICAgICAgICB7IGhldXJpc3RpYzogQVN0YXIuYXN0YXIuaGV1cmlzdGljcy5kaWFnb25hbCB9XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBuZXh0R3JhcGhQb2ludCA9IHJlc3VsdFsyXSB8fCByZXN1bHRbMV07XHJcblxyXG4gICAgICAgICAgICBpZiAobmV4dEdyYXBoUG9pbnQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5leHRXb3JsZFBvaW50ID0gbmV3IFRIUkVFLlZlY3RvcjMoXHJcbiAgICAgICAgICAgICAgICAgICAgYXJlYS53YXlwb2ludFhUb1dvcmxkWChuZXh0R3JhcGhQb2ludC54KSxcclxuICAgICAgICAgICAgICAgICAgICB0by55LFxyXG4gICAgICAgICAgICAgICAgICAgIGFyZWEud2F5cG9pbnRZVG9Xb3JsZFoobmV4dEdyYXBoUG9pbnQueSlcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5leHRXb3JsZFBvaW50O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0bztcclxuICAgIH1cclxuXHJcbiAgICBnZXRGcmVlR3JhcGhQb2ludChncmFwaCwgeCwgeSkge1xyXG4gICAgICAgIGNvbnN0IGdyaWQgPSBncmFwaC5ncmlkO1xyXG5cclxuICAgICAgICBjb25zdCBnZXRXZWlnaHQgPSAoeCwgeSkgPT4gZ3JpZFt4XSAmJiBncmlkW3hdW3ldICYmIGdyaWRbeF1beV0ud2VpZ2h0O1xyXG5cclxuICAgICAgICBjb25zdCBnZXROZWFyRnJlZVBvaW50ID0gcmFuZ2UgPT4gKFxyXG4gICAgICAgICAgICAoZ2V0V2VpZ2h0KHggKyByYW5nZSwgeSkgJiYgZ3JpZFt4ICsgcmFuZ2VdW3ldKVxyXG4gICAgICAgICAgICB8fCAoZ2V0V2VpZ2h0KHggLSByYW5nZSwgeSkgJiYgZ3JpZFt4IC0gcmFuZ2VdW3ldKVxyXG4gICAgICAgICAgICB8fCAoZ2V0V2VpZ2h0KHgsIHkgKyByYW5nZSkgJiYgZ3JpZFt4XVt5ICsgcmFuZ2VdKVxyXG4gICAgICAgICAgICB8fCAoZ2V0V2VpZ2h0KHgsIHkgLSByYW5nZSkgJiYgZ3JpZFt4XVt5IC0gcmFuZ2VdKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIChnZXRXZWlnaHQoZ3JpZFt4XVt5XSkgJiYgZ3JpZFt4XVt5XSlcclxuICAgICAgICAgICAgfHwgZ2V0TmVhckZyZWVQb2ludCgxKVxyXG4gICAgICAgICAgICB8fCBnZXROZWFyRnJlZVBvaW50KDIpXHJcbiAgICAgICAgICAgIHx8IGdldE5lYXJGcmVlUG9pbnQoMylcclxuICAgICAgICAgICAgfHwgZ2V0TmVhckZyZWVQb2ludCg0KVxyXG4gICAgICAgICAgICB8fCBudWxsXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZWJ1aWxkQXJlYXMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2NlbmUubG9jYXRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5hcmVhcyA9IHRoaXMuc2NlbmUubG9jYXRpb24uZ2V0QXJlYXMoKS5tYXAoYXJlYSA9PiAoe1xyXG4gICAgICAgICAgICAgICAgLi4uYXJlYSxcclxuICAgICAgICAgICAgICAgIGdyYXBoOiBuZXcgQVN0YXIuR3JhcGgoYXJlYS5nZXRXYXlwb2ludHMoKSwgeyBkaWFnb25hbDogdHJ1ZSB9KSxcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRBcmVhQnlQb3NpdGlvbihwb3NpdGlvbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFyZWFzLmZpbmQoYXJlYSA9PiBhcmVhLmluY2x1ZGVzUG9zaXRpb24ocG9zaXRpb24pKTtcclxuICAgIH1cclxufSIsICJpbXBvcnQgQXV0b0JpbmRNZXRob2RzIGZyb20gJy4vQXV0b0JpbmRNZXRob2RzJztcclxuaW1wb3J0IHsgUGxheWVyLCBBSSwgQW5pbWF0ZWRHYW1lT2JqZWN0IH0gZnJvbSAnLi9HYW1lT2JqZWN0cyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVbml0cyBleHRlbmRzIEF1dG9CaW5kTWV0aG9kcyB7XHJcblx0Y29uc3RydWN0b3Ioc2NlbmUpIHtcclxuXHRcdHN1cGVyKCk7XHJcblx0XHR0aGlzLnNjZW5lID0gc2NlbmU7XHJcblx0XHR0aGlzLnBsYXllciA9IHVuZGVmaW5lZDtcclxuXHR9XHJcblxyXG5cdGdldFVuaXRzKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuc2NlbmUuZ2FtZU9iamVjdHNTZXJ2aWNlLmdldFVuaXRzKCk7XHJcblx0fVxyXG5cclxuXHRnZXRBbGl2ZVVuaXRzKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0VW5pdHMoKS5maWx0ZXIoZ2FtZU9iamVjdCA9PiBnYW1lT2JqZWN0LmlzQWxpdmUoKSk7XHJcblx0fVxyXG5cclxuXHRnZXRQbGF5ZXIoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5wbGF5ZXI7XHJcblx0fVxyXG5cclxuXHRzZXREZWZhdWx0UGxheWVyUGFyYW1zKGRlZmF1bHRQYXJhbXMpIHtcclxuXHRcdHRoaXMuZGVmYXVsdFBhcmFtcyA9IGRlZmF1bHRQYXJhbXM7XHJcblx0fVxyXG5cclxuXHRjcmVhdGVQbGF5ZXIoe1xyXG5cdFx0b25DcmVhdGUgPSAoKSA9PiBudWxsLFxyXG5cdFx0b25LaWxsID0gKCkgPT4gbnVsbCxcclxuXHRcdG9uRGFtYWdlRGVhbCA9ICgpID0+IG51bGwsXHJcblx0XHRvbkRhbWFnZVRha2VuID0gKCkgPT4gbnVsbCxcclxuXHRcdG9uRGllID0gKCkgPT4gbnVsbCxcclxuXHRcdG9uTGV2ZWxVcCA9ICgpID0+IG51bGwsXHJcblx0fSA9IHt9KSB7XHJcblx0XHRjb25zdCBnYW1lT2JqZWN0c1NlcnZpY2UgPSB0aGlzLnNjZW5lLmdhbWVPYmplY3RzU2VydmljZTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5zY2VuZS5tb2RlbHMubG9hZEdMVEYoe1xyXG5cdFx0XHRiYXNlVXJsOiAnLi9hc3NldHMvbW9kZWxzL3VuaXRzL3BsYXllcicsXHJcblx0XHRcdGNhbGxiYWNrOiAobG9hZGVkTW9kZWwpID0+IHtcclxuXHRcdFx0XHRjb25zdCBkZWZhdWx0UGFyYW1zID0gdGhpcy5kZWZhdWx0UGFyYW1zO1xyXG5cdFx0XHRcdGxvYWRlZE1vZGVsLnNjZW5lLnBvc2l0aW9uLnNldCgwLCAwLjEsIDApO1xyXG5cclxuXHRcdFx0XHQvKipcclxuXHRcdFx0XHQgKiBAdHlwZSB7UGxheWVyfVxyXG5cdFx0XHRcdCAqL1xyXG5cdFx0XHRcdGNvbnN0IHBsYXllciA9IGdhbWVPYmplY3RzU2VydmljZS5ob29rR2FtZU9iamVjdChuZXcgUGxheWVyKHtcclxuXHRcdFx0XHRcdGFuaW1hdGlvbnM6IGxvYWRlZE1vZGVsLmFuaW1hdGlvbnMsXHJcblx0XHRcdFx0XHRvYmplY3Q6IGxvYWRlZE1vZGVsLnNjZW5lLFxyXG5cdFx0XHRcdFx0aW5wdXQ6IHRoaXMuc2NlbmUuaW5wdXQsXHJcblx0XHRcdFx0XHRjb21wbGV4QW5pbWF0aW9uczogdHJ1ZSxcclxuXHRcdFx0XHRcdGNoZWNrV2F5OiB0aGlzLnNjZW5lLmNvbGxpZGVycy5jaGVja1dheSxcclxuXHRcdFx0XHRcdGdldEVudmlyb25tZW50WTogdGhpcy5zY2VuZS5sb2NhdGlvbi5nZXRFbnZpcm9ubWVudFksXHJcblx0XHRcdFx0XHRuYW1lOiB0aGlzLnNjZW5lLnVzZXIgPyB0aGlzLnNjZW5lLnVzZXIudXNlck5hbWUgOiAnICcsXHJcblx0XHRcdFx0XHRvbkRhbWFnZURlYWw6IGRhbWFnZWRVbml0ID0+IG9uRGFtYWdlRGVhbChkYW1hZ2VkVW5pdCksXHJcblx0XHRcdFx0XHRvbkRhbWFnZVRha2VuOiAoYXR0YWNrZXIpID0+IHtcclxuXHRcdFx0XHRcdFx0b25EYW1hZ2VUYWtlbihhdHRhY2tlcik7XHJcblx0XHRcdFx0XHRcdHRoaXMuc2NlbmUucGFydGljbGVzLmxvYWRFZmZlY3Qoe1xyXG5cdFx0XHRcdFx0XHRcdHBvc2l0aW9uOiBwbGF5ZXIucG9zaXRpb24uY2xvbmUoKS5hZGQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMC43NSwgMCkpXHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdG9uS2lsbDogKG9iamVjdCkgPT4gb25LaWxsKG9iamVjdCksXHJcblx0XHRcdFx0XHRvbkRpZTogKGtpbGxlcikgPT4gb25EaWUoa2lsbGVyKSxcclxuXHRcdFx0XHRcdG9uTGV2ZWxVcDogKCkgPT4ge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnNjZW5lLnBhcnRpY2xlcy5jcmVhdGVFZmZlY3Qoe1xyXG5cdFx0XHRcdFx0XHRcdGVmZmVjdDogJ2xldmVsLXVwLWFsdC9sZXZlbC11cCcsXHJcblx0XHRcdFx0XHRcdFx0c2NhbGU6IDEuNSxcclxuXHRcdFx0XHRcdFx0XHRhdHRhY2hUbzogcGxheWVyLm9iamVjdCxcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdG9uTGV2ZWxVcCgpO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdGF0dGFjazogKCkgPT4gZ2FtZU9iamVjdHNTZXJ2aWNlLmF0dGFjayhwbGF5ZXIpLFxyXG5cdFx0XHRcdFx0ZmlyZTogKCkgPT4gZ2FtZU9iamVjdHNTZXJ2aWNlLmZpcmUocGxheWVyKSxcclxuXHRcdFx0XHRcdGRlc3Ryb3k6ICgpID0+IGdhbWVPYmplY3RzU2VydmljZS5kZXN0cm95R2FtZU9iamVjdChwbGF5ZXIpLFxyXG5cdFx0XHRcdFx0ZHJvcEl0ZW06IGl0ZW0gPT4gZ2FtZU9iamVjdHNTZXJ2aWNlLmRyb3BJdGVtKHBsYXllciwgaXRlbSksXHJcblx0XHRcdFx0fSkpO1xyXG5cclxuXHRcdFx0XHR0aGlzLnBsYXllciA9IHBsYXllcjtcclxuXHRcdFx0XHRvbkNyZWF0ZShwbGF5ZXIpO1xyXG5cclxuXHRcdFx0XHRpZiAoZGVmYXVsdFBhcmFtcyAmJiBkZWZhdWx0UGFyYW1zLnBhcmFtcykge1xyXG5cdFx0XHRcdFx0Y29uc3QgeyBwb3NpdGlvbiwgcm90YXRpb24sIHBhcmFtcyB9ID0gZGVmYXVsdFBhcmFtcztcclxuXHRcdFx0XHRcdGNvbnN0IHBsYXllclBhcmFtcyA9IHBsYXllci5wYXJhbXM7XHJcblxyXG5cdFx0XHRcdFx0cGxheWVyLnBvc2l0aW9uLnNldChwb3NpdGlvbi54LCBwb3NpdGlvbi55LCBwb3NpdGlvbi56KTtcclxuXHRcdFx0XHRcdHBsYXllci5yb3RhdGlvbi5zZXQocm90YXRpb24ueCwgcm90YXRpb24ueSwgcm90YXRpb24ueik7XHJcblx0XHRcdFx0XHRwbGF5ZXJQYXJhbXMuaHAgPSBwYXJhbXMuaHA7XHJcblx0XHRcdFx0XHRwbGF5ZXJQYXJhbXMuaHBNYXggPSBwYXJhbXMuaHBNYXg7XHJcblx0XHRcdFx0XHRwbGF5ZXJQYXJhbXMuZnJhY3Rpb24gPSBwYXJhbXMuZnJhY3Rpb247XHJcblx0XHRcdFx0XHRwbGF5ZXJQYXJhbXMubGV2ZWwgPSBwYXJhbXMubGV2ZWw7XHJcblx0XHRcdFx0XHRwbGF5ZXJQYXJhbXMuZGFtYWdlID0gcGFyYW1zLmRhbWFnZTtcclxuXHRcdFx0XHRcdHBsYXllclBhcmFtcy5maXJlRGFtYWdlID0gcGFyYW1zLmZpcmVEYW1hZ2U7XHJcblx0XHRcdFx0XHRwbGF5ZXJQYXJhbXMuc3BlZWQgPSBwYXJhbXMuc3BlZWQ7XHJcblx0XHRcdFx0XHRwbGF5ZXJQYXJhbXMuZXhwZXJpZW5jZSA9IHBhcmFtcy5leHBlcmllbmNlO1xyXG5cdFx0XHRcdFx0cGxheWVyUGFyYW1zLm1vbmV5ID0gcGFyYW1zLm1vbmV5O1xyXG5cdFx0XHRcdFx0cGxheWVyUGFyYW1zLnVuc3BlbnRUYWxlbnRzID0gcGFyYW1zLnVuc3BlbnRUYWxlbnRzO1xyXG5cclxuXHRcdFx0XHRcdGlmIChwYXJhbXMuZXF1aXBwZWRJdGVtcykge1xyXG5cdFx0XHRcdFx0XHRwbGF5ZXJQYXJhbXMuZXF1aXBwZWRJdGVtcyA9IHBhcmFtcy5lcXVpcHBlZEl0ZW1zO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdHRoaXMuc2NlbmUuZ2FtZU9iamVjdHNTZXJ2aWNlLnVwZGF0ZUF0dGFjaGVkSXRlbXMocGxheWVyKTtcclxuXHJcblx0XHRcdFx0XHRpZiAoIXBsYXllclBhcmFtcy5ocCkge1xyXG5cdFx0XHRcdFx0XHRwbGF5ZXIuYW5pbWF0aW9uU3RhdGUuaXNEaWUgPSB0cnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRjcmVhdGVBSSh7IGZyYWN0aW9uLCBsZXZlbCwgcG9zaXRpb246IHsgeCwgeSwgeiB9LCByb3RhdGlvbiA9IHt9LCBzY2FsZSwgb25EaWUsIG5hbWUgfSkge1xyXG5cdFx0Y29uc3QgZ2FtZU9iamVjdHNTZXJ2aWNlID0gdGhpcy5zY2VuZS5nYW1lT2JqZWN0c1NlcnZpY2U7XHJcblx0XHRjb25zdCBnZXRQcmlvcml0eSA9ICh1bml0LCB0YXJnZXQpID0+IChcclxuXHRcdFx0KHRhcmdldCBpbnN0YW5jZW9mIFBsYXllciA/IDAuNzUgOiAwKVxyXG5cdFx0XHQrIDEgLyBNYXRoLmNlaWwodGFyZ2V0LnBvc2l0aW9uLmRpc3RhbmNlVG8odW5pdC5wb3NpdGlvbikpXHJcblx0XHQpO1xyXG5cclxuXHRcdHRoaXMuc2NlbmUubW9kZWxzLmxvYWRHTFRGKHtcclxuXHRcdFx0YmFzZVVybDogZnJhY3Rpb24gPT09ICdnb2F0cydcclxuXHRcdFx0XHQ/ICcuL2Fzc2V0cy9tb2RlbHMvdW5pdHMvZ29hdC13YXJyaW9yJ1xyXG5cdFx0XHRcdDogJy4vYXNzZXRzL21vZGVscy91bml0cy9lbmVteScsXHJcblx0XHRcdG5vU2NlbmU6IHRydWUsXHJcblx0XHRcdGNhbGxiYWNrOiAoZ2x0ZikgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IG5ldHdvcmtDb25uZWN0aW9uID0gdGhpcy5zY2VuZS5jb25uZWN0aW9uO1xyXG5cclxuXHRcdFx0XHRpZiAoXHJcblx0XHRcdFx0XHQhbmV0d29ya0Nvbm5lY3Rpb25cclxuXHRcdFx0XHRcdHx8ICFuZXR3b3JrQ29ubmVjdGlvbi5tZXRhXHJcblx0XHRcdFx0XHR8fCAhbmV0d29ya0Nvbm5lY3Rpb24ubWV0YS5yb2xlXHJcblx0XHRcdFx0XHR8fCBuZXR3b3JrQ29ubmVjdGlvbi5tZXRhLnJvbGUgPT09ICdob3N0J1xyXG5cdFx0XHRcdCkge1xyXG5cdFx0XHRcdFx0dGhpcy5zY2VuZS5hZGQoZ2x0Zi5zY2VuZSk7XHJcblx0XHRcdFx0XHQvKiogQHR5cGUge0FJfSAqL1xyXG5cdFx0XHRcdFx0Y29uc3QgYWkgPSBnYW1lT2JqZWN0c1NlcnZpY2UuaG9va0dhbWVPYmplY3QobmV3IEFJKHtcclxuXHRcdFx0XHRcdFx0YW5pbWF0aW9uczogZ2x0Zi5hbmltYXRpb25zLFxyXG5cdFx0XHRcdFx0XHRvYmplY3Q6IGdsdGYuc2NlbmUsXHJcblx0XHRcdFx0XHRcdHNwZWVkOiAwLjM1ICsgbGV2ZWwgKiAwLjAyNSxcclxuXHRcdFx0XHRcdFx0ZGFtYWdlOiA1ICsgbGV2ZWwgKiAxLjAsXHJcblx0XHRcdFx0XHRcdGhwOiA3MCArIGxldmVsICogMzAsXHJcblx0XHRcdFx0XHRcdGZyYWN0aW9uLFxyXG5cdFx0XHRcdFx0XHRuYW1lLFxyXG5cdFx0XHRcdFx0XHRsZXZlbCxcclxuXHRcdFx0XHRcdFx0bG9vdDogdGhpcy5nZXRMb290KGxldmVsKSxcclxuXHRcdFx0XHRcdFx0Y2hlY2tXYXk6IHRoaXMuc2NlbmUuY29sbGlkZXJzLmNoZWNrV2F5LFxyXG5cdFx0XHRcdFx0XHRnZXROZXh0UG9pbnQ6IHRoaXMuc2NlbmUucGF0aEZpbmRlci5nZXROZXh0UG9pbnQsXHJcblx0XHRcdFx0XHRcdGF0dGFjazogKCkgPT4gZ2FtZU9iamVjdHNTZXJ2aWNlLmF0dGFjayhhaSksXHJcblx0XHRcdFx0XHRcdG9uS2lsbDogKGR5aW5nVW5pdCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdGlmICh0aGlzLnNjZW5lLmxvY2F0aW9uLm9uS2lsbCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5zY2VuZS5sb2NhdGlvbi5vbktpbGwoZHlpbmdVbml0LCBhaSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHRvbkRhbWFnZVRha2VuOiAoKSA9PiB0aGlzLnNjZW5lLnBhcnRpY2xlcy5sb2FkRWZmZWN0KHtcclxuXHRcdFx0XHRcdFx0XHRwb3NpdGlvbjogYWkucG9zaXRpb24uY2xvbmUoKS5hZGQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMC43NSwgMCkpXHJcblx0XHRcdFx0XHRcdH0pLFxyXG5cdFx0XHRcdFx0XHRvbkRpZTogKCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChhaS5wYXJhbXMubG9vdCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0T2JqZWN0LnZhbHVlcyhhaS5wYXJhbXMubG9vdCkuZm9yRWFjaChsb290ID0+IHRoaXMuc2NlbmUuZ2FtZU9iamVjdHNTZXJ2aWNlLmNyZWF0ZVdlYXBvbkl0ZW0oe1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQuLi5sb290LFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRwb3NpdGlvbjogYWkucG9zaXRpb24uY2xvbmUoKSxcclxuXHRcdFx0XHRcdFx0XHRcdH0pKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGFpLnBhcmFtcy5sb290ID0gW107XHJcblxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuc2NlbmUuaW50ZXJ2YWxzLnNldFRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFpLmlzRGVhZCgpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGdhbWVPYmplY3RzU2VydmljZS5kZXN0cm95R2FtZU9iamVjdChhaSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAob25EaWUpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvbkRpZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fSwgMTAwMDApXHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdGZpbmRUYXJnZXQ6ICgpID0+IHtcclxuXHRcdFx0XHRcdFx0XHRjb25zdCBuZWFyRW5lbXlVbml0cyA9IHRoaXMuZ2V0QWxpdmVVbml0cygpXHJcblx0XHRcdFx0XHRcdFx0XHQuZmlsdGVyKHVuaXQgPT4gKFxyXG5cdFx0XHRcdFx0XHRcdFx0XHR1bml0ICE9PSBhaVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQmJiB1bml0LmdldEZyYWN0aW9uKCkgIT09IGZyYWN0aW9uXHJcblx0XHRcdFx0XHRcdFx0XHRcdCYmIHVuaXQucG9zaXRpb24uZGlzdGFuY2VUbyhhaS5wb3NpdGlvbikgPCAxNVxyXG5cdFx0XHRcdFx0XHRcdFx0KSlcclxuXHRcdFx0XHRcdFx0XHRcdC5zb3J0KCh1bml0QSwgdW5pdEIpID0+IGdldFByaW9yaXR5KGFpLCB1bml0QikgLSBnZXRQcmlvcml0eShhaSwgdW5pdEEpKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5lYXJFbmVteVVuaXRzLmxlbmd0aCA/IG5lYXJFbmVteVVuaXRzWzBdIDogbnVsbDtcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdH0pKTtcclxuXHJcblx0XHRcdFx0XHRhaS5wb3NpdGlvbi5zZXQoeCB8fCAwLCB5IHx8IDAsIHogfHwgMCk7XHJcblx0XHRcdFx0XHRhaS5yb3RhdGlvbi5zZXQocm90YXRpb24ueCB8fCAwLCByb3RhdGlvbi55IHx8IDAsIHJvdGF0aW9uLnogfHwgMCk7XHJcblxyXG5cdFx0XHRcdFx0aWYgKHNjYWxlKSB7XHJcblx0XHRcdFx0XHRcdGFpLm9iamVjdC5zY2FsZS5zZXQoc2NhbGUsIHNjYWxlLCBzY2FsZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRnZXRMb290KGxldmVsKSB7XHJcblx0XHRsZXQgbG9vdCA9IFtdO1xyXG5cclxuXHRcdGlmIChsZXZlbCA+IDEwICYmIGxldmVsIDwgMjAgJiYgTWF0aC5yYW5kb20oKSA8IDAuMSArIGxldmVsIC8gMjApIHtcclxuXHRcdFx0Y29uc3QgZGFtYWdlID0gKzE1ICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogNSk7XHJcblx0XHRcdGxvb3QgPSBbe1xyXG5cdFx0XHRcdG1vZGVsOiAnaXRlbS1zd29yZC0xJyxcclxuXHRcdFx0XHRuYW1lOiBgQWR2YW5jZWQgU2FiZXIgKCske2RhbWFnZX0gRGFtYWdlKWAsXHJcblx0XHRcdFx0dHlwZTogJ09uZSBIYW5kZWQnLFxyXG5cdFx0XHRcdGJvbmVOYW1lOiAnUmlnaHRfSGFuZCcsXHJcblx0XHRcdFx0YXR0YWNoTW9kZWxOYW1lOiAnaXRlbS1zd29yZC0xJyxcclxuXHRcdFx0XHRlZmZlY3RzOiBbeyBkYW1hZ2UgfV1cclxuXHRcdFx0fV07XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGxldmVsID4gMjAgJiYgbGV2ZWwgPCAzMCAmJiBNYXRoLnJhbmRvbSgpIDwgMC4xICsgbGV2ZWwgLyA0MCkge1xyXG5cdFx0XHRjb25zdCBkYW1hZ2UgPSArMjUgKyBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiA1KTtcclxuXHRcdFx0bG9vdCA9IFt7XHJcblx0XHRcdFx0bW9kZWw6ICdpdGVtLXN3b3JkLTQnLFxyXG5cdFx0XHRcdG5hbWU6IGBDYXBpdGFuIFNhYmVyICgrJHtkYW1hZ2V9IERhbWFnZSlgLFxyXG5cdFx0XHRcdHR5cGU6ICdPbmUgSGFuZGVkJyxcclxuXHRcdFx0XHRib25lTmFtZTogJ1JpZ2h0X0hhbmQnLFxyXG5cdFx0XHRcdGF0dGFjaE1vZGVsTmFtZTogJ2l0ZW0tc3dvcmQtNCcsXHJcblx0XHRcdFx0ZWZmZWN0czogW3sgZGFtYWdlIH1dXHJcblx0XHRcdH1dO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChsZXZlbCA+IDMwICYmIGxldmVsIDwgNDAgJiYgTWF0aC5yYW5kb20oKSA8IDAuMSArIGxldmVsIC8gNjApIHtcclxuXHRcdFx0Y29uc3QgZGFtYWdlID0gKzM1ICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogNSk7XHJcblx0XHRcdGxvb3QgPSBbe1xyXG5cdFx0XHRcdG1vZGVsOiAnaXRlbS1zd29yZC0yJyxcclxuXHRcdFx0XHRuYW1lOiBgRGFyayBTYWJlciAoKyR7ZGFtYWdlfSBEYW1hZ2UpYCxcclxuXHRcdFx0XHR0eXBlOiAnT25lIEhhbmRlZCcsXHJcblx0XHRcdFx0Ym9uZU5hbWU6ICdSaWdodF9IYW5kJyxcclxuXHRcdFx0XHRhdHRhY2hNb2RlbE5hbWU6ICdpdGVtLXN3b3JkLTInLFxyXG5cdFx0XHRcdGVmZmVjdHM6IFt7IGRhbWFnZSB9XVxyXG5cdFx0XHR9XTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAobGV2ZWwgPiA0MCAmJiBsZXZlbCA8IDYwICYmIE1hdGgucmFuZG9tKCkgPCAwLjEgKyBsZXZlbCAvIDgwKSB7XHJcblx0XHRcdGNvbnN0IGRhbWFnZSA9ICs0NSArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDIpICogNTtcclxuXHRcdFx0bG9vdCA9IFt7XHJcblx0XHRcdFx0bW9kZWw6ICdpdGVtLXN3b3JkLTMnLFxyXG5cdFx0XHRcdG5hbWU6IGBTZWEgS2luZyBTYWJlciAoKyR7ZGFtYWdlfSBEYW1hZ2UpYCxcclxuXHRcdFx0XHR0eXBlOiAnT25lIEhhbmRlZCcsXHJcblx0XHRcdFx0Ym9uZU5hbWU6ICdSaWdodF9IYW5kJyxcclxuXHRcdFx0XHRhdHRhY2hNb2RlbE5hbWU6ICdpdGVtLXN3b3JkLTMnLFxyXG5cdFx0XHRcdGVmZmVjdHM6IFt7IGRhbWFnZSB9XVxyXG5cdFx0XHR9XTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAobGV2ZWwgPiA2MCAmJiBNYXRoLnJhbmRvbSgpIDwgMC4xICsgbGV2ZWwgLyAxMDApIHtcclxuXHRcdFx0Y29uc3QgZGFtYWdlID0gKzU1ICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMikgKiA1O1xyXG5cdFx0XHRsb290ID0gW3tcclxuXHRcdFx0XHRtb2RlbDogJ2l0ZW0tc3dvcmQtNScsXHJcblx0XHRcdFx0bmFtZTogYEJsYWNrIFVuaG9seSBTYWJlciAoKyR7ZGFtYWdlfSBEYW1hZ2UpYCxcclxuXHRcdFx0XHR0eXBlOiAnT25lIEhhbmRlZCcsXHJcblx0XHRcdFx0Ym9uZU5hbWU6ICdSaWdodF9IYW5kJyxcclxuXHRcdFx0XHRhdHRhY2hNb2RlbE5hbWU6ICdpdGVtLXN3b3JkLTUnLFxyXG5cdFx0XHRcdGVmZmVjdHM6IFt7IGRhbWFnZSB9XVxyXG5cdFx0XHR9XTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbG9vdDtcclxuXHR9XHJcblxyXG5cdGNyZWF0ZU5ldHdvcmtBSShcclxuXHRcdHtcclxuXHRcdFx0cGFyYW1zOiB7XHJcblx0XHRcdFx0ZnJhY3Rpb24sXHJcblx0XHRcdFx0dW5pdE5ldHdvcmtJZCxcclxuXHRcdFx0XHRsZXZlbCxcclxuXHRcdFx0XHRuYW1lLFxyXG5cdFx0XHRcdGhwLFxyXG5cdFx0XHRcdGhwTWF4LFxyXG5cdFx0XHRcdGRhbWFnZSxcclxuXHRcdFx0XHRmcm9tTmV0d29yayA9IHRydWVcclxuXHRcdFx0fSxcclxuXHRcdFx0cG9zaXRpb24sXHJcblx0XHRcdG9uRGllXHJcblx0XHR9LFxyXG5cdFx0Y2FsbGJhY2sgPSAoKSA9PiB7XHJcblx0XHR9LFxyXG5cdCkge1xyXG5cdFx0Y29uc3QgZ2FtZU9iamVjdHNTZXJ2aWNlID0gdGhpcy5zY2VuZS5nYW1lT2JqZWN0c1NlcnZpY2U7XHJcblx0XHRjb25zdCBnZXRQcmlvcml0eSA9ICh1bml0LCB0YXJnZXQpID0+IChcclxuXHRcdFx0KHRhcmdldCBpbnN0YW5jZW9mIFBsYXllciA/IDAuNzUgOiAwKVxyXG5cdFx0XHQrIDEgLyBNYXRoLmNlaWwodGFyZ2V0LnBvc2l0aW9uLmRpc3RhbmNlVG8odW5pdC5wb3NpdGlvbikpXHJcblx0XHQpO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLnNjZW5lLm1vZGVscy5sb2FkR0xURih7XHJcblx0XHRcdGJhc2VVcmw6IGZyYWN0aW9uID09PSAnZ29hdHMnXHJcblx0XHRcdFx0PyAnLi9hc3NldHMvbW9kZWxzL3VuaXRzL2dvYXQtd2FycmlvcidcclxuXHRcdFx0XHQ6ICcuL2Fzc2V0cy9tb2RlbHMvdW5pdHMvZW5lbXknLFxyXG5cdFx0XHRjYWxsYmFjazogKGxvYWRlZE9iamVjdCkgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IGFpID0gZ2FtZU9iamVjdHNTZXJ2aWNlLmhvb2tHYW1lT2JqZWN0KG5ldyBBSSh7XHJcblx0XHRcdFx0XHRvYmplY3Q6IGxvYWRlZE9iamVjdC5zY2VuZSxcclxuXHRcdFx0XHRcdGFuaW1hdGlvbnM6IGxvYWRlZE9iamVjdC5hbmltYXRpb25zLFxyXG5cdFx0XHRcdFx0dW5pdE5ldHdvcmtJZCxcclxuXHRcdFx0XHRcdGZyYWN0aW9uLFxyXG5cdFx0XHRcdFx0bGV2ZWwsXHJcblx0XHRcdFx0XHRuYW1lLFxyXG5cdFx0XHRcdFx0aHAsXHJcblx0XHRcdFx0XHRocE1heCxcclxuXHRcdFx0XHRcdGRhbWFnZSxcclxuXHRcdFx0XHRcdGZyb21OZXR3b3JrLFxyXG5cdFx0XHRcdFx0Y2hlY2tXYXk6IHRoaXMuc2NlbmUuY29sbGlkZXJzLmNoZWNrV2F5LFxyXG5cdFx0XHRcdFx0Z2V0TmV4dFBvaW50OiB0aGlzLnNjZW5lLnBhdGhGaW5kZXIuZ2V0TmV4dFBvaW50LFxyXG5cdFx0XHRcdFx0YXR0YWNrOiAoKSA9PiBnYW1lT2JqZWN0c1NlcnZpY2UuYXR0YWNrKGFpKSxcclxuXHRcdFx0XHRcdG9uRGFtYWdlVGFrZW46ICgpID0+IHRoaXMuc2NlbmUucGFydGljbGVzLmxvYWRFZmZlY3Qoe1xyXG5cdFx0XHRcdFx0XHRwb3NpdGlvbjogYWkucG9zaXRpb24uY2xvbmUoKS5hZGQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMC43NSwgMCkpXHJcblx0XHRcdFx0XHR9KSxcclxuXHRcdFx0XHRcdG9uS2lsbDogKGR5aW5nVW5pdCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5zY2VuZS5sb2NhdGlvbi5vbktpbGwpIHtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLnNjZW5lLmxvY2F0aW9uLm9uS2lsbChkeWluZ1VuaXQsIGFpKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSxcclxuXHJcblx0XHRcdFx0XHRvbkRpZTogKCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRpZiAoYWkucGFyYW1zLmxvb3QpIHtcclxuXHRcdFx0XHRcdFx0XHRPYmplY3QudmFsdWVzKGFpLnBhcmFtcy5sb290KS5mb3JFYWNoKGxvb3QgPT4gdGhpcy5zY2VuZS5nYW1lT2JqZWN0c1NlcnZpY2UuY3JlYXRlV2VhcG9uSXRlbSh7XHJcblx0XHRcdFx0XHRcdFx0XHQuLi5sb290LFxyXG5cdFx0XHRcdFx0XHRcdFx0cG9zaXRpb246IGFpLnBvc2l0aW9uLmNsb25lKCksXHJcblx0XHRcdFx0XHRcdFx0fSkpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHR0aGlzLnNjZW5lLmludGVydmFscy5zZXRUaW1lb3V0KCgpID0+IHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoYWkuaXNEZWFkKCkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGdhbWVPYmplY3RzU2VydmljZS5kZXN0cm95R2FtZU9iamVjdChhaSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKCFhaS5wYXJhbXMuZnJvbU5ldHdvcmspIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5jcmVhdGVOZXR3b3JrQUkoe1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGZyYWN0aW9uLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHVuaXROZXR3b3JrSWQsXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bmFtZSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRocCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRocE1heCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRkYW1hZ2UsXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZnJvbU5ldHdvcms6IGZhbHNlLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGxldmVsOiBsZXZlbCArIDEgKyBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiBsZXZlbCAvIDQpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0sIDEwMDAwKTtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRmaW5kVGFyZ2V0OiAoKSA9PiB7XHJcblx0XHRcdFx0XHRcdGlmICghYWkucGFyYW1zLmZyb21OZXR3b3JrKSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgbmVhckVuZW15VW5pdHMgPSB0aGlzLmdldEFsaXZlVW5pdHMoKVxyXG5cdFx0XHRcdFx0XHRcdFx0LmZpbHRlcih1bml0ID0+IChcclxuXHRcdFx0XHRcdFx0XHRcdFx0dW5pdCAhPT0gYWlcclxuXHRcdFx0XHRcdFx0XHRcdFx0JiYgdW5pdC5nZXRGcmFjdGlvbigpICE9PSBmcmFjdGlvblxyXG5cdFx0XHRcdFx0XHRcdFx0XHQmJiB1bml0LnBvc2l0aW9uLmRpc3RhbmNlVG8oYWkucG9zaXRpb24pIDwgMTVcclxuXHRcdFx0XHRcdFx0XHRcdCkpXHJcblx0XHRcdFx0XHRcdFx0XHQuc29ydCgodW5pdEEsIHVuaXRCKSA9PiBnZXRQcmlvcml0eShhaSwgdW5pdEIpIC0gZ2V0UHJpb3JpdHkoYWksIHVuaXRBKSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZWFyRW5lbXlVbml0cy5sZW5ndGggPyBuZWFyRW5lbXlVbml0c1swXSA6IG51bGw7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0fSkpO1xyXG5cclxuXHRcdFx0XHRjYWxsYmFjayhhaSk7XHJcblx0XHRcdH0sXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGNyZWF0ZU5ldHdvcmtQbGF5ZXIoe1xyXG5cdFx0cGFyYW1zOiB7IGNvbm5lY3Rpb25JZCwgdW5pdE5ldHdvcmtJZCwgbmFtZSwgZGFtYWdlLCBmaXJlRGFtYWdlIH0sXHJcblx0XHRvbkRhbWFnZURlYWwsXHJcblx0XHRvbktpbGwsXHJcblx0XHRvbkRpZSxcclxuXHRcdG9uTGV2ZWxVcCxcclxuXHRcdG9uRGFtYWdlVGFrZW4sXHJcblx0fSwgY2FsbGJhY2spIHtcclxuXHRcdGNvbnN0IGdhbWVPYmplY3RzU2VydmljZSA9IHRoaXMuc2NlbmUuZ2FtZU9iamVjdHNTZXJ2aWNlO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLnNjZW5lLm1vZGVscy5sb2FkR0xURih7XHJcblx0XHRcdGJhc2VVcmw6ICcuL2Fzc2V0cy9tb2RlbHMvdW5pdHMvcGxheWVyJyxcclxuXHRcdFx0Y2FsbGJhY2s6IChsb2FkZWRPYmplY3QpID0+IHtcclxuXHRcdFx0XHQvKiogQHR5cGUge1BsYXllcn0gKi9cclxuXHRcdFx0XHRjb25zdCBwbGF5ZXIgPSBnYW1lT2JqZWN0c1NlcnZpY2UuaG9va0dhbWVPYmplY3QobmV3IFBsYXllcih7XHJcblx0XHRcdFx0XHRvYmplY3Q6IGxvYWRlZE9iamVjdC5zY2VuZSxcclxuXHRcdFx0XHRcdGFuaW1hdGlvbnM6IGxvYWRlZE9iamVjdC5hbmltYXRpb25zLFxyXG5cdFx0XHRcdFx0dW5pdE5ldHdvcmtJZCxcclxuXHRcdFx0XHRcdGNvbm5lY3Rpb25JZCxcclxuXHRcdFx0XHRcdG5hbWUsXHJcblx0XHRcdFx0XHRkYW1hZ2UsXHJcblx0XHRcdFx0XHRmaXJlRGFtYWdlLFxyXG5cdFx0XHRcdFx0ZnJvbU5ldHdvcms6IHRydWUsXHJcblx0XHRcdFx0XHRjb21wbGV4QW5pbWF0aW9uczogdHJ1ZSxcclxuXHRcdFx0XHRcdGNoZWNrV2F5OiB0aGlzLnNjZW5lLmNvbGxpZGVycy5jaGVja1dheSxcclxuXHRcdFx0XHRcdGRyb3BJdGVtOiBpdGVtID0+IGdhbWVPYmplY3RzU2VydmljZS5kcm9wSXRlbShwbGF5ZXIsIGl0ZW0pLFxyXG5cdFx0XHRcdFx0aW5wdXQ6IHtcclxuXHRcdFx0XHRcdFx0dmVydGljYWw6IDAsXHJcblx0XHRcdFx0XHRcdGhvcml6b250YWw6IDAsXHJcblx0XHRcdFx0XHRcdGp1bXA6IGZhbHNlLFxyXG5cdFx0XHRcdFx0XHRjdXJzb3I6IHtcclxuXHRcdFx0XHRcdFx0XHR4OiAwLFxyXG5cdFx0XHRcdFx0XHRcdHk6IDAsXHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdGxvb2s6IHtcclxuXHRcdFx0XHRcdFx0XHR2ZXJ0aWNhbDogMCxcclxuXHRcdFx0XHRcdFx0XHRob3Jpem9udGFsOiAwLFxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdG9uRGllOiBraWxsZXIgPT4gb25EaWUgJiYgb25EaWUoa2lsbGVyKSxcclxuXHRcdFx0XHRcdG9uRGFtYWdlRGVhbDogZGFtYWdlZFVuaXQgPT4gb25EYW1hZ2VEZWFsICYmIG9uRGFtYWdlRGVhbChkYW1hZ2VkVW5pdCksXHJcblx0XHRcdFx0XHRvbkRhbWFnZVRha2VuOiAoYXR0YWNrZXIpID0+IHtcclxuXHRcdFx0XHRcdFx0b25EYW1hZ2VUYWtlbiAmJiBvbkRhbWFnZVRha2VuKGF0dGFja2VyKTtcclxuXHRcdFx0XHRcdFx0dGhpcy5zY2VuZS5wYXJ0aWNsZXMubG9hZEVmZmVjdCh7XHJcblx0XHRcdFx0XHRcdFx0cG9zaXRpb246IHBsYXllci5wb3NpdGlvbi5jbG9uZSgpLmFkZChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLjc1LCAwKSlcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0b25LaWxsOiAoZHlpbmdVbml0KSA9PiB7XHJcblx0XHRcdFx0XHRcdGlmIChvbktpbGwpIHtcclxuXHRcdFx0XHRcdFx0XHRvbktpbGwoZHlpbmdVbml0KTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuc2NlbmUubG9jYXRpb24ub25LaWxsKSB7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5zY2VuZS5sb2NhdGlvbi5vbktpbGwoZHlpbmdVbml0LCBwbGF5ZXIpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0b25MZXZlbFVwOiAoKSA9PiB7XHJcblx0XHRcdFx0XHRcdHRoaXMuc2NlbmUucGFydGljbGVzLmNyZWF0ZUVmZmVjdCh7XHJcblx0XHRcdFx0XHRcdFx0ZWZmZWN0OiAnbGV2ZWwtdXAtYWx0L2xldmVsLXVwJyxcclxuXHRcdFx0XHRcdFx0XHRzY2FsZTogMS41LFxyXG5cdFx0XHRcdFx0XHRcdGF0dGFjaFRvOiBwbGF5ZXIub2JqZWN0LFxyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0b25MZXZlbFVwICYmIG9uTGV2ZWxVcCgpO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdGF0dGFjazogKCkgPT4gZ2FtZU9iamVjdHNTZXJ2aWNlLmF0dGFjayhwbGF5ZXIpLFxyXG5cdFx0XHRcdFx0ZmlyZTogKCkgPT4gZ2FtZU9iamVjdHNTZXJ2aWNlLmZpcmUocGxheWVyKSxcclxuXHRcdFx0XHRcdGRlc3Ryb3k6ICgpID0+IGdhbWVPYmplY3RzU2VydmljZS5kZXN0cm95R2FtZU9iamVjdChwbGF5ZXIpLFxyXG5cdFx0XHRcdH0pKTtcclxuXHJcblx0XHRcdFx0Y2FsbGJhY2socGxheWVyKTtcclxuXHRcdFx0fSxcclxuXHRcdH0pO1xyXG5cdH1cclxufSIsICJpbXBvcnQgeyBQbGF5ZXIgfSBmcm9tICcuL0dhbWVPYmplY3RzJztcclxuLy8gaW1wb3J0IEF1ZGlvIGZyb20gJy4vQXVkaW8nO1xyXG5pbXBvcnQgQXV0b0JpbmRNZXRob2RzIGZyb20gJy4vQXV0b0JpbmRNZXRob2RzJztcclxuaW1wb3J0IENhbWVyYSBmcm9tICcuL0NhbWVyYSc7XHJcbmltcG9ydCBDb25uZWN0aW9uIGZyb20gJy4vQ29ubmVjdGlvbic7XHJcbmltcG9ydCBHYW1lT2JqZWN0c1NlcnZpY2UgZnJvbSAnLi9HYW1lT2JqZWN0cyc7XHJcbmltcG9ydCBJbnB1dCBmcm9tICcuL0lucHV0JztcclxuaW1wb3J0IEludGVydmFscyBmcm9tICcuL0ludGVydmFscyc7XHJcbmltcG9ydCBMb2NhdGlvbiBmcm9tICcuL0xvY2F0aW9ucy9EcmVhbVRvd24nO1xyXG5pbXBvcnQgQ29sbGlkZXJzIGZyb20gJy4vQ29sbGlkZXJzJztcclxuaW1wb3J0IE1vZGVscyBmcm9tICcuL01vZGVscyc7XHJcbmltcG9ydCBQYXJ0aWNsZXMgZnJvbSAnLi9QYXJ0aWNsZXMnO1xyXG5pbXBvcnQgUGF0aEZpbmRlciBmcm9tICcuL1BhdGhGaW5kZXInO1xyXG5pbXBvcnQgVW5pdHMgZnJvbSAnLi9Vbml0cyc7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NlbmUgZXh0ZW5kcyBBdXRvQmluZE1ldGhvZHMge1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge1JlbmRlcmVyfSByZW5kZXJlclxyXG4gICAgICogQHBhcmFtIHt7XHJcbiAgICAgKiAgc2V0UmVzdGFydEJ1dHRvblZpc2libGU6IGZ1bmN0aW9uLFxyXG4gICAgICogIHNldFBhdXNlOiBmdW5jdGlvbixcclxuICAgICAqICByZXN0YXJ0R2FtZTogZnVuY3Rpb24sXHJcbiAgICAgKiAgaXNQYXVzZTogZnVuY3Rpb24sXHJcbiAgICAgKiAgaXNUaGlyZFBlcnNvbjogZnVuY3Rpb24sXHJcbiAgICAgKiAgdXBkYXRlOiBmdW5jdGlvbixcclxuICAgICAqICB1cGRhdGVQbGF5ZXJQYXJhbXM6IGZ1bmN0aW9uLFxyXG4gICAgICogIGNsZWFySHBCYXJzOiBmdW5jdGlvbixcclxuICAgICAqICBzd2l0Y2hDYW1lcmE6IGZ1bmN0aW9uLFxyXG4gICAgICogIHNldEZwczogZnVuY3Rpb24sXHJcbiAgICAgKiAgbm90aWZ5OiBmdW5jdGlvbixcclxuICAgICAqIH19IHVpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzU2VydmVyXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHJlbmRlcmVyLCB1aSwgaXNTZXJ2ZXIgPSBmYWxzZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5pc1NlcnZlciA9IGlzU2VydmVyO1xyXG4gICAgICAgIHRoaXMuaW50ZXJ2YWxzID0gbmV3IEludGVydmFscyh0aGlzKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyID0gcmVuZGVyZXI7XHJcbiAgICAgICAgdGhpcy51aSA9IHVpO1xyXG4gICAgICAgIHRoaXMubW9kZWxzID0gbmV3IE1vZGVscyh0aGlzKTtcclxuICAgICAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcbiAgICAgICAgdGhpcy5wYXRoRmluZGVyID0gbmV3IFBhdGhGaW5kZXIodGhpcyk7XHJcbiAgICAgICAgdGhpcy5jb2xsaWRlcnMgPSBuZXcgQ29sbGlkZXJzKHRoaXMpO1xyXG4gICAgICAgIHRoaXMudW5pdHMgPSBuZXcgVW5pdHModGhpcyk7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgQ2FtZXJhKHRoaXMpO1xyXG4gICAgICAgIC8vIHRoaXMuYXVkaW8gPSBuZXcgQXVkaW8odGhpcyk7XHJcbiAgICAgICAgdGhpcy5pbnB1dCA9IG5ldyBJbnB1dCh7XHJcbiAgICAgICAgICAgIG9uQWN0aW9uOiAoKSA9PiB0aGlzLmxldmVsLm9uQWN0aW9uKCksXHJcbiAgICAgICAgICAgIG9uRXhpdDogKCkgPT4gdGhpcy51aS5zZXRQYXVzZSghdGhpcy51aS5pc1BhdXNlKCkpLFxyXG4gICAgICAgICAgICBvblpvb206IHpvb20gPT4gdGhpcy5jYW1lcmEuYWRkWSh6b29tKSxcclxuICAgICAgICAgICAgb25Td2l0Y2hDYW1lcmE6ICgpID0+IHRoaXMudWkuc3dpdGNoQ2FtZXJhKCksXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5nYW1lT2JqZWN0c1NlcnZpY2UgPSBuZXcgR2FtZU9iamVjdHNTZXJ2aWNlKHRoaXMpO1xyXG4gICAgICAgIHRoaXMucGFydGljbGVzID0gbmV3IFBhcnRpY2xlcyh0aGlzKTtcclxuXHJcbiAgICAgICAgY29uc3QgY29ubmVjdGlvbkhvc3RuYW1lID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09PSAnbG9jYWxob3N0JyA/ICdsb2NhbGhvc3QnIDogJ2dvaHRtbC5ydSc7XHJcbiAgICAgICAgY29uc3QgaXNTU0wgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgIT09ICdsb2NhbGhvc3QnO1xyXG4gICAgICAgIHRoaXMuY29ubmVjdGlvbiA9IG5ldyBDb25uZWN0aW9uKHRoaXMsIGNvbm5lY3Rpb25Ib3N0bmFtZSwgMTMzNywgaXNTU0wpO1xyXG4gICAgICAgIHRoaXMubG9jYXRpb24gPSBuZXcgTG9jYXRpb24odGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMuaW50ZXJ2YWxzLnNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy51aS5zZXRGcHModGhpcy5yZW5kZXJlci5mcHMsIHRoaXMucmVuZGVyZXIudGFyZ2V0RnBzKTtcclxuICAgICAgICAgICAgdGhpcy51aS5zZXRQaW5nKHRoaXMuY29ubmVjdGlvbi5waW5nKTtcclxuICAgICAgICAgICAgdGhpcy51aS51cGRhdGVQbGF5ZXJQYXJhbXMoKTtcclxuICAgICAgICB9LCAxMDAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dC5pc1RoaXJkUGVyc29uID0gdWkuaXNUaGlyZFBlcnNvbigpO1xyXG5cclxuICAgICAgICB0aGlzLmNsZWFyU2NlbmUoKTtcclxuICAgICAgICB0aGlzLmFuaW1hdGUoKTtcclxuXHJcbiAgICAgICAgd2luZG93LmdvdG8gPSAocGFzc3dvcmQsIHgsIHksIHopID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbi5nZXRIYXNoKHBhc3N3b3JkKSA9PT0gJzgxMWM5ZGM1OTQwNTE1NTknKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldFBsYXllcigpLnBvc2l0aW9uLnNldCh4LCB5LCB6KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXJTY2VuZSgpIHtcclxuICAgICAgICB0aGlzLmdhbWVPYmplY3RzU2VydmljZS5yZW1vdmVBbGwoKTtcclxuICAgICAgICB0aGlzLmxvY2F0aW9uLmFmdGVyQ2xlYXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBhbmltYXRlKCkge1xyXG4gICAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICAgICAgY29uc3QgZGVsdGFUaW1lID0gdGhpcy5pbnRlcnZhbHMuZ2V0RGVsdGFUaW1lKG5vdyk7XHJcbiAgICAgICAgdGhpcy5pbnRlcnZhbHMudXBkYXRlKG5vdyk7XHJcbiAgICAgICAgY29uc3QgZ2FtZVRpbWUgPSB0aGlzLmludGVydmFscy5nZXRUaW1lUGFzc2VkKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmxvY2F0aW9uLmlzTG9hZGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU9iamVjdHNTZXJ2aWNlLnVwZGF0ZShnYW1lVGltZSwgZGVsdGFUaW1lKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy51aS5pc1BhdXNlKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FtZXJhLnVwZGF0ZShnYW1lVGltZSwgZGVsdGFUaW1lKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMudWkudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb24udXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnVwZGF0ZShnYW1lVGltZSk7XHJcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbi51cGRhdGUoZ2FtZVRpbWUsIGRlbHRhVGltZSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcihnYW1lVGltZSwgZGVsdGFUaW1lLCB0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYS5jYW1lcmEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExvZ2dlZFVzZXIodXNlck5hbWUsIHBhc3N3b3JkKSB7XHJcbiAgICAgICAgdGhpcy51c2VyID0geyB1c2VyTmFtZSwgcGFzc3dvcmQgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm5zIHtQbGF5ZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldFBsYXllcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51bml0cy5nZXRQbGF5ZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7VEhSRUUuT2JqZWN0M0R9IG9iamVjdFxyXG4gICAgICovXHJcbiAgICBhZGQob2JqZWN0KSB7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQob2JqZWN0KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7VEhSRUUuT2JqZWN0M0R9IG9iamVjdFxyXG4gICAgICovXHJcbiAgICByZW1vdmUob2JqZWN0KSB7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5yZW1vdmUob2JqZWN0KTtcclxuICAgIH1cclxuXHJcbiAgICBub3RpZnkodGV4dCwgdGltZW91dCkge1xyXG4gICAgICAgIHRoaXMudWkubm90aWZ5KHRleHQsIHRpbWVvdXQpO1xyXG4gICAgfVxyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNBQSxJQUFxQixrQkFBckIsTUFBcUIsaUJBQWdCO0FBQUEsRUFDakMsY0FBYztBQUNWLFFBQUksZ0JBQWdCLENBQUM7QUFDckIsUUFBSSxNQUFNLE9BQU8sZUFBZSxJQUFJO0FBRXBDLFdBQU8sS0FBSztBQUNSLFVBQUksUUFBUSxPQUFPLGFBQWEsUUFBUSxpQkFBZ0IsV0FBVztBQUMvRCxjQUFNLE9BQU8sZUFBZSxHQUFHO0FBQy9CO0FBQUEsTUFDSjtBQUVBLHNCQUFnQixjQUFjO0FBQUEsUUFDMUIsT0FBTyxvQkFBb0IsR0FBRyxFQUFFLE9BQU8sVUFDbkMsU0FBUyxpQkFDTixjQUFjLFFBQVEsSUFBSSxNQUFNLE1BQ2hDLE9BQU8sS0FBSyxJQUFJLE1BQU0sVUFDNUI7QUFBQSxNQUNMO0FBRUEsWUFBTSxPQUFPLGVBQWUsR0FBRztBQUFBLElBQ25DO0FBRUEsYUFBUyxnQkFBZ0IsZUFBZTtBQUNwQyxXQUFLLFlBQVksSUFBSSxLQUFLLFlBQVksRUFBRSxLQUFLLElBQUk7QUFBQSxJQUNyRDtBQUFBLEVBQ0o7QUFDSjs7O0FDeEJBLElBQXFCLFdBQXJCLGNBQXNDLGdCQUFnQjtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSWxELFlBQVksWUFBWSxNQUFNLFNBQVMsQ0FBQyxHQUFHO0FBQ3ZDLFVBQU07QUFDTixTQUFLLFdBQVcsSUFBSSxNQUFNLGNBQWM7QUFBQSxNQUNwQyxXQUFXO0FBQUEsTUFDWCx3QkFBd0I7QUFBQSxNQUN4QixPQUFPO0FBQUEsTUFDUCxpQkFBaUI7QUFBQSxNQUNqQixHQUFHO0FBQUEsSUFDUCxDQUFDO0FBRUQsU0FBSyxNQUFNO0FBQ1gsU0FBSyxZQUFZO0FBQ2pCLFNBQUssYUFBYTtBQUVsQixRQUFJLFdBQVc7QUFDWCxX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QixTQUFLLEdBQUcsT0FBTyxNQUFNLE9BQU87QUFBQSxFQUNoQztBQUNKOzs7QTNCdElPLElBQU0sWUFBWSxDQUFDLGdCQUFnQixZQUFZO0FBQ25ELFFBQU0sMENBQTBDO0FBRWhELFFBQU0sUUFBUSxJQUFJLE1BQU0sSUFBSSxTQUFTLE1BQU0sY0FBYyxHQUFHLFNBQVMsSUFBSTtBQUV6RSxRQUFNLFVBQVUsU0FBUyxNQUFNO0FBQUEsRUFBQztBQUNoQyxRQUFNLFVBQVUsYUFBYSxPQUFPLENBQUM7QUFDckMsUUFBTSxVQUFVLGVBQWUsT0FBTyxDQUFDO0FBQ3ZDLFFBQU0sVUFBVSxhQUFhLE9BQU8sQ0FBQztBQUNyQyxRQUFNLFVBQVUsMEJBQTBCLE9BQU8sQ0FBQztBQUNsRCxRQUFNLFVBQVUsb0JBQW9CLE1BQU07QUFBQSxFQUFDO0FBQzNDLFFBQU0sVUFBVSx5QkFBeUIsT0FBTyxDQUFDO0FBQ2pELFFBQU0sVUFBVSxVQUFVLE1BQU07QUFBQSxFQUFDO0FBSWpDLFFBQU0sT0FBTyxTQUFTLE9BQU8sQ0FBQztBQUM5QixRQUFNLE9BQU8sT0FBTyxPQUFPLENBQUM7QUFDNUIsUUFBTSxPQUFPLFdBQVcsTUFBTTtBQUM5QixRQUFNLE9BQU8sWUFBWSxNQUFNO0FBQy9CLFFBQU0sT0FBTyxvQkFBb0IsT0FBTyxDQUFDO0FBQ3pDLFFBQU0sT0FBTyxtQkFBbUIsT0FBTyxDQUFDO0FBRXhDLFNBQU87QUFDVjsiLAogICJuYW1lcyI6IFsiYW5pbWF0aW9uTmFtZXMiLCAidG9wQW5pbWF0aW9ucyIsICJib3R0b21BbmltYXRpb25zIiwgInRvcEJvbmVzIiwgImJvdHRvbUJvbmVzIiwgImFuaW1hdGlvbiIsICJzdHIiLCAibmV0d29ya1BsYXllciIsICJuZXR3b3JrQUkiLCAiZWZmZWN0IiwgInBvc2l0aW9uIiwgImkiLCAiQ29sbGlkZXJzIiwgInBvcnRhbCIsICJ4IiwgInkiLCAiQ29sbGlkZXJzIl0KfQo=
