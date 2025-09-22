import { Application } from './components/Application.js';

// Global application instance
let app = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('🚀 Initializing Global Tax Calculator...');

        // Create and initialize the application
        app = await Application.create();

        console.log('✅ Application ready!');

        // Make app available globally for debugging
        window.taxCalculatorApp = app;

    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        showErrorMessage('Failed to initialize the application. Please refresh the page.');
    }
});

// Show error message to user
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 10000;
        max-width: 300px;
    `;
    errorDiv.textContent = message;

    document.body.appendChild(errorDiv);

    // Remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
        }
    }, 5000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (app) {
        app.destroy();
    }
});