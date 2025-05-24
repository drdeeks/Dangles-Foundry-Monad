// Game constants
const WINDOW_WIDTH = 800;
const WINDOW_HEIGHT = 600;
const GROUND_HEIGHT = 100;
const MARSHMALLOW_SIZE = 50;
const OBSTACLE_SIZE = 40;
const GRAVITY = 1;
const JUMP_STRENGTH = -20;
const INITIAL_GAME_SPEED = 5;
const MAX_GAME_SPEED = 15;
const SPEED_INCREASE_INTERVAL = 10;  // Increase speed every 10 points
const SPEED_INCREASE_AMOUNT = 0.5;   // Increase speed by 0.5 each time
const MIN_OBSTACLE_SPACING = 300;
const MAX_OBSTACLE_SPACING = 600;
const MIN_OBSTACLE_HEIGHT = 40;
const MAX_OBSTACLE_HEIGHT = 120;

// Colors
const WHITE = '#FFFFFF';
const PINK = '#FFC0CB';
const BROWN = '#8B4513';
const BLUE = '#87CEEB';
const BLACK = '#000000';
const TOASTED_COLORS = {
    light: '#FFE4B5',
    medium: '#DEB887',
    dark: '#8B4513'
};
const SAND = '#EDC9AF';
const SKY = '#87CEEB';
const CACTUS_GREEN = '#228B22';
const CACTUS_DARK = '#145214';
const ROCK = '#B0A18F';
const SUN = '#FFD700';

// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = WINDOW_WIDTH;
canvas.height = WINDOW_HEIGHT;

// Overlay and user state
const signInOverlay = document.getElementById('signInOverlay');
const startOverlay = document.getElementById('startOverlay');
let showWelcome = false;
let userEmail = '';
let userDomain = null;

// Monad testnet config for TldParser
const RPC_URL = 'https://testnet-rpc.monad.xyz';
const settings = new NetworkWithRpc('monad', 10143, RPC_URL);
const parser = new TldParser(settings, 'monad');

// Add these constants at the top with other constants
const NFT_CONTRACT_ADDRESS = "0x09Bfa39480b61A3eaF559fE419626e2367b6d4c7";
const NFT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)"
];

function getUserHighScores() {
    const allScores = JSON.parse(localStorage.getItem('highScoresByUser') || '{}');
    return allScores[userEmail] || [];
}

function saveUserHighScores(scores) {
    const allScores = JSON.parse(localStorage.getItem('highScoresByUser') || '{}');
    allScores[userEmail] = scores;
    localStorage.setItem('highScoresByUser', JSON.stringify(allScores));
}

function showSignIn() {
    signInOverlay.classList.remove('hidden');
    startOverlay.classList.add('hidden');
    // Insert only the wallet button
    signInOverlay.innerHTML = '<button id="walletBtn">Connect Wallet</button>';
    const walletBtn = document.getElementById('walletBtn');
    walletBtn.onclick = async function() {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts && accounts.length > 0) {
                    userEmail = accounts[0].toLowerCase();
                    localStorage.setItem('userEmail', userEmail);
                    userDomain = await resolveMonadDomain(userEmail);
                    // Check NFT ownership
                    const hasNFT = await checkNFTOwnership();
                    if (hasNFT) {
                        signInOverlay.classList.add('hidden');
                        startOverlay.classList.remove('hidden');
                    } else {
                        // Show mint option
                        signInOverlay.innerHTML = '<p style="color:white;">You need a Dangles NFT to play.</p><button id="mintBtn">Mint NFT</button>';
                        const mintBtn = document.getElementById('mintBtn');
                        mintBtn.onclick = async function() {
                            await mintNFT();
                            signInOverlay.classList.add('hidden');
                            startOverlay.classList.remove('hidden');
                        };
                    }
                }
            } catch (err) {
                alert('Wallet connection failed.');
            }
        } else {
            alert('No Ethereum wallet found. Please install MetaMask.');
        }
    };
}

function showStart() {
    signInOverlay.classList.add('hidden');
    startOverlay.classList.remove('hidden');
    if (typeof userEmailSpan !== 'undefined') userEmailSpan.textContent = userEmail;
}

