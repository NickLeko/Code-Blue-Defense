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
const speedToggleBtn = document.getElementById("speedToggleBtn");
const autoStartToggle = document.getElementById("autoStartToggle");
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
  { x: 60, y: 176 },
  { x: 742, y: 176 },
  { x: 742, y: 302 },
  { x: 604, y: 302 },
  { x: 604, y: 356 },
  { x: 760, y: 356 },
  { x: 760, y: 540 },
  { x: 900, y: 540 },
];

const PAD_POSITIONS = [
  { x: 148, y: 210 },
  { x: 270, y: 146 },
  { x: 404, y: 146 },
  { x: 566, y: 146 },
  { x: 706, y: 210 },
  { x: 360, y: 300 },
  { x: 548, y: 336 },
  { x: 808, y: 288 },
  { x: 566, y: 300 },
  { x: 700, y: 300 },
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
    icon: "👩‍⚕️",
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
    icon: "🧑‍⚕️",
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
    icon: "💊",
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
    icon: "🧴",
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
  speedMultiplier: 1,
  autoStartEnabled: false,
  autoStartTimer: 0,
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
  game.speedMultiplier = 1;
  game.autoStartEnabled = false;
  game.autoStartTimer = 0;
  speedToggleBtn.textContent = "Speed: 1x";
  speedToggleBtn.setAttribute("aria-pressed", "false");
  autoStartToggle.checked = false;
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
  game.autoStartTimer = 0;
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
  if (game.state === "ready" && game.autoStartEnabled && game.waveIndex < WAVES.length && !game.activeWave) {
    game.autoStartTimer = Math.max(0, game.autoStartTimer - delta);
    if (game.autoStartTimer === 0) {
      beginWave();
    }
  }

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
      game.autoStartTimer = game.autoStartEnabled ? 1.15 : 0;
    }

    updateHud();
  }
}

function toggleSpeed() {
  game.speedMultiplier = game.speedMultiplier === 1 ? 2 : 1;
  speedToggleBtn.textContent = `Speed: ${game.speedMultiplier}x`;
  speedToggleBtn.setAttribute("aria-pressed", game.speedMultiplier === 2 ? "true" : "false");
}

