# Jump and Run Game - QualityMinds Edition

A fun Jump and Run game built with Angular 21, featuring QualityMinds branding. Collect golden coins, jump across platforms, and set highscores!

## 🎮 Features
- **Jump and Run gameplay** - Classic platformer mechanics with smooth controls
- **Point collection system** - Collect golden coins worth 100 points each
- **Persistent highscore** - Using IndexedDB for browser-based storage
- **Shareable scores** - Generate URLs to share your highscore via WhatsApp or social media
- **QualityMinds branding** - Professional blue and gold color scheme

## 🎯 How to Play
- Use **Arrow Keys** or **WASD** to move left and right
- Press **Space** or **↑** to jump
- Collect all golden coins to maximize your score
- Don't fall off the platforms!

## 🚀 Development

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm start
```

The game will be available at `http://localhost:4200/`

### Build
```bash
# Development build
npm run build

# Production build for GitHub Pages
npm run build:prod
```

## 📦 Deployment

### GitHub Pages
This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

1. Go to your repository Settings → Pages
2. Under "Source", select "GitHub Actions"
3. Push changes to the `main` branch
4. The workflow will automatically build and deploy

The game will be available at: `https://[username].github.io/copilot-agend-qm-experiment-public/`

## 🛠️ Technologies
- **Angular 21** - Modern web framework
- **TypeScript** - Type-safe development
- **IndexedDB** - Browser-based persistent storage
- **Canvas API** - Game rendering
- **GitHub Actions** - CI/CD pipeline
- **GitHub Pages** - Free hosting

## 📝 License
This is a prototype/demo application for QualityMinds.
