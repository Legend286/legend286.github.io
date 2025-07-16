// Content Manager module for Known Unknown Archive
// Handles content loading, navigation, caching, and markdown processing

import { CONFIG } from './config.js';

export class ContentManager {
    constructor(audioSystem) {
        this.currentContent = 'home';
        this.cache = new Map();
        this.contentCache = new Map();
        this.currentTilePage = 0;
        this.homeConfig = null;
        this.audioSystem = audioSystem;
        this.bypassCache = false; // Flag to control cache bypass for development
    }

    async init() {
        // Build navigation from config
        await this.buildNavigation();
        
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
                const sectionId = `nav-section-${sectionIndex}`;
                // Only expand the first section by default, collapse all others
                const isExpanded = sectionIndex === 0;
                
                navigationHTML += `
                    <div class="nav-section">
                        <div class="nav-header ${isExpanded ? 'active' : ''}" data-target="${sectionId}">
                            <span class="nav-title">${section.title}</span>
                            <span class="nav-icon">${isExpanded ? '▼' : '▶'}</span>
                        </div>
                        <ul class="nav-list ${isExpanded ? 'expanded' : 'collapsed'}" id="${sectionId}">
                `;
                
                // Add navigation items
                if (section.items) {
                    section.items.forEach(item => {
                        const isActive = item.contentId === this.currentContent ? 'active' : '';
                        navigationHTML += `
                            <li>
                                <a href="#${item.contentId}" class="nav-link ${isActive}" data-content="${item.contentId}">
                                    ${item.title}
                                </a>
                            </li>
                        `;
                    });
                }
                
                navigationHTML += `
                        </ul>
                    </div>
                `;
            }
            
            // Update navigation
            const navContainer = document.querySelector('.site-navigation .nav-menu');
            if (navContainer) {
                navContainer.innerHTML = navigationHTML;
                
                // Set up navigation event listeners
                this.setupNavigationListeners();
            }
            
            // Store home config for tile generation
            if (config.homeContent) {
                this.homeConfig = config.homeContent;
            }
            