// Remove guest, start, and disconnect buttons from the DOM and all related logic
// Only show a single connect wallet button on load
signInOverlay.innerHTML = '<button id="walletBtn">Connect Wallet</button>';
const walletBtnDynamic = document.getElementById('walletBtn');

walletBtnDynamic.onclick = async function() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
                userEmail = accounts[0].toLowerCase();
                localStorage.setItem('userEmail', userEmail);
                userDomain = await resolveMonadDomain(userEmail);
                // Check NFT ownership
                const hasNFT = await checkNFTOwnership();
                if (hasNFT) {
                    // Show main game screen
                    signInOverlay.classList.add('hidden');
                    startOverlay.classList.remove('hidden');
                } else {
                    // Show mint option
                    signInOverlay.innerHTML = '<p style="color:white;">You need a Dangles NFT to play.</p><button id="mintBtn">Mint NFT</button>';
                    document.getElementById('mintBtn').onclick = async function() {
                        await mintNFT();
                        // After mint, show main game
                        signInOverlay.classList.add('hidden');
                        startOverlay.classList.remove('hidden');
                    };
                }
            }
        } catch (err) {
            alert('Wallet connection failed.');
        }
    } else {
        alert('No Ethereum wallet found. Please install MetaMask.');
    }
};

// Ensure ethers is available globally
if (typeof window.ethers === 'undefined') {
    alert('Ethers.js is not loaded. Please check your script includes.');
}

// Fix ethers.js v6+ provider usage in checkNFTOwnership
async function checkNFTOwnership() {
    if (!window.ethereum || typeof window.ethers === 'undefined') {
        console.log("No Ethereum wallet or ethers.js found");
        return false;
    }
    try {
        const provider = new window.ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        const nftContract = new window.ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
        const balance = await nftContract.balanceOf(userAddress);
        return balance > 0;
    } catch (error) {
        console.error("Error checking NFT ownership:", error);
        return false;
    }
}

// Monad domain resolution
async function resolveMonadDomain(address) {
    try {
        // Try .mon
        const monDomains = await parser.getAllUserDomainsFromTld(address, '.mon');
        if (monDomains && monDomains.length > 0) {
            return monDomains[0].domain_name + '.mon';
        }
        // Try .nad
        const nadDomains = await parser.getAllUserDomainsFromTld(address, '.nad');
        if (nadDomains && nadDomains.length > 0) {
            return nadDomains[0].domain_name + '.nad';
        }
    } catch (e) {
        // ignore errors
    }
    return null;
}

// Show overlays on load (reset userDomain)
if (!userEmail) {
    userDomain = null;
    showSignIn();
} else {
    // If wallet address, try to resolve domain
    if (/^0x[a-fA-F0-9]{40}$/.test(userEmail)) {
        resolveMonadDomain(userEmail).then(domain => {
            userDomain = domain;
            showStart();
        });
    } else {
        userDomain = null;
        showStart();
    }
}

// Score tracking
let highScores = getUserHighScores();

// Sound effect system for Dangles' jumps
const jumpingSounds = [
  { display: "HEE-HAW!", full: "*snort* HEE-HAW! *hoof scrape*", soundFile: "donkey_heehaw.mp3" },
  { display: "*FLAP*", full: "*whooosh* *flap* *slap*", soundFile: "flap_slap.mp3" },
  { display: "*THUD*", full: "*THUD* *flop-flop* *SLAP* *jiggle*", soundFile: "thud_flop.mp3" },
  { display: "*grunt*", full: "*uncomfortable shuffle* *low grunt*", soundFile: "low_grunt.mp3" },
  { display: "EEE-HAW!", full: "EEE-HAW! *scramble* *flop-flap-flop* *thud*", soundFile: "eee_haw.mp3" },
  { display: "*bounce*", full: "HEE-HAW! *bounce* *slap-slap* *proud snort*", soundFile: "bounce_slap.mp3" },
  { display: "*WHOOSH*", full: "*determined grunt* *scrape* *whoosh* *pendulous swinging*", soundFile: "whoosh_swing.mp3" },
  { display: "*SPLASH*", full: "*splash* *secondary splash* *confused bray*", soundFile: "double_splash.mp3" },
  { display: "*flapping*", full: "*cautious hee-haw* *gravity-accelerated flapping*", soundFile: "flapping.mp3" },
  { display: "*SLAP*", full: "*shivering bray* *tighter-than-usual flops*", soundFile: "shiver_flop.mp3" }
];

