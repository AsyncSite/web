// Timeline About Page - JavaScript

class TimelineController {
    constructor() {
        this.currentSection = 'origin';
        this.sections = ['origin', 'growth', 'innovation', 'community', 'future'];
        this.isScrolling = false;
        this.scrollThrottle = false;
        
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupNavigation();
        this.setupIntersectionObserver();
        this.setupParallax();
        this.setupCountAnimations();
        this.addEventListeners();
    }

    setupScrollAnimations() {
        // GSAP ScrollTrigger animations
        gsap.registerPlugin(ScrollTrigger);

        // Hero section animations
        const heroTl = gsap.timeline();
        heroTl.from(".hero-badge", { 
            opacity: 0, 
            y: 30, 
            duration: 1, 
            ease: "power2.out" 
        })
        .from(".hero-title .title-line", { 
            opacity: 0, 
            y: 50, 
            duration: 1.2, 
            stagger: 0.2, 
            ease: "power2.out" 
        }, "-=0.7")
        .from(".hero-description", { 
            opacity: 0, 
            y: 30, 
            duration: 1, 
            ease: "power2.out" 
        }, "-=0.5")
        .from(".journey-preview", { 
            opacity: 0, 
            y: 30, 
            duration: 1, 
            ease: "power2.out" 
        }, "-=0.3");

        // Timeline sections animations
        this.sections.forEach((sectionId, index) => {
            const section = document.getElementById(sectionId);
            if (!section) return;

            // Section content animation
            gsap.fromTo(section.querySelector('.content-left'), {
                opacity: 0,
                x: index % 2 === 0 ? -100 : 100
            }, {
                opacity: 1,
                x: 0,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            });

            gsap.fromTo(section.querySelector('.content-right'), {
                opacity: 0,
                x: index % 2 === 0 ? 100 : -100
            }, {
                opacity: 1,
                x: 0,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            });

            // Milestone items stagger animation
            const milestones = section.querySelectorAll('.milestone-item');
            gsap.fromTo(milestones, {
                opacity: 0,
                y: 30
            }, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 70%",
                    toggleActions: "play none none reverse"
                }
            });

            // Story card animation
            const storyCard = section.querySelector('.story-card');
            if (storyCard) {
                gsap.fromTo(storyCard, {
                    opacity: 0,
                    scale: 0.9,
                    rotationY: index % 2 === 0 ? -10 : 10
                }, {
                    opacity: 1,
                    scale: 1,
                    rotationY: 0,
                    duration: 1,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: storyCard,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                });
            }
        });

        // Future section special animation
        const futureSection = document.getElementById('future');
        if (futureSection) {
            gsap.fromTo(futureSection.querySelector('.vision-header'), {
                opacity: 0,
                y: 50
            }, {
                opacity: 1,
                y: 0,
                duration: 1.5,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: futureSection,
                    start: "top 80%"
                }
            });

            const goalItems = futureSection.querySelectorAll('.goal-item');
            gsap.fromTo(goalItems, {
                opacity: 0,
                y: 30,
                scale: 0.9
            }, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                stagger: 0.3,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: futureSection,
                    start: "top 70%"
                }
            });
        }

        // CTA section animation
        const ctaSection = document.querySelector('.cta-section');
        if (ctaSection) {
            gsap.fromTo(ctaSection.querySelector('.cta-title'), {
                opacity: 0,
                y: 50
            }, {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: ctaSection,
                    start: "top 80%"
                }
            });

            gsap.fromTo(ctaSection.querySelectorAll('.cta-btn'), {
                opacity: 0,
                y: 30
            }, {
                opacity: 1,
                y: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: ctaSection,
                    start: "top 70%"
                }
            });
        }
    }

    setupNavigation() {
        const navDots = document.querySelectorAll('.nav-dot');
        navDots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const targetSection = e.target.getAttribute('data-section');
                this.navigateToSection(targetSection);
            });
        });
    }

    navigateToSection(sectionId) {
        const targetSection = document.getElementById(sectionId);
        if (!targetSection) return;

        // Update navigation
        this.updateNavigation(sectionId);
        
        // Smooth scroll to section
        gsap.to(window, {
            duration: 1.5,
            scrollTo: {
                y: targetSection,
                offsetY: 0
            },
            ease: "power2.inOut"
        });
    }

    updateNavigation(activeSectionId) {
        const navDots = document.querySelectorAll('.nav-dot');
        navDots.forEach(dot => {
            dot.classList.remove('active');
            if (dot.getAttribute('data-section') === activeSectionId) {
                dot.classList.add('active');
            }
        });
        this.currentSection = activeSectionId;
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '-30% 0px -30% 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    if (this.sections.includes(sectionId)) {
                        this.updateNavigation(sectionId);
                    }
                }
            });
        }, options);

        this.sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) observer.observe(section);
        });
    }

    setupParallax() {
        // Background shapes parallax
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            gsap.to(shape, {
                y: (i, target) => -ScrollTrigger.maxScroll(window) * (index + 1) * 0.1,
                ease: "none",
                scrollTrigger: {
                    trigger: ".hero-section",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        });

        // Era indicators parallax
        const eraIndicators = document.querySelectorAll('.era-indicator');
        eraIndicators.forEach(indicator => {
            gsap.to(indicator, {
                y: -50,
                opacity: 0.2,
                ease: "none",
                scrollTrigger: {
                    trigger: indicator.closest('.timeline-section'),
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });
    }

    setupCountAnimations() {
        // Animate number counters
        const countElements = document.querySelectorAll('.stat-number, .achievement-number');
        
        countElements.forEach(element => {
            const finalValue = element.textContent;
            if (finalValue === '∞') return; // Skip infinity symbol
            
            const numericValue = parseInt(finalValue.replace(/\D/g, ''));
            if (isNaN(numericValue)) return;

            gsap.fromTo(element, {
                textContent: 0
            }, {
                textContent: numericValue,
                duration: 2,
                ease: "power2.out",
                snap: { textContent: 1 },
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                onUpdate: function() {
                    const current = Math.ceil(this.targets()[0].textContent);
                    if (finalValue.includes('+')) {
                        element.textContent = current + '+';
                    } else {
                        element.textContent = current;
                    }
                }
            });
        });
    }

    addEventListeners() {
        // Smooth hover effects for interactive elements
        const interactiveElements = document.querySelectorAll('.milestone-item, .story-card, .cta-btn, .goal-item');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                gsap.to(element, {
                    scale: 1.02,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            element.addEventListener('mouseleave', () => {
                gsap.to(element, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });

        // CTA button click animations
        const ctaButtons = document.querySelectorAll('.cta-btn');
        ctaButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Button click animation
                gsap.to(button, {
                    scale: 0.95,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut"
                });

                // Add ripple effect
                this.createRippleEffect(e);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowDown' || e.code === 'Space') {
                e.preventDefault();
                this.navigateNext();
            } else if (e.code === 'ArrowUp') {
                e.preventDefault();
                this.navigatePrevious();
            }
        });

        // Mouse wheel section navigation (throttled)
        let wheelTimeout;
        document.addEventListener('wheel', (e) => {
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                if (Math.abs(e.deltaY) > 50 && !this.isScrolling) {
                    this.isScrolling = true;
                    
                    if (e.deltaY > 0) {
                        this.navigateNext();
                    } else {
                        this.navigatePrevious();
                    }
                    
                    setTimeout(() => {
                        this.isScrolling = false;
                    }, 1500);
                }
            }, 150);
        }, { passive: true });

        // Touch navigation for mobile
        let touchStartY = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            const touchDiff = touchStartY - touchEndY;
            
            if (Math.abs(touchDiff) > 100 && !this.isScrolling) {
                this.isScrolling = true;
                
                if (touchDiff > 0) {
                    this.navigateNext();
                } else {
                    this.navigatePrevious();
                }
                
                setTimeout(() => {
                    this.isScrolling = false;
                }, 1500);
            }
        }, { passive: true });

        // Window resize handler
        window.addEventListener('resize', () => {
            ScrollTrigger.refresh();
        });
    }

    navigateNext() {
        const currentIndex = this.sections.indexOf(this.currentSection);
        if (currentIndex < this.sections.length - 1) {
            this.navigateToSection(this.sections[currentIndex + 1]);
        } else {
            // If on last section, scroll to CTA
            const ctaSection = document.querySelector('.cta-section');
            if (ctaSection) {
                gsap.to(window, {
                    duration: 1.5,
                    scrollTo: {
                        y: ctaSection,
                        offsetY: 0
                    },
                    ease: "power2.inOut"
                });
            }
        }
    }

    navigatePrevious() {
        const currentIndex = this.sections.indexOf(this.currentSection);
        if (currentIndex > 0) {
            this.navigateToSection(this.sections[currentIndex - 1]);
        } else {
            // If on first section, scroll to hero
            gsap.to(window, {
                duration: 1.5,
                scrollTo: {
                    y: 0
                },
                ease: "power2.inOut"
            });
        }
    }

    createRippleEffect(e) {
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.pointerEvents = 'none';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        gsap.to(ripple, {
            scale: 2,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => {
                ripple.remove();
            }
        });
    }
}

