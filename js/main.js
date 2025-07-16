// Main module for Known Unknown Archive
// Coordinates all other modules and handles initialization

import { AudioSystem } from './audio-system.js';
import { ContentManager } from './content-manager.js';
import { SearchSystem } from './search-system.js';
import { UIManager } from './ui-manager.js';

class ArchiveSystem {
    constructor() {
        // Initialize all subsystems
        this.audioSystem = new AudioSystem();
        this.contentManager = new ContentManager(this.audioSystem);
        this.searchSystem = new SearchSystem(this.contentManager);
        this.uiManager = new UIManager(this.contentManager);
    }

    async init() {
        console.log('🏛️ Initializing Known Unknown Archive...');
        
        try {
            // Initialize UI manager first (for mobile menu, atmospheric effects)
            this.uiManager.init();
            console.log('✅ UI Manager initialized');
            
            // Set up search system
            this.searchSystem.setupSearchListeners();
            console.log('✅ Search System initialized');
            
            // Initialize content manager (builds navigation and loads initial content)
            await this.contentManager.init();
            console.log('✅ Content Manager initialized');
            
            // Handle initial URL routing
            this.handleInitialRoute();
            
            console.log('🎉 Archive System fully initialized');
            
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
        const documentContent = document.getElementById('document-content');
        if (documentContent) {
            documentContent.innerHTML = `
                <div class="system-error">
                    <div class="classification-header">
                        <div class="classification-badge error">SYSTEM ERROR</div>
                        <div class="file-number">INIT_FAILURE</div>
                    </div>
                    <h1>🚨 ARCHIVE SYSTEM INITIALIZATION FAILED</h1>
                    <div class="error-details">
                        <p><strong>Error:</strong> ${error.message}</p>
                        <p>The Known Unknown Archive failed to initialize properly. This may be due to:</p>
                        <ul>
                            <li>Network connectivity issues</li>
                            <li>Missing system files</li>
                            <li>Browser compatibility problems</li>
                            <li>Server configuration errors</li>
                        </ul>
                        <div class="error-actions">
                            <button onclick="location.reload()" class="retry-btn">RETRY INITIALIZATION</button>
                            <button onclick="console.log('System State:', this)" class="debug-btn">VIEW DEBUG INFO</button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Public API methods for testing and debugging
    getSystemStatus() {
        return {
            audioSystem: !!this.audioSystem,
            contentManager: !!this.contentManager,
            searchSystem: !!this.searchSystem,
            uiManager: !!this.uiManager,
            currentContent: this.contentManager?.currentContent,
            isInitialized: true
        };
    }

    // Expose subsystem methods for debugging
    activateAllFileStegano() {
        return this.audioSystem.activateAllFileStegano();
    }

    deactivateAllFileStegano() {
        return this.audioSystem.deactivateAllFileStegano();
    }

    checkFileSteganoStatus() {
        return this.audioSystem.checkFileSteganoStatus();
    }

    unlockMirrorwitchConnection() {
        return this.searchSystem.unlockMirrorwitchConnection();
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

// Initialize the system when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOM loaded, starting archive system...');
    
    const archiveSystem = new ArchiveSystem();
    await archiveSystem.init();
    
    // Make it globally accessible for debugging and search suggestions
    window.archiveSystem = archiveSystem;
    
    // Make convenient testing functions available globally
    window.activateAllStegano = () => archiveSystem.activateAllFileStegano();
    window.deactivateAllStegano = () => archiveSystem.deactivateAllFileStegano();
    window.checkSteganStatus = () => archiveSystem.checkFileSteganoStatus();
    window.unlockMirrorwitch = () => archiveSystem.unlockMirrorwitchConnection();
    
    // Development helpers
    if (typeof window !== 'undefined') {
        window.debugArchive = () => {
            console.log('🔧 Archive System Debug Info:');
            console.log('Status:', archiveSystem.getSystemStatus());
            console.log('Audio System:', archiveSystem.audioSystem);
            console.log('Content Manager:', archiveSystem.contentManager);
            console.log('Search System:', archiveSystem.searchSystem);
            console.log('UI Manager:', archiveSystem.uiManager);
        };
    }
});

// Export for potential use in other modules
export { ArchiveSystem }; 