function preloadJumpingSounds() {
  const audioCache = {};
  jumpingSounds.forEach(soundObj => {
    const audio = new Audio(`./sounds/${soundObj.soundFile}`);
    audio.preload = 'auto';
    audioCache[soundObj.soundFile] = audio;
  });
  return audioCache;
}

const gameContext = {
  audioCache: preloadJumpingSounds(),
  jumpCounter: 0
};

function createJumpingSoundEffect(gameContext, x, y) {
  if (!gameContext.jumpCounter) {
    gameContext.jumpCounter = 0;
  }
  gameContext.jumpCounter++;
  const showEveryOtherJump = true;
  if (showEveryOtherJump && gameContext.jumpCounter % 2 !== 0) {
    return;
  }
  const randomSoundObj = jumpingSounds[Math.floor(Math.random() * jumpingSounds.length)];
  // Play audio
  const audio = new Audio(`./sounds/${randomSoundObj.soundFile}`);
  audio.volume = 0.7;
  audio.play().catch(() => {});
  // Create text box
  const textBox = document.createElement('div');
  textBox.className = 'jumping-sound-text';
  textBox.textContent = randomSoundObj.display;
  textBox.dataset.fullSound = randomSoundObj.full;
  Object.assign(textBox.style, {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '8px 12px',
    borderRadius: '10px',
    fontFamily: 'Comic Sans MS, cursive',
    fontSize: '0px',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    zIndex: '1000',
    transition: 'all 0.5s ease-in-out',
    opacity: '0',
    border: '2px solid #d4a965',
    maxWidth: '200px',
    pointerEvents: 'none'
  });
  document.getElementById('game-container').appendChild(textBox);
  const animationSteps = [
    { time: 0, fontSize: '0px', opacity: 0 },
    { time: 100, fontSize: '14px', opacity: 1 },
    { time: 500, fontSize: '24px', opacity: 1 },
    { time: 1200, fontSize: '24px', opacity: 1 },
    { time: 1700, fontSize: '10px', opacity: 0 },
    { time: 2000, remove: true }
  ];
  animationSteps.forEach(step => {
    setTimeout(() => {
      if (step.remove) {
        textBox.remove();
      } else {
        textBox.style.fontSize = step.fontSize;
        textBox.style.opacity = step.opacity;
      }
    }, step.time);
  });
  return textBox;
}

class Donkey {
    constructor() {
        this.reset();
        this.width = 60;
        this.height = 60;
        this.position = { x: this.x, y: this.y };
    }

    reset() {
        this.x = 100;
        this.y = WINDOW_HEIGHT - GROUND_HEIGHT - 60;
        this.velocity = 0;
        this.isJumping = false;
        this.jumpCount = 0;
        this.earAngle = 0;
        this.tailAngle = 0;
        this.position = { x: this.x, y: this.y };
    }

    jump() {
        if (this.jumpCount < 2) {
            this.velocity = JUMP_STRENGTH;
            this.isJumping = true;
            this.jumpCount++;
            // Sound effect at donkey's position (centered above)
            createJumpingSoundEffect(
              gameContext,
              this.x + this.width / 2,
              this.y - this.height / 2
            );
        }
    }

    update() {
        // Apply gravity
        this.velocity += GRAVITY;
        this.y += this.velocity;
        this.position = { x: this.x, y: this.y };

        // Animate ears and tail
        if (this.isJumping || this.velocity !== 0) {
            this.earAngle = Math.sin(Date.now() / 100) * 0.3;
            this.tailAngle = Math.sin(Date.now() / 80) * 0.7;
        } else {
            this.earAngle = 0;
            this.tailAngle = 0;
        }

        // Ground collision
        if (this.y > WINDOW_HEIGHT - GROUND_HEIGHT - 60) {
            this.y = WINDOW_HEIGHT - GROUND_HEIGHT - 60;
            this.velocity = 0;
            this.isJumping = false;
            this.jumpCount = 0;
        }
        this.position = { x: this.x, y: this.y };
    }

