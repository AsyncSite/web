// AsyncSite Alternating About Section - Ultra Modern Animation System
// Luxurious & Cutting-edge GSAP ScrollTrigger Implementation

gsap.registerPlugin(ScrollTrigger);

// Enhanced animation configuration
const CONFIG = {
    ease: {
        smooth: "power3.out",
        bounce: "back.out(1.7)",
        elastic: "elastic.out(1, 0.5)",
        custom: "cubic-bezier(0.4, 0, 0.2, 1)"
    },
    duration: {
        fast: 0.3,
        normal: 0.6,
        slow: 1.2,
        extraSlow: 2.0
    },
    stagger: {
        quick: 0.1,
        normal: 0.2,
        slow: 0.3
    }
};

// Ultra-smooth page initialization
gsap.set("body", { 
    overflow: "hidden",
    background: "radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f1a 100%)"
});

// Advanced cursor following effect
class ModernCursor {
    constructor() {
        this.cursor = this.createCursor();
        this.init();
    }

    createCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'modern-cursor';
        cursor.innerHTML = `
            <div class="cursor-dot"></div>
            <div class="cursor-ring"></div>
        `;
        document.body.appendChild(cursor);
        
        // Add cursor styles
        const style = document.createElement('style');
        style.textContent = `
            .modern-cursor {
                position: fixed;
                pointer-events: none;
                z-index: 10000;
                mix-blend-mode: difference;
            }
            .cursor-dot {
                width: 6px;
                height: 6px;
                background: #667eea;
                border-radius: 50%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                transition: all 0.1s ease;
            }
            .cursor-ring {
                width: 40px;
                height: 40px;
                border: 2px solid rgba(102, 126, 234, 0.3);
                border-radius: 50%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                transition: all 0.3s ease;
            }
            .modern-cursor.hover .cursor-ring {
                width: 60px;
                height: 60px;
                border-color: rgba(255, 107, 107, 0.6);
            }
            .modern-cursor.click .cursor-dot {
                transform: translate(-50%, -50%) scale(2);
                background: #ff6b6b;
            }
        `;
        document.head.appendChild(style);
        
        return cursor;
    }

    init() {
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        // Smooth cursor following
        const updateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            
            gsap.set(this.cursor, {
                x: cursorX,
                y: cursorY
            });
            
            requestAnimationFrame(updateCursor);
        };
        updateCursor();
        
        // Interactive elements
        document.querySelectorAll('button, .cta-button, .closing-cta').forEach(el => {
            el.addEventListener('mouseenter', () => this.cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => this.cursor.classList.remove('hover'));
            el.addEventListener('mousedown', () => this.cursor.classList.add('click'));
            el.addEventListener('mouseup', () => this.cursor.classList.remove('click'));
        });
    }
}

// Magnetic hover effects for interactive elements
class MagneticElements {
    constructor(selector) {
        this.elements = document.querySelectorAll(selector);
        this.init();
    }

    init() {
        this.elements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(element, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: CONFIG.duration.fast,
                    ease: CONFIG.ease.custom
                });
            });
            
            element.addEventListener('mouseleave', () => {
                gsap.to(element, {
                    x: 0,
                    y: 0,
                    duration: CONFIG.duration.normal,
                    ease: CONFIG.ease.elastic
                });
            });
        });
    }
}

