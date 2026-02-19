# 💕 Valentine Card Maker

A beautiful, interactive web application for creating and sharing personalized Valentine's Day cards with animations and effects.

![Valentine Card Maker](https://img.shields.io/badge/Valentine-Card%20Maker-ff69b4?style=for-the-badge)

## ✨ Features

- **🎨 Interactive Canvas**: Drag, resize, and rotate elements freely
- **💌 Envelope Opening Animation**: Beautiful entrance experience
- **🖼️ 16 Romantic Stickers**: Hearts, roses, cupids, chocolates, and more
- **✏️ Custom Text**: Multiple fonts including elegant serif and cursive
- **🎨 8 Background Themes**: Gorgeous gradient and solid color options
- **📋 Pre-made Templates**: Quick start with 3 beautiful designs
- **❤️ Floating Hearts Animation**: Romantic background effects
- **🎵 Music Toggle**: Ready for background music
- **💾 Save & Share**: Create unique URLs to share your cards
- **🎯 Element Controls**: Customize size, rotation, color, and font
- **📱 Responsive Design**: Works on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download this repository**

```bash
git clone https://github.com/YOUR_USERNAME/valentine-card-maker.git
cd valentine-card-maker
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
npm run dev
```

4. **Open your browser** and navigate to `http://localhost:5173`

## 📦 Building for Production

To create a production build:

```bash
npm run build
```

The build files will be in the `dist` folder, ready to deploy!

## 🌐 Deployment Options

### Option 1: GitHub Pages (Easiest)

1. **Update `vite.config.js`** with your repository name:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/valentine-card-maker/'  // Change to your repo name
})
```

2. **Install gh-pages**:

```bash
npm install --save-dev gh-pages
```

3. **Add deployment scripts to `package.json`**:

```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

4. **Deploy**:

```bash
npm run deploy
```

5. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Select `gh-pages` branch
   - Your site will be live at: `https://YOUR_USERNAME.github.io/valentine-card-maker/`

### Option 2: Vercel (Recommended for beginners)

1. **Push your code to GitHub**

2. **Go to [Vercel](https://vercel.com)**
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Click "Deploy"

That's it! Vercel will automatically deploy and give you a live URL.

### Option 3: Netlify

1. **Push your code to GitHub**

2. **Go to [Netlify](https://netlify.com)**
   - Sign in with GitHub
   - Click "New site from Git"
   - Select your repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy"

## 🎯 How to Use

1. **Start Creating**: Click the envelope to begin
2. **Add Elements**: Use the toolbar to add stickers and text
3. **Customize**: Click any element to select it and customize in the sidebar
4. **Drag & Drop**: Move elements around the canvas
5. **Save & Share**: Click "Save & Share" to get a unique URL
6. **Share with Love**: Send the URL to your special someone!

## 🛠️ Project Structure

```
valentine-card-maker/
├── src/
│   ├── App.jsx          # Main component
│   ├── App.css          # All styling
│   └── main.jsx         # Entry point
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
└── README.md           # This file
```

## 🎨 Customization

### Adding More Stickers

Edit the `stickers` array in `App.jsx`:

```javascript
const stickers = [
  { id: 'newSticker', emoji: '😍' },
  // Add more emojis here
];
```

### Adding More Backgrounds

Edit the `backgrounds` array in `App.jsx`:

```javascript
const backgrounds = [
  { id: 'bg9', value: 'linear-gradient(...)', name: 'Your Name' },
  // Add more backgrounds
];
```

### Adding Music

1. Add an MP3 file to the `public` folder
2. Update the audio element in `App.jsx`:

```javascript
<audio ref={audioRef} loop>
  <source src="/your-music.mp3" type="audio/mpeg" />
</audio>
```

## 🔧 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **CSS3** - Styling with animations
- **LocalStorage** - Save and share functionality

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 💖 Show Your Support

If you enjoyed this project:

- ⭐ Star the repository
- 🍴 Fork it and customize it
- 📢 Share it with friends
- 💝 Create something beautiful!

## 📧 Contact

Created by [Your Name] - feel free to reach out!

---

Made with 💕 for Valentine's Day