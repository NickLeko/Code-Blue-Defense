const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const hud = {
  lives: document.getElementById("livesValue"),
  credits: document.getElementById("creditsValue"),
  wave: document.getElementById("waveValue"),
  status: document.getElementById("statusValue"),
  score: document.getElementById("scoreValue"),
};

const startWaveBtn = document.getElementById("startWaveBtn");
const restartBtn = document.getElementById("restartBtn");
const modalRestartBtn = document.getElementById("modalRestartBtn");
const buildMenu = document.getElementById("buildMenu");
const buildOptions = document.getElementById("buildOptions");
const closeBuildMenuBtn = document.getElementById("closeBuildMenu");
const modalOverlay = document.getElementById("modalOverlay");
const modalTag = document.getElementById("modalTag");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalScore = document.getElementById("modalScore");
const modalWave = document.getElementById("modalWave");

const PATH_POINTS = [
  { x: 60, y: 110 },
  { x: 200, y: 110 },
  { x: 200, y: 230 },
  { x: 400, y: 230 },
  { x: 400, y: 140 },
  { x: 590, y: 140 },
  { x: 590, y: 340 },
  { x: 790, y: 340 },
  { x: 790, y: 500 },
  { x: 900, y: 500 },
];

const PAD_POSITIONS = [
  { x: 120, y: 200 },
  { x: 120, y: 320 },
  { x: 280, y: 145 },
  { x: 305, y: 315 },
  { x: 455, y: 80 },
  { x: 505, y: 230 },
  { x: 520, y: 410 },
  { x: 665, y: 250 },
  { x: 710, y: 430 },
  { x: 855, y: 260 },
];

const ENEMY_TYPES = {
  cold: {
    name: "Cold Germ",
    hp: 32,
    speed: 92,
    reward: 8,
    damage: 1,
    radius: 16,
    color: "#50c7ff",
    accent: "#1c88d9",
  },
  flu: {
    name: "Flu Bug",
    hp: 58,
    speed: 74,
    reward: 10,
    damage: 1,
    radius: 18,
    color: "#ffbf59",
    accent: "#f08d11",
  },
  superbug: {
    name: "Superbug",
    hp: 130,
    speed: 52,
    reward: 15,
    damage: 2,
    radius: 21,
    color: "#ff7097",
    accent: "#db3c69",
  },
  boss: {
    name: "Mutation Boss",
    hp: 520,
    speed: 34,
    reward: 40,
    damage: 5,
    radius: 30,
    color: "#8866ff",
    accent: "#5336d7",
  },
};

const TOWER_TYPES = {
  nurse: {
    name: "Nurse",
    cost: 25,
    range: 125,
    fireRate: 0.42,
    damage: 11,
    projectileSpeed: 380,
    color: "#46c7f4",
    accent: "#0e87b5",
    description: "Fast syringe tosses for early defense.",
  },
  doctor: {
    name: "Doctor",
    cost: 50,
    range: 155,
    fireRate: 0.95,
    damage: 32,
    projectileSpeed: 430,
    color: "#ff7b7b",
    accent: "#d44c4c",
    description: "High-impact targeted treatment.",
  },
  pharmacist: {
    name: "Pharmacist",
    cost: 40,
    range: 135,
    fireRate: 0.78,
    damage: 8,
    projectileSpeed: 340,
    dotDamage: 5,
    dotTicks: 4,
    dotInterval: 0.6,
    color: "#8f74ff",
    accent: "#5a3dd2",
    description: "Medication shots that stack damage over time.",
  },
  infection: {
    name: "Infection Control",
    cost: 45,
    range: 140,
    fireRate: 1.05,
    damage: 12,
    projectileSpeed: 300,
    splashRadius: 64,
    slowFactor: 0.55,
    slowDuration: 1.5,
    color: "#55c88d",
    accent: "#2c8d59",
    description: "Sanitation bursts that slow clustered enemies.",
  },
};

