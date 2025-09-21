// QueryDaily Version 2 - Enhanced Interactivity

// Smooth scroll functionality
function scrollToApply() {
    document.getElementById('apply').scrollIntoView({ behavior: 'smooth' });
}

function scrollToDemo() {
    // In a real app, this would show a demo video/modal
    alert('데모 영상은 준비 중입니다! 😊');
}

// Header scroll effect with glassmorphism
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.9)';
        header.style.boxShadow = '0 1px 20px rgba(0, 0, 0, 0.08)';
    }

    // Hide/show header on scroll
    if (currentScroll > lastScroll && currentScroll > 200) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }

    lastScroll = currentScroll <= 0 ? 0 : currentScroll;
});

// File upload with drag & drop
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('resume-upload');
const filePreview = document.getElementById('file-preview');
const fileName = filePreview.querySelector('.file-name');
const fileRemove = filePreview.querySelector('.file-remove');

// Click to upload
dropzone.addEventListener('click', () => {
    fileInput.click();
});

// Drag & drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => {
        dropzone.classList.add('active');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => {
        dropzone.classList.remove('active');
    }, false);
});

// Handle dropped files
dropzone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Handle file selection
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];

        // Check file type
        if (!file.name.match(/\.(pdf|docx)$/i)) {
            alert('PDF 또는 DOCX 파일만 업로드 가능합니다.');
            return;
        }

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            alert('파일 크기는 10MB를 초과할 수 없습니다.');
            return;
        }

        // Show file preview
        fileName.textContent = file.name;
        dropzone.querySelector('.dropzone-content').style.display = 'none';
        filePreview.style.display = 'flex';
    }
}

// Remove uploaded file
fileRemove.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.value = '';
    filePreview.style.display = 'none';
    dropzone.querySelector('.dropzone-content').style.display = 'block';
});

// Form submission
const form = document.getElementById('application-form');
const modal = document.getElementById('modal');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate file upload
    if (!fileInput.files.length) {
        alert('이력서를 업로드해주세요.');
        return;
    }

    // Show success modal
    modal.classList.add('active');

    // Reset form
    form.reset();
    filePreview.style.display = 'none';
    dropzone.querySelector('.dropzone-content').style.display = 'block';
});

// Close modal
function closeModal() {
    modal.classList.remove('active');
}

// Close modal on backdrop click
modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Add staggered animation for children
            const children = entry.target.querySelectorAll('.feature-card, .process-step, .testimonial-card, .pricing-card');
            children.forEach((child, index) => {
                setTimeout(() => {
                    child.style.opacity = '1';
                    child.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
    });
}, observerOptions);

// Observe sections
document.querySelectorAll('.features, .process, .testimonials, .pricing').forEach(section => {
    observer.observe(section);
});

// Initialize animations for cards
document.querySelectorAll('.feature-card, .process-step, .testimonial-card, .pricing-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease';
});

// Gradient orb parallax effect
document.addEventListener('mousemove', (e) => {
    const orbs = document.querySelectorAll('.gradient-orb');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 10;
        const xMove = (x - 0.5) * speed;
        const yMove = (y - 0.5) * speed;

        orb.style.transform = `translate(${xMove}px, ${yMove}px)`;
    });
});

// Floating cards animation enhancement
const floatingCards = document.querySelectorAll('.floating-card');
floatingCards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.1)';
        card.style.zIndex = '10';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1)';
        card.style.zIndex = '1';
    });
});

// Add typing effect to hero title
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    let index = 0;

    function typeWriter() {
        if (index < text.length) {
            heroTitle.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, 50);
        }
    }

    // Start typing effect when page loads
    setTimeout(typeWriter, 500);
}

// Counter animation for stats
const stats = document.querySelectorAll('.stat-number');
stats.forEach(stat => {
    const target = stat.textContent;
    stat.textContent = '0';

    const updateCounter = () => {
        const current = parseFloat(stat.textContent);
        const targetNum = parseFloat(target);

        if (target.includes('%')) {
            const increment = targetNum / 50;
            if (current < targetNum) {
                stat.textContent = Math.ceil(current + increment) + '%';
                setTimeout(updateCounter, 30);
            } else {
                stat.textContent = target;
            }
        } else if (target.includes('.')) {
            const increment = targetNum / 50;
            if (current < targetNum) {
                stat.textContent = (current + increment).toFixed(1) + 'x';
                setTimeout(updateCounter, 30);
            } else {
                stat.textContent = target;
            }
        } else {
            stat.textContent = target;
        }
    };

    // Start counter when element is visible
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                updateCounter();
                counterObserver.unobserve(entry.target);
            }
        });
    });

    counterObserver.observe(stat);
});

// Button hover effects
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseenter', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.width = '0';
        ripple.style.height = '0';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.animation = 'ripple 0.6s ease';

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            width: 200px;
            height: 200px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('QueryDaily Version 2 - Enhanced script loaded');