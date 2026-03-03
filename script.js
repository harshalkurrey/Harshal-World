// ============================================
// HARSHAL WORLD - COMPLETE GAME HUB
// Production-Grade Arcade Game Portal
// ============================================

// ===== CONSTANTS =====
const STORAGE_KEY = 'harshalWorldState';

// ===== STATE MANAGEMENT =====
const gameState = {
    playerName: '',
    playerAvatar: '🧙‍♂️',
    soundEnabled: true,
    masterVolume: 0.7,
    currentGame: null,
    allScores: {
        spaceShooter: 0,
        flappyBird: 0,
        asteroidDodge: 0,
        whackMole: 0
    },
    gamesPlayed: 0,
    totalXP: 0,
    isPaused: false
};

// ===== ANIMATION FRAME MANAGEMENT =====
let animationId = null;

// ===== KEYBOARD EVENT CONTROLLER =====
const keyController = {
    handler: null,
    set(fn) {
        if (this.handler) {
            document.removeEventListener('keydown', this.handler);
            document.removeEventListener('keypress', this.handler);
        }
        this.handler = fn;
        document.addEventListener('keydown', fn);
    },
    setKeypress(fn) {
        if (this.handler) {
            document.removeEventListener('keypress', this.handler);
        }
        this.handler = fn;
        document.addEventListener('keypress', fn);
    },
    clear() {
        if (this.handler) {
            document.removeEventListener('keydown', this.handler);
            document.removeEventListener('keypress', this.handler);
            this.handler = null;
        }
    }
};

// ===== AUDIO SYSTEM =====
let audioContext = null;

const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
};

const soundEffects = {
    play: (frequency = 440, duration = 0.1, type = 'sine') => {
        if (!gameState.soundEnabled) return;
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = frequency;
        osc.type = type;
        gain.gain.setValueAtTime(gameState.masterVolume * 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    },
    
    buttonClick: () => soundEffects.play(600, 0.1),
    gameStart: () => {
        soundEffects.play(523, 0.15);
        setTimeout(() => soundEffects.play(659, 0.15), 100);
        setTimeout(() => soundEffects.play(784, 0.2), 200);
    },
    scorePoint: () => soundEffects.play(800, 0.05),
    gameOver: () => {
        soundEffects.play(400, 0.3);
        setTimeout(() => soundEffects.play(300, 0.3), 150);
    },
    levelUp: () => {
        soundEffects.play(784, 0.1);
        setTimeout(() => soundEffects.play(988, 0.2), 100);
    },
    comboPoint: () => soundEffects.play(1047, 0.05)
};

// ===== LOCAL STORAGE =====
const storage = {
    save: () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    },
    load: () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            Object.assign(gameState, JSON.parse(saved));
        }
    },
    clear: () => {
        gameState.allScores = { spaceShooter: 0, flappyBird: 0, asteroidDodge: 0, whackMole: 0 };
        gameState.gamesPlayed = 0;
        gameState.totalXP = 0;
        localStorage.removeItem(STORAGE_KEY);
        storage.save();
    }
};

// ===== SCREEN NAVIGATION =====
const screens = {
    showScreen: (screenId) => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    },
    
    showLoading: () => screens.showScreen('loadingScreen'),
    showName: () => screens.showScreen('nameEntryScreen'),
    showHub: () => screens.showScreen('gameHubScreen'),
    showGame: () => screens.showScreen('gameScreen'),
    showGameOver: () => screens.showScreen('gameOverScreen')
};

// ===== LOADING SCREEN =====
const loadingQuotes = [
    "Loading awesomeness...",
    "Calibrating fun levels...",
    "Warning: Too much fun ahead!",
    "Harshal's World is booting up...",
    "Please don't blink..."
];

let quoteIndex = 0;
let progressValue = 0;

const startLoading = () => {
    const progressBar = document.getElementById('progressBar');
    const quoteEl = document.getElementById('loadingQuote');
    
    progressValue = 0;
    quoteIndex = 0;

    const quoteInterval = setInterval(() => {
        quoteEl.textContent = loadingQuotes[quoteIndex];
        quoteIndex = (quoteIndex + 1) % loadingQuotes.length;
    }, 500);

    const progressInterval = setInterval(() => {
        progressValue += Math.random() * 6 + 2;
        if (progressValue > 100) progressValue = 100;
        progressBar.style.width = progressValue + '%';
        
        if (progressValue >= 100) {
            clearInterval(progressInterval);
            clearInterval(quoteInterval);
            setTimeout(() => {
                screens.showName();
                setupNameScreen();
            }, 500);
        }
    }, 80);
};

