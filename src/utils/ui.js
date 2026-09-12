// ui.js - utility functions for DOM manipulation

function showToast(message, duration = 3000) {
    const container = document.getElementById('toast-container');
    const messageEl = document.getElementById('toast-message');
    
    messageEl.textContent = message;
    container.classList.remove('hidden');
    
    // reset animation if already showing
    container.style.animation = 'none';
    container.offsetHeight; /* trigger reflow */
    container.style.animation = null; 
    
    setTimeout(() => {
        container.classList.add('hidden');
    }, duration);
}

function showNavMessage(message, duration = 4000) {
    const container = document.getElementById('nav-message-container');
    const messageEl = document.getElementById('nav-message');
    
    messageEl.textContent = message;
    container.classList.remove('hidden');
    
    setTimeout(() => {
        container.classList.add('hidden');
    }, duration);
}

function toggleElement(elementId, show) {
    const el = document.getElementById(elementId);
    if (el) {
        if (show) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    }
}
