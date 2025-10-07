# Contributing to Barcode Scanner

Thank you for your interest in contributing to the Barcode Scanner project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

Please be respectful and considerate of others. We aim to foster an inclusive and welcoming community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/barcode-scanner.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── BarcodeScanner/  # Main scanner component
│   └── icons/           # Icon components
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── constants/           # Application constants
└── config/              # Configuration files
```

## Coding Standards

### Code Style

- We use **Biome** for code formatting and linting
- Run `npm run format` before committing
- Run `npm run lint` to check for lint errors

### JavaScript/JSX

- Use functional components with hooks
- Use meaningful variable and function names
- Add JSDoc comments for all functions
- Keep components small and focused
- Use memoization (`memo`, `useMemo`, `useCallback`) where appropriate

### Example JSDoc Comment

```javascript
/**
 * Convert image data to grayscale
 * @param {ImageData} imageData - Canvas ImageData object
 * @returns {ImageData} Grayscale image data
 */
export const convertToGrayscale = (imageData) => {
  // Implementation
};
```

### File Organization

- One component per file
- Group related files in directories
- Use barrel exports (`index.js`) for cleaner imports
- Keep constants in the `constants/` directory
- Keep utility functions in the `utils/` directory

### Performance Considerations

- Use lazy loading for heavy dependencies
- Optimize re-renders with `memo` and `useCallback`
- Clean up resources in `useEffect` return functions
- Use `willReadFrequently: true` for frequently read canvas contexts

## Commit Guidelines

We follow conventional commit messages:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(scanner): add support for QR codes
fix(camera): resolve torch toggle issue on iOS
docs(readme): update installation instructions
refactor(hooks): extract camera logic to custom hook
```

## Pull Request Process

1. **Update Documentation**: Ensure any new features are documented
2. **Test Your Changes**: Verify the app works in development and production builds
3. **Format and Lint**: Run `npm run format` and `npm run lint`
4. **Create PR**: Submit a pull request with a clear title and description
5. **Link Issues**: Reference any related issues in the PR description
6. **Be Responsive**: Address any review comments promptly

### PR Checklist

- [ ] Code follows the project's coding standards
- [ ] All new functions have JSDoc comments
- [ ] No console errors or warnings
- [ ] App builds successfully (`npm run build`)
- [ ] Tested on mobile and desktop (if applicable)
- [ ] README updated (if needed)

## Testing

While we don't have automated tests yet, please manually test your changes:

1. Test on different browsers (Chrome, Firefox, Safari)
2. Test on mobile devices (iOS and Android if possible)
3. Test camera functionality (start, stop, switch, torch)
4. Test barcode scanning with different barcode types
5. Verify PWA functionality

## Questions?

If you have questions or need help, please:

- Open an issue with the `question` label
- Check existing issues for similar questions

Thank you for contributing! 🎉