// ===== NAME ENTRY SCREEN =====
let selectedAvatar = '🧙‍♂️';

const setupNameScreen = () => {
    const avatarBtns = document.querySelectorAll('.avatar-btn');
    const nameInput = document.getElementById('playerName');
    const startBtn = document.getElementById('playBtn');
    
    avatarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            avatarBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedAvatar = btn.dataset.avatar;
        });
    });
    
    startBtn.addEventListener('click', startGame);
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startGame();
    });
};

const startGame = () => {
    const nameInput = document.getElementById('playerName');
    if (nameInput.value.trim() === '') {
        alert('Please enter your name!');
        return;
    }
    
    gameState.playerName = nameInput.value.trim();
    gameState.playerAvatar = selectedAvatar;
    storage.save();
    
    soundEffects.gameStart();
    screens.showHub();
    setupHubScreen();
};

// ===== HUB SCREEN =====
const setupHubScreen = () => {
    updateHubDisplay();
    setupGameCards();
    setupSettingsPanel();
};

const updateHubDisplay = () => {
    document.getElementById('playerGreeting').textContent = 
        `Welcome, ${gameState.playerAvatar} ${gameState.playerName}!`;
    
    const level = calculateLevel();
    document.getElementById('bestScoreDisplay').textContent = 
        Math.max(...Object.values(gameState.allScores));
    document.getElementById('xpDisplay').textContent = 
        `${gameState.totalXP} XP • ${level}`;
    
    document.getElementById('gamesPlayed').textContent = gameState.gamesPlayed;
    document.getElementById('totalXP').textContent = gameState.totalXP;
    document.getElementById('currentLevel').textContent = level;
    
    // Update game best scores
    document.getElementById('spaceshooterBest').textContent = gameState.allScores.spaceShooter;
    document.getElementById('flappybirdBest').textContent = gameState.allScores.flappyBird;
    document.getElementById('asteroidBest').textContent = gameState.allScores.asteroidDodge;
    document.getElementById('molebestBest').textContent = gameState.allScores.whackMole;
    
    updateLeaderboard();
};

const calculateLevel = () => {
    if (gameState.totalXP >= 1000) return 'Legend';
    if (gameState.totalXP >= 501) return 'Pro';
    if (gameState.totalXP >= 101) return 'Player';
    return 'Rookie';
};

