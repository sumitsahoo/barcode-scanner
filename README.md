## ℹ️ Barcode Scanner with ZBar WASM

High-performance, offline-ready barcode scanner built with React 19, Vite, and ZBar WASM.

## 👨🏻‍💻 Live App

[sumitsahoo.github.io/barcode-scanner](https://sumitsahoo.github.io/barcode-scanner)

## 🚀 Features

- **⚡️ High Performance**: Off-main-thread image processing using Web Workers.
- **📱 PWA Ready**: Fully offline capable with aggressive caching strategy.
- **📷 Advanced Camera**: Torch control, camera switching, and zoom support.
- **🎨 Modern UI**: Smooth animations, haptic feedback, and responsive design.
- **🔒 Privacy First**: All processing happens locally on the device.

## 🏗️ Project Structure

```
src/
├── components/          # UI Components (Scanner, Dialogs, Icons)
├── config/              # App Configuration
├── constants/           # Constants & Settings
├── hooks/               # Custom React Hooks (useBarcodeScanner)
├── utils/               # Helper Functions
├── workers/             # Web Workers (Image Processing)
├── App.jsx              # Root Component
├── main.css             # Global Styles & Animations
└── main.jsx             # Entry Point
```

## 🛠️ Tech Stack

- **Core**: React 19, Vite 7
- **Scanning**: @undecaf/zbar-wasm, Web Workers
- **Styling**: Tailwind CSS 4, DaisyUI 5
- **PWA**: VitePWA, Workbox
- **Tools**: Biome, Docker

## 📦 Quick Start

```bash
# Clone and Install
git clone https://github.com/sumitsahoo/barcode-scanner.git
cd barcode-scanner
npm install

# Run Development Server
npm run dev

# Build for Production
npm run build
```

## 🚢 Docker

Build and run the containerized application:

```bash
# Build
docker build --no-cache -t barcode-scanner .

# Run
docker run -it -p 8080:8080 --name barcode-scanner barcode-scanner
```

## 💼 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 🙏🏻 Attributions

- [ZBar WASM](https://github.com/undecaf/zbar-wasm) - Barcode detection
- [SVG Repo](https://www.svgrepo.com/) - Icons

## 📜 License

MIT License

Copyright © 2025 Sumit Sahoo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
