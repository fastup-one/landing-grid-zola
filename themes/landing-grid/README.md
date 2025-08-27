# 🚀 Landing Grid - Zola Theme

A professional, modern landing grid theme for Zola static site generator. Perfect for creating beautiful dashboards, app launchers, and link directories.

![Landing Grid Preview](screenshot.png)

## ✨ Features

### 🎨 **Modern Design**
- Clean, professional interface
- Glassmorphism effects with backdrop blur
- Beautiful gradient backgrounds
- Responsive grid layout (2-6 columns)
- Smooth animations and transitions

### 📱 **Fully Responsive**  
- **Mobile**: 2 columns
- **Tablet**: 3-4 columns
- **Desktop**: 4-5 columns
- **Large screens**: 6 columns
- Optimized for all screen sizes

### ⚡ **Interactive Features**
- Real-time search functionality
- Category-based filtering
- Smooth fade transitions
- Keyboard shortcuts
- URL hash support
- Professional navigation sidebar

### 🛠 **Technical**
- Built with Tailwind CSS
- Production-ready build system
- SEO optimized
- Fast loading times
- Accessible design
- Modern browser support

## 🚀 Quick Start

### 1. Install the Theme

```bash
# Clone into your themes directory
cd themes
git clone https://github.com/fastup-one/landing-grid-zola landing-grid

# Or download and extract
curl -L https://github.com/fastup-one/landing-grid-zola/archive/main.zip -o landing-grid.zip
unzip landing-grid.zip
mv landing-grid-zola-main landing-grid
```

### 2. Configure Your Site

Update your `config.toml`:

```toml
base_url = "https://yourdomain.com"
title = "My Landing Grid"
theme = "landing-grid"

[extra]
favicon = "favicon.ico"
open_links_in_new_window = true

# Navigation categories
[[extra.nav]]
name = "favorites"
tag = "favorite" 
icon = "star"

[[extra.nav]]
name = "tools"
tag = "tools"
icon = "wrench"

[[extra.nav]]
name = "social"
tag = "social"
icon = "users"
```

### 3. Add Your Links

Create `data/links.toml`:

```toml
[[tiles]]
name = "GitHub"
url = "https://github.com"
bg_color = "#24292E"
txt_color = "#FFFFFF"
tags = ["tools", "favorite"]

[[tiles]]
name = "Gmail"
url = "https://gmail.com"
bg_color = "#EA4335"
txt_color = "#FFFFFF"
tags = ["tools"]

[[tiles]]
name = "Twitter"
url = "https://twitter.com"
bg_color = "#1DA1F2"
txt_color = "#FFFFFF"
tags = ["social"]
```

### 4. Build & Serve

```bash
# Development
zola serve

# Production
zola build
```

## ⚙️ Configuration

### Basic Settings

```toml
[extra]
favicon = "favicon.ico"
open_links_in_new_window = true
```

### Navigation Categories

Add navigation filters in your `config.toml`:

```toml
[[extra.nav]]
name = "work"           # Display name
tag = "work"            # Filter tag  
icon = "briefcase"      # FontAwesome icon
```

### Tile Properties

Each tile in `data/links.toml` supports:

```toml
[[tiles]]
name = "Display Name"        # Required
url = "https://example.com"  # Required
bg_color = "#FF6B6B"        # Optional: hex color
txt_color = "#FFFFFF"       # Optional: hex color
tags = ["category1", "cat2"] # Optional: for filtering
```

## 🎨 Customization

### Colors & Themes

The theme uses CSS custom properties for easy customization:

```css
:root {
  --gradient-start: #667eea;
  --gradient-end: #764ba2;
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
}
```

### Tailwind Customization

Edit `tailwind.config.js` to customize:

```javascript
theme: {
  extend: {
    colors: {
      'brand': {
        'primary': '#667eea',
        'secondary': '#764ba2',
      }
    }
  }
}
```

### Layout Options

Customize grid layout in templates:

```html
<!-- 2-6 responsive columns -->
<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">

<!-- Fixed 4 columns -->
<div class="grid grid-cols-4 gap-6">
```

## 🔧 Development

### Prerequisites

- Node.js 16+ 
- Zola 0.17+
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/fastup-one/landing-grid-zola
cd landing-grid-zola

# Install dependencies  
npm install

# Start development
npm run dev
```

### Build Commands

```bash
npm run build-css        # Build CSS (watch mode)
npm run build-css-prod   # Build CSS (production)
npm run dev             # Development server
npm run build           # Full production build
npm run clean           # Clean build files
```

### File Structure

```
themes/landing-grid/
├── templates/
│   ├── base.html           # Base template
│   ├── index.html          # Home page
│   └── partials/
├── static/
│   ├── css/               # Generated CSS
│   └── js/                # Theme JavaScript
├── theme.toml             # Theme metadata
└── README.md
```

## 🚀 Deployment

### Static Hosting

Build and deploy to any static host:

```bash
# Build production site
zola build

# Deploy public/ directory to:
# - Netlify
# - Vercel  
# - GitHub Pages
# - Cloudflare Pages
```

### GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Zola
        uses: taiki-e/install-action@zola
      - name: Build
        run: zola build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

## 🎯 Use Cases

### Personal Dashboard
- Bookmark manager
- Quick access to tools
- Daily workflow launcher

### Team Resources  
- Company tool directory
- Project quick links
- Team collaboration hub

### Portfolio Site
- Project showcase
- Social media links
- Contact information

### App Directory
- Software catalog
- Service directory  
- Resource collection

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Zola](https://getzola.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Font Awesome](https://fontawesome.com/)
- Inspired by modern dashboard designs

## 📞 Support

- 📖 [Documentation](https://github.com/fastup-one/landing-grid-zola/wiki)
- 🐛 [Issue Tracker](https://github.com/fastup-one/landing-grid-zola/issues)
- 💬 [Discussions](https://github.com/fastup-one/landing-grid-zola/discussions)

---

**Made with ❤️ for the Zola community**