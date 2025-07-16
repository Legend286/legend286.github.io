// Known Unknown Archive - JavaScript Controller
// Handles dynamic content loading, navigation, and search

class ArchiveSystem {
    constructor() {
        this.currentContent = 'home';
        this.cache = new Map();
        this.contentCache = new Map();
        this.searchIndex = new Map();
        this.currentTilePage = 0;
        this.tilesPerPage = 6;
        this.homeConfig = null;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.updateCurrentDate();
        
        // Build navigation from config
        await this.buildNavigation();
        
        // Build search index asynchronously
        await this.buildSearchIndex();
        
        // Load initial content
        this.loadContent('home');
    }

    async buildNavigation() {
        try {
            // Load content configuration
            const configResponse = await fetch('content-config.json');
            
            if (!configResponse.ok) {
                throw new Error(`Failed to load config: ${configResponse.status}`);
            }
            
            const config = await configResponse.json();
            
            if (!config || !config.navigation || !config.navigation.sections) {
                throw new Error('Invalid config structure - missing navigation.sections');
            }
            
            // Build navigation HTML
            let navigationHTML = '';
            
            for (let sectionIndex = 0; sectionIndex < config.navigation.sections.length; sectionIndex++) {
                const section = config.navigation.sections[sectionIndex];
                if (!section || !section.items || !Array.isArray(section.items)) {
                    console.warn(`Invalid section structure for ${section?.title || 'unknown'}`);
                    continue;
                }
                
                // Create section ID from title
                const sectionId = section.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                
                // Determine if section should be expanded by default (first section)
                const isExpanded = sectionIndex === 0;
                const iconClass = isExpanded ? '▼' : '▶';
                const listClass = isExpanded ? 'nav-list' : 'nav-list collapsed';
                const headerClass = isExpanded ? 'nav-title collapsible active' : 'nav-title collapsible';
                
                navigationHTML += `
                    <div class="nav-section">
                        <h3 class="${headerClass}" data-target="${sectionId}">
                            <span class="nav-icon">${iconClass}</span>
                            ${section.title}
                        </h3>
                        <ul class="${listClass}" id="${sectionId}">
                `;
                
                // Add navigation items
                for (const item of section.items) {
                    if (!item) continue;
                    
                    if (item.disabled) {
                        // Disabled item with description
                        navigationHTML += `
                            <li>
                                <a href="#" class="nav-link disabled">
                                    ${item.title}
                                    ${item.description ? `<span class="nav-description">${item.description}</span>` : ''}
                                </a>
                            </li>
                        `;
                    } else if (item.contentId) {
                        // Active navigation item
                        const activeClass = item.active ? ' active' : '';
                        navigationHTML += `
                            <li><a href="#" data-content="${item.contentId}" class="nav-link${activeClass}">${item.title}</a></li>
                        `;
                    }
                }
                
                navigationHTML += `
                        </ul>
                    </div>
                `;
            }
            
            // Insert the generated navigation
            const dynamicNav = document.getElementById('dynamic-navigation');
            if (dynamicNav) {
                dynamicNav.innerHTML = navigationHTML;
            }
            
        } catch (error) {
            console.error('Error building navigation:', error);
            // Fallback to basic navigation
            this.buildFallbackNavigation();
        }
    }

