# 🌍 Global Tax Calculator Map

An interactive web application that allows users to visualize and compare income tax calculations across different countries worldwide. Users can input their monthly salary in various currencies and see how much tax they would pay in each country, with results displayed both on an interactive map and in a comprehensive results table.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge&logo=github-pages)](https://yourusername.github.io/global-tax-calculator-map/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Languages](https://img.shields.io/badge/Languages-5-orange?style=for-the-badge)](#languages-supported)

## ✨ Features

### 🗺️ Interactive Map Visualization
- **Color-coded countries** based on effective tax rates (green to red scale)
- **Interactive markers** with detailed tax breakdowns
- **Clickable country labels** with hover effects
- **Fullscreen mode** for better map exploration
- **Grid view** for organized country comparison

### 💰 Comprehensive Tax Calculations
- **Progressive tax systems** with detailed bracket breakdowns
- **Flat tax systems** with clear explanations
- **VAT calculations** included where applicable
- **Real-time currency conversion** using live exchange rates
- **Multi-currency support** (67+ currencies)

### 📊 Advanced Results Analysis
- **Sortable results table** with comprehensive data
- **Search and filter** functionality
- **CSV export** for further analysis
- **Summary statistics** (average, lowest, highest tax)
- **Effective tax rate calculations**

### 🌐 Multilingual Support
- **5 languages** supported with complete translations
- **Auto-detection** of browser language
- **Persistent language preferences**
- **Real-time language switching**

### 🔍 Detailed Tax Information
- **Interactive tax bracket popup** with detailed calculations
- **Next bracket threshold** information
- **Input currency conversion** in bracket details
- **Exchange rate information**
- **Tax source breakdown** (income tax vs VAT)

## 🌐 Languages Supported

- 🇺🇸 **English** (Default)
- 🇪🇸 **Español** (Spanish)
- 🇫🇷 **Français** (French)
- 🇩🇪 **Deutsch** (German)
- 🇺🇦 **Українська** (Ukrainian)

## 🚀 Live Demo

Visit the live application: **[Global Tax Calculator Map](https://yourusername.github.io/global-tax-calculator-map/)**

## 🏗️ Technology Stack

- **Frontend**: Pure JavaScript (ES6+), HTML5, CSS3
- **Mapping**: Leaflet.js for interactive maps
- **Architecture**: Component-based modular design
- **Internationalization**: Custom i18n system
- **Data**: JSON-based tax data for 146+ countries
- **Currency**: Real-time exchange rates via API

## 📂 Project Structure

```
├── index.html                 # Main application page
├── css/
│   └── styles.css            # Application styles
├── js/
│   ├── components/           # Modular components
│   │   ├── Application.js    # Main app coordinator
│   │   ├── MapComponent.js   # Interactive map
│   │   ├── CalculatorComponent.js # Tax calculations
│   │   ├── ResultsTableComponent.js # Results display
│   │   └── LanguageSelector.js # Language switching
│   ├── translations.js       # Internationalization system
│   ├── i18nHelper.js        # Translation utilities
│   ├── currencyDropdown.js  # Searchable currency selector
│   ├── taxData.js           # Tax bracket definitions
│   ├── taxCalculator.js     # Tax calculation logic
│   ├── currencyService.js   # Currency conversion
│   └── app.js               # Application entry point
└── README.md
```

## 🛠️ Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/global-tax-calculator-map.git
   cd global-tax-calculator-map
   ```

2. **Serve locally** (any HTTP server works):
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve .

   # Using Live Server (VS Code)
   # Right-click index.html → Open with Live Server
   ```

3. **Open in browser**:
   ```
   http://localhost:8000
   ```

## 🌍 Tax Data Coverage

The application includes comprehensive tax data for **146+ countries** with:

- **Progressive tax systems**: Multiple brackets with increasing rates
- **Flat tax systems**: Single rate for all income levels
- **Zero-tax jurisdictions**: Tax havens with no personal income tax
- **VAT/GST rates**: Value-added tax where applicable
- **Special tax provisions**: Military taxes, social contributions

### Data Sources
Tax data is compiled from official government sources and tax authorities for 2024-2025 tax years.

## 🎯 Key Features Detail

### Interactive Map
- **Color Visualization**: Countries colored from green (low tax) to red (high tax)
- **Smart Popups**: Detailed breakdowns with local and input currency amounts
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Performance Optimized**: Efficient rendering for smooth interactions

### Tax Calculations
- **Accurate Progressive Calculations**: Proper marginal tax rate handling
- **Currency Conversion**: Real-time rates with fallback support
- **Tax Bracket Visualization**: Interactive popup showing each bracket's contribution
- **Threshold Information**: Shows how much more to earn to reach next bracket

### Results Analysis
- **Comprehensive Comparison**: Side-by-side country analysis
- **Export Functionality**: Download results as CSV
- **Advanced Filtering**: Search by country name or tax characteristics
- **Statistical Overview**: Summary metrics across all countries

## 🚀 Deployment

### GitHub Pages (Recommended)
1. Fork this repository
2. Go to Settings → Pages
3. Select "Deploy from a branch" → main branch
4. Your site will be available at `https://yourusername.github.io/global-tax-calculator-map/`

### Other Platforms
- **Netlify**: Drag and drop the project folder
- **Vercel**: Connect your GitHub repository
- **Surge.sh**: Run `surge` in the project directory

## 🤝 Contributing

Contributions are welcome! Here are ways you can help:

### 🌍 Add More Languages
1. Add translations to `js/translations.js`
2. Update available languages list
3. Add locale mapping in `js/i18nHelper.js`

### 📊 Update Tax Data
1. Modify tax brackets in `js/taxData.js`
2. Follow the existing data structure
3. Include sources for verification

### 🐛 Bug Reports
1. Use GitHub Issues
2. Include browser and steps to reproduce
3. Screenshots helpful for UI issues

### 💡 Feature Requests
1. Open GitHub Issues with enhancement label
2. Describe the feature and its benefits
3. Consider implementation complexity

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Leaflet.js** for the excellent mapping library
- **Exchange Rate API** for currency conversion data
- **Government tax authorities** for official tax bracket data
- **Open source community** for inspiration and tools

## 📈 Future Enhancements

- [ ] **Mobile App**: React Native version
- [ ] **More Tax Types**: Social security, capital gains
- [ ] **Historical Data**: Tax changes over time
- [ ] **Tax Optimization**: Recommendations for tax efficiency
- [ ] **More Languages**: Expanding to 10+ languages
- [ ] **Advanced Filtering**: Tax system type, rate ranges
- [ ] **API Integration**: Real-time tax law updates

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/global-tax-calculator-map/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/global-tax-calculator-map/discussions)
- **Email**: your.email@example.com

---

Made with ❤️ for the global community. Help people make informed decisions about international taxation!

**[🌍 Try the Live Demo](https://yourusername.github.io/global-tax-calculator-map/)**