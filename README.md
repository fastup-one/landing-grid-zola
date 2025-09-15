# 🚀 Landing Grid - Zola Theme

> **Migrated from Hugo Slate Theme** - A complete migration and modernization of the popular Hugo Slate theme to Zola with enhanced features and modern design.

A professional, responsive landing grid theme for Zola static site generator. Perfect for creating beautiful dashboards, app launchers, and link directories with a modern glassmorphism design.

![Landing Grid Preview](screenshot.png)

## 🔄 **Migration from Hugo Slate**

This theme is a **complete migration** from the Hugo Slate theme to Zola, featuring:

### **What Was Preserved**
- ✅ Core speed dial functionality
- ✅ Tile-based navigation system
- ✅ Category filtering capabilities
- ✅ Search functionality
- ✅ Responsive grid layout
- ✅ Link management system

### **What Was Enhanced**
- 🆕 **Modern Glassmorphism Design** - Backdrop blur effects and glass panels
- 🆕 **Professional Navigation** - Clean sidebar with smooth animations
- 🆕 **Tailwind CSS Integration** - Modern utility-first CSS framework
- 🆕 **Enhanced Animations** - Smooth fade transitions and hover effects
- 🆕 **Better Responsiveness** - Optimized for all screen sizes
- 🆕 **Keyboard Shortcuts** - ESC to clear, number keys for navigation
- 🆕 **URL Hash Support** - Shareable filtered views
- 🆕 **Production Build System** - Optimized CSS compilation

## ✨ Features

### 🎨 **Modern Design**
- **Glassmorphism Effects**: Beautiful backdrop blur and transparency
- **Gradient Backgrounds**: Stunning color gradients (indigo → purple → pink)
- **Professional Navigation**: Clean sidebar with icon-based filtering
- **Smooth Animations**: Fade transitions, hover effects, and loading animations
- **Typography**: Inter font for modern, clean readability

### 📱 **Fully Responsive Grid System**
- **Mobile (< 640px)**: 2 columns
- **Small Tablets (640px+)**: 3 columns  
- **Tablets (768px+)**: 4 columns
- **Desktop (1024px+)**: 5 columns
- **Large Screens (1280px+)**: 6 columns
- **Ultra-wide**: Optimized spacing and layout

### ⚡ **Interactive Features**
- **Real-time Search**: Instant filtering as you type
- **Category Filtering**: Click navigation icons to filter by category
- **Smooth Transitions**: Tiles fade in/out with staggered animations
- **Keyboard Shortcuts**:
  - `ESC` - Clear search and show all tiles
  - `1-9` - Quick navigation to filter categories
- **URL Hash Support**: Shareable links like `#favorites` or `#tools`
- **Visual Feedback**: Hover effects, active states, and app counters

### 🛠 **Technical Excellence**
- **Zola Static Site Generator**: Fast, secure, and SEO-optimized
- **Tailwind CSS**: Utility-first CSS framework for consistency
- **CDN Integration**: Fast loading with cloud-delivered assets
- **Production Ready**: Minified CSS and optimized assets
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Modern Browser Support**: Chrome, Firefox, Safari, Edge

## 🚀 Quick Start

### 1. Clone or Download Theme

```bash
# Clone into your Zola site's themes directory
cd your-zola-site/themes
git clone https://github.com/fastup-one/landing-grid-zola landing-grid

# Or download and extract
curl -L https://github.com/fastup-one/landing-grid-zola/archive/main.zip -o landing-grid.zip
unzip landing-grid.zip && mv landing-grid-zola-main landing-grid
```

### 2. Configure Your Site

Update your `config.toml`:

```toml
base_url = "https://yourdomain.com"
title = "My Landing Dashboard"
description = "Your personal dashboard for quick access to favorite tools and websites"
theme = "landing-grid"

[extra]
favicon = "favicon.ico"
open_links_in_new_window = true

# Navigation categories (customize icons and names)
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

[[extra.nav]]
name = "work"
tag = "work"
icon = "briefcase"

[[extra.nav]]
name = "entertainment"
tag = "entertainment"
icon = "play"
```

### 3. Add Your Tiles

Create `data/links.toml` with your favorite sites:

```toml
[[tiles]]
name = "GitHub"
url = "https://github.com"
bg_color = "#24292E"
txt_color = "#FFFFFF"
tags = ["tools", "favorite", "work"]

[[tiles]]
name = "Gmail" 
url = "https://gmail.com"
bg_color = "#EA4335"
txt_color = "#FFFFFF"
tags = ["tools", "work"]

[[tiles]]
name = "YouTube"
url = "https://youtube.com"
bg_color = "#FF0000"
txt_color = "#FFFFFF"
tags = ["entertainment", "favorite"]

[[tiles]]
name = "Spotify"
url = "https://spotify.com"
bg_color = "#1DB954"
txt_color = "#FFFFFF"
tags = ["entertainment"]

[[tiles]]
name = "Twitter"
url = "https://twitter.com"
bg_color = "#1DA1F2"  
txt_color = "#FFFFFF"
tags = ["social"]

[[tiles]]
name = "LinkedIn"
url = "https://linkedin.com"
bg_color = "#0077B5"
txt_color = "#FFFFFF"
tags = ["social", "work"]
```

