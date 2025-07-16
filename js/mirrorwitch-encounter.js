export class MirrorwitchEncounter {
    constructor() {
        this.isActive = false;
        this.normalImage = null;
        this.scaryImage = null;
        this.imageElement = null;
        this.glitchInterval = null;
        this.audioContext = null;
        this.whisperAudio = null;
        this.encounterStartTime = null;
    }

    async initialize() {
        try {
            // Load images
            this.normalImage = await this.loadImage('assets/easter-eggs/mirrorwitch/mirrorwitch_normal.png');
            this.scaryImage = await this.loadImage('assets/easter-eggs/mirrorwitch/mirrorwitch_scary.png');
            
            // Initialize audio context for creepy effects
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            console.log('🪞 Mirrorwitch encounter system initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Mirrorwitch encounter:', error);
        }
    }

    async loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    startEncounter() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.encounterStartTime = Date.now();
        
        // Create the encounter page
        this.createEncounterPage();
        
        // Start glitching effects
        this.startGlitching();
        
        // Start creepy audio effects
        this.startCreepyAudio();
        
        console.log('🪞 Mirrorwitch encounter activated');
    }

    createEncounterPage() {
        const contentArea = document.querySelector('.document-content');
        if (!contentArea) return;

        // Clear existing content
        contentArea.innerHTML = '';

        // Create the encounter container
        const encounterContainer = document.createElement('div');
        encounterContainer.className = 'mirrorwitch-encounter';
        encounterContainer.innerHTML = `
            <div class="encounter-header">
                <h1 class="glitch-text" data-text="⚠️ CLASSIFIED ENCOUNTER LOG">⚠️ CLASSIFIED ENCOUNTER LOG</h1>
                <p class="warning-text">DIRECT ENTITY CONTACT // COGNITIVE HAZARD</p>
            </div>
            
            <div class="mirrorwitch-image-container">
                <img id="mirrorwitch-image" src="assets/easter-eggs/mirrorwitch/mirrorwitch_normal.png" alt="The Mirrorwitch" />
                <div class="glitch-overlay"></div>
                <div class="static-overlay"></div>
            </div>
            
            <div class="encounter-text">
                <p class="flicker-text">You shouldn't be here. You shouldn't have found this.</p>
                <p class="flicker-text">But you did. And now she knows.</p>
                <p class="flicker-text">The Mirrorwitch doesn't just watch from mirrors.</p>
                <p class="flicker-text">She watches from <em>inside</em> them.</p>
                <p class="flicker-text">From the spaces between reflections.</p>
                <p class="flicker-text">From the darkness behind your own eyes.</p>
            </div>
            
            <div class="ukrainian-quote">
                <blockquote class="glitch-quote">
                    >I see you from the inside.
                    >
                    > - The Mirrorwitch (direct translation from Ukrainian)
                </blockquote>
            </div>
            
            <div class="escape-instructions">
                <p class="blink-text">Turn away from the screen.</p>
                <p class="blink-text">Cover your mirrors.</p>
                <p class="blink-text">Don't look back.</p>
            </div>
        `;

        contentArea.appendChild(encounterContainer);
        
        // Store reference to image element
        this.imageElement = document.getElementById('mirrorwitch-image');
        
        // Add CSS classes for styling
        document.body.classList.add('mirrorwitch-encounter-active');
    }

    startGlitching() {
        if (!this.imageElement) return;

        // Variable glitch intervals (10-60 seconds)
        this.scheduleNextGlitch();
    }

    scheduleNextGlitch() {
        // Random interval between 10-60 seconds
        const interval = Math.random() * 50000 + 10000; // 10-60 seconds
        
        setTimeout(() => {
            this.triggerGlitch();
            this.scheduleNextGlitch(); // Schedule the next one
        }, interval);
    }

    triggerGlitch() {
        if (!this.imageElement || !this.scaryImage) return;

        // Switch to scary image
        this.imageElement.src = this.scaryImage.src;
        
        // Play creepy audio
        this.playCreepyAudio();
        
        // Switch back after 0.3 seconds
        setTimeout(() => {
            this.imageElement.src = this.normalImage.src;
        }, 300);
    }

    startCreepyAudio() {
        // Create subtle background whispers
        this.createWhisperEffect();
        
        // Random audio glitches
        setInterval(() => {
            if (Math.random() < 0.01) { // 1% chance every interval
                this.playRandomCreepySound();
            }
        }, 10000); // Every 10 seconds
    }

    createWhisperEffect() {
        // Create subtle reversed audio effect
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Very subtle, barely audible
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 2);
    }

    playCreepyAudio() {
        // Play brief reversed whisper
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Reverse-like effect
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    playRandomCreepySound() {
        // Random creepy audio effects
        const sounds = [
            () => this.playCreepyAudio(),
            () => this.createWhisperEffect(),
            () => this.playStaticBurst()
        ];
        
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
        randomSound();
    }

    playStaticBurst() {
        // Create static noise burst
        const bufferSize = this.audioContext.sampleRate * 0.1; // 0.1 seconds
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start();
    }

    stopEncounter() {
        this.isActive = false;
        
        // Clear intervals
        if (this.glitchInterval) {
            clearInterval(this.glitchInterval);
            this.glitchInterval = null;
        }
        
        // Remove CSS classes
        document.body.classList.remove('mirrorwitch-encounter-active');
        
        // Reset audio context
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        console.log('🪞 Mirrorwitch encounter deactivated');
    }

    // Public method to check if encounter is active
    isEncounterActive() {
        return this.isActive;
    }
} 