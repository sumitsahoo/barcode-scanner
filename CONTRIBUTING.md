# Contributing to Barcode Scanner

Thanks for your interest! Here are the guidelines for contributing.

## 🚀 Getting Started

1. **Fork & Clone**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/barcode-scanner.git
   cd barcode-scanner
   ```
2. **Install & Run**:
   ```bash
   npm install
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/          # UI Components
├── config/              # App Configuration
├── constants/           # Constants
├── hooks/               # Custom Hooks
├── utils/               # Helpers
├── workers/             # Web Workers (Image Processing)
├── App.jsx              # Root Component
└── main.css             # Global Styles
```

## 💻 Coding Standards

- **Style**: We use **Biome**. Run `npm run format` and `npm run lint` before committing.
- **React**: Use Functional Components, Hooks, and React 19 features.
- **Performance**:
  - Use Web Workers for heavy processing.
  - Memoize expensive calculations (`useMemo`, `useCallback`).
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat: add zoom support`, `fix: camera permission`).

## 🔄 Pull Request Process

1. Create a branch: `git checkout -b feature/amazing-feature`
2. Make changes and test locally.
3. Verify build: `npm run build`
4. Submit a PR with a clear description.

## 🧪 Testing

Manual testing is required:
- Test on Mobile (iOS/Android) and Desktop.
- Verify Camera permissions and switching.
- Check Offline/PWA functionality.
