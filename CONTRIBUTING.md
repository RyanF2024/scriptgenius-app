# Contributing to ScriptGenius

Thank you for your interest in contributing to ScriptGenius! We're excited to have you on board. 🚀

## 📋 Code of Conduct

This project adheres to our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you're expected to uphold this code.

## 🛠 Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your forked repository
   ```bash
   git clone https://github.com/your-username/scriptgenius.git
   cd scriptgenius
   ```
3. **Set up** the development environment
   ```bash
   npm install
   cp .env.example .env.local
   ```
4. **Create a branch** for your changes
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Commit** your changes with a descriptive message
6. **Push** to your fork
7. Open a **Pull Request**

## 🔧 Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local` (see `.env.example` for required variables)

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Run the test suite:
   ```bash
   npm test
   ```

## 📝 Pull Request Guidelines

1. **Branch Naming**: Use the format `feature/description` or `fix/issue-number`
2. **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/)
3. **Testing**: Ensure all new code is covered by tests
4. **Documentation**: Update relevant documentation (README, JSDoc, etc.)
5. **Linting**: Run `npm run lint` before committing
6. **Formatting**: Use `npm run format` to format your code

## 🧪 Testing

We use Jest and React Testing Library for testing. Please ensure:

- New features include unit tests
- Bug fixes include regression tests
- UI components include interaction tests

Run tests with coverage:
```bash
npm test -- --coverage
```

## 🧹 Code Style

- **TypeScript**: Strict mode enabled
- **Naming**: Use clear, descriptive names
- **Components**: Use functional components with TypeScript
- **Hooks**: Follow the Rules of Hooks
- **Formatting**: Prettier + ESLint (configured in the project)
- **Imports**: Group and sort imports (external first, then internal)

## 🚀 Deployment

- Main branch is automatically deployed to production
- All tests must pass before merging to main
- Versioning follows Semantic Versioning (SemVer)

## 🤝 Need Help?

- Check the [issues](https://github.com/your-username/scriptgenius/issues)
- Join our [Discord/Slack]()
- Email us at support@scriptgenius.app

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