const updateLeaderboard = () => {
    const scores = Object.entries(gameState.allScores)
        .map(([game, score]) => ({ game, score }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    
    const leaderboard = document.getElementById('leaderboard');
    if (scores.length === 0) {
        leaderboard.innerHTML = '<p>No scores yet. Play your first game!</p>';
    } else {
        leaderboard.innerHTML = scores
            .map((item, i) => `<p>${i + 1}. ${item.score} - ${item.game}</p>`)
            .join('');
    }
};

const setupGameCards = () => {
    document.querySelectorAll('.game-card:not(.locked)').forEach(card => {
        const playBtn = card.querySelector('.btn-play');
        if (!playBtn) return;
        const gameType = card.dataset.game;
        
        playBtn.addEventListener('click', () => {
            soundEffects.buttonClick();
            startGameSession(gameType);
        });
        
        card.addEventListener('mouseenter', () => {
            soundEffects.scorePoint();
        });
    });
    
    document.querySelectorAll('.game-card.locked').forEach(card => {
        const btn = card.querySelector('button');
        if (btn) {
            btn.addEventListener('click', () => {
                soundEffects.play(200, 0.2);
            });
        }
    });
};

// ===== GAME SESSION MANAGEMENT =====
const startGameSession = (gameType) => {
    // Cancel previous animation loops and clear keyboard handlers
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    keyController.clear();
    
    gameState.currentGame = gameType;
    gameState.isPaused = false;
    screens.showGame();
    setupGameScreen();
    
    if (gameType === 'spaceShooter') startSpaceShooter();
    else if (gameType === 'flappyBird') startFlappyBird();
    else if (gameType === 'asteroidDodge') startAsteroidDodge();
    else if (gameType === 'whackMole') startWhackMole();
};

const setupGameScreen = () => {
    const pauseBtn = document.getElementById('pauseBtn');
    const pauseMenu = document.getElementById('pauseMenu');
    
    // Remove old listeners by cloning
    const newPauseBtn = pauseBtn.cloneNode(true);
    pauseBtn.parentNode.replaceChild(newPauseBtn, pauseBtn);
    
    newPauseBtn.addEventListener('click', togglePause);
    
    // Click on pause menu to resume
    pauseMenu.addEventListener('click', (e) => {
        if (e.target === pauseMenu) togglePause();
    });
    
    // P key to pause
    const handlePause = (e) => {
        if (e.key.toLowerCase() === 'p') {
            e.preventDefault();
            togglePause();
        }
    };
    document.addEventListener('keydown', handlePause);
    
    // Update with default values
    updateGameUI(0, 3);
};

const updateGameUI = (score, lives) => {
    document.getElementById('gameScore').textContent = score;
    document.getElementById('lives').textContent = '❤️'.repeat(Math.max(0, lives));
};

const togglePause = () => {
    gameState.isPaused = !gameState.isPaused;
    document.getElementById('pauseMenu').style.display = gameState.isPaused ? 'flex' : 'none';
};

const endGame = (finalScore) => {
    gameState.gamesPlayed++;
    const xpEarned = finalScore;
    gameState.totalXP += xpEarned;
    gameState.allScores[gameState.currentGame] = Math.max(
        gameState.allScores[gameState.currentGame],
        finalScore
    );
    
    storage.save();
    
    const level = calculateLevel();
    const messages = {
        0: 'Bhai practice karo thoda 💀',
        100: 'Not bad! But Harshal can do better 😏',
        500: 'Now we\'re talking! 🔥',
        1000: 'LEGEND! Are you even human? 👑'
    };
    
    let message = messages[0];
    if (finalScore >= 1000) message = messages[1000];
    else if (finalScore >= 500) message = messages[500];
    else if (finalScore >= 100) message = messages[100];
    
    const gameOverScreen = document.getElementById('gameOverScreen');
    const finalScoreEl = document.getElementById('finalScore');
    const scoreMessageEl = document.getElementById('scoreMessage');
    const xpEarnedEl = document.getElementById('xpEarned');
    
    finalScoreEl.textContent = `Final Score: ${finalScore}`;
    scoreMessageEl.textContent = message;
    xpEarnedEl.textContent = xpEarned;
    
    if (finalScore === gameState.allScores[gameState.currentGame]) {
        soundEffects.levelUp();
        createConfetti();
    } else {
        soundEffects.gameOver();
    }
    
    setTimeout(() => {
        screens.showGame();
        document.getElementById('gameOverScreen').style.display = 'flex';
        setupGameOverScreen();
    }, 500);
};

const setupGameOverScreen = () => {
    const oldPlay = document.getElementById('playAgainBtn');
    const oldBack = document.getElementById('backToHubBtn');
    
    const newPlay = oldPlay.cloneNode(true);
    const newBack = oldBack.cloneNode(true);
    
    oldPlay.parentNode.replaceChild(newPlay, oldPlay);
    oldBack.parentNode.replaceChild(newBack, oldBack);
    
    newPlay.addEventListener('click', () => {
        soundEffects.buttonClick();
        document.getElementById('gameOverScreen').style.display = 'none';
        startGameSession(gameState.currentGame);
    });
    
    newBack.addEventListener('click', () => {
        soundEffects.buttonClick();
        document.getElementById('gameOverScreen').style.display = 'none';
        screens.showHub();
        setupHubScreen();
    });
};

const createConfetti = () => {
    const confettiEl = document.getElementById('confetti');
    confettiEl.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.style.position = 'absolute';
        piece.style.width = '10px';
        piece.style.height = '10px';
        piece.style.backgroundColor = ['#7C3AED', '#A78BFA', '#10B981'][Math.floor(Math.random() * 3)];
        piece.style.left = Math.random() * 100 + '%';
        piece.style.top = '-10px';
        piece.style.borderRadius = '50%';
        piece.style.pointerEvents = 'none';
        piece.style.animation = `fall ${2 + Math.random() * 2}s linear forwards`;
        confettiEl.appendChild(piece);
    }
};

// ===== SETTINGS PANEL =====
const setupSettingsPanel = () => {
    const settingsBtn = document.getElementById('settingsBtn');
    const closeBtn = document.getElementById('closeSettings');
    const settingsPanel = document.getElementById('settingsPanel');
    const soundToggleSetting = document.getElementById('soundToggleSetting');
    const volumeSlider = document.getElementById('volumeSlider');
    const changeName = document.getElementById('changeName');
    const resetBtn = document.getElementById('resetScoresBtn');
    const updateNameBtn = document.getElementById('updateNameBtn');
    
    settingsBtn.addEventListener('click', () => {
        soundEffects.buttonClick();
        settingsPanel.style.display = 'block';
        changeName.value = gameState.playerName;
        soundToggleSetting.textContent = gameState.soundEnabled ? 'ON' : 'OFF';
        volumeSlider.value = gameState.masterVolume * 100;
    });
    
    closeBtn.addEventListener('click', () => {
        settingsPanel.style.display = 'none';
    });
    
    soundToggleSetting.addEventListener('click', () => {
        gameState.soundEnabled = !gameState.soundEnabled;
        soundToggleSetting.textContent = gameState.soundEnabled ? 'ON' : 'OFF';
        storage.save();
    });
    
    volumeSlider.addEventListener('input', (e) => {
        gameState.masterVolume = e.target.value / 100;
        storage.save();
    });
    
    updateNameBtn.addEventListener('click', () => {
        if (changeName.value.trim()) {
            gameState.playerName = changeName.value.trim();
            storage.save();
            updateHubDisplay();
            settingsPanel.style.display = 'none';
        }
    });
    
    changeName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') updateNameBtn.click();
    });
    
    document.querySelectorAll('.avatar-btn-small').forEach(btn => {
        btn.addEventListener('click', () => {
            gameState.playerAvatar = btn.dataset.avatar;
            storage.save();
            updateHubDisplay();
        });
    });
    
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure? This will delete all your scores!')) {
            storage.clear();
            updateHubDisplay();
            alert('All scores reset!');
        }
    });
    
    document.getElementById('soundToggle').addEventListener('click', () => {
        gameState.soundEnabled = !gameState.soundEnabled;
        document.getElementById('soundToggle').textContent = gameState.soundEnabled ? '🔊' : '🔇';
        storage.save();
    });
};

