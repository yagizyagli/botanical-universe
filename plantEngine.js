class PlantEngine {
    constructor() {
        // --- UNIVERSAL PLANT SPECIES SPECIFICATIONS & DATA ---
        this.speciesConfig = {
            standard: { name: "Earth Standard", waterConsumption: 0.15, tempOptimum: 24, maxStomata: 100, metabolicRate: 1.0 },
            xerophyte: { name: "Desert Dune (Cactus)", waterConsumption: 0.03, tempOptimum: 38, maxStomata: 20, metabolicRate: 0.4 },
            hydrophyte: { name: "Aquatic Basin", waterConsumption: 0.40, tempOptimum: 20, maxStomata: 150, metabolicRate: 1.5 }
        };

        // --- PLANETARY ATMOSPHERE CONFIGURATIONS ---
        this.planetConfig = {
            earth: { name: "Sector Terra", gravity: 1.0, baseTemp: 24, baseMoisture: 50, gasAilment: "STABLE", bgGradient: ["#111c30", "#05070f"] },
            mars: { name: "Sector Ares", gravity: 0.38, baseTemp: -20, baseMoisture: 10, gasAilment: "THIN CO2 ECOSYSTEM", bgGradient: ["#2d1410", "#0a0302"] },
            moon: { name: "Sector Luna", gravity: 0.16, baseTemp: -40, baseMoisture: 0, gasAilment: "VACUUM ANOMALY", bgGradient: ["#0e1118", "#000000"] }
        };

        // --- REAL-TIME BIOLOGICAL STATES ---
        this.currentSpecies = "standard";
        this.currentPlanet = "earth";
        this.glucose = 100;        // Glucose Energy (%)
        this.water = 50;          // Intracellular water level (%)
        this.stomataOpen = 0;     // Stomatal aperture (%)
        this.transpiration = 0;   // Transpiration rate (ml/hr)
        this.auxin = 1.0;         // Auxin growth hormone balance
        this.stemAngle = 0;       // Stem bending angle (result of phototropism)
        this.rootDepth = 40;       // Root depth pixel modifier
        this.gasRatio = "STABLE"; // Gas exchange state

        // --- ENVIRONMENTAL PLANETARY VARIABLES ---
        this.isDay = true;
        this.lightAngle = 0;      // Shifting between -45 and 45 degrees
        this.soilMoisture = 50;   // Shifting between 0 - 100
        this.temperature = 24;    // Centigrade degrees
    }

    // --- MAIN BIOLOGICAL SIMULATION STEP CYCLE ---
    update() {
        const config = this.speciesConfig[this.currentSpecies];
        const planet = this.planetConfig[this.currentPlanet];

        // COSMIC ENVIRONMENTAL ENVIRONMENT IMPACTS
        if (this.currentPlanet !== "earth") {
            this.gasRatio = planet.gasAilment;
            this.glucose -= 0.04; // Atmospheric stress burns extra glucose reserves
        }

        // ENGINE CYCLE 1: OSMOSIS AND ROOT WATER ABSORPTION
        let waterAbsorption = (this.soilMoisture - this.water) * 0.05 * config.metabolicRate;
        this.water += waterAbsorption;
        
        // ENGINE CYCLE 2: MICROSCOPIC STOMATA MECHANISM & TRANSPIRATION
        if (this.temperature > config.tempOptimum + 10 || this.temperature < 0 || this.water < 25 || !this.isDay || this.currentPlanet === "moon") {
            this.stomataOpen += (0 - this.stomataOpen) * 0.1; // Clamping shut due to anomalies
        } else {
            this.stomataOpen += (config.maxStomata - this.stomataOpen) * 0.1;
        }

        this.transpiration = (this.stomataOpen / 100) * (this.temperature > 0 ? this.temperature / 10 : 0.1) * config.waterConsumption;
        this.water -= this.transpiration;
        this.water = Math.max(0, Math.min(100, this.water));

        // ENGINE CYCLE 3: PHOTOSYNTHESIS VS CELLULAR RESPIRATION
        if (this.isDay && this.currentPlanet !== "moon") {
            if (this.water > 10 && this.stomataOpen > 5) {
                let lightEfficiency = Math.cos(this.lightAngle * Math.PI / 180);
                let planetModifier = this.currentPlanet === "mars" ? 0.6 : 1.0; // Reduced solar input on Mars
                let photoRate = lightEfficiency * (this.stomataOpen / 100) * 0.2 * config.metabolicRate * planetModifier;
                this.glucose += photoRate;
                if (this.currentPlanet === "earth") this.gasRatio = "O2 EMISSION (PHOTOSYNTHESIS)";
            } else {
                this.gasRatio = "PHOTOSYNTHESIS STALLED";
            }
        } else {
            this.glucose -= 0.05 * config.metabolicRate;
            if (this.currentPlanet === "earth") this.gasRatio = "CO2 EMISSION (RESPIRATION)";
        }

        if (this.glucose <= 0) this.glucose = 0;
        if (this.glucose > 100) this.glucose = 100;

        // ENGINE CYCLE 4: HORMONAL DIRECTIONAL MOTION (PHOTOTROPISM & HYDROTROPISM)
        if (this.isDay) {
            this.auxin = 1.0 + (this.lightAngle / 45);
            let targetAngle = -this.lightAngle; 
            this.stemAngle += (targetAngle - this.stemAngle) * 0.05;
        }

        // Low gravity impacts directional root structuring anchoring speed
        let gravityModifier = planet.gravity;
        if (this.soilMoisture > 10) {
            this.rootDepth += ((40 + (this.soilMoisture * 0.6)) * gravityModifier - this.rootDepth) * 0.02;
        }

        this.updateUI();
    }

    // --- REAL-TIME MISSION CONTROL INTERFACE UPDATES ---
    updateUI() {
        document.getElementById("val-glucose").innerText = Math.round(this.glucose);
        document.getElementById("bar-glucose").style.width = this.glucose + "%";

        document.getElementById("val-water").innerText = Math.round(this.water);
        document.getElementById("bar-water").style.width = this.water + "%";

        let stomataStatus = this.stomataOpen > 15 ? `Open (${Math.round(this.stomataOpen)}%)` : "Closed";
        document.getElementById("val-stomata").innerText = stomataStatus;
        document.getElementById("bar-stomata").style.width = (this.stomataOpen / 150 * 100) + "%";

        document.getElementById("val-transpiration").innerText = this.transpiration.toFixed(2);
        document.getElementById("val-gas-ratio").innerText = this.gasRatio;
        document.getElementById("val-auxin").innerText = this.auxin.toFixed(2);

        let info = document.getElementById("info-text");
        if (this.glucose <= 0) {
            info.innerText = "💀 CRITICAL SYSTEM FAILURE: Total biomass decay. Cellular structures collapsed.";
        } else if (this.currentPlanet === "moon") {
            info.innerText = "🌌 LUNA ANOMALY: Complete vacuum. No atmospheric pressure detected. Stomata locked, photosynthesis impossible.";
        } else if (this.currentPlanet === "mars" && this.glucose < 40) {
            info.innerText = "🚀 MARS MISSION CRISIS: Freezing temperatures and thin atmosphere forcing defensive starvation metabolism.";
        } else if (this.glucose <= 20) {
            info.innerText = "🚨 WARNING: Critical biomass drop! Metabolic failure imminent. Increase light or adjust temperature.";
        } else if (this.water <= 20) {
            info.innerText = "🍂 ALERT: Dehydration detected. Stomata clamped shut to prevent fatal transpiration.";
        } else if (!this.isDay) {
            info.innerText = "🌌 Night Mode active. Photosynthesis offline. Cellular respiration is consuming glucose reserves.";
        } else {
            info.innerText = `✅ Secure Orbit [${this.planetConfig[this.currentPlanet].name}]. Universal plant engine operates within safe biological margins.`;
        }
    }
}

// Global engine instance allocation
window.plantEngine = new PlantEngine();

window.changePlanet = function(val) {
    window.plantEngine.currentPlanet = val;
    const planet = window.plantEngine.planetConfig[val];
    
    window.plantEngine.temperature = planet.baseTemp;
    window.plantEngine.soilMoisture = planet.baseMoisture;
    
    document.getElementById("temperature").value = planet.baseTemp;
    document.getElementById("soil-moisture").value = planet.baseMoisture;
    
    if(window.updateCanvasBackground) window.updateCanvasBackground(planet.bgGradient);
};
