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
        const refIds = citation.getAttribute('data-ref').trim().split(',').map(id => id.trim()).filter(id => id); // Split into multiple refIds
        const pageAttr = citation.getAttribute('data-page'); // Get page attribute as string

        console.log(`Processing citation: refIds=${refIds.join(', ')}, pageAttr=${pageAttr}`); // Debug log

        let validRefIds = [];
        refIds.forEach(refId => {
            if (!document.getElementById(refId)) {
                console.warn(`Reference with ID "${refId}" not found in references list.`);
            } else {
                validRefIds.push(refId);
            }
        });

        if (validRefIds.length === 0) {
            citation.outerHTML = '<span class="cite-ref">[?]</span>';
            return;
        }

        let pageText = '';
        let pages = [];
        let hasRange = false;
        if (pageAttr) {
            // Split by commas and process each page segment
            const pageSegments = pageAttr.split(',').map(p => p.trim()).filter(p => p);
            pages = pageSegments.map(segment => {
                // Check for range (e.g., "224-225")
                const rangeMatch = segment.match(/^(\d+)-(\d+)$/);
                if (rangeMatch && !isNaN(rangeMatch[1]) && !isNaN(rangeMatch[2])) {
                    hasRange = true;
                    return `${rangeMatch[1]}-${rangeMatch[2]}`; // Keep as range string
                }
                return segment; // Single page
            });
            console.log(`Pages array: ${JSON.stringify(pages)}`); // Debug pages

            if (pages.length === 1 && !hasRange) {
                pageText = `, p. ${pages[0]}`; // Single page, no range
            } else {
                pageText = `, pp. ${pages.join(', ')}`; // Multiple pages or range
            }
        }

        // Generate links for each valid refId with unique numbers
        const links = validRefIds.map(refId => {
            let number = citationMap.get(refId);
            if (!number) {
                number = currentNumber++;
                citationMap.set(refId, number);
                console.log(`New number assigned: ${refId} = ${number}`);
            }
            const ariaPageText = pages.length > 0 ? `, page${pages.length > 1 || hasRange ? 's' : ''} ${pageAttr ? pageAttr.replace(/, /g, ', ') : ''}` : '';
            return `<a href="#${refId}" class="cite-ref" aria-label="Reference ${number}${ariaPageText}">[${number}${pageText}]</a>`;
        });

        const linkOutput = validRefIds.length > 1
            ? `<span class="multi-cite">${links.join(' ')}</span>` // Wrap multiple citations
            : links[0]; // Single citation

        console.log(`Generated link output: ${linkOutput}`); // Debug link output

        try {
            citation.outerHTML = linkOutput;
        } catch (e) {
            console.error(`Failed to replace citation for refIds ${refIds.join(', ')}: ${e.message}`);
        }
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