    buildFallbackNavigation() {
        const fallbackHTML = `
            <div class="nav-section">
                <h3 class="nav-title collapsible active" data-target="archive-index">
                    <span class="nav-icon">▼</span>
                    ARCHIVE INDEX
                </h3>
                <ul class="nav-list" id="archive-index">
                    <li><a href="#" data-content="home" class="nav-link active">Home // Overview</a></li>
                    <li><a href="#" data-content="known_unknown_lore" class="nav-link">Main Archive</a></li>
                </ul>
            </div>
        `;
        
        const dynamicNav = document.getElementById('dynamic-navigation');
        if (dynamicNav) {
            dynamicNav.innerHTML = fallbackHTML;
        }
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
        try {
            // Show loading screen
            this.showLoading();
            
            let content = '';
            
            // Handle special case for home content
            if (contentId === 'home') {
                // Show home content directly without markdown loading
                setTimeout(async () => {
                    await this.showHomeContent();
                    this.updateFileInfo(this.getFileNumber(contentId), this.getFileName(contentId));
                    this.setActiveNavLink(document.querySelector(`[data-content="${contentId}"]`));
                    this.currentContent = contentId;
                }, 4100); // Same timing as other content for consistency
                return;
            }
            
            // Check cache first
            if (this.cache.has(contentId)) {
                content = this.cache.get(contentId);
            } else {
                // Load from markdown file
                const response = await fetch(`${contentId}.md`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const markdown = await response.text();
                content = this.markdownToHTML(markdown);
                
                // Cache the processed content
                this.cache.set(contentId, content);
            }
            
            // Simulate some loading time for effect
            setTimeout(() => {
                this.displayContent(content);
                this.updateFileInfo(this.getFileNumber(contentId), this.getFileName(contentId));
                this.setActiveNavLink(document.querySelector(`[data-content="${contentId}"]`));
                this.currentContent = contentId;
            }, 4100); // Timing: 1.3s (text) + 1.8s (dots: 6×300ms) + 0.6s (OK) + 0.4s buffer = 4.1s
            
        } catch (error) {
            console.error('Error loading content:', error);
            this.showError(`Failed to load content: ${contentId}`);
        }
    }

    async showHomeContent() {
        try {
            // Load config if not already loaded
            if (!this.homeConfig) {
                const configResponse = await fetch('content-config.json');
                if (!configResponse.ok) {
                    throw new Error('Failed to load config');
                }
                const config = await configResponse.json();
                this.homeConfig = config.homeContent;
            }
            
            // Get tiles for current page
            const allTiles = this.homeConfig.contentCards || [];
            const totalPages = Math.ceil(allTiles.length / this.tilesPerPage);
            const startIndex = this.currentTilePage * this.tilesPerPage;
            const endIndex = startIndex + this.tilesPerPage;
            const currentTiles = allTiles.slice(startIndex, endIndex);
            
            const documentContent = document.getElementById('document-content');
            
            // Generate tiles HTML
            const tilesHTML = currentTiles.map(card => `
                <div class="content-card" data-target="${card.target}">
                    <h3>${card.title}</h3>
                    <p>${card.description}</p>
                    <span class="file-tag">${card.fileTag}</span>
                </div>
            `).join('');
            
            // Generate pagination controls
            const paginationHTML = totalPages > 1 ? `
                <div class="tile-pagination">
                    <button class="pagination-btn prev" ${this.currentTilePage === 0 ? 'disabled' : ''} 
                            onclick="archiveSystem.changeTilePage(-1)">
                        ◀ PREVIOUS
                    </button>
                    <span class="page-indicator">
                        PAGE ${this.currentTilePage + 1} OF ${totalPages}
                    </span>
                    <button class="pagination-btn next" ${this.currentTilePage >= totalPages - 1 ? 'disabled' : ''} 
                            onclick="archiveSystem.changeTilePage(1)">
                        NEXT ▶
                    </button>
                </div>
            ` : '';
            
            // Generate recent activity from config
            const recentActivityHTML = this.homeConfig.recentActivity?.map(activity => `
                <div class="log-entry">
                    <span class="log-date">${activity.date}</span>
                    <span class="log-action">${activity.action}</span>
                    <span class="log-file">${activity.file}</span>
                </div>
            `).join('') || '';
            
            // Create complete home content
            const homeHTML = `
                <div class="home-content">
                    <div class="document-header">
                        <h1>${this.homeConfig.welcomeMessage || 'WELCOME TO THE KNOWN UNKNOWN ARCHIVE'}</h1>
                        <div class="classification-stamp">
                            <div class="stamp-text">DECLASSIFIED</div>
                            <div class="stamp-subtext">PUBLIC ORIENTATION MATERIALS</div>
                        </div>
                    </div>

                    <div class="alert-box">
                        <strong>SECURITY NOTICE:</strong> ${this.homeConfig.securityNotice || 'This archive contains classified information.'}
                    </div>

                    <section class="overview-section">
                        <h2>ARCHIVE CONTENTS</h2>
                        <div class="content-grid" id="tiles-container">
                            ${tilesHTML}
                        </div>
                        ${paginationHTML}
                    </section>

                    <section class="recent-activity">
                        <h2>RECENT ARCHIVE UPDATES</h2>
                        <div class="activity-log">
                            ${recentActivityHTML}
                        </div>
                    </section>
                </div>
            `;
            
            // Insert the home content with animation
            documentContent.innerHTML = homeHTML;
            
            // Add animation class after a short delay
            setTimeout(() => {
                const tiles = document.querySelectorAll('.content-card');
                tiles.forEach((tile, index) => {
                    setTimeout(() => {
                        tile.classList.add('tile-animate-in');
                    }, index * 100); // Stagger animation
                });
            }, 100);
            
            // Re-attach event listeners for content cards
            this.attachContentCardListeners();
            
        } catch (error) {
            console.error('Error loading home content:', error);
            this.showFallbackHomeContent();
        }
    }
    
    changeTilePage(direction) {
        const allTiles = this.homeConfig?.contentCards || [];
        const totalPages = Math.ceil(allTiles.length / this.tilesPerPage);
        
        // Update current page
        this.currentTilePage += direction;
        
        // Clamp to valid range
        this.currentTilePage = Math.max(0, Math.min(this.currentTilePage, totalPages - 1));
        
        // Animate transition
        const tilesContainer = document.getElementById('tiles-container');
        if (tilesContainer) {
            tilesContainer.classList.add('tiles-transitioning');
            
            setTimeout(() => {
                this.showHomeContent(); // Reload with new page
            }, 300); // Match transition duration in CSS
        }
    }
    
    showFallbackHomeContent() {
        const documentContent = document.getElementById('document-content');
        
        // Fallback content if config fails
        const fallbackHTML = `
            <div class="home-content">
                <div class="document-header">
                    <h1>WELCOME TO THE KNOWN UNKNOWN ARCHIVE</h1>
                    <div class="classification-stamp">
                        <div class="stamp-text">DECLASSIFIED</div>
                        <div class="stamp-subtext">PUBLIC ORIENTATION MATERIALS</div>
                    </div>
                </div>
                <div class="alert-box">
                    <strong>ERROR:</strong> Failed to load archive configuration. Displaying fallback content.
                </div>
                <section class="overview-section">
                    <h2>ARCHIVE CONTENTS</h2>
                    <div class="content-grid">
                        <div class="content-card" data-target="known_unknown_lore">
                            <h3>🗂️ MAIN ARCHIVE</h3>
                            <p>Complete lore dossier including factions, entities, timeline, and world overview.</p>
                            <span class="file-tag">COMPREHENSIVE</span>
                        </div>
                    </div>
                </section>
            </div>
        `;
        
        documentContent.innerHTML = fallbackHTML;
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
        const dotSequence = ['.', '..', '...', '.', '..', '...'];
        let currentText = '';
        let index = 0;
        let dotIndex = 0;
        let isTypingDots = false;
        
        const typeInterval = setInterval(() => {
            if (!isTypingDots && index < baseText.length) {
                // Type the main text
                currentText += baseText[index];
                loadingTextEl.textContent = currentText + (Math.random() > 0.5 ? '_' : '');
                index++;
                
                // Switch to dots timing after main text
                if (index >= baseText.length) {
                    setTimeout(() => {
                        isTypingDots = true;
                        loadingTextEl.textContent = baseText; // Remove cursor
                        
                        // Start slower dot sequence animation
                        const dotInterval = setInterval(() => {
                            if (dotIndex < dotSequence.length) {
                                loadingTextEl.textContent = baseText + dotSequence[dotIndex];
                                dotIndex++;
                            } else {
                                clearInterval(dotInterval);
                                
                                // Show "OK" for 0.6 seconds before continuing
                                loadingTextEl.textContent = baseText + ' OK';
                                setTimeout(() => {
                                    // This timeout allows the loading to complete
                                    // The actual content loading will happen in loadContent
                                }, 600); // Show OK for 0.6 seconds (doubled from 0.3)
                            }
                        }, 300); // Slower: 300ms for each dot step (was 175ms)
                    }, 100);
                    
                    clearInterval(typeInterval);
                }
            }
        }, 80); // Keep main text typing speed the same
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
            'home': 'ARCHIVE OVERVIEW',
            'first_lore_document': 'FILE 0001',
            'known_unknown_lore': 'MAIN ARCHIVE',
            'redwood_deep_dossier': 'FILE 0024',
            'pre-history': 'ERA I TIMELINE',
            'early-history': 'ERA II TIMELINE',
            '20th-century-history-pt1': 'ERA III TIMELINE',
            'table-test': 'TABLE TEST'
        };
        return fileNumbers[contentId] || 'UNKNOWN FILE';
    }