function setAutoStart(enabled) {
  game.autoStartEnabled = enabled;
  if (!enabled) {
    game.autoStartTimer = 0;
    return;
  }

  if (game.state === "ready" && game.waveIndex < WAVES.length && !game.activeWave) {
    game.autoStartTimer = 1.15;
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
    const roleHint =
      key === "nurse"
        ? "Fast shot • starter"
        : key === "doctor"
          ? "Heavy hit • slow fire"
          : key === "pharmacist"
            ? "DOT support"
            : "Slow burst • control";
    button.innerHTML = `
      <span class="build-icon ${key}">${tower.icon}</span>
      <span class="build-copy">
        <strong>${tower.name} - ${tower.cost} credits</strong>
        <span>${tower.description}</span>
        <small>${roleHint}</small>
      </span>
    `;
    button.addEventListener("click", () => buildTower(key, pad.id));
    buildOptions.appendChild(button);
  });

  const menuWidth = Math.min(330, canvas.clientWidth - 24);
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
  modalTag.style.color = victory ? "#1d9bf0" : "#dc4747";
  modalRestartBtn.textContent = victory ? "Play Again" : "Try Again";
  modalRestartBtn.classList.toggle("secondary", !victory);
  modalRestartBtn.classList.toggle("primary", victory);
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
    hud.status.textContent = `${enemiesAlive} left`;
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
  ctx.strokeStyle = "rgba(87, 101, 111, 0.34)";
  ctx.lineWidth = 78;
  ctx.beginPath();
  ctx.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
  for (let i = 1; i < PATH_POINTS.length; i += 1) {
    ctx.lineTo(PATH_POINTS[i].x, PATH_POINTS[i].y);
  }
  ctx.stroke();

  ctx.strokeStyle = "#c8d2d8";
  ctx.lineWidth = 66;
  ctx.stroke();

  ctx.strokeStyle = "#edf2f5";
  ctx.lineWidth = 48;
  ctx.stroke();

  ctx.setLineDash([20, 14]);
  ctx.strokeStyle = "rgba(149, 164, 174, 0.6)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawZones() {
  const start = PATH_POINTS[0];
  const end = PATH_POINTS[PATH_POINTS.length - 1];

  ctx.fillStyle = "rgba(216, 232, 239, 0.9)";
  ctx.beginPath();
  ctx.roundRect(start.x - 54, start.y - 28, 96, 56, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(111, 131, 143, 0.7)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = "rgba(241, 221, 221, 0.92)";
  ctx.beginPath();
  ctx.roundRect(end.x - 66, end.y - 34, 124, 68, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(146, 104, 104, 0.72)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = "#365067";
  ctx.font = '800 16px "Baloo 2"';
  ctx.textAlign = "center";
  ctx.fillText("ER Entrance", start.x - 6, start.y + 5);
  ctx.fillStyle = "#7f4444";
  ctx.fillText("Hospital Core", end.x - 4, end.y + 5);
  ctx.textAlign = "start";
}

function drawPads() {
  game.pads.forEach((pad) => {
    ctx.fillStyle = "rgba(114, 129, 139, 0.11)";
    ctx.beginPath();
    ctx.roundRect(pad.x - 32, pad.y - 26, 64, 52, 18);
    ctx.fill();

    ctx.fillStyle = "#e6edf1";
    ctx.beginPath();
    ctx.roundRect(pad.x - 28, pad.y - 22, 56, 44, 16);
    ctx.fill();

    ctx.strokeStyle = "rgba(131, 149, 160, 0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "rgba(112, 135, 149, 0.12)";
    ctx.beginPath();
    ctx.arc(pad.x, pad.y, pad.radius + 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = pad.tower ? "#f8fbfd" : "#f3f9fc";
    ctx.strokeStyle = pad.tower ? "rgba(100,120,136,0.38)" : "rgba(103, 181, 223, 0.82)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(pad.x, pad.y, pad.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (!pad.tower) {
      ctx.fillStyle = "#63b4dd";
      ctx.font = '800 22px "Nunito"';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("+", pad.x, pad.y + 1);
    }
  });
}

function drawStaffAvatar(x, y, type, scale = 1) {
  const spec = TOWER_TYPES[type];
  const skin = type === "doctor" ? "#ffd5bf" : type === "pharmacist" ? "#ffcfb2" : type === "infection" ? "#ffd8c4" : "#ffe0c9";
  const bodyColor = type === "doctor" ? "#ffffff" : type === "pharmacist" ? "#8f74ff" : type === "infection" ? "#55c88d" : "#46c7f4";
  const accentColor = type === "doctor" ? "#ff7b7b" : type === "pharmacist" ? "#f6d55c" : type === "infection" ? "#d7fff0" : "#ffffff";

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = "rgba(31,55,88,0.12)";
  ctx.beginPath();
  ctx.ellipse(0, 17, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = spec.color;
  ctx.beginPath();
  ctx.arc(0, 1, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 1, 18, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, -5, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1f3758";
  ctx.beginPath();
  ctx.arc(-2.5, -6, 1.1, 0, Math.PI * 2);
  ctx.arc(2.5, -6, 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1f3758";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, -3.6, 2.8, 0.2, Math.PI - 0.2);
  ctx.stroke();

  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(-8, 2, 16, 12, 6);
  ctx.fill();
  ctx.strokeStyle = "rgba(31,55,88,0.12)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  if (type === "nurse") {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(-6, -12, 12, 4, 2);
    ctx.fill();
    ctx.fillStyle = "#ff7b7b";
    ctx.fillRect(-1, -11.5, 2, 3);
    ctx.fillRect(-3.5, -10.3, 7, 1.5);
  } else if (type === "doctor") {
    ctx.fillStyle = "#ff7b7b";
    ctx.beginPath();
    ctx.arc(0, -12, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8cc2da";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(-4, 0, 2.1, 0, Math.PI * 2);
    ctx.arc(4, 0, 2.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-1.8, 0);
    ctx.lineTo(1.8, 0);
    ctx.moveTo(6, 1.5);
    ctx.quadraticCurveTo(7.5, 4.5, 5, 8.5);
    ctx.stroke();
  } else if (type === "pharmacist") {
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.roundRect(-6, 4, 12, 4, 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-0.7, 4.2, 1.4, 3.6);
    ctx.fillStyle = "#f6d55c";
    ctx.beginPath();
    ctx.arc(0, -12, 4.6, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "infection") {
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.roundRect(-5, -12, 10, 6, 3);
    ctx.fill();
    ctx.fillStyle = "#2c8d59";
    ctx.fillRect(-0.9, -10.5, 1.8, 3);
    ctx.strokeStyle = "#d7fff0";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, -1, 11.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawTowers() {
  game.towers.forEach((tower) => {
    drawStaffAvatar(tower.x, tower.y, tower.type, 1);
  });
}

function drawEnemies() {
  game.enemies.forEach((enemy) => {
    ctx.fillStyle = "rgba(31,55,88,0.14)";
    ctx.beginPath();
    ctx.ellipse(enemy.x, enemy.y + enemy.radius + 6, enemy.radius * 0.9, enemy.radius * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.72)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.stroke();

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

    if (enemy.type === "cold") {
      ctx.strokeStyle = "#dff8ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(enemy.x - 7, enemy.y);
      ctx.lineTo(enemy.x + 7, enemy.y);
      ctx.moveTo(enemy.x, enemy.y - 7);
      ctx.lineTo(enemy.x, enemy.y + 7);
      ctx.stroke();
    } else if (enemy.type === "flu") {
      ctx.fillStyle = "#fff3d6";
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y - enemy.radius - 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#f08d11";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y - enemy.radius - 2, 6, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else if (enemy.type === "superbug") {
      ctx.strokeStyle = "#ffe1ea";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(enemy.x, enemy.y - 8);
      ctx.lineTo(enemy.x + 6, enemy.y);
      ctx.lineTo(enemy.x, enemy.y + 8);
      ctx.lineTo(enemy.x - 6, enemy.y);
      ctx.closePath();
      ctx.stroke();
    } else if (enemy.type === "boss") {
      ctx.fillStyle = "#c9b9ff";
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y - enemy.radius - 4, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7d5cff";
      ctx.fillRect(enemy.x - 7, enemy.y - enemy.radius - 7, 14, 3);
      ctx.fillRect(enemy.x - 1.5, enemy.y - enemy.radius - 12, 3, 14);
    }

    ctx.fillStyle = "#1f3758";
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.28, enemy.y - enemy.radius * 0.18, 2.6, 0, Math.PI * 2);
    ctx.arc(enemy.x + enemy.radius * 0.28, enemy.y - enemy.radius * 0.18, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1f3758";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (enemy.type === "cold") {
      ctx.arc(enemy.x, enemy.y + enemy.radius * 0.02, enemy.radius * 0.32, 0.2, Math.PI - 0.2);
    } else if (enemy.type === "flu") {
      ctx.arc(enemy.x, enemy.y + enemy.radius * 0.12, enemy.radius * 0.2, Math.PI + 0.25, Math.PI * 2 - 0.25);
    } else if (enemy.type === "superbug") {
      ctx.arc(enemy.x, enemy.y + enemy.radius * 0.06, enemy.radius * 0.34, 0.08, Math.PI - 0.08);
    } else {
      ctx.arc(enemy.x, enemy.y + enemy.radius * 0.1, enemy.radius * 0.18, Math.PI + 0.15, Math.PI * 2 - 0.15);
    }
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
  const drawRoom = (room) => {
    ctx.fillStyle = "rgba(126, 144, 156, 0.12)";
    ctx.beginPath();
    ctx.roundRect(room.x + 6, room.y + 8, room.w, room.h, 10);
    ctx.fill();

    ctx.fillStyle = room.fill || "#edf3f6";
    ctx.beginPath();
    ctx.roundRect(room.x, room.y, room.w, room.h, 10);
    ctx.fill();

    ctx.strokeStyle = "#8ea0aa";
    ctx.lineWidth = 8;
    ctx.stroke();

    if (room.door) {
      ctx.strokeStyle = "#dfe8ee";
      ctx.lineWidth = 10;
      ctx.beginPath();
      if (room.door.side === "bottom") {
        ctx.moveTo(room.door.x, room.y + room.h);
        ctx.lineTo(room.door.x + room.door.size, room.y + room.h);
      } else if (room.door.side === "top") {
        ctx.moveTo(room.door.x, room.y);
        ctx.lineTo(room.door.x + room.door.size, room.y);
      } else if (room.door.side === "left") {
        ctx.moveTo(room.x, room.door.y);
        ctx.lineTo(room.x, room.door.y + room.door.size);
      } else {
        ctx.moveTo(room.x + room.w, room.door.y);
        ctx.lineTo(room.x + room.w, room.door.y + room.door.size);
      }
      ctx.stroke();
    }

    ctx.fillStyle = "#5f7481";
    ctx.font = '700 13px "Nunito"';
    ctx.textAlign = "center";
    ctx.fillText(room.label, room.x + room.w / 2, room.y + 22);
    ctx.textAlign = "start";

    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(room.x + 12, room.y + room.h - 12);
    ctx.lineTo(room.x + room.w - 12, room.y + room.h - 12);
    ctx.stroke();
  };

  const drawBed = (x, y, horizontal = true) => {
    ctx.fillStyle = "#d7e8ef";
    if (horizontal) {
      ctx.beginPath();
      ctx.roundRect(x, y, 38, 18, 6);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 3, 14, 12, 4);
      ctx.fill();
      ctx.fillStyle = "#8ea0aa";
      ctx.fillRect(x + 4, y + 18, 3, 6);
      ctx.fillRect(x + 31, y + 18, 3, 6);
    } else {
      ctx.beginPath();
      ctx.roundRect(x, y, 18, 38, 6);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 4, 12, 14, 4);
      ctx.fill();
      ctx.fillStyle = "#8ea0aa";
      ctx.fillRect(x + 18, y + 4, 6, 3);
      ctx.fillRect(x + 18, y + 31, 6, 3);
    }
  };

  const drawCabinet = (x, y, w, h, color = "#d8e3d1") => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(95, 116, 129, 0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawCounter = (x, y, w, h) => {
    ctx.fillStyle = "#d9c0a0";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(123, 92, 56, 0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  ctx.fillStyle = "#cfd8dd";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f6f9fb";
  ctx.beginPath();
  ctx.roundRect(26, 22, 908, 552, 18);
  ctx.fill();
  ctx.strokeStyle = "#7f929d";
  ctx.lineWidth = 12;
  ctx.stroke();

  const rooms = [
    { x: 48, y: 42, w: 152, h: 94, label: "Reception", fill: "#eff6f8", door: { side: "bottom", x: 108, size: 34 } },
    { x: 220, y: 42, w: 176, h: 112, label: "Triage", fill: "#eef4f8", door: { side: "bottom", x: 286, size: 36 } },
    { x: 420, y: 42, w: 160, h: 90, label: "Exam 1", fill: "#f2f7f3", door: { side: "bottom", x: 480, size: 30 } },
    { x: 602, y: 42, w: 150, h: 96, label: "Pharmacy", fill: "#f5f2fb", door: { side: "bottom", x: 662, size: 30 } },
    { x: 770, y: 42, w: 140, h: 120, label: "Lab", fill: "#f0f6fb", door: { side: "left", y: 96, size: 34 } },
    { x: 50, y: 372, w: 164, h: 154, label: "Ward A", fill: "#f4f8fb", door: { side: "top", x: 118, size: 34 } },
    { x: 234, y: 388, w: 176, h: 136, label: "Nurse Station", fill: "#eef6f6", door: { side: "top", x: 298, size: 36 } },
    { x: 432, y: 388, w: 166, h: 136, label: "ICU", fill: "#f4f7fb", door: { side: "top", x: 494, size: 34 } },
    { x: 620, y: 388, w: 132, h: 136, label: "Storage", fill: "#f7f4ee", door: { side: "top", x: 670, size: 30 } },
    { x: 770, y: 388, w: 140, h: 136, label: "Imaging", fill: "#eef3f8", door: { side: "top", x: 824, size: 30 } },
  ];

  rooms.forEach(drawRoom);

  ctx.fillStyle = "#e1e8ec";
  for (let x = 70; x < 900; x += 40) {
    for (let y = 180; y < 358; y += 28) {
      ctx.fillRect(x, y, 34, 22);
    }
  }

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let x = 82; x < 892; x += 40) {
    ctx.fillRect(x, 184, 2, 164);
  }

  ctx.fillStyle = "rgba(255,255,255,0.25)";
  for (let y = 192; y < 348; y += 28) {
    ctx.fillRect(70, y, 808, 2);
  }

  ctx.fillStyle = "rgba(130, 149, 159, 0.14)";
  for (let x = 50; x < 900; x += 2) {
    ctx.fillRect(x, 170, 1, 184);
  }

  drawCounter(70, 66, 52, 18);
  drawCounter(126, 66, 42, 18);
  drawCabinet(292, 72, 70, 20, "#dae8ef");
  drawCabinet(440, 62, 46, 18, "#d5e8d8");
  drawBed(458, 86, true);
  drawCabinet(620, 68, 46, 20, "#ece3fb");
  drawCabinet(672, 68, 58, 20, "#ece3fb");
  drawCabinet(802, 72, 76, 26, "#d9e6ef");

  drawBed(74, 410, true);
  drawBed(74, 456, true);
  drawBed(144, 410, true);
  drawBed(144, 456, true);
  drawCounter(266, 438, 110, 24);
  drawCabinet(256, 474, 34, 24, "#dceae2");
  drawCabinet(322, 474, 34, 24, "#dceae2");
  drawBed(456, 420, false);
  drawBed(512, 420, false);
  drawCabinet(642, 430, 40, 34, "#eadfcf");
  drawCabinet(692, 430, 40, 34, "#eadfcf");
  drawCabinet(800, 422, 82, 58, "#d9e2ec");
  ctx.strokeStyle = "#93a8b4";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(840, 452, 24, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#f8fbfd";
  ctx.beginPath();
  ctx.roundRect(340, 30, 130, 46, 12);
  ctx.fill();
  ctx.strokeStyle = "#93d5e8";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#5abfe1";
  ctx.fillRect(398, 38, 12, 28);
  ctx.fillRect(390, 46, 28, 12);

  ctx.fillStyle = "#d35a5a";
  ctx.beginPath();
  ctx.roundRect(880, 472, 24, 24, 6);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(890, 477, 4, 14);
  ctx.fillRect(885, 482, 14, 4);
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
  const rawDelta = Math.min((timestamp - game.lastTime) / 1000, 0.033);
  game.lastTime = timestamp;
  const delta = rawDelta * game.speedMultiplier;

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
speedToggleBtn.addEventListener("click", toggleSpeed);
autoStartToggle.addEventListener("change", (event) => setAutoStart(event.target.checked));
restartBtn.addEventListener("click", resetGame);
modalRestartBtn.addEventListener("click", resetGame);

window.addEventListener("click", (event) => {
  if (!buildMenu.contains(event.target) && event.target !== canvas && !buildMenu.classList.contains("hidden")) {
    hideBuildMenu();
  }
});

resetGame();
requestAnimationFrame(tick);
