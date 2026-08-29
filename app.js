const canvas = document.getElementById("simCanvas");
const ctx = canvas.getContext("2d");

// --- SMART MOBILE RESPONSIVE CANVAS RESIZER ---
function resizeCanvas() {
    const parent = canvas.parentElement;
    // Use getBoundingClientRect to bypass flex/block calculation bugs on mobile Safari & Chrome
    const rect = parent.getBoundingClientRect();
    
    canvas.width = rect.width || parent.clientWidth;
    canvas.height = rect.height || parent.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


let currentBgColors = ["#111c30", "#05070f"];
window.updateCanvasBackground = function(colors) {
    currentBgColors = colors;
};

// --- VISUAL PARTICLE SYSTEM FOR REACTION SIMULATION ---
class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; 
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.speedY = type === "light" ? 2 : (Math.random() - 0.5) * 1.5 - 0.5;
        this.alpha = 1;
        this.size = Math.random() * 3 + 2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= 0.01; 
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
};

// --- CORE RENDER LOOP (ANIMATION TIMELINE) ---
function renderLoop() {
    window.plantEngine.update();

    // Render Cosmic Dynamic Planetary Gradients
    ctx.save();
    let gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * 0.8);
    gradient.addColorStop(0, currentBgColors[0]);
    gradient.addColorStop(1, currentBgColors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // Draw Ground / Planet Surface Line
    const groundY = canvas.height * 0.7;
    ctx.fillStyle = window.plantEngine.currentPlanet === "mars" ? "#54261e" : window.plantEngine.currentPlanet === "moon" ? "#334155" : "#1e293b";
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    // 3. Render Simulated Biological Particles
    if (window.plantEngine.isDay && window.plantEngine.currentPlanet !== "moon" && Math.random() < 0.3) {
        let spawnX = canvas.width / 2 + Math.tan(window.plantEngine.lightAngle * Math.PI / 180) * (canvas.height * 0.2);
        particles.push(new Particle(spawnX + (Math.random() - 0.5) * 100, 20, "light"));
    }
    if (window.plantEngine.stomataOpen > 20 && Math.random() < window.plantEngine.transpiration * 0.5) {
        particles.push(new Particle(canvas.width / 2, groundY - 80, "water"));
    }
    if (window.plantEngine.isDay && window.plantEngine.stomataOpen > 30 && window.plantEngine.currentPlanet !== "moon" && Math.random() < 0.1) {
        particles.push(new Particle(canvas.width / 2 + (Math.random() - 0.5) * 40, groundY - 120, "o2"));
    }

    particles = particles.filter(p => p.alpha > 0);
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // 4. DRAW PLANT MATRIX STRUCTURAL ANATOMY (STEM & ROOTS)
    if (window.plantEngine.glucose > 0) {
        ctx.save();
        ctx.translate(canvas.width / 2, groundY);
        
        // Draw Dynamic Root System
        ctx.strokeStyle = window.plantEngine.currentPlanet === "mars" ? "#8c6256" : "#475569";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-30, window.plantEngine.rootDepth / 2, -window.plantEngine.soilMoisture * 0.4, window.plantEngine.rootDepth);
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(30, window.plantEngine.rootDepth / 2, window.plantEngine.soilMoisture * 0.4, window.plantEngine.rootDepth);
        ctx.stroke();

        // Draw Dynamic Stem Structure (Phototropism Vector)
        ctx.rotate(window.plantEngine.stemAngle * Math.PI / 180);
        
        let stemHeight = -120;
        if (window.plantEngine.glucose < 40) stemHeight = -70; 

        ctx.strokeStyle = "#10b981";
        if (window.plantEngine.currentSpecies === "xerophyte") ctx.strokeStyle = "#047857"; 
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, stemHeight);
        ctx.stroke();

        // Draw Foliage Nodes
        ctx.fillStyle = window.plantEngine.glucose > 30 ? "#34d399" : "#b45309"; 
        
        if (window.plantEngine.currentSpecies === "xerophyte") {
            ctx.beginPath();
            ctx.arc(0, stemHeight, 25, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.ellipse(-25, stemHeight + 30, 20, 10, -Math.PI/4, 0, Math.PI * 2);
            ctx.ellipse(25, stemHeight + 50, 20, 10, Math.PI/4, 0, Math.PI * 2);
            ctx.ellipse(0, stemHeight, 30, 20, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    // 5. Draw Celestial Light Source
    if (window.plantEngine.isDay) {
        ctx.save();
        let starX = canvas.width / 2 + Math.sin(window.plantEngine.lightAngle * Math.PI / 180) * 150;
        let starY = groundY + Math.cos(window.plantEngine.lightAngle * Math.PI / 180) * -250;
        
        ctx.fillStyle = window.plantEngine.currentPlanet === "mars" ? "#fca5a5" : "#fbbf24";
        ctx.shadowBlur = 20;
        ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath();
        ctx.arc(starX, starY, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    requestAnimationFrame(renderLoop);
}

renderLoop();