    getFileName(contentId) {
        const fileNames = {
            'home': 'Archive Overview',
            'first_lore_document': 'Introductory Dossier',
            'known_unknown_lore': 'Known Unknown Lore',
            'redwood_deep_dossier': 'Redwood Deep Site Dossier',
            'pre-history': 'Prehistory Dossier',
            'early-history': 'Early History Dossier',
            '20th-century-history-pt1': '20th Century History - Part 1',
            'table-test': 'Table Functionality Test'
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
        
        // Process tables BEFORE blockquotes and paragraphs
        html = this.parseMarkdownTables(html);
        
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
        html = html.replace(/<p>(<table>.*?<\/table>)<\/p>/gs, '$1');
        
        return html;
    }

    parseMarkdownTables(markdown) {
        // Split content by lines for table processing
        const lines = markdown.split('\n');
        const result = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i].trim();
            
            // Check if current line looks like a table header (contains pipes)
            if (line.includes('|') && line.split('|').length >= 3) {
                // Look ahead to see if next line is a separator (contains dashes and pipes)
                const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
                
                if (nextLine.includes('|') && nextLine.includes('-')) {
                    // This is likely a table, parse it
                    const tableData = this.parseTableBlock(lines, i);
                    result.push(tableData.html);
                    i = tableData.nextIndex;
                } else {
                    result.push(lines[i]);
                    i++;
                }
            } else {
                result.push(lines[i]);
                i++;
            }
        }