const WAVES = [
  [
    { type: "cold", count: 8, delay: 0.75 },
    { type: "flu", count: 3, delay: 0.85 },
  ],
  [
    { type: "cold", count: 10, delay: 0.72 },
    { type: "flu", count: 6, delay: 0.82 },
  ],
  [
    { type: "cold", count: 6, delay: 0.7 },
    { type: "flu", count: 8, delay: 0.78 },
    { type: "superbug", count: 4, delay: 1.05 },
  ],
  [
    { type: "flu", count: 8, delay: 0.8 },
    { type: "superbug", count: 6, delay: 1.1 },
  ],
  [
    { type: "flu", count: 6, delay: 0.8 },
    { type: "superbug", count: 5, delay: 1.08 },
    { type: "boss", count: 1, delay: 1.8 },
  ],
];

const game = {
  lives: 20,
  credits: 100,
  waveIndex: 0,
  score: 0,
  kills: 0,
  enemies: [],
  towers: [],
  projectiles: [],
  effects: [],
  pads: [],
  activeWave: null,
  enemiesRemainingToSpawn: 0,
  state: "ready",
  lastTime: 0,
  selectedPadId: null,
};

function createPads() {
  return PAD_POSITIONS.map((position, index) => ({
    id: index,
    x: position.x,
    y: position.y,
    radius: 26,
    tower: null,
    hover: false,
  }));
}

function resetGame() {
  game.lives = 20;
  game.credits = 100;
  game.waveIndex = 0;
  game.score = 0;
  game.kills = 0;
  game.enemies = [];
  game.towers = [];
  game.projectiles = [];
  game.effects = [];
  game.pads = createPads();
  game.activeWave = null;
  game.enemiesRemainingToSpawn = 0;
  game.state = "ready";
  game.selectedPadId = null;
  game.lastTime = 0;
  hideBuildMenu();
  hideModal();
  updateHud();
}

function beginWave() {
  if (game.state === "gameover" || game.state === "victory" || game.activeWave || game.waveIndex >= WAVES.length) {
    return;
  }

  const groups = WAVES[game.waveIndex];
  const queue = [];

  groups.forEach((group) => {
    for (let i = 0; i < group.count; i += 1) {
      queue.push({ type: group.type, delay: group.delay });
    }
  });

  game.activeWave = {
    queue,
    timer: 0.4,
  };
  game.enemiesRemainingToSpawn = queue.length;
  game.state = "wave";
  hideBuildMenu();
  updateHud();
}

function spawnEnemy(typeKey) {
  const spec = ENEMY_TYPES[typeKey];
  game.enemies.push({
    type: typeKey,
    name: spec.name,
    x: PATH_POINTS[0].x,
    y: PATH_POINTS[0].y,
    maxHp: spec.hp,
    hp: spec.hp,
    speed: spec.speed,
    baseSpeed: spec.speed,
    reward: spec.reward,
    lifeDamage: spec.damage,
    radius: spec.radius,
    color: spec.color,
    accent: spec.accent,
    pathIndex: 0,
    dead: false,
    slowTimer: 0,
    slowFactor: 1,
    dots: [],
  });
}

function updateWave(delta) {
  if (!game.activeWave) {
    return;
  }

  game.activeWave.timer -= delta;
  if (game.activeWave.timer <= 0 && game.activeWave.queue.length > 0) {
    const nextSpawn = game.activeWave.queue.shift();
    spawnEnemy(nextSpawn.type);
    game.enemiesRemainingToSpawn -= 1;
    game.activeWave.timer = nextSpawn.delay;
  }

  if (game.activeWave.queue.length === 0 && game.enemiesRemainingToSpawn === 0 && game.enemies.length === 0) {
    game.activeWave = null;
    game.waveIndex += 1;
    game.score += 120;

    if (game.waveIndex >= WAVES.length) {
      game.state = "victory";
      showModal(true);
    } else {
      game.state = "ready";
    }

    updateHud();
  }
}

function buildTower(typeKey, padId) {
  const pad = game.pads.find((item) => item.id === padId);
  const towerSpec = TOWER_TYPES[typeKey];
  if (!pad || pad.tower || !towerSpec || game.credits < towerSpec.cost || game.state === "gameover" || game.state === "victory") {
    return;
  }

  game.credits -= towerSpec.cost;
  const tower = {
    id: `${typeKey}-${Date.now()}-${padId}`,
    type: typeKey,
    x: pad.x,
    y: pad.y,
    range: towerSpec.range,
    fireRate: towerSpec.fireRate,
    damage: towerSpec.damage,
    cooldown: 0.2,
    projectileSpeed: towerSpec.projectileSpeed,
    color: towerSpec.color,
    accent: towerSpec.accent,
  };

  pad.tower = tower;
  game.towers.push(tower);
  hideBuildMenu();
  updateHud();
}

