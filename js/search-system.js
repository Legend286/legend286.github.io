// Search System module for Known Unknown Archive
// Handles search functionality, indexing, and hidden unlock mechanisms

import { CONFIG } from './config.js';

export class SearchSystem {
    constructor(contentManager) {
        this.searchIndex = new Map();
        this.contentManager = contentManager;
        this.searchInput = null;
        this.searchResults = null;
        this.isSearchActive = false;
        this.currentQuery = '';
        this.searchTimeout = null;
        this.mirrorwitchEncounter = null; // Will be set by main system
    }

    setMirrorwitchEncounter(encounter) {
        this.mirrorwitchEncounter = encounter;
    }

    async init() {
        await this.buildSearchIndex();
        this.setupSearchListeners();
        console.log('✅ Search System initialized');
    }

    async buildSearchIndex() {
        // Build search index from terms in config
        for (const [contentId, terms] of Object.entries(CONFIG.searchTerms)) {
            for (const term of terms) {
                const normalizedTerm = term.toLowerCase();
                
                if (!this.searchIndex.has(normalizedTerm)) {
                    this.searchIndex.set(normalizedTerm, new Set());
                }
                
                this.searchIndex.get(normalizedTerm).add(contentId);
            }
        }

        console.log(`🔍 Search index built with ${this.searchIndex.size} terms`);
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
        
        // Check for Mirrorwitch encounter trigger
        if (CONFIG.unlockPhrases['mirrorwitch-encounter'] && 
            CONFIG.unlockPhrases['mirrorwitch-encounter'].includes(query)) {
            this.triggerMirrorwitchEncounter();
            return;
        }
        
        // Check for other unlock phrases
        for (const [unlockType, phrases] of Object.entries(CONFIG.unlockPhrases)) {
            if (phrases.includes(query)) {
                this.handleUnlock(unlockType);
                return;
            }
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
                            title: CONFIG.fileNames[contentId] || contentId,
                            fileNumber: CONFIG.fileNumbers[contentId] || 'UNKNOWN',
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
            .slice(0, CONFIG.ui.maxSearchResults);
        
        this.showSearchResults(sortedResults, query);
    }

    triggerMirrorwitchEncounter() {
        if (!this.mirrorwitchEncounter) {
            console.error('❌ Mirrorwitch encounter system not available');
            return;
        }
        
        // Clear search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        console.log('🪞 MIRRORWITCH ENCOUNTER TRIGGERED');
        console.log('🔍 Ukrainian phrase detected: "Я БАЧУ ТЕБЕ ІЗ СЕРЕДИНИ"');
        
        // Start the encounter
        this.mirrorwitchEncounter.startEncounter();
        
        // Update URL to reflect the encounter
        window.history.pushState(
            { content: 'mirrorwitch-encounter' },
            'Mirrorwitch Encounter // KNOWN UNKNOWN ARCHIVE',
            '#mirrorwitch-encounter'
        );
    }

    handleUnlock(unlockType) {
        // Clear search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        console.log(`🔓 Unlock triggered: ${unlockType}`);
        
        // Handle different unlock types
        switch (unlockType) {
            case 'garry-the-cat':
                this.contentManager.loadContent('garry-the-cat');
                break;
            default:
                console.log(`Unknown unlock type: ${unlockType}`);
        }
    }

    showSearchResults(results, query = '') {
        const documentContent = document.getElementById('document-content');
        
        if (results.length === 0) {
            documentContent.innerHTML = `
                <div class="search-results">
                    <div class="classification-header">
                        <div class="classification-badge">SEARCH RESULTS</div>
                        <div class="file-number">NO MATCHES FOUND</div>
                    </div>
                    <div class="search-no-results">
                        <h2>⚠️ NO DOCUMENTS MATCH YOUR QUERY</h2>
                        <p><strong>Search term:</strong> "${query}"</p>
                        <p>No files in the archive match your search criteria. This could indicate:</p>
                        <ul>
                            <li>The information is classified above your clearance level</li>
                            <li>Files have been redacted or removed</li>
                            <li>The search term doesn't exist in our indexed documents</li>
                        </ul>
                        <p><em>Try different keywords or browse the navigation menu.</em></p>
                    </div>
                </div>
            `;
            return;
        }

        let resultsHTML = `
            <div class="search-results">
                <div class="classification-header">
                    <div class="classification-badge">SEARCH RESULTS</div>
                    <div class="file-number">${results.length} MATCH${results.length !== 1 ? 'ES' : ''} FOUND</div>
                </div>
                <h2>🔍 Search Results for "${query}"</h2>
                <div class="search-results-list">
        `;

        results.forEach((result, index) => {
            resultsHTML += `
                <div class="search-result-item" data-content-id="${result.contentId}">
                    <div class="result-number">${index + 1}.</div>
                    <div class="result-info">
                        <div class="result-title">
                            <strong>${result.title}</strong>
                            <span class="result-file-number">[${result.fileNumber}]</span>
                        </div>
                        <div class="result-relevance">
                            Relevance: ${result.relevance}% • Matched: "${result.matchedTerm}"
                        </div>
                    </div>
                    <button class="result-access-btn" data-content-id="${result.contentId}">ACCESS FILE</button>
                </div>
            `;
        });

        resultsHTML += `
                </div>
                <div class="search-tips">
                    <h3>Search Tips:</h3>
                    <ul>
                        <li>Use specific entity designations (e.g., "RB-01", "UNB-06")</li>
                        <li>Search by location names or incident titles</li>
                        <li>Try partial matches for broader results</li>
                    </ul>
                </div>
            </div>
        `;

        documentContent.innerHTML = resultsHTML;

        // Add click handlers for search results
        document.querySelectorAll('.result-access-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const contentId = e.target.getAttribute('data-content-id');
                this.contentManager.loadContent(contentId);
                
                // Clear search
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.value = '';
                }
            });
        });

        // Also make entire result items clickable
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('result-access-btn')) return;
                
                const contentId = item.getAttribute('data-content-id');
                this.contentManager.loadContent(contentId);
                
                // Clear search
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.value = '';
                }
            });
        });
    }

    clearSearch() {
        this.showSearchResults([]);
    }

    // Set up search event listeners
    setupSearchListeners() {
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

        // Escape key to clear search
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (searchInput) {
                    searchInput.value = '';
                }
                this.clearSearch();
            }
        });
    }
}