// ===== GAME 1: SPACE SHOOTER =====
let spaceShooterState = {
    score: 0,
    lives: 3,
    gameRunning: true,
    playerX: 0,
    enemies: [],
    bullets: [],
    difficulty: 'medium'
};

const startSpaceShooter = () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 80;
    
    spaceShooterState = {
        score: 0,
        lives: 3,
        gameRunning: true,
        playerX: canvas.width / 2 - 20,
        enemies: [],
        bullets: [],
        difficulty: 'medium',
        power: 0,
        combo: 0
    };
    
    soundEffects.gameStart();
    let gameTime = 0;
    
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') spaceShooterState.playerX -= 20;
        if (e.key === 'ArrowRight') spaceShooterState.playerX += 20;
        if (e.key === ' ') {
            e.preventDefault();
            spaceShooterState.bullets.push({
                x: spaceShooterState.playerX + 15,
                y: canvas.height - 50
            });
        }
    };
    
    keyController.set(handleKeyDown);
    
    const spawn = () => {
        if (Math.random() > 0.7) {
            spaceShooterState.enemies.push({
                x: Math.random() * (canvas.width - 40),
                y: -40,
                health: 1
            });
        }
    };
    
    const gameLoop = () => {
        if (!spaceShooterState.gameRunning) {
            keyController.clear();
            return;
        }
        
        if (gameState.isPaused) {
            animationId = requestAnimationFrame(gameLoop);
            return;
        }
        
        // Clear
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Stars
        ctx.fillStyle = '#E5E7EB';
        for (let i = 0; i < 20; i++) {
            ctx.fillRect(Math.sin(gameTime + i) * canvas.width, i * 40, 2, 2);
        }
        
        // Draw player
        ctx.fillStyle = '#7C3AED';
        ctx.fillRect(spaceShooterState.playerX, canvas.height - 50, 40, 30);
        ctx.fillStyle = '#A78BFA';
        ctx.fillRect(spaceShooterState.playerX + 8, canvas.height - 55, 8, 8);
        ctx.fillRect(spaceShooterState.playerX + 24, canvas.height - 55, 8, 8);
        
        // Move bullets
        spaceShooterState.bullets = spaceShooterState.bullets.filter(b => b.y > 0);
        spaceShooterState.bullets.forEach(b => {
            b.y -= 5;
            ctx.fillStyle = '#10B981';
            ctx.fillRect(b.x, b.y, 4, 10);
        });
        
        // Spawn enemies
        if (Math.random() > 0.85) spawn();
        
        // Move enemies
        spaceShooterState.enemies.forEach(e => {
            e.y += 2;
        });
        
        // Draw enemies
        spaceShooterState.enemies.forEach(e => {
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(e.x, e.y, 40, 40);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(e.x + 10, e.y + 10, 8, 8);
            ctx.fillRect(e.x + 22, e.y + 10, 8, 8);
        });
        
        // Collision detection
        spaceShooterState.bullets.forEach((b, bi) => {
            spaceShooterState.enemies.forEach((e, ei) => {
                if (b.x < e.x + 40 && b.x + 4 > e.x &&
                    b.y < e.y + 40 && b.y + 10 > e.y) {
                    spaceShooterState.score += 10;
                    spaceShooterState.combo++;
                    if (spaceShooterState.combo % 10 === 0) soundEffects.comboPoint();
                    else soundEffects.scorePoint();
                    spaceShooterState.bullets.splice(bi, 1);
                    spaceShooterState.enemies.splice(ei, 1);
                }
            });
        });
        
        // Check enemy hits
        spaceShooterState.enemies = spaceShooterState.enemies.filter(e => {
            if (e.y > canvas.height) {
                spaceShooterState.lives--;
                if (spaceShooterState.lives <= 0) {
                    spaceShooterState.gameRunning = false;
                    endGame(spaceShooterState.score);
                }
                return false;
            }
            return true;
        });
        
        updateGameUI(spaceShooterState.score, spaceShooterState.lives);
        gameTime++;
        animationId = requestAnimationFrame(gameLoop);
    };
    
    animationId = requestAnimationFrame(gameLoop);
};

