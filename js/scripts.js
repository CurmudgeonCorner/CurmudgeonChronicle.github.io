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
    updateUtterancesTheme();
};

// Toggle theme
const toggleTheme = () => {
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateUtterancesTheme();
};

// Update Utterances theme
const updateUtterancesTheme = () => {
    const utterancesContainer = document.querySelector('#comments');
    if (!utterancesContainer) return;

    utterancesContainer.innerHTML = '';
    const theme = root.getAttribute('data-theme') === 'dark' ? 'github-dark' : 'github-light';
    const script = document.createElement('script');
    script.id = 'utterances-script';
    script.src = 'https://utteranc.es/client.js';
    script.setAttribute('repo', 'CurmudgeonCorner/curmudgeon-comments');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', theme);
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;
    utterancesContainer.appendChild(script);
};

// Scroll-based nav hide/show
window.addEventListener('scroll', () => {
    let scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop) {
        nav.classList.add('hidden');
    } else {
        nav.classList.remove('hidden');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// Theme toggle
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// Hamburger menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

// Citation logic
document.addEventListener('DOMContentLoaded', () => {
    const citations = document.querySelectorAll('cite[data-ref]');
    const referencesOl = document.querySelector('.references ol');
    const citationMap = new Map(); // Maps refId to number

    let currentNumber = 1;

    // Process citations and assign numbers
    citations.forEach(citation => {
        const refId = citation.getAttribute('data-ref').trim();
        const pageAttr = citation.getAttribute('data-page'); // Get page attribute as string

        console.log(`Processing citation: refId=${refId}, pageAttr=${pageAttr}`); // Debug log

        if (!document.getElementById(refId)) {
            console.warn(`Reference with ID "${refId}" not found in references list.`);
            citation.outerHTML = '<span class="cite-ref">[?]</span>';
            return;
        }

        // Assign number only once per refId
        if (!citationMap.has(refId)) {
            citationMap.set(refId, currentNumber++);
            console.log(`New number assigned: ${refId} = ${citationMap.get(refId)}`);
        }

        const number = citationMap.get(refId);
        let pageText = '';
        let pages = [];
        if (pageAttr) {
            pages = pageAttr.split(',').map(p => p.trim()).filter(p => p); // Split and clean page numbers
            console.log(`Pages array: ${JSON.stringify(pages)}`); // Debug pages
            if (pages.length === 1) {
                pageText = `, p. ${pages[0]}`; // Single page
            } else if (pages.length > 1) {
                pageText = `, pp. ${pages.join(', ')}`; // Multiple pages
            } else {
                console.warn(`No valid pages found in ${pageAttr} for refId ${refId}`);
            }
        }

        const ariaPageText = pages.length > 0 ? `, page${pages.length > 1 ? 's' : ''} ${pageAttr ? pageAttr.replace(/, /g, ', ') : ''}` : '';
        const link = `<a href="#${refId}" class="cite-ref" aria-label="Reference ${number}${pageText ? ariaPageText : ''}">[${number}${pageText}]</a>`;
        console.log(`Generated link: ${link}`); // Debug link

        citation.outerHTML = link;
    });

    // Reorder references list if it exists
    if (referencesOl && citationMap.size > 0) {
        const refItems = Array.from(document.querySelectorAll('.references ol li'));
        const sortedRefs = Array.from(citationMap.entries())
            .sort((a, b) => a[1] - b[1])
            .map(([refId]) => refItems.find(item => item.id === refId))
            .filter(item => item);
        referencesOl.innerHTML = '';
        sortedRefs.forEach(item => referencesOl.appendChild(item));
        refItems.forEach(item => {
            if (item.id && !citationMap.has(item.id)) {
                item.style.display = 'none';
            }
        });
    }

    // Add smooth scrolling to citation links
    document.querySelectorAll('.cite-ref').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const targetId = link.getAttribute('href')?.substring(1);
            if (targetId) {
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    target.classList.add('highlight');
                    setTimeout(() => target.classList.remove('highlight'), 1000);
                }
            }
        });
    });
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        updateUtterancesTheme();
    }
});

// Initialize theme on page load
initializeTheme();