// Utility class for additional animations
class AnimationUtils {
    static createTypewriterEffect(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;
        
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
            }
        }, speed);
    }

    static createFloatingElements() {
        const floatingElements = document.querySelectorAll('.floating-element');
        
        floatingElements.forEach((element, index) => {
            gsap.to(element, {
                y: "random(-20, 20)",
                x: "random(-10, 10)",
                rotation: "random(-5, 5)",
                duration: "random(2, 4)",
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: index * 0.2
            });
        });
    }

    static initParticleBackground(container) {
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                pointer-events: none;
            `;
            
            container.appendChild(particle);
            
            // Animate particles
            gsap.set(particle, {
                x: "random(0, " + window.innerWidth + ")",
                y: "random(0, " + window.innerHeight + ")",
            });
            
            gsap.to(particle, {
                y: "-=100vh",
                opacity: 0,
                duration: "random(10, 20)",
                ease: "none",
                repeat: -1,
                delay: "random(0, 10)"
            });
        }
    }
}

// Enhanced loading animations
class LoadingAnimations {
    static initPreloader() {
        const preloader = document.createElement('div');
        preloader.id = 'preloader';
        preloader.innerHTML = `
            <div class="preloader-content">
                <div class="loader-icon">⏰</div>
                <div class="loader-text">Loading Timeline...</div>
                <div class="loader-progress">
                    <div class="progress-bar"></div>
                </div>
            </div>
        `;
        
        preloader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            font-family: 'Pretendard', sans-serif;
        `;
        
        document.body.appendChild(preloader);
        
        // Animate progress bar
        const progressBar = preloader.querySelector('.progress-bar');
        progressBar.style.cssText = `
            width: 0%;
            height: 4px;
            background: white;
            border-radius: 2px;
            transition: width 0.3s ease;
        `;
        
        // Simulate loading progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                setTimeout(() => {
                    this.hidePreloader(preloader);
                }, 500);
            }
            progressBar.style.width = progress + '%';
        }, 200);
    }
    
    static hidePreloader(preloader) {
        gsap.to(preloader, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                preloader.remove();
            }
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Show preloader
    LoadingAnimations.initPreloader();
    
    // Initialize main timeline controller
    const timeline = new TimelineController();
    
    // Add floating animation to decorative elements
    AnimationUtils.createFloatingElements();
    
    // Initialize particle background for hero section
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        AnimationUtils.initParticleBackground(heroBackground);
    }
    
    // Add scroll indicator for first visit
    const scrollIndicator = document.createElement('div');
    scrollIndicator.innerHTML = '↓ Scroll to explore';
    scrollIndicator.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        font-size: 0.9rem;
        opacity: 0.7;
        z-index: 100;
        animation: bounce 2s infinite;
    `;
    
    document.body.appendChild(scrollIndicator);
    
    // Hide scroll indicator after first scroll
    let hasScrolled = false;
    window.addEventListener('scroll', () => {
        if (!hasScrolled && window.scrollY > 100) {
            hasScrolled = true;
            gsap.to(scrollIndicator, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => scrollIndicator.remove()
            });
        }
    });
});

// Add bounce animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateX(-50%) translateY(0);
        }
        40% {
            transform: translateX(-50%) translateY(-10px);
        }
        60% {
            transform: translateX(-50%) translateY(-5px);
        }
    }
    
    .particle {
        z-index: 1;
    }
    
    .preloader-content {
        text-align: center;
    }
    
    .loader-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        animation: spin 2s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .loader-text {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        font-weight: 600;
    }
    
    .loader-progress {
        width: 200px;
        height: 4px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
        overflow: hidden;
    }
`;

document.head.appendChild(style);