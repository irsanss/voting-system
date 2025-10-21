# Contributing to Voting System

Thank you for your interest in contributing to the Voting System! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Basic knowledge of TypeScript, React, and Next.js

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Fork the repository on GitHub
   git clone https://github.com/your-username/voting-system.git
   cd voting-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📋 Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
```

### 2. Make Your Changes
- Follow the existing code style
- Add tests for new features
- Update documentation if needed
- Ensure all tests pass

### 3. Test Your Changes
```bash
# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check

# Build the application
npm run build
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add your feature description"
```

### 5. Push and Create a Pull Request
```bash
git push origin feature/your-feature-name
```

## 📝 Code Style Guidelines

### TypeScript
- Use strict TypeScript settings
- Provide proper types for all functions and variables
- Use interfaces for object shapes
- Avoid using `any` type

### React Components
- Use functional components with hooks
- Follow the hooks rules
- Use proper TypeScript props
- Keep components small and focused

### CSS/Styling
- Use Tailwind CSS classes
- Follow the existing design system
- Use responsive design principles
- Ensure accessibility

### File Naming
- Use kebab-case for file names
- Use descriptive names
- Group related files together

## 🧪 Testing

### Test Structure
```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   └── button.test.tsx
│   └── ...
└── ...
```

### Writing Tests
- Use Jest and React Testing Library
- Test user interactions
- Test edge cases
- Keep tests simple and focused

### Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🐛 Bug Reports

### Reporting Bugs
1. Check existing issues
2. Create a new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

### Bug Fix Template
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. Windows 10, macOS 12.0]
- Browser: [e.g. Chrome, Firefox]
- Version: [e.g. v0.1.0]
```

## ✨ Feature Requests

### Requesting Features
1. Check existing issues and discussions
2. Create a new issue with:
   - Clear title
   - Detailed description
   - Use case scenarios
   - Possible implementation ideas

### Feature Request Template
```markdown
## Feature Description
Clear description of the feature

## Use Case
Why this feature is needed

## Proposed Solution
How you envision the feature working

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Any other relevant information
```

## 📖 Documentation

### Documentation Guidelines
- Keep documentation up to date
- Use clear and concise language
- Include code examples
- Add screenshots when helpful

### Documentation Files
- `README.md` - Project overview and setup
- `CHANGELOG.md` - Version history
- `CONTRIBUTING.md` - This file
- Inline documentation in code

## 🔧 Development Tools

### Recommended VS Code Extensions
- TypeScript Importer
- Prettier
- ESLint
- Tailwind CSS IntelliSense
- Prisma
- GitLens

### Useful Commands
```bash
# Format code
npm run format

# Check formatting
npm run format:check

# Clean build files
npm run clean

# Full clean and reinstall
npm run clean:all
```

## 🚀 Release Process

### Version Management
- Follow semantic versioning
- Update version in package.json
- Update CHANGELOG.md
- Create a Git tag

### Release Commands
```bash
# Patch version (0.1.0 -> 0.1.1)
npm run version:patch

# Minor version (0.1.0 -> 0.2.0)
npm run version:minor

# Major version (0.1.0 -> 1.0.0)
npm run version:major
```

## 🤝 Code Review Process

### Review Guidelines
- Be constructive and respectful
- Focus on code quality and best practices
- Ask questions if something is unclear
- Suggest improvements

### Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (unless intended)
- [ ] Security considerations addressed

## 🏷️ Labels and Tags

### Issue Labels
- `bug` - Bug reports
- `enhancement` - Feature requests
- `documentation` - Documentation issues
- `good first issue` - Good for newcomers
- `help wanted` - Community help needed
- `security` - Security issues

### PR Labels
- `feature` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Test additions/changes
- `chore` - Maintenance tasks

## 🎯 Project Goals

### Primary Goals
- Secure and reliable voting system
- Excellent user experience
- High code quality and test coverage
- Comprehensive documentation

### Technical Goals
- Modern web technologies
- Responsive design
- Accessibility compliance
- Performance optimization

## 📞 Getting Help

### Ways to Get Help
- Create an issue for bugs or questions
- Join our Discord community
- Check existing documentation
- Review similar issues

### Community Guidelines
- Be respectful and inclusive
- Help others when you can
- Follow the code of conduct
- Keep discussions constructive

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Voting System! 🎉