        return result.join('\n');
    }

    parseTableBlock(lines, startIndex) {
        const tableLines = [];
        let currentIndex = startIndex;
        
        // Collect all consecutive table lines
        while (currentIndex < lines.length) {
            const line = lines[currentIndex].trim();
            if (line.includes('|')) {
                tableLines.push(line);
                currentIndex++;
            } else if (line === '') {
                // Empty line might be part of table formatting
                currentIndex++;
                continue;
            } else {
                // Non-table line, stop collecting
                break;
            }
        }

        // Parse the collected table lines
        let html = '<table class="markdown-table">\n';
        let headerProcessed = false;
        let separatorFound = false;

        for (let i = 0; i < tableLines.length; i++) {
            const line = tableLines[i];
            
            // Skip separator lines (contain only dashes, pipes, and spaces)
            if (line.match(/^[\|\-\s:]+$/)) {
                separatorFound = true;
                continue;
            }

            // Parse table row
            const cells = line.split('|')
                .map(cell => cell.trim())
                .filter(cell => cell !== ''); // Remove empty cells from start/end

            if (cells.length === 0) continue;

            // Determine if this is header row (first row before separator)
            const isHeader = !headerProcessed && !separatorFound;
            const tag = isHeader ? 'th' : 'td';
            const rowClass = isHeader ? 'table-header' : 'table-row';

            html += `  <tr class="${rowClass}">\n`;
            cells.forEach(cell => {
                // Process basic markdown within cells
                let cellContent = cell
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code>$1</code>');
                
                html += `    <${tag}>${cellContent}</${tag}>\n`;
            });
            html += '  </tr>\n';

            if (isHeader) headerProcessed = true;
        }

        html += '</table>';

        return {
            html: html,
            nextIndex: currentIndex
        };
    }

    async buildSearchIndex() {
        // Clear existing index
        this.searchIndex.clear();
        this.contentCache = new Map();
        
        try {
            // Load content configuration
            const configResponse = await fetch('content-config.json');
            
            if (!configResponse.ok) {
                throw new Error(`Failed to load config: ${configResponse.status}`);
            }
            
            const config = await configResponse.json();
            
            if (!config || !config.navigation || !config.navigation.sections) {
                throw new Error('Invalid config structure - missing navigation.sections');
            }
            
            // Build search index from configuration
            for (const section of config.navigation.sections) {
                if (!section || !section.items || !Array.isArray(section.items)) {
                    console.warn(`Invalid section structure for ${section?.title || 'unknown'}`);
                    continue;
                }
                
                for (const item of section.items) {
                    if (item && item.contentId && !item.disabled) {
                        // Add title and variations
                        if (item.title) {
                            this.addToSearchIndex(item.title.toLowerCase(), item.contentId);
                        }
                        this.addToSearchIndex(item.contentId.replace(/-/g, ' ').toLowerCase(), item.contentId);
                        
                        // Load and index document content
                        await this.indexDocumentContent(item.contentId);
                    }
                }
            }
            
            // Add keyword mappings from config
            if (config.searchIndex && config.searchIndex.terms && typeof config.searchIndex.terms === 'object') {
                for (const [keyword, contentId] of Object.entries(config.searchIndex.terms)) {
                    if (keyword && contentId) {
                        this.addToSearchIndex(keyword.toLowerCase(), contentId);
                    }
                }
            }
            
        } catch (error) {
            console.error('Error building search index:', error);
            this.buildFallbackSearchIndex();
        }
    }

    async indexDocumentContent(contentId) {
        try {
            // Skip home content since it's generated dynamically
            if (contentId === 'home') {
                // Add some basic search terms for home content
                const homeTerms = ['overview', 'archive', 'bureau', 'classified', 'home', 'introduction'];
                homeTerms.forEach(term => {
                    this.addToSearchIndex(term, contentId);
                });
                return;
            }
            
            // Skip if already cached
            if (this.contentCache.has(contentId)) {
                return;
            }
            
            // Try to load as markdown first
            let content = '';
            try {
                const response = await fetch(`${contentId}.md`);
                if (response.ok) {
                    const markdown = await response.text();
                    content = markdown;
                    this.contentCache.set(contentId, { type: 'markdown', content: markdown });
                }
            } catch (e) {
                // If markdown fails, try HTML
                try {
                    const response = await fetch(`${contentId}.html`);
                    if (response.ok) {
                        const html = await response.text();
                        content = html;
                        this.contentCache.set(contentId, { type: 'html', content: html });
                    }
                } catch (e2) {
                    // Content not found, which is okay for some items
                    return;
                }
            }
            
            if (content) {
                // Extract text content for indexing
                const textContent = this.extractTextFromContent(content);
                const words = textContent.toLowerCase()
                    .replace(/[^\w\s]/g, ' ')
                    .split(/\s+/)
                    .filter(word => word.length > 2); // Only index words longer than 2 characters
                
                // Add unique words to search index
                const uniqueWords = [...new Set(words)];
                uniqueWords.forEach(word => {
                    this.addToSearchIndex(word, contentId);
                });
            }
            
        } catch (error) {
            console.error(`Error indexing content for ${contentId}:`, error);
        }
    }

    extractTextFromContent(content) {
        // Remove markdown/HTML formatting for text extraction
        return content
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/`[^`]+`/g, '') // Remove inline code
            .replace(/#+ /g, '') // Remove headers
            .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
            .replace(/\*([^*]+)\*/g, '$1') // Remove italic
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
            .replace(/[|]/g, ' ') // Replace table pipes with spaces
            .replace(/[-=]{3,}/g, '') // Remove separator lines
            .replace(/^\s*[>]/gm, '') // Remove blockquote markers
            .replace(/^\s*[-*+]/gm, '') // Remove list markers
            .replace(/\n+/g, ' ') // Replace newlines with spaces
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    addToSearchIndex(term, contentId) {
        if (!this.searchIndex.has(term)) {
            this.searchIndex.set(term, []);
        }
        const contentIds = this.searchIndex.get(term);
        if (!contentIds.includes(contentId)) {
            contentIds.push(contentId);
        }
    }

    buildFallbackSearchIndex() {
        // Fallback search index if config loading fails
        const fallbackMappings = {
            'home': ['overview', 'introduction', 'bureau', 'archive'],
            'first_lore_document': ['introduction', 'lore', 'document', 'file', '0001'],
            'known_unknown_lore': ['bureau', 'riftborn', 'lost kin', 'unbound', 'lore', 'main'],
            'redwood_deep_dossier': ['redwood', 'deep', 'site', 'dossier', 'birchskin', 'doorlicker', 'forest'],
            'pre-history': ['prehistory', 'timeline', 'era', 'ancient', 'temporal', 'tablets'],
            'early-history': ['early', 'history', 'era ii', 'obscured', 'plague', 'roanoke', 'erasure', 'memetic'],
            '20th-century-history-pt1': ['20th', 'century', 'era iii', 'veil', 'tesla', 'verdun', 'bureau', 'industrial'],
            'table-test': ['table', 'test', 'demo', 'classification', 'entity']
        };
        
        for (const [contentId, terms] of Object.entries(fallbackMappings)) {
            terms.forEach(term => {
                this.addToSearchIndex(term.toLowerCase(), contentId);
            });
        }
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
        
        const results = new Map(); // Use Map to avoid duplicates
        const queryWords = query.split(/\s+/).filter(word => word.length > 0);
        
        // Search through index
        for (const [term, contentIds] of this.searchIndex.entries()) {
            let relevanceScore = 0;
            
            // Exact match (highest relevance)
            if (term === query) {
                relevanceScore = 100;
            }
            // Term contains query or query contains term
            else if (term.includes(query)) {
                relevanceScore = 80;
            }
            else if (query.includes(term)) {
                relevanceScore = 70;
            }
            // Individual word matches
            else {
                const wordMatches = queryWords.filter(word => 
                    term.includes(word) || word.includes(term)
                ).length;
                if (wordMatches > 0) {
                    relevanceScore = 30 + (wordMatches * 10);
                }
            }
            
            if (relevanceScore > 0) {
                contentIds.forEach(contentId => {
                    if (!results.has(contentId) || results.get(contentId).relevance < relevanceScore) {
                        results.set(contentId, {
                            contentId: contentId,
                            title: this.getFileName(contentId),
                            fileNumber: this.getFileNumber(contentId),
                            relevance: relevanceScore,
                            matchedTerm: term
                        });
                    }
                });
            }
        }
        
        // Convert to array and sort by relevance
        const sortedResults = Array.from(results.values())
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, 10); // Limit to top 10 results
        
        this.showSearchResults(sortedResults, query);
    }

    showSearchResults(results, query = '') {
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
                        <strong>NOTICE:</strong> No documents found matching "${query}".
                    </div>
                    <p>The requested information may be:</p>
                    <ul>
                        <li>Classified above your clearance level</li>
                        <li>Stored in a different archive node</li>
                        <li>Subject to active suppression protocols</li>
                        <li>Does not exist in bureau records</li>
                    </ul>
                    <p><em>Try different search terms or browse the archive index.</em></p>
                    <div class="search-suggestions">
                        <h3>Suggested Terms:</h3>
                        <div class="suggestion-tags">
                            <span class="search-tag" onclick="archiveSystem.searchForTerm('bureau')">bureau</span>
                            <span class="search-tag" onclick="archiveSystem.searchForTerm('riftborn')">riftborn</span>
                            <span class="search-tag" onclick="archiveSystem.searchForTerm('redwood')">redwood</span>
                            <span class="search-tag" onclick="archiveSystem.searchForTerm('timeline')">timeline</span>
                            <span class="search-tag" onclick="archiveSystem.searchForTerm('entity')">entity</span>
                        </div>
                    </div>
                </div>
            `;
            this.updateFileInfo('SEARCH RESULTS', 'Archive Search');
            this.currentContent = 'search';
            return;
        }
        
        const resultsHTML = results.map((result, index) => `
            <div class="content-card search-result" data-target="${result.contentId}">
                <div class="search-result-header">
                    <h3>📄 ${result.title}</h3>
                    <span class="relevance-score">Relevance: ${result.relevance}%</span>
                </div>
                <p>Match found in bureau archives.</p>
                <div class="search-result-meta">
                    <span class="file-tag">${result.fileNumber}</span>
                    ${result.matchedTerm ? `<span class="match-term">Matched: "${result.matchedTerm}"</span>` : ''}
                </div>
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
                    <strong>SUCCESS:</strong> ${results.length} document(s) found matching "${query}".
                </div>
                <div class="search-info">
                    <p><strong>Query:</strong> "${query}" | <strong>Results:</strong> ${results.length} | <strong>Search completed in:</strong> <0.1s</p>
                </div>
                <div class="content-grid">
                    ${resultsHTML}
                </div>
            </div>
        `;
        
        this.updateFileInfo('SEARCH RESULTS', 'Archive Search');
        this.currentContent = 'search';
        this.attachContentCardListeners();
    }

    searchForTerm(term) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = term;
            this.performSearch();
        }
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
let archiveSystem;
document.addEventListener('DOMContentLoaded', async () => {
    archiveSystem = new ArchiveSystem();
    // Make it globally accessible for search suggestions and pagination
    window.archiveSystem = archiveSystem;
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