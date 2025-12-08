/** @format */

(() => {
  "use strict";

  // ===== CONFIGURATION =====
  const CONFIG = {
    GAME_WIDTH: 720,
    GAME_HEIGHT: 1280,
    LANE_Y: [760, 860, 960],
    PLAYER_START_X: 180,
    GRAVITY: 2200,
    JUMP_VELOCITY: -820,
    JUMP_VELOCITY_HIGH: -1050,

    // FIXED: Consistent speed values
    BASE_SPEED: 5,
    SPEED_INCREASE: 0.0008,
    MAX_SPEED: 12.0,

    // FASTER ENVIRONMENT CHANGES
    WEATHER_CHANGE_MIN: 20000,
    WEATHER_CHANGE_MAX: 40000,

    BIOME_DISTANCE: 400,
    PLANTING_ZONE_INTERVAL: 350,
    POWERUP_DURATION: {
      magnet: 6000,
      shield: 6000,
      double: 8000,
    },

    // INCREASED DISTANCE BETWEEN SEEDS BUT FASTER SPAWNING
    SEED_SPAWN_MIN_DISTANCE: 500,
    SEED_SPAWN_CHANCE: 0.006,

    TARGET_FPS: 60,
    MAX_FRAME_TIME: 1000 / 30,

    // INCREASED SPAWN CHANCES FOR FASTER ACTION
    OBSTACLE_SPAWN_CHANCE: 0.01,
    OBSTACLE_MIN_DISTANCE: 350,
    POWERUP_SPAWN_CHANCE: 0.004,
    ANIMAL_SPAWN_CHANCE: 0.006,

    // REDUCED COOLDOWNS FOR FASTER SPAWNING
    SPAWN_COOLDOWNS: {
      obstacle: 200,
      seed: 600,
      powerup: 400,
      animal: 350,
    },

    // SEED POSITIONING
    SEED_Y_OFFSET: -100,
    SEED_JUMP_HEIGHT_REQUIRED: 80,

    // FASTER OBJECT MOVEMENT
    OBJECT_SPEED_MULTIPLIER: 10,
    ANIMAL_SPEED_MULTIPLIER: 6,

    // PERFORMANCE OPTIMIZATION
    MAX_PARTICLES: 30,
    MAX_ACTIVE_NOTIFICATIONS: 5,
  };

  // ===== DOM ELEMENTS =====

  const DOM = {
    canvas: document.getElementById("gameCanvas"),
    ctx: null,
    loadingFill: document.getElementById("loadingFill"),
    loadingScreen: document.getElementById("loadingScreen"),
    backdrop: document.getElementById("backdrop"),
    scoreText: document.getElementById("scoreText"),
    seedInventory: document.getElementById("seedInventory"),
    mapPlayer: document.getElementById("mapPlayer"),
    plantStationBtn: document.getElementById("plantStationBtn"),
    pauseBtn: document.getElementById("pauseBtn"),
    leafIcon: document.getElementById("leafIcon"),
    plantStationIcon: document.getElementById("plantStationIcon"),
    topNotificationContainer: null,
    highScoreDisplay: document.getElementById("highScore"), // This can be null
  };

  // canvas safety
  if (!DOM.canvas) {
    console.error("No #gameCanvas element found. Game cannot run.");
    return;
  }
  DOM.ctx = DOM.canvas.getContext("2d", { alpha: false });

  // ===== ASSET MANAGEMENT =====
  const ASSETS = {
    images: [
      "child_character_running",
      "child_character_jumping",
      "child_character_planting",
      "background_meadow",
      "background_forest",
      "background_polluted",
      "background_riverside",
      "obstacle_rock_small",
      "obstacle_log",
      "obstacle_puddle",
      "obstacle_pollution_patch",
      "obstacle_trash_pile",
      "obstacle_tree_stump",
      "seed_oak_acorn",
      "seed_maple_key",
      "seed_pine_cone",
      "seed_birch",
      "seed_willow",
      "tree_oak_seedling",
      "tree_oak_sapling",
      "tree_oak_young",
      "tree_oak_mature",
      "tree_maple_seedling",
      "tree_maple_sapling",
      "tree_maple_young",
      "tree_maple_mature",
      "tree_pine_seedling",
      "tree_pine_sapling",
      "tree_pine_young",
      "tree_pine_mature",
      "powerup_seed_magnet",
      "powerup_shield",
      "powerup_double_points",
      "animal_bird",
      "animal_butterfly",
      "animal_rabbit",
      "ui_plant_station_icon",
      "ui_leaf_icon",
      "ui_water_drop_icon",
      "planting_zone_marker",
      "weather_rain_particle",
      "weather_cloud",
      "particle_sparkle",
      "particle_leaf",
    ],
    audio: [
      "background_music_nature",
      "sfx_jump",
      "sfx_seed_collect",
      "sfx_obstacle_hit",
      "sfx_plant_seed",
      "sfx_tree_water",
      "sfx_tree_grow",
      "sfx_powerup_collect",
      "sfx_mission_complete",
      "voice_great_job",
      "voice_new_tree",
      "voice_seed_collected",
      "sfx_rain_ambient",
    ],
    cache: {},
    audioCache: {},
  };

  // ===== AUDIO CONTEXT =====
  let audioContext = null;
  let backgroundMusic = null;
  let audioInitialized = false;
  let audioStartButton = null;

  // Helper: ensure audio context created on user gesture
  function ensureAudioContext() {
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log("AudioContext created successfully");
        // Resume the audio context immediately after creation
        audioContext
          .resume()
          .then(() => {
            console.log("AudioContext resumed");
          })
          .catch((e) => {
            console.warn("Failed to resume AudioContext:", e);
          });
      } catch (e) {
        console.warn("AudioContext not available:", e);
        audioContext = null;
        return null;
      }
    } else if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }
    return audioContext;
  }

  // ===== GAME DATA =====
  const SEED_DATA = {
    oak: { name: "Oak Acorn", points: 30, assetId: "seed_oak_acorn" },
    maple: { name: "Maple Key", points: 25, assetId: "seed_maple_key" },
    pine: { name: "Pine Cone", points: 20, assetId: "seed_pine_cone" },
    birch: { name: "Birch Seed", points: 35, assetId: "seed_birch" },
    willow: { name: "Willow Seed", points: 50, assetId: "seed_willow" },
  };

  const TREE_STAGES = ["seedling", "sapling", "young", "mature"];
  const GROWTH_TIMES = [20000, 40000, 60000, 80000];

  // ===== GAME STATE =====
  let player = {
    x: CONFIG.PLAYER_START_X,
    y: CONFIG.LANE_Y[1],
    velocityY: 0,
    isJumping: false,
    lane: 1,
    width: 120,
    height: 150,
    state: "running",
  };

  let gameState = {
    distance: 0,
    speed: CONFIG.BASE_SPEED,
    score: 0,
    collectedSeeds: {},
    plantedTrees: [],
    obstacles: [],
    seeds: [],
    powerups: [],
    activePowerups: {},
    weather: "sunny",
    weatherTimer: 0,
    nextWeatherChange: 30000,
    biome: "meadow",
    biomeDistance: 0,
    isAtPlantingZone: false,
    currentPlantingZone: null,
    animals: [],
    lastSeedSpawnDistance: 0,
    lastObstacleSpawnDistance: 0,

    // PARALLAX BACKGROUND - FASTER SCROLLING
    backgroundOffset: 0,
    backgroundLayers: [
      { speed: 0.7, offset: 0 },
      { speed: 1.0, offset: 0 },
      { speed: 1.3, offset: 0 },
    ],

    // ANIMATION - FASTER ANIMATION
    frameCount: 0,
    animationFrame: 0,

    // SPAWN CONTROL
    lastSpawnDistances: {
      obstacle: -999,
      seed: -999,
      powerup: -999,
      animal: -999,
    },

    // SEED COLLECTION
    seedCollectionEnabled: false,

    // COMBO SYSTEM
    seedCombo: 0,
    lastSeedCollectTime: 0,

    // SPEED BOOST TRACKER
    speedBoostActive: false,
    speedBoostTimer: 0,

    // PERFORMANCE TRACKING
    lastFrameTime: 0,
    fps: 0,
  };

  // ===== RUNTIME VARIABLES =====
  let lastTime = 0;
  let isRunning = false;
  let isPaused = false;
  let isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  let highScore = 0;
  let rafId = null;
  let activeNotifications = [];
  let objectPools = {
    obstacles: [],
    seeds: [],
    powerups: [],
    animals: [],
  };

  // ===== OBJECT POOLING SYSTEM =====
  const ObjectPool = {
    init: () => {
      // Pre-create objects for pooling
      for (let i = 0; i < 20; i++) {
        objectPools.obstacles.push({
          type: "",
          x: 0,
          y: 0,
          lane: 0,
          width: 60,
          height: 60,
          assetId: "",
          active: false,
        });
      }
      for (let i = 0; i < 15; i++) {
        objectPools.seeds.push({
          type: "",
          x: 0,
          y: 0,
          lane: 0,
          width: 64,
          height: 64,
          assetId: "",
          collected: false,
          active: false,
        });
      }
      for (let i = 0; i < 10; i++) {
        objectPools.powerups.push({
          type: "",
          x: 0,
          y: 0,
          width: 56,
          height: 56,
          assetId: "",
          active: false,
        });
      }
      for (let i = 0; i < 8; i++) {
        objectPools.animals.push({
          type: "",
          x: 0,
          y: 0,
          width: 40,
          height: 40,
          assetId: "",
          vx: 0,
          vy: 0,
          active: false,
        });
      }
    },

    getObstacle: () => {
      let obj = objectPools.obstacles.find((o) => !o.active);
      if (!obj) {
        obj = {
          type: "",
          x: 0,
          y: 0,
          lane: 0,
          width: 60,
          height: 60,
          assetId: "",
          active: true,
        };
        objectPools.obstacles.push(obj);
      }
      obj.active = true;
      return obj;
    },

    getSeed: () => {
      let obj = objectPools.seeds.find((s) => !s.active);
      if (!obj) {
        obj = {
          type: "",
          x: 0,
          y: 0,
          lane: 0,
          width: 64,
          height: 64,
          assetId: "",
          collected: false,
          active: true,
        };
        objectPools.seeds.push(obj);
      }
      obj.active = true;
      obj.collected = false;
      return obj;
    },

    getPowerup: () => {
      let obj = objectPools.powerups.find((p) => !p.active);
      if (!obj) {
        obj = {
          type: "",
          x: 0,
          y: 0,
          width: 56,
          height: 56,
          assetId: "",
          active: true,
        };
        objectPools.powerups.push(obj);
      }
      obj.active = true;
      return obj;
    },

    getAnimal: () => {
      let obj = objectPools.animals.find((a) => !a.active);
      if (!obj) {
        obj = {
          type: "",
          x: 0,
          y: 0,
          width: 40,
          height: 40,
          assetId: "",
          vx: 0,
          vy: 0,
          active: true,
        };
        objectPools.animals.push(obj);
      }
      obj.active = true;
      return obj;
    },

    cleanup: () => {
      // Reset all pools
      objectPools.obstacles.forEach((o) => (o.active = false));
      objectPools.seeds.forEach((s) => (s.active = false));
      objectPools.powerups.forEach((p) => (p.active = false));
      objectPools.animals.forEach((a) => (a.active = false));
    },
  };

  // ===== UTILITY FUNCTIONS =====
  const Utils = {
    fileForId: (id) => `assets/${id}.webp`,
    audioFileForId: (id) => `assets/${id}.mp3`, // All audio files in assets folder

    loadImage: (id) => {
      return new Promise((resolve) => {
        const path = Utils.fileForId(id);
        const img = new Image();
        img.onload = () => {
          ASSETS.cache[id] = { img };
          resolve(true);
        };
        img.onerror = () => {
          console.warn(`Failed to load image: ${path}`);
          // Create a fallback colored rectangle
          const canvas = document.createElement("canvas");
          canvas.width = 64;
          canvas.height = 64;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#4CAF50";
          ctx.fillRect(0, 0, 64, 64);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "12px Arial";
          ctx.fillText(id.substring(0, 8), 5, 32);

          const fallbackImg = new Image();
          fallbackImg.src = canvas.toDataURL();
          fallbackImg.onload = () => {
            ASSETS.cache[id] = { img: fallbackImg };
            resolve(true);
          };
        };
        img.src = path;
      });
    },

    loadAudioBuffer: (id) => {
      return new Promise((resolve) => {
        const path = Utils.audioFileForId(id);
        console.log(`Loading audio: ${path}`);

        fetch(path)
          .then((r) => {
            if (!r.ok) {
              console.warn(`Failed to fetch audio: ${path}`);
              resolve(false);
              return null;
            }
            return r.arrayBuffer();
          })
          .then((buf) => {
            if (!buf) {
              console.warn(`No buffer for audio: ${path}`);
              resolve(false);
              return;
            }
            if (!audioContext) {
              // Try to create audio context for decoding
              try {
                ensureAudioContext();
              } catch (e) {
                console.warn("Cannot create AudioContext:", e);
                resolve(false);
                return;
              }
            }
            if (!audioContext) {
              console.warn("AudioContext not available");
              resolve(false);
              return;
            }
            return audioContext.decodeAudioData(buf);
          })
          .then((decoded) => {
            if (decoded) {
              ASSETS.audioCache[id] = decoded;
              console.log(`✓ Loaded audio: ${id}`);
              resolve(true);
            } else {
              console.warn(`Failed to decode audio: ${id}`);
              resolve(false);
            }
          })
          .catch((error) => {
            console.warn(`Error loading audio ${id}:`, error);
            resolve(false);
          });
      });
    },

    drawImage: (id, x, y, w, h) => {
      if (!ASSETS.cache[id]) {
        // Draw fallback rectangle if image not loaded
        DOM.ctx.fillStyle = "#4CAF50";
        DOM.ctx.fillRect(x, y, w, h);
        DOM.ctx.fillStyle = "#FFFFFF";
        DOM.ctx.font = "12px Arial";
        DOM.ctx.fillText(id.substring(0, 8), x + 5, y + h / 2);
        return;
      }

      const img = ASSETS.cache[id].img;
      const imgAspect = img.width / Math.max(1, img.height);
      let dw = w,
        dh = h;
      if (w / h > imgAspect) {
        dw = h * imgAspect;
      } else {
        dh = w / imgAspect;
      }
      const ox = (w - dw) / 2;
      const oy = (h - dh) / 2;
      DOM.ctx.drawImage(img, x + ox, y + oy, dw, dh);
    },

    checkCollision: (a, b) => {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    },

    clamp: (value, min, max) => Math.min(Math.max(value, min), max),

    cleanActiveNotifications: () => {
      // Remove old notifications if we have too many
      while (activeNotifications.length > CONFIG.MAX_ACTIVE_NOTIFICATIONS) {
        const oldToast = activeNotifications.shift();
        if (oldToast && oldToast.parentNode) {
          oldToast.remove();
        }
      }
    },
  };

  // ===== AUDIO FUNCTIONS =====
  const Audio = {
    play: (id, volume = 1.0) => {
      if (!audioContext || !ASSETS.audioCache[id]) {
        console.warn(
          `Cannot play audio: ${id} - context: ${!!audioContext}, cache: ${!!ASSETS
            .audioCache[id]}`
        );
        return;
      }
      try {
        const src = audioContext.createBufferSource();
        const gain = audioContext.createGain();
        src.buffer = ASSETS.audioCache[id];
        gain.gain.value = Utils.clamp(volume, 0, 1);
        src.connect(gain);
        gain.connect(audioContext.destination);
        src.start(0);
      } catch (e) {
        console.warn("Audio playback failed:", e);
      }
    },

    playMusic: (id, volume = 0.3) => {
      if (!audioContext || !ASSETS.audioCache[id]) {
        console.warn(
          `Cannot play music: ${id} - context: ${!!audioContext}, cache: ${!!ASSETS
            .audioCache[id]}`
        );
        return null;
      }
      try {
        const src = audioContext.createBufferSource();
        const gain = audioContext.createGain();
        src.buffer = ASSETS.audioCache[id];
        src.loop = true;
        gain.gain.value = Utils.clamp(volume, 0, 1);
        src.connect(gain);
        gain.connect(audioContext.destination);
        src.start(0);
        console.log(`Background music started: ${id}`);
        return src;
      } catch (e) {
        console.warn("Music playback failed:", e);
        return null;
      }
    },

    stopMusic: (source) => {
      if (source) {
        try {
          source.stop();
          console.log("Background music stopped");
        } catch (e) {
          console.warn("Failed to stop music:", e);
        }
      }
    },
  };

  // ===== SAVE SYSTEM =====
  const SaveSystem = {
    save: () => {
      // Clean up collectedSeeds before saving - only keep valid seed types
      const validCollectedSeeds = {};
      Object.keys(gameState.collectedSeeds).forEach((k) => {
        if (SEED_DATA[k] && gameState.collectedSeeds[k] > 0) {
          validCollectedSeeds[k] = gameState.collectedSeeds[k];
        }
      });

      const saveData = {
        highScore: Math.max(gameState.score, highScore),
        totalSeeds: Object.values(validCollectedSeeds).reduce(
          (a, b) => a + b,
          0
        ),
        totalTrees: gameState.plantedTrees.length,
        collectedSeeds: validCollectedSeeds,
        score: gameState.score,
        distance: gameState.distance,
        timestamp: Date.now(),
      };
      localStorage.setItem("seedSaverSave", JSON.stringify(saveData));
      return saveData;
    },

    load: () => {
      const saved = localStorage.getItem("seedSaverSave");
      if (!saved) return null;

      try {
        const parsed = JSON.parse(saved);

        // Check if save is too old (older than 30 days)
        if (
          parsed.timestamp &&
          Date.now() - parsed.timestamp > 30 * 24 * 60 * 60 * 1000
        ) {
          console.log("Save file is older than 30 days, resetting");
          return null;
        }

        // Validate and clean up saved data
        if (parsed.collectedSeeds) {
          const cleanedSeeds = {};
          Object.keys(parsed.collectedSeeds).forEach((k) => {
            if (SEED_DATA[k] && parsed.collectedSeeds[k] > 0) {
              cleanedSeeds[k] = parsed.collectedSeeds[k];
            }
          });
          parsed.collectedSeeds = cleanedSeeds;
        }

        return parsed;
      } catch (e) {
        console.error("Failed to parse saved data:", e);
        return null;
      }
    },

    clear: () => {
      localStorage.removeItem("seedSaverSave");
      localStorage.removeItem("plantStationSeeds");
      console.log("Save data cleared");
    },
  };

  // ===== ACCESSIBILITY =====
  const Accessibility = {
    announce: (message, priority = "polite") => {
      const announcer =
        document.getElementById("aria-announcer") ||
        (() => {
          const el = document.createElement("div");
          el.id = "aria-announcer";
          el.setAttribute("aria-live", "polite");
          el.setAttribute("aria-atomic", "true");
          el.style.cssText =
            "position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;";
          document.body.appendChild(el);
          return el;
        })();

      announcer.setAttribute("aria-live", priority);
      setTimeout(() => {
        announcer.textContent = message;
      }, 100);
    },
  };

  // ===== NAVIGATION TO PLANT STATION =====
  function navigateToPlantStation() {
    console.log("Navigating to Plant Station...");

    // Check if we have any seeds
    const hasSeeds = Object.values(gameState.collectedSeeds).some(
      (count) => count > 0
    );

    if (!hasSeeds) {
      // Show notification if no seeds
      UI.showNotification(
        "No seeds available",
        "Collect seeds while running!",
        "#e65100",
        "linear-gradient(90deg,#ffffff,#fff3e0)",
        "🌱"
      );
      return;
    }

    // Pause the game
    isRunning = false;
    isPaused = true;

    // Save current game state
    const saveData = SaveSystem.save();

    // Pass seeds data to plant station
    try {
      // Store seeds in localStorage for plant station to access
      localStorage.setItem(
        "plantStationSeeds",
        JSON.stringify(gameState.collectedSeeds)
      );
      localStorage.setItem("plantStationScore", gameState.score.toString());
      localStorage.setItem(
        "plantStationDistance",
        gameState.distance.toString()
      );

      console.log(
        "Seeds transferred to plant station:",
        gameState.collectedSeeds
      );

      // Clear seeds from main game after transferring
      Object.keys(gameState.collectedSeeds).forEach((key) => {
        gameState.collectedSeeds[key] = 0;
      });

      // Update UI
      UI.updateSeedInventory();
      UI.hidePlantStation();

      // Show success message
      UI.showNotification(
        "Seeds transferred!",
        "Taking you to Plant Station...",
        "#2E7D32",
        "linear-gradient(90deg,#ffffff,#f0fff4)",
        "🌿"
      );

      // Wait a moment for UI updates, then navigate
      setTimeout(() => {
        // Try to navigate, fall back to showing seed UI if station.html doesn't exist
        try {
          // Check if station.html exists by trying to fetch it
          fetch("station.html")
            .then((response) => {
              if (response.ok) {
                window.location.href = "station.html";
              } else {
                throw new Error("Station page not found");
              }
            })
            .catch((error) => {
              console.warn(
                "Station page not found, showing seed UI instead:",
                error
              );
              UI.showSeedCardUI();
              isRunning = true;
              isPaused = false;
            });
        } catch (e) {
          console.warn("Navigation failed, showing seed UI:", e);
          UI.showSeedCardUI();
          isRunning = true;
          isPaused = false;
        }
      }, 1500);
    } catch (e) {
      console.warn("Failed to transfer seeds:", e);
      // If there's an error, resume the game
      isRunning = true;
      isPaused = false;

      UI.showNotification(
        "Navigation failed",
        "Please try again",
        "#d32f2f",
        "linear-gradient(90deg,#ffebee,#ffcdd2)",
        "⚠️"
      );
    }
  }

  // ===== Helpful utility: set icon into element =====
  function setIcon(targetEl, src) {
    if (!targetEl || !src) return;
    try {
      // Clear any existing text content
      targetEl.textContent = "";
      targetEl.style.fontSize = "0";
      targetEl.style.color = "transparent";

      let childImg = targetEl.querySelector && targetEl.querySelector("img");
      if (!childImg) {
        childImg = document.createElement("img");
        childImg.style.width = "100%";
        childImg.style.height = "100%";
        childImg.style.objectFit = "contain";
        childImg.style.pointerEvents = "none";
        childImg.style.display = "block";
        targetEl.appendChild(childImg);
      }
      childImg.src = src;
      childImg.style.display = "block";
      childImg.alt =
        targetEl.id === "leafIcon" ? "Leaf icon" : "Plant station icon";
      childImg.setAttribute("aria-hidden", "true");
    } catch (e) {
      console.warn("Failed to set icon", e);
    }
  }

  // ===== ASSET LOADING =====
  async function preloadAssets() {
    const total = ASSETS.images.length + ASSETS.audio.length;
    let loaded = 0;

    const updateProgress = () => {
      loaded++;
      const progress = (loaded / total) * 100;
      if (DOM.loadingFill) DOM.loadingFill.style.width = `${progress}%`;

      const loadingStatus =
        DOM.loadingScreen && DOM.loadingScreen.querySelector(".loading-status");
      if (loadingStatus) {
        loadingStatus.textContent = `Loading... ${Math.round(progress)}%`;
      }
    };

    // Load images with timeout
    for (const id of ASSETS.images) {
      try {
        await Promise.race([
          Utils.loadImage(id),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 10000)
          ),
        ]);
        updateProgress();
      } catch (error) {
        console.warn(`Failed to load image: ${id}`, error);
        updateProgress();
      }
    }

    // Load audio with timeout
    for (const id of ASSETS.audio) {
      try {
        await Promise.race([
          Utils.loadAudioBuffer(id),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 10000)
          ),
        ]);
        updateProgress();
      } catch (error) {
        console.warn(`Failed to load audio: ${id}`, error);
        updateProgress();
      }
    }

    // Log audio loading status
    console.log("Audio loading complete. Status:");
    ASSETS.audio.forEach((id) => {
      console.log(`${ASSETS.audioCache[id] ? "✓" : "✗"} ${id}.mp3`);
    });

    // Initialize UI icons
    if (ASSETS.cache["ui_plant_station_icon"] && DOM.plantStationIcon) {
      setIcon(
        DOM.plantStationIcon,
        ASSETS.cache["ui_plant_station_icon"].img.src
      );
      DOM.plantStationIcon.style.display = "flex";
    }
    if (ASSETS.cache["ui_leaf_icon"] && DOM.leafIcon) {
      setIcon(DOM.leafIcon, ASSETS.cache["ui_leaf_icon"].img.src);
      DOM.leafIcon.style.display = "flex";
    }
  }

  // ===== SPAWN FUNCTIONS =====
  const Spawner = {
    obstacle: (type, x, lane = 1) => {
      const assetMap = {
        rock: "obstacle_rock_small",
        log: "obstacle_log",
        puddle: "obstacle_puddle",
        pollution: "obstacle_pollution_patch",
        trash: "obstacle_trash_pile",
        stump: "obstacle_tree_stump",
      };

      const obstacle = ObjectPool.getObstacle();
      obstacle.type = type;
      obstacle.x = x;
      obstacle.y = CONFIG.LANE_Y[lane];
      obstacle.lane = lane;
      obstacle.assetId = assetMap[type] || "obstacle_rock_small";

      gameState.obstacles.push(obstacle);
    },

    seed: (type, x, lane = 1) => {
      const assetMap = {
        oak: "seed_oak_acorn",
        maple: "seed_maple_key",
        pine: "seed_pine_cone",
        birch: "seed_birch",
        willow: "seed_willow",
      };

      const seed = ObjectPool.getSeed();
      seed.type = type;
      seed.x = x;
      seed.y = CONFIG.LANE_Y[lane] + CONFIG.SEED_Y_OFFSET;
      seed.lane = lane;
      seed.assetId = assetMap[type] || "seed_oak_acorn";
      seed.collected = false;

      gameState.seeds.push(seed);
    },

    powerup: (type, x) => {
      const assetMap = {
        magnet: "powerup_seed_magnet",
        shield: "powerup_shield",
        double: "powerup_double_points",
      };

      const powerup = ObjectPool.getPowerup();
      powerup.type = type;
      powerup.x = x;
      powerup.y = CONFIG.LANE_Y[1] - 120;
      powerup.assetId = assetMap[type];

      gameState.powerups.push(powerup);
    },

    animal: (type, x, y) => {
      const assetMap = {
        bird: "animal_bird",
        butterfly: "animal_butterfly",
        rabbit: "animal_rabbit",
      };

      const animal = ObjectPool.getAnimal();
      animal.type = type;
      animal.x = x;
      animal.y = y;
      animal.assetId = assetMap[type];
      animal.vx = (Math.random() * 3 - 1.5) * 2;
      animal.vy =
        type === "bird" || type === "butterfly"
          ? (Math.random() * 3 - 1.5) * 2
          : 0;

      gameState.animals.push(animal);
    },

    // ENHANCED SPAWNING WITH BETTER SPACING
    canSpawnObjectAtX: (x, objectType, minDistance) => {
      let allObjects = [];

      switch (objectType) {
        case "seed":
          allObjects = gameState.seeds;
          break;
        case "obstacle":
          allObjects = gameState.obstacles;
          break;
        case "powerup":
          allObjects = gameState.powerups;
          break;
        case "animal":
          allObjects = gameState.animals;
          break;
      }

      return !allObjects.some((obj) => Math.abs(obj.x - x) < minDistance);
    },

    // CONTROLLED SPAWNING FUNCTIONS
    trySpawnObstacle: () => {
      const spawnX = CONFIG.GAME_WIDTH + 300;
      const distanceSinceLastSpawn =
        gameState.distance - gameState.lastSpawnDistances.obstacle;

      if (
        distanceSinceLastSpawn > CONFIG.SPAWN_COOLDOWNS.obstacle &&
        Math.random() < CONFIG.OBSTACLE_SPAWN_CHANCE &&
        Spawner.canSpawnObjectAtX(
          spawnX,
          "obstacle",
          CONFIG.OBSTACLE_MIN_DISTANCE
        )
      ) {
        const types = ["rock", "log", "puddle", "pollution", "trash", "stump"];
        Spawner.obstacle(
          types[Math.floor(Math.random() * types.length)],
          spawnX,
          Math.floor(Math.random() * 3)
        );
        gameState.lastSpawnDistances.obstacle = gameState.distance;
        return true;
      }
      return false;
    },

    trySpawnSeed: () => {
      const spawnX = CONFIG.GAME_WIDTH + 350;
      const distanceSinceLastSpawn =
        gameState.distance - gameState.lastSpawnDistances.seed;

      if (
        distanceSinceLastSpawn > CONFIG.SPAWN_COOLDOWNS.seed &&
        Math.random() < CONFIG.SEED_SPAWN_CHANCE &&
        Spawner.canSpawnObjectAtX(
          spawnX,
          "seed",
          CONFIG.SEED_SPAWN_MIN_DISTANCE
        )
      ) {
        const types = Object.keys(SEED_DATA);
        const type = types[Math.floor(Math.random() * types.length)];
        const lane = Math.floor(Math.random() * 3);

        Spawner.seed(type, spawnX, lane);
        gameState.lastSpawnDistances.seed = gameState.distance;
        return true;
      }
      return false;
    },

    trySpawnPowerup: () => {
      const spawnX = CONFIG.GAME_WIDTH + 300;
      const distanceSinceLastSpawn =
        gameState.distance - gameState.lastSpawnDistances.powerup;

      if (
        distanceSinceLastSpawn > CONFIG.SPAWN_COOLDOWNS.powerup &&
        Math.random() < CONFIG.POWERUP_SPAWN_CHANCE &&
        Spawner.canSpawnObjectAtX(spawnX, "powerup", 250)
      ) {
        const types = ["magnet", "shield", "double"];
        Spawner.powerup(
          types[Math.floor(Math.random() * types.length)],
          spawnX
        );
        gameState.lastSpawnDistances.powerup = gameState.distance;
        return true;
      }
      return false;
    },

    trySpawnAnimal: () => {
      const spawnX = CONFIG.GAME_WIDTH + 300;
      const distanceSinceLastSpawn =
        gameState.distance - gameState.lastSpawnDistances.animal;

      if (
        distanceSinceLastSpawn > CONFIG.SPAWN_COOLDOWNS.animal &&
        Math.random() < CONFIG.ANIMAL_SPAWN_CHANCE &&
        Spawner.canSpawnObjectAtX(spawnX, "animal", 300)
      ) {
        const types = ["bird", "butterfly", "rabbit"];
        Spawner.animal(
          types[Math.floor(Math.random() * types.length)],
          spawnX,
          200 + Math.random() * 600
        );
        gameState.lastSpawnDistances.animal = gameState.distance;
        return true;
      }
      return false;
    },
  };

  // ===== UI FUNCTIONS =====
  const UI = {
    showBackdrop: () => {
      if (DOM.backdrop) {
        DOM.backdrop.style.display = "block";
        setTimeout(() => {
          DOM.backdrop.style.opacity = "1";
        }, 10);
      }
    },

    hideBackdrop: () => {
      if (DOM.backdrop) {
        DOM.backdrop.style.opacity = "0";
        setTimeout(() => {
          DOM.backdrop.style.display = "none";
        }, 300);
      }
    },

    _ensureTopContainer: () => {
      if (!DOM.topNotificationContainer) {
        const c = document.createElement("div");
        c.id = "top-notifications";
        c.setAttribute("aria-live", "polite");
        c.setAttribute("aria-atomic", "false");
        c.style.position = "fixed";
        c.style.top = "12px";
        c.style.left = "50%";
        c.style.transform = "translateX(-50%)";
        c.style.zIndex = "9999";
        c.style.display = "flex";
        c.style.flexDirection = "column";
        c.style.gap = "8px";
        c.style.maxWidth = "90vw";
        c.style.pointerEvents = "none";
        document.body.appendChild(c);
        DOM.topNotificationContainer = c;
      }
      return DOM.topNotificationContainer;
    },

    showNotification: (title, subtitle, color, background, emoji = "") => {
      const container = UI._ensureTopContainer();

      // Clean up old notifications
      Utils.cleanActiveNotifications();

      const toast = document.createElement("div");
      toast.className = "seed-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.setAttribute("aria-atomic", "true");
      toast.style.minWidth = "220px";
      toast.style.maxWidth = "280px";
      toast.style.padding = "10px 12px";
      toast.style.borderRadius = "10px";
      toast.style.boxShadow = "0 6px 18px rgba(0,0,0,0.18)";
      toast.style.background =
        background || "linear-gradient(90deg,#ffffff,#f0fff4)";
      toast.style.color = color || "#1b5e20";
      toast.style.display = "flex";
      toast.style.alignItems = "center";
      toast.style.gap = "10px";
      toast.style.fontWeight = "700";
      toast.style.opacity = "0";
      toast.style.transition = "transform 220ms ease, opacity 220ms ease";
      toast.style.pointerEvents = "auto";

      const emojiHTML = emoji
        ? `<div style="font-size:36px">${emoji}</div>`
        : "";

      toast.innerHTML = `
        ${emojiHTML}
        <div style="display:flex;flex-direction:column;line-height:1">
          <div style="font-size:14px">${title}</div>
          <div style="font-size:12px;color:${color};font-weight:600">${subtitle}</div>
        </div>
      `;

      container.appendChild(toast);
      activeNotifications.push(toast);

      // Animate in
      requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
      });

      Accessibility.announce(`${title}. ${subtitle}`);

      // Auto-remove after delay
      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-8px)";
        setTimeout(() => {
          const index = activeNotifications.indexOf(toast);
          if (index > -1) activeNotifications.splice(index, 1);
          if (toast.parentNode === container) {
            container.removeChild(toast);
          }
        }, 250);
      }, 1500);
    },

    showSeedCollectedNotification: (seedType, combo = 0) => {
      const data = SEED_DATA[seedType];
      if (!data) {
        console.warn(`Unknown seed type: ${seedType}`);
        return;
      }

      const container = UI._ensureTopContainer();

      // Clean up old notifications
      Utils.cleanActiveNotifications();

      const toast = document.createElement("div");
      toast.className = "seed-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.setAttribute("aria-atomic", "true");
      toast.style.minWidth = "220px";
      toast.style.maxWidth = "280px";
      toast.style.padding = "10px 12px";
      toast.style.borderRadius = "10px";
      toast.style.boxShadow = "0 6px 18px rgba(0,0,0,0.18)";

      if (combo > 1) {
        toast.style.background = "linear-gradient(90deg,#fff3e0,#ffecb3)";
        toast.style.color = "#e65100";
      } else {
        toast.style.background = "linear-gradient(90deg,#ffffff,#f0fff4)";
        toast.style.color = "#1b5e20";
      }

      toast.style.display = "flex";
      toast.style.alignItems = "center";
      toast.style.gap = "10px";
      toast.style.fontWeight = "700";
      toast.style.opacity = "0";
      toast.style.transition = "transform 220ms ease, opacity 220ms ease";
      toast.style.pointerEvents = "auto";

      const imgSrc = ASSETS.cache[data.assetId]?.img?.src || "";
      const imgAlt = data.name;

      let bonusText = "";
      if (combo > 1) {
        bonusText = `<div style="font-size:11px;color:#e65100;font-weight:600">Combo x${combo}! +${
          (combo - 1) * 5
        } bonus</div>`;
      }

      // Create the image element separately to handle errors properly
      const imgContainer = document.createElement("div");
      imgContainer.style.cssText = "width:44px;height:44px;position:relative;";

      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = imgAlt;
      img.setAttribute("aria-hidden", "true");
      img.style.cssText =
        "width:100%;height:100%;object-fit:contain;border-radius:6px;display:block;";

      // Create fallback element
      const fallback = document.createElement("div");
      fallback.style.cssText = `
        position:absolute;top:0;left:0;width:100%;height:100%;
        background:#4CAF50;border-radius:6px;display:none;
        align-items:center;justify-content:center;color:white;
        font-size:20px;font-weight:bold;
      `;
      fallback.textContent = data.name.charAt(0);
      fallback.setAttribute("aria-hidden", "true");

      // Handle image error
      img.onerror = () => {
        img.style.display = "none";
        fallback.style.display = "flex";
      };

      imgContainer.appendChild(img);
      imgContainer.appendChild(fallback);

      // Create text content
      const textContainer = document.createElement("div");
      textContainer.style.cssText =
        "display:flex;flex-direction:column;line-height:1;";
      textContainer.innerHTML = `
        <div style="font-size:14px">${data.name} collected</div>
        <div style="font-size:12px;color:#2e7d32;font-weight:600">+${data.points} Eco-Points</div>
        ${bonusText}
      `;

      // Assemble the toast
      toast.appendChild(imgContainer);
      toast.appendChild(textContainer);

      container.appendChild(toast);
      activeNotifications.push(toast);

      // Animate in
      requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
      });

      Accessibility.announce(
        `${data.name} seed collected, +${data.points} points${
          combo > 1 ? `, combo x${combo} bonus` : ""
        }`
      );

      Audio.play("voice_seed_collected", 0.6);
      Audio.play("sfx_seed_collect", 0.7);

      // Auto-remove after delay
      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-8px)";
        setTimeout(() => {
          const index = activeNotifications.indexOf(toast);
          if (index > -1) activeNotifications.splice(index, 1);
          if (toast.parentNode === container) {
            container.removeChild(toast);
          }
        }, 250);
      }, 1500);
    },

    showEducationalPopup: (seedType) => {
      const data = SEED_DATA[seedType];
      if (!data) return;

      const popup = document.createElement("div");
      popup.className = "popup";
      popup.setAttribute("role", "dialog");
      popup.setAttribute("aria-modal", "true");
      popup.setAttribute("aria-label", `Information about ${data.name}`);

      const imgSrc = ASSETS.cache[data.assetId]?.img?.src || "";

      popup.innerHTML = `
        <button class="popup-close" aria-label="Close dialog">×</button>
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
          <img 
  src="${imgSrc}" 
  class="seed-item-img"
  alt="${data.name}"
  onerror="this.src='assets/img/seed_placeholder.png'"
/>

          <div style="font-weight:800;color:#388E3C;font-size:20px">${data.name}</div>
          <div style="color:#666;font-size:16px">+${data.points} Eco-Points</div>
        </div>`;

      const closeBtn = popup.querySelector(".popup-close");
      closeBtn.onclick = () => {
        popup.remove();
        UI.hideBackdrop();
        isRunning = true;
        closeBtn.blur();
      };

      // Close on escape key
      popup.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeBtn.click();
        }
      });

      document.body.appendChild(popup);
      UI.showBackdrop();
      isRunning = false;
      Audio.play("voice_seed_collected", 0.7);

      // Focus the close button for accessibility
      setTimeout(() => closeBtn.focus(), 100);
    },

    showSeedCardUI: () => {
      const hasSeeds = Object.values(gameState.collectedSeeds).some(
        (c) => c > 0
      );
      if (!hasSeeds) {
        UI.showNotification(
          "No seeds available",
          "Collect seeds while running!",
          "#e65100",
          "linear-gradient(90deg,#ffffff,#fff3e0)",
          "🌱"
        );
        return;
      }

      const panel = document.createElement("div");
      panel.className = "panel";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      panel.setAttribute("aria-label", "Plant a seed");

      let seedsHTML = "";
      for (const [type, count] of Object.entries(gameState.collectedSeeds)) {
        if (count > 0) {
          const data = SEED_DATA[type];
          const imgSrc = ASSETS.cache[data.assetId]?.img?.src || "";

          seedsHTML += `
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;
                        padding:12px;border-radius:12px;background:#f5f5f5">
              <img 
  src="${imgSrc}" 
  class="seed-item-img"
  alt="${data.name}"
  onerror="this.src='assets/img/seed_placeholder.png'"
/>

              <div style="flex:1">
                <strong style="display:block;margin-bottom:4px">${data.name}</strong>
                <small style="color:#666">${count} available</small>
              </div>
              <button data-type="${type}" aria-label="Plant ${data.name}">Plant</button>
            </div>`;
        }
      }

      panel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-weight:800;font-size:18px;color:#2E7D32">Plant a Seed</div>
          <button class="popup-close" aria-label="Close dialog">×</button>
        </div>
        <div>${seedsHTML}</div>`;

      const closeBtn = panel.querySelector(".popup-close");
      closeBtn.onclick = () => {
        panel.remove();
        UI.hideBackdrop();
        isRunning = true;
        closeBtn.blur();
      };

      // Close on escape key
      panel.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeBtn.click();
        }
      });

      document.body.appendChild(panel);
      UI.showBackdrop();

      panel.querySelectorAll("button[data-type]").forEach((btn) => {
        btn.onclick = () => {
          const type = btn.dataset.type;
          Game.plantSeed(type);
          panel.remove();
          UI.hideBackdrop();
          isRunning = true;
          btn.blur();
        };
      });

      isRunning = false;

      // Focus first plant button for accessibility
      setTimeout(() => {
        const firstPlantBtn = panel.querySelector("button[data-type]");
        if (firstPlantBtn) firstPlantBtn.focus();
      }, 100);
    },

    // INITIALIZE SEED INVENTORY STRUCTURE
    initSeedInventory: () => {
      if (!DOM.seedInventory) return;
      // Set up the proper structure for seed inventory
      DOM.seedInventory.innerHTML = '<div class="seed-inventory-scroll"></div>';
    },

    // UPDATE SEED INVENTORY WITH PROPER STRUCTURE
    updateSeedInventory: () => {
      if (!DOM.seedInventory) return;

      // Make sure we have the scroll container
      let scrollContainer = DOM.seedInventory.querySelector(
        ".seed-inventory-scroll"
      );
      if (!scrollContainer) {
        scrollContainer = document.createElement("div");
        scrollContainer.className = "seed-inventory-scroll";
        DOM.seedInventory.appendChild(scrollContainer);
      }

      // Clear existing items
      scrollContainer.innerHTML = "";

      for (const [type, count] of Object.entries(gameState.collectedSeeds)) {
        if (count > 0) {
          const seedData = SEED_DATA[type];
          if (!seedData) {
            console.warn(`Unknown seed type found in saved data: ${type}`);
            continue;
          }

          const imgSrc = ASSETS.cache[seedData.assetId]?.img?.src || "";
          const el = document.createElement("div");
          el.className = "seed-item";
          el.setAttribute("aria-label", `${seedData.name}: ${count} available`);
          el.setAttribute("role", "listitem");

          // Create a fallback if image fails to load
          const fallbackHTML = `
            <div style="width:48px;height:48px;border-radius:50%;background:#4CAF50;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;font-weight:bold;"
                 aria-hidden="true">
              ${type.charAt(0).toUpperCase()}
            </div>
          `;

          el.innerHTML = `
            <img src="${imgSrc}" alt="${seedData.name}" 
                 onerror="this.parentNode.innerHTML = \`${fallbackHTML}\`;"
                 style="width:48px;height:48px;object-fit:contain;display:block;"
                 aria-hidden="true">
            <div class="seed-count">×${count}</div>`;
          scrollContainer.appendChild(el);
        }
      }

      // Add role attribute to container
      if (DOM.seedInventory.children.length > 0) {
        DOM.seedInventory.setAttribute("role", "list");
        DOM.seedInventory.setAttribute("aria-label", "Collected seeds");
      }

      // Show plant station button if we have seeds
      const hasSeeds = Object.values(gameState.collectedSeeds).some(
        (count) => count > 0
      );
      if (hasSeeds) {
        UI.showPlantStation();
      } else {
        UI.hidePlantStation();
      }
    },

    updateScore: () => {
      if (DOM.scoreText) {
        DOM.scoreText.textContent = Math.floor(gameState.score);
        DOM.scoreText.setAttribute(
          "aria-label",
          `Score: ${Math.floor(gameState.score)}`
        );
      }

      if (gameState.score > highScore) {
        highScore = gameState.score;

        // Update high score display if it exists
        if (DOM.highScoreDisplay) {
          DOM.highScoreDisplay.textContent = `High: ${Math.floor(highScore)}`;
          DOM.highScoreDisplay.setAttribute(
            "aria-label",
            `High score: ${Math.floor(highScore)}`
          );
        }
      }
    },

    updateMapPosition: () => {
      if (!DOM.mapPlayer) return;
      const progress = (gameState.distance % 1000) / 1000;
      DOM.mapPlayer.style.top = `${progress * 100}%`;
      DOM.mapPlayer.setAttribute(
        "aria-label",
        `Progress: ${Math.round(progress * 100)}%`
      );
    },

    hidePlantStation: () => {
      if (DOM.plantStationBtn) {
        DOM.plantStationBtn.style.display = "none";
        DOM.plantStationBtn.setAttribute("aria-hidden", "true");
      }
    },

    showPlantStation: () => {
      if (DOM.plantStationBtn) {
        DOM.plantStationBtn.style.display = "flex";
        DOM.plantStationBtn.setAttribute("aria-hidden", "false");
        DOM.plantStationBtn.setAttribute("aria-label", "Go to Plant Station");
      }
    },
  };

  // ===== GAME LOGIC =====
  const Game = {
    handleSeedCollection: (seed) => {
      const now = Date.now();

      // Combo system
      if (now - gameState.lastSeedCollectTime < 1500) {
        gameState.seedCombo++;
        const bonusPoints = Math.min((gameState.seedCombo - 1) * 5, 50);
        gameState.score += bonusPoints;

        // Speed boost for combos
        if (gameState.seedCombo >= 3) {
          gameState.speedBoostActive = true;
          gameState.speedBoostTimer = 3000;
          gameState.speed = Math.min(
            gameState.speed * 1.3,
            CONFIG.MAX_SPEED * 1.5
          );
        }
      } else {
        gameState.seedCombo = 1;
      }
      gameState.lastSeedCollectTime = now;

      seed.collected = true;
      seed.active = false; // Return to pool
      gameState.collectedSeeds[seed.type] =
        (gameState.collectedSeeds[seed.type] || 0) + 1;
      const pts = SEED_DATA[seed.type].points;
      gameState.score += gameState.activePowerups.double ? pts * 2 : pts;

      UI.showPlantStation();
      UI.showSeedCollectedNotification(seed.type, gameState.seedCombo);
      UI.updateSeedInventory();
      Audio.play("sfx_seed_collect", 0.7);
    },

    plantSeed: (seedType) => {
      if (
        !gameState.collectedSeeds[seedType] ||
        gameState.collectedSeeds[seedType] <= 0
      )
        return;

      gameState.collectedSeeds[seedType]--;
      const tree = {
        id: Date.now(),
        type: seedType,
        stage: 0,
        stageTimer: 0,
        waterLevel: 0,
        x: player.x,
        y: player.y,
        position: gameState.distance,
      };
      gameState.plantedTrees.push(tree);
      gameState.score += SEED_DATA[seedType].points;

      Audio.play("sfx_plant_seed", 0.6);
      Audio.play("voice_new_tree", 0.6);
      UI.updateSeedInventory();

      const hasSeeds = Object.values(gameState.collectedSeeds).some(
        (c) => c > 0
      );
      if (!hasSeeds) {
        UI.hidePlantStation();
      }

      SaveSystem.save();
    },

    handleJump: (isLong = false) => {
      if (!player.isJumping && isRunning && !isPaused) {
        player.isJumping = true;
        player.state = "jumping";
        player.velocityY = isLong
          ? CONFIG.JUMP_VELOCITY_HIGH
          : CONFIG.JUMP_VELOCITY;
        Audio.play("sfx_jump", 0.9);
      }
    },

    changeBiomeBasedOnObstacle: (obstacleType) => {
      const earthObstacles = ["rock", "stump", "log"];
      const pollutedObstacles = ["pollution", "trash"];

      if (earthObstacles.includes(obstacleType)) {
        gameState.biome = "forest";
        gameState.biomeDistance = 0;
      } else if (pollutedObstacles.includes(obstacleType)) {
        gameState.biome = "polluted";
        gameState.biomeDistance = 0;
      } else if (obstacleType === "puddle") {
        gameState.biome = "riverside";
        gameState.biomeDistance = 0;
      } else {
        gameState.biomeDistance += gameState.speed;
        if (gameState.biomeDistance >= CONFIG.BIOME_DISTANCE) {
          gameState.biome = "meadow";
          gameState.biomeDistance = 0;
        }
      }
    },

    update: (deltaTime) => {
      if (!isRunning || isPaused) return;

      deltaTime = Math.min(deltaTime, CONFIG.MAX_FRAME_TIME);

      // Calculate FPS
      const now = performance.now();
      if (gameState.lastFrameTime > 0) {
        gameState.fps = Math.round(1000 / (now - gameState.lastFrameTime));
      }
      gameState.lastFrameTime = now;

      // Update animation frame based on speed
      gameState.frameCount++;
      if (
        gameState.frameCount % Math.max(1, Math.floor(8 / gameState.speed)) ===
        0
      ) {
        gameState.animationFrame = (gameState.animationFrame + 1) % 4;
      }

      // Manage speed boost
      if (gameState.speedBoostActive) {
        gameState.speedBoostTimer -= deltaTime * 1000;
        if (gameState.speedBoostTimer <= 0) {
          gameState.speedBoostActive = false;
          gameState.speed = Math.min(gameState.speed, CONFIG.MAX_SPEED);
        }
      }

      gameState.distance += gameState.speed * deltaTime * 60;
      gameState.speed =
        CONFIG.BASE_SPEED + gameState.distance * CONFIG.SPEED_INCREASE;
      gameState.speed = Math.min(
        CONFIG.MAX_SPEED * (gameState.speedBoostActive ? 1.5 : 1),
        gameState.speed
      );

      // Update background offsets for faster parallax scrolling effect
      const baseSpeed = gameState.speed * deltaTime * 2.5;
      gameState.backgroundOffset += baseSpeed;

      gameState.backgroundLayers.forEach((layer, index) => {
        layer.offset += baseSpeed * layer.speed;
        if (layer.offset >= CONFIG.GAME_WIDTH) {
          layer.offset = 0;
        }
      });

      // Player physics
      if (player.isJumping) {
        player.velocityY += CONFIG.GRAVITY * deltaTime;
        player.y += player.velocityY * deltaTime;
        if (player.y >= CONFIG.LANE_Y[player.lane]) {
          player.y = CONFIG.LANE_Y[player.lane];
          player.velocityY = 0;
          player.isJumping = false;
          player.state = "running";
          gameState.seedCollectionEnabled = false;
        }
      }

      // Enable seed collection only when jumping high enough
      if (player.isJumping && player.velocityY < -300) {
        gameState.seedCollectionEnabled = true;
      }

      gameState.weatherTimer += deltaTime * 1000;
      if (gameState.weatherTimer >= gameState.nextWeatherChange) {
        const weathers = ["sunny", "cloudy", "rain"];
        gameState.weather =
          weathers[Math.floor(Math.random() * weathers.length)];
        gameState.weatherTimer = 0;
        gameState.nextWeatherChange =
          CONFIG.WEATHER_CHANGE_MIN +
          Math.random() *
            (CONFIG.WEATHER_CHANGE_MAX - CONFIG.WEATHER_CHANGE_MIN);
      }

      // Update obstacles (using object pooling)
      for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
        const obstacle = gameState.obstacles[i];
        obstacle.x -=
          gameState.speed * CONFIG.OBJECT_SPEED_MULTIPLIER * deltaTime;

        if (!player.isJumping && Utils.checkCollision(player, obstacle)) {
          if (!gameState.activePowerups.shield) {
            gameState.score = Math.max(0, gameState.score - 5);
            Audio.play("sfx_obstacle_hit");
            gameState.speed = Math.max(1.0, gameState.speed - 0.3);
            Game.changeBiomeBasedOnObstacle(obstacle.type);
          } else {
            gameState.activePowerups.shield = false;
          }
          obstacle.active = false;
          gameState.obstacles.splice(i, 1);
        } else if (obstacle.x < -200) {
          obstacle.active = false;
          gameState.obstacles.splice(i, 1);
        }
      }

      // Update seeds (using object pooling)
      for (let i = gameState.seeds.length - 1; i >= 0; i--) {
        const seed = gameState.seeds[i];
        seed.x -= gameState.speed * CONFIG.OBJECT_SPEED_MULTIPLIER * deltaTime;

        const dx = player.x - seed.x;
        const dy = player.y - seed.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const collDist = gameState.activePowerups.magnet ? 180 : 70;

        const canCollect =
          gameState.activePowerups.magnet ||
          (player.isJumping && gameState.seedCollectionEnabled);

        if (canCollect && dist < collDist && !seed.collected) {
          Game.handleSeedCollection(seed);
          gameState.seeds.splice(i, 1);
        } else if (seed.x < -400) {
          seed.active = false;
          gameState.seeds.splice(i, 1);
        }
      }

      // Update powerups (using object pooling)
      for (let i = gameState.powerups.length - 1; i >= 0; i--) {
        const powerup = gameState.powerups[i];
        powerup.x -=
          gameState.speed * CONFIG.OBJECT_SPEED_MULTIPLIER * deltaTime;

        if (Utils.checkCollision(player, powerup)) {
          const duration = CONFIG.POWERUP_DURATION[powerup.type];
          gameState.activePowerups[powerup.type] = true;
          setTimeout(() => {
            gameState.activePowerups[powerup.type] = false;
          }, duration);
          Audio.play("sfx_powerup_collect", 0.9);
          powerup.active = false;
          gameState.powerups.splice(i, 1);
        } else if (powerup.x < -200) {
          powerup.active = false;
          gameState.powerups.splice(i, 1);
        }
      }

      // Update animals (using object pooling)
      for (let i = gameState.animals.length - 1; i >= 0; i--) {
        const animal = gameState.animals[i];
        animal.x -=
          gameState.speed * CONFIG.ANIMAL_SPEED_MULTIPLIER * deltaTime;
        animal.x += animal.vx * 1.5;
        animal.y += animal.vy * 1.5;

        if (animal.y < 120) animal.vy = Math.abs(animal.vy);
        if (animal.y > 900) animal.vy = -Math.abs(animal.vy);

        if (animal.x < -200 || animal.x > CONFIG.GAME_WIDTH + 200) {
          animal.active = false;
          gameState.animals.splice(i, 1);
        }
      }

      // Update planted trees
      gameState.plantedTrees.forEach((tree) => {
        if (tree.stage < TREE_STAGES.length - 1) {
          const growthMul = gameState.weather === "rain" ? 1.5 : 1;
          tree.stageTimer += deltaTime * 1000 * growthMul;
          if (tree.stageTimer >= GROWTH_TIMES[tree.stage]) {
            tree.stage++;
            tree.stageTimer = 0;
            gameState.score += 15;
            Audio.play("sfx_tree_grow", 0.8);
          }
        }
      });

      // CONTROLLED SPAWNING - More frequent
      if (Math.random() < 0.7) Spawner.trySpawnObstacle();
      if (Math.random() < 0.6) Spawner.trySpawnSeed();
      if (Math.random() < 0.4) Spawner.trySpawnPowerup();
      if (Math.random() < 0.5) Spawner.trySpawnAnimal();

      if (gameState.biome !== "meadow") {
        gameState.biomeDistance += gameState.speed * deltaTime * 60;
        if (gameState.biomeDistance >= CONFIG.BIOME_DISTANCE * 2) {
          gameState.biome = "meadow";
          gameState.biomeDistance = 0;
        }
      }

      if (
        Math.floor(gameState.distance) % CONFIG.PLANTING_ZONE_INTERVAL < 6 &&
        !gameState.isAtPlantingZone
      ) {
        const hasSeeds = Object.values(gameState.collectedSeeds).some(
          (c) => c > 0
        );
        if (hasSeeds) {
          gameState.isAtPlantingZone = true;
          gameState.currentPlantingZone = { position: gameState.distance };
        }
      } else if (
        Math.floor(gameState.distance) % CONFIG.PLANTING_ZONE_INTERVAL >=
        6
      ) {
        gameState.isAtPlantingZone = false;
        gameState.currentPlantingZone = null;
      }

      UI.updateScore();
      UI.updateMapPosition();
    },

    render: () => {
      const { ctx } = DOM;
      const cw = DOM.canvas.width;
      const ch = DOM.canvas.height;

      ctx.clearRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);

      // PARALLAX BACKGROUND RENDERING
      const bgMap = {
        meadow: "background_meadow",
        forest: "background_forest",
        polluted: "background_polluted",
        riverside: "background_riverside",
      };
      const bgId = bgMap[gameState.biome];

      if (ASSETS.cache[bgId]) {
        gameState.backgroundLayers.forEach((layer, index) => {
          const alpha = 1.0 - index * 0.15;
          ctx.globalAlpha = alpha;

          ctx.drawImage(
            ASSETS.cache[bgId].img,
            -layer.offset,
            0,
            CONFIG.GAME_WIDTH,
            CONFIG.GAME_HEIGHT
          );

          ctx.drawImage(
            ASSETS.cache[bgId].img,
            CONFIG.GAME_WIDTH - layer.offset,
            0,
            CONFIG.GAME_WIDTH,
            CONFIG.GAME_HEIGHT
          );
        });
        ctx.globalAlpha = 1.0;
      } else {
        const biomeColors = {
          meadow: "#BFEED0",
          forest: "#A8D5BA",
          polluted: "#9E9E9E",
          riverside: "#B3E5FC",
        };
        ctx.fillStyle = biomeColors[gameState.biome] || "#BFEED0";
        ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
      }

      // Weather effects with performance optimization
      if (gameState.weather === "rain") {
        ctx.fillStyle = "rgba(129,212,250,0.18)";
        // Reduced particle count for better performance
        for (let i = 0; i < CONFIG.MAX_PARTICLES; i++) {
          const x = Math.random() * CONFIG.GAME_WIDTH;
          const y =
            (Math.random() * CONFIG.GAME_HEIGHT + gameState.distance * 3) %
            CONFIG.GAME_HEIGHT;
          ctx.fillRect(x, y, 2, 18);
        }
      }

      // Render obstacles
      gameState.obstacles.forEach((o) =>
        Utils.drawImage(o.assetId, o.x, o.y, o.width, o.height)
      );

      // Enhanced seed rendering with visual feedback
      gameState.seeds.forEach((s) => {
        ctx.save();

        if (
          gameState.seedCollectionEnabled ||
          gameState.activePowerups.magnet
        ) {
          ctx.globalAlpha = 0.6;
          ctx.fillStyle = "#4CAF50";
        } else {
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = "#FFD700";
        }

        ctx.beginPath();
        ctx.arc(
          s.x + s.width / 2,
          s.y + s.height / 2,
          s.width / 2 + 8,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();

        Utils.drawImage(s.assetId, s.x, s.y, s.width, s.height);
      });

      gameState.powerups.forEach((p) =>
        Utils.drawImage(p.assetId, p.x, p.y, p.width, p.height)
      );

      gameState.animals.forEach((a) =>
        Utils.drawImage(a.assetId, a.x, a.y, a.width, a.height)
      );

      // ANIMATED CHARACTER RENDERING
      let playerAsset = "child_character_running";
      if (player.state === "jumping") {
        playerAsset = "child_character_jumping";
      } else if (player.state === "planting") {
        playerAsset = "child_character_planting";
      }

      let yOffset = 0;
      if (player.state === "running") {
        yOffset = Math.sin(gameState.frameCount * 0.3) * 4;
      }

      Utils.drawImage(
        playerAsset,
        player.x,
        player.y - player.height + yOffset,
        player.width,
        player.height
      );

      // Speed boost visual effect
      if (gameState.speedBoostActive) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(
          player.x + player.width / 2,
          player.y - player.height / 2,
          80,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      }

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.24)";
      ctx.beginPath();
      ctx.ellipse(
        player.x + player.width / 2,
        CONFIG.LANE_Y[player.lane] + player.height * 0.6,
        34,
        10,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Power-up indicators
      let py = 150;
      ctx.font = "bold 18px Poppins, sans-serif";
      if (gameState.activePowerups.magnet) {
        ctx.fillStyle = "rgba(76,175,80,0.9)";
        ctx.fillRect(10, py, 140, 36);
        ctx.fillStyle = "white";
        ctx.fillText("MAGNET", 18, py + 24);
        py += 44;
      }
      if (gameState.activePowerups.shield) {
        ctx.fillStyle = "rgba(79,195,247,0.9)";
        ctx.fillRect(10, py, 140, 36);
        ctx.fillStyle = "white";
        ctx.fillText("SHIELD", 18, py + 24);
        py += 44;
      }
      if (gameState.activePowerups.double) {
        ctx.fillStyle = "rgba(255,215,0,0.95)";
        ctx.fillRect(10, py, 140, 36);
        ctx.fillStyle = "white";
        ctx.fillText("2X POINTS", 18, py + 24);
        py += 44;
      }

      // Speed boost indicator
      if (gameState.speedBoostActive) {
        ctx.fillStyle = "rgba(255,87,34,0.9)";
        ctx.fillRect(10, py, 140, 36);
        ctx.fillStyle = "white";
        ctx.fillText("SPEED BOOST", 18, py + 24);
      }

      // Tutorial hint
      if (gameState.distance < 1000) {
        const nearbySeed = gameState.seeds.find((s) => s.x > 200 && s.x < 500);
        if (nearbySeed && !gameState.seedCollectionEnabled) {
          ctx.fillStyle = "rgba(0,0,0,0.7)";
          ctx.font = "bold 16px Poppins, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(
            "↑ Jump high to collect seeds!",
            CONFIG.GAME_WIDTH / 2,
            180
          );
          ctx.textAlign = "left";
        }

        if (gameState.distance < 800) {
          ctx.fillStyle = "rgba(0,0,0,0.7)";
          ctx.font = "bold 16px Poppins, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("↑ Tap or Swipe Up to Jump", CONFIG.GAME_WIDTH / 2, 200);
          ctx.textAlign = "left";
        }
      }

      // Show current speed (debug info)
      if (window.__SeedSaver && window.__SeedSaver.debugMode) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.font = "bold 14px Poppins, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(
          `Speed: ${Math.floor(gameState.speed * 10)}`,
          CONFIG.GAME_WIDTH - 20,
          40
        );
        ctx.fillText(`FPS: ${gameState.fps}`, CONFIG.GAME_WIDTH - 20, 60);
        ctx.fillText(
          `Objects: ${
            gameState.obstacles.length +
            gameState.seeds.length +
            gameState.powerups.length +
            gameState.animals.length
          }`,
          CONFIG.GAME_WIDTH - 20,
          80
        );
        ctx.textAlign = "left";
      }
    },
  };

  // ===== INPUT HANDLING =====
  const Input = {
    setup: () => {
      let touchStartY = 0;
      let touchStartTime = 0;
      let lastTouchTime = 0;

      const touchZone = document.createElement("div");
      touchZone.id = "gameTouchZone";
      touchZone.setAttribute("aria-label", "Game control area");
      touchZone.setAttribute("role", "button");
      touchZone.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 30%;
        z-index: 10;
        background: transparent;
      `;
      document.body.appendChild(touchZone);

      DOM.canvas.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          touchStartY = e.touches[0].clientY;
          touchStartTime = Date.now();
        },
        { passive: false }
      );

      DOM.canvas.addEventListener(
        "touchmove",
        (e) => {
          e.preventDefault();
          const ty = e.touches[0].clientY;
          const dy = touchStartY - ty;
          if (dy > 40) {
            const isLong = Date.now() - touchStartTime > 150;
            Game.handleJump(isLong);
            touchStartY = ty;
          }
        },
        { passive: false }
      );

      DOM.canvas.addEventListener(
        "touchend",
        (e) => {
          const currentTime = Date.now();
          if (currentTime - lastTouchTime < 250) {
            e.preventDefault();
          }
          lastTouchTime = currentTime;
        },
        { passive: false }
      );

      // Double tap for high jump
      touchZone.addEventListener("touchstart", (e) => {
        const currentTime = Date.now();
        if (currentTime - lastTouchTime < 250) {
          Game.handleJump(true);
        } else {
          Game.handleJump(false);
        }
        lastTouchTime = currentTime;
      });

      DOM.canvas.addEventListener("click", () => Game.handleJump(false));

      document.addEventListener("keydown", (e) => {
        if (e.code === "Space" || e.code === "ArrowUp") {
          e.preventDefault();
          Game.handleJump(e.repeat);
        }
        if (e.code === "ArrowDown") {
          e.preventDefault();
          if (player.isJumping) {
            player.velocityY = 500;
          }
        }
        if (e.code === "Escape") {
          isPaused = !isPaused;
          if (isPaused) {
            SaveSystem.save();
            UI.showNotification(
              "Game Paused",
              "Press ESC or click pause to resume",
              "#1976D2",
              "linear-gradient(90deg,#ffffff,#E3F2FD)"
            );
          }
        }
      });

      if (DOM.plantStationBtn) {
        DOM.plantStationBtn.addEventListener("click", () => {
          navigateToPlantStation();
        });
      }

      if (DOM.pauseBtn) {
        DOM.pauseBtn.addEventListener("click", () => {
          isPaused = !isPaused;
          if (isPaused) {
            SaveSystem.save();
            UI.showNotification(
              "Game Paused",
              "Click pause button to resume",
              "#1976D2",
              "linear-gradient(90deg,#ffffff,#E3F2FD)"
            );
          }
        });
      }

      if (DOM.backdrop) {
        DOM.backdrop.addEventListener("click", () => {
          document
            .querySelectorAll(".popup, .panel")
            .forEach((n) => n.remove());
          UI.hideBackdrop();
          isRunning = true;
        });
      }

      // Enhanced audio initialization
      const initAudioOnUserGesture = () => {
        console.log("User gesture detected, initializing audio...");
        if (!audioContext) {
          try {
            audioContext = ensureAudioContext();
            if (audioContext && audioContext.state === "suspended") {
              audioContext
                .resume()
                .then(() => {
                  console.log("AudioContext resumed after user gesture");
                  startBackgroundMusic();
                })
                .catch((e) => {
                  console.warn("Failed to resume AudioContext:", e);
                });
            } else if (audioContext) {
              startBackgroundMusic();
            }
          } catch (e) {
            console.warn("Failed to initialize audio:", e);
          }
        } else if (audioContext.state === "suspended") {
          audioContext.resume().then(startBackgroundMusic).catch(console.warn);
        } else {
          startBackgroundMusic();
        }

        audioInitialized = true;

        // Hide audio button if it exists
        if (audioStartButton) {
          audioStartButton.style.display = "none";
        }
      };

      // Start background music function
      function startBackgroundMusic() {
        if (ASSETS.audioCache["background_music_nature"] && audioContext) {
          if (backgroundMusic) {
            Audio.stopMusic(backgroundMusic);
          }
          backgroundMusic = Audio.playMusic("background_music_nature", 0.25);
          if (backgroundMusic) {
            console.log("Background music started");
          }
        } else {
          console.warn(
            "Cannot start background music: audio not loaded or context not available"
          );
        }
      }

      // Add multiple user gesture listeners
      const userGestureEvents = [
        "click",
        "touchstart",
        "keydown",
        "pointerdown",
      ];
      userGestureEvents.forEach((event) => {
        window.addEventListener(event, initAudioOnUserGesture, { once: true });
      });

      // Also add to canvas and document for broader coverage
      DOM.canvas.addEventListener("click", initAudioOnUserGesture, {
        once: true,
      });
      document.addEventListener("click", initAudioOnUserGesture, {
        once: true,
      });

      // Create audio start button as fallback
      createAudioStartButton();
    },
  };

  // Create audio start button
  function createAudioStartButton() {
    // Remove existing button if any
    const existingBtn = document.getElementById("audioStartBtn");
    if (existingBtn) existingBtn.remove();

    audioStartButton = document.createElement("button");
    audioStartButton.id = "audioStartBtn";
    audioStartButton.setAttribute("aria-label", "Start game audio");
    audioStartButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      padding: 10px 20px;
      background: linear-gradient(45deg, #4CAF50, #2E7D32);
      color: white;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-family: 'Poppins', sans-serif;
      font-weight: bold;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
    `;
    audioStartButton.innerHTML = "🔊 START AUDIO";
    audioStartButton.onclick = () => {
      console.log("Audio start button clicked");
      // Ensure audio context directly (no dispatch on the button itself)
      try {
        ensureAudioContext();
        if (audioContext && audioContext.state === "suspended") {
          audioContext
            .resume()
            .then(() => {
              if (ASSETS.audioCache["background_music_nature"]) {
                if (backgroundMusic) Audio.stopMusic(backgroundMusic);
                backgroundMusic = Audio.playMusic(
                  "background_music_nature",
                  0.25
                );
                audioStartButton.style.display = "none";
              }
            })
            .catch(console.warn);
        } else if (audioContext) {
          if (ASSETS.audioCache["background_music_nature"]) {
            if (backgroundMusic) Audio.stopMusic(backgroundMusic);
            backgroundMusic = Audio.playMusic("background_music_nature", 0.25);
            audioStartButton.style.display = "none";
          }
        }
      } catch (e) {
        console.warn("Audio start failed:", e);
      }
    };

    // Add hover effect
    audioStartButton.onmouseover = () => {
      audioStartButton.style.transform = "scale(1.05)";
      audioStartButton.style.boxShadow = "0 6px 16px rgba(0,0,0,0.3)";
    };
    audioStartButton.onmouseout = () => {
      audioStartButton.style.transform = "scale(1)";
      audioStartButton.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
    };

    document.body.appendChild(audioStartButton);

    // Auto-hide after 10 seconds if audio starts
    setTimeout(() => {
      if (backgroundMusic && audioContext && audioContext.state === "running") {
        audioStartButton.style.display = "none";
      }
    }, 10000);
  }

  // ===== CANVAS SCALING =====
  function resizeCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const scale = Math.min(w / CONFIG.GAME_WIDTH, h / CONFIG.GAME_HEIGHT);
    DOM.canvas.width = CONFIG.GAME_WIDTH;
    DOM.canvas.height = CONFIG.GAME_HEIGHT;
    DOM.canvas.style.width = `${CONFIG.GAME_WIDTH * scale}px`;
    DOM.canvas.style.height = `${CONFIG.GAME_HEIGHT * scale}px`;

    if (w < 768) {
      document.body.classList.add("mobile-view");
    } else {
      document.body.classList.remove("mobile-view");
    }
  }

  // ===== GAME LOOP =====
  function gameLoop(now) {
    if (!lastTime) lastTime = now;
    let deltaTime = (now - lastTime) / 1000;

    deltaTime = Math.min(deltaTime, CONFIG.MAX_FRAME_TIME);

    lastTime = now;

    Game.update(deltaTime);
    Game.render();

    rafId = requestAnimationFrame(gameLoop);
  }

  // ===== CLEANUP FUNCTION =====
  function cleanup() {
    console.log("Cleaning up game...");

    // Stop game loop
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    // Stop audio
    if (backgroundMusic) {
      Audio.stopMusic(backgroundMusic);
      backgroundMusic = null;
    }

    // Save game state
    SaveSystem.save();

    // Clean up DOM elements
    const touchZone = document.getElementById("gameTouchZone");
    if (touchZone) touchZone.remove();

    const audioBtn = document.getElementById("audioStartBtn");
    if (audioBtn) audioBtn.remove();

    const notificationContainer = document.getElementById("top-notifications");
    if (notificationContainer) notificationContainer.remove();

    // Clear object pools
    ObjectPool.cleanup();

    // Remove event listeners
    window.removeEventListener("resize", resizeCanvas);
    window.removeEventListener("beforeunload", cleanup);

    console.log("Cleanup complete");
  }

  // ===== Start the game =====
  async function startGame() {
    try {
      if (DOM.loadingScreen) DOM.loadingScreen.classList.add("hidden");

      // Initialize object pooling
      ObjectPool.init();

      Input.setup();
      UI.hidePlantStation();

      isRunning = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(gameLoop);

      // Initial spawns
      for (let i = 1; i < 4; i++) {
        Spawner.obstacle(
          "rock",
          CONFIG.GAME_WIDTH + i * 250,
          Math.floor(Math.random() * 3)
        );
      }
      for (let i = 0; i < 3; i++) {
        const types = Object.keys(SEED_DATA);
        Spawner.seed(
          types[i % types.length],
          CONFIG.GAME_WIDTH + 200 + i * 350,
          Math.floor(Math.random() * 3)
        );
      }

      // Show welcome message
      setTimeout(() => {
        UI.showNotification(
          "Welcome to Seed Saver!",
          "Jump to collect seeds, avoid obstacles!",
          "#2E7D32",
          "linear-gradient(90deg,#ffffff,#f0fff4)",
          "🌱"
        );
      }, 1000);
    } catch (err) {
      console.warn("startGame failed:", err);
      if (DOM.loadingScreen) DOM.loadingScreen.classList.add("hidden");
      Input.setup();
      UI.hidePlantStation();
      isRunning = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(gameLoop);
    }
  }

  // ===== INITIALIZATION =====
  async function init() {
    console.log("Initializing Seed Saver game...");

    // Initialize collected seeds for all seed types defined in SEED_DATA
    Object.keys(SEED_DATA).forEach((k) => {
      if (gameState.collectedSeeds[k] === undefined) {
        gameState.collectedSeeds[k] = 0;
      }
    });

    const savedData = SaveSystem.load();
    if (savedData) {
      highScore = savedData.highScore || 0;

      // Update high score display if it exists
      if (DOM.highScoreDisplay) {
        DOM.highScoreDisplay.textContent = `High: ${Math.floor(highScore)}`;
      }

      // Load collected seeds if they exist, but filter out any undefined seed types
      if (savedData.collectedSeeds) {
        // Only keep seed types that are defined in SEED_DATA
        Object.keys(savedData.collectedSeeds).forEach((k) => {
          if (SEED_DATA[k]) {
            gameState.collectedSeeds[k] = savedData.collectedSeeds[k];
          } else {
            console.warn(`Removing unknown seed type from saved data: ${k}`);
            // Convert unknown seeds to a known type or discard
            // For now, we'll convert unknown seeds to oak seeds
            gameState.collectedSeeds.oak =
              (gameState.collectedSeeds.oak || 0) + savedData.collectedSeeds[k];
          }
        });
      }

      // Load score and distance
      if (savedData.score) gameState.score = savedData.score;
      if (savedData.distance) gameState.distance = savedData.distance;

      console.log("Loaded saved game data:", savedData);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("beforeunload", cleanup);

    // Add cleanup on page hide
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        SaveSystem.save();
      }
    });

    console.log("Starting asset preloading...");
    await preloadAssets();

    // Log audio loading success
    console.log(
      "Audio loading complete. background_music_nature loaded:",
      ASSETS.audioCache["background_music_nature"] ? "YES ✓" : "NO ✗"
    );

    // Initialize seed inventory structure
    UI.initSeedInventory();

    // Update seed inventory with loaded seeds
    UI.updateSeedInventory();

    console.log("Game initialization complete, starting in 80ms...");
    setTimeout(() => {
      startGame();
    }, 80);
  }

  // ===== DEBUG INTERFACE =====
  window.__SeedSaver = {
    gameState,
    player,
    assets: ASSETS,
    config: CONFIG,
    audioContext,
    debugMode: false,

    restart: () => {
      cleanup();
      location.reload();
    },

    startAudio: () => {
      if (ASSETS.audioCache["background_music_nature"]) {
        if (backgroundMusic) Audio.stopMusic(backgroundMusic);
        backgroundMusic = Audio.playMusic("background_music_nature", 0.25);
      }
    },

    stopAudio: () => {
      if (backgroundMusic) {
        Audio.stopMusic(backgroundMusic);
        backgroundMusic = null;
      }
    },

    // Add navigation function to debug interface
    goToPlantStation: navigateToPlantStation,

    // Add function to add seeds for testing
    addSeeds: (type, count = 1) => {
      if (SEED_DATA[type]) {
        gameState.collectedSeeds[type] =
          (gameState.collectedSeeds[type] || 0) + count;
        UI.updateSeedInventory();
        UI.showPlantStation();
        console.log(`Added ${count} ${type} seeds`);
        return true;
      }
      console.warn(`Unknown seed type: ${type}`);
      return false;
    },

    // Toggle debug mode
    toggleDebug: () => {
      window.__SeedSaver.debugMode = !window.__SeedSaver.debugMode;
      console.log(`Debug mode: ${window.__SeedSaver.debugMode ? "ON" : "OFF"}`);
    },

    // Clear save data
    clearSave: () => {
      SaveSystem.clear();
      console.log("Save data cleared");
    },

    // Get performance stats
    getStats: () => {
      return {
        fps: gameState.fps,
        objects: {
          obstacles: gameState.obstacles.length,
          seeds: gameState.seeds.length,
          powerups: gameState.powerups.length,
          animals: gameState.animals.length,
          trees: gameState.plantedTrees.length,
        },
        memory: {
          notifications: activeNotifications.length,
          objectPools: {
            obstacles: objectPools.obstacles.filter((o) => o.active).length,
            seeds: objectPools.seeds.filter((s) => s.active).length,
            powerups: objectPools.powerups.filter((p) => p.active).length,
            animals: objectPools.animals.filter((a) => a.active).length,
          },
        },
      };
    },
  };

  // ===== START APPLICATION =====
  init().catch((err) => {
    console.error("Failed to initialize game:", err);
    UI.showNotification(
      "Initialization Error",
      "Please refresh the page and try again",
      "#D32F2F",
      "linear-gradient(90deg,#FFEBEE,#FFCDD2)",
      "⚠️"
    );

    // Show error in console
    console.error("Game initialization failed:", err);
  });
})();