function openBuildMenu(pad) {
  if (pad.tower || game.state === "gameover" || game.state === "victory") {
    return;
  }

  game.selectedPadId = pad.id;
  buildOptions.innerHTML = "";

  Object.entries(TOWER_TYPES).forEach(([key, tower]) => {
    const button = document.createElement("button");
    button.className = "build-option";
    button.disabled = game.credits < tower.cost;
    button.innerHTML = `<strong>${tower.name} - ${tower.cost} credits</strong><span>${tower.description}</span>`;
    button.addEventListener("click", () => buildTower(key, pad.id));
    buildOptions.appendChild(button);
  });

  const menuWidth = Math.min(290, canvas.clientWidth - 24);
  const scaleX = canvas.clientWidth / canvas.width;
  const scaleY = canvas.clientHeight / canvas.height;
  const padClientX = pad.x * scaleX;
  const padClientY = pad.y * scaleY;
  const left = Math.min(Math.max(padClientX - menuWidth / 2, 12), canvas.clientWidth - menuWidth - 12);
  const unclampedTop = padClientY > canvas.clientHeight / 2 ? padClientY - 210 : padClientY + 18;
  const top = Math.min(Math.max(unclampedTop, 12), canvas.clientHeight - 190);
  buildMenu.style.left = `${left}px`;
  buildMenu.style.top = `${top}px`;
  buildMenu.classList.remove("hidden");
  buildMenu.setAttribute("aria-hidden", "false");
}

function hideBuildMenu() {
  game.selectedPadId = null;
  buildMenu.classList.add("hidden");
  buildMenu.setAttribute("aria-hidden", "true");
}

function showModal(victory) {
  const finalScore = game.score + game.kills * 12 + game.lives * 15;
  modalTag.textContent = victory ? "Victory" : "Game Over";
  modalTitle.textContent = victory ? "Hospital Saved!" : "The Germs Broke Through";
  modalMessage.textContent = victory
    ? "Your team cleared all five waves and protected the core."
    : "A few too many pathogens slipped past the defense line.";
  modalScore.textContent = `${finalScore}`;
  modalWave.textContent = `${Math.min(game.waveIndex + (victory ? 0 : 1), 5)}`;
  modalOverlay.classList.remove("hidden");
  modalOverlay.setAttribute("aria-hidden", "false");
}

function hideModal() {
  modalOverlay.classList.add("hidden");
  modalOverlay.setAttribute("aria-hidden", "true");
}

