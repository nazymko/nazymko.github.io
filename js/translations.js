// Internationalization (i18n) System for Global Tax Calculator
export class TranslationManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.loadTranslations();
    }

    // Load all translation data
    loadTranslations() {
        this.translations = {
            en: {
                // App Title and Headers
                appTitle: "Global Tax Calculator Map",
                mapTitle: "Interactive Tax Visualization Map",
                mapSubtitle: "Map colors represent actual tax burden in {currency}. Click markers for detailed information.",
                calculatorTitle: "Global Tax Comparison Calculator",
                calculatorSubtitle: "Enter your monthly salary to see how much tax you would pay in different countries around the world.",

                // Form Labels
                monthlySalary: "Monthly Salary",
                inputCurrency: "Input Currency",
                displayCurrency: "Display Results In",
                salaryPlaceholder: "Enter your monthly salary",

                // Buttons
                toggleFullscreen: "Toggle fullscreen map",
                expandIcon: "⤢",
                contractIcon: "⤡",
                toggleView: "Toggle labels view",
                exportCsv: "Export CSV",

                // Tax Legend
                taxHavens: "Tax Havens (0%)",
                veryLow: "Very Low (≤10%)",
                low: "Low (≤20%)",
                moderate: "Moderate (≤30%)",
                medium: "Medium (≤40%)",
                high: "High (≤50%)",
                highest: "Highest (>50%)",
                noCalculation: "No Calculation",

                // Results Table
                resultsTitle: "Tax Comparison Results",
                searchCountries: "Search countries...",
                totalCountries: "Countries Analyzed",
                averageTax: "Average Tax ({currency})",
                lowestTax: "Lowest Tax ({currency})",
                highestTax: "Highest Tax ({currency})",

                // Table Headers
                country: "Country",
                system: "System",
                totalTax: "Total Tax",
                incomeTax: "Income Tax",
                vatTax: "VAT",
                effectiveRate: "Effective Rate",
                netIncome: "Net Income",

                // Tax Systems
                progressive: "Progressive",
                flat: "Flat",
                zeroPersonal: "Zero Personal",

                // Popup Content
                country_: "Country",
                currency_: "Currency",
                vat_: "VAT",
                taxSystem: "Tax System",
                status: "Status",
                calculated: "Calculated",
                ready: "Ready",
                annualGrossIncome: "Annual Gross Income",
                taxBreakdown: "Tax Breakdown",
                totalTaxBurden: "Total Tax Burden",
                netAnnualIncome: "Net Annual Income",
                incomeTaxDetails: "Income Tax ({rate}%)",
                vatDetails: "VAT ({rate}%)",
                clickForDetails: "Click for details",
                exchangeRate: "Exchange Rate",
                taxBracketDetails: "Tax Bracket Details",
                marginalRate: "Marginal Rate",
                effectiveRate_: "Effective Rate",

                // Tax Bracket Popup
                taxBracketBreakdown: "Tax Bracket Breakdown",
                annualIncome: "Annual Income",
                invalidIncomeData: "Invalid Income Data",
                invalidIncomeMessage: "Unable to calculate tax brackets. Please ensure a valid salary is entered.",
                flatTaxSystem: "Flat Tax System",
                progressiveTaxBrackets: "Progressive Tax Brackets",
                flatRateDescription: "flat rate on all income from {currency} 0",
                taxCalculation: "Tax Calculation",
                netIncome_: "Net Income",
                howFlatTaxWorks: "How Flat Tax Works",
                flatTaxExplanation: "Every {currency} you earn is taxed at exactly {rate}%, regardless of income level. No brackets, no complexity.",
                taxableAmount: "Taxable amount",
                taxFromBracket: "Tax from this bracket",
                incomeBelowBracket: "Income below this bracket",
                noTaxInBracket: "No tax in this bracket",
                yourCurrentBracket: "YOUR CURRENT BRACKET",
                totalIncomeTax: "TOTAL INCOME TAX",
                nextBracketInfo: "Next bracket threshold",
                earnMore: "Earn {amount} more to reach",
                bracketRange: "{min} - {max}",
                unlimitedBracket: "∞",
                closeInstruction: "Click outside or press ESC to close",

                // Loading and Messages
                calculatingTaxes: "Calculating taxes...",
                loadingMap: "Loading map...",
                noResults: "No results found",
                errorOccurred: "An error occurred",
                tryAgain: "Please try again",

                // Disclaimer
                disclaimer: "Disclaimer:",
                disclaimerText: "This calculator provides estimates based on basic income tax brackets for 2024-2025. Actual taxes may vary due to deductions, credits, social security contributions, municipal taxes, and other factors. Consult a tax professional for accurate calculations. Data covers 146+ countries with progressive, flat, and zero-tax systems.",

                // Language Selector
                language: "Language",
                selectLanguage: "Select Language",

                // Search Currency Dropdown
                searchCurrencies: "Search currencies...",
                noCurrenciesFound: "No currencies found",
                selectCurrency: "Select currency...",

                // Grid View
                gridView: "Grid View",
                mapView: "Map View",

                // Error Messages
                failedToInitialize: "Failed to initialize the application. Please refresh the page.",
                calculationError: "Error during calculation",
                invalidSalary: "Please enter a valid salary amount",
                currencyNotSupported: "Currency not supported",

                // Country Status Messages
                taxHaven: "Tax Haven",
                noPersonalIncomeTax: "No Personal Income Tax",
                simpleSystem: "Simple Tax System",
                complexSystem: "Complex Tax System"
            },

            es: {
                // App Title and Headers
                appTitle: "Mapa del Calculadora Global de Impuestos",
                mapTitle: "Mapa Interactivo de Visualización de Impuestos",
                mapSubtitle: "Los colores del mapa representan la carga fiscal real en {currency}. Haga clic en los marcadores para obtener información detallada.",
                calculatorTitle: "Calculadora Global de Comparación de Impuestos",
                calculatorSubtitle: "Ingrese su salario mensual para ver cuánto impuesto pagaría en diferentes países del mundo.",

                // Form Labels
                monthlySalary: "Salario Mensual",
                inputCurrency: "Moneda de Entrada",
                displayCurrency: "Mostrar Resultados En",
                salaryPlaceholder: "Ingrese su salario mensual",

                // Buttons
                toggleFullscreen: "Alternar mapa de pantalla completa",
                expandIcon: "⤢",
                contractIcon: "⤡",
                toggleView: "Alternar vista de etiquetas",
                exportCsv: "Exportar CSV",

                // Tax Legend
                taxHavens: "Paraísos Fiscales (0%)",
                veryLow: "Muy Bajo (≤10%)",
                low: "Bajo (≤20%)",
                moderate: "Moderado (≤30%)",
                medium: "Medio (≤40%)",
                high: "Alto (≤50%)",
                highest: "Más Alto (>50%)",
                noCalculation: "Sin Cálculo",

                // Results Table
                resultsTitle: "Resultados de Comparación de Impuestos",
                searchCountries: "Buscar países...",
                totalCountries: "Países Analizados",
                averageTax: "Impuesto Promedio ({currency})",
                lowestTax: "Impuesto Más Bajo ({currency})",
                highestTax: "Impuesto Más Alto ({currency})",

                // Table Headers
                country: "País",
                system: "Sistema",
                totalTax: "Impuesto Total",
                incomeTax: "Impuesto sobre la Renta",
                vatTax: "IVA",
                effectiveRate: "Tasa Efectiva",
                netIncome: "Ingreso Neto",

                // Tax Systems
                progressive: "Progresivo",
                flat: "Plano",
                zeroPersonal: "Sin Impuesto Personal",

                // Popup Content
                country_: "País",
                currency_: "Moneda",
                vat_: "IVA",
                taxSystem: "Sistema Fiscal",
                status: "Estado",
                calculated: "Calculado",
                ready: "Listo",
                annualGrossIncome: "Ingreso Bruto Anual",
                taxBreakdown: "Desglose de Impuestos",
                totalTaxBurden: "Carga Fiscal Total",
                netAnnualIncome: "Ingreso Anual Neto",
                incomeTaxDetails: "Impuesto sobre la Renta ({rate}%)",
                vatDetails: "IVA ({rate}%)",
                clickForDetails: "Clic para detalles",
                exchangeRate: "Tipo de Cambio",
                taxBracketDetails: "Detalles de Tramos Fiscales",
                marginalRate: "Tasa Marginal",
                effectiveRate_: "Tasa Efectiva",

                // Language Selector
                language: "Idioma",
                selectLanguage: "Seleccionar Idioma",

                // Error Messages
                failedToInitialize: "Error al inicializar la aplicación. Por favor, actualice la página.",
                calculationError: "Error durante el cálculo",
                invalidSalary: "Por favor, ingrese una cantidad de salario válida",
                currencyNotSupported: "Moneda no compatible"
            },

            fr: {
                // App Title and Headers
                appTitle: "Carte de Calculatrice Fiscale Mondiale",
                mapTitle: "Carte Interactive de Visualisation Fiscale",
                mapSubtitle: "Les couleurs de la carte représentent la charge fiscale réelle en {currency}. Cliquez sur les marqueurs pour des informations détaillées.",
                calculatorTitle: "Calculatrice Mondiale de Comparaison Fiscale",
                calculatorSubtitle: "Entrez votre salaire mensuel pour voir combien d'impôt vous paieriez dans différents pays du monde.",

                // Form Labels
                monthlySalary: "Salaire Mensuel",
                inputCurrency: "Devise d'Entrée",
                displayCurrency: "Afficher les Résultats en",
                salaryPlaceholder: "Entrez votre salaire mensuel",

                // Buttons
                toggleFullscreen: "Basculer la carte en plein écran",
                expandIcon: "⤢",
                contractIcon: "⤡",
                toggleView: "Basculer la vue des étiquettes",
                exportCsv: "Exporter CSV",

                // Tax Legend
                taxHavens: "Paradis Fiscaux (0%)",
                veryLow: "Très Bas (≤10%)",
                low: "Bas (≤20%)",
                moderate: "Modéré (≤30%)",
                medium: "Moyen (≤40%)",
                high: "Élevé (≤50%)",
                highest: "Plus Élevé (>50%)",
                noCalculation: "Aucun Calcul",

                // Results Table
                resultsTitle: "Résultats de Comparaison Fiscale",
                searchCountries: "Rechercher des pays...",
                totalCountries: "Pays Analysés",
                averageTax: "Impôt Moyen ({currency})",
                lowestTax: "Impôt le Plus Bas ({currency})",
                highestTax: "Impôt le Plus Élevé ({currency})",

                // Table Headers
                country: "Pays",
                system: "Système",
                totalTax: "Impôt Total",
                incomeTax: "Impôt sur le Revenu",
                vatTax: "TVA",
                effectiveRate: "Taux Effectif",
                netIncome: "Revenu Net",

                // Tax Systems
                progressive: "Progressif",
                flat: "Forfaitaire",
                zeroPersonal: "Aucun Impôt Personnel",

                // Language Selector
                language: "Langue",
                selectLanguage: "Sélectionner la Langue",

                // Error Messages
                failedToInitialize: "Échec de l'initialisation de l'application. Veuillez actualiser la page.",
                calculationError: "Erreur lors du calcul",
                invalidSalary: "Veuillez entrer un montant de salaire valide",
                currencyNotSupported: "Devise non prise en charge"
            },

            de: {
                // App Title and Headers
                appTitle: "Globaler Steuerrechner Karte",
                mapTitle: "Interaktive Steuervisu­alisierungskarte",
                mapSubtitle: "Kartenfarben stellen die tatsächliche Steuerlast in {currency} dar. Klicken Sie auf Markierungen für detaillierte Informationen.",
                calculatorTitle: "Globaler Steuervergleichsrechner",
                calculatorSubtitle: "Geben Sie Ihr monatliches Gehalt ein, um zu sehen, wie viel Steuern Sie in verschiedenen Ländern der Welt zahlen würden.",

                // Form Labels
                monthlySalary: "Monatsgehalt",
                inputCurrency: "Eingabewährung",
                displayCurrency: "Ergebnisse Anzeigen in",
                salaryPlaceholder: "Geben Sie Ihr monatliches Gehalt ein",

                // Buttons
                toggleFullscreen: "Vollbild-Karte umschalten",
                expandIcon: "⤢",
                contractIcon: "⤡",
                toggleView: "Beschriftungsansicht umschalten",
                exportCsv: "CSV Exportieren",

                // Tax Legend
                taxHavens: "Steueroasen (0%)",
                veryLow: "Sehr Niedrig (≤10%)",
                low: "Niedrig (≤20%)",
                moderate: "Mäßig (≤30%)",
                medium: "Mittel (≤40%)",
                high: "Hoch (≤50%)",
                highest: "Höchste (>50%)",
                noCalculation: "Keine Berechnung",

                // Results Table
                resultsTitle: "Steuervergleichsergebnisse",
                searchCountries: "Länder suchen...",
                totalCountries: "Analysierte Länder",
                averageTax: "Durchschnittliche Steuer ({currency})",
                lowestTax: "Niedrigste Steuer ({currency})",
                highestTax: "Höchste Steuer ({currency})",

                // Table Headers
                country: "Land",
                system: "System",
                totalTax: "Gesamtsteuer",
                incomeTax: "Einkommensteuer",
                vatTax: "Mehrwertsteuer",
                effectiveRate: "Effektiver Satz",
                netIncome: "Nettoeinkommen",

                // Tax Systems
                progressive: "Progressiv",
                flat: "Pauschal",
                zeroPersonal: "Keine Persönliche Steuer",

                // Language Selector
                language: "Sprache",
                selectLanguage: "Sprache Auswählen",

                // Error Messages
                failedToInitialize: "Anwendung konnte nicht initialisiert werden. Bitte aktualisieren Sie die Seite.",
                calculationError: "Fehler bei der Berechnung",
                invalidSalary: "Bitte geben Sie einen gültigen Gehaltsbetrag ein",
                currencyNotSupported: "Währung nicht unterstützt"
            },

            uk: {
                // App Title and Headers
                appTitle: "Карта Глобального Податкового Калькулятора",
                mapTitle: "Інтерактивна Карта Візуалізації Податків",
                mapSubtitle: "Кольори карти представляють фактичне податкове навантаження в {currency}. Натисніть на маркери для детальної інформації.",
                calculatorTitle: "Глобальний Калькулятор Порівняння Податків",
                calculatorSubtitle: "Введіть ваш місячний оклад, щоб побачити, скільки податків ви б платили в різних країнах світу.",

                // Form Labels
                monthlySalary: "Місячна Зарплата",
                inputCurrency: "Валюта Введення",
                displayCurrency: "Показати Результати в",
                salaryPlaceholder: "Введіть ваш місячний оклад",

                // Buttons
                toggleFullscreen: "Переключити повноекранну карту",
                expandIcon: "⤢",
                contractIcon: "⤡",
                toggleView: "Переключити вид міток",
                exportCsv: "Експорт CSV",

                // Tax Legend
                taxHavens: "Податкові Гавані (0%)",
                veryLow: "Дуже Низький (≤10%)",
                low: "Низький (≤20%)",
                moderate: "Помірний (≤30%)",
                medium: "Середній (≤40%)",
                high: "Високий (≤50%)",
                highest: "Найвищий (>50%)",
                noCalculation: "Без Розрахунку",

                // Results Table
                resultsTitle: "Результати Порівняння Податків",
                searchCountries: "Пошук країн...",
                totalCountries: "Проаналізовано Країн",
                averageTax: "Середній Податок ({currency})",
                lowestTax: "Найнижчий Податок ({currency})",
                highestTax: "Найвищий Податок ({currency})",

                // Table Headers
                country: "Країна",
                system: "Система",
                totalTax: "Загальний Податок",
                incomeTax: "Прибутковий Податок",
                vatTax: "ПДВ",
                effectiveRate: "Ефективна Ставка",
                netIncome: "Чистий Дохід",

                // Tax Systems
                progressive: "Прогресивна",
                flat: "Плоска",
                zeroPersonal: "Без Особистого Податку",

                // Popup Content
                country_: "Країна",
                currency_: "Валюта",
                vat_: "ПДВ",
                taxSystem: "Податкова Система",
                status: "Статус",
                calculated: "Розраховано",
                ready: "Готово",
                annualGrossIncome: "Річний Валовий Дохід",
                taxBreakdown: "Розбивка Податків",
                totalTaxBurden: "Загальне Податкове Навантаження",
                netAnnualIncome: "Чистий Річний Дохід",
                incomeTaxDetails: "Прибутковий Податок ({rate}%)",
                vatDetails: "ПДВ ({rate}%)",
                clickForDetails: "Натисніть для деталей",
                exchangeRate: "Курс Обміну",
                taxBracketDetails: "Деталі Податкових Шкал",
                marginalRate: "Гранична Ставка",
                effectiveRate_: "Ефективна Ставка",

                // Tax Bracket Popup
                taxBracketBreakdown: "Розбивка Податкових Шкал",
                annualIncome: "Річний Дохід",
                invalidIncomeData: "Недійсні Дані про Дохід",
                invalidIncomeMessage: "Неможливо розрахувати податкові шкали. Будь ласка, переконайтеся, що введено дійсну зарплату.",
                flatTaxSystem: "Система Плоского Податку",
                progressiveTaxBrackets: "Прогресивні Податкові Шкали",
                flatRateDescription: "плоска ставка на всі доходи від {currency} 0",
                taxCalculation: "Розрахунок Податку",
                netIncome_: "Чистий Дохід",
                howFlatTaxWorks: "Як Працює Плоский Податок",
                flatTaxExplanation: "Кожна {currency}, яку ви заробляєте, оподатковується рівно {rate}%, незалежно від рівня доходу. Без шкал, без складнощів.",
                taxableAmount: "Оподатковувана сума",
                taxFromBracket: "Податок з цієї шкали",
                incomeBelowBracket: "Дохід нижче цієї шкали",
                noTaxInBracket: "Немає податку в цій шкалі",
                yourCurrentBracket: "ВАША ПОТОЧНА ШКАЛА",
                totalIncomeTax: "ЗАГАЛЬНИЙ ПРИБУТКОВИЙ ПОДАТОК",
                nextBracketInfo: "Поріг наступної шкали",
                earnMore: "Заробіть {amount} більше, щоб досягти",
                bracketRange: "{min} - {max}",
                unlimitedBracket: "∞",
                closeInstruction: "Натисніть поза межами або ESC для закриття",

                // Loading and Messages
                calculatingTaxes: "Розрахунок податків...",
                loadingMap: "Завантаження карти...",
                noResults: "Результатів не знайдено",
                errorOccurred: "Сталася помилка",
                tryAgain: "Будь ласка, спробуйте ще раз",

                // Disclaimer
                disclaimer: "Застереження:",
                disclaimerText: "Цей калькулятор надає оцінки на основі базових шкал прибуткового податку на 2024-2025 роки. Фактичні податки можуть відрізнятися через відрахування, пільги, внески соціального страхування, муніципальні податки та інші фактори. Проконсультуйтеся з податковим консультантом для точних розрахунків. Дані охоплюють 146+ країн з прогресивними, плоскими та безподатковими системами.",

                // Language Selector
                language: "Мова",
                selectLanguage: "Виберіть Мову",

                // Search Currency Dropdown
                searchCurrencies: "Пошук валют...",
                noCurrenciesFound: "Валют не знайдено",
                selectCurrency: "Виберіть валюту...",

                // Grid View
                gridView: "Сітковий Вид",
                mapView: "Вид Карти",

                // Error Messages
                failedToInitialize: "Не вдалося ініціалізувати програму. Будь ласка, оновіть сторінку.",
                calculationError: "Помилка під час розрахунку",
                invalidSalary: "Будь ласка, введіть дійсну суму зарплати",
                currencyNotSupported: "Валюта не підтримується",

                // Country Status Messages
                taxHaven: "Податкова Гавань",
                noPersonalIncomeTax: "Без Особистого Прибуткового Податку",
                simpleSystem: "Проста Податкова Система",
                complexSystem: "Складна Податкова Система"
            }
        };
    }

    // Get translated text
    t(key, params = {}) {
        const translation = this.translations[this.currentLanguage]?.[key] ||
                          this.translations['en']?.[key] ||
                          key;

        // Replace parameters in translation
        return this.interpolate(translation, params);
    }

    // Replace placeholders with parameters
    interpolate(text, params) {
        return text.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    // Set current language
    setLanguage(languageCode) {
        if (this.translations[languageCode]) {
            this.currentLanguage = languageCode;
            this.notifyLanguageChange();
            return true;
        }
        return false;
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Get available languages
    getAvailableLanguages() {
        return [
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'es', name: 'Spanish', nativeName: 'Español' },
            { code: 'fr', name: 'French', nativeName: 'Français' },
            { code: 'de', name: 'German', nativeName: 'Deutsch' },
            { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' }
        ];
    }

    // Notify about language change
    notifyLanguageChange() {
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLanguage }
        }));
    }

    // Get browser language
    getBrowserLanguage() {
        const lang = navigator.language || navigator.userLanguage;
        const langCode = lang.split('-')[0];
        return this.translations[langCode] ? langCode : 'en';
    }

    // Initialize with browser language
    initializeWithBrowserLanguage() {
        const browserLang = this.getBrowserLanguage();
        this.setLanguage(browserLang);
    }
}

// Create global translation manager instance
export const i18n = new TranslationManager();

// Global translation function
window.t = (key, params) => i18n.t(key, params);