// QueryDaily Version 3 - Brutalist/Minimalist Interactions

// System initialization
console.log('[SYSTEM] QUERYDAILY_V3 INITIALIZING...');

// Navigation functionality
function scrollToStart() {
    document.getElementById('start').scrollIntoView({ behavior: 'smooth' });
}

function showSpecs() {
    alert('[SYSTEM_SPECS]\n\n' +
          'VERSION: BETA_2.0.1\n' +
          'ENGINE: AI_POWERED\n' +
          'PROCESSING: REALTIME\n' +
          'SECURITY: AES-256\n' +
          'STATUS: OPERATIONAL');
}

// Terminal typing effect
const terminalLines = document.querySelectorAll('.terminal-line .output');
let currentLine = 0;

function typeTerminalLine() {
    if (currentLine < terminalLines.length) {
        const line = terminalLines[currentLine];
        const text = line.textContent;
        line.textContent = '';
        line.style.display = 'block';

        let charIndex = 0;
        const typeChar = () => {
            if (charIndex < text.length) {
                line.textContent += text[charIndex];
                charIndex++;
                setTimeout(typeChar, 30);
            } else {
                currentLine++;
                setTimeout(typeTerminalLine, 200);
            }
        };
        typeChar();
    }
}

// Start terminal animation when visible
const terminalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            typeTerminalLine();
            terminalObserver.unobserve(entry.target);
        }
    });
});

const terminal = document.querySelector('.terminal');
if (terminal) {
    terminalObserver.observe(terminal);
}

// File upload handling
const fileZone = document.getElementById('file-zone');
const fileInput = document.getElementById('file-input');
const fileZoneContent = fileZone.querySelector('.file-zone-content');
const fileSelected = fileZone.querySelector('.file-selected');
const selectedName = fileZone.querySelector('.selected-name');
const fileClear = fileZone.querySelector('.file-clear');

// Click to upload
fileZone.addEventListener('click', (e) => {
    if (!e.target.closest('.file-clear')) {
        fileInput.click();
    }
});

// Drag and drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    fileZone.addEventListener(eventName, () => {
        fileZone.classList.add('active');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    fileZone.addEventListener(eventName, () => {
        fileZone.classList.remove('active');
    }, false);
});

// Handle file drop
fileZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    handleFiles(files);
});

// Handle file selection
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];

        // Validate file
        if (!file.name.match(/\.(pdf|docx)$/i)) {
            alert('[ERROR] INVALID_FILE_FORMAT\nACCEPTED_FORMATS: PDF, DOCX');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('[ERROR] FILE_SIZE_EXCEEDED\nMAX_SIZE: 10MB');
            return;
        }

        // Display selected file
        selectedName.textContent = file.name.toUpperCase();
        fileZoneContent.style.display = 'none';
        fileSelected.style.display = 'flex';
    }
}

// Clear file selection
fileClear.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.value = '';
    fileSelected.style.display = 'none';
    fileZoneContent.style.display = 'block';
});

// Form submission
const form = document.getElementById('init-form');
const modal = document.getElementById('modal');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate file
    if (!fileInput.files.length) {
        alert('[ERROR] NO_FILE_SELECTED\nPLEASE_UPLOAD_RESUME');
        return;
    }

    // Simulate processing
    console.log('[SYSTEM] PROCESSING_USER_DATA...');

    setTimeout(() => {
        // Show success modal
        modal.classList.add('active');

        // Reset form
        form.reset();
        fileSelected.style.display = 'none';
        fileZoneContent.style.display = 'block';

        console.log('[SYSTEM] INITIALIZATION_COMPLETE');
    }, 1000);
});

// Close modal
function closeModal() {
    modal.classList.remove('active');
}

// Modal overlay click to close
const modalOverlay = document.querySelector('.modal-overlay');
if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
}

// Glitch effect on hover
document.querySelectorAll('.btn, .method-card, .pricing-plan').forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    });
});

// Status monitor animation
const monitorDots = document.querySelectorAll('.monitor-dot');
setInterval(() => {
    monitorDots.forEach(dot => {
        if (Math.random() > 0.95) {
            dot.classList.toggle('active');
            setTimeout(() => {
                dot.classList.toggle('active');
            }, 200);
        }
    });
}, 3000);

// Scroll-triggered animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply fade-in animation to sections
document.querySelectorAll('.section-container').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.6s ease';
    scrollObserver.observe(section);
});

// Grid background parallax
document.addEventListener('mousemove', (e) => {
    const gridBg = document.querySelector('.grid-bg');
    if (gridBg) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        gridBg.style.transform = `translate(${x * 20 - 10}px, ${y * 20 - 10}px)`;
    }
});

// Navigation scroll effect
const navigation = document.querySelector('.navigation');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 100) {
        navigation.style.borderBottomWidth = '1px';
        navigation.style.boxShadow = '0 2px 0 rgba(0, 0, 0, 0.1)';
    } else {
        navigation.style.borderBottomWidth = '2px';
        navigation.style.boxShadow = 'none';
    }

    // Hide/show navigation on scroll
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
        navigation.style.transform = 'translateY(-100%)';
    } else {
        navigation.style.transform = 'translateY(0)';
    }

    lastScrollY = currentScrollY;
});

// Add system boot sequence
window.addEventListener('load', () => {
    console.log('[SYSTEM] BOOT_SEQUENCE_INITIATED');
    console.log('[SYSTEM] LOADING_MODULES...');
    console.log('[MODULE] AI_ENGINE: READY');
    console.log('[MODULE] DATABASE: CONNECTED');
    console.log('[MODULE] EMAIL_SERVICE: OPERATIONAL');
    console.log('[MODULE] SECURITY_PROTOCOL: ACTIVE');
    console.log('[SYSTEM] ALL_SYSTEMS_OPERATIONAL');
    console.log('[SYSTEM] QUERYDAILY_V3 READY');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Press 'S' to jump to start
    if (e.key === 's' || e.key === 'S') {
        if (!e.target.matches('input, textarea')) {
            scrollToStart();
        }
    }

    // Press 'ESC' to close modal
    if (e.key === 'Escape') {
        if (modal.classList.contains('active')) {
            closeModal();
        }
    }
});

// Add typing cursor effect to hero title
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    const titleLines = heroTitle.querySelectorAll('.title-line');
    titleLines.forEach((line, index) => {
        line.style.opacity = '0';
        line.style.transform = 'translateY(20px)';

        setTimeout(() => {
            line.style.transition = 'all 0.5s ease';
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Console ASCII art
console.log(`
╔═══════════════════════════════════════╗
║     ___  _   _ _____ ______   __      ║
║    / _ \\| | | |  ___|  _  \\ \\ / /      ║
║   | | | | | | | |__ | |_| |\\ V /       ║
║   | | | | | | |  __||  _ <  \\ /        ║
║   | |_| | |_| | |___| | \\ \\ | |        ║
║    \\__\\_\\\\___/\\____/\\_|  \\_\\|_|        ║
║                                        ║
║    DAILY INTERVIEW PREPARATION        ║
║    SYSTEM V3.0 - BRUTALIST EDITION    ║
╚═══════════════════════════════════════╝
`);