function updateHud() {
  const enemiesAlive = game.enemies.length + game.enemiesRemainingToSpawn;
  hud.lives.textContent = `${game.lives}`;
  hud.credits.textContent = `${game.credits}`;
  const displayedWave = game.activeWave ? game.waveIndex + 1 : Math.min(game.waveIndex, 5);
  hud.wave.textContent = `${displayedWave} / 5`;
  hud.score.textContent = `${game.score + game.kills * 12}`;

  if (game.state === "ready") {
    hud.status.textContent = game.waveIndex >= WAVES.length ? "All Clear" : "Ready";
  } else if (game.state === "wave") {
    hud.status.textContent = `${enemiesAlive} incoming`;
  } else if (game.state === "victory") {
    hud.status.textContent = "Hospital Safe";
  } else if (game.state === "gameover") {
    hud.status.textContent = "Critical";
  }

  startWaveBtn.disabled = Boolean(game.activeWave) || game.state === "gameover" || game.state === "victory" || game.waveIndex >= WAVES.length;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getEnemyProgress(enemy) {
  return enemy.pathIndex + distance(enemy, PATH_POINTS[Math.min(enemy.pathIndex + 1, PATH_POINTS.length - 1)]) * 0.001;
}

function findTarget(tower) {
  const enemiesInRange = game.enemies.filter((enemy) => distance(tower, enemy) <= tower.range);
  if (enemiesInRange.length === 0) {
    return null;
  }

  enemiesInRange.sort((a, b) => getEnemyProgress(b) - getEnemyProgress(a));
  return enemiesInRange[0];
}

function fireTower(tower, target) {
  const towerType = TOWER_TYPES[tower.type];
  tower.cooldown = tower.fireRate;

  game.projectiles.push({
    x: tower.x,
    y: tower.y,
    targetId: target,
    type: tower.type,
    speed: tower.projectileSpeed,
    damage: tower.damage,
    color: tower.color,
    accent: tower.accent,
    splashRadius: towerType.splashRadius || 0,
  });
}

function applyDamage(enemy, amount) {
  enemy.hp -= amount;
  if (enemy.hp <= 0 && !enemy.dead) {
    enemy.dead = true;
    game.credits += enemy.reward;
    game.kills += 1;
    game.score += 25;
    game.effects.push({
      kind: "burst",
      x: enemy.x,
      y: enemy.y,
      timer: 0.35,
      color: enemy.color,
      radius: enemy.radius + 8,
    });
    updateHud();
  }
}

function applyPharmacistDot(enemy, towerType) {
  enemy.dots.push({
    timer: towerType.dotInterval,
    ticksLeft: towerType.dotTicks,
    damage: towerType.dotDamage,
    interval: towerType.dotInterval,
  });
}

function applySlow(enemy, towerType) {
  enemy.slowTimer = Math.max(enemy.slowTimer, towerType.slowDuration);
  enemy.slowFactor = Math.min(enemy.slowFactor, towerType.slowFactor);
}

function updateTowers(delta) {
  game.towers.forEach((tower) => {
    tower.cooldown -= delta;
    if (tower.cooldown > 0) {
      return;
    }

    const target = findTarget(tower);
    if (target) {
      fireTower(tower, target);
    }
  });
}

function updateProjectiles(delta) {
  for (let index = game.projectiles.length - 1; index >= 0; index -= 1) {
    const projectile = game.projectiles[index];
    const target = projectile.targetId;

    if (!target || target.dead || !game.enemies.includes(target)) {
      game.projectiles.splice(index, 1);
      continue;
    }

    const dx = target.x - projectile.x;
    const dy = target.y - projectile.y;
    const dist = Math.hypot(dx, dy);
    const step = projectile.speed * delta;

    if (dist <= step || dist < target.radius) {
      const towerType = TOWER_TYPES[projectile.type];

      if (projectile.type === "infection") {
        game.enemies.forEach((enemy) => {
          if (!enemy.dead && distance(target, enemy) <= projectile.splashRadius) {
            applyDamage(enemy, projectile.damage);
            applySlow(enemy, towerType);
          }
        });
        game.effects.push({
          kind: "pulse",
          x: target.x,
          y: target.y,
          timer: 0.4,
          color: towerType.color,
          radius: projectile.splashRadius,
        });
      } else {
        applyDamage(target, projectile.damage);
        if (projectile.type === "pharmacist" && !target.dead) {
          applyPharmacistDot(target, towerType);
        }
      }

      game.projectiles.splice(index, 1);
      continue;
    }

    projectile.x += (dx / dist) * step;
    projectile.y += (dy / dist) * step;
  }
}

function updateEnemies(delta) {
  for (let index = game.enemies.length - 1; index >= 0; index -= 1) {
    const enemy = game.enemies[index];

    if (enemy.dead) {
      game.enemies.splice(index, 1);
      continue;
    }

    enemy.slowTimer = Math.max(0, enemy.slowTimer - delta);
    if (enemy.slowTimer <= 0) {
      enemy.slowFactor = 1;
    }

    for (let dotIndex = enemy.dots.length - 1; dotIndex >= 0; dotIndex -= 1) {
      const dot = enemy.dots[dotIndex];
      dot.timer -= delta;
      if (dot.timer <= 0) {
        applyDamage(enemy, dot.damage);
        game.effects.push({
          kind: "tick",
          x: enemy.x + (Math.random() * 10 - 5),
          y: enemy.y - enemy.radius - 6,
          timer: 0.35,
          color: "#8f74ff",
          radius: 12,
        });
        dot.ticksLeft -= 1;
        dot.timer = dot.interval;
      }
      if (dot.ticksLeft <= 0 || enemy.dead) {
        enemy.dots.splice(dotIndex, 1);
      }
    }

    if (enemy.dead) {
      continue;
    }

    const targetPoint = PATH_POINTS[enemy.pathIndex + 1];
    if (!targetPoint) {
      game.lives -= enemy.lifeDamage;
      game.effects.push({
        kind: "core",
        x: PATH_POINTS[PATH_POINTS.length - 1].x,
        y: PATH_POINTS[PATH_POINTS.length - 1].y,
        timer: 0.5,
        color: "#ff6161",
        radius: 32,
      });
      game.enemies.splice(index, 1);
      if (game.lives <= 0) {
        game.lives = 0;
        game.state = "gameover";
        game.activeWave = null;
        showModal(false);
      }
      updateHud();
      continue;
    }

    const dx = targetPoint.x - enemy.x;
    const dy = targetPoint.y - enemy.y;
    const dist = Math.hypot(dx, dy);
    const move = enemy.baseSpeed * enemy.slowFactor * delta;

    if (dist <= move) {
      enemy.x = targetPoint.x;
      enemy.y = targetPoint.y;
      enemy.pathIndex += 1;
    } else {
      enemy.x += (dx / dist) * move;
      enemy.y += (dy / dist) * move;
    }
  }
}

function updateEffects(delta) {
  for (let index = game.effects.length - 1; index >= 0; index -= 1) {
    const effect = game.effects[index];
    effect.timer -= delta;
    if (effect.timer <= 0) {
      game.effects.splice(index, 1);
    }
  }
}

function drawPath() {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#d5eff8";
  ctx.lineWidth = 50;
  ctx.beginPath();
  ctx.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
  for (let i = 1; i < PATH_POINTS.length; i += 1) {
    ctx.lineTo(PATH_POINTS[i].x, PATH_POINTS[i].y);
  }
  ctx.stroke();

  ctx.strokeStyle = "#96d7ed";
  ctx.lineWidth = 34;
  ctx.stroke();

  ctx.setLineDash([14, 12]);
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawZones() {
  const start = PATH_POINTS[0];
  const end = PATH_POINTS[PATH_POINTS.length - 1];

  ctx.fillStyle = "rgba(29, 155, 240, 0.18)";
  ctx.beginPath();
  ctx.arc(start.x, start.y, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 97, 97, 0.2)";
  ctx.beginPath();
  ctx.arc(end.x, end.y, 46, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1f3758";
  ctx.font = '800 18px "Baloo 2"';
  ctx.fillText("Entrance", start.x - 34, start.y - 48);
  ctx.fillText("Core", end.x - 20, end.y - 56);
}

function drawPads() {
  game.pads.forEach((pad) => {
    ctx.fillStyle = pad.tower ? "#ffffff" : "#f2fbff";
    ctx.strokeStyle = pad.tower ? "rgba(31,55,88,0.22)" : "#7ac7ea";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(pad.x, pad.y, pad.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (!pad.tower) {
      ctx.fillStyle = "#4aa9d7";
      ctx.font = '800 28px "Nunito"';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("+", pad.x, pad.y + 1);
    }
  });
}

function drawTowers() {
  game.towers.forEach((tower) => {
    ctx.fillStyle = tower.color;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = '800 14px "Nunito"';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const letter = tower.type === "nurse" ? "N" : tower.type === "doctor" ? "D" : tower.type === "pharmacist" ? "P" : "I";
    ctx.fillText(letter, tower.x, tower.y + 1);
  });
}

function drawEnemies() {
  game.enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 5; i += 1) {
      const angle = (Math.PI * 2 * i) / 5;
      ctx.fillStyle = enemy.accent;
      ctx.beginPath();
      ctx.arc(
        enemy.x + Math.cos(angle) * (enemy.radius + 4),
        enemy.y + Math.sin(angle) * (enemy.radius + 4),
        enemy.type === "boss" ? 6 : 4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.fillStyle = "#1f3758";
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.3, enemy.y - enemy.radius * 0.2, 2.6, 0, Math.PI * 2);
    ctx.arc(enemy.x + enemy.radius * 0.3, enemy.y - enemy.radius * 0.2, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1f3758";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y + enemy.radius * 0.05, enemy.radius * 0.35, 0.15, Math.PI - 0.15);
    ctx.stroke();

    const barWidth = enemy.radius * 2.2;
    const hpRatio = Math.max(enemy.hp, 0) / enemy.maxHp;
    ctx.fillStyle = "rgba(31,55,88,0.22)";
    ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 12, barWidth, 6);
    ctx.fillStyle = enemy.type === "boss" ? "#7d5cff" : "#55c88d";
    ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 12, barWidth * hpRatio, 6);

    if (enemy.slowFactor < 1) {
      ctx.strokeStyle = "rgba(85, 200, 141, 0.7)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

function drawProjectiles() {
  game.projectiles.forEach((projectile) => {
    ctx.fillStyle = projectile.color;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;

    if (projectile.type === "nurse") {
      ctx.save();
      ctx.translate(projectile.x, projectile.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-3, -9, 6, 18);
      ctx.strokeRect(-3, -9, 6, 18);
      ctx.restore();
      return;
    }

    if (projectile.type === "doctor") {
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      return;
    }

    if (projectile.type === "pharmacist") {
      ctx.fillStyle = "#8f74ff";
      ctx.beginPath();
      ctx.roundRect(projectile.x - 8, projectile.y - 4, 16, 8, 4);
      ctx.fill();
      return;
    }

    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

function drawEffects() {
  game.effects.forEach((effect) => {
    const alpha = Math.max(effect.timer / (effect.kind === "pulse" ? 0.4 : 0.5), 0);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = effect.color;
    ctx.fillStyle = effect.color;

    if (effect.kind === "pulse" || effect.kind === "core" || effect.kind === "burst") {
      ctx.lineWidth = effect.kind === "burst" ? 5 : 4;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius * (1 + (1 - alpha) * 0.45), 0, Math.PI * 2);
      ctx.stroke();
    } else if (effect.kind === "tick") {
      ctx.font = '800 14px "Nunito"';
      ctx.fillText("DOT", effect.x, effect.y - (1 - alpha) * 8);
    }

    ctx.restore();
  });
}

function drawBackgroundDetails() {
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  [
    { x: 90, y: 420, w: 140, h: 100 },
    { x: 340, y: 420, w: 170, h: 120 },
    { x: 640, y: 60, w: 130, h: 70 },
    { x: 760, y: 80, w: 120, h: 90 },
  ].forEach((room) => {
    ctx.beginPath();
    ctx.roundRect(room.x, room.y, room.w, room.h, 18);
    ctx.fill();
  });

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath();
  ctx.roundRect(320, 38, 110, 52, 18);
  ctx.fill();
  ctx.fillStyle = "#46c7f4";
  ctx.fillRect(370, 48, 10, 30);
  ctx.fillRect(360, 58, 30, 10);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackgroundDetails();
  drawPath();
  drawZones();
  drawPads();
  drawTowers();
  drawProjectiles();
  drawEnemies();
  drawEffects();
}

function tick(timestamp) {
  if (!game.lastTime) {
    game.lastTime = timestamp;
  }
  const delta = Math.min((timestamp - game.lastTime) / 1000, 0.033);
  game.lastTime = timestamp;

  if (game.state !== "gameover" && game.state !== "victory") {
    updateWave(delta);
    updateTowers(delta);
    updateProjectiles(delta);
    updateEnemies(delta);
    updateEffects(delta);
  }

  render();
  requestAnimationFrame(tick);
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

canvas.addEventListener("click", (event) => {
  const point = getCanvasPoint(event);
  const clickedPad = game.pads.find((pad) => distance(point, pad) <= pad.radius);

  if (clickedPad && !clickedPad.tower) {
    openBuildMenu(clickedPad);
    return;
  }

  hideBuildMenu();
});

closeBuildMenuBtn.addEventListener("click", hideBuildMenu);
startWaveBtn.addEventListener("click", beginWave);
restartBtn.addEventListener("click", resetGame);
modalRestartBtn.addEventListener("click", resetGame);

window.addEventListener("click", (event) => {
  if (!buildMenu.contains(event.target) && event.target !== canvas && !buildMenu.classList.contains("hidden")) {
    hideBuildMenu();
  }
});

resetGame();
requestAnimationFrame(tick);
