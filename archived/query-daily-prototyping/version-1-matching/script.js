// QueryDaily Version 1 - Interactive Script

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80; // Height of fixed header
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

fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        fileName.textContent = `선택된 파일: ${file.name}`;
        fileUploadText.textContent = '다른 파일 선택';
    }
});

// Form submission
const form = document.getElementById('application-form');
const modal = document.getElementById('success-modal');

form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Collect form data
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        resume: formData.get('resume').name
    };

    // Simulate form submission
    console.log('Form submitted:', data);

    // Show success modal
    modal.classList.add('active');

    // Update remaining spots
    updateRemainingSpots();

    // Reset form
    form.reset();
    fileName.textContent = '';
    fileUploadText.textContent = '파일 선택 (PDF 권장)';
});

// Close modal
function closeModal() {
    modal.classList.remove('active');
}

// Click outside modal to close
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
    }
});

// Update remaining spots (simulate)
function updateRemainingSpots() {
    const spotsElement = document.getElementById('spots-left');
    let currentSpots = parseInt(spotsElement.textContent);
    if (currentSpots > 0) {
        spotsElement.textContent = currentSpots - 1;
    }
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
document.querySelectorAll('.step, .question-card, .pricing-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Add hover effect for interactive elements
document.querySelectorAll('.btn, .step, .question-card, .pricing-card').forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
});

// Typing effect for hero title (optional enhancement)
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    const originalHTML = heroTitle.innerHTML;
    heroTitle.style.opacity = '0';

    setTimeout(() => {
        heroTitle.style.opacity = '1';
        heroTitle.style.animation = 'fadeInUp 0.8s ease forwards';
    }, 100);
}

// Add custom animations via CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(195, 232, 141, 0.4);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(195, 232, 141, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(195, 232, 141, 0);
        }
    }

    .btn-primary {
        animation: pulse 2s infinite;
    }
`;
document.head.appendChild(style);

// Random question display effect
const questionCards = document.querySelectorAll('.question-card');
const questionTexts = [
    '"React에서 상태 관리를 위해 Redux를 선택하신 이유는 무엇인가요? 다른 대안들과 비교했을 때 어떤 트레이드오프가 있었나요?"',
    '"마이크로서비스 아키텍처 도입 경험에서, 실제로 겪었던 가장 큰 challenge는 무엇이었고 어떻게 해결하셨나요?"',
    '"프로덕션 환경에서 갑자기 메모리 누수가 발생한다면, 어떤 순서로 문제를 진단하고 해결하시겠습니까?"',
    '"TypeScript 도입 후 팀의 개발 생산성은 어떻게 변했나요? 구체적인 지표나 사례를 들어 설명해주세요."',
    '"CI/CD 파이프라인을 구축하면서 가장 신경 쓴 부분은 무엇이고, 왜 그것이 중요하다고 생각하셨나요?"',
    '"레거시 코드를 리팩토링할 때 어떤 전략을 사용하시나요? 실제 경험을 바탕으로 설명해주세요."'
];

// Rotate questions periodically (optional)
let questionIndex = 0;
setInterval(() => {
    questionCards.forEach((card, i) => {
        const textElement = card.querySelector('.question-text');
        if (textElement) {
            const newIndex = (questionIndex + i) % questionTexts.length;
            textElement.style.opacity = '0';
            setTimeout(() => {
                textElement.textContent = questionTexts[newIndex];
                textElement.style.opacity = '1';
            }, 300);
        }
    });
    questionIndex = (questionIndex + 1) % questionTexts.length;
}, 10000); // Change every 10 seconds

console.log('QueryDaily Version 1 - Script loaded successfully');