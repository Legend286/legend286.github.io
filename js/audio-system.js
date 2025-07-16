// Audio System module for Known Unknown Archive
// Handles audio playback, steganographic enhancements, and audio UI

import { CONFIG } from './config.js';

export class AudioSystem {
    constructor() {
        this.currentAudio = null;
        this.currentContent = '';
    }

    setCurrentContent(contentId) {
        this.currentContent = contentId;
    }

    // Process audio clips with syntax: [AUDIO:filename.mp3:Label:type]
    processAudioClips(html) {
        const audioRegex = /\[AUDIO:(.*?):(.*?):(.*?)\]/g;
        
        return html.replace(audioRegex, (match, filename, label, type) => {
            const audioId = 'audio_' + Math.random().toString(36).substr(2, 9);
            const isReverse = type === 'reverse';
            
            // Determine audio path and file type (steganographic wav vs normal mp3)
            let audioPath;
            let actualFilename = filename;
            
            if (filename.includes('/')) {
                audioPath = `assets/${filename}`;
            } else {
                // For Chernobyl content, potentially use steganographic wav files per-file
                if (this.isChernobylContent()) {
                    // Check if wav version exists for this file
                    const baseName = filename.replace('.mp3', '');
                    
                    // Check if this specific file should be steganographic
                    const isFileEnhanced = this.shouldUseFileStegano(baseName);
                    
                    if (CONFIG.steganographicFiles.includes(baseName) && isFileEnhanced) {
                        actualFilename = baseName + '.wav';
                        // Add subtle indicator for steganographic version
                        label = label + ' [ENHANCED]';
                    }
                }
                
                audioPath = `assets/events/chernobyl-incident/recordings/${actualFilename}`;
            }
            
            const isEnhanced = actualFilename.endsWith('.wav');
            const playerClass = isEnhanced ? 'bureau-audio-player enhanced' : 'bureau-audio-player';
            
            return `
                <div class="${playerClass}" data-type="${type}">
                    <div class="audio-header">
                        <span class="audio-label">🎧 ${label}</span>
                        <span class="audio-type">[${type.toUpperCase()}]</span>
                    </div>
                    <div class="audio-controls">
                        <button class="audio-btn play-btn" data-audio-id="${audioId}">▶</button>
                        <div class="audio-timeline">
                            <div class="progress-bar" data-audio-id="${audioId}">
                                <div class="progress-fill"></div>
                                <div class="progress-waveform"></div>
                            </div>
                            <div class="time-display">
                                <span class="current-time">00:00</span> / 
                                <span class="total-time">00:00</span>
                            </div>
                        </div>
                        <button class="audio-btn stop-btn" data-audio-id="${audioId}">⏹</button>
                    </div>
                    <audio id="${audioId}" preload="metadata">
                        <source src="${audioPath}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            `;
        });
    }

    // Set up audio controls after content is loaded
    setupAudioControls() {
        // Remove existing listeners to prevent duplicates
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        document.querySelectorAll('.stop-btn').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });

        // Add event listeners for audio controls
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const audioId = e.target.getAttribute('data-audio-id');
                this.toggleAudio(audioId);
            });
        });

        document.querySelectorAll('.stop-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const audioId = e.target.getAttribute('data-audio-id');
                this.stopAudio(audioId);
            });
        });

        // Progress bar click handlers
        document.querySelectorAll('.progress-bar').forEach(bar => {
            bar.addEventListener('click', (e) => {
                const audioId = e.target.getAttribute('data-audio-id') || 
                               e.target.closest('.progress-bar').getAttribute('data-audio-id');
                this.seekAudio(audioId, e);
            });
        });

        // Set up metadata loading for all audio elements
        document.querySelectorAll('audio').forEach(audio => {
            audio.addEventListener('loadedmetadata', () => this.updateTotalTime(audio));
            audio.addEventListener('timeupdate', () => this.updateProgress(audio));
            audio.addEventListener('ended', () => this.handleAudioEnd(audio));
        });
    }

    toggleAudio(audioId) {
        const audio = document.getElementById(audioId);
        const playBtn = document.querySelector(`[data-audio-id="${audioId}"].play-btn`);
        
        if (!audio || !playBtn) return;

        // Stop other audio
        this.stopAllAudio();

        if (audio.paused) {
            audio.play().then(() => {
                playBtn.textContent = '⏸';
                this.currentAudio = audio;
            }).catch(err => {
                console.error('Audio play failed:', err);
            });
        } else {
            audio.pause();
            playBtn.textContent = '▶';
            this.currentAudio = null;
        }
    }

    stopAudio(audioId) {
        const audio = document.getElementById(audioId);
        const playBtn = document.querySelector(`[data-audio-id="${audioId}"].play-btn`);
        
        if (!audio || !playBtn) return;

        audio.pause();
        audio.currentTime = 0;
        playBtn.textContent = '▶';
        this.currentAudio = null;
        this.updateProgress(audio);
    }

    stopAllAudio() {
        document.querySelectorAll('audio').forEach(audio => {
            if (!audio.paused) {
                const audioId = audio.id;
                const playBtn = document.querySelector(`[data-audio-id="${audioId}"].play-btn`);
                audio.pause();
                if (playBtn) playBtn.textContent = '▶';
            }
        });
        this.currentAudio = null;
    }

    seekAudio(audioId, event) {
        const audio = document.getElementById(audioId);
        const progressBar = event.currentTarget;
        
        if (!audio || !progressBar) return;

        const rect = progressBar.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;
        
        if (audio.duration) {
            audio.currentTime = percentage * audio.duration;
        }
    }

    updateProgress(audio) {
        const audioId = audio.id;
        const progressBar = document.querySelector(`[data-audio-id="${audioId}"] .progress-fill`);
        const currentTimeSpan = audio.closest('.bureau-audio-player').querySelector('.current-time');
        
        if (!progressBar || !currentTimeSpan) return;

        if (audio.duration) {
            const percentage = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${percentage}%`;
        }
        
        currentTimeSpan.textContent = this.formatTime(audio.currentTime);
    }

    updateTotalTime(audio) {
        const totalTimeSpan = audio.closest('.bureau-audio-player').querySelector('.total-time');
        if (totalTimeSpan && audio.duration) {
            totalTimeSpan.textContent = this.formatTime(audio.duration);
        }
    }

    handleAudioEnd(audio) {
        const audioId = audio.id;
        const playBtn = document.querySelector(`[data-audio-id="${audioId}"].play-btn`);
        
        if (playBtn) {
            playBtn.textContent = '▶';
        }
        
        this.currentAudio = null;
        audio.currentTime = 0;
        this.updateProgress(audio);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Per-file steganographic audio system
    shouldUseFileStegano(baseName) {
        // Check if this specific file should use steganographic version
        const fileKey = `stegano_${baseName}`;
        
        // Check if we've already decided for this file in this session
        const existingDecision = sessionStorage.getItem(fileKey);
        if (existingDecision !== null) {
            return existingDecision === 'true';
        }
        
        // Track visit count for statistical purposes
        const visitKey = 'chernobyl_visits';
        let visits = parseInt(localStorage.getItem(visitKey) || '0');
        
        // Only increment visit count once per session
        if (!sessionStorage.getItem('visit_counted')) {
            visits++;
            localStorage.setItem(visitKey, visits.toString());
            sessionStorage.setItem('visit_counted', 'true');
        }
        
        // Each file has independent ~5% chance to be enhanced
        const shouldEnhance = Math.random() < 0.05; // 5% chance per file
        
        // Store decision for this file in this session
        sessionStorage.setItem(fileKey, shouldEnhance.toString());
        
        // Log for debugging
        if (shouldEnhance) {
            console.log(`🔊 ENHANCED AUDIO: File "${baseName}" randomly enhanced (visit ${visits})`);
            console.log(`🔍 To manually enhance file: sessionStorage.setItem("stegano_${baseName}", "true"); location.reload();`);
        }
        
        return shouldEnhance;
    }
    
    // Testing and debugging functions for steganographic system
    activateAllFileStegano() {
        CONFIG.steganographicFiles.forEach(baseName => {
            sessionStorage.setItem(`stegano_${baseName}`, 'true');
        });
        
        console.log('🔊 All steganographic files activated for this session');
        console.log('🔄 Reload the page to see enhanced versions');
    }
    
    deactivateAllFileStegano() {
        CONFIG.steganographicFiles.forEach(baseName => {
            sessionStorage.removeItem(`stegano_${baseName}`);
        });
        
        console.log('🔇 All steganographic files deactivated for this session');
        console.log('🔄 Reload the page to see normal versions');
    }
    
    checkFileSteganoStatus() {
        console.log('📊 Current steganographic file status:');
        CONFIG.steganographicFiles.forEach(baseName => {
            const status = sessionStorage.getItem(`stegano_${baseName}`);
            const isEnhanced = status === 'true';
            console.log(`   ${baseName}: ${isEnhanced ? '🔊 ENHANCED' : '🔇 Normal'}`);
        });
        
        const visits = localStorage.getItem('chernobyl_visits') || '0';
        console.log(`📈 Total Chernobyl visits: ${visits}`);
    }
    
    isChernobylContent() {
        // Check if current content is Chernobyl-related
        return this.currentContent === 'chernobyl-incident-dossier';
    }
} 