// Advanced scroll-triggered animations
class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupHeroAnimations();
        this.setupAboutBlockAnimations();
        this.setupClosingAnimation();
        this.setupParallaxEffects();
        this.setupScrollProgress();
    }

    setupHeroAnimations() {
        const tl = gsap.timeline({ delay: 0.5 });
        
        // Hero entrance with stagger
        tl.from(".hero-title", {
            duration: CONFIG.duration.extraSlow,
            y: 120,
            opacity: 0,
            scale: 0.8,
            ease: CONFIG.ease.smooth,
            onComplete: () => {
                // Add floating animation
                gsap.to(".hero-title", {
                    y: -10,
                    duration: 4,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true
                });
            }
        })
        .from(".hero-subtitle", {
            duration: CONFIG.duration.slow,
            y: 60,
            opacity: 0,
            ease: CONFIG.ease.smooth
        }, "-=0.8")
        .from(".hero-section::before", {
            duration: CONFIG.duration.extraSlow,
            scale: 0,
            opacity: 0,
            ease: CONFIG.ease.smooth
        }, "-=1.5");
    }

    setupAboutBlockAnimations() {
        const blocks = document.querySelectorAll('.about-block');
        
        blocks.forEach((block, index) => {
            const layout = block.getAttribute('data-layout');
            const questionContent = block.querySelector('.question-content');
            const answerContent = block.querySelector('.answer-content');
            const questionIcon = block.querySelector('.question-icon');
            const additionalElements = block.querySelectorAll('.stat-item, .feature-item, .cta-button, .timeline-item');
            
            // Create master timeline for each block
            const masterTl = gsap.timeline({
                scrollTrigger: {
                    trigger: block,
                    start: "top 85%",
                    end: "bottom 15%",
                    toggleActions: "play reverse play reverse",
                    onEnter: () => this.animateBlockIn(block, layout),
                    onLeave: () => this.addSubtleExitEffect(block),
                    onEnterBack: () => this.animateBlockIn(block, layout),
                    onLeaveBack: () => this.addSubtleExitEffect(block)
                }
            });
            
            // Advanced staggered entrance
            this.createBlockTimeline(block, layout, masterTl);
        });
    }

    createBlockTimeline(block, layout, timeline) {
        const questionContent = block.querySelector('.question-content');
        const answerContent = block.querySelector('.answer-content');
        const questionIcon = block.querySelector('.question-icon');
        const questionNumber = block.querySelector('.question-number');
        const answerTitle = block.querySelector('.answer-title');
        const additionalElements = block.querySelectorAll('.stat-item, .feature-item, .cta-button, .timeline-item');

        // Reset positions based on layout
        if (layout === 'question-left') {
            gsap.set(questionContent, { x: -150, y: 50, opacity: 0, rotationY: -15, scale: 0.9 });
            gsap.set(answerContent, { x: 150, y: 50, opacity: 0, rotationY: 15, scale: 0.9 });
        } else {
            gsap.set(answerContent, { x: -150, y: 50, opacity: 0, rotationY: -15, scale: 0.9 });
            gsap.set(questionContent, { x: 150, y: 50, opacity: 0, rotationY: 15, scale: 0.9 });
        }

        // Entrance sequence with advanced easing
        const entranceTl = gsap.timeline({ paused: true });

        if (layout === 'question-left') {
            entranceTl
                .to(questionContent, {
                    duration: CONFIG.duration.slow,
                    x: 0, y: 0,
                    opacity: 1,
                    rotationY: 0,
                    scale: 1,
                    ease: CONFIG.ease.smooth
                })
                .to(answerContent, {
                    duration: CONFIG.duration.slow,
                    x: 0, y: 0,
                    opacity: 1,
                    rotationY: 0,
                    scale: 1,
                    ease: CONFIG.ease.smooth
                }, "-=0.4");
        } else {
            entranceTl
                .to(answerContent, {
                    duration: CONFIG.duration.slow,
                    x: 0, y: 0,
                    opacity: 1,
                    rotationY: 0,
                    scale: 1,
                    ease: CONFIG.ease.smooth
                })
                .to(questionContent, {
                    duration: CONFIG.duration.slow,
                    x: 0, y: 0,
                    opacity: 1,
                    rotationY: 0,
                    scale: 1,
                    ease: CONFIG.ease.smooth
                }, "-=0.4");
        }

        // Icon animation with bounce effect
        entranceTl.from(questionIcon, {
            duration: CONFIG.duration.normal,
            scale: 0,
            rotation: 180,
            ease: CONFIG.ease.bounce
        }, "-=0.3");

        // Number animation with typewriter effect
        entranceTl.from(questionNumber, {
            duration: CONFIG.duration.normal,
            scale: 0,
            ease: CONFIG.ease.bounce
        }, "-=0.5");

        // Title animation with gradient reveal
        entranceTl.from(answerTitle, {
            duration: CONFIG.duration.normal,
            y: 30,
            opacity: 0,
            ease: CONFIG.ease.smooth
        }, "-=0.4");

        // Stagger additional elements
        if (additionalElements.length > 0) {
            entranceTl.from(additionalElements, {
                duration: CONFIG.duration.normal,
                y: 40,
                opacity: 0,
                stagger: CONFIG.stagger.quick,
                ease: CONFIG.ease.smooth
            }, "-=0.3");
        }

        timeline.add(entranceTl);
        return entranceTl;
    }

    animateBlockIn(block, layout) {
        const questionContent = block.querySelector('.question-content');
        const answerContent = block.querySelector('.answer-content');
        
        // Add entrance effects
        gsap.to([questionContent, answerContent], {
            duration: 0.1,
            scale: 1.02,
            ease: "power2.out",
            yoyo: true,
            repeat: 1
        });
    }

    addSubtleExitEffect(block) {
        const contents = block.querySelectorAll('.question-content, .answer-content');
        gsap.to(contents, {
            duration: CONFIG.duration.fast,
            scale: 0.98,
            opacity: 0.8,
            ease: CONFIG.ease.custom
        });
    }

    setupClosingAnimation() {
        const closingSection = document.querySelector('.closing-section');
        const closingElements = closingSection.querySelectorAll('.closing-title, .closing-text, .closing-cta');
        
        gsap.from(closingElements, {
            scrollTrigger: {
                trigger: closingSection,
                start: "top 90%",
                toggleActions: "play none none reverse"
            },
            duration: CONFIG.duration.slow,
            y: 80,
            opacity: 0,
            stagger: CONFIG.stagger.normal,
            ease: CONFIG.ease.smooth,
            onComplete: () => {
                // Add floating animation to CTA
                gsap.to('.closing-cta', {
                    y: -5,
                    duration: 3,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true
                });
            }
        });
    }

    setupParallaxEffects() {
        // Hero parallax
        gsap.to('.hero-section::before', {
            scrollTrigger: {
                trigger: '.hero-section',
                start: "top top",
                end: "bottom top",
                scrub: 1
            },
            y: -100,
            scale: 1.1,
            ease: "none"
        });

        // Question icons parallax
        document.querySelectorAll('.question-icon').forEach(icon => {
            gsap.to(icon, {
                scrollTrigger: {
                    trigger: icon.closest('.about-block'),
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                },
                y: -30,
                rotation: 5,
                ease: "none"
            });
        });
    }

    setupScrollProgress() {
        // Ultra-modern progress indicator
        const progressContainer = document.createElement('div');
        progressContainer.innerHTML = `
            <div class="scroll-progress">
                <div class="progress-track">
                    <div class="progress-fill"></div>
                    <div class="progress-glow"></div>
                </div>
                <div class="progress-circles">
                    <div class="progress-circle"></div>
                    <div class="progress-circle"></div>
                    <div class="progress-circle"></div>
                </div>
            </div>
        `;
        
        // Add progress styles
        const style = document.createElement('style');
        style.textContent = `
            .scroll-progress {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 4px;
                height: 200px;
                z-index: 1000;
                pointer-events: none;
            }
            .progress-track {
                position: relative;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                overflow: hidden;
            }
            .progress-fill {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 0%;
                background: linear-gradient(to top, #667eea, #ff6b6b);
                border-radius: 10px;
                transition: height 0.1s ease;
            }
            .progress-glow {
                position: absolute;
                bottom: 0;
                left: -10px;
                width: 24px;
                height: 20px;
                background: radial-gradient(ellipse, rgba(102, 126, 234, 0.6), transparent);
                border-radius: 50%;
                filter: blur(8px);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .progress-circles {
                position: absolute;
                top: -10px;
                right: -8px;
                display: flex;
                flex-direction: column;
                gap: 60px;
            }
            .progress-circle {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(102, 126, 234, 0.3);
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            .progress-circle.active {
                border-color: #667eea;
                box-shadow: 0 0 20px rgba(102, 126, 234, 0.6);
            }
            @media (max-width: 768px) {
                .scroll-progress { display: none; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(progressContainer);

        const progressFill = progressContainer.querySelector('.progress-fill');
        const progressGlow = progressContainer.querySelector('.progress-glow');
        const progressCircles = progressContainer.querySelectorAll('.progress-circle');

        ScrollTrigger.create({
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
                const progress = self.progress * 100;
                progressFill.style.height = progress + '%';
                
                if (progress > 10) {
                    progressGlow.style.opacity = '1';
                    progressGlow.style.bottom = (progress - 2) + '%';
                } else {
                    progressGlow.style.opacity = '0';
                }

                // Update circles based on sections
                const sectionProgress = Math.floor(progress / 25);
                progressCircles.forEach((circle, index) => {
                    circle.classList.toggle('active', index <= sectionProgress);
                });
            }
        });
    }
}

// Enhanced button interactions
class ButtonEffects {
    constructor() {
        this.init();
    }

    init() {
        this.setupRippleEffects();
        this.setupHoverAnimations();
        this.setupClickFeedback();
    }

    setupRippleEffects() {
        document.querySelectorAll('.cta-button, .closing-cta').forEach(button => {
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('div');
                const rect = button.getBoundingClientRect();
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

                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);

                gsap.to(ripple, {
                    scale: 2,
                    opacity: 0,
                    duration: 0.6,
                    ease: "power2.out",
                    onComplete: () => ripple.remove()
                });
            });
        });
    }

    setupHoverAnimations() {
        document.querySelectorAll('.cta-button, .closing-cta').forEach(button => {
            button.addEventListener('mouseenter', () => {
                gsap.to(button, {
                    scale: 1.05,
                    y: -3,
                    duration: CONFIG.duration.fast,
                    ease: CONFIG.ease.custom
                });
            });

            button.addEventListener('mouseleave', () => {
                gsap.to(button, {
                    scale: 1,
                    y: 0,
                    duration: CONFIG.duration.fast,
                    ease: CONFIG.ease.custom
                });
            });
        });
    }

    setupClickFeedback() {
        document.querySelectorAll('.cta-button, .closing-cta').forEach(button => {
            button.addEventListener('mousedown', () => {
                gsap.to(button, {
                    scale: 0.98,
                    duration: 0.1,
                    ease: "power2.out"
                });
            });

            button.addEventListener('mouseup', () => {
                gsap.to(button, {
                    scale: 1.05,
                    duration: CONFIG.duration.fast,
                    ease: CONFIG.ease.bounce
                });
            });
        });
    }
}

// Performance optimization for mobile
class PerformanceOptimizer {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.optimize();
    }

    optimize() {
        if (this.isMobile || this.reducedMotion) {
            // Reduce animation complexity
            gsap.globalTimeline.timeScale(2);
            
            // Disable complex effects
            document.querySelectorAll('.modern-cursor, .progress-glow').forEach(el => {
                if (el) el.style.display = 'none';
            });
            
            // Simplify scroll triggers
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.animation) {
                    trigger.animation.duration(trigger.animation.duration() * 0.5);
                }
            });
        }
    }
}

// Initialize everything when page loads
window.addEventListener('load', () => {
    // Enable scrolling
    gsap.set("body", { overflow: "auto" });
    
    // Initialize all systems
    new ModernCursor();
    new MagneticElements('.cta-button, .closing-cta, .question-icon');
    new ScrollAnimations();
    new ButtonEffects();
    new PerformanceOptimizer();
    
    // Final setup
    ScrollTrigger.refresh();
    
    // Add loading complete class for additional CSS transitions
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 1000);
});

// Handle resize and orientation changes
window.addEventListener('resize', gsap.utils.debounce(() => {
    ScrollTrigger.refresh();
    new PerformanceOptimizer();
}, 250));

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    gsap.killTweensOf("*");
});

// Enhanced accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            gsap.to(window, {
                duration: 1.5,
                scrollTo: target,
                ease: CONFIG.ease.smooth
            });
        }
    });
});