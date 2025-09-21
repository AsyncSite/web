// QueryDaily Version 1-2 Beta Launch - Interactive Script

// Initialize Beta Counter
let remainingSpots = 10;
let applicationsCount = 0;

// Countdown Timer
function startCountdown() {
    // Set deadline to 24 hours from now
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 24);

    function updateTimer() {
        const now = new Date();
        const difference = deadline - now;

        if (difference > 0) {
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            const timerElement = document.getElementById('time-remaining');
            if (timerElement) {
                timerElement.textContent = timeString;
            }
        } else {
            // Timer expired
            const timerElement = document.getElementById('time-remaining');
            if (timerElement) {
                timerElement.textContent = '00:00:00';
                timerElement.style.color = 'var(--color-warning)';
            }
        }
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// Update spots counter
function updateSpotsCounter() {
    const spotsElements = [
        document.getElementById('spots-remaining'),
        document.getElementById('spots-count')
    ];

    spotsElements.forEach(element => {
        if (element) {
            element.textContent = remainingSpots;
        }
    });

    // Update progress bar
    const progressBar = document.querySelector('.spots-filled');
    if (progressBar) {
        const percentage = ((10 - remainingSpots) / 10) * 100;
        progressBar.style.width = `${percentage}%`;
    }

    // Update application count
    const countElement = document.querySelector('.counter-item:last-child .counter-number');
    if (countElement) {
        countElement.textContent = applicationsCount;
    }
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        header.style.background = 'rgba(13, 13, 13, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.5)';
    } else {
        header.style.background = 'rgba(13, 13, 13, 0.95)';
        header.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// File upload handling
const fileInput = document.getElementById('resume');
const fileName = document.getElementById('file-name');
const fileUploadText = document.querySelector('.file-upload-text');

if (fileInput) {
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            fileName.textContent = `선택된 파일: ${file.name}`;
            fileUploadText.textContent = '다른 파일 선택';
        }
    });
}

// Form submission
const form = document.getElementById('application-form');
const modal = document.getElementById('success-modal');

if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Check if spots are available
        if (remainingSpots <= 0) {
            alert('죄송합니다. 베타 테스터 모집이 마감되었습니다.');
            return;
        }

        // Collect form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            experience: formData.get('experience'),
            motivation: formData.get('motivation'),
            resume: formData.get('resume').name
        };

        // Simulate form submission
        console.log('Beta application submitted:', data);

        // Update counters
        remainingSpots--;
        applicationsCount++;
        updateSpotsCounter();

        // Show success modal
        modal.classList.add('active');

        // Add urgency if spots are low
        if (remainingSpots <= 3) {
            const spotsText = document.querySelectorAll('.spots-text');
            spotsText.forEach(text => {
                text.style.color = 'var(--color-warning)';
                text.innerHTML = `<strong>⚠️ ${remainingSpots}자리만 남음!</strong>`;
            });
        }

        // Reset form
        form.reset();
        if (fileName) fileName.textContent = '';
        if (fileUploadText) fileUploadText.textContent = '파일 선택 (PDF 권장)';
    });
}

// Close modal
function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Click outside modal to close
if (modal) {
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply animation to sections
document.querySelectorAll('.section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Apply animation to cards with delay
document.querySelectorAll('.benefit-card, .step, .question-card, .faq-item').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Premium benefit card animation
const premiumCard = document.querySelector('.benefit-card.premium');
if (premiumCard) {
    premiumCard.addEventListener('mouseenter', function() {
        this.style.animation = 'pulse-glow 1s ease';
    });

    premiumCard.addEventListener('animationend', function() {
        this.style.animation = '';
    });
}

// Add pulse glow animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse-glow {
        0% {
            box-shadow: 0 0 30px rgba(195, 232, 141, 0.1);
        }
        50% {
            box-shadow: 0 0 50px rgba(195, 232, 141, 0.3);
        }
        100% {
            box-shadow: 0 0 30px rgba(195, 232, 141, 0.1);
        }
    }

    @keyframes urgentPulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
`;
document.head.appendChild(style);

// Add urgency animations when spots are low
function checkUrgency() {
    if (remainingSpots <= 3) {
        const ctaButton = document.querySelector('.btn-submit');
        if (ctaButton) {
            ctaButton.style.animation = 'urgentPulse 1s infinite';
        }
    }
}

// Simulate real-time updates (demo only)
function simulateLiveUpdates() {
    // Randomly reduce spots every 30-60 seconds
    const interval = Math.random() * 30000 + 30000; // 30-60 seconds

    setTimeout(() => {
        if (remainingSpots > 1 && Math.random() > 0.5) {
            remainingSpots--;
            applicationsCount++;
            updateSpotsCounter();
            checkUrgency();

            // Show notification
            showNotification(`누군가가 방금 베타 테스터로 신청했습니다! 남은 자리: ${remainingSpots}`);
        }

        if (remainingSpots > 1) {
            simulateLiveUpdates();
        }
    }, interval);
}

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--color-bg-tertiary);
        color: var(--color-text-primary);
        padding: 15px 20px;
        border-radius: 8px;
        border-left: 3px solid var(--color-warning);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Add slide animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(animationStyles);

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', () => {
    startCountdown();
    updateSpotsCounter();
    simulateLiveUpdates();

    // Add beta badge animation
    const betaBadge = document.querySelector('.beta-badge');
    if (betaBadge) {
        setInterval(() => {
            betaBadge.style.transform = 'scale(1.1)';
            setTimeout(() => {
                betaBadge.style.transform = 'scale(1)';
            }, 200);
        }, 3000);
    }

    console.log('QueryDaily Beta Launch - Version 1.2 initialized');
    console.log(`Remaining spots: ${remainingSpots}`);
    console.log('Beta tester benefits: Lifetime free access to all premium features');
});

// Expose closeModal to global scope for onclick handler
window.closeModal = closeModal;