    draw() {
        // Draw shadow
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 55, 35, 10, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fill();
        ctx.closePath();

        // Draw body
        ctx.save();
        ctx.translate(this.x, this.y);

        // Body (raggedy, patchy look)
        ctx.beginPath();
        ctx.ellipse(0, 25, 30, 22, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#8B7D6B';
        ctx.fill();
        ctx.closePath();

        // Patches
        ctx.beginPath();
        ctx.ellipse(-10, 30, 7, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#A89B8C';
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.ellipse(12, 18, 5, 3, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#A89B8C';
        ctx.fill();
        ctx.closePath();

        // Head
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#8B7D6B';
        ctx.fill();
        ctx.closePath();

        // Ears (animated)
        ctx.save();
        ctx.rotate(-0.5 + this.earAngle);
        ctx.beginPath();
        ctx.ellipse(-10, -18, 5, 16, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#A89B8C';
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        ctx.save();
        ctx.rotate(0.5 - this.earAngle);
        ctx.beginPath();
        ctx.ellipse(10, -18, 5, 16, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#A89B8C';
        ctx.fill();
        ctx.closePath();
        ctx.restore();

        // Eyes
        ctx.beginPath();
        ctx.arc(-5, -2, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#222';
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(5, -2, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#222';
        ctx.fill();
        ctx.closePath();

        // Smile
        ctx.beginPath();
        ctx.arc(0, 4, 6, 0, Math.PI / 2);
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.closePath();

        // Tail (animated)
        ctx.save();
        ctx.rotate(this.tailAngle);
        ctx.beginPath();
        ctx.moveTo(-28, 38);
        ctx.lineTo(-38, 48);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#A89B8C';
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        // Legs
        ctx.beginPath();
        ctx.moveTo(-15, 45);
        ctx.lineTo(-15, 60);
        ctx.moveTo(15, 45);
        ctx.lineTo(15, 60);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#8B7D6B';
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    }
}

class Cactus {
    constructor(x) {
        this.x = x;
        this.width = 30;
        this.height = Math.floor(Math.random() * 60) + 60;
        this.y = WINDOW_HEIGHT - GROUND_HEIGHT - this.height;
    }

    update() {
        this.x -= currentGameSpeed;
    }

    draw() {
        // Main body
        ctx.fillStyle = CACTUS_GREEN;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Arms
        ctx.fillStyle = CACTUS_DARK;
        ctx.fillRect(this.x - 10, this.y + 20, 10, 25);
        ctx.fillRect(this.x + this.width, this.y + 30, 10, 20);
        // Spikes
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x + Math.random() * this.width, this.y + Math.random() * this.height);
            ctx.lineTo(this.x + Math.random() * this.width + 3, this.y + Math.random() * this.height + 3);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();
        }
    }
}

// Game state
let donkey = new Donkey();
let obstacles = [];
let score = 0;
let gameOver = false;
let currentGameSpeed = INITIAL_GAME_SPEED;

function resetGame() {
    donkey.reset();
    obstacles = [];
    score = 0;
    gameOver = false;
    currentGameSpeed = INITIAL_GAME_SPEED;
    highScores = getUserHighScores();
}

function saveScore() {
    highScores.push(score);
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 5); // Keep only top 5 scores
    saveUserHighScores(highScores);
}

// Input handling
document.addEventListener('keydown', (event) => {
    if (!gameStarted) return;
    if (event.code === 'Space' && !gameOver) {
        donkey.jump();
    }
    if (event.code === 'Escape') {
        window.close();
    }
    if (event.code === 'Enter' && gameOver) {
        resetGame();
    }
});

function checkCollision(donkey, cactus) {
    // Simple bounding box collision
    return (
        donkey.x + 30 > cactus.x &&
        donkey.x - 30 < cactus.x + cactus.width &&
        donkey.y + 60 > cactus.y
    );
}

function drawButton(text, x, y, width, height, callback) {
    ctx.fillStyle = WHITE;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    ctx.fillStyle = BLACK;
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width/2, y + height/2);
    
    // Check for click
    canvas.addEventListener('click', function clickHandler(e) {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        if (clickX >= x && clickX <= x + width && clickY >= y && clickY <= y + height) {
            callback();
            canvas.removeEventListener('click', clickHandler);
        }
    });
}

function drawHighScores() {
    ctx.fillStyle = WHITE;
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('High Scores:', WINDOW_WIDTH - 200, 40);
    highScores.forEach((score, index) => {
        ctx.fillText(`${index + 1}. ${score}`, WINDOW_WIDTH - 200, 70 + index * 30);
    });
    if (userEmail) {
        ctx.font = '16px Arial';
        let displayUser = userEmail;
        if (userEmail === 'guest') displayUser = 'Guest';
        else if (userEmail.includes('@')) displayUser = userEmail;
        else if (userDomain) displayUser = userDomain;
        else if (/^0x[a-fA-F0-9]{40}$/.test(userEmail)) displayUser = userEmail.slice(0,6) + '...' + userEmail.slice(-4);
        ctx.fillText(`User: ${displayUser}`, WINDOW_WIDTH - 200, 30);
    }
}

function gameLoop() {
    if (!gameStarted) {
        requestAnimationFrame(gameLoop);
        return;
    }
    // Draw desert sky
    ctx.fillStyle = SKY;
    ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

    // Draw sun
    ctx.beginPath();
    ctx.arc(WINDOW_WIDTH - 100, 100, 50, 0, Math.PI * 2);
    ctx.fillStyle = SUN;
    ctx.fill();
    ctx.closePath();

    // Draw ground (sand)
    ctx.fillStyle = SAND;
    ctx.fillRect(0, WINDOW_HEIGHT - GROUND_HEIGHT, WINDOW_WIDTH, GROUND_HEIGHT);

    // Draw rocks
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(150 + i * 180, WINDOW_HEIGHT - GROUND_HEIGHT + 30, 18, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = ROCK;
        ctx.fill();
        ctx.closePath();
    }

    if (!gameOver) {
        // Update donkey
        donkey.update();

        // Increase speed based on score
        if (score > 0 && score % SPEED_INCREASE_INTERVAL === 0) {
            currentGameSpeed = Math.min(MAX_GAME_SPEED, INITIAL_GAME_SPEED + (score / SPEED_INCREASE_INTERVAL) * SPEED_INCREASE_AMOUNT);
        }

        // Generate cacti
        if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < WINDOW_WIDTH - MIN_OBSTACLE_SPACING) {
            const spacing = Math.floor(Math.random() * (MAX_OBSTACLE_SPACING - MIN_OBSTACLE_SPACING + 1)) + MIN_OBSTACLE_SPACING;
            obstacles.push(new Cactus(WINDOW_WIDTH));
        }

        // Update cacti
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].update();
            if (obstacles[i].x < -30) {
                obstacles.splice(i, 1);
                score++;
            }
        }

        // Collision detection
        for (let cactus of obstacles) {
            if (checkCollision(donkey, cactus)) {
                gameOver = true;
                saveScore();
                break;
            }
        }
    }

