# Contributing to Smart Home IoT System

First off, thank you for considering contributing to Smart Home IoT System! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

When creating a bug report, include:
- Clear and descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:
- Clear and descriptive title
- Detailed description of the proposed feature
- Explain why this enhancement would be useful

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code lints
5. Issue that pull request!

## 💻 Development Setup
```bash
# Clone your fork
git clone https://github.com/your-username/Smart-Home-IoT-System.git

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../simulation && pip install -r requirements.txt

# Start development servers
docker-compose -f infrastructure/docker-compose.yml up -d
cd backend && npm run dev
cd frontend && npm run dev
```

## 🔄 Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the documentation with any new features
3. The PR will be merged once you have the sign-off of a maintainer

## 🎨 Style Guidelines

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Examples:
```
feat: Add device automation rules
fix: Resolve WebSocket connection issue
docs: Update API documentation
style: Format code with Prettier
refactor: Simplify authentication logic
test: Add tests for device controller
```

### JavaScript/TypeScript Style Guide

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Use ES6+ features
- Follow Airbnb JavaScript Style Guide

### Python Style Guide

- Follow PEP 8
- Use 4 spaces for indentation
- Use descriptive variable names
- Add docstrings to functions

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Questions?

Feel free to open an issue with your question or contact the maintainers directly.

Thank you for contributing! 🚀
