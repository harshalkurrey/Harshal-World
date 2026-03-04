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
    experienceLevel: 'beginner',
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

// ===== DARK MODE SYSTEM =====
const darkMode = {
    STORAGE_KEY: 'harshalWorldDarkMode',
    
    init: () => {
        const isDark = localStorage.getItem(darkMode.STORAGE_KEY) === 'true';
        if (isDark) {
            darkMode.enable();
        }
        
        const themeSwitcher = document.getElementById('themeSwitcher');
        if (themeSwitcher) {
            themeSwitcher.addEventListener('click', darkMode.toggle);
        }
    },
    
    enable: () => {
        document.body.classList.add('dark-mode');
        localStorage.setItem(darkMode.STORAGE_KEY, 'true');
        const circle = document.querySelector('.toggle-circle');
        if (circle) circle.textContent = '🌙';
    },
    
    disable: () => {
        document.body.classList.remove('dark-mode');
        localStorage.setItem(darkMode.STORAGE_KEY, 'false');
        const circle = document.querySelector('.toggle-circle');
        if (circle) circle.textContent = '☀️';
    },
    
    toggle: () => {
        if (document.body.classList.contains('dark-mode')) {
            darkMode.disable();
        } else {
            darkMode.enable();
        }
    }
};

// ===== PARTICLE BACKGROUND SYSTEM =====
let particles = [];

const particleBackground = {
    canvas: null,
    ctx: null,
    particleCount: 80,
    particleSize: 2,
    particleOpacity: 0.6,
    particleSpeed: 0.5,
    connectionDistance: 100,
    
    init: () => {
        particleBackground.canvas = document.getElementById('bgCanvas');
        if (!particleBackground.canvas) return;
        
        particleBackground.ctx = particleBackground.canvas.getContext('2d');
        particleBackground.resizeCanvas();
        particleBackground.createParticles();
        particleBackground.animate();
        
        window.addEventListener('resize', particleBackground.resizeCanvas);
        document.addEventListener('mousemove', particleBackground.handleMouseMove);
    },
    
    resizeCanvas: () => {
        particleBackground.canvas.width = window.innerWidth;
        particleBackground.canvas.height = window.innerHeight;
        
        if (window.innerWidth <= 768) {
            particleBackground.particleCount = 40;
        } else if (window.innerWidth <= 1024) {
            particleBackground.particleCount = 60;
        } else {
            particleBackground.particleCount = 80;
        }
    },
    
    createParticles: () => {
        particles = [];
        for (let i = 0; i < particleBackground.particleCount; i++) {
            particles.push({
                x: Math.random() * particleBackground.canvas.width,
                y: Math.random() * particleBackground.canvas.height,
                vx: (Math.random() - 0.5) * particleBackground.particleSpeed,
                vy: (Math.random() - 0.5) * particleBackground.particleSpeed,
                size: Math.random() * 3 + 1,
                originalX: 0,
                originalY: 0
            });
        }
    },
    
    drawParticles: () => {
        const isDark = document.body.classList.contains('dark-mode');
        const particleColor = isDark ? 'rgba(167, 139, 250, 0.7)' : 'rgba(124, 58, 237, 0.5)';
        
        particleBackground.ctx.fillStyle = particleColor;
        
        particles.forEach(particle => {
            particleBackground.ctx.beginPath();
            particleBackground.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            particleBackground.ctx.fill();
        });
    },
    
    drawConnections: () => {
        const isDark = document.body.classList.contains('dark-mode');
        const lineColor = isDark ? 'rgba(167, 139, 250, 0.2)' : 'rgba(124, 58, 237, 0.2)';
        
        particleBackground.ctx.strokeStyle = lineColor;
        particleBackground.ctx.lineWidth = 1;
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < particleBackground.connectionDistance) {
                    particleBackground.ctx.beginPath();
                    particleBackground.ctx.moveTo(particles[i].x, particles[i].y);
                    particleBackground.ctx.lineTo(particles[j].x, particles[j].y);
                    particleBackground.ctx.stroke();
                }
            }
        }
    },
    
    updateParticles: () => {
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0) particle.x = particleBackground.canvas.width;
            if (particle.x > particleBackground.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = particleBackground.canvas.height;
            if (particle.y > particleBackground.canvas.height) particle.y = 0;
        });
    },
    
    handleMouseMove: (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        particles.forEach(particle => {
            const dx = particle.x - mouseX;
            const dy = particle.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const angle = Math.atan2(dy, dx);
                const force = (100 - distance) / 100;
                particle.vx += Math.cos(angle) * force * 2;
                particle.vy += Math.sin(angle) * force * 2;
            }
        });
    },
    
    animate: () => {
        const isDark = document.body.classList.contains('dark-mode');
        const bgColor = isDark ? '#0A0A0F' : '#FFFFFF';
        
        particleBackground.ctx.fillStyle = bgColor;
        particleBackground.ctx.fillRect(0, 0, particleBackground.canvas.width, particleBackground.canvas.height);
        
        particleBackground.updateParticles();
        particleBackground.drawConnections();
        particleBackground.drawParticles();
        
        requestAnimationFrame(particleBackground.animate);
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
    screens.showScreen('experienceScreen');
    setupExperienceScreen();
};

