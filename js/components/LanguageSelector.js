// Language Selector Component
import { i18n } from '../translations.js';

export class LanguageSelector {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.init();
    }

    init() {
        this.createLanguageSelector();
        this.attachEventListeners();
    }

    createLanguageSelector() {
        const languages = i18n.getAvailableLanguages();
        const currentLang = i18n.getCurrentLanguage();

        this.container.innerHTML = `
            <div class="language-selector">
                <label for="languageSelect">${i18n.t('language')}:</label>
                <select id="languageSelect" class="language-select">
                    ${languages.map(lang =>
                        `<option value="${lang.code}" ${lang.code === currentLang ? 'selected' : ''}>
                            ${lang.nativeName}
                        </option>`
                    ).join('')}
                </select>
            </div>
        `;
    }

    attachEventListeners() {
        const select = this.container.querySelector('#languageSelect');
        if (select) {
            select.addEventListener('change', (e) => {
                const newLanguage = e.target.value;
                i18n.setLanguage(newLanguage);
                this.saveLanguagePreference(newLanguage);
            });
        }

        // Listen for language changes from other sources
        document.addEventListener('languageChanged', () => {
            this.updateSelector();
        });
    }

    updateSelector() {
        const select = this.container.querySelector('#languageSelect');
        if (select) {
            select.value = i18n.getCurrentLanguage();
        }

        // Update label text
        const label = this.container.querySelector('label');
        if (label) {
            label.textContent = i18n.t('language') + ':';
        }
    }

    saveLanguagePreference(language) {
        try {
            localStorage.setItem('taxCalculatorLanguage', language);
        } catch (e) {
            console.warn('Could not save language preference:', e);
        }
    }

    loadLanguagePreference() {
        try {
            const savedLanguage = localStorage.getItem('taxCalculatorLanguage');
            if (savedLanguage && i18n.setLanguage(savedLanguage)) {
                return savedLanguage;
            }
        } catch (e) {
            console.warn('Could not load language preference:', e);
        }
        return null;
    }

    // Initialize with saved preference or browser language
    initializeLanguage() {
        const savedLang = this.loadLanguagePreference();
        if (!savedLang) {
            i18n.initializeWithBrowserLanguage();
        }
        this.updateSelector();
    }
}