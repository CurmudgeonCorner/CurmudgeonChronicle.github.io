// scripts.js
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
    updateUtterancesTheme(); // Update Utterances on initial load
};

// Toggle theme
const toggleTheme = () => {
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateUtterancesTheme(); // Update Utterances on theme change
};

// Update Utterances theme by clearing and reloading the script
const updateUtterancesTheme = () => {
    const utterancesContainer = document.querySelector('#comments');
    if (!utterancesContainer) return;

    // Clear all content in #comments to prevent duplicates
    utterancesContainer.innerHTML = '';

    // Create new script
    const theme = root.getAttribute('data-theme') === 'dark' ? 'github-dark' : 'github-light';
    const script = document.createElement('script');
    script.id = 'utterances-script';
    script.src = 'https://utteranc.es/client.js';
    script.setAttribute('repo', 'CurmudgeonCorner/curmudgeon-comments');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', theme);
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    // Append script to comments container
    utterancesContainer.appendChild(script);
};

// Event listeners
window.addEventListener('scroll', () => {
    let scrollTop = window.scrollY || document.documentElement.scrollTop;
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
        updateUtterancesTheme();
    }
});