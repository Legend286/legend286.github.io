// Known Unknown Archive - JavaScript Controller
// Handles dynamic content loading, navigation, and search

class ArchiveSystem {
    constructor() {
        this.currentContent = 'home';
        this.cache = new Map();
        this.searchIndex = new Map();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCurrentDate();
        this.buildSearchIndex();
        
        // Load initial content
        this.loadContent('home');
    }

    setupEventListeners() {
        // Navigation links
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link') && !e.target.classList.contains('disabled')) {
                e.preventDefault();
                const contentId = e.target.getAttribute('data-content');
                if (contentId) {
                    this.loadContent(contentId);
                    this.setActiveNavLink(e.target);
                }
            }
            
            // Content cards
            if (e.target.closest('.content-card')) {
                const target = e.target.closest('.content-card').getAttribute('data-target');
                if (target) {
                    this.loadContent(target);
                    this.setActiveNavLink(document.querySelector(`[data-content="${target}"]`));
                }
            }

            // Collapsible navigation sections
            if (e.target.classList.contains('collapsible') || e.target.closest('.collapsible')) {
                e.preventDefault();
                const header = e.target.classList.contains('collapsible') ? e.target : e.target.closest('.collapsible');
                this.toggleNavSection(header);
            }

            // Mobile menu toggle
            if (e.target.id === 'mobile-menu-toggle') {
                e.preventDefault();
                this.toggleMobileMenu();
            }

            // Mobile menu close
            if (e.target.id === 'sidebar-close' || e.target.id === 'mobile-overlay') {
                e.preventDefault();
                this.closeMobileMenu();
            }