    // Draw donkey
    donkey.draw();
    // Draw cacti
    for (let cactus of obstacles) {
        cactus.draw();
    }

    // Draw score and speed
    ctx.fillStyle = WHITE;
    ctx.font = '36px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 40);
    ctx.fillText(`Speed: ${currentGameSpeed.toFixed(1)}`, 10, 80);

    // Draw high scores
    drawHighScores();

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        
        ctx.fillStyle = WHITE;
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', WINDOW_WIDTH/2, WINDOW_HEIGHT/2 - 50);
        
        drawButton('Restart', WINDOW_WIDTH/2 - 100, WINDOW_HEIGHT/2, 200, 50, resetGame);
    }

    // Continue game loop
    requestAnimationFrame(gameLoop);
}

function drawWelcomeCartoon() {
    const ctx = welcomeCanvas.getContext('2d');
    ctx.clearRect(0, 0, welcomeCanvas.width, welcomeCanvas.height);
    // Draw farm ground
    ctx.fillStyle = '#e6d3b3';
    ctx.fillRect(0, 120, 320, 60);
    // Draw sky
    ctx.fillStyle = '#b3e6ff';
    ctx.fillRect(0, 0, 320, 120);
    // Draw sun
    ctx.beginPath();
    ctx.arc(270, 40, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe066';
    ctx.fill();
    ctx.closePath();
    // Draw barn
    ctx.fillStyle = '#b22222';
    ctx.fillRect(30, 70, 40, 40);
    ctx.fillStyle = '#fff';
    ctx.fillRect(45, 95, 10, 15);
    ctx.beginPath();
    ctx.moveTo(30, 70);
    ctx.lineTo(50, 50);
    ctx.lineTo(70, 70);
    ctx.closePath();
    ctx.fillStyle = '#8b4513';
    ctx.fill();
    // Draw man (simple stick figure, rustic style)
    ctx.save();
    ctx.translate(110, 140);
    ctx.strokeStyle = '#5c4326';
    ctx.lineWidth = 3;
    ctx.beginPath(); // body
    ctx.moveTo(0, 0); ctx.lineTo(0, -25);
    ctx.stroke();
    ctx.beginPath(); // arms
    ctx.moveTo(-10, -10); ctx.lineTo(10, -10);
    ctx.stroke();
    ctx.beginPath(); // legs
    ctx.moveTo(0, 0); ctx.lineTo(-7, 15);
    ctx.moveTo(0, 0); ctx.lineTo(7, 15);
    ctx.stroke();
    ctx.beginPath(); // head
    ctx.arc(0, -32, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#e2c799';
    ctx.fill();
    ctx.stroke();
    // Hat
    ctx.beginPath();
    ctx.ellipse(0, -38, 10, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#bfa76f';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-7, -41); ctx.lineTo(7, -41); ctx.lineTo(0, -46); ctx.closePath();
    ctx.fillStyle = '#bfa76f';
    ctx.fill();
    ctx.restore();
    // Draw donkey (cartoon, rustic)
    ctx.save();
    ctx.translate(200, 140);
    // Body
    ctx.beginPath();
    ctx.ellipse(0, 15, 28, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#b0b0b0';
    ctx.fill();
    ctx.closePath();
    // Head
    ctx.beginPath();
    ctx.ellipse(0, -8, 12, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#b0b0b0';
    ctx.fill();
    ctx.closePath();
    // Ears
    ctx.beginPath();
    ctx.ellipse(-8, -20, 4, 14, -0.3, 0, Math.PI * 2);
    ctx.ellipse(8, -20, 4, 14, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#a0a0a0';
    ctx.fill();
    ctx.closePath();
    // Eyes
    ctx.beginPath();
    ctx.arc(-4, -10, 2, 0, Math.PI * 2);
    ctx.arc(4, -10, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.closePath();
    // Smile
    ctx.beginPath();
    ctx.arc(0, -4, 5, 0, Math.PI / 2);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.closePath();
    // Tail
    ctx.beginPath();
    ctx.moveTo(-25, 25); ctx.lineTo(-35, 30);
    ctx.strokeStyle = '#a0a0a0';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
    // Legs
    ctx.beginPath();
    ctx.moveTo(-12, 30); ctx.lineTo(-12, 45);
    ctx.moveTo(12, 30); ctx.lineTo(12, 45);
    ctx.moveTo(-5, 30); ctx.lineTo(-5, 45);
    ctx.moveTo(5, 30); ctx.lineTo(5, 45);
    ctx.strokeStyle = '#b0b0b0';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
    // Fence
    ctx.strokeStyle = '#bfa76f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(60, 160); ctx.lineTo(260, 160);
    ctx.stroke();
    ctx.closePath();
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(80 + i * 35, 150); ctx.lineTo(80 + i * 35, 170);
        ctx.stroke();
        ctx.closePath();
    }
}

// Start the game
document.addEventListener('DOMContentLoaded', function() {
    // Start the game
    gameLoop();
});