            console.log('✅ Navigation built successfully');
            
        } catch (error) {
            console.error('❌ Navigation build failed:', error);
            this.showError('Failed to load navigation structure');
        }
    }

    setupNavigationListeners() {
        // Navigation toggle functionality
        document.querySelectorAll('.nav-header').forEach(header => {
            header.addEventListener('click', () => this.toggleNavSection(header));
        });

        // Navigation link functionality
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const contentId = link.getAttribute('data-content');
                if (contentId) {
                    this.loadContent(contentId);
                    this.setActiveNavLink(link);
                }
            });
        });
    }

    toggleNavSection(header) {
        const targetId = header.getAttribute('data-target');
        const targetList = document.getElementById(targetId);
        const icon = header.querySelector('.nav-icon');
        
        if (targetList) {
            const isExpanded = targetList.classList.contains('expanded');
            
            // First, collapse all sections (accordion behavior)
            document.querySelectorAll('.nav-header').forEach(otherHeader => {
                const otherTargetId = otherHeader.getAttribute('data-target');
                const otherTargetList = document.getElementById(otherTargetId);
                const otherIcon = otherHeader.querySelector('.nav-icon');
                
                if (otherTargetList) {
                    otherTargetList.classList.remove('expanded');
                    otherTargetList.classList.add('collapsed');
                    otherHeader.classList.remove('active');
                    if (otherIcon) otherIcon.textContent = '▶';
                }
            });
            
            // If the clicked section wasn't expanded, expand it
            if (!isExpanded) {
                targetList.classList.remove('collapsed');
                targetList.classList.add('expanded');
                header.classList.add('active');
                if (icon) icon.textContent = '▼';
            }
        }
    }

    async loadContent(contentId) {
        try {
            this.currentContent = contentId;
            
            // Update audio system's current content
            this.audioSystem.setCurrentContent(contentId);
            
            // Handle special case for home page
            if (contentId === 'home') {
                this.loadHomePage();
                return;
            }
            
            // Check cache first (unless cache is being bypassed)
            if (this.contentCache.has(contentId) && !this.bypassCache) {
                const cachedContent = this.contentCache.get(contentId);
                this.displayContent(cachedContent, contentId);
                return;
            }
            
            // Show loading state
            this.showLoading();
            
            // Fetch content with cache-busting for development
            const cacheBuster = Date.now();
            const response = await fetch(`${contentId}.md?v=${cacheBuster}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load content: ${response.status} ${response.statusText}`);
            }
            
            const markdown = await response.text();
            
            // Cache the content
            this.contentCache.set(contentId, markdown);
            
            // Reset bypass cache flag
            this.bypassCache = false;
            
            // Display content
            this.displayContent(markdown, contentId);
            
        } catch (error) {
            console.error('Content loading error:', error);
            this.showError(`Failed to load content: ${error.message}`);
        }
    }

    // Clear content cache (useful for development)
    clearCache() {
        this.contentCache.clear();
        console.log('🗑️ Content cache cleared');
    }

    // Force reload current content (bypasses cache)
    reloadCurrentContent() {
        this.bypassCache = true;
        this.loadContent(this.currentContent);
        console.log('🔄 Reloading current content (cache bypassed)');
    }

    displayContent(markdown, contentId) {
        const html = this.markdownToHTML(markdown);
        const documentContent = document.getElementById('document-content');
        
        if (documentContent) {
            documentContent.innerHTML = html;
            
            // Set up audio controls after content is displayed
            this.audioSystem.setupAudioControls();
            
            // Update file info
            this.updateFileInfo(
                CONFIG.fileNumbers[contentId] || 'UNKNOWN FILE',
                CONFIG.fileNames[contentId] || 'Unknown Document'
            );
            
            // Update URL without causing navigation
            window.history.pushState(
                { content: contentId },
                `${CONFIG.fileNames[contentId]} // KNOWN UNKNOWN ARCHIVE`,
                `#${contentId}`
            );
            
            // Scroll to top
            document.getElementById('main-container').scrollTop = 0;
        }
    }

    loadHomePage() {
        if (!this.homeConfig) {
            this.showError('Home configuration not loaded');
            return;
        }
        
        const homeHTML = this.generateHomePage();
        const documentContent = document.getElementById('document-content');
        
        if (documentContent) {
            documentContent.innerHTML = homeHTML;
            this.setupHomeTileNavigation();
            
            // Update file info for home
            this.updateFileInfo('ARCHIVE OVERVIEW', 'Archive Overview');
            
            // Update URL
            window.history.pushState(
                { content: 'home' },
                'Known Unknown Archive',
                '#home'
            );
            
            // Scroll to top
            document.getElementById('main-container').scrollTop = 0;
        }
    }

    generateHomePage() {
        const tiles = this.homeConfig.tiles || [];
        const tilesPerPage = CONFIG.ui.tilesPerPage;
        const totalPages = Math.ceil(tiles.length / tilesPerPage);
        const startIndex = this.currentTilePage * tilesPerPage;
        const endIndex = Math.min(startIndex + tilesPerPage, tiles.length);
        const currentTiles = tiles.slice(startIndex, endIndex);
        
        let tilesHTML = '';
        currentTiles.forEach(tile => {
            tilesHTML += `
                <div class="content-tile" data-content="${tile.contentId}">
                    <div class="tile-icon">${tile.icon}</div>
                    <div class="tile-content">
                        <h3>${tile.title}</h3>
                        <p class="tile-description">${tile.description}</p>
                        <div class="tile-meta">
                            <span class="tile-classification">${tile.classification}</span>
                            <span class="tile-date">${tile.date || 'DATE UNKNOWN'}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        let paginationHTML = '';
        if (totalPages > 1) {
            const prevDisabled = this.currentTilePage === 0 ? 'disabled' : '';
            const nextDisabled = this.currentTilePage >= totalPages - 1 ? 'disabled' : '';
            
            paginationHTML = `
                <div class="tile-pagination">
                    <button class="pagination-btn prev-btn" ${prevDisabled}>← PREVIOUS</button>
                    <span class="pagination-info">
                        Page ${this.currentTilePage + 1} of ${totalPages}
                        (${startIndex + 1}-${endIndex} of ${tiles.length})
                    </span>
                    <button class="pagination-btn next-btn" ${nextDisabled}>NEXT →</button>
                </div>
            `;
        }
        
        return `
            <div class="home-content">
                <div class="classification-header">
                    <div class="classification-badge">ARCHIVE OVERVIEW</div>
                    <div class="file-number">MAIN INDEX</div>
                </div>
                
                <h1>🏛️ KNOWN UNKNOWN ARCHIVE</h1>
                
                <div class="archive-intro">
                    <p><strong>Welcome to the Known Unknown Archive.</strong></p>
                    <p>This repository contains classified documentation regarding anomalous entities, 
                    incidents, and phenomena under Bureau jurisdiction. Access is restricted to personnel 
                    with appropriate clearance levels.</p>
                    
                    <div class="clearance-notice">
                        <p><strong>⚠️ SECURITY NOTICE:</strong> All access is logged and monitored. 
                        Unauthorized distribution of classified materials is prohibited under 
                        Federal Anomaly Security Act Section 12-B.</p>
                    </div>
                </div>
                
                <h2>📋 AVAILABLE DOCUMENTATION</h2>
                
                <div class="content-grid">
                    ${tilesHTML}
                </div>
                
                ${paginationHTML}
                
                <div class="archive-footer">
                    <p><em>For additional resources, consult the navigation menu or use the search function.</em></p>
                    <p class="version-info">Archive Version 2.1.7 // Last Updated: ${new Date().toISOString().split('T')[0]}</p>
                </div>
            </div>
        `;
    }

    setupHomeTileNavigation() {
        // Tile click handlers
        document.querySelectorAll('.content-tile').forEach(tile => {
            tile.addEventListener('click', () => {
                const contentId = tile.getAttribute('data-content');
                if (contentId) {
                    this.loadContent(contentId);
                }
            });
        });
        
        // Pagination handlers
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentTilePage > 0) {
                    this.currentTilePage--;
                    this.loadHomePage();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil((this.homeConfig.tiles || []).length / CONFIG.ui.tilesPerPage);
                if (this.currentTilePage < totalPages - 1) {
                    this.currentTilePage++;
                    this.loadHomePage();
                }
            });
        }
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
        
        // Process audio clips first (before other replacements that might interfere)
        html = this.audioSystem.processAudioClips(html);
        
        // Auto-hyperlinking for cross-references
        html = this.addAutoHyperlinks(html);
        
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Tables
        html = this.processMarkdownTables(html);
        
        // Improved blockquotes - group consecutive > lines
        html = this.processBlockquotes(html);
        
        // Code blocks
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Lists
        html = html.replace(/^\- (.*$)/gm, '<li>$1</li>');
        html = html.replace(/^(\d+)\. (.*$)/gm, '<li>$1. $2</li>');
        
        // Wrap consecutive <li> elements in <ul>
        html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
            const items = match.match(/<li>.*?<\/li>/g);
            const isNumbered = items && items[0] && items[0].includes('.');
            const tag = isNumbered ? 'ol' : 'ul';
            return `<${tag}>${match}</${tag}>`;
        });
        
        // Horizontal rules
        html = html.replace(/^---$/gm, '<hr>');
        
        // Paragraphs
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        
        // Clean up empty paragraphs and fix formatting
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>(<h[1-6]>)/g, '$1');
        html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
        html = html.replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/g, '$1');
        html = html.replace(/<p>(<pre>[\s\S]*?<\/pre>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>[\s\S]*?<\/ul>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ol>[\s\S]*?<\/ol>)<\/p>/g, '$1');
        html = html.replace(/<p>(<table class="markdown-table">[\s\S]*?<\/table>)<\/p>/g, '$1');
        
        return html;
    }

    processBlockquotes(html) {
        const lines = html.split('\n');
        const result = [];
        let currentBlockquote = [];
        let inBlockquote = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isQuoteLine = /^>\s/.test(line);
            
            if (isQuoteLine) {
                // Extract the content after the >
                const quoteContent = line.replace(/^>\s*/, '');
                currentBlockquote.push(quoteContent);
                inBlockquote = true;
            } else {
                // If we were in a blockquote and hit a non-quote line, close it
                if (inBlockquote && currentBlockquote.length > 0) {
                    result.push(`<blockquote>${currentBlockquote.join('<br>')}</blockquote>`);
                    currentBlockquote = [];
                    inBlockquote = false;
                }
                result.push(line);
            }
        }
        
        // Handle any remaining blockquote at the end
        if (inBlockquote && currentBlockquote.length > 0) {
            result.push(`<blockquote>${currentBlockquote.join('<br>')}</blockquote>`);
        }
        
        return result.join('\n');
    }

    addAutoHyperlinks(html) {
        for (const [pattern, contentId] of Object.entries(CONFIG.linkPatterns)) {
            const escapedPattern = this.escapeRegex(pattern);
            const regex = new RegExp(`\\b${escapedPattern}\\b`, 'gi');
            
            html = html.replace(regex, (match) => {
                // Don't create links to the current file from within itself
                if (contentId === this.currentContent) {
                    return match;
                }
                
                // Don't create links inside existing HTML tags
                const beforeMatch = html.substring(0, html.indexOf(match));
                const openTags = (beforeMatch.match(/</g) || []).length;
                const closeTags = (beforeMatch.match(/>/g) || []).length;
                
                if (openTags > closeTags) {
                    return match; // We're inside a tag, don't modify
                }
                
                return `<a href="#${contentId}" class="auto-link" data-content="${contentId}">${match}</a>`;
            });
        }
        
        return html;
    }

    processMarkdownTables(html) {
        const tableRegex = /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)*)/g;
        
        return html.replace(tableRegex, (match, headerRow, bodyRows) => {
            const headers = headerRow.split('|').map(h => h.trim()).filter(h => h);
            const rows = bodyRows.trim().split('\n').map(row => 
                row.split('|').map(cell => cell.trim()).filter(cell => cell)
            );
            
            let tableHTML = '<table class="markdown-table"><thead><tr>';
            headers.forEach(header => {
                tableHTML += `<th>${header}</th>`;
            });
            tableHTML += '</tr></thead><tbody>';
            
            rows.forEach(row => {
                tableHTML += '<tr>';
                row.forEach(cell => {
                    tableHTML += `<td>${cell}</td>`;
                });
                tableHTML += '</tr>';
            });
            
            tableHTML += '</tbody></table>';
            return tableHTML;
        });
    }

    // Helper function to escape regex special characters
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    updateFileInfo(fileNumber, fileName) {
        const fileNumberEl = document.getElementById('file-number');
        if (fileNumberEl) {
            fileNumberEl.textContent = fileNumber;
        }
        // Update page title
        document.title = `${fileName} // KNOWN UNKNOWN ARCHIVE`;
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

    showLoading() {
        const documentContent = document.getElementById('document-content');
        if (documentContent) {
            documentContent.innerHTML = `
                <div class="loading-state">
                    <div class="classification-header">
                        <div class="classification-badge">LOADING</div>
                        <div class="file-number">ACCESSING...</div>
                    </div>
                    <div class="loading-content">
                        <h2>🔄 ACCESSING CLASSIFIED FILES...</h2>
                        <div class="loading-bar">
                            <div class="loading-progress"></div>
                        </div>
                        <p>Retrieving document from secure archive...</p>
                    </div>
                </div>
            `;
        }
    }

    showError(message) {
        const documentContent = document.getElementById('document-content');
        if (documentContent) {
            documentContent.innerHTML = `
                <div class="error-state">
                    <div class="classification-header">
                        <div class="classification-badge error">ACCESS DENIED</div>
                        <div class="stamp-container">
                            <div class="security-stamp">
                                <div class="stamp-text">CLASSIFIED</div>
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
                </div>
            `;
        }
    }
} 