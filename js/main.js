// Main module for Known Unknown Archive
// Coordinates all other modules and handles initialization

import { ContentManager } from './content-manager.js';
import { UIManager } from './ui-manager.js';
import { AudioSystem } from './audio-system.js';
import { SearchSystem } from './search-system.js';
import { MirrorwitchEncounter } from './mirrorwitch-encounter.js';

class ArchiveSystem {
    constructor() {
        this.audioSystem = null;
        this.contentManager = null;
        this.uiManager = null;
        this.searchSystem = null;
        this.mirrorwitchEncounter = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            console.log('🚀 Initializing Archive System...');
            
            // Initialize subsystems
            this.audioSystem = new AudioSystem();
            this.contentManager = new ContentManager(this.audioSystem);
            this.searchSystem = new SearchSystem(this.contentManager);
            this.uiManager = new UIManager(this.contentManager);
            this.mirrorwitchEncounter = new MirrorwitchEncounter();
            
            // Initialize systems that have init methods
            await this.contentManager.init();
            await this.searchSystem.init();
            await this.mirrorwitchEncounter.initialize();
            
            // Initialize UI manager (doesn't have async init)
            this.uiManager.init();
            
            // Connect systems
            this.searchSystem.setMirrorwitchEncounter(this.mirrorwitchEncounter);
            this.contentManager.setMirrorwitchEncounter(this.mirrorwitchEncounter);
            
            this.isInitialized = true;
            
            console.log('✅ Content Manager initialized');
            
            // Handle initial URL routing
            this.handleInitialRoute();
            
            console.log('🎉 Archive System fully initialized');
            
            // Development tips
            console.log('🔧 Development Tips:');
            console.log('  - Ctrl/Cmd + R: Reload current content (bypasses cache)');
            console.log('  - Ctrl/Cmd + Shift + R: Clear cache and reload');
            console.log('  - archiveSystem.clearCache(): Clear all cached content');
            console.log('  - archiveSystem.reloadContent(): Reload current content');
            console.log('🪞 Mirrorwitch Trigger: Type "Я БАЧУ ТЕБЕ ІЗ СЕРЕДИНИ" in search');
            
        } catch (error) {
            console.error('❌ Archive System initialization failed:', error);
            this.showInitializationError(error);
        }
    }

    handleInitialRoute() {
        // Check URL hash for initial content
        const hash = window.location.hash.slice(1);
        if (hash && hash !== 'home') {
            this.contentManager.loadContent(hash);
        } else {
            this.contentManager.loadContent('home');
        }
    }

    showInitializationError(error) {
        document.body.innerHTML = `
            <div style="
                padding: 40px; 
                background: #1a1a1a; 
                color: #e0e0e0; 
                font-family: monospace; 
                text-align: center;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
            ">
                <h1 style="color: #cc3333; margin-bottom: 20px;">
                    ⚠️ ARCHIVE SYSTEM ERROR
                </h1>
                <p style="margin-bottom: 20px;">
                    Failed to initialize Known Unknown Archive system
                </p>
                <pre style="
                    background: #0a0a0a; 
                    padding: 20px; 
                    border: 1px solid #333; 
                    margin: 20px auto;
                    max-width: 600px;
                ">${error.toString()}</pre>
                <p style="color: #b0b0b0;">
                    Check the browser console for more details.
                </p>
            </div>
        `;
    }

    // Development helpers - expose cache management
    clearCache() {
        this.contentManager.clearCache();
    }

    reloadContent() {
        this.contentManager.reloadCurrentContent();
    }

    loadContent(contentId) {
        return this.contentManager.loadContent(contentId);
    }

    performSearch() {
        return this.searchSystem.performSearch();
    }

    showNotification(message, type = 'info', duration = 3000) {
        return this.uiManager.showNotification(message, type, duration);
    }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.archiveSystem = new ArchiveSystem();
    window.archiveSystem.init();
});

// Export for potential use in other modules
export { ArchiveSystem }; 