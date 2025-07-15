# KNOWN UNKNOWN ARCHIVE
## Bureau Digital Preservation Project

A dynamic wiki-style website for the Known Unknown lore universe, built for GitHub Pages with a government/conspiracy aesthetic.

---

## 🚀 Quick Start

1. **Upload to GitHub Pages:**
   - Push all files to your GitHub repository
   - Enable GitHub Pages in repository settings
   - Your site will be available at `https://[username].github.io/[repository-name]`

2. **Local Development:**
   ```bash
   # Simple local server (Python)
   python -m http.server 8000
   
   # Or with Node.js
   npx serve .
   ```

---

## 📁 Project Structure

```
legend286.github.io/
├── index.html              # Main HTML page
├── styles.css              # All styling (government theme)
├── script.js               # Dynamic content loading & navigation
├── content-config.json     # Content management configuration
├── README.md               # This file
├── first_lore_document.md  # Your existing lore files
├── known_unknown_lore.md
└── redwood_deep_dossier.md
```

---

## ✨ Features

### 🎨 **Visual Design**
- Dark government/conspiracy theme
- Classified document styling
- Redacted elements with atmospheric effects
- Responsive design (works on mobile)
- Loading animations and transitions

### 🧭 **Navigation**
- Sidebar navigation with sections
- Dynamic content loading (no page refreshes)
- Active page highlighting
- Disabled placeholder sections for future content

### 🔍 **Search System**
- Real-time search functionality
- Search through document titles and keywords
- Results displayed with file numbers and tags
- Escape key to clear search

### 📱 **Content Management**
- Markdown files automatically converted to HTML
- JSON configuration for easy expansion
- Template system for new document types
- Caching for improved performance

---

## 📝 Adding New Content

### Method 1: Quick Add (Recommended)

1. **Create new markdown file:**
   ```bash
   # Example: black_site_11_dossier.md
   ```

2. **Edit `content-config.json`:**
   ```json
   {
     "navigation": {
       "sections": [
         {
           "title": "SITE DOSSIERS",
           "items": [
             {
               "title": "File 0025 // Black Site 11",
               "contentId": "black_site_11_dossier",
               "fileNumber": "FILE 0025", 
               "fileName": "Black Site 11 Dossier"
             }
           ]
         }
       ]
     }
   }
   ```

3. **Add search terms (optional):**
   ```json
   {
     "searchIndex": {
       "terms": {
         "black site": "black_site_11_dossier",
         "nevada": "black_site_11_dossier"
       }
     }
   }
   ```

4. **Done!** The site will automatically load your new content.

### Method 2: Using Templates

Copy a template from `content-config.json`:

```markdown
**SITE DOSSIER: BLACK SITE 11**

**Location:** Nevada Desert
**Designation:** Anomalous Object Storage Facility
**Threat Tier:** IV
**Compiled by:** Bureau Storage Division // File 0025

---

### Overview

Decommissioned nuclear test site converted to high-security storage...

[Continue with your content]
```

---

## 🎯 Content Types & Templates

### 📍 **Site Dossiers**
For locations, facilities, and geographic anomalies
- Use template: `templates.siteDossier`
- File naming: `[location_name]_dossier.md`

### 👤 **Entity Files** 
For creatures, beings, and anomalous entities
- Use template: `templates.entityFile`
- File naming: `[entity_name]_entity_file.md`

### 📋 **Operation Reports**
For Bureau operations and incidents
- File naming: `operation_[name]_report.md`

### 🔧 **Object Files**
For anomalous items and artifacts
- File naming: `[object_name]_object_file.md`

---

## 🔧 Customization

### 🎨 **Visual Styling**
Edit `styles.css` to modify:
- Color scheme (CSS variables in `:root`)
- Typography and fonts
- Layout and spacing
- Animation effects

### 🧭 **Navigation Structure**
Edit `content-config.json`:
```json
{
  "navigation": {
    "sections": [
      {
        "title": "YOUR NEW SECTION",
        "items": [...]
      }
    ]
  }
}
```

### 🏠 **Home Page Content**
Modify `homeContent` in `content-config.json`:
```json
{
  "homeContent": {
    "contentCards": [
      {
        "title": "🆕 YOUR NEW CARD",
        "description": "Description here",
        "fileTag": "NEW",
        "target": "your_content_file"
      }
    ]
  }
}
```

---

## 🔍 Advanced Features

### 🔐 **Classification Levels**
Create different security clearance levels:
```markdown
**Classification Level:** TOP SECRET
**Clearance:** Level 5 Personnel Only
```

### 📊 **Data Tables**
Use markdown tables for structured data:
```markdown
| Entity | Threat Level | Status |
|--------|-------------|--------|
| Birchskin | III | Contained |
| Doorlicker | II | At Large |
```

### 🖼️ **Images & Media**
Add images to your markdown:
```markdown
![Entity Photo](images/birchskin_photo.jpg)
```

### 🔗 **Cross-References**
Link between documents:
```markdown
See also: [Redwood Deep Dossier](redwood_deep_dossier.md)
```

---

## 🚀 Deployment Options

### GitHub Pages (Recommended)
- ✅ Free hosting
- ✅ Automatic deployment
- ✅ Custom domain support
- ✅ SSL certificate included

### Self-Hosted Options
- **Netlify:** Drag & drop deployment
- **Vercel:** Git integration
- **Your own server:** Upload files via FTP/SFTP

---

## 📚 Markdown Guide

```markdown
# Large Header
## Medium Header  
### Small Header

**Bold text**
*Italic text*
`Code text`

> Blockquote for important notes

- List item 1
- List item 2

---
Horizontal rule

[Link text](url)
![Image](path/to/image.jpg)
```

---

## 🔧 Troubleshooting

### Content Not Loading
1. Check markdown file name matches `contentId` in config
2. Verify file is in root directory
3. Check browser console for errors

### Search Not Working
1. Add terms to `searchIndex.terms` in config
2. Clear browser cache
3. Check JavaScript console for errors

### Styling Issues
1. Hard refresh browser (Ctrl+F5)
2. Check CSS syntax in `styles.css`
3. Verify CSS variable names

---

## 🎮 Future Enhancements

Ideas for expanding your archive:

- **🔐 Clearance Levels:** Password-protected sections
- **📱 Mobile App:** Progressive Web App features
- **🎵 Audio Logs:** Embedded audio files
- **📊 Data Visualization:** Charts and graphs
- **🌐 Multi-language:** Translate content
- **👥 Collaboration:** Multiple author support

---

## 🆘 Support

Need help? Check these resources:

1. **GitHub Issues:** Report bugs or request features
2. **Markdown Guide:** [CommonMark Spec](https://commonmark.org/)
3. **CSS Reference:** [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS)
4. **GitHub Pages:** [Official Documentation](https://pages.github.com/)

---

**END OF DOCUMENTATION // CLEARANCE LEVEL: PUBLIC**

*"The truth is out there... it's just really well organized."* 