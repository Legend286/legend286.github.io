// Configuration module for Known Unknown Archive
// Contains all mappings, patterns, and static data

export const CONFIG = {
    // File number mappings
    fileNumbers: {
        'home': 'ARCHIVE OVERVIEW',
        'first_lore_document': 'FILE 0001',
        'known_unknown_lore': 'MAIN ARCHIVE',
        'redwood_deep_dossier': 'FILE 0024',
        'redsky-dossier': 'OP-RSKY-73',
        'cryptid-folding-man': 'RB-01',
        'cryptid-birchskin': 'LK-02',
        'cryptid-mirrorwitch': 'UNB-06',
        'cryptid-numbers-fiend': 'SIG-NF-1959',
        'chernobyl-incident-dossier': 'EVT-CH86',
        'mirrorwitch-chernobyl-connection': 'UNB-06-CH86-MIRROR',
        'pre-history': 'ERA I TIMELINE',
        'early-history': 'ERA II TIMELINE',
        '20th-century-history-pt1': 'ERA III TIMELINE',
        '20th-century-history-pt2': 'ERA IV TIMELINE',
        'table-test': 'TABLE TEST',
        'agent-thatcher-final-transmission': 'AT-FINAL-042986',
        'mikola-glushko-logs': 'MG-LOGS-CH86'
    },

    // File name mappings
    fileNames: {
        'home': 'Archive Overview',
        'first_lore_document': 'Introductory Dossier',
        'known_unknown_lore': 'Known Unknown Lore',
        'redwood_deep_dossier': 'Redwood Deep Site Dossier',
        'redsky-dossier': 'REDSKY Protocol Operation Dossier',
        'cryptid-folding-man': 'The Folding Man Entity Dossier',
        'cryptid-birchskin': 'Birchskin Entity Dossier',
        'cryptid-mirrorwitch': 'The Mirrorwitch Entity Dossier',
        'cryptid-numbers-fiend': 'Numbers Fiend Signal Dossier',
        'chernobyl-incident-dossier': 'Chernobyl Incident Event Dossier',
        'mirrorwitch-chernobyl-connection': 'Mirrorwitch-Chernobyl Connection',
        'pre-history': 'Prehistory Dossier',
        'early-history': 'Early History Dossier',
        '20th-century-history-pt1': '20th Century History - Part 1',
        '20th-century-history-pt2': '20th Century History - Part 2',
        'table-test': 'Table Functionality Test',
        'agent-thatcher-final-transmission': 'Agent Thatcher Final Transmission',
        'mikola-glushko-logs': 'Mykola Hlushko Personal Logs'
    },

    // Auto-linking patterns for cross-references
    linkPatterns: {
        // Document references
        'Redwood Deep': 'redwood_deep_dossier',
        'redwood deep': 'redwood_deep_dossier', 
        'Birchskin': 'cryptid-birchskin',
        'The Folding Man': 'cryptid-folding-man',
        'Folding Man': 'cryptid-folding-man',
        'RB-01': 'cryptid-folding-man',
        'LK-02': 'cryptid-birchskin',
        'Mirrorwitch': 'cryptid-mirrorwitch',
        'The Mirrorwitch': 'cryptid-mirrorwitch',
        'UNB-06': 'cryptid-mirrorwitch',
        'Numbers Fiend': 'cryptid-numbers-fiend',
        'The Numbers Fiend': 'cryptid-numbers-fiend',
        'SIG-NF-1959': 'cryptid-numbers-fiend',
        'Chernobyl Incident': 'chernobyl-incident-dossier',
        'Chornobyl': 'chernobyl-incident-dossier',
        'Pripyat': 'chernobyl-incident-dossier',
        'Reactor Four': 'chernobyl-incident-dossier',
        'IRONSHELTER': 'chernobyl-incident-dossier',
        'Operation IRONSHELTER': 'chernobyl-incident-dossier',
        'BURNT CROWN': 'chernobyl-incident-dossier',
        'Agent Thatcher': 'chernobyl-incident-dossier',
        'EVT-CH86': 'chernobyl-incident-dossier',
        'UNB-06-CH86-MIRROR': 'mirrorwitch-chernobyl-connection',
        'Mirrorwitch-Chernobyl Connection': 'mirrorwitch-chernobyl-connection',
        'Mirrorwitch Connection': 'mirrorwitch-chernobyl-connection',
        'Mirror Protocol': 'mirrorwitch-chernobyl-connection',
        'South Haven incident': 'cryptid-folding-man',
        'South Haven Breach': 'cryptid-folding-man',
        
        // Timeline references  
        'Era I': 'pre-history',
        'Era II': 'early-history',
        'Era III': '20th-century-history-pt1',
        'Era IV': '20th-century-history-pt2',
        
        // Site references
        'Site-24': 'redwood_deep_dossier',
        'Site 24': 'redwood_deep_dossier',
        'Redwood Deep': 'redwood_deep_dossier'
    },

    // Search index terms for content discovery
    searchTerms: {
        'home': [
            'archive', 'overview', 'home', 'main', 'index', 'bureau', 'known unknown', 
            'classified', 'files', 'dossier', 'timeline', 'entities', 'incidents'
        ],
        'first_lore_document': [
            'introductory', 'first', 'lore', 'dossier', 'file 0001', 'introduction', 
            'bureau', 'overview', 'getting started', 'new agent', 'classification'
        ],
        'known_unknown_lore': [
            'known unknown', 'lore', 'main archive', 'central', 'core', 'foundation', 
            'basis', 'background', 'context', 'understanding', 'knowledge base'
        ],
        'redwood_deep_dossier': [
            'redwood deep', 'site', 'facility', 'underground', 'bunker', 'site-24', 
            'file 0024', 'deep site', 'containment', 'secure facility'
        ],
        'redsky-dossier': [
            'redsky', 'protocol', 'operation', 'op-rsky-73', '1973', 'contact', 
            'first contact', 'alien', 'extraterrestrial', 'communication'
        ],
        'cryptid-folding-man': [
            'folding man', 'rb-01', 'ripple breach', 'geometry', 'fold', 'south haven', 
            'dimensional', 'breach', 'space', 'reality bender', 'anomalous humanoid'
        ],
        'cryptid-birchskin': [
            'birchskin', 'lk-02', 'lost kin', 'predator', 'lurker', 'forest', 'trees', 
            'hunting', 'woodland', 'camouflage', 'creature', 'entity'
        ],
        'cryptid-mirrorwitch': [
            'mirrorwitch', 'unb-06', 'unbound', 'mirror', 'reflection', 'glass', 
            'reverse precognition', 'temporal', 'time', 'prophecy', 'future sight'
        ],
        'cryptid-numbers-fiend': [
            'numbers fiend', 'sig-nf-1959', 'signal', 'broadcast', 'radio', 'transmission', 
            'numbers', 'death', 'prediction', 'names', 'victims', 'communication'
        ],
        'chernobyl-incident-dossier': [
            'chernobyl', 'chornobyl', 'pripyat', 'reactor', 'nuclear', 'disaster', 
            'evt-ch86', 'meltdown', 'rift', 'breach', 'radiation', 'ukraine', 'soviet'
        ],
        'mirrorwitch-chernobyl-connection': [
            'mirrorwitch chernobyl', 'connection', 'mirror protocol', 'spectral division', 
            'steganographic', 'hidden', 'classified addendum', 'temporal manipulation'
        ],
        'agent-thatcher-final-transmission': [
            'agent thatcher', 'final transmission', 'at-final-042986', 'temporal dislocation',
            'second city', 'pripyat memory', 'numbers fiend contact', 'thatcher log'
        ],
        'mikola-glushko-logs': [
            'mykola hlushko', 'mikola glushko', 'personal log', 'plant worker log', 'mg-logs-ch86',
            'chernobyl logs', 'reactor 4 log', 'technician log', 'mouth of hell', 'second city', 'numbers fiend', 'mirrorwitch'
        ]
    },

    // Steganographic audio files that can be enhanced
    steganographicFiles: [
        'chernobyl-incident_heat-was-just-the-excuse',
        'chernobyl-incident_didnt-have-time-to-evacuate',
        'chernobyl-incident_we-are-already-debris'
    ],

    // Hidden unlock phrases for easter eggs
    unlockPhrases: {
        'garry-the-cat': ['garry', 'garry the cat', 'cat', 'meow'],
        'mirrorwitch-encounter': ['я бачу тебе із середини', 'ya bachu tebe iz seredyny', 'я бачу тебе', 'ya bachu tebe', 'бачу тебе', 'bachu tebe']
    },

    // UI Configuration
    ui: {
        tilesPerPage: 6,
        maxSearchResults: 10,
        flickerInterval: 3000,
        flickerChance: 0.1
    }
}; 