### 4. Build & Serve

```bash
# Development server
zola serve

# Production build
zola build

# Your site will be in the 'public/' directory
```

## ⚙️ Configuration Options

### Navigation Categories

Each navigation item supports:

```toml
[[extra.nav]]
name = "category-name"    # Display name in tooltips
tag = "filter-tag"       # Tag to filter tiles
icon = "font-awesome-icon" # FontAwesome icon name (without 'fa-')
```

**Available FontAwesome Icons**: `star`, `heart`, `wrench`, `briefcase`, `users`, `play`, `music`, `shopping-bag`, `search`, `home`, `cog`, `book`, `camera`, `gamepad`

### Tile Properties

Each tile supports:

```toml
[[tiles]]
name = "Site Name"           # Required - Display name
url = "https://example.com"  # Required - Target URL  
bg_color = "#FF6B6B"        # Optional - Hex background color
txt_color = "#FFFFFF"       # Optional - Hex text color
tags = ["tag1", "tag2"]     # Optional - Categories for filtering
```

### Global Settings

```toml
[extra]
favicon = "favicon.ico"              # Site favicon
open_links_in_new_window = true      # Open tiles in new tab/window
```

## 🎨 Customization

### Color Themes

The theme uses CSS custom properties for easy customization. Create a custom CSS file:

```css
:root {
  /* Background gradient colors */
  --gradient-start: #667eea;    /* Indigo */
  --gradient-middle: #764ba2;   /* Purple */ 
  --gradient-end: #f093fb;      /* Pink */
  
  /* Glass effects */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-dark: rgba(0, 0, 0, 0.2);
}

/* Custom gradient example */
body {
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end));
}
```

### Layout Customization

Modify grid columns in `templates/index.html`:

```html
<!-- Default: 2-6 responsive columns -->
<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">

<!-- Fixed 4 columns example -->
<div class="grid grid-cols-4 gap-6">

<!-- Large tiles example -->  
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
```

## 🔧 Development