// ===== EXPERIENCE SELECTION SCREEN =====
const setupExperienceScreen = () => {
    const experienceCards = document.querySelectorAll('.experience-card');
    let selectedExperience = 'beginner';
    
    experienceCards.forEach(card => {
        card.addEventListener('click', () => {
            experienceCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedExperience = card.dataset.experience;
            soundEffects.buttonClick();
        });
    });
    
    // Auto-select beginner on load
    if (experienceCards.length > 0) {
        experienceCards[0].classList.add('selected');
    }
    
    // Auto-progress after 3 seconds
    setTimeout(() => {
        proceedToHub(selectedExperience);
    }, 2500);
};

const proceedToHub = (experience) => {
    gameState.experienceLevel = experience;
    storage.save();
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

// ===== TUTORIAL SYSTEM =====
const tutorialSystem = {
    STORAGE_PREFIX: 'tutorial_seen_',
    
    hasSeen: (gameName) => {
        return localStorage.getItem(tutorialSystem.STORAGE_PREFIX + gameName) === 'true';
    },
    
    markSeen: (gameName) => {
        localStorage.setItem(tutorialSystem.STORAGE_PREFIX + gameName, 'true');
    },
    
    show: (gameName, character, message) => {
        // Only show for beginners who haven't seen it
        if (gameState.experienceLevel !== 'beginner' || tutorialSystem.hasSeen(gameName)) {
            return;
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'tutorial-overlay';
        overlay.innerHTML = `
            <div class="tutorial-content">
                <div class="tutorial-emoji">${character}</div>
                <div class="tutorial-text">${message}</div>
                <div class="tutorial-buttons">
                    <button class="btn-primary" onclick="tutorialSystem.closeTutorial(this)">GOT IT! LET'S GO!</button>
                    <button class="btn-secondary" onclick="tutorialSystem.closeTutorial(this)">Skip Tutorial</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        tutorialSystem.markSeen(gameName);
        
        return overlay;
    },
    
    closeTutorial: (button) => {
        const overlay = button.closest('.tutorial-overlay');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => overlay.remove(), 300);
        }
    }
};

// ===== MOBILE CONTROLS SYSTEM =====
const mobileControls = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    
    create: (buttons) => {
        const existing = document.getElementById('mobileControls');
        if (existing) existing.remove();
        
        const container = document.createElement('div');
        container.id = 'mobileControls';
        
        buttons.forEach(btn => {
            if (btn.type === 'button') {
                const button = document.createElement('button');
                button.className = `mobile-btn ${btn.class || ''}`;
                button.textContent = btn.text;
                button.addEventListener('touchstart', btn.handler, { passive: true });
                button.addEventListener('mousedown', btn.handler);
                button.addEventListener('touchend', () => {
                    button.style.opacity = '1';
                });
                button.addEventListener('mouseup', () => {
                    button.style.opacity = '1';
                });
                container.appendChild(button);
            } else if (btn.type === 'dpad') {
                const dpadContainer = document.createElement('div');
                dpadContainer.id = 'dpadContainer';
                
                const directions = [
                    { text: '⬆️', class: 'up', handler: btn.handlers.up },
                    { text: '⬅️', class: 'left', handler: btn.handlers.left },
                    { text: '⬇️', class: 'empty', handler: () => {} },
                    { text: '➡️', class: 'right', handler: btn.handlers.right },
                    { text: '⬇️', class: 'down', handler: btn.handlers.down }
                ];
                
                directions.forEach(dir => {
                    const btn = document.createElement('button');
                    btn.className = `mobile-btn dpad-btn ${dir.class}`;
                    if (dir.class === 'empty') {
                        btn.className = 'dpad-empty';
                    }
                    btn.textContent = dir.text;
                    btn.addEventListener('touchstart', dir.handler, { passive: true });
                    btn.addEventListener('mousedown', dir.handler);
                    dpadContainer.appendChild(btn);
                });
                
                container.appendChild(dpadContainer);
            }
        });
        
        document.body.appendChild(container);
    },
    
    remove: () => {
        const container = document.getElementById('mobileControls');
        if (container) container.remove();
    }
};

// ===== CONFETTI & ANIMATION SYSTEM =====
const animations = {
    confetti: [],
    scorePopups: [],
    
    createConfetti: (x, y) => {
        // Create 30-50 confetti pieces
        const count = Math.random() * 20 + 30;
        for (let i = 0; i < count; i++) {
            animations.confetti.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: Math.random() * -10,
                gravity: 0.2,
                friction: 0.98,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 8 + 4,
                color: ['#7C3AED', '#A78BFA', '#10B981', '#FFD700', '#EF4444'][Math.floor(Math.random() * 5)],
                life: 1,
                decay: Math.random() * 0.01 + 0.005
            });
        }
    },
    
    createScorePopup: (x, y, points, color = '#10B981') => {
        animations.scorePopups.push({
            x: x,
            y: y,
            text: `+${points}`,
            color: color,
            life: 1,
            decay: 0.02,
            size: 24,
            vy: -3 // Float upward
        });
    },
    
    updateAndDraw: (ctx, canvas) => {
        // Update and draw confetti
        animations.confetti = animations.confetti.filter(c => {
            c.x += c.vx;
            c.y += c.vy;
            c.vy += c.gravity;
            c.vx *= c.friction;
            c.rotation += c.rotationSpeed;
            c.life -= c.decay;
            
            if (c.life > 0) {
                // Draw confetti piece
                ctx.save();
                ctx.globalAlpha = c.life;
                ctx.translate(c.x, c.y);
                ctx.rotate(c.rotation);
                ctx.fillStyle = c.color;
                ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
                ctx.restore();
                return true;
            }
            return false;
        });
        
        // Update and draw score popups
        animations.scorePopups = animations.scorePopups.filter(p => {
            p.y += p.vy;
            p.life -= p.decay;
            
            if (p.life > 0) {
                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.font = `bold ${Math.round(p.size * p.life)}px Orbitron`;
                ctx.textAlign = 'center';
                ctx.fillText(p.text, p.x, p.y);
                ctx.restore();
                return true;
            }
            return false;
        });
    }
};

// Convenience functions for game code
const createConfetti = (x = null, y = null) => {
    const canvas = document.getElementById('gameCanvas');
    animations.createConfetti(x || canvas.width / 2, y || canvas.height / 2);
};

const createScorePopup = (x, y, points, color) => {
    animations.createScorePopup(x, y, points, color);
};


// ===== ON-SCREEN HUD DISPLAY SYSTEM =====
const hudDisplay = {
    // Draw on-screen game controls and difficulty indicator
    drawControls: (ctx, canvas, game, score, isMobile) => {
        // Draw semi-transparent glassmorphism background panel
        const panelWidth = isMobile ? Math.min(canvas.width - 20, 300) : 400;
        const panelHeight = 70;
        const panelX = 10;
        const panelY = 10;
        
        // Glassmorphism effect - semi-transparent backdrop with blur effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Border for glassmorphism
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Control text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Orbitron';
        ctx.textAlign = 'left';
        
        let controlText = '';
        switch(game) {
            case 'spaceShooter':
                controlText = 'SPACE ▶ Fire  |  ◀ ▶ Move';
                break;
            case 'flappyBird':
                controlText = isMobile ? 'TAP to Flap' : 'SPACE to Flap';
                break;
            case 'asteroidDodge':
                controlText = 'Arrow Keys • Move in all directions';
                break;
            case 'whackMole':
                controlText = isMobile ? 'TAP the Moles' : 'CLICK the Moles';
                break;
            default:
                controlText = 'Ready to play!';
        }
        
        ctx.fillText(controlText, panelX + 15, panelY + 25);
        
        // Draw difficulty level indicator
        const difficulty = difficultyProgression.getDifficultyLevel(score);
        ctx.font = 'bold 12px Orbitron';
        ctx.fillStyle = 'rgba(124, 58, 237, 0.8)';
        ctx.fillText(`Difficulty: ${difficulty}`, panelX + 15, panelY + 50);
    },
    
    // Get difficulty label for display
    getDifficultyLabel: (score) => {
        return difficultyProgression.getDifficultyLevel(score);
    }
};

// ===== DIFFICULTY PROGRESSION SYSTEM =====
const difficultyProgression = {
    // Get difficulty level and parameters based on score
    getDifficultyLevel: (score) => {
        if (score >= 150) return 'INSANE';
        if (score >= 100) return 'EXPERT';
        if (score >= 50) return 'HARD';
        return 'EASY';
    },
    
    // Get difficulty multiplier (for scaling enemies, speed, etc.)
    getDifficultyMultiplier: (score) => {
        if (score >= 150) return 1.8;
        if (score >= 100) return 1.5;
        if (score >= 50) return 1.2;
        return 1.0;
    },
    
    // Space Shooter: Get enemy spawn parameters
    getSpaceShooterDifficulty: (score) => {
        if (score >= 150) return { enemySpawnRate: 0.02, maxEnemies: 8, enemySpeed: 3.5 };
        if (score >= 100) return { enemySpawnRate: 0.018, maxEnemies: 6, enemySpeed: 3 };
        if (score >= 50) return { enemySpawnRate: 0.015, maxEnemies: 4, enemySpeed: 2.5 };
        return { enemySpawnRate: 0.01, maxEnemies: 2, enemySpeed: 2 };
    },
    
    // Flappy Bird: Get pipe parameters
    getFlappyBirdDifficulty: (score) => {
        if (score >= 150) return { gapSize: 120, pipeSpeed: 4 };
        if (score >= 100) return { gapSize: 130, pipeSpeed: 3.5 };
        if (score >= 50) return { gapSize: 140, pipeSpeed: 3 };
        return { gapSize: 150, pipeSpeed: 2.5 };
    },
    
    // Asteroid Dodge: Get asteroid parameters
    getAsteroidDifficulty: (score) => {
        if (score >= 150) return { spawnRate: 0.05, maxAsteroids: 12, asteroidSpeed: 4 };
        if (score >= 100) return { spawnRate: 0.04, maxAsteroids: 8, asteroidSpeed: 3.2 };
        if (score >= 50) return { spawnRate: 0.03, maxAsteroids: 5, asteroidSpeed: 2.5 };
        return { spawnRate: 0.02, maxAsteroids: 3, asteroidSpeed: 1.8 };
    },
    
    // Whack a Mole: Get mole parameters
    getWhackAMoleDifficulty: (score) => {
        if (score >= 150) return { baseInterval: 400, moleVisibleTime: 600, speedMultiplier: 2.5 };
        if (score >= 100) return { baseInterval: 600, moleVisibleTime: 700, speedMultiplier: 2.0 };
        if (score >= 50) return { baseInterval: 900, moleVisibleTime: 800, speedMultiplier: 1.5 };
        // EASY: Reduced initial speed (doubled from 1200 to 2400 for beginner friendliness)
        return { baseInterval: 2400, moleVisibleTime: 1200, speedMultiplier: 1.0 };
    }
};

const startSpaceShooter = () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 80;
    
    // Show tutorial for beginners on first play
    tutorialSystem.show('spaceShooter', '🚀', 
        'Welcome to Space Shooter!<br><br>' +
        'Use LEFT/RIGHT arrow keys to move your ship.<br>' +
        'Press SPACE to fire at the aliens.<br>' +
        'Avoid their fire and survive as long as you can!');
    
    // Detect mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isPortrait = window.innerHeight > window.innerWidth;
    
    spaceShooterState = {
        score: 0,
        lives: 3,
        gameRunning: true,
        playerX: canvas.width / 2 - 20,
        enemies: [],
        bullets: [],
        difficulty: 'medium',
        power: 0,
        combo: 0,
        spawnDifficulty: 1,
        maxEnemiesSpawned: 0,
        lastPowerUpScore: 0,
        megaBulletReady: false
    };
    
    soundEffects.gameStart();
    let gameTime = 0;
    
    // Mobile button states
    let mobileLeftPressed = false;
    let mobileRightPressed = false;
    
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') {
            spaceShooterState.playerX -= 20;
            spaceShooterState.playerX = Math.max(0, Math.min(canvas.width - 40, spaceShooterState.playerX));
        }
        if (e.key === 'ArrowRight') {
            spaceShooterState.playerX += 20;
            spaceShooterState.playerX = Math.max(0, Math.min(canvas.width - 40, spaceShooterState.playerX));
        }
        if (e.key === ' ') {
            e.preventDefault();
            const isMega = spaceShooterState.megaBulletReady;
            spaceShooterState.bullets.push({
                x: spaceShooterState.playerX + 15,
                y: canvas.height - 50,
                isMega: isMega
            });
            if (isMega) {
                spaceShooterState.megaBulletReady = false;
                soundEffects.play(800, 0.2, 'square');
            }
        }
    };
    
    // Mobile button handlers
    const handleMobileLeft = () => {
        spaceShooterState.playerX -= 20;
        spaceShooterState.playerX = Math.max(0, Math.min(canvas.width - 40, spaceShooterState.playerX));
    };
    
    const handleMobileRight = () => {
        spaceShooterState.playerX += 20;
        spaceShooterState.playerX = Math.max(0, Math.min(canvas.width - 40, spaceShooterState.playerX));
    };
    
    const handleMobileShoot = () => {
        const isMega = spaceShooterState.megaBulletReady;
        spaceShooterState.bullets.push({
            x: spaceShooterState.playerX + 15,
            y: canvas.height - 50,
            isMega: isMega
        });
        if (isMega) {
            spaceShooterState.megaBulletReady = false;
            soundEffects.play(800, 0.2, 'square');
        } else {
            soundEffects.scorePoint();
        }
    };
    
    // Create mobile controls if on mobile
    if (isMobile) {
        mobileControls.create([
            { type: 'button', text: '⬅️ LEFT', class: 'left', handler: handleMobileLeft },
            { type: 'button', text: '🔫 FIRE', class: 'fire center', handler: handleMobileShoot },
            { type: 'button', text: 'RIGHT ➡️', class: 'right', handler: handleMobileRight }
        ]);
    }
    
    keyController.set(handleKeyDown);
    
    const spawn = () => {
        // Use difficulty progression system
        const difficulty = difficultyProgression.getSpaceShooterDifficulty(spaceShooterState.score);
        
        // Spawn enemies based on difficulty and max enemies limit
        if (spaceShooterState.enemies.length < difficulty.maxEnemies && Math.random() < difficulty.enemySpawnRate) {
            spaceShooterState.enemies.push({
                x: Math.random() * (canvas.width - 40),
                y: -40,
                health: 1,
                speed: difficulty.enemySpeed
            });
            spaceShooterState.maxEnemiesSpawned++;
        }
    };
    
    const gameLoop = () => {
        if (!spaceShooterState.gameRunning) {
            keyController.clear();
            mobileControls.remove();
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
            if (b.isMega) {
                // Draw modern mega bullet with gradient and glow
                const gradient = ctx.createLinearGradient(b.x, b.y, b.x, b.y + 20);
                gradient.addColorStop(0, '#FFD700');
                gradient.addColorStop(0.5, '#FFA500');
                gradient.addColorStop(1, '#FF6B35');
                
                // Outer glow effect
                ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.beginPath();
                ctx.arc(b.x + 6, b.y + 10, 12, 0, Math.PI * 2);
                ctx.fill();
                
                // Main bullet body with rounded corners
                ctx.fillStyle = gradient;
                ctx.fillRect(b.x - 2, b.y, 16, 20);
                
                // Highlight
                ctx.fillStyle = '#FFFF99';
                ctx.fillRect(b.x + 2, b.y + 2, 6, 5);
                
                // Bottom flame effect
                ctx.fillStyle = 'rgba(255, 107, 53, 0.6)';
                ctx.beginPath();
                ctx.moveTo(b.x + 6, b.y + 20);
                ctx.lineTo(b.x + 2, b.y + 26);
                ctx.lineTo(b.x + 10, b.y + 26);
                ctx.closePath();
                ctx.fill();
            } else {
                // Regular bullet
                ctx.fillStyle = '#10B981';
                ctx.fillRect(b.x, b.y, 4, 10);
            }
        });
        
        // Spawn enemies
        spawn();
        
        // Move enemies
        spaceShooterState.enemies.forEach(e => {
            e.y += e.speed || 2; // Use difficulty-based speed, fallback to 2
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
            const bulletWidth = b.isMega ? 16 : 4;
            const bulletHeight = b.isMega ? 20 : 10;
            const bulletX = b.isMega ? b.x - 2 : b.x;
            
            spaceShooterState.enemies.forEach((e, ei) => {
                if (bulletX < e.x + 40 && bulletX + bulletWidth > e.x &&
                    b.y < e.y + 40 && b.y + bulletHeight > e.y) {
                    spaceShooterState.score += b.isMega ? 20 : 10;
                    spaceShooterState.combo++;
                    if (spaceShooterState.combo % 10 === 0) soundEffects.comboPoint();
                    else soundEffects.scorePoint();
                    
                    // Add score popup at enemy location
                    const popupColor = b.isMega ? '#FFD700' : '#10B981';
                    const popupScore = b.isMega ? 20 : 10;
                    createScorePopup(e.x + 20, e.y + 20, popupScore, popupColor);
                    
                    // Mega bullets penetrate 2 enemies
                    if (!b.isMega) {
                        spaceShooterState.bullets.splice(bi, 1);
                    }
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
        
        // Draw On-Screen HUD Controls and Difficulty (all players)
        hudDisplay.drawControls(ctx, canvas, 'spaceShooter', spaceShooterState.score, isMobile);
        
        // Draw animations (confetti, score popups)
        animations.updateAndDraw(ctx, canvas);
        
        // Check for power-up every 50 points
        const scoreThreshold = Math.floor(spaceShooterState.score / 50) * 50;
        if (scoreThreshold > spaceShooterState.lastPowerUpScore && scoreThreshold > 0) {
            spaceShooterState.lastPowerUpScore = scoreThreshold;
            spaceShooterState.megaBulletReady = true;
            soundEffects.play(523, 0.1);
            setTimeout(() => soundEffects.play(659, 0.15), 50);
        }
        
        // Draw power-up indicator if mega bullet is ready
        if (spaceShooterState.megaBulletReady) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⚡ MEGA BULLET READY ⚡', canvas.width / 2, 40);
            
            // Animated indicator
            const pulse = Math.sin(gameTime * 0.1) * 0.5 + 0.5;
            ctx.strokeStyle = `rgba(255, 215, 0, ${pulse})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(20, 50, canvas.width - 40, 30);
        }
        
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
    
    // Show tutorial for beginners on first play
    tutorialSystem.show('flappyBird', '🐦', 
        'Welcome to Flappy Bird!<br><br>' +
        'Click or tap to make the bird flap and fly upward.<br>' +
        'Avoid hitting the pipes (green obstacles).<br>' +
        'How far can you go?');
    
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
        gapSize: 150,
        difficulty: 1
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
    
    const generatePipe = () => {
        // Use difficulty progression system
        const diffConfig = difficultyProgression.getFlappyBirdDifficulty(flappyState.score);
        const gapSize = diffConfig.gapSize;
        
        // Generate random gap position with varied heights
        // Add slight randomization to gap size for more interesting patterns
        const gapVariation = Math.random() * 20 - 10; // +/- 10 variation
        const actualGapSize = Math.max(100, gapSize + gapVariation); // Min gap 100px
        
        const minGapY = 50;
        const maxGapY = canvas.height - actualGapSize - 100;
        const gapPosition = Math.random() * (maxGapY - minGapY) + minGapY;
        
        // Make gap height vary between high and low positions more dramatically
        // This prevents predictable patterns
        let finalGapY = gapPosition;
        if (Math.random() < 0.3) {
            // 30% chance of high gap (bird has to duck)
            finalGapY = minGapY + Math.random() * 60;
        } else if (Math.random() < 0.3) {
            // 30% chance of low gap (bird has to climb)
            finalGapY = canvas.height - actualGapSize - 100 - Math.random() * 60;
        }
        
        flappyState.pipes.push({
            x: canvas.width,
            gapY: finalGapY,
            scored: false,
            gapSize: actualGapSize,
            speed: diffConfig.pipeSpeed
        });
    };
    
    const gameLoop = () => {
        if (!flappyState.gameRunning) {
            document.removeEventListener('keypress', handleSpaceKey);
            canvas.removeEventListener('click', handleFlap);
            keyController.clear();
            mobileControls.remove();
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
        
        // Generate pipes with slight variation in spawn rate
        pipeCounter++;
        let spawnInterval = 120 - Math.floor(flappyState.score / 10) * 5; // Gets faster with score
        spawnInterval = Math.max(90, spawnInterval); // Min interval
        
        if (pipeCounter > spawnInterval) {
            generatePipe();
            pipeCounter = 0;
        }
        
        // Move and draw pipes
        flappyState.pipes.forEach((pipe, i) => {
            pipe.x -= (pipe.speed || 2.5); // Use difficulty-based speed
            const pipeGapSize = pipe.gapSize || flappyState.gapSize;
            
            // Top pipe
            ctx.fillStyle = '#10B981';
            ctx.fillRect(pipe.x, 0, 60, pipe.gapY);
            
            // Bottom pipe
            ctx.fillRect(pipe.x, pipe.gapY + pipeGapSize, 60, canvas.height);
            
            // Scoring
            if (!pipe.scored && pipe.x < flappyState.birdX) {
                pipe.scored = true;
                flappyState.score += 10;
                soundEffects.scorePoint();
                createScorePopup(canvas.width / 2, canvas.height / 2, 10, '#FFD700');
            }
            
            // Collision
            if (flappyState.birdX + 15 > pipe.x && flappyState.birdX - 15 < pipe.x + 60) {
                if (flappyState.birdY - 15 < pipe.gapY || flappyState.birdY + 15 > pipe.gapY + pipeGapSize) {
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
        
        // Draw On-Screen HUD Controls & Difficulty
        hudDisplay.drawControls(ctx, canvas, 'flappyBird', flappyState.score, false);
        
        // Draw animations (confetti, score popups)
        animations.updateAndDraw(ctx, canvas);
        
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
    
    // Show tutorial for beginners on first play
    tutorialSystem.show('asteroidDodge', '🪨', 
        'Welcome to Asteroid Dodge!<br><br>' +
        'Use arrow keys to move your ship in all directions.<br>' +
        'Avoid the falling asteroids.<br>' +
        'Survive longer to increase your score!');
    
    asteroidState = {
        score: 0,
        lives: 3,
        gameRunning: true,
        playerX: canvas.width / 2,
        playerY: canvas.height / 2,
        asteroids: [],
        startTime: Date.now(),
        difficulty: 1,
        previousScore: 0
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
    
    // Mobile D-pad controls for Asteroid Dodge
    if (mobileControls.isMobile) {
        const speed = 5;
        mobileControls.create([
            {
                type: 'dpad',
                handlers: {
                    up: () => asteroidState.playerY = Math.max(0, asteroidState.playerY - speed),
                    down: () => asteroidState.playerY = Math.min(canvas.height - 30, asteroidState.playerY + speed),
                    left: () => asteroidState.playerX = Math.max(0, asteroidState.playerX - speed),
                    right: () => asteroidState.playerX = Math.min(canvas.width - 30, asteroidState.playerX + speed)
                }
            }
        ]);
    }
    
    let spawnCounter = 0;
    
    const gameLoop = () => {
        if (!asteroidState.gameRunning) {
            keyController.clear();
            mobileControls.remove();
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
        const diffConfig = difficultyProgression.getAsteroidDifficulty(asteroidState.score);
        spawnCounter++;
        const spawnInterval = Math.max(30, 100 - (diffConfig.spawnRate * 1000));
        
        if (spawnCounter > spawnInterval && asteroidState.asteroids.length < diffConfig.maxAsteroids) {
            asteroidState.asteroids.push({
                x: Math.random() * canvas.width,
                y: Math.random() < 0.5 ? -40 : canvas.height + 40,
                vx: (Math.random() - 0.5) * (diffConfig.asteroidSpeed / 2),
                vy: Math.random() * (diffConfig.asteroidSpeed / 2) + (diffConfig.asteroidSpeed / 4),
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
        
        // Create score popup when score increases
        if (asteroidState.score > asteroidState.previousScore) {
            createScorePopup(asteroidState.playerX + 15, asteroidState.playerY - 20, asteroidState.score - asteroidState.previousScore, '#3B82F6');
            asteroidState.previousScore = asteroidState.score;
        }
        
        // Draw On-Screen HUD Controls & Difficulty
        hudDisplay.drawControls(ctx, canvas, 'asteroidDodge', asteroidState.score, false);
        
        // Draw animations (confetti, score popups)
        animations.updateAndDraw(ctx, canvas);
        
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
    
    // Show tutorial for beginners on first play
    tutorialSystem.show('whackMole', '🔨', 
        'Welcome to Whack a Mole!<br><br>' +
        'Click on the moles when they pop up.<br>' +
        'Be quick - they disappear fast!<br>' +
        'Smash as many as you can in 60 seconds!');
    
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
        moleY: 0,
        moleTimer: 0,
        moleVisibilityTime: 0,
        moleSizeMultiplier: 1
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
    let moleDuration = 0;
    
    const getMoleSize = () => {
        // Use difficulty progression system for size
        const diffConfig = difficultyProgression.getWhackAMoleDifficulty(moleState.score);
        const baseSize = 16;
        return Math.round(baseSize * diffConfig.speedMultiplier);
    };
    
    const getMoleVisibilityTime = () => {
        // Use difficulty progression system for visibility time
        const diffConfig = difficultyProgression.getWhackAMoleDifficulty(moleState.score);
        return Math.round(diffConfig.moleVisibleTime);
    };
    
    const getMoleSpawnSpeed = () => {
        // Use difficulty progression system for spawn speed
        const diffConfig = difficultyProgression.getWhackAMoleDifficulty(moleState.score);
        return diffConfig.speedMultiplier * 0.8; // Scale down to reasonable animation speed
    };
    
    canvas.onclick = (e) => {
        if (!moleState.gameRunning) return;
        
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        if (moleState.activeMole !== -1) {
            const hole = moleState.holes[moleState.activeMole];
            const moleRadius = getMoleSize();
            
            // Check collision with animated mole
            const moleCenterX = hole.x + hole.size / 2;
            const moleCenterY = hole.y + moleState.moleY + hole.size / 2;
            
            const distX = clickX - moleCenterX;
            const distY = clickY - moleCenterY;
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            if (distance < moleRadius) {
                moleState.score += 10;
                soundEffects.scorePoint();
                createScorePopup(moleCenterX, moleCenterY, 10, '#22C55E');
                moleState.activeMole = -1;
                moleState.moleY = 0;
                moleDuration = 0;
                moleTimer = 0;
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
            mobileControls.remove();
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
        
        // Mole visibility management
        if (moleState.activeMole !== -1) {
            moleDuration++;
            const visibilityTime = getMoleVisibilityTime();
            const riseSpeed = getMoleSpawnSpeed();
            
            // Animate mole rise from hole
            if (moleDuration < visibilityTime / 2) {
                // Mole rising up - smooth animation
                moleState.moleY = Math.min(-40, -40 + (moleDuration / (visibilityTime / 2)) * 40 * riseSpeed);
            } else if (moleDuration < visibilityTime) {
                // Mole fully out and visible
                moleState.moleY = 0;
            } else {
                // Time's up - hide mole
                moleState.activeMole = -1;
                moleState.moleY = 0;
                moleDuration = 0;
                moleTimer = 0;
            }
        }
        
        // Spawn new mole
        if (moleState.activeMole === -1) {
            moleTimer++;
            
            // Use difficulty progression system for spawn interval
            const diffConfig = difficultyProgression.getWhackAMoleDifficulty(moleState.score);
            const spawnInterval = Math.round(diffConfig.baseInterval / 16.67); // Convert ms to frames (assuming 60fps)
            
            if (moleTimer > spawnInterval) {
                moleState.activeMole = Math.floor(Math.random() * moleState.holes.length);
                moleState.moleY = -40; // Start below hole
                moleTimer = 0;
                moleDuration = 0;
            }
        }
        
        // Draw mole
        if (moleState.activeMole !== -1) {
            const hole = moleState.holes[moleState.activeMole];
            const moleRadius = getMoleSize();
            
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.arc(hole.x + hole.size / 2, hole.y + moleState.moleY + hole.size / 2, moleRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes (scale with size)
            ctx.fillStyle = '#000';
            const eyeSize = moleRadius * 0.5;
            ctx.fillRect(hole.x + hole.size / 2 - moleRadius / 3, hole.y + moleState.moleY + hole.size / 2 - eyeSize / 2, eyeSize, eyeSize);
            ctx.fillRect(hole.x + hole.size / 2 + moleRadius / 3 - eyeSize, hole.y + moleState.moleY + hole.size / 2 - eyeSize / 2, eyeSize, eyeSize);
        }
        
        // Draw UI
        ctx.fillStyle = '#7C3AED';
        ctx.font = 'bold 40px Orbitron';
        ctx.fillText(`Score: ${moleState.score}`, 20, 50);
        ctx.font = 'bold 40px Orbitron';
        ctx.fillText(`Time: ${moleState.timeLeft}s`, canvas.width - 250, 50);
        
        // Draw difficulty indicator
        ctx.font = 'bold 16px Orbitron';
        ctx.fillStyle = '#FFD700';
        let diffText = 'Size: Small';
        if (moleState.score >= 100) diffText = 'Size: Large (Extreme!)';
        else if (moleState.score >= 60) diffText = 'Size: Medium (Hard)';
        else if (moleState.score >= 30) diffText = 'Size: Medium';
        ctx.fillText(diffText, 20, 80);
        
        // Draw On-Screen HUD Controls (for reference)
        hudDisplay.drawControls(ctx, canvas, 'whackMole', moleState.score, false);
        
        // Draw animations (confetti, score popups)
        animations.updateAndDraw(ctx, canvas);
        
        updateGameUI(moleState.score, moleState.lives);
        animationId = requestAnimationFrame(gameLoop);
    };
    
    animationId = requestAnimationFrame(gameLoop);
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    storage.load();
    darkMode.init();
    particleBackground.init();
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