// ===== GAME 2: FLAPPY BIRD =====
let flappyState = {
    birdY: 300,
    birdVY: 0,
    score: 0,
    lives: 3,
    gameRunning: true,
    pipes: [],
    gravity: 0.5,
    flapPower: -10
};

const startFlappyBird = () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 80;
    
    flappyState = {
        birdY: canvas.height / 2,
        birdVY: 0,
        birdX: 100,
        score: 0,
        lives: 3,
        gameRunning: true,
        pipes: [],
        gravity: 0.5,
        flapPower: -10,
        pipeSpacing: 120,
        gapSize: 150
    };
    
    soundEffects.gameStart();
    
    const handleFlap = () => {
        flappyState.birdVY = flappyState.flapPower;
        soundEffects.scorePoint();
    };
    
    const handleSpaceKey = (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            handleFlap();
        }
    };
    
    document.addEventListener('keypress', handleSpaceKey);
    canvas.addEventListener('click', handleFlap);
    
    let pipeCounter = 0;
    
    const gameLoop = () => {
        if (!flappyState.gameRunning) {
            document.removeEventListener('keypress', handleSpaceKey);
            canvas.removeEventListener('click', handleFlap);
            keyController.clear();
            return;
        }
        
        if (gameState.isPaused) {
            animationId = requestAnimationFrame(gameLoop);
            return;
        }
        
        // Clear
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Physics
        flappyState.birdVY += flappyState.gravity;
        flappyState.birdY += flappyState.birdVY;
        
        // Draw bird
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(flappyState.birdX, flappyState.birdY, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(flappyState.birdX + 5, flappyState.birdY - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Generate pipes
        pipeCounter++;
        if (pipeCounter > 120) {
            const gapPosition = Math.random() * (canvas.height - flappyState.gapSize - 100) + 50;
            flappyState.pipes.push({
                x: canvas.width,
                gapY: gapPosition,
                scored: false
            });
            pipeCounter = 0;
        }
        
        // Move and draw pipes
        flappyState.pipes.forEach((pipe, i) => {
            pipe.x -= 4;
            
            // Top pipe
            ctx.fillStyle = '#10B981';
            ctx.fillRect(pipe.x, 0, 60, pipe.gapY);
            
            // Bottom pipe
            ctx.fillRect(pipe.x, pipe.gapY + flappyState.gapSize, 60, canvas.height);
            
            // Scoring
            if (!pipe.scored && pipe.x < flappyState.birdX) {
                pipe.scored = true;
                flappyState.score += 10;
                soundEffects.scorePoint();
            }
            
            // Collision
            if (flappyState.birdX + 15 > pipe.x && flappyState.birdX - 15 < pipe.x + 60) {
                if (flappyState.birdY - 15 < pipe.gapY || flappyState.birdY + 15 > pipe.gapY + flappyState.gapSize) {
                    flappyState.lives--;
                    if (flappyState.lives <= 0) {
                        flappyState.gameRunning = false;
                        endGame(flappyState.score);
                    }
                    flappyState.pipes.splice(i, 1);
                }
            }
        });
        
        // Remove off-screen pipes
        flappyState.pipes = flappyState.pipes.filter(p => p.x > -60);
        
        // Ground collision
        if (flappyState.birdY + 15 > canvas.height) {
            flappyState.gameRunning = false;
            endGame(flappyState.score);
        }
        
        updateGameUI(flappyState.score, flappyState.lives);
        animationId = requestAnimationFrame(gameLoop);
    };
    
    animationId = requestAnimationFrame(gameLoop);
};

// ===== GAME 3: ASTEROID DODGE =====
let asteroidState = {
    score: 0,
    lives: 3,
    gameRunning: true,
    playerX: 0,
    playerY: 0,
    asteroids: [],
    startTime: Date.now()
};

const startAsteroidDodge = () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 80;
    
    asteroidState = {
        score: 0,
        lives: 3,
        gameRunning: true,
        playerX: canvas.width / 2,
        playerY: canvas.height / 2,
        asteroids: [],
        startTime: Date.now(),
        difficulty: 1
    };
    
    soundEffects.gameStart();
    
    const handleKeyDown = (e) => {
        const speed = 5;
        if (e.key === 'ArrowLeft') asteroidState.playerX = Math.max(0, asteroidState.playerX - speed);
        if (e.key === 'ArrowRight') asteroidState.playerX = Math.min(canvas.width - 30, asteroidState.playerX + speed);
        if (e.key === 'ArrowUp') asteroidState.playerY = Math.max(0, asteroidState.playerY - speed);
        if (e.key === 'ArrowDown') asteroidState.playerY = Math.min(canvas.height - 30, asteroidState.playerY + speed);
    };
    
    keyController.set(handleKeyDown);
    
    let spawnCounter = 0;
    
    const gameLoop = () => {
        if (!asteroidState.gameRunning) {
            keyController.clear();
            return;
        }
        
        if (gameState.isPaused) {
            animationId = requestAnimationFrame(gameLoop);
            return;
        }
        
        // Clear
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw stars
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 50; i++) {
            const x = (Math.sin(i + asteroidState.score / 100) * canvas.width);
            const y = (Math.cos(i + asteroidState.score / 100) * canvas.height);
            ctx.fillRect(Math.abs(x) % canvas.width, Math.abs(y) % canvas.height, 2, 2);
        }
        
        // Draw player
        ctx.fillStyle = '#7C3AED';
        ctx.fillRect(asteroidState.playerX, asteroidState.playerY, 30, 30);
        
        // Spawn asteroids
        spawnCounter++;
        if (spawnCounter > Math.max(60 - asteroidState.difficulty * 5, 30)) {
            asteroidState.asteroids.push({
                x: Math.random() * canvas.width,
                y: Math.random() < 0.5 ? -40 : canvas.height + 40,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 2,
                size: Math.random() * 20 + 15
            });
            spawnCounter = 0;
        }
        
        // Move asteroids
        asteroidState.asteroids.forEach(a => {
            a.x += a.vx;
            a.y += a.vy;
        });
        
        // Draw asteroids
        asteroidState.asteroids.forEach(a => {
            ctx.fillStyle = '#A78BFA';
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Collision detection
        asteroidState.asteroids = asteroidState.asteroids.filter(a => {
            if (asteroidState.playerX < a.x + a.size && asteroidState.playerX + 30 > a.x - a.size &&
                asteroidState.playerY < a.y + a.size && asteroidState.playerY + 30 > a.y - a.size) {
                asteroidState.lives--;
                if (asteroidState.lives <= 0) {
                    asteroidState.gameRunning = false;
                    asteroidState.score = Math.floor((Date.now() - asteroidState.startTime) / 1000);
                    endGame(asteroidState.score);
                }
                return false;
            }
            return a.x > -50 && a.x < canvas.width + 50 && a.y > -50 && a.y < canvas.height + 50;
        });
        
        asteroidState.score = Math.floor((Date.now() - asteroidState.startTime) / 1000);
        asteroidState.difficulty = Math.floor(asteroidState.score / 30) + 1;
        
        updateGameUI(asteroidState.score, asteroidState.lives);
        animationId = requestAnimationFrame(gameLoop);
    };
    
    animationId = requestAnimationFrame(gameLoop);
};

// ===== GAME 4: WHACK A MOLE =====
let moleState = {
    score: 0,
    lives: 3,
    gameRunning: true,
    timeLeft: 60,
    activeMole: -1,
    holes: [],
    grid: 3,
    startTime: Date.now()
};

const startWhackMole = () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 80;
    
    const gridSize = 3;
    const holeSize = 60;
    const padding = 40;
    const totalWidth = gridSize * holeSize + (gridSize - 1) * padding;
    const startX = (canvas.width - totalWidth) / 2;
    const startY = (canvas.height - totalWidth) / 2;
    
    moleState = {
        score: 0,
        lives: 3,
        gameRunning: true,
        timeLeft: 60,
        activeMole: -1,
        holes: [],
        grid: gridSize,
        startTime: Date.now(),
        moleOut: false,
        moleY: 0
    };
    
    // Create holes
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            moleState.holes.push({
                x: startX + j * (holeSize + padding),
                y: startY + i * (holeSize + padding),
                size: holeSize,
                id: i * gridSize + j
            });
        }
    }
    
    soundEffects.gameStart();
    
    let moleTimer = 0;
    
    canvas.onclick = (e) => {
        if (!moleState.gameRunning) return;
        
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        if (moleState.activeMole !== -1) {
            const hole = moleState.holes[moleState.activeMole];
            if (clickX > hole.x && clickX < hole.x + hole.size &&
                clickY > hole.y + moleState.moleY && clickY < hole.y + moleState.moleY + hole.size) {
                moleState.score += 10;
                soundEffects.scorePoint();
                moleState.activeMole = -1;
            }
        }
    };
    
    const gameLoop = () => {
        if (!moleState.gameRunning) {
            canvas.onclick = null;
            return;
        }
        
        if (gameState.isPaused) {
            animationId = requestAnimationFrame(gameLoop);
            return;
        }
        
        // Clear
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update time
        moleState.timeLeft = Math.max(0, 60 - Math.floor((Date.now() - moleState.startTime) / 1000));
        
        if (moleState.timeLeft <= 0) {
            moleState.gameRunning = false;
            endGame(moleState.score);
            return;
        }
        
        // Draw holes
        ctx.fillStyle = '#8B4513';
        ctx.font = 'bold 30px Arial';
        moleState.holes.forEach(hole => {
            ctx.beginPath();
            ctx.arc(hole.x + hole.size / 2, hole.y + hole.size / 2, hole.size / 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Spawn mole
        moleTimer++;
        if (moleTimer > 25) {
            moleState.activeMole = Math.floor(Math.random() * moleState.holes.length);
            moleState.moleY = 0;
            moleTimer = 0;
        }
        
        // Draw mole
        if (moleState.activeMole !== -1) {
            const hole = moleState.holes[moleState.activeMole];
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.arc(hole.x + hole.size / 2, hole.y + moleState.moleY + hole.size / 2, hole.size / 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(hole.x + hole.size / 3, hole.y + moleState.moleY + hole.size / 3 - 5, 8, 8);
            ctx.fillRect(hole.x + 2 * hole.size / 3 - 8, hole.y + moleState.moleY + hole.size / 3 - 5, 8, 8);
        }
        
        // Draw UI
        ctx.fillStyle = '#7C3AED';
        ctx.font = 'bold 40px Orbitron';
        ctx.fillText(`Score: ${moleState.score}`, 20, 50);
        ctx.font = 'bold 40px Orbitron';
        ctx.fillText(`Time: ${moleState.timeLeft}s`, canvas.width - 250, 50);
        
        updateGameUI(moleState.score, moleState.lives);
        animationId = requestAnimationFrame(gameLoop);
    };
    
    animationId = requestAnimationFrame(gameLoop);
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    storage.load();
    startLoading();
});

// Handle window resize for canvas
window.addEventListener('resize', () => {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 80;
    }
}); 
