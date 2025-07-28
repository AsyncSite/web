// SOPT About Page - Advanced Animation System
// Implements scroll-triggered animations based on SOPT's animation strategy

gsap.registerPlugin(ScrollTrigger);

// Configuration
const ANIMATION_CONFIG = {
    ease: {
        smooth: "power3.out",
        bounce: "back.out(1.7)",
        elastic: "elastic.out(1, 0.5)",
        natural: "cubic-bezier(0.4, 0, 0.2, 1)"
    },
    duration: {
        fast: 0.4,
        medium: 0.8,
        slow: 1.2,
        verySlow: 1.6
    },
    stagger: {
        quick: 0.1,
        medium: 0.15,
        slow: 0.2
    }
};

// Initialize page
class SOPTAnimationController {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Wait for page load
        window.addEventListener('load', () => {
            this.setupInitialStates();
            this.initializeAnimations();
            this.setupInteractions();
            this.setupScrollProgress();
            this.isInitialized = true;
        });

        // Handle resize
        window.addEventListener('resize', gsap.utils.debounce(() => {
            if (this.isInitialized) {
                ScrollTrigger.refresh();
            }
        }, 250));
    }

    setupInitialStates() {
        // Set initial states for all animated elements
        gsap.set('.title-line', { y: 50, opacity: 0 });
        gsap.set('.hero-description', { y: 30, opacity: 0 });
        gsap.set('.hero-stats', { y: 30, opacity: 0 });
        gsap.set('.floating-card', { y: 100, opacity: 0 });
        gsap.set('.about-section', { opacity: 0 });
        gsap.set('.question-block', { x: -100, opacity: 0 });
        gsap.set('.answer-block', { x: 100, opacity: 0 });
    }

    initializeAnimations() {
        this.animateHeroSection();
        this.animateAboutSections();
        this.animateCTASection();
    }

    animateHeroSection() {
        // Hero entrance timeline
        const heroTL = gsap.timeline({ delay: 0.5 });
        
        // Badge entrance
        heroTL.from('.hero-badge', {
            duration: ANIMATION_CONFIG.duration.medium,
            scale: 0.8,
            opacity: 0,
            ease: ANIMATION_CONFIG.ease.bounce
        });

        // Title lines with staggered animation
        heroTL.to('.title-line', {
            duration: ANIMATION_CONFIG.duration.slow,
            y: 0,
            opacity: 1,
            stagger: ANIMATION_CONFIG.stagger.medium,
            ease: ANIMATION_CONFIG.ease.smooth
        }, '-=0.3');

        // Description and stats
        heroTL.to('.hero-description', {
            duration: ANIMATION_CONFIG.duration.medium,
            y: 0,
            opacity: 1,
            ease: ANIMATION_CONFIG.ease.smooth
        }, '-=0.5')
        .to('.hero-stats', {
            duration: ANIMATION_CONFIG.duration.medium,
            y: 0,
            opacity: 1,
            ease: ANIMATION_CONFIG.ease.smooth
        }, '-=0.3');

        // Floating cards with staggered entrance
        heroTL.to('.floating-card', {
            duration: ANIMATION_CONFIG.duration.slow,
            y: 0,
            opacity: 1,
            stagger: ANIMATION_CONFIG.stagger.slow,
            ease: ANIMATION_CONFIG.ease.elastic,
            onComplete: () => {
                // Start continuous floating animation
                this.startFloatingCardAnimation();
            }
        }, '-=0.6');

        // Counter animation for stats
        this.animateCounters();
    }

    startFloatingCardAnimation() {
        gsap.to('.card-1', {
            y: -20,
            rotation: 2,
            duration: 4,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
        });

        gsap.to('.card-2', {
            y: -15,
            rotation: -1,
            duration: 3.5,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: 1
        });

        gsap.to('.card-3', {
            y: -25,
            rotation: 3,
            duration: 4.5,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: 2
        });
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const finalValue = parseInt(counter.textContent.replace(/\D/g, ''));
            const suffix = counter.textContent.replace(/\d/g, '');
            
            gsap.from({ value: 0 }, {
                duration: 2,
                value: finalValue,
                ease: "power2.out",
                delay: 1.5,
                onUpdate: function() {
                    const currentValue = Math.round(this.targets()[0].value);
                    counter.textContent = currentValue + suffix;
                }
            });
        });
    }

    animateAboutSections() {
        const sections = document.querySelectorAll('.about-section');
        
        sections.forEach((section, index) => {
            const layout = section.dataset.layout;
            const questionBlock = section.querySelector('.question-block');
            const answerBlock = section.querySelector('.answer-block');
            
            // Create timeline for this section
            const sectionTL = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%",
                    end: "bottom 20%",
                    toggleActions: "play reverse play reverse",
                    onEnter: () => this.onSectionEnter(section),
                    onLeave: () => this.onSectionLeave(section),
                    onEnterBack: () => this.onSectionEnter(section),
                    onLeaveBack: () => this.onSectionLeave(section)
                }
            });

            // Set initial positions based on layout
            if (layout === 'answer-left') {
                gsap.set(questionBlock, { x: 100, opacity: 0 });
                gsap.set(answerBlock, { x: -100, opacity: 0 });
            } else {
                gsap.set(questionBlock, { x: -100, opacity: 0 });
                gsap.set(answerBlock, { x: 100, opacity: 0 });
            }

            // Section fade in
            sectionTL.to(section, {
                duration: ANIMATION_CONFIG.duration.fast,
                opacity: 1,
                ease: ANIMATION_CONFIG.ease.natural
            });

            // Animate blocks based on layout
            if (layout === 'answer-left') {
                // Answer enters from left, question from right
                sectionTL.to(answerBlock, {
                    duration: ANIMATION_CONFIG.duration.slow,
                    x: 0,
                    opacity: 1,
                    ease: ANIMATION_CONFIG.ease.smooth
                }, '-=0.2')
                .to(questionBlock, {
                    duration: ANIMATION_CONFIG.duration.slow,
                    x: 0,
                    opacity: 1,
                    ease: ANIMATION_CONFIG.ease.smooth
                }, '-=0.6');
            } else {
                // Question enters from left, answer from right
                sectionTL.to(questionBlock, {
                    duration: ANIMATION_CONFIG.duration.slow,
                    x: 0,
                    opacity: 1,
                    ease: ANIMATION_CONFIG.ease.smooth
                }, '-=0.2')
                .to(answerBlock, {
                    duration: ANIMATION_CONFIG.duration.slow,
                    x: 0,
                    opacity: 1,
                    ease: ANIMATION_CONFIG.ease.smooth
                }, '-=0.6');
            }

            // Animate internal elements with stagger
            this.animateInternalElements(section, sectionTL);
        });
    }

    animateInternalElements(section, timeline) {
        const questionNumber = section.querySelector('.question-number');
        const visualDecoration = section.querySelector('.visual-decoration');
        const features = section.querySelectorAll('.feature-item');
        const highlights = section.querySelectorAll('.highlight-item');
        const timelineItems = section.querySelectorAll('.timeline-item');
        const logoItems = section.querySelectorAll('.logo-item');

        // Question number bounce
        if (questionNumber) {
            timeline.from(questionNumber, {
                duration: ANIMATION_CONFIG.duration.medium,
                scale: 0,
                rotation: 180,
                ease: ANIMATION_CONFIG.ease.bounce
            }, '-=0.4');
        }

        // Visual decoration pulse
        if (visualDecoration) {
            timeline.from(visualDecoration, {
                duration: ANIMATION_CONFIG.duration.medium,
                scale: 0,
                opacity: 0,
                ease: ANIMATION_CONFIG.ease.elastic
            }, '-=0.5');
        }

        // Feature items with stagger
        if (features.length > 0) {
            timeline.from(features, {
                duration: ANIMATION_CONFIG.duration.medium,
                x: -30,
                opacity: 0,
                stagger: ANIMATION_CONFIG.stagger.quick,
                ease: ANIMATION_CONFIG.ease.smooth
            }, '-=0.3');
        }

        // Highlight items with stagger
        if (highlights.length > 0) {
            timeline.from(highlights, {
                duration: ANIMATION_CONFIG.duration.medium,
                y: 30,
                opacity: 0,
                stagger: ANIMATION_CONFIG.stagger.quick,
                ease: ANIMATION_CONFIG.ease.smooth
            }, '-=0.3');
        }

        // Timeline items with stagger
        if (timelineItems.length > 0) {
            timeline.from(timelineItems, {
                duration: ANIMATION_CONFIG.duration.medium,
                x: -20,
                opacity: 0,
                stagger: ANIMATION_CONFIG.stagger.quick,
                ease: ANIMATION_CONFIG.ease.smooth
            }, '-=0.3');
        }

        // Logo items with stagger
        if (logoItems.length > 0) {
            timeline.from(logoItems, {
                duration: ANIMATION_CONFIG.duration.fast,
                scale: 0.8,
                opacity: 0,
                stagger: ANIMATION_CONFIG.stagger.quick,
                ease: ANIMATION_CONFIG.ease.bounce
            }, '-=0.4');
        }
    }

    onSectionEnter(section) {
        // Add subtle scale effect on enter
        gsap.to(section.querySelector('.answer-block'), {
            duration: 0.2,
            scale: 1.02,
            ease: "power2.out",
            yoyo: true,
            repeat: 1
        });

        // Pulse the question number
        const questionNumber = section.querySelector('.question-number');
        if (questionNumber) {
            gsap.to(questionNumber, {
                duration: 0.3,
                scale: 1.1,
                ease: "power2.out",
                yoyo: true,
                repeat: 1
            });
        }
    }

    onSectionLeave(section) {
        // Subtle fade effect when leaving
        gsap.to([section.querySelector('.question-block'), section.querySelector('.answer-block')], {
            duration: 0.3,
            scale: 0.98,
            opacity: 0.7,
            ease: ANIMATION_CONFIG.ease.natural
        });
    }

    animateCTASection() {
        const ctaSection = document.querySelector('.cta-section');
        
        ScrollTrigger.create({
            trigger: ctaSection,
            start: "top 80%",
            onEnter: () => {
                // CTA content animation
                gsap.from('.cta-title', {
                    duration: ANIMATION_CONFIG.duration.slow,
                    y: 50,
                    opacity: 0,
                    ease: ANIMATION_CONFIG.ease.smooth
                });

                gsap.from('.cta-description', {
                    duration: ANIMATION_CONFIG.duration.medium,
                    y: 30,
                    opacity: 0,
                    delay: 0.2,
                    ease: ANIMATION_CONFIG.ease.smooth
                });

                gsap.from('.cta-btn', {
                    duration: ANIMATION_CONFIG.duration.medium,
                    y: 20,
                    opacity: 0,
                    stagger: ANIMATION_CONFIG.stagger.quick,
                    delay: 0.4,
                    ease: ANIMATION_CONFIG.ease.bounce
                });

                // CTA cards animation
                gsap.from('.cta-card', {
                    duration: ANIMATION_CONFIG.duration.slow,
                    y: 50,
                    opacity: 0,
                    stagger: ANIMATION_CONFIG.stagger.medium,
                    delay: 0.6,
                    ease: ANIMATION_CONFIG.ease.elastic
                });
            }
        });
    }

    setupInteractions() {
        this.setupHoverEffects();
        this.setupClickEffects();
        this.setupParallaxEffects();
    }

    setupHoverEffects() {
        // Feature items hover
        document.querySelectorAll('.feature-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                gsap.to(item, {
                    duration: ANIMATION_CONFIG.duration.fast,
                    x: 8,
                    scale: 1.02,
                    ease: ANIMATION_CONFIG.ease.natural
                });
            });

            item.addEventListener('mouseleave', () => {
                gsap.to(item, {
                    duration: ANIMATION_CONFIG.duration.fast,
                    x: 0,
                    scale: 1,
                    ease: ANIMATION_CONFIG.ease.natural
                });
            });
        });

        // Highlight items hover
        document.querySelectorAll('.highlight-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                gsap.to(item, {
                    duration: ANIMATION_CONFIG.duration.fast,
                    y: -4,
                    scale: 1.02,
                    ease: ANIMATION_CONFIG.ease.natural
                });
            });

            item.addEventListener('mouseleave', () => {
                gsap.to(item, {
                    duration: ANIMATION_CONFIG.duration.fast,
                    y: 0,
                    scale: 1,
                    ease: ANIMATION_CONFIG.ease.natural
                });
            });
        });

        // CTA buttons hover with magnetic effect
        document.querySelectorAll('.cta-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, {
                    duration: ANIMATION_CONFIG.duration.fast,
                    y: -4,
                    scale: 1.05,
                    ease: ANIMATION_CONFIG.ease.natural
                });

                gsap.to(btn.querySelector('.btn-arrow'), {
                    duration: ANIMATION_CONFIG.duration.fast,
                    x: 4,
                    ease: ANIMATION_CONFIG.ease.natural
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    duration: ANIMATION_CONFIG.duration.fast,
                    y: 0,
                    scale: 1,
                    ease: ANIMATION_CONFIG.ease.natural
                });

                gsap.to(btn.querySelector('.btn-arrow'), {
                    duration: ANIMATION_CONFIG.duration.fast,
                    x: 0,
                    ease: ANIMATION_CONFIG.ease.natural
                });
            });
        });

        // Floating cards interactive hover
        document.querySelectorAll('.floating-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    duration: ANIMATION_CONFIG.duration.fast,
                    scale: 1.1,
                    rotation: 5,
                    ease: ANIMATION_CONFIG.ease.bounce
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: ANIMATION_CONFIG.duration.fast,
                    scale: 1,
                    rotation: 0,
                    ease: ANIMATION_CONFIG.ease.natural
                });
            });
        });
    }

    setupClickEffects() {
        // CTA buttons click ripple effect
        document.querySelectorAll('.cta-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ripple = document.createElement('div');
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    pointer-events: none;
                    z-index: 1;
                `;

                btn.style.position = 'relative';
                btn.style.overflow = 'hidden';
                btn.appendChild(ripple);

                gsap.to(ripple, {
                    scale: 2,
                    opacity: 0,
                    duration: 0.6,
                    ease: "power2.out",
                    onComplete: () => ripple.remove()
                });

                // Button press effect
                gsap.to(btn, {
                    duration: 0.1,
                    scale: 0.95,
                    ease: "power2.out",
                    yoyo: true,
                    repeat: 1
                });
            });
        });

        // Question numbers click effect
        document.querySelectorAll('.question-number').forEach(num => {
            num.addEventListener('click', () => {
                gsap.to(num, {
                    duration: 0.3,
                    rotation: 360,
                    scale: 1.2,
                    ease: ANIMATION_CONFIG.ease.bounce,
                    onComplete: () => {
                        gsap.set(num, { rotation: 0 });
                    }
                });
            });
        });
    }

    setupParallaxEffects() {
        // Hero background parallax
        gsap.to('.hero-section::before', {
            scrollTrigger: {
                trigger: '.hero-section',
                start: "top top",
                end: "bottom top",
                scrub: 1
            },
            y: -100,
            ease: "none"
        });

        // CTA background parallax
        gsap.to('.cta-section::before', {
            scrollTrigger: {
                trigger: '.cta-section',
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            },
            rotation: 180,
            scale: 1.2,
            ease: "none"
        });

        // Visual decorations parallax
        document.querySelectorAll('.visual-decoration').forEach(decoration => {
            gsap.to(decoration, {
                scrollTrigger: {
                    trigger: decoration,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                },
                rotation: 180,
                scale: 1.1,
                ease: "none"
            });
        });
    }

    setupScrollProgress() {
        // Create scroll progress indicator
        const progressIndicator = document.createElement('div');
        progressIndicator.className = 'scroll-indicator';
        progressIndicator.innerHTML = '<div class="scroll-progress"></div>';
        document.body.appendChild(progressIndicator);

        const progressBar = progressIndicator.querySelector('.scroll-progress');

        ScrollTrigger.create({
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
                gsap.to(progressBar, {
                    duration: 0.1,
                    width: (self.progress * 100) + '%',
                    ease: "none"
                });
            }
        });

        // Smooth scrolling for internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    gsap.to(window, {
                        duration: 1.5,
                        scrollTo: target,
                        ease: ANIMATION_CONFIG.ease.smooth
                    });
                }
            });
        });
    }
}

// Performance optimization
class PerformanceOptimizer {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.optimize();
    }

    optimize() {
        if (this.isMobile) {
            // Reduce animation complexity on mobile
            gsap.globalTimeline.timeScale(1.5);
            
            // Disable expensive effects
            document.querySelectorAll('.visual-decoration').forEach(el => {
                el.style.display = 'none';
            });
        }

        if (this.prefersReducedMotion) {
            // Respect user's motion preferences
            gsap.globalTimeline.timeScale(10);
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.animation) {
                    trigger.animation.duration(0.1);
                }
            });
        }
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    new SOPTAnimationController();
    new PerformanceOptimizer();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    gsap.killTweensOf("*");
});