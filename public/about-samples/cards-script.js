// SOPT Cards Masonry Layout - Advanced Animation System
// Implements all 8 SOPT animation strategies with card-based interactions

gsap.registerPlugin(ScrollTrigger);

// Animation Configuration
const CONFIG = {
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

class CardsAnimationController {
    constructor() {
        this.isInitialized = false;
        this.testimonialIndex = 0;
        this.testimonialTimer = null;
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            this.setupInitialStates();
            this.initializeAnimations();
            this.setupInteractions();
            this.setupTestimonialCarousel();
            this.isInitialized = true;
        });

        window.addEventListener('resize', gsap.utils.debounce(() => {
            if (this.isInitialized) {
                ScrollTrigger.refresh();
            }
        }, 250));
    }

    setupInitialStates() {
        // Hero elements
        gsap.set('.title-word', { y: 60, rotationX: 90, opacity: 0 });
        gsap.set('.hero-description', { y: 30, opacity: 0 });
        gsap.set('.scroll-hint', { y: 20, opacity: 0 });
        gsap.set('.floating-card', { y: 100, opacity: 0 });

        // Cards
        gsap.set('.info-card', { 
            y: 60, 
            scale: 0.9, 
            opacity: 0,
            rotationY: 15
        });

        // CTA elements
        gsap.set('.cta-badge', { scale: 0.8, opacity: 0 });
        gsap.set('.cta-line', { y: 30, opacity: 0 });
        gsap.set('.cta-description', { y: 20, opacity: 0 });
        gsap.set('.cta-btn', { y: 20, opacity: 0 });
        gsap.set('.cta-card', { x: 50, opacity: 0 });
    }

    initializeAnimations() {
        this.animateHero();
        this.animateCardsOnScroll();
        this.animateCTA();
        this.setupParallaxEffects();
    }

    // Strategy 1: Scroll-Triggered Animations
    animateHero() {
        const heroTL = gsap.timeline({ delay: 0.5 });

        // Badge entrance with bounce
        heroTL.to('.hero-badge', {
            duration: CONFIG.duration.medium,
            scale: 1,
            opacity: 1,
            ease: CONFIG.ease.bounce
        });

        // Strategy 2: Staggered Entry - Title words
        heroTL.to('.title-word', {
            duration: CONFIG.duration.slow,
            y: 0,
            rotationX: 0,
            opacity: 1,
            stagger: CONFIG.stagger.medium,
            ease: CONFIG.ease.smooth
        }, '-=0.3');

        // Description with smooth entrance
        heroTL.to('.hero-description', {
            duration: CONFIG.duration.medium,
            y: 0,
            opacity: 1,
            ease: CONFIG.ease.smooth
        }, '-=0.4');

        // Scroll hint with subtle animation
        heroTL.to('.scroll-hint', {
            duration: CONFIG.duration.medium,
            y: 0,
            opacity: 1,
            ease: CONFIG.ease.smooth
        }, '-=0.2');

        // Strategy 2: Staggered Entry - Floating cards
        heroTL.to('.floating-card', {
            duration: CONFIG.duration.slow,
            y: 0,
            opacity: 1,
            stagger: CONFIG.stagger.slow,
            ease: CONFIG.ease.elastic,
            onComplete: () => {
                this.startFloatingCardAnimation();
            }
        }, '-=0.6');

        // Strategy 6: Section Transitions - Smooth hero exit
        this.setupHeroParallax();
    }

    startFloatingCardAnimation() {
        // Continuous floating animation for cards
        gsap.to('.card-tech', {
            y: -15,
            rotation: 3,
            duration: 4,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
        });

        gsap.to('.card-design', {
            y: -20,
            rotation: -2,
            duration: 3.5,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: 1
        });

        gsap.to('.card-plan', {
            y: -12,
            rotation: 4,
            duration: 4.2,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: 2
        });

        gsap.to('.card-network', {
            y: -18,
            rotation: -1,
            duration: 3.8,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: 1.5
        });
    }

    // Strategy 1 & 2: Scroll-triggered animations with staggered entry
    animateCardsOnScroll() {
        const cards = document.querySelectorAll('.info-card');
        
        cards.forEach((card, index) => {
            ScrollTrigger.create({
                trigger: card,
                start: "top 85%",
                onEnter: () => {
                    // Strategy 1: Fade-in, slide-in effects
                    gsap.to(card, {
                        duration: CONFIG.duration.slow,
                        y: 0,
                        scale: 1,
                        opacity: 1,
                        rotationY: 0,
                        ease: CONFIG.ease.smooth,
                        delay: index * 0.1 // Strategy 2: Staggered delay
                    });

                    // Animate internal elements
                    this.animateCardInternals(card);
                },
                onLeave: () => {
                    // Strategy 6: Subtle section transitions
                    gsap.to(card, {
                        duration: CONFIG.duration.fast,
                        scale: 0.98,
                        opacity: 0.8,
                        ease: CONFIG.ease.natural
                    });
                },
                onEnterBack: () => {
                    gsap.to(card, {
                        duration: CONFIG.duration.medium,
                        scale: 1,
                        opacity: 1,
                        ease: CONFIG.ease.natural
                    });
                },
                onLeaveBack: () => {
                    gsap.to(card, {
                        duration: CONFIG.duration.fast,
                        y: 30,
                        scale: 0.95,
                        opacity: 0.7,
                        ease: CONFIG.ease.natural
                    });
                }
            });
        });
    }

    animateCardInternals(card) {
        // Strategy 2: Staggered entry for card internal elements
        const elements = card.querySelectorAll('.card-number, .card-title, .card-text, .activity-item, .logo, .achievement-item, .timeline-step, .value-item');
        
        if (elements.length > 0) {
            gsap.from(elements, {
                duration: CONFIG.duration.medium,
                y: 20,
                opacity: 0,
                stagger: CONFIG.stagger.quick,
                ease: CONFIG.ease.smooth,
                delay: 0.2
            });
        }

        // Special animation for stats
        const statNumbers = card.querySelectorAll('.stat-number, .achievement-number');
        statNumbers.forEach(stat => {
            const finalValue = parseInt(stat.textContent.replace(/\D/g, ''));
            const suffix = stat.textContent.replace(/\d/g, '');
            
            gsap.from({ value: 0 }, {
                duration: 1.5,
                value: finalValue,
                ease: "power2.out",
                delay: 0.5,
                onUpdate: function() {
                    const currentValue = Math.round(this.targets()[0].value);
                    stat.textContent = currentValue + suffix;
                }
            });
        });
    }

    // Strategy 3: CTA Animation with emphasis
    animateCTA() {
        ScrollTrigger.create({
            trigger: '.cta-section',
            start: "top 80%",
            onEnter: () => {
                const ctaTL = gsap.timeline();

                // Badge with bounce
                ctaTL.to('.cta-badge', {
                    duration: CONFIG.duration.medium,
                    scale: 1,
                    opacity: 1,
                    ease: CONFIG.ease.bounce
                });

                // Strategy 2: Staggered title lines
                ctaTL.to('.cta-line', {
                    duration: CONFIG.duration.medium,
                    y: 0,
                    opacity: 1,
                    stagger: CONFIG.stagger.quick,
                    ease: CONFIG.ease.smooth
                }, '-=0.2');

                // Description
                ctaTL.to('.cta-description', {
                    duration: CONFIG.duration.medium,
                    y: 0,
                    opacity: 1,
                    ease: CONFIG.ease.smooth
                }, '-=0.3');

                // Strategy 3: CTA buttons with emphasis
                ctaTL.to('.cta-btn', {
                    duration: CONFIG.duration.medium,
                    y: 0,
                    opacity: 1,
                    stagger: CONFIG.stagger.quick,
                    ease: CONFIG.ease.bounce
                }, '-=0.2');

                // Strategy 2: Staggered CTA cards
                ctaTL.to('.cta-card', {
                    duration: CONFIG.duration.slow,
                    x: 0,
                    opacity: 1,
                    stagger: CONFIG.stagger.medium,
                    ease: CONFIG.ease.elastic
                }, '-=0.4');

                // Strategy 3: Continuous pulse for primary CTA
                this.startCTAPulse();
            }
        });
    }

    startCTAPulse() {
        gsap.to('.cta-btn.primary', {
            scale: 1.05,
            duration: 2,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: 2
        });
    }

    // Strategy 4: Parallax and Depth
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
            rotation: 45,
            scale: 1.2,
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
            scale: 1.3,
            ease: "none"
        });

        // Cards subtle parallax
        document.querySelectorAll('.info-card').forEach(card => {
            gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 2
                },
                y: -20,
                ease: "none"
            });
        });
    }

    setupHeroParallax() {
        gsap.to('.hero-content', {
            scrollTrigger: {
                trigger: '.hero-section',
                start: "top top",
                end: "bottom top",
                scrub: 1
            },
            y: -50,
            opacity: 0.8,
            ease: "none"
        });

        gsap.to('.floating-cards', {
            scrollTrigger: {
                trigger: '.hero-section',
                start: "top top",
                end: "bottom top",
                scrub: 1
            },
            y: -80,
            rotation: 10,
            ease: "none"
        });
    }

    // Strategy 5: Hover and Tap Interactions
    setupInteractions() {
        this.setupCardHoverEffects();
        this.setupButtonInteractions();
        this.setupFloatingCardInteractions();
        this.setupMagneticEffects();
    }

    setupCardHoverEffects() {
        document.querySelectorAll('.info-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    duration: CONFIG.duration.fast,
                    y: -8,
                    scale: 1.02,
                    boxShadow: "0 16px 64px rgba(0, 0, 0, 0.15)",
                    ease: CONFIG.ease.natural
                });

                // Animate card number
                const cardNumber = card.querySelector('.card-number');
                if (cardNumber) {
                    gsap.to(cardNumber, {
                        duration: CONFIG.duration.fast,
                        scale: 1.1,
                        rotation: 5,
                        ease: CONFIG.ease.bounce
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: CONFIG.duration.fast,
                    y: 0,
                    scale: 1,
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                    ease: CONFIG.ease.natural
                });

                const cardNumber = card.querySelector('.card-number');
                if (cardNumber) {
                    gsap.to(cardNumber, {
                        duration: CONFIG.duration.fast,
                        scale: 1,
                        rotation: 0,
                        ease: CONFIG.ease.natural
                    });
                }
            });

            // Strategy 5: Tap feedback
            card.addEventListener('mousedown', () => {
                gsap.to(card, {
                    duration: 0.1,
                    scale: 0.98,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseup', () => {
                gsap.to(card, {
                    duration: CONFIG.duration.fast,
                    scale: 1.02,
                    ease: CONFIG.ease.bounce
                });
            });
        });

        // Activity items hover
        document.querySelectorAll('.activity-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                gsap.to(item, {
                    duration: CONFIG.duration.fast,
                    x: 8,
                    backgroundColor: "rgba(78, 205, 196, 0.08)",
                    ease: CONFIG.ease.natural
                });
            });

            item.addEventListener('mouseleave', () => {
                gsap.to(item, {
                    duration: CONFIG.duration.fast,
                    x: 0,
                    backgroundColor: "var(--bg-light)",
                    ease: CONFIG.ease.natural
                });
            });
        });

        // Logo hover effects
        document.querySelectorAll('.logo').forEach(logo => {
            logo.addEventListener('mouseenter', () => {
                gsap.to(logo, {
                    duration: CONFIG.duration.fast,
                    y: -2,
                    backgroundColor: "rgba(255, 64, 129, 0.1)",
                    ease: CONFIG.ease.natural
                });
            });

            logo.addEventListener('mouseleave', () => {
                gsap.to(logo, {
                    duration: CONFIG.duration.fast,
                    y: 0,
                    backgroundColor: "var(--bg-light)",
                    ease: CONFIG.ease.natural
                });
            });
        });
    }

    setupButtonInteractions() {
        document.querySelectorAll('.cta-btn').forEach(btn => {
            // Strategy 5: Hover interactions
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, {
                    duration: CONFIG.duration.fast,
                    y: -4,
                    scale: 1.05,
                    ease: CONFIG.ease.natural
                });

                gsap.to(btn.querySelector('.btn-arrow'), {
                    duration: CONFIG.duration.fast,
                    x: 4,
                    ease: CONFIG.ease.natural
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    duration: CONFIG.duration.fast,
                    y: 0,
                    scale: 1,
                    ease: CONFIG.ease.natural
                });

                gsap.to(btn.querySelector('.btn-arrow'), {
                    duration: CONFIG.duration.fast,
                    x: 0,
                    ease: CONFIG.ease.natural
                });
            });

            // Strategy 5: Tap feedback with ripple effect
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

                gsap.to(btn, {
                    duration: 0.1,
                    scale: 0.95,
                    ease: "power2.out",
                    yoyo: true,
                    repeat: 1
                });
            });
        });
    }

    setupFloatingCardInteractions() {
        document.querySelectorAll('.floating-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    duration: CONFIG.duration.fast,
                    y: -10,
                    scale: 1.15,
                    rotation: 10,
                    ease: CONFIG.ease.bounce
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: CONFIG.duration.medium,
                    y: 0,
                    scale: 1,
                    rotation: 0,
                    ease: CONFIG.ease.elastic
                });
            });

            card.addEventListener('click', () => {
                gsap.to(card, {
                    duration: 0.6,
                    rotation: 360,
                    scale: 1.3,
                    ease: CONFIG.ease.bounce,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        gsap.set(card, { rotation: 0 });
                    }
                });
            });
        });
    }

    // Strategy 5: Magnetic effects for interactive elements
    setupMagneticEffects() {
        document.querySelectorAll('.cta-btn, .floating-card').forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = (e.clientX - centerX) * 0.3;
                const deltaY = (e.clientY - centerY) * 0.3;

                gsap.to(element, {
                    duration: CONFIG.duration.fast,
                    x: deltaX,
                    y: deltaY,
                    ease: CONFIG.ease.natural
                });
            });

            element.addEventListener('mouseleave', () => {
                gsap.to(element, {
                    duration: CONFIG.duration.medium,
                    x: 0,
                    y: 0,
                    ease: CONFIG.ease.elastic
                });
            });
        });
    }

    setupTestimonialCarousel() {
        const testimonials = document.querySelectorAll('.testimonial-item');
        const dots = document.querySelectorAll('.dot');
        
        if (testimonials.length === 0) return;

        // Auto-rotate testimonials
        this.testimonialTimer = setInterval(() => {
            this.nextTestimonial();
        }, 5000);

        // Dot click handlers
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToTestimonial(index);
            });
        });
    }

    nextTestimonial() {
        const testimonials = document.querySelectorAll('.testimonial-item');
        const dots = document.querySelectorAll('.dot');
        
        // Hide current
        testimonials[this.testimonialIndex].classList.remove('active');
        dots[this.testimonialIndex].classList.remove('active');
        
        // Show next
        this.testimonialIndex = (this.testimonialIndex + 1) % testimonials.length;
        testimonials[this.testimonialIndex].classList.add('active');
        dots[this.testimonialIndex].classList.add('active');
    }

    goToTestimonial(index) {
        const testimonials = document.querySelectorAll('.testimonial-item');
        const dots = document.querySelectorAll('.dot');
        
        // Hide current
        testimonials[this.testimonialIndex].classList.remove('active');
        dots[this.testimonialIndex].classList.remove('active');
        
        // Show selected
        this.testimonialIndex = index;
        testimonials[this.testimonialIndex].classList.add('active');
        dots[this.testimonialIndex].classList.add('active');
        
        // Reset timer
        clearInterval(this.testimonialTimer);
        this.testimonialTimer = setInterval(() => {
            this.nextTestimonial();
        }, 5000);
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
            
            // Disable expensive parallax effects
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.vars && trigger.vars.scrub) {
                    trigger.kill();
                }
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new CardsAnimationController();
    new PerformanceOptimizer();
});

// Cleanup
window.addEventListener('beforeunload', () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    gsap.killTweensOf("*");
});