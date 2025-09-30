// Multi-language support for Global Tax Calculator
export const languages = {
    en: {
        name: "English",
        flag: "🇺🇸",
        translations: {
            // Header and main title
            pageTitle: "Global Tax Calculator Map",
            mainTitle: "🌍 Global Tax Calculator",
            subtitle: "Interactive map with tax calculation for {count} countries.",
            description: "Enter your salary and click \"Calculate Taxes\" to see how much you'd pay in each country.",
            mapDescription: "Labels will show calculated tax information and markers will be color-coded by tax burden.",

            // Controls
            taxCalculator: "💰 Tax Calculator",
            monthlySalary: "Monthly Salary:",
            monthlyEmployerBudget: "Monthly Employer Budget:",
            inputCurrency: "Input Currency:",
            displayCurrency: "Display Currency:",
            includeVAT: "🛍️ Include VAT in calculations",
            includeEmployerSS: "🏥 Include Employer Social Security in tax",
            calculateTaxes: "Calculate Taxes",
            language: "Language:",

            // Exchange rate status
            exchangeRateLoading: "⏳ Loading exchange rates...",
            exchangeRateSuccess: "✅ Exchange rates updated",
            exchangeRateFallback: "⚠️ Using fallback rates (API unavailable)",

            // Tax information
            taxHaven: "🏝️ Tax Haven: 0% Income Tax",
            noPersonalIncomeTax: "No personal income tax",
            activeBracket: "📊 Active Bracket",
            flatRate: "📊 Flat Rate",
            flatTaxOnAllIncome: "on all income",
            progressiveTaxBrackets: "Progressive Tax Brackets",
            taxRatesIncrease: "Tax rates increase with income level",

            // Tax breakdown
            taxBreakdown: "💸 Tax Breakdown",
            incomeTax: "🏛️ Income Tax",
            specialTaxes: "⚖️ Special Taxes",
            employeeSocialSecurity: "🏥 Employee Social Security",
            employerSocialSecurity: "🏭 Employer Social Security",
            vatOnSpending: "🛍️ VAT on Spending",
            appliedWhenSpending: "Applied when spending your after-tax income",

            // Employment cost structure
            employmentCostStructure: "💼 Employment Cost Structure",
            totalEmployerCost: "Total Employer Cost",
            includesEmployerSS: "(includes employer SS)",
            actualGrossSalary: "Actual Gross Salary",
            missingIncome: "Missing Income",
            employerSSCouldBeSalary: "Employer SS (could have been salary)",

            // Tax summary
            taxSummary: "📊 Tax Summary",
            effectiveIncomeTaxRate: "Effective Income Tax Rate",
            taxOn: "tax on",
            income: "income",

            // Calculation details
            howCalculated: "📋 How This Total Was Calculated:",
            calculation: "Calculation:",
            components: "Components:",
            vatOnNetIncome: "(net income)",

            // Net income
            netAnnualIncome: "💚 Net Annual Income",
            takehomePay: "Take-home pay after all taxes",

            // Local currency
            localCurrencyEquivalent: "Local Currency Equivalent",
            annual: "annual",
            monthly: "monthly",

            // Exchange rate info
            exchangeRateInfo: "💱 Exchange Rate Information",
            exchangeRate: "Exchange Rate",
            lastUpdated: "Last Updated",

            // Tax bracket popup
            detailedTaxBreakdown: "Detailed Tax Breakdown",
            clickForDetails: "ℹ️ Click for detailed tax bracket breakdown",

            // System types
            progressive: "Progressive",
            flat: "Flat",
            zeroPersonal: "Zero Personal Tax",

            // Error messages
            enterValidSalary: "Please enter a valid salary amount",
            countryDataNotFound: "Country data not found",
            calculationError: "Error calculating taxes",
            calculationErrorOccurred: "There was an error calculating taxes. Please try again.",

            // Results panel
            taxCalculationComplete: "Tax Calculation Complete",
            salary: "Salary",
            countriesAnalyzed: "Countries Analyzed",
            exchangeRates: "Exchange Rates",
            clickCountryLabel: "Click on any country label to see detailed tax breakdown.",

            // Ready state
            ready: "Ready",
            calculated: "Calculated",
            clickToSeeDetails: "Click to see tax details →",

            // Additional popup translations
            system: "System:",
            taxSystem: "Tax System",
            status: "Status:",
            currency: "Currency:",
            vatRate: "VAT Rate:",
            noVAT: "No VAT",
            totalEmploymentCost: "Total Employment Cost",
            missingIncomeNote: "Employer SS (could have been salary)",

            // Tax bracket popup
            taxBracketDetails: "Tax Bracket Details",
            flatTaxCalculation: "Flat tax calculation",
            taxHavenCalculation: "Tax haven calculation",
            onAllIncome: "on all income",

            // Country status
            countryInformation: "Country Information",
            clickOnCountry: "Click on a country label to see details",

            // Error states
            noTaxCalculation: "No tax calculation performed yet",
            enterSalaryToCalculate: "Enter your salary above and click \"Calculate Taxes\" to see detailed tax breakdown for {country}.",

            // Additional detailed translations
            budgetBreakdown: "Budget Breakdown",
            actualGrossSalary: "Actual Gross Salary",
            employerSS: "Employer SS",
            localCurrencyEquivalent: "Local Currency Equivalent",
            clickForTaxBracketBreakdown: "Click for detailed tax bracket breakdown",
            appliedWhenSpendingIncome: "Applied when spending your after-tax income",
            employerSocialSecurity: "Employer Social Security",
            includedInTotalTax: "Included in total tax calculation",
            ofGrossSalary: "of gross salary",
            totalTaxBurden: "Total Tax Burden",
            effectiveRateOn: "effective rate on",
            totalEmploymentBudget: "total employment budget",
            howCalculated: "How This Total Was Calculated",
            calculation: "Calculation",
            additionalEmployerCost: "Additional employer cost (not included in tax total)",
            components: "Components",
            netIncome: "net income",

            // Tax bracket popup translations
            taxBrackets: "Tax Brackets",
            taxSummary: "Tax Summary",
            flatIncomeTaxRate: "Flat Income Tax Rate",
            flatTaxSystem: "Flat Tax System",
            singleRateApplied: "Single rate applied to all income levels",
            appliedToAllIncome: "Applied to all income",
            noIncomeThresholds: "No income thresholds or brackets",
            progressiveTaxBrackets: "Progressive Tax Brackets",
            taxBreakdown: "Tax Breakdown",
            totalIncome: "Total Income",
            inUSD: "In USD",
            taxRatesIncrease: "Tax rates increase with income level",

            // Checkbox descriptions
            includeEmployerContributions: "Include employer contributions in total tax calculation",
            employeeSSAlwaysIncluded: "(Employee SS always included in tax burden)",
            vatAppliesToSpending: "VAT applies to spending (your after-tax income)",

            // Tax bracket details
            taxFromThisBracket: "Tax from this bracket",
            active: "ACTIVE",
            totalIncomeTax: "Total Income Tax",
            calculationSummary: "Calculation Summary",

            // Currencies (commonly used)
            currencies: {
                USD: "US Dollar",
                EUR: "Euro",
                GBP: "British Pound",
                UAH: "Ukrainian Hryvnia",
                PLN: "Polish Zloty",
                CAD: "Canadian Dollar"
            }
        }
    },
    uk: {
        name: "Українська",
        flag: "🇺🇦",
        translations: {
            // Header and main title
            pageTitle: "Глобальна Карта Податкового Калькулятора",
            mainTitle: "🌍 Глобальний Податковий Калькулятор",
            subtitle: "Інтерактивна карта з розрахунком податків для {count} країн.",
            description: "Введіть свою зарплату та натисніть \"Розрахувати Податки\", щоб побачити, скільки ви платитимете в кожній країні.",
            mapDescription: "Мітки покажуть інформацію про розраховані податки, а маркери будуть забарвлені відповідно до податкового навантаження.",

            // Controls
            taxCalculator: "💰 Податковий Калькулятор",
            monthlySalary: "Місячна Зарплата:",
            monthlyEmployerBudget: "Місячний Бюджет Роботодавця:",
            inputCurrency: "Валюта Введення:",
            displayCurrency: "Валюта Відображення:",
            includeVAT: "🛍️ Включити ПДВ у розрахунки",
            includeEmployerSS: "🏥 Включити Соціальні Внески Роботодавця в податок",
            calculateTaxes: "Розрахувати Податки",
            language: "Мова:",

            // Exchange rate status
            exchangeRateLoading: "⏳ Завантаження курсів валют...",
            exchangeRateSuccess: "✅ Курси валют оновлено",
            exchangeRateFallback: "⚠️ Використовуються резервні курси (API недоступний)",

            // Tax information
            taxHaven: "🏝️ Податкова Гавань: 0% Подоходний Податок",
            noPersonalIncomeTax: "Немає особистого подоходного податку",
            activeBracket: "📊 Активна Ставка",
            flatRate: "📊 Фіксована Ставка",
            flatTaxOnAllIncome: "на весь дохід",
            progressiveTaxBrackets: "Прогресивні Податкові Ставки",
            taxRatesIncrease: "Податкові ставки зростають з рівнем доходу",

            // Tax breakdown
            taxBreakdown: "💸 Розбивка Податків",
            incomeTax: "🏛️ Подоходний Податок",
            specialTaxes: "⚖️ Спеціальні Податки",
            employeeSocialSecurity: "🏥 Соціальні Внески Працівника",
            employerSocialSecurity: "🏭 Соціальні Внески Роботодавця",
            vatOnSpending: "🛍️ ПДВ на Витрати",
            appliedWhenSpending: "Застосовується при витрачанні доходу після оподаткування",

            // Employment cost structure
            employmentCostStructure: "💼 Структура Витрат на Працевлаштування",
            totalEmployerCost: "Загальні Витрати Роботодавця",
            includesEmployerSS: "(включає соціальні внески роботодавця)",
            actualGrossSalary: "Фактична Брутто Зарплата",
            missingIncome: "Втрачений Дохід",
            employerSSCouldBeSalary: "Соціальні внески роботодавця (могли б бути зарплатою)",

            // Tax summary
            taxSummary: "📊 Податкове Резюме",
            effectiveIncomeTaxRate: "Ефективна Ставка Подоходного Податку",
            taxOn: "податок з",
            income: "доходу",

            // Calculation details
            howCalculated: "📋 Як Розраховувався Цей Загальний Податок:",
            calculation: "Розрахунок:",
            components: "Компоненти:",
            vatOnNetIncome: "(чистий дохід)",

            // Net income
            netAnnualIncome: "💚 Чистий Річний Дохід",
            takehomePay: "Дохід на руки після всіх податків",

            // Local currency
            localCurrencyEquivalent: "Еквівалент в Місцевій Валюті",
            annual: "річних",
            monthly: "місячних",

            // Exchange rate info
            exchangeRateInfo: "💱 Інформація про Курс Валют",
            exchangeRate: "Курс Валют",
            lastUpdated: "Останнє Оновлення",

            // Tax bracket popup
            detailedTaxBreakdown: "Детальна Розбивка Податків",
            clickForDetails: "ℹ️ Клікніть для детальної розбивки податкових ставок",

            // System types
            progressive: "Прогресивний",
            flat: "Фіксований",
            zeroPersonal: "Без Особистого Податку",

            // Error messages
            enterValidSalary: "Будь ласка, введіть правильну суму зарплати",
            countryDataNotFound: "Дані країни не знайдено",
            calculationError: "Помилка розрахунку податків",
            calculationErrorOccurred: "Виникла помилка при розрахунку податків. Спробуйте ще раз.",

            // Results panel
            taxCalculationComplete: "Розрахунок Податків Завершено",
            salary: "Зарплата",
            countriesAnalyzed: "Проаналізовано Країн",
            exchangeRates: "Курси Валют",
            clickCountryLabel: "Клікніть на будь-яку країну, щоб побачити детальну розбивку податків.",

            // Ready state
            ready: "Готово",
            calculated: "Розраховано",
            clickToSeeDetails: "Клікніть, щоб побачити деталі податків →",

            // Additional popup translations
            system: "Система:",
            status: "Статус:",
            currency: "Валюта:",
            vatRate: "Ставка ПДВ:",
            noVAT: "Без ПДВ",
            totalEmploymentCost: "Загальні Витрати на Працевлаштування",
            missingIncomeNote: "Соц. внески роботодавця (могли б бути зарплатою)",

            // Tax bracket popup
            taxBracketDetails: "Деталі Податкових Ставок",
            flatTaxCalculation: "Розрахунок фіксованого податку",
            taxHavenCalculation: "Розрахунок податкової гавані",
            onAllIncome: "на весь дохід",

            // Country status
            countryInformation: "Інформація про Країну",
            clickOnCountry: "Клікніть на мітку країни, щоб побачити деталі",

            // Error states
            noTaxCalculation: "Розрахунок податків ще не виконано",
            enterSalaryToCalculate: "Введіть свою зарплату вище та натисніть \"Розрахувати Податки\", щоб побачити детальну розбивку податків для {country}.",

            // Additional detailed translations
            budgetBreakdown: "Розбивка Бюджету",
            actualGrossSalary: "Фактична Брутто Зарплата",
            employerSS: "Соц. внески роботодавця",
            localCurrencyEquivalent: "Еквівалент в Місцевій Валюті",
            clickForTaxBracketBreakdown: "Клікніть для детальної розбивки податкових ставок",
            appliedWhenSpendingIncome: "Застосовується при витрачанні доходу після оподаткування",
            employerSocialSecurity: "Соціальні Внески Роботодавця",
            includedInTotalTax: "Включено в загальний розрахунок податку",
            ofGrossSalary: "від брутто зарплати",
            totalTaxBurden: "Загальне Податкове Навантаження",
            effectiveRateOn: "ефективна ставка з",
            totalEmploymentBudget: "загальний бюджет працевлаштування",
            howCalculated: "Як Розраховувався Цей Загальний Податок",
            calculation: "Розрахунок",
            additionalEmployerCost: "Додаткові витрати роботодавця (не включені в загальні податки)",
            components: "Компоненти",
            netIncome: "чистий дохід",

            // Tax bracket popup translations
            taxBrackets: "Податкові Ставки",
            taxSummary: "Підсумок Податків",
            flatIncomeTaxRate: "Фіксована Ставка Податку на Доходи",
            flatTaxSystem: "Фіксована Податкова Система",
            singleRateApplied: "Єдина ставка застосовується до всіх рівнів доходу",
            appliedToAllIncome: "Застосовується до всього доходу",
            noIncomeThresholds: "Відсутні пороги або ставки доходу",
            progressiveTaxBrackets: "Прогресивні Податкові Ставки",
            taxBreakdown: "Розбивка Податків",
            totalIncome: "Загальний Дохід",
            inUSD: "В USD",
            taxRatesIncrease: "Податкові ставки зростають із рівнем доходу",

            // Checkbox descriptions
            includeEmployerContributions: "Включити внески роботодавця в загальний розрахунок податку",
            employeeSSAlwaysIncluded: "(Соц. внески працівника завжди включені в податкове навантаження)",
            vatAppliesToSpending: "ПДВ застосовується до витрат (ваш дохід після оподаткування)",

            // Tax bracket details
            taxFromThisBracket: "Податок з цієї ставки",
            active: "АКТИВНА",
            totalIncomeTax: "Загальний Податок на Доходи",
            calculationSummary: "Підсумок Розрахунку",

            // Currencies (commonly used)
            currencies: {
                USD: "Долар США",
                EUR: "Євро",
                GBP: "Британський Фунт",
                UAH: "Українська Гривня",
                PLN: "Польський Злотий",
                CAD: "Канадський Долар"
            }
        }
    },
    de: {
        name: "Deutsch",
        flag: "🇩🇪",
        translations: {
            // Header and main title
            pageTitle: "Globale Steuerrechner-Karte",
            mainTitle: "🌍 Globaler Steuerrechner",
            subtitle: "Interaktive Karte mit Steuerberechnung für {count} Länder.",
            description: "Geben Sie Ihr Gehalt ein und klicken Sie auf \"Steuern Berechnen\", um zu sehen, wie viel Sie in jedem Land zahlen würden.",
            mapDescription: "Beschriftungen zeigen berechnete Steuerinformationen und Markierungen werden nach Steuerlast farbkodiert.",

            // Controls
            taxCalculator: "💰 Steuerrechner",
            monthlySalary: "Monatsgehalt:",
            monthlyEmployerBudget: "Monatliches Arbeitgeberbudget:",
            inputCurrency: "Eingabewährung:",
            displayCurrency: "Anzeigewährung:",
            includeVAT: "🛍️ MwSt. in Berechnungen einbeziehen",
            includeEmployerSS: "🏥 Arbeitgeber-Sozialversicherung in Steuer einbeziehen",
            calculateTaxes: "Steuern Berechnen",
            language: "Sprache:",

            // Exchange rate status
            exchangeRateLoading: "⏳ Wechselkurse werden geladen...",
            exchangeRateSuccess: "✅ Wechselkurse aktualisiert",
            exchangeRateFallback: "⚠️ Verwendung von Fallback-Kursen (API nicht verfügbar)",

            // Tax information
            taxHaven: "🏝️ Steuerparadies: 0% Einkommensteuer",
            noPersonalIncomeTax: "Keine persönliche Einkommensteuer",
            activeBracket: "📊 Aktive Steuerklasse",
            flatRate: "📊 Einheitssatz",
            flatTaxOnAllIncome: "auf gesamtes Einkommen",
            progressiveTaxBrackets: "Progressive Steuerklassen",
            taxRatesIncrease: "Steuersätze steigen mit dem Einkommensniveau",

            // Checkbox descriptions
            includeEmployerContributions: "Arbeitgeberbeiträge in die Gesamtsteuerberechnung einbeziehen",
            employeeSSAlwaysIncluded: "(Arbeitnehmer-Sozialversicherung immer in Steuerlast enthalten)",
            vatAppliesToSpending: "MwSt. gilt für Ausgaben (Ihr Einkommen nach Steuern)",

            // Tax bracket details
            taxFromThisBracket: "Steuer aus dieser Kategorie",
            active: "AKTIV",
            totalIncomeTax: "Gesamte Einkommensteuer",
            calculationSummary: "Berechnungsübersicht",

            // Tax breakdown
            taxBreakdown: "💸 Steueraufschlüsselung",
            incomeTax: "🏛️ Einkommensteuer",
            specialTaxes: "⚖️ Besondere Steuern",
            employeeSocialSecurity: "🏥 Arbeitnehmer-Sozialversicherung",
            employerSocialSecurity: "🏭 Arbeitgeber-Sozialversicherung",
            vatOnSpending: "🛍️ MwSt. auf Ausgaben",
            appliedWhenSpending: "Angewendet beim Ausgeben Ihres Nettoeinkommens",

            // Employment cost structure
            employmentCostStructure: "💼 Beschäftigungskostenstruktur",
            totalEmployerCost: "Gesamte Arbeitgeberkosten",
            includesEmployerSS: "(einschließlich Arbeitgeber-Sozialversicherung)",
            actualGrossSalary: "Tatsächliches Bruttogehalt",
            missingIncome: "Entgangenes Einkommen",
            employerSSCouldBeSalary: "Arbeitgeber-Sozialversicherung (hätte Gehalt sein können)",

            // Tax summary
            taxSummary: "📊 Steuerzusammenfassung",
            effectiveIncomeTaxRate: "Effektiver Einkommensteuersatz",
            taxOn: "Steuer auf",
            income: "Einkommen",

            // Calculation details
            howCalculated: "📋 Wie Diese Gesamtsteuer Berechnet Wurde:",
            calculation: "Berechnung:",
            additionalEmployerCost: "Zusätzliche Arbeitgeberkosten (nicht in Steuersumme enthalten)",
            components: "Komponenten:",
            vatOnNetIncome: "(Nettoeinkommen)",

            // Tax bracket popup translations
            taxBrackets: "Steuerklassen",
            taxSummary: "Steuerzusammenfassung",
            flatIncomeTaxRate: "Einheitlicher Einkommensteuersatz",
            flatTaxSystem: "Einheitliches Steuersystem",
            singleRateApplied: "Einheitlicher Satz auf alle Einkommensstufen angewendet",
            appliedToAllIncome: "Auf alle Einkommen angewendet",
            noIncomeThresholds: "Keine Einkommensschwellen oder Kategorien",
            progressiveTaxBrackets: "Progressive Steuerklassen",
            taxBreakdown: "Steueraufschlüsselung",
            totalIncome: "Gesamteinkommen",
            inUSD: "In USD",
            taxRatesIncrease: "Steuersätze steigen mit dem Einkommensniveau",

            // Net income
            netAnnualIncome: "💚 Netto-Jahreseinkommen",
            takehomePay: "Nettolohn nach allen Steuern",

            // Local currency
            localCurrencyEquivalent: "Lokalwährungs-Äquivalent",
            annual: "jährlich",
            monthly: "monatlich",

            // Exchange rate info
            exchangeRateInfo: "💱 Wechselkurs-Informationen",
            exchangeRate: "Wechselkurs",
            lastUpdated: "Zuletzt Aktualisiert",

            // Tax bracket popup
            detailedTaxBreakdown: "Detaillierte Steueraufschlüsselung",
            clickForDetails: "ℹ️ Für detaillierte Steuerklassen-Aufschlüsselung klicken",

            // System types
            progressive: "Progressiv",
            flat: "Einheitlich",
            zeroPersonal: "Keine Persönliche Steuer",

            // Error messages
            enterValidSalary: "Bitte geben Sie einen gültigen Gehaltsbetrag ein",
            countryDataNotFound: "Länderdaten nicht gefunden",
            calculationError: "Fehler bei Steuerberechnung",
            calculationErrorOccurred: "Bei der Steuerberechnung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",

            // Results panel
            taxCalculationComplete: "Steuerberechnung Abgeschlossen",
            salary: "Gehalt",
            countriesAnalyzed: "Analysierte Länder",
            exchangeRates: "Wechselkurse",
            clickCountryLabel: "Klicken Sie auf ein beliebiges Land, um eine detaillierte Steueraufschlüsselung zu sehen.",

            // Ready state
            ready: "Bereit",
            calculated: "Berechnet",
            clickToSeeDetails: "Klicken Sie, um Steuerdetails zu sehen →",

            // Additional popup translations
            system: "System:",
            status: "Status:",
            currency: "Währung:",
            vatRate: "MwSt.-Satz:",
            noVAT: "Keine MwSt.",
            totalEmploymentCost: "Gesamte Beschäftigungskosten",
            missingIncomeNote: "Arbeitgeber-Sozialversicherung (hätte Gehalt sein können)",

            // Tax bracket popup
            taxBracketDetails: "Steuerklassen-Details",
            flatTaxCalculation: "Einheitssteuersatz-Berechnung",
            taxHavenCalculation: "Steuerparadies-Berechnung",
            onAllIncome: "auf gesamtes Einkommen",

            // Country status
            countryInformation: "Länderinformationen",
            clickOnCountry: "Klicken Sie auf ein Länderlabel für Details",

            // Error states
            noTaxCalculation: "Noch keine Steuerberechnung durchgeführt",
            enterSalaryToCalculate: "Geben Sie Ihr Gehalt oben ein und klicken Sie auf \"Steuern Berechnen\", um eine detaillierte Steueraufschlüsselung für {country} zu sehen.",

            // Currencies (commonly used)
            currencies: {
                USD: "US-Dollar",
                EUR: "Euro",
                GBP: "Britisches Pfund",
                UAH: "Ukrainische Hrywnja",
                PLN: "Polnischer Zloty",
                CAD: "Kanadischer Dollar"
            }
        }
    },
    it: {
        name: "Italiano",
        flag: "🇮🇹",
        translations: {
            // Header and main title
            pageTitle: "Mappa Calcolatore Fiscale Globale",
            mainTitle: "🌍 Calcolatore Fiscale Globale",
            subtitle: "Mappa interattiva con calcolo delle tasse per {count} paesi.",
            description: "Inserisci il tuo stipendio e clicca \"Calcola Tasse\" per vedere quanto pagheresti in ogni paese.",
            mapDescription: "Le etichette mostreranno le informazioni fiscali calcolate e i marcatori saranno colorati in base al carico fiscale.",

            // Controls
            taxCalculator: "💰 Calcolatore Fiscale",
            monthlySalary: "Stipendio Mensile:",
            monthlyEmployerBudget: "Budget Mensile del Datore di Lavoro:",
            inputCurrency: "Valuta di Input:",
            displayCurrency: "Valuta di Visualizzazione:",
            includeVAT: "🛍️ Includi IVA nei calcoli",
            includeEmployerSS: "🏥 Includi Contributi Sociali Datore di Lavoro nella tassa",
            calculateTaxes: "Calcola Tasse",
            language: "Lingua:",

            // Exchange rate status
            exchangeRateLoading: "⏳ Caricamento tassi di cambio...",
            exchangeRateSuccess: "✅ Tassi di cambio aggiornati",
            exchangeRateFallback: "⚠️ Utilizzo tassi di riserva (API non disponibile)",

            // Tax information
            taxHaven: "🏝️ Paradiso Fiscale: 0% Imposta sul Reddito",
            noPersonalIncomeTax: "Nessuna imposta personale sul reddito",
            activeBracket: "📊 Scaglione Attivo",
            flatRate: "📊 Aliquota Fissa",
            flatTaxOnAllIncome: "su tutto il reddito",
            progressiveTaxBrackets: "Scaglioni Fiscali Progressivi",
            taxRatesIncrease: "Le aliquote fiscali aumentano con il livello di reddito",

            // Checkbox descriptions
            includeEmployerContributions: "Includere i contributi del datore di lavoro nel calcolo fiscale totale",
            employeeSSAlwaysIncluded: "(Contributi SS del dipendente sempre inclusi nel carico fiscale)",
            vatAppliesToSpending: "L'IVA si applica alla spesa (il tuo reddito dopo le tasse)",

            // Tax bracket details
            taxFromThisBracket: "Tassa da questo scaglione",
            active: "ATTIVO",
            totalIncomeTax: "Imposta Totale sul Reddito",
            calculationSummary: "Riepilogo Calcolo",

            // Tax breakdown
            taxBreakdown: "💸 Ripartizione Fiscale",
            incomeTax: "🏛️ Imposta sul Reddito",
            specialTaxes: "⚖️ Tasse Speciali",
            employeeSocialSecurity: "🏥 Contributi Sociali Dipendente",
            employerSocialSecurity: "🏭 Contributi Sociali Datore di Lavoro",
            vatOnSpending: "🛍️ IVA sulla Spesa",
            appliedWhenSpending: "Applicata quando spendi il tuo reddito netto",

            // Employment cost structure
            employmentCostStructure: "💼 Struttura Costi di Impiego",
            totalEmployerCost: "Costo Totale Datore di Lavoro",
            includesEmployerSS: "(include contributi sociali datore di lavoro)",
            actualGrossSalary: "Stipendio Lordo Effettivo",
            missingIncome: "Reddito Mancante",
            employerSSCouldBeSalary: "Contributi sociali datore di lavoro (avrebbero potuto essere stipendio)",

            // Tax summary
            taxSummary: "📊 Riassunto Fiscale",
            effectiveIncomeTaxRate: "Aliquota Effettiva Imposta sul Reddito",
            taxOn: "tassa su",
            income: "reddito",

            // Calculation details
            howCalculated: "📋 Come È Stata Calcolata Questa Tassa Totale:",
            calculation: "Calcolo:",
            additionalEmployerCost: "Costi aggiuntivi del datore di lavoro (non inclusi nel totale delle tasse)",
            components: "Componenti:",
            vatOnNetIncome: "(reddito netto)",

            // Tax bracket popup translations
            taxBrackets: "Fasce Fiscali",
            taxSummary: "Riepilogo Fiscale",
            flatIncomeTaxRate: "Aliquota Fiscale Fissa",
            flatTaxSystem: "Sistema Fiscale Fisso",
            singleRateApplied: "Aliquota singola applicata a tutti i livelli di reddito",
            appliedToAllIncome: "Applicato a tutto il reddito",
            noIncomeThresholds: "Nessuna soglia o categoria di reddito",
            progressiveTaxBrackets: "Fasce Fiscali Progressive",
            taxBreakdown: "Ripartizione Fiscale",
            totalIncome: "Reddito Totale",
            inUSD: "In USD",
            taxRatesIncrease: "Le aliquote fiscali aumentano con il livello di reddito",

            // Net income
            netAnnualIncome: "💚 Reddito Netto Annuale",
            takehomePay: "Stipendio netto dopo tutte le tasse",

            // Local currency
            localCurrencyEquivalent: "Equivalente in Valuta Locale",
            annual: "annuali",
            monthly: "mensili",

            // Exchange rate info
            exchangeRateInfo: "💱 Informazioni Tasso di Cambio",
            exchangeRate: "Tasso di Cambio",
            lastUpdated: "Ultimo Aggiornamento",

            // Tax bracket popup
            detailedTaxBreakdown: "Ripartizione Fiscale Dettagliata",
            clickForDetails: "ℹ️ Clicca per ripartizione dettagliata scaglioni fiscali",

            // System types
            progressive: "Progressivo",
            flat: "Fisso",
            zeroPersonal: "Nessuna Tassa Personale",

            // Error messages
            enterValidSalary: "Inserisci un importo di stipendio valido",
            countryDataNotFound: "Dati paese non trovati",
            calculationError: "Errore nel calcolo delle tasse",
            calculationErrorOccurred: "Si è verificato un errore nel calcolo delle tasse. Riprova.",

            // Results panel
            taxCalculationComplete: "Calcolo Fiscale Completato",
            salary: "Stipendio",
            countriesAnalyzed: "Paesi Analizzati",
            exchangeRates: "Tassi di Cambio",
            clickCountryLabel: "Clicca su qualsiasi paese per vedere la ripartizione fiscale dettagliata.",

            // Ready state
            ready: "Pronto",
            calculated: "Calcolato",
            clickToSeeDetails: "Clicca per vedere i dettagli fiscali →",

            // Currencies (commonly used)
            currencies: {
                USD: "Dollaro USA",
                EUR: "Euro",
                GBP: "Sterlina Britannica",
                UAH: "Grivnia Ucraina",
                PLN: "Zloty Polacco",
                CAD: "Dollaro Canadese"
            }
        }
    },
    es: {
        name: "Español",
        flag: "🇪🇸",
        translations: {
            // Header and main title
            pageTitle: "Mapa Calculadora Fiscal Global",
            mainTitle: "🌍 Calculadora Fiscal Global",
            subtitle: "Mapa interactivo con cálculo de impuestos para {count} países.",
            description: "Ingresa tu salario y haz clic en \"Calcular Impuestos\" para ver cuánto pagarías en cada país.",
            mapDescription: "Las etiquetas mostrarán información fiscal calculada y los marcadores estarán codificados por colores según la carga fiscal.",

            // Controls
            taxCalculator: "💰 Calculadora Fiscal",
            monthlySalary: "Salario Mensual:",
            monthlyEmployerBudget: "Presupuesto Mensual del Empleador:",
            inputCurrency: "Moneda de Entrada:",
            displayCurrency: "Moneda de Visualización:",
            includeVAT: "🛍️ Incluir IVA en cálculos",
            includeEmployerSS: "🏥 Incluir Seguridad Social del Empleador en impuesto",
            calculateTaxes: "Calcular Impuestos",
            language: "Idioma:",

            // Exchange rate status
            exchangeRateLoading: "⏳ Cargando tipos de cambio...",
            exchangeRateSuccess: "✅ Tipos de cambio actualizados",
            exchangeRateFallback: "⚠️ Usando tipos de respaldo (API no disponible)",

            // Tax information
            taxHaven: "🏝️ Paraíso Fiscal: 0% Impuesto sobre la Renta",
            noPersonalIncomeTax: "Sin impuesto personal sobre la renta",
            activeBracket: "📊 Tramo Activo",
            flatRate: "📊 Tasa Fija",
            flatTaxOnAllIncome: "sobre todos los ingresos",
            progressiveTaxBrackets: "Tramos Fiscales Progresivos",
            taxRatesIncrease: "Las tasas de impuestos aumentan con el nivel de ingresos",

            // Checkbox descriptions
            includeEmployerContributions: "Incluir contribuciones del empleador en el cálculo fiscal total",
            employeeSSAlwaysIncluded: "(SS del empleado siempre incluida en la carga fiscal)",
            vatAppliesToSpending: "El IVA se aplica al gasto (su ingreso después de impuestos)",

            // Tax bracket details
            taxFromThisBracket: "Impuesto de este tramo",
            active: "ACTIVO",
            totalIncomeTax: "Impuesto Total sobre la Renta",
            calculationSummary: "Resumen de Cálculo",

            // Tax breakdown
            taxBreakdown: "💸 Desglose Fiscal",
            incomeTax: "🏛️ Impuesto sobre la Renta",
            specialTaxes: "⚖️ Impuestos Especiales",
            employeeSocialSecurity: "🏥 Seguridad Social del Empleado",
            employerSocialSecurity: "🏭 Seguridad Social del Empleador",
            vatOnSpending: "🛍️ IVA en Gastos",
            appliedWhenSpending: "Aplicado al gastar tu ingreso después de impuestos",

            // Employment cost structure
            employmentCostStructure: "💼 Estructura de Costos de Empleo",
            totalEmployerCost: "Costo Total del Empleador",
            includesEmployerSS: "(incluye seguridad social del empleador)",
            actualGrossSalary: "Salario Bruto Real",
            missingIncome: "Ingreso Perdido",
            employerSSCouldBeSalary: "Seguridad social del empleador (podría haber sido salario)",

            // Tax summary
            taxSummary: "📊 Resumen Fiscal",
            effectiveIncomeTaxRate: "Tasa Efectiva de Impuesto sobre la Renta",
            taxOn: "impuesto sobre",
            income: "ingresos",

            // Calculation details
            howCalculated: "📋 Cómo Se Calculó Este Impuesto Total:",
            calculation: "Cálculo:",
            additionalEmployerCost: "Costo adicional del empleador (no incluido en el total de impuestos)",
            components: "Componentes:",
            vatOnNetIncome: "(ingreso neto)",

            // Tax bracket popup translations
            taxBrackets: "Tramos Fiscales",
            taxSummary: "Resumen Fiscal",
            flatIncomeTaxRate: "Tasa de Impuesto Fija",
            flatTaxSystem: "Sistema Fiscal Fijo",
            singleRateApplied: "Tasa única aplicada a todos los niveles de ingresos",
            appliedToAllIncome: "Aplicado a todos los ingresos",
            noIncomeThresholds: "Sin umbrales o categorías de ingresos",
            progressiveTaxBrackets: "Tramos Fiscales Progresivos",
            taxBreakdown: "Desglose Fiscal",
            totalIncome: "Ingreso Total",
            inUSD: "En USD",
            taxRatesIncrease: "Las tasas de impuestos aumentan con el nivel de ingresos",

            // Net income
            netAnnualIncome: "💚 Ingreso Neto Anual",
            takehomePay: "Salario neto después de todos los impuestos",

            // Local currency
            localCurrencyEquivalent: "Equivalente en Moneda Local",
            annual: "anuales",
            monthly: "mensuales",

            // Exchange rate info
            exchangeRateInfo: "💱 Información Tipo de Cambio",
            exchangeRate: "Tipo de Cambio",
            lastUpdated: "Última Actualización",

            // Tax bracket popup
            detailedTaxBreakdown: "Desglose Fiscal Detallado",
            clickForDetails: "ℹ️ Haz clic para desglose detallado de tramos fiscales",

            // System types
            progressive: "Progresivo",
            flat: "Fijo",
            zeroPersonal: "Sin Impuesto Personal",

            // Error messages
            enterValidSalary: "Por favor ingresa una cantidad de salario válida",
            countryDataNotFound: "Datos del país no encontrados",
            calculationError: "Error calculando impuestos",
            calculationErrorOccurred: "Ocurrió un error al calcular los impuestos. Por favor, inténtelo de nuevo.",

            // Results panel
            taxCalculationComplete: "Cálculo de Impuestos Completado",
            salary: "Salario",
            countriesAnalyzed: "Países Analizados",
            exchangeRates: "Tipos de Cambio",
            clickCountryLabel: "Haga clic en cualquier país para ver el desglose fiscal detallado.",

            // Ready state
            ready: "Listo",
            calculated: "Calculado",
            clickToSeeDetails: "Haz clic para ver detalles fiscales →",

            // Currencies (commonly used)
            currencies: {
                USD: "Dólar Estadounidense",
                EUR: "Euro",
                GBP: "Libra Esterlina",
                UAH: "Grivna Ucraniana",
                PLN: "Zloty Polaco",
                CAD: "Dólar Canadiense"
            }
        }
    }
};

