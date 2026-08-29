class PlantEngine {
    constructor() {
        // --- UNIVERSAL PLANT SPECIES SPECIFICATIONS & DATA ---
        this.speciesConfig = {
            standard: { name: "Earth Standard", waterConsumption: 0.15, tempOptimum: 24, maxStomata: 100, metabolicRate: 1.0 },
            xerophyte: { name: "Desert Dune (Cactus)", waterConsumption: 0.03, tempOptimum: 38, maxStomata: 20, metabolicRate: 0.4 },
            hydrophyte: { name: "Aquatic Basin", waterConsumption: 0.40, tempOptimum: 20, maxStomata: 150, metabolicRate: 1.5 }
        };

        // --- REAL-TIME BIOLOGICAL STATES ---
        this.currentSpecies = "standard";
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

        // ENGINE CYCLE 1: OSMOSIS AND ROOT WATER ABSORPTION
        // Water is drawn via osmotic pressure if soil moisture is higher than internal plant water
        let waterAbsorption = (this.soilMoisture - this.water) * 0.05 * config.metabolicRate;
        this.water += waterAbsorption;
        
        // ENGINE CYCLE 2: MICROSCOPIC STOMATA MECHANISM & TRANSPIRATION
        // Plant clamps stomata shut under extreme heat or dehydration to conserve internal moisture
        if (this.temperature > config.tempOptimum + 10 || this.water < 25 || !this.isDay) {
            // Defensive Mode: Stomata closing
            this.stomataOpen += (0 - this.stomataOpen) * 0.1;
        } else {
            // Active Mode: Stomata opening for cellular carbon dioxide gas exchange
            this.stomataOpen += (config.maxStomata - this.stomataOpen) * 0.1;
        }

        // Transpiration: Water evaporates rapidly as temperature rises and stomata open wide
        this.transpiration = (this.stomataOpen / 100) * (this.temperature / 10) * config.waterConsumption;
        this.water -= this.transpiration;
        
        // Clamp biological thresholds
        this.water = Math.max(0, Math.min(100, this.water));

        // ENGINE CYCLE 3: PHOTOSYNTHESIS VS CELLULAR RESPIRATION (GAS & ENERGY EXCHANGE)
        if (this.isDay) {
            // DAY PHASE: Photosynthesis is online. Star light, water, and incoming CO2 produce glucose.
            if (this.water > 10 && this.stomataOpen > 5) {
                let lightEfficiency = Math.cos(this.lightAngle * Math.PI / 180);
                let photoRate = lightEfficiency * (this.stomataOpen / 100) * 0.2 * config.metabolicRate;
                this.glucose += photoRate;
                this.gasRatio = "O2 EMISSION (PHOTOSYNTHESIS)";
            } else {
                this.gasRatio = "PHOTOSYNTHESIS STALLED (LOW WATER/CO2)";
            }
        } else {
            // NIGHT PHASE: Photosynthesis offline. Cellular respiration burns glucose reserves, emitting CO2.
            this.glucose -= 0.05 * config.metabolicRate;
            this.gasRatio = "CO2 EMISSION (RESPIRATION)";
        }

        // Vital critical check: Total biomass collapse if glucose hits zero
        if (this.glucose <= 0) this.glucose = 0;
        if (this.glucose > 100) this.glucose = 100;

        // ENGINE CYCLE 4: HORMONAL DIRECTIONAL MOTION (PHOTOTROPISM & HYDROTROPISM)
        // Calculates asymmetric Auxin hormone distribution based on star light angles
        if (this.isDay) {
            // Auxin migrates to the shaded side, elongating cells and bending the stem toward the star
            this.auxin = 1.0 + (this.lightAngle / 45);
            let targetAngle = -this.lightAngle; // Bending toward the light vector
            this.stemAngle += (targetAngle - this.stemAngle) * 0.05;
        }

        // Hydrotropism: Root systems expand and deepen depending on planetary regolith moisture
        if (this.soilMoisture > 10) {
            this.rootDepth += (40 + (this.soilMoisture * 0.6) - this.rootDepth) * 0.02;
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

        // Dynamic System Status Message Logic
        let info = document.getElementById("info-text");
        if (this.glucose <= 20) {
            info.innerText = "🚨 WARNING: Critical biomass drop! Metabolic failure imminent. Increase light or adjust temperature.";
        } else if (this.water <= 20) {
            info.innerText = "🍂 ALERT: Dehydration detected. Stomata clamped shut to prevent fatal transpiration.";
        } else if (!this.isDay) {
            info.innerText = "🌌 Night Mode active. Photosynthesis offline. Cellular respiration is consuming glucose reserves.";
        } else if (Math.abs(this.lightAngle) > 25) {
            info.innerText = "☀️ Phototropism active. Auxin hormones migrating to the shaded side, bending the stem toward the star light.";
        } else {
            info.innerText = "✅ Stable Orbit. All botanical lifecycles functioning within nominal cosmic parameters.";
        }
    }
}

// Global engine engine instance allocation
window.plantEngine = new PlantEngine();
