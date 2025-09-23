# Contributing to Global Tax Calculator Map

Thank you for your interest in contributing to the Global Tax Calculator Map! This document provides guidelines and information for contributors.

## 🤝 Ways to Contribute

### 🌍 Translation Support
Help make the application accessible to more people by adding translations:

1. **Add a new language**:
   - Edit `js/translations.js`
   - Add your language object with all required keys
   - Update the `getAvailableLanguages()` method
   - Add locale mapping in `js/i18nHelper.js`

2. **Improve existing translations**:
   - Review current translations for accuracy
   - Fix any grammatical or contextual issues
   - Ensure consistency across all translation keys

### 📊 Tax Data Updates
Keep tax information current and accurate:

1. **Update existing country data**:
   - Modify `js/taxData.js`
   - Include official sources for verification
   - Follow the existing data structure

2. **Add new countries**:
   - Research official tax brackets
   - Include VAT/GST rates where applicable
   - Add country coordinates for map display

### 🐛 Bug Reports
Help us improve by reporting issues:

1. **Search existing issues** first to avoid duplicates
2. **Use the issue template** for consistent reporting
3. **Include**:
   - Browser version and operating system
   - Steps to reproduce the issue
   - Expected vs actual behavior
   - Screenshots if applicable

### 💡 Feature Requests
Suggest new features or improvements:

1. **Check existing issues** for similar requests
2. **Describe the feature** clearly and its benefits
3. **Consider implementation complexity**
4. **Provide use cases** and examples

### 🔧 Code Contributions
Contribute code improvements:

1. **Follow the existing code style**
2. **Write clear, commented code**
3. **Test your changes thoroughly**
4. **Update documentation** if necessary

## 🛠️ Development Setup

### Prerequisites
- Modern web browser with ES6+ support
- Local HTTP server (Python, Node.js, or VS Code Live Server)
- Text editor or IDE

### Getting Started
1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/global-tax-calculator-map.git
   cd global-tax-calculator-map
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Start local server**:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```
5. **Open in browser**: `http://localhost:8000`

### Making Changes
1. **Make your changes** in the appropriate files
2. **Test thoroughly** in multiple browsers
3. **Verify translations** work correctly if applicable
4. **Check console** for any JavaScript errors

### Submitting Changes
1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add feature description"
   ```
2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
3. **Create a Pull Request** from your fork to the main repository

## 📋 Code Style Guidelines

### JavaScript
- Use **ES6+ features** (const/let, arrow functions, template literals)
- Follow **camelCase** naming convention
- Use **meaningful variable names**
- Add **JSDoc comments** for functions
- Prefer **composition over inheritance**

### HTML
- Use **semantic HTML5** elements
- Include **data-i18n attributes** for translatable content
- Maintain **proper indentation** (2 spaces)
- Use **meaningful class names**

### CSS
- Follow **BEM methodology** where applicable
- Use **CSS Grid and Flexbox** for layouts
- Maintain **consistent spacing** and sizing
- Add **responsive design** considerations

### File Organization
- Keep **components modular** and focused
- Use **clear file names** and directory structure
- Separate **concerns appropriately** (logic, styling, data)
- Document **complex algorithms** and calculations

## 🌐 Translation Guidelines

### Translation Keys
- Use **descriptive key names** in English
- Follow **consistent naming patterns**
- Group **related translations** together
- Include **context** where necessary

### Translation Quality
- Ensure **cultural appropriateness**
- Use **formal tone** for official content
- Maintain **consistency** across the interface
- Test **text length** doesn't break layout

### Required Translations
All new languages must include:
- Application title and headers
- Form labels and placeholders
- Button text and tooltips
- Error messages and notifications
- Tax system terminology
- Country status descriptions

## 📊 Tax Data Guidelines

### Data Accuracy
- Use **official government sources** only
- Include **source URLs** in comments
- Verify **current tax year** information
- Double-check **calculation logic**

### Data Structure
Follow the existing format:
```javascript
"country_key": {
    name: "Country Name",
    currency: "CUR",
    system: "progressive|flat|zero_personal",
    countryCode: "XX",
    coordinates: [latitude, longitude],
    brackets: [
        {min: 0, max: 50000, rate: 10},
        {min: 50001, max: null, rate: 25}
    ],
    vat: {
        standard_rate: 20,
        reduced_rates: [5, 0]
    }
}
```

### Data Verification
- **Cross-reference** multiple sources
- **Test calculations** manually
- **Verify VAT rates** separately
- **Check currency codes** (ISO 4217)

## 🧪 Testing Guidelines

### Browser Testing
Test in major browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Functional Testing
Verify:
- **Tax calculations** are accurate
- **Currency conversion** works properly
- **Language switching** updates all content
- **Map interactions** function correctly
- **Export functionality** produces valid CSV

### Responsive Testing
Test on various screen sizes:
- Desktop (1920x1080, 1366x768)
- Tablet (768x1024, landscape/portrait)
- Mobile (375x667, 414x896)

## 🔍 Code Review Process

### Pull Request Requirements
- **Clear description** of changes
- **Reference related issues** using keywords
- **Include screenshots** for UI changes
- **Verify all checks pass**

### Review Criteria
- Code follows style guidelines
- Changes are well-tested
- Documentation is updated
- No breaking changes introduced
- Performance impact considered

## 📝 Commit Message Format

Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Maintenance tasks

Examples:
```bash
feat(i18n): add Japanese language support
fix(calc): correct progressive tax calculation
docs(readme): update installation instructions
```

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributor statistics

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Code Review**: Comment on pull requests for feedback

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for helping make the Global Tax Calculator Map better for everyone! 🌍✨