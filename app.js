const canvas = document.getElementById("simCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas dynamically to match its container layout
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- VISUAL PARTICLE SYSTEM FOR REACTION SIMULATION ---
class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // "light", "water", "o2", "co2"
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.speedY = type === "light" ? 2 : (Math.random() - 0.5) * 1.5 - 0.5;
        this.alpha = 1;
        this.size = Math.random() * 3 + 2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= 0.01; // Fade out effect
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        if (this.type === "light") ctx.fillStyle = "#fbbf24";
        else if (this.type === "water") ctx.fillStyle = "#3b82f6";
        else if (this.type === "o2") ctx.fillStyle = "#00f0ff";
        else ctx.fillStyle = "#a855f7";

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let particles = [];

// --- GLOBAL EVENT TRIGGERS FOR THE UI INTERFACE ---
window.toggleTime = function() {
    window.plantEngine.isDay = !window.plantEngine.isDay;
    const btn = document.getElementById("btn-time");
    btn.innerText = window.plantEngine.isDay ? "Day Phase" : "Night Phase";
    btn.style.backgroundColor = window.plantEngine.isDay ? "#065f46" : "#1e1b4b";
};

window.updateLightAngle = function(val) {
    window.plantEngine.lightAngle = parseInt(val);
};

window.updateSoilMoisture = function(val) {
    window.plantEngine.soilMoisture = parseInt(val);
};

window.updateTemperature = function(val) {
    window.plantEngine.temperature = parseInt(val);
};

window.changeSpecies = function(val) {
    window.plantEngine.currentSpecies = val;
    // Adapt current season badge text based on selected bio-group
    const badge = document.getElementById("current-season");
    badge.innerText = `Species: ${window.plantEngine.speciesConfig[val].name}`;
};

// --- CORE RENDER LOOP (ANIMATION TIMELINE) ---
function renderLoop() {
    // 1. Core Physics Step Execution
    window.plantEngine.update();

    // 2. Clear Screen and Draw Ambient Space Sky
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Ground / Planet Surface Line
    const groundY = canvas.height * 0.7;
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    // 3. Render Simulated Biological Particles
    // Generate star light particles during day phase
    if (window.plantEngine.isDay && Math.random() < 0.3) {
        let spawnX = canvas.width / 2 + Math.tan(window.plantEngine.lightAngle * Math.PI / 180) * (canvas.height * 0.2);
        particles.push(new Particle(spawnX + (Math.random() - 0.5) * 100, 20, "light"));
    }
    // Generate transpiration/water particles if stomata are open
    if (window.plantEngine.stomataOpen > 20 && Math.random() < window.plantEngine.transpiration * 0.5) {
        particles.push(new Particle(canvas.width / 2, groundY - 80, "water"));
    }
    // Generate active O2 particles during heavy photosynthesis
    if (window.plantEngine.isDay && window.plantEngine.stomataOpen > 30 && Math.random() < 0.1) {
        particles.push(new Particle(canvas.width / 2 + (Math.random() - 0.5) * 40, groundY - 120, "o2"));
    }

    // Process and sweep dead particles
    particles = particles.filter(p => p.alpha > 0);
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // 4. DRAW PLANT MATRIX STRUCTURAL ANATOMY (STEM & ROOTS)
    ctx.save();
    ctx.translate(canvas.width / 2, groundY);
    
    // Draw Dynamic Root System (Hydrotropism Vector)
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Left Root Branch
    ctx.quadraticCurveTo(-30, window.plantEngine.rootDepth / 2, -window.plantEngine.soilMoisture * 0.4, window.plantEngine.rootDepth);
    ctx.moveTo(0, 0);
    // Right Root Branch
    ctx.quadraticCurveTo(30, window.plantEngine.rootDepth / 2, window.plantEngine.soilMoisture * 0.4, window.plantEngine.rootDepth);
    ctx.stroke();

    // Draw Dynamic Stem Structure (Phototropism Vector)
    // Apply calculated Auxin hormonal angle shifts
    ctx.rotate(window.plantEngine.stemAngle * Math.PI / 180);
    
    // Draw Main Trunk Stem
    let stemHeight = -120;
    // Shrink slightly if plant is dying / energy level is low
    if (window.plantEngine.glucose < 30) stemHeight = -80; 

    ctx.strokeStyle = "#10b981";
    if (window.plantEngine.currentSpecies === "xerophyte") ctx.strokeStyle = "#047857"; // Cactus dark green
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, stemHeight);
    ctx.stroke();

    // Draw Foliage / Microscopic Leaf Nodes
    ctx.fillStyle = window.plantEngine.glucose > 25 ? "#34d399" : "#b45309"; // Yellow leaves if dying
    
    if (window.plantEngine.currentSpecies === "xerophyte") {
        // Draw Cactus structural oval pads
        ctx.beginPath();
        ctx.arc(0, stemHeight, 25, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Draw standard foliage system
        ctx.beginPath();
        ctx.ellipse(-25, stemHeight + 30, 20, 10, -Math.PI/4, 0, Math.PI * 2);
        ctx.ellipse(25, stemHeight + 50, 20, 10, Math.PI/4, 0, Math.PI * 2);
        ctx.ellipse(0, stemHeight, 30, 20, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();

    // 5. Draw Light Source (The Orbital Star Vector)
    if (window.plantEngine.isDay) {
        ctx.save();
        let starX = canvas.width / 2 + Math.sin(window.plantEngine.lightAngle * Math.PI / 180) * 150;
        let starY = groundY + Math.cos(window.plantEngine.lightAngle * Math.PI / 180) * -250;
        
        ctx.fillStyle = "#fbbf24";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#fbbf24";
        ctx.beginPath();
        ctx.arc(starX, starY, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    requestAnimationFrame(renderLoop);
}

// Kick-off the animation pipeline
renderLoop();