### Prerequisites
- **Zola** v0.17.0+ ([Install Zola](https://getzola.org/documentation/getting-started/installation/))
- **Node.js** 16+ (for CSS building)
- **Git** (for version control)

### Development Setup

```bash
# Clone the theme
git clone https://github.com/fastup-one/landing-grid-zola
cd landing-grid-zola

# Install dependencies
npm install

# Start development with CSS watching
npm run dev
```

### Build Commands

```bash
npm run build-css        # Build CSS with watching
npm run build-css-prod   # Build minified production CSS  
npm run dev             # Start Zola dev server + CSS watching
npm run build           # Full production build
npm run clean           # Clean generated files
```

### File Structure

```
themes/landing-grid/
├── templates/
│   ├── base.html           # Main template with navigation
│   ├── index.html          # Grid layout and tile rendering
│   └── partials/           # Reusable template components
├── static/
│   ├── css/
│   │   └── tailwind.css    # Generated/compiled CSS
│   └── js/                 # Theme JavaScript (if needed)
├── src/
│   └── input.css          # Source Tailwind CSS
├── theme.toml             # Theme metadata
├── tailwind.config.js     # Tailwind configuration
├── package.json           # Build tools and dependencies
└── README.md              # This documentation
```

## 🚀 Deployment

### Static Hosting Platforms

Deploy to any static hosting service:

**Netlify**:
```bash
# Build command: zola build
# Publish directory: public
```

**Vercel**:
```bash  
# Build command: zola build
# Output directory: public
```

**GitHub Pages**:
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
      - name: Checkout
        uses: actions/checkout@v3
        
      - name: Setup Zola
        uses: taiki-e/install-action@zola
        
      - name: Build site
        run: zola build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

**Cloudflare Pages**:
- Build command: `zola build`
- Build output directory: `public`

## 🎯 Use Cases

### 📊 **Personal Dashboard**
Perfect for creating your daily-use homepage with:
- Frequently visited websites
- Work tools and applications  
- Social media shortcuts
- Entertainment platforms

### 🏢 **Team/Company Resources**
Great for organizational tool directories:
- Internal applications and tools
- Documentation and wikis
- Project management systems
- Communication platforms

### 🎨 **Portfolio Showcase**
Ideal for creative professionals:
- Project galleries and demos
- Social media profiles
- Client resources
- Creative tools and inspiration

### 📚 **Resource Collections**
Perfect for curated link collections:
- Learning resources and tutorials
- Industry tools and software
- Reference materials
- Community and forums

## 📊 **Migration Comparison**

| Feature | Hugo Slate | Landing Grid (Zola) |
|---------|------------|---------------------|
| **Static Site Generator** | Hugo | Zola |
| **CSS Framework** | Custom SCSS | Tailwind CSS |
| **Design Style** | Basic/Minimal | Modern Glassmorphism |
| **Navigation** | Basic list | Professional sidebar |
| **Animations** | Limited | Smooth transitions |
| **Responsive Design** | Basic | Fully optimized |
| **Search** | Basic | Real-time with transitions |
| **Keyboard Shortcuts** | None | ESC, Number keys |
| **URL Hash Support** | Basic | Full support |
| **Build System** | Hugo pipes | Tailwind + Zola |
| **Documentation** | Minimal | Comprehensive |

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)  
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Types of Contributions
- 🐛 **Bug fixes** - Fix issues or improve functionality
- ✨ **New features** - Add new capabilities or options
- 📝 **Documentation** - Improve guides, examples, or README
- 🎨 **Design** - Enhance UI/UX or add themes
- ⚡ **Performance** - Optimize loading or rendering

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Hugo Slate Attribution
Originally inspired by and migrated from the Hugo Slate theme. This Zola version is a complete rewrite with significant enhancements and modern features.

## 🙏 Acknowledgments

- **Hugo Slate Theme** - Original inspiration and concept
- **[Zola](https://getzola.org/)** - Fast and flexible static site generator  
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Font Awesome](https://fontawesome.com/)** - Beautiful icons
- **[Inter Font](https://rsms.me/inter/)** - Modern typography
- **[Glassmorphism](https://glassmorphism.com/)** - Design inspiration

## 📞 Support & Community

### Get Help
- 📖 **[Documentation](https://github.com/fastup-one/landing-grid-zola/wiki)** - Comprehensive guides
- 🐛 **[Issue Tracker](https://github.com/fastup-one/landing-grid-zola/issues)** - Bug reports and feature requests  
- 💬 **[Discussions](https://github.com/fastup-one/landing-grid-zola/discussions)** - Community support

### Stay Updated
- ⭐ **Star this repo** to get notified of updates
- 👀 **Watch releases** for new versions
- 🐦 **Follow on Twitter** [@fastup-one] for announcements

## 🐳 Docker Deployment

The Landing Grid theme provides simple Docker deployment using pre-built static files and nginx.

### 🚀 **Quick Deployment**

Deploy in just 2 steps:

```bash
# 1. Build the static site locally
zola build

# 2. Deploy with Docker Compose
docker-compose up -d
```

The site will be available at **http://localhost:8090**

### 📁 **How It Works**

The deployment approach is simple and efficient:

1. **Build Locally**: Use `zola build` to generate static files in `public/`
2. **Mount Volume**: Docker mounts `./public` to nginx web root
3. **Serve Static**: Nginx serves the pre-built files with optimal performance

### ⚙️ **Docker Configuration**

The `docker-compose.yaml` is minimal and focused:

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: landing-grid-nginx
    ports:
      - "8090:80"  # Access at localhost:8090
    volumes:
      - ./public:/usr/share/nginx/html:ro  # Mount static files
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
```

### 🔧 **Development Workflow**

```bash
# Development with local Zola server
zola serve --port 8989  # http://localhost:8989

# Update content, then rebuild and deploy
zola build
docker-compose restart
```

### 📊 **Production Benefits**

This approach provides several advantages:

- **🚀 Fast Deployment**: No build time in Docker, just static file serving
- **🔧 Simple**: Single nginx container, no complex build stages
- **💾 Efficient**: Small image size, only static files
- **🔄 Easy Updates**: Rebuild locally, restart container
- **⚡ Performance**: Direct nginx serving with optimal caching
- **🛡️ Security**: Read-only volume mount, minimal attack surface

### 🚀 **Deployment Commands**

```bash
# Start the service
docker-compose up -d

# Stop the service
docker-compose down

# View logs
docker-compose logs -f

# Restart after content changes
zola build && docker-compose restart

# Check container status
docker-compose ps
```

### 🌐 **Custom Port**

To change the port, edit `docker-compose.yaml`:

```yaml
ports:
  - "80:80"      # Standard HTTP
  - "8080:80"    # Alternative port
  - "443:80"     # Behind reverse proxy
```

### 🔒 **Production Considerations**

For production deployment:

- Use a reverse proxy (Traefik, nginx, Cloudflare)
- Configure SSL/TLS certificates
- Set up automated builds and deployments
- Monitor container health and logs
- Backup your content and configuration

---

<div align="center">

**Made with ❤️ for the Zola community**

*Migrated from Hugo Slate • Enhanced for Modern Web*

[⭐ Star on GitHub](https://github.com/fastup-one/landing-grid-zola) • [📖 Documentation](https://github.com/fastup-one/landing-grid-zola/wiki) • [🐛 Report Issues](https://github.com/fastup-one/landing-grid-zola/issues)

</div>