            // Close mobile menu when nav link is clicked
            if (e.target.classList.contains('nav-link') && !e.target.classList.contains('disabled')) {
                this.closeMobileMenu();
            }
        });

        // Touch events for mobile improvement
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this.setupTouchEvents();
        }

        // Search functionality
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
            
            // Mobile keyboard optimization
            searchInput.addEventListener('focus', () => {
                // Small delay to allow keyboard to appear
                setTimeout(() => {
                    if (window.innerHeight < 500) {
                        document.querySelector('.site-header').style.transform = 'translateY(-20px)';
                    }
                }, 300);
            });
            
            searchInput.addEventListener('blur', () => {
                document.querySelector('.site-header').style.transform = '';
            });
        }

        // Escape key to clear search and close mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.value = '';
                }
                this.clearSearch();
                this.closeMobileMenu();
            }
        });

        // Handle orientation changes on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.closeMobileMenu();
            }, 100);
        });

        // Handle resize for mobile optimization
        window.addEventListener('resize', this.debounce(() => {
            if (window.innerWidth > 768) {
                this.closeMobileMenu();
            }
        }, 250));
    }

    setupTouchEvents() {
        let startX = 0;
        let startY = 0;
        
        // Swipe to open/close menu
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;
            
            const diffX = e.touches[0].clientX - startX;
            const diffY = e.touches[0].clientY - startY;
            
            // Only handle horizontal swipes
            if (Math.abs(diffX) > Math.abs(diffY)) {
                const sidebar = document.getElementById('sidebar');
                if (!sidebar) return;
                
                const isMenuOpen = sidebar.classList.contains('mobile-active');
                
                // Swipe right to open menu (from left edge)
                if (diffX > 50 && startX < 20 && !isMenuOpen) {
                    this.toggleMobileMenu();
                }
                
                // Swipe left to close menu
                if (diffX < -50 && isMenuOpen) {
                    this.closeMobileMenu();
                }
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            startX = 0;
            startY = 0;
        }, { passive: true });
    }

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

    updateCurrentDate() {
        const now = new Date();
        const formatted = now.toISOString().split('T')[0].replace(/-/g, '.');
        const currentDateEl = document.getElementById('current-date');
        if (currentDateEl) {
            currentDateEl.textContent = formatted;
        }
    }

    async loadContent(contentId) {
        if (contentId === 'home') {
            this.showHomeContent();
            this.updateFileInfo('ARCHIVE OVERVIEW', 'Home');
            return;
        }

        // Show loading screen
        this.showLoading();
        
        try {
            let content;
            
            // Check cache first
            if (this.cache.has(contentId)) {
                content = this.cache.get(contentId);
            } else {
                // Load from markdown file
                const response = await fetch(`${contentId}.md`);
                if (!response.ok) {
                    throw new Error(`Failed to load ${contentId}.md`);
                }
                const markdown = await response.text();
                content = this.markdownToHTML(markdown);
                
                // Cache the content
                this.cache.set(contentId, content);
            }
            
            // Simulate some loading time for effect
            setTimeout(() => {
                this.displayContent(content);
                this.updateFileInfo(this.getFileNumber(contentId), this.getFileName(contentId));
                this.currentContent = contentId;
            }, 2500); // 2.5 seconds total loading time
            
        } catch (error) {
            console.error('Error loading content:', error);
            this.showError(`Failed to load content: ${contentId}`);
        }
    }

    showHomeContent() {
        const documentContent = document.getElementById('document-content');
        
        // Clear any previous content
        documentContent.innerHTML = '';
        
        // Create home content dynamically
        const homeHTML = `
            <div class="home-content">
                <div class="document-header">
                    <h1>WELCOME TO THE KNOWN UNKNOWN ARCHIVE</h1>
                    <div class="classification-stamp">
                        <div class="stamp-text">DECLASSIFIED</div>
                        <div class="stamp-subtext">PUBLIC ORIENTATION MATERIALS</div>
                    </div>
                </div>

                <div class="alert-box">
                    <strong>SECURITY NOTICE:</strong> This archive contains information about anomalous entities, locations, and phenomena. All content has been cleared for public dissemination under Protocol C-12.
                </div>

                <section class="overview-section">
                    <h2>ARCHIVE CONTENTS</h2>
                    <div class="content-grid">
                        <div class="content-card" data-target="first_lore_document">
                            <h3>📋 INTRODUCTORY BRIEFING</h3>
                            <p>New to the Known Unknown phenomenon? Start here for basic orientation and classification protocols.</p>
                            <span class="file-tag">FILE 0001</span>
                        </div>
                        
                        <div class="content-card" data-target="known_unknown_lore">
                            <h3>🗂️ MAIN ARCHIVE</h3>
                            <p>Complete lore dossier including factions, entities, timeline, and world overview.</p>
                            <span class="file-tag">COMPREHENSIVE</span>
                        </div>
                        
                        <div class="content-card" data-target="redwood_deep_dossier">
                            <h3>🌲 REDWOOD DEEP</h3>
                            <p>Site dossier for anomalous ecological zone. Contains entity classifications and incident reports.</p>
                            <span class="file-tag">FILE 0024</span>
                        </div>
                        
                        <div class="content-card" data-target="pre-history">
                            <h3>🗿 PREHISTORY TIMELINE</h3>
                            <p>Era I chronological record of anomalous events from 6000 BCE to 0 CE. Ancient rift breaches and temporal artifacts.</p>
                            <span class="file-tag">ERA I</span>
                        </div>
                    </div>
                </section>

                <section class="recent-activity">
                    <h2>RECENT ARCHIVE UPDATES</h2>
                    <div class="activity-log">
                        <div class="log-entry">
                            <span class="log-date">2024.12.XX</span>
                            <span class="log-action">CREATED</span>
                            <span class="log-file">Redwood Deep Site Dossier</span>
                        </div>
                        <div class="log-entry">
                            <span class="log-date">2024.12.XX</span>
                            <span class="log-action">UPDATED</span>
                            <span class="log-file">Known Unknown Lore Database</span>
                        </div>
                        <div class="log-entry">
                            <span class="log-date">2024.12.XX</span>
                            <span class="log-action">INITIATED</span>
                            <span class="log-file">Digital Archive Project</span>
                        </div>
                    </div>
                </section>
            </div>
        `;
        
        // Insert the home content
        documentContent.innerHTML = homeHTML;
        
        // Re-attach event listeners for content cards
        this.attachContentCardListeners();
    }

    showLoading() {
        const documentContent = document.getElementById('document-content');
        
        const loadingHTML = `
            <div class="loading-screen" style="display: block;">
                <div class="loading-text" id="loading-text-animation"></div>
                <div class="loading-bar">
                    <div class="loading-progress"></div>
                </div>
            </div>
        `;
        
        documentContent.innerHTML = loadingHTML;
        
        // Start typing animation
        this.startTypingAnimation();
    }

    startTypingAnimation() {
        const loadingTextEl = document.getElementById('loading-text-animation');
        if (!loadingTextEl) return;
        
        const baseText = 'ACCESSING ARCHIVE';
        const dotSequence = ['.', '..', '...', '.', '..', '...', ' OK'];
        let currentText = '';
        let index = 0;
        let dotIndex = 0;
        let isTypingDots = false;
        
        const typeInterval = setInterval(() => {
            if (!isTypingDots && index < baseText.length) {
                // Type the main text (faster)
                currentText += baseText[index];
                loadingTextEl.textContent = currentText + (Math.random() > 0.5 ? '_' : '');
                index++;
                
                // Switch to dots timing after main text
                if (index >= baseText.length) {
                    setTimeout(() => {
                        isTypingDots = true;
                        loadingTextEl.textContent = baseText; // Remove cursor
                        
                        // Start dot sequence timing for 2.5s total
                        const dotInterval = setInterval(() => {
                            if (dotIndex < dotSequence.length) {
                                loadingTextEl.textContent = baseText + dotSequence[dotIndex];
                                dotIndex++;
                            } else {
                                clearInterval(dotInterval);
                            }
                        }, 175); // 175ms for each dot step (fits in remaining ~1.2s)
                    }, 100);
                    
                    clearInterval(typeInterval);
                }
            }
        }, 80); // 80ms per character for 2.5s total timing
    }

    displayContent(htmlContent) {
        const documentContent = document.getElementById('document-content');
        documentContent.innerHTML = htmlContent;
        
        // Scroll to top
        documentContent.scrollTop = 0;
    }

    showError(message) {
        const documentContent = document.getElementById('document-content');
        documentContent.innerHTML = `
            <div class="error-content">
                <div class="document-header">
                    <h1>ACCESS DENIED</h1>
                    <div class="classification-stamp" style="border-color: var(--accent-red); background-color: rgba(204, 51, 51, 0.1);">
                        <div class="stamp-text" style="color: var(--accent-red);">RESTRICTED</div>
                        <div class="stamp-subtext" style="color: var(--accent-red);">INSUFFICIENT CLEARANCE</div>
                    </div>
                </div>
                <div class="alert-box" style="background-color: var(--accent-red);">
                    <strong>ERROR:</strong> ${message}
                </div>
                <p>The requested file may be classified above your clearance level or may not exist in the archive.</p>
                <p><strong>Possible causes:</strong></p>
                <ul>
                    <li>Document has been moved to secure storage</li>
                    <li>File corrupted during digital transfer</li>
                    <li>Access revoked due to security breach</li>
                    <li>Document never existed (memory adjustment protocol)</li>
                </ul>
                <p><em>If you believe this is an error, contact your supervising agent.</em></p>
            </div>
        `;
    }

    setActiveNavLink(activeLink) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to clicked link
        if (activeLink) {
            activeLink.classList.add('active');
            
            // Find and expand the section containing this link
            const parentList = activeLink.closest('.nav-list');
            if (parentList) {
                const listId = parentList.id;
                const header = document.querySelector(`[data-target="${listId}"]`);
                
                if (header && !header.classList.contains('active')) {
                    this.toggleNavSection(header);
                }
            }
        }
    }

    updateFileInfo(fileNumber, fileName) {
        const fileNumberEl = document.getElementById('file-number');
        if (fileNumberEl) {
            fileNumberEl.textContent = fileNumber;
        }
        // Update page title if needed
        document.title = `${fileName} // KNOWN UNKNOWN ARCHIVE`;
    }

    getFileNumber(contentId) {
        const fileNumbers = {
            'first_lore_document': 'FILE 0001',
            'known_unknown_lore': 'LORE DOSSIER',
            'redwood_deep_dossier': 'FILE 0024',
            'pre-history': 'ERA I TIMELINE'
        };
        return fileNumbers[contentId] || 'ARCHIVE FILE';
    }

    getFileName(contentId) {
        const fileNames = {
            'first_lore_document': 'Introductory Dossier',
            'known_unknown_lore': 'Known Unknown Lore',
            'redwood_deep_dossier': 'Redwood Deep Site Dossier',
            'pre-history': 'Prehistory Dossier'
        };
        return fileNames[contentId] || 'Unknown Document';
    }

    // Simple markdown to HTML converter
    markdownToHTML(markdown) {
        let html = markdown;
        
        // Headers
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        
        // Bold and italic
        html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Code blocks
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // Blockquotes - handle multi-line quotes properly
        html = html.replace(/^> (.*)$/gm, '|||BLOCKQUOTE|||$1');
        
        // Group consecutive blockquote lines
        const lines = html.split('\n');
        const processedLines = [];
        let inBlockquote = false;
        let blockquoteContent = [];
        
        for (let line of lines) {
            if (line.startsWith('|||BLOCKQUOTE|||')) {
                if (!inBlockquote) {
                    inBlockquote = true;
                }
                blockquoteContent.push(line.replace('|||BLOCKQUOTE|||', ''));
            } else {
                if (inBlockquote) {
                    // End of blockquote, process accumulated content
                    processedLines.push('<blockquote>' + blockquoteContent.join('<br>') + '</blockquote>');
                    blockquoteContent = [];
                    inBlockquote = false;
                }
                processedLines.push(line);
            }
        }
        
        // Handle case where file ends with blockquote
        if (inBlockquote && blockquoteContent.length > 0) {
            processedLines.push('<blockquote>' + blockquoteContent.join('<br>') + '</blockquote>');
        }
        
        html = processedLines.join('\n');
        
        // Lists
        html = html.replace(/^\- (.*$)/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Horizontal rules
        html = html.replace(/^---$/gm, '<hr>');
        
        // Line breaks and paragraphs
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        
        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>.*?<\/ul>)<\/p>/s, '$1');
        html = html.replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/gs, '$1');
        html = html.replace(/<p>(<pre>.*?<\/pre>)<\/p>/s, '$1');
        
        return html;
    }

    buildSearchIndex() {
        // Build search index from navigation and content
        const navLinks = document.querySelectorAll('.nav-link[data-content]');
        navLinks.forEach(link => {
            const contentId = link.getAttribute('data-content');
            const title = link.textContent;
            this.searchIndex.set(title.toLowerCase(), contentId);
        });
        
        // Add additional search terms
        this.searchIndex.set('bureau', 'known_unknown_lore');
        this.searchIndex.set('riftborn', 'known_unknown_lore');
        this.searchIndex.set('lost kin', 'known_unknown_lore');
        this.searchIndex.set('unbound', 'known_unknown_lore');
        this.searchIndex.set('birchskin', 'redwood_deep_dossier');
        this.searchIndex.set('doorlicker', 'redwood_deep_dossier');
        this.searchIndex.set('redwood', 'redwood_deep_dossier');
        this.searchIndex.set('forest', 'redwood_deep_dossier');
        this.searchIndex.set('introduction', 'first_lore_document');
        this.searchIndex.set('overview', 'home');
        this.searchIndex.set('prehistory', 'pre-history');
        this.searchIndex.set('timeline', 'pre-history');
        this.searchIndex.set('era i', 'pre-history');
        this.searchIndex.set('ancient', 'pre-history');
        this.searchIndex.set('temporal', 'pre-history');
    }

    performSearch() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) {
            return;
        }
        
        const query = searchInput.value.toLowerCase().trim();
        
        if (!query) {
            this.showSearchResults([]);
            return;
        }
        
        const results = [];
        
        // Search through index
        for (const [term, contentId] of this.searchIndex.entries()) {
            if (term.includes(query) || query.includes(term)) {
                if (!results.find(r => r.contentId === contentId)) {
                    results.push({
                        contentId: contentId,
                        title: this.getFileName(contentId),
                        fileNumber: this.getFileNumber(contentId),
                        relevance: term === query ? 100 : 50
                    });
                }
            }
        }
        
        // Sort by relevance
        results.sort((a, b) => b.relevance - a.relevance);
        
        this.showSearchResults(results);
    }

    showSearchResults(results) {
        const documentContent = document.getElementById('document-content');
        
        if (results.length === 0) {
            documentContent.innerHTML = `
                <div class="search-results">
                    <div class="document-header">
                        <h1>SEARCH RESULTS</h1>
                        <div class="classification-stamp">
                            <div class="stamp-text">NO RESULTS</div>
                            <div class="stamp-subtext">QUERY RETURNED EMPTY</div>
                        </div>
                    </div>
                    <div class="alert-box">
                        <strong>NOTICE:</strong> No documents found matching your search criteria.
                    </div>
                    <p>The requested information may be:</p>
                    <ul>
                        <li>Classified above your clearance level</li>
                        <li>Stored in a different archive node</li>
                        <li>Subject to active suppression protocols</li>
                        <li>Does not exist in bureau records</li>
                    </ul>
                    <p><em>Try different search terms or browse the archive index.</em></p>
                </div>
            `;
            return;
        }
        
        const resultsHTML = results.map(result => `
            <div class="content-card search-result" data-target="${result.contentId}">
                <h3>📄 ${result.title}</h3>
                <p>Match found in bureau archives.</p>
                <span class="file-tag">${result.fileNumber}</span>
            </div>
        `).join('');
        
        documentContent.innerHTML = `
            <div class="search-results">
                <div class="document-header">
                    <h1>SEARCH RESULTS</h1>
                    <div class="classification-stamp">
                        <div class="stamp-text">${results.length} FOUND</div>
                        <div class="stamp-subtext">DOCUMENTS LOCATED</div>
                    </div>
                </div>
                <div class="alert-box" style="background-color: var(--accent-green);">
                    <strong>SUCCESS:</strong> ${results.length} document(s) found matching your search criteria.
                </div>
                <div class="content-grid">
                    ${resultsHTML}
                </div>
            </div>
        `;
        
        this.updateFileInfo('SEARCH RESULTS', 'Archive Search');
        this.attachContentCardListeners();
    }

    clearSearch() {
        if (this.currentContent === 'search') {
            this.loadContent('home');
        }
    }

    attachContentCardListeners() {
        // Re-attach event listeners for dynamically created content cards
        document.querySelectorAll('.content-card[data-target]').forEach(card => {
            card.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target');
                if (target) {
                    this.loadContent(target);
                    this.setActiveNavLink(document.querySelector(`[data-content="${target}"]`));
                }
            });
        });
    }

    toggleNavSection(header) {
        const targetId = header.getAttribute('data-target');
        const targetList = document.getElementById(targetId);
        const isCurrentlyActive = header.classList.contains('active');

        // First, collapse all sections
        document.querySelectorAll('.nav-title.collapsible').forEach(title => {
            const listId = title.getAttribute('data-target');
            const list = document.getElementById(listId);
            
            if (list) {
                list.classList.add('collapsed');
                title.classList.remove('active');
                
                // Update icon
                const icon = title.querySelector('.nav-icon');
                if (icon) {
                    icon.textContent = '▶';
                }
            }
        });

        // If the clicked section wasn't active, open it
        if (!isCurrentlyActive && targetList) {
            targetList.classList.remove('collapsed');
            header.classList.add('active');
            
            // Update icon
            const icon = header.querySelector('.nav-icon');
            if (icon) {
                icon.textContent = '▼';
            }
        }
    }

    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-overlay');
        
        if (sidebar && overlay) {
            const isActive = sidebar.classList.contains('mobile-active');
            
            if (isActive) {
                this.closeMobileMenu();
            } else {
                sidebar.classList.add('mobile-active');
                overlay.classList.add('active');
                // Prevent body scroll when menu is open (mobile optimization)
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
                
                // Store scroll position for iOS
                this.scrollPosition = window.pageYOffset;
                document.body.style.top = `-${this.scrollPosition}px`;
            }
        }
    }

    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('mobile-active');
            overlay.classList.remove('active');
            
            // Restore body scroll and position
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            
            // Restore scroll position for iOS
            if (this.scrollPosition !== undefined) {
                window.scrollTo(0, this.scrollPosition);
            }
        }
    }
}

// Initialize the archive system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ArchiveSystem();
});

// Add some atmospheric effects
document.addEventListener('DOMContentLoaded', () => {
    // Random flicker effect for classified elements
    setInterval(() => {
        const redactedElements = document.querySelectorAll('.redacted');
        redactedElements.forEach(el => {
            if (Math.random() < 0.1) { // 10% chance
                el.style.opacity = '0.7';
                setTimeout(() => {
                    el.style.opacity = '1';
                }, 100);
            }
        });
    }, 3000);
}); 