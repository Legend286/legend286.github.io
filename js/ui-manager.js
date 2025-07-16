// UI Manager module for Known Unknown Archive
// Handles mobile interactions, touch events, and atmospheric effects

import { CONFIG } from './config.js';

export class UIManager {
    constructor(contentManager) {
        this.contentManager = contentManager;
        this.isMobileMenuOpen = false;
    }

    init() {
        this.setupMobileMenu();
        this.setupTouchEvents();
        this.setupAtmosphericEffects();
        this.setupMiscEventListeners();
        this.updateCurrentDate();
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenuClose = document.getElementById('mobile-menu-close');
        const siteNavigation = document.querySelector('.site-navigation');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.openMobileMenu());
        }
        
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', () => this.closeMobileMenu());
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMobileMenuOpen && 
                !siteNavigation.contains(e.target) && 
                !mobileMenuBtn.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
        
        // Close menu when clicking nav links on mobile
        if (siteNavigation) {
            siteNavigation.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link') && window.innerWidth <= 768) {
                    setTimeout(() => this.closeMobileMenu(), 100);
                }
            });
        }
    }

    openMobileMenu() {
        const siteNavigation = document.querySelector('.site-navigation');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        
        if (siteNavigation) {
            siteNavigation.classList.add('mobile-open');
            this.isMobileMenuOpen = true;
        }
        
        if (mobileMenuBtn) {
            mobileMenuBtn.classList.add('active');
        }
        
        // Prevent body scrolling when menu is open
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        const siteNavigation = document.querySelector('.site-navigation');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        
        if (siteNavigation) {
            siteNavigation.classList.remove('mobile-open');
            this.isMobileMenuOpen = false;
        }
        
        if (mobileMenuBtn) {
            mobileMenuBtn.classList.remove('active');
        }
        
        // Restore body scrolling
        document.body.style.overflow = '';
    }

    setupTouchEvents() {
        // Only add touch events if touch is supported
        if (!('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
            return;
        }

        let startX = 0;
        let startY = 0;
        
        // Swipe to open/close menu
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Check if it's more horizontal than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                const minSwipeDistance = 100;
                
                // Swipe right to open menu (from left edge)
                if (deltaX > minSwipeDistance && startX < 50 && !this.isMobileMenuOpen) {
                    this.openMobileMenu();
                }
                // Swipe left to close menu
                else if (deltaX < -minSwipeDistance && this.isMobileMenuOpen) {
                    this.closeMobileMenu();
                }
            }
            
            startX = 0;
            startY = 0;
        }, { passive: true });
        
        // Improve touch targets for mobile
        document.querySelectorAll('.nav-link, .content-tile, .search-result-item').forEach(element => {
            element.style.minHeight = '44px'; // iOS recommended touch target size
        });
    }

    setupAtmosphericEffects() {
        // Random flicker effect for classified elements
        setInterval(() => {
            const redactedElements = document.querySelectorAll('.redacted');
            redactedElements.forEach(el => {
                if (Math.random() < CONFIG.ui.flickerChance) {
                    el.style.opacity = '0.7';
                    setTimeout(() => {
                        el.style.opacity = '1';
                    }, 100);
                }
            });
        }, CONFIG.ui.flickerInterval);

        // Add subtle glow effect to classification badges
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const badges = node.querySelectorAll('.classification-badge');
                            badges.forEach(badge => {
                                this.addGlowEffect(badge);
                            });
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Add terminal-style typing effect for loading states
        this.setupTypingEffect();
    }

    addGlowEffect(element) {
        let glowIntensity = 0;
        let increasing = true;
        
        const glowAnimation = setInterval(() => {
            if (increasing) {
                glowIntensity += 0.02;
                if (glowIntensity >= 0.3) increasing = false;
            } else {
                glowIntensity -= 0.02;
                if (glowIntensity <= 0) increasing = true;
            }
            
            element.style.boxShadow = `0 0 ${10 + glowIntensity * 20}px rgba(0, 255, 0, ${glowIntensity})`;
        }, 100);

        // Clean up after 10 seconds to prevent memory leaks
        setTimeout(() => clearInterval(glowAnimation), 10000);
    }

    setupTypingEffect() {
        // Add typing effect to loading text
        const originalConsoleLog = console.log;
        let typingQueue = [];
        
        this.typeText = (element, text, speed = 50) => {
            if (!element) return;
            
            element.innerHTML = '';
            let i = 0;
            
            const typeInterval = setInterval(() => {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typeInterval);
                }
            }, speed);
        };
    }

    setupMiscEventListeners() {
        // Handle orientation changes on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.closeMobileMenu();
                // Refresh viewport height for mobile browsers
                document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
            }, 100);
        });

        // Handle resize for mobile optimization
        window.addEventListener('resize', this.debounce(() => {
            if (window.innerWidth > 768) {
                this.closeMobileMenu();
            }
            // Update viewport height for mobile browsers
            document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        }, 250));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Alt + M to toggle mobile menu (for testing)
            if (e.altKey && e.key === 'm') {
                e.preventDefault();
                if (this.isMobileMenuOpen) {
                    this.closeMobileMenu();
                } else {
                    this.openMobileMenu();
                }
            }
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.content) {
                this.contentManager.loadContent(e.state.content);
            } else {
                // If no state, try to get content from hash
                const hash = window.location.hash.slice(1);
                if (hash) {
                    this.contentManager.loadContent(hash);
                } else {
                    this.contentManager.loadContent('home');
                }
            }
        });

        // Auto-link click handlers (for cross-references)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('auto-link')) {
                e.preventDefault();
                const contentId = e.target.getAttribute('data-content');
                if (contentId) {
                    this.contentManager.loadContent(contentId);
                }
            }
        });

        // Improve focus management for accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    updateCurrentDate() {
        const currentDateElement = document.getElementById('current-date');
        if (currentDateElement) {
            const now = new Date();
            const options = { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'UTC'
            };
            const dateString = now.toLocaleString('en-US', options).replace(',', ' //');
            currentDateElement.textContent = `${dateString} UTC`;
        }
    }

    // Utility function for debouncing events
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Enhanced mobile keyboard support
    setupMobileKeyboardOptimization() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        // Handle virtual keyboard appearance
        let initialViewportHeight = window.innerHeight;
        
        searchInput.addEventListener('focus', () => {
            setTimeout(() => {
                const currentHeight = window.innerHeight;
                const keyboardHeight = initialViewportHeight - currentHeight;
                
                if (keyboardHeight > 150) { // Keyboard is likely open
                    const header = document.querySelector('.site-header');
                    if (header && window.innerWidth <= 768) {
                        header.style.transform = 'translateY(-60px)';
                        header.style.transition = 'transform 0.3s ease';
                    }
                }
            }, 300);
        });
        
        searchInput.addEventListener('blur', () => {
            const header = document.querySelector('.site-header');
            if (header) {
                header.style.transform = '';
                header.style.transition = '';
            }
        });
    }

    // Add loading animation helpers
    showLoadingSpinner(element) {
        if (!element) return;
        
        element.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-text">ACCESSING...</div>
            </div>
        `;
    }

    // Error animation helpers
    showErrorShake(element) {
        if (!element) return;
        
        element.classList.add('shake-animation');
        setTimeout(() => {
            element.classList.remove('shake-animation');
        }, 600);
    }

    // Notification system for user feedback
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after duration
        const autoRemove = setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
        
        // Manual close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
            this.removeNotification(notification);
        });
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('notification-show');
        }, 10);
    }

    removeNotification(notification) {
        notification.classList.remove('notification-show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
} 