// Language manager class
export class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.supportedLanguages = Object.keys(languages);
        this.loadSavedLanguage();
    }

    // Load language from localStorage
    loadSavedLanguage() {
        const saved = localStorage.getItem('tax-calculator-language');
        if (saved && this.supportedLanguages.includes(saved)) {
            this.currentLanguage = saved;
        }
    }

    // Save language to localStorage
    saveLanguage() {
        localStorage.setItem('tax-calculator-language', this.currentLanguage);
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Set new language
    setLanguage(languageCode) {
        if (this.supportedLanguages.includes(languageCode)) {
            this.currentLanguage = languageCode;
            this.saveLanguage();
            return true;
        }
        return false;
    }

    // Get translation for a key
    t(key, replacements = {}) {
        const translation = this.getNestedTranslation(key);
        return this.replaceVariables(translation, replacements);
    }

    // Get nested translation (e.g., "currencies.USD")
    getNestedTranslation(key) {
        const keys = key.split('.');
        let translation = languages[this.currentLanguage]?.translations;

        for (const k of keys) {
            translation = translation?.[k];
        }

        // Fallback to English if translation not found
        if (translation === undefined) {
            translation = languages.en.translations;
            for (const k of keys) {
                translation = translation?.[k];
            }
        }

        return translation || key;
    }

    // Replace variables in translation strings
    replaceVariables(text, replacements) {
        if (typeof text !== 'string') return text;

        return text.replace(/\{(\w+)\}/g, (match, variable) => {
            return replacements[variable] || match;
        });
    }

    // Get all available languages
    getAvailableLanguages() {
        return Object.keys(languages).map(code => ({
            code,
            name: languages[code].name,
            flag: languages[code].flag
        }));
    }

    // Get formatted currency name
    getCurrencyName(currencyCode) {
        return this.t(`currencies.${currencyCode}`) || currencyCode;
    }
}

// Create global instance
export const i18n = new LanguageManager();