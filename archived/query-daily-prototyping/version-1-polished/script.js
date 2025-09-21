// QueryDaily - Polished Version 1 Script
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Form handling
    const form = document.getElementById('applicationForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                resume: formData.get('resume')
            };

            // Validate form
            if (!validateForm(data)) {
                return;
            }

            // Show success message
            showSuccessModal(data);

            // Reset form
            form.reset();
            resetFileUpload();
        });
    }

    // File upload handling
    const fileInput = document.querySelector('input[type="file"]');
    const fileLabel = document.querySelector('.file-label');

    if (fileInput && fileLabel) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                fileLabel.textContent = `📎 ${file.name}`;
                fileLabel.style.color = '#c3e88d';
            }
        });
    }

    // Form validation
    function validateForm(data) {
        const errors = [];

        // Email is required
        if (!data.email || !isValidEmail(data.email)) {
            errors.push('올바른 이메일 주소를 입력해주세요');
        }

        // Name is optional, but if provided should be at least 2 characters
        if (data.name && data.name.trim().length < 2) {
            errors.push('이름은 2글자 이상 입력해주세요');
        }

        // Resume PDF is required
        if (!data.resume || data.resume.size === 0) {
            errors.push('PDF 형식의 이력서를 업로드해주세요');
        } else if (data.resume && !data.resume.name.toLowerCase().endsWith('.pdf')) {
            errors.push('PDF 형식만 업로드 가능합니다');
        } else if (data.resume && data.resume.size > 10 * 1024 * 1024) { // 10MB limit
            errors.push('파일 크기는 10MB 이하여야 합니다');
        }

        if (errors.length > 0) {
            showErrorMessage(errors);
            return false;
        }

        return true;
    }

    // Add typing animation to hero title
    function addTypingAnimation() {
        const titleElement = document.querySelector('.hero-title-main');
        if (titleElement) {
            const text = titleElement.textContent;
            titleElement.textContent = '';
            titleElement.style.minHeight = '1.2em';

            let index = 0;
            const typeChar = () => {
                if (index < text.length) {
                    titleElement.textContent += text[index];
                    index++;
                    setTimeout(typeChar, 60);
                }
            };

            setTimeout(() => {
                typeChar();
            }, 500);
        }
    }

    // Call typing animation on load
    addTypingAnimation();

    // Email validation
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }


    // Show error messages
    function showErrorMessage(errors) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-toast';
        errorContainer.innerHTML = `
            <div class="error-content">
                <h4>⚠️ 입력 오류</h4>
                <ul>
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>
        `;

        document.body.appendChild(errorContainer);

        setTimeout(() => {
            errorContainer.classList.add('show');
        }, 10);

        setTimeout(() => {
            errorContainer.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(errorContainer);
            }, 300);
        }, 3000);
    }

    // Show success modal
    function showSuccessModal(data) {
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        const displayName = data.name ? `<strong>${data.name}</strong>님, ` : '';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🎉 베타 테스터 신청이 완료되었습니다!</h2>
                </div>
                <div class="modal-body">
                    <p>${displayName}Java/Spring 백엔드 개발자를 위한 QueryDaily 베타 테스트에 참여해주셔서 감사합니다!</p>
                    <p><strong>${data.email}</strong>로 확인 메일을 발송했습니다.</p>
                    <p>📄 이력서: <strong>${data.resume ? data.resume.name : 'PDF 업로드 완료'}</strong></p>
                    <div class="next-steps">
                        <h4>다음 단계:</h4>
                        <ol>
                            <li>🤖 AI 분석 중: 업로드하신 이력서를 분석하여 Java/Spring 프로젝트 경험을 파악합니다</li>
                            <li>☕ 첫 질문: 내일 오전 10시, JPA/Spring Boot/MSA 등 당신의 기술 스택에 맞춰 준비됩니다</li>
                            <li>🎯 7일 간의 성장: 매일 N+1 문제, 트랜잭션 처리, 성능 최적화 등 실무 질문을 받게 됩니다</li>
                            <li>💡 Tip: 질문에 답하면서 '내가 왜 이 기술을 사용했는지' 고민해보세요</li>
                        </ol>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="close-modal">확인</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Close modal
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

        function closeModal() {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
    }


    // Add floating animation to visual elements
    const floatingElements = document.querySelectorAll('.floating-question');
    floatingElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.5}s`;
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe sections for animation
    const sections = document.querySelectorAll('.problem-section, .solution-section, .process-section, .features-section, .testimonials-section');
    sections.forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });

    // Add hover effect to process cards
    const processCards = document.querySelectorAll('.process-card');
    processCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // Add hover effect to feature items
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.querySelector('.feature-icon').style.transform = 'scale(1.1) rotate(5deg)';
        });

        item.addEventListener('mouseleave', function() {
            this.querySelector('.feature-icon').style.transform = '';
        });
    });

    // Reset file upload
    function resetFileUpload() {
        const fileLabel = document.querySelector('.file-label');
        if (fileLabel) {
            fileLabel.textContent = '📎 PDF 파일 선택';
            fileLabel.style.color = '';
        }
    }
});

// Add CSS for toast and modal animations
const style = document.createElement('style');
style.textContent = `
    .error-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(255, 68, 68, 0.3);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 10000;
        max-width: 400px;
    }

    .error-toast.show {
        transform: translateX(0);
    }

    .error-toast h4 {
        margin: 0 0 10px 0;
    }

    .error-toast ul {
        margin: 0;
        padding-left: 20px;
    }

    .success-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .success-modal.show {
        opacity: 1;
    }

    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
    }

    .modal-content {
        position: relative;
        background: #1a1a1a;
        border-radius: 20px;
        padding: 40px;
        max-width: 500px;
        width: 90%;
        border: 1px solid #333;
        transform: scale(0.9);
        transition: transform 0.3s ease;
    }

    .success-modal.show .modal-content {
        transform: scale(1);
    }

    .modal-header h2 {
        margin: 0 0 20px 0;
        color: #c3e88d;
    }

    .modal-body {
        color: #999;
        line-height: 1.6;
    }

    .modal-body strong {
        color: white;
    }

    .next-steps {
        margin-top: 30px;
        padding: 20px;
        background: rgba(195, 232, 141, 0.1);
        border-radius: 10px;
        border: 1px solid rgba(195, 232, 141, 0.2);
    }

    .next-steps h4 {
        margin: 0 0 15px 0;
        color: #c3e88d;
    }

    .next-steps ol {
        margin: 0;
        padding-left: 20px;
    }

    .next-steps li {
        margin-bottom: 10px;
    }

    .modal-footer {
        margin-top: 30px;
        text-align: center;
    }

    .close-modal {
        background: #c3e88d;
        color: #0d0d0d;
        border: none;
        padding: 15px 40px;
        border-radius: 25px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .close-modal:hover {
        background: #a8d070;
        transform: translateY(-2px);
    }

    .fade-in {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease;
    }

    .fade-in-visible {
        opacity: 1;
        transform: translateY(0);
    }

    @keyframes floating {
        0%, 100% {
            transform: translateY(0) rotate(0deg);
        }
        25% {
            transform: translateY(-10px) rotate(2deg);
        }
        75% {
            transform: translateY(10px) rotate(-2deg);
        }
    }

    .floating-question {
        animation: floating 4s ease-in-out infinite;
    }
`;
document.head.appendChild(style);