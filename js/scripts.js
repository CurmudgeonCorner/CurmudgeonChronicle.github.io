let lastScrollTop = 0;
const nav = document.querySelector('nav');
const themeToggle = document.querySelector('.theme-toggle');
const root = document.documentElement;

// Initialize theme based on system preference or stored preference
const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        root.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.setAttribute('data-theme', 'dark');
    } else {
        root.setAttribute('data-theme', 'light');
    }
};

// Toggle theme
const toggleTheme = () => {
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
};

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop) {
        nav.classList.add('hidden');
    } else {
        nav.classList.remove('hidden');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

// Run on page load
initializeTheme();

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
});

// Update Utterances theme
const updateUtterancesTheme = () => {
    const utterancesScript = document.querySelector('#utterances-script');
    if (utterancesScript) {
        const theme = root.getAttribute('data-theme') === 'dark' ? 'github-dark' : 'github-light';
        utterancesScript.setAttribute('theme', theme);
        // Reload Utterances iframe
        const utterancesIframe = document.querySelector('.utterances iframe');
        if (utterancesIframe) {
            utterancesIframe.contentWindow.location.reload();
        }
    }
};

// Call on theme change
root.addEventListener('DOMAttrModified', (e) => {
    if (e.attrName === 'data-theme') {
        updateUtterancesTheme();
    }
});

// Call on initial load
updateUtterancesTheme();