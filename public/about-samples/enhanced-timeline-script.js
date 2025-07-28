// Enhanced Timeline About Page - JavaScript
// SOPT 프로젝트 스타일과 통합된 고도화된 인터랙션 시스템

class EnhancedTimelineController {
    constructor() {
        this.currentSection = 'hero';
        this.sections = ['hero', 'origin', 'growth', 'innovation', 'community', 'future'];
        this.isScrolling = false;
        this.isNavigationOpen = false;
        this.animationManager = new AnimationManager();
        this.intersectionObserver = null;
        this.loadingScreen = null;
        this.particleSystem = null;
        
        this.init();
    }

    async init() {
        try {
            // 로딩 화면 표시
            this.showLoadingScreen();
            
            // 핵심 시스템 초기화
            await this.initializeSystems();
            
            // 로딩 완료 후 페이지 표시
            setTimeout(() => {
                this.hideLoadingScreen();
                this.startInitialAnimations();
            }, 2000);
            
        } catch (error) {
            console.error('Timeline initialization failed:', error);
            this.hideLoadingScreen();
        }
    }

    async initializeSystems() {
        // GSAP 플러그인 등록
        gsap.registerPlugin(ScrollTrigger, TextPlugin);
        
        // 시스템 컴포넌트 초기화
        this.setupScrollAnimations();
        this.setupNavigation();
        this.setupIntersectionObserver();
        this.setupParticleSystem();
        this.setupCountAnimations();
        this.setupInteractiveElements();
        this.addEventListeners();
        
        // 접근성 설정
        this.setupAccessibility();
        
        // 성능 최적화
        this.setupPerformanceOptimizations();
    }

    showLoadingScreen() {
        this.loadingScreen = document.getElementById('loadingScreen');
        if (!this.loadingScreen) return;

        const progressBar = this.loadingScreen.querySelector('#loadingProgress');
        const loadingTip = this.loadingScreen.querySelector('#loadingTip');
        
        const tips = [
            '28년의 역사를 준비하는 중...',
            'SOPT의 성장 스토리를 로딩 중...',
            '동문들의 이야기를 불러오는 중...',
            '미래의 비전을 그리는 중...',
            '당신의 여정을 기다리는 중...'
        ];

        let progress = 0;
        let tipIndex = 0;

        const updateProgress = () => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            progressBar.style.width = progress + '%';
            
            if (tipIndex < tips.length - 1 && progress > (tipIndex + 1) * 20) {
                tipIndex++;
                gsap.to(loadingTip, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        loadingTip.textContent = tips[tipIndex];
                        gsap.to(loadingTip, { opacity: 1, duration: 0.3 });
                    }
                });
            }
            
            if (progress < 100) {
                setTimeout(updateProgress, Math.random() * 200 + 100);
            }
        };

        updateProgress();
    }

    hideLoadingScreen() {
        if (!this.loadingScreen) return;
        
        gsap.to(this.loadingScreen, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                this.loadingScreen.style.display = 'none';
            }
        });
    }

    startInitialAnimations() {
        // 히어로 섹션 초기 애니메이션
        const heroElements = document.querySelectorAll('.hero-section .animate-on-scroll');
        
        gsap.fromTo(heroElements, {
            opacity: 0,
            y: 50
        }, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.2,
            ease: "power2.out",
            delay: 0.3
        });
    }

    setupScrollAnimations() {
        // 히어로 섹션 패럴랙스
        this.animationManager.createParallaxEffect('.hero-background', 0.5);
        this.animationManager.createParallaxEffect('.shape', 0.3);
        
        // 섹션별 애니메이션
        this.sections.forEach((sectionId, index) => {
            const section = document.getElementById(sectionId);
            if (!section || sectionId === 'hero') return;

            this.animationManager.createSectionAnimation(section, index);
        });

        // 텍스트 리빌 애니메이션
        this.animationManager.setupTextReveal();
        
        // 스크롤 진행 표시
        this.setupScrollProgress();
    }

    setupNavigation() {
        const navigation = document.getElementById('leftNavigation');
        const navToggle = document.getElementById('navToggle');
        const navItems = document.querySelectorAll('.nav-item');
        const nextSectionBtn = document.getElementById('nextSectionBtn');
        const overviewBtn = document.getElementById('overviewBtn');

        // 네비게이션 토글
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                this.toggleNavigation();
            });
        }

        // 네비게이션 아이템 클릭
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = item.getAttribute('data-section');
                this.navigateToSection(targetSection);
            });
        });

        // 다음 섹션 버튼
        if (nextSectionBtn) {
            nextSectionBtn.addEventListener('click', () => {
                this.navigateNext();
            });
        }

        // 전체보기 버튼
        if (overviewBtn) {
            overviewBtn.addEventListener('click', () => {
                this.showOverview();
            });
        }

        // 네비게이션 호버 효과
        this.setupNavigationHoverEffects(navItems);
    }

    setupNavigationHoverEffects(navItems) {
        navItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                gsap.to(item, {
                    x: 10,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            item.addEventListener('mouseleave', () => {
                gsap.to(item, {
                    x: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });
    }

    toggleNavigation() {
        const navigation = document.getElementById('leftNavigation');
        const navToggle = document.getElementById('navToggle');
        
        this.isNavigationOpen = !this.isNavigationOpen;
        
        navigation.classList.toggle('open', this.isNavigationOpen);
        navToggle.classList.toggle('active', this.isNavigationOpen);

        // 모바일에서 네비게이션 오버레이 효과
        if (window.innerWidth <= 1024) {
            if (this.isNavigationOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }

    navigateToSection(sectionId) {
        const targetSection = document.getElementById(sectionId);
        if (!targetSection) return;

        this.updateNavigation(sectionId);
        
        // 부드러운 스크롤
        gsap.to(window, {
            duration: 1.8,
            scrollTo: {
                y: targetSection,
                offsetY: 0
            },
            ease: "power2.inOut",
            onStart: () => {
                this.isScrolling = true;
            },
            onComplete: () => {
                this.isScrolling = false;
                
                // 섹션 도착 후 추가 애니메이션
                this.animationManager.triggerSectionEntryAnimation(sectionId);
            }
        });

        // 모바일에서 네비게이션 자동 닫기
        if (window.innerWidth <= 1024 && this.isNavigationOpen) {
            this.toggleNavigation();
        }
    }

    updateNavigation(activeSectionId) {
        const navItems = document.querySelectorAll('.nav-item');
        const progressBar = document.getElementById('progressBar');
        const currentStep = document.getElementById('currentStep');
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === activeSectionId) {
                item.classList.add('active');
                
                // 네비게이션 활성화 애니메이션
                gsap.fromTo(item, {
                    scale: 1
                }, {
                    scale: 1.05,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut"
                });
            }
        });

        // 진행률 업데이트
        const sectionIndex = this.sections.indexOf(activeSectionId);
        if (sectionIndex !== -1) {
            const progress = ((sectionIndex + 1) / this.sections.length) * 100;
            
            if (progressBar) {
                gsap.to(progressBar, {
                    width: progress + '%',
                    duration: 0.8,
                    ease: "power2.out"
                });
            }
            
            if (currentStep) {
                gsap.to(currentStep, {
                    textContent: sectionIndex + 1,
                    duration: 0.5,
                    snap: { textContent: 1 }
                });
            }
        }

        this.currentSection = activeSectionId;
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '-20% 0px -20% 0px',
            threshold: 0.3
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isScrolling) {
                    const sectionId = entry.target.id;
                    if (this.sections.includes(sectionId)) {
                        this.updateNavigation(sectionId);
                        
                        // 네비게이션이 보여야 하는 섹션인지 확인
                        if (sectionId !== 'hero') {
                            this.showNavigation();
                        }
                    }
                }
            });
        }, options);

        // 섹션들을 관찰 대상에 추가
        this.sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                this.intersectionObserver.observe(section);
            }
        });
    }

    showNavigation() {
        const navigation = document.getElementById('leftNavigation');
        if (navigation && !navigation.classList.contains('visible')) {
            navigation.classList.add('visible');
            
            // 네비게이션 메뉴 항목들 스태거 애니메이션
            const navItems = navigation.querySelectorAll('.nav-item');
            gsap.fromTo(navItems, {
                opacity: 0,
                x: -30
            }, {
                opacity: 1,
                x: 0,
                duration: 0.6,
                stagger: 0.1,
                delay: 0.3,
                ease: "power2.out"
            });
        }
    }

    hideNavigation() {
        const navigation = document.getElementById('leftNavigation');
        if (navigation && navigation.classList.contains('visible')) {
            navigation.classList.remove('visible');
        }
    }

    setupParticleSystem() {
        const particleContainer = document.getElementById('particleContainer');
        if (!particleContainer) return;

        this.particleSystem = new ParticleSystem(particleContainer);
        this.particleSystem.init();
    }

    setupCountAnimations() {
        const counters = document.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            const finalValue = parseInt(counter.getAttribute('data-count'));
            if (isNaN(finalValue)) return;

            ScrollTrigger.create({
                trigger: counter,
                start: "top 85%",
                onEnter: () => {
                    this.animationManager.animateCounter(counter, finalValue);
                }
            });
        });
    }

    setupInteractiveElements() {
        // 카드 호버 효과
        this.setupCardInteractions();
        
        // 버튼 인터랙션
        this.setupButtonInteractions();
        
        // 마일스톤 아이템 효과
        this.setupMilestoneInteractions();
        
        // CTA 섹션 효과
        this.setupCTAInteractions();
    }

    setupCardInteractions() {
        const cards = document.querySelectorAll('.enhanced-hover');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.animationManager.enhancedHoverEnter(card);
                
                // 카드 내부 요소들 애니메이션
                const icon = card.querySelector('.card-icon, .milestone-icon, .goal-icon');
                const title = card.querySelector('.card-title, .milestone-title');
                
                if (icon) {
                    gsap.to(icon, {
                        scale: 1.1,
                        rotation: 5,
                        duration: 0.3,
                        ease: "back.out(1.7)"
                    });
                }
                
                if (title) {
                    gsap.to(title, {
                        color: '#C3E88D',
                        y: -2,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });

            card.addEventListener('mouseleave', (e) => {
                this.animationManager.enhancedHoverLeave(card);
                
                const icon = card.querySelector('.card-icon, .milestone-icon, .goal-icon');
                const title = card.querySelector('.card-title, .milestone-title');
                
                if (icon) {
                    gsap.to(icon, {
                        scale: 1,
                        rotation: 0,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
                
                if (title) {
                    gsap.to(title, {
                        color: '#ffffff',
                        y: 0,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });
        });
    }

    setupButtonInteractions() {
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.animationManager.buttonClickEffect(button, e);
            });

            button.addEventListener('mouseenter', () => {
                const arrow = button.querySelector('.btn-arrow');
                if (arrow) {
                    gsap.to(arrow, {
                        x: 5,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });

            button.addEventListener('mouseleave', () => {
                const arrow = button.querySelector('.btn-arrow');
                if (arrow) {
                    gsap.to(arrow, {
                        x: 0,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });
        });
    }

    setupMilestoneInteractions() {
        const milestoneItems = document.querySelectorAll('.milestone-item');
        
        milestoneItems.forEach((item, index) => {
            ScrollTrigger.create({
                trigger: item,
                start: "top 85%",
                onEnter: () => {
                    gsap.fromTo(item, {
                        opacity: 0,
                        y: 30,
                        scale: 0.95
                    }, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.8,
                        delay: index * 0.1,
                        ease: "back.out(1.7)"
                    });
                }
            });
        });
    }

    setupCTAInteractions() {
        const ctaButtons = document.querySelectorAll('#startApplicationBtn, #learnMoreBtn');
        
        ctaButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 특별한 CTA 클릭 효과
                this.animationManager.createCTAClickEffect(button);
                
                // 실제 액션 시뮬레이션
                setTimeout(() => {
                    if (button.id === 'startApplicationBtn') {
                        this.showApplicationModal();
                    } else {
                        this.showMoreStories();
                    }
                }, 800);
            });
        });
    }

    setupScrollProgress() {
        // 전체 페이지 스크롤 진행률 표시
        ScrollTrigger.create({
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
                const progress = self.progress * 100;
                
                // 네비게이션 프로그레스 바 업데이트
                const navProgress = document.querySelector('.nav-progress .progress-bar::after');
                if (navProgress) {
                    document.documentElement.style.setProperty('--scroll-progress', progress + '%');
                }
            }
        });
    }

    setupAccessibility() {
        // 키보드 네비게이션 지원
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch (e.key) {
                case 'ArrowDown':
                case ' ':
                    e.preventDefault();
                    this.navigateNext();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigatePrevious();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.navigateToSection('hero');
                    break;
                case 'End':
                    e.preventDefault();
                    this.navigateToSection('future');
                    break;
                case 'Escape':
                    if (this.isNavigationOpen) {
                        this.toggleNavigation();
                    }
                    break;
            }
        });

        // 스크린 리더 지원을 위한 ARIA 레이블 동적 업데이트
        this.updateAriaLabels();
    }

    updateAriaLabels() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const sectionId = item.getAttribute('data-section');
            const label = item.querySelector('.nav-label').textContent;
            item.setAttribute('aria-label', `${label} 섹션으로 이동`);
        });
    }

    setupPerformanceOptimizations() {
        // Intersection Observer를 사용한 레이지 로딩
        const lazyElements = document.querySelectorAll('[data-lazy]');
        
        if (lazyElements.length > 0) {
            const lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadLazyElement(entry.target);
                        lazyObserver.unobserve(entry.target);
                    }
                });
            });

            lazyElements.forEach(el => lazyObserver.observe(el));
        }

        // 스크롤 이벤트 쓰로틀링
        this.setupScrollThrottling();
        
        // 리사이즈 이벤트 디바운싱
        this.setupResizeDebouncing();
    }

    loadLazyElement(element) {
        const src = element.getAttribute('data-lazy');
        if (src) {
            element.src = src;
            element.removeAttribute('data-lazy');
        }
    }

    setupScrollThrottling() {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.onScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    onScroll() {
        // 스크롤 기반 애니메이션들 처리
        this.updateScrollBasedAnimations();
    }

    updateScrollBasedAnimations() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // 패럴랙스 효과 업데이트
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            const speed = 0.1 + (index * 0.05);
            const yPos = -(scrollY * speed);
            gsap.set(shape, { y: yPos });
        });
    }

    setupResizeDebouncing() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.onResize();
            }, 250);
        });
    }

    onResize() {
        // ScrollTrigger 새로고침
        ScrollTrigger.refresh();
        
        // 파티클 시스템 리사이즈
        if (this.particleSystem) {
            this.particleSystem.resize();
        }
        
        // 네비게이션 상태 확인
        if (window.innerWidth > 1024 && this.isNavigationOpen) {
            this.toggleNavigation();
        }
    }

    addEventListeners() {
        // 휠 이벤트 (섹션 네비게이션용)
        this.setupWheelNavigation();
        
        // 터치 이벤트 (모바일 지원)
        this.setupTouchNavigation();
        
        // 히어로 섹션 특별 인터랙션
        this.setupHeroInteractions();
    }

    setupWheelNavigation() {
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
                    }, 2000);
                }
            }, 150);
        }, { passive: true });
    }

    setupTouchNavigation() {
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
                }, 2000);
            }
        }, { passive: true });
    }

    setupHeroInteractions() {
        const startJourneyBtn = document.getElementById('startJourneyBtn');
        const watchVideoBtn = document.getElementById('watchVideoBtn');
        
        if (startJourneyBtn) {
            startJourneyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startJourneyAnimation();
            });
        }
        
        if (watchVideoBtn) {
            watchVideoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.playIntroVideo();
            });
        }
    }

    startJourneyAnimation() {
        // 여정 시작 애니메이션
        gsap.timeline()
            .to('.hero-content', {
                scale: 1.05,
                duration: 0.3,
                ease: "power2.out"
            })
            .to('.hero-content', {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            })
            .call(() => {
                this.navigateToSection('origin');
            });
    }

    playIntroVideo() {
        // 인트로 비디오 플레이 모달
        this.showVideoModal();
    }

    navigateNext() {
        const currentIndex = this.sections.indexOf(this.currentSection);
        if (currentIndex < this.sections.length - 1) {
            this.navigateToSection(this.sections[currentIndex + 1]);
        } else {
            // 마지막 섹션에서는 CTA로 이동
            this.navigateToSection('cta');
        }
    }

    navigatePrevious() {
        const currentIndex = this.sections.indexOf(this.currentSection);
        if (currentIndex > 0) {
            this.navigateToSection(this.sections[currentIndex - 1]);
        }
    }

    showOverview() {
        // 전체 타임라인 오버뷰 모달
        this.createOverviewModal();
    }

    createOverviewModal() {
        const modal = document.createElement('div');
        modal.className = 'overview-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>SOPT 타임라인 전체보기</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="timeline-overview">
                        ${this.generateOverviewContent()}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 모달 애니메이션
        gsap.fromTo(modal, {
            opacity: 0,
            scale: 0.8
        }, {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)"
        });
        
        // 모달 닫기 이벤트
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        modal.querySelector('.modal-backdrop').addEventListener('click', () => {
            this.closeModal(modal);
        });
    }

    generateOverviewContent() {
        const periods = [
            { year: '1995-2000', title: '기원', desc: '작은 씨앗에서 시작된 꿈' },
            { year: '2001-2010', title: '성장', desc: '체계적인 시스템 구축' },
            { year: '2011-2018', title: '혁신', desc: '스타트업 생태계의 중심' },
            { year: '2019-2023', title: '확장', desc: '글로벌 네트워크 구축' },
            { year: '2024-∞', title: '미래', desc: 'SOPT의 새로운 장을 함께' }
        ];
        
        return periods.map(period => `
            <div class="overview-item" data-section="${period.title.toLowerCase()}">
                <div class="overview-year">${period.year}</div>
                <div class="overview-title">${period.title}</div>
                <div class="overview-desc">${period.desc}</div>
            </div>
        `).join('');
    }

    closeModal(modal) {
        gsap.to(modal, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                modal.remove();
            }
        });
    }

    showApplicationModal() {
        console.log('Application modal would open here');
        // 실제 지원 페이지로 이동하거나 모달 표시
    }

    showMoreStories() {
        console.log('More stories section would open here');
        // 추가 스토리 섹션으로 이동
    }

    showVideoModal() {
        console.log('Video modal would open here');
        // 비디오 플레이어 모달 표시
    }

    destroy() {
        // 이벤트 리스너 제거
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        // ScrollTrigger 인스턴스 제거
        ScrollTrigger.killAll();
        
        // 파티클 시스템 정리
        if (this.particleSystem) {
            this.particleSystem.destroy();
        }
        
        // 애니메이션 매니저 정리
        if (this.animationManager) {
            this.animationManager.destroy();
        }
    }
}

// 애니메이션 매니저 클래스
class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.scrollTriggers = [];
    }

    createParallaxEffect(selector, speed = 0.5) {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach((element, index) => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: element.closest('section') || element,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
            
            tl.to(element, {
                y: (i, target) => -ScrollTrigger.maxScroll(window) * speed * (index + 1) * 0.1,
                ease: "none"
            });
            
            this.scrollTriggers.push(tl.scrollTrigger);
        });
    }

    createSectionAnimation(section, index) {
        const content = section.querySelector('.section-content');
        const milestones = section.querySelectorAll('.milestone-item');
        const storyCard = section.querySelector('.story-card');
        
        // 메인 콘텐츠 애니메이션
        if (content) {
            gsap.fromTo(content, {
                opacity: 0,
                y: 100
            }, {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 70%",
                    end: "bottom 30%",
                    toggleActions: "play none none reverse"
                }
            });
        }

        // 마일스톤 스태거 애니메이션
        if (milestones.length > 0) {
            gsap.fromTo(milestones, {
                opacity: 0,
                x: index % 2 === 0 ? -50 : 50,
                scale: 0.9
            }, {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: section,
                    start: "top 60%",
                    toggleActions: "play none none reverse"
                }
            });
        }

        // 스토리 카드 애니메이션
        if (storyCard) {
            gsap.fromTo(storyCard, {
                opacity: 0,
                scale: 0.8,
                rotationY: index % 2 === 0 ? -15 : 15
            }, {
                opacity: 1,
                scale: 1,
                rotationY: 0,
                duration: 1,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: storyCard,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            });
        }
    }

    setupTextReveal() {
        const textElements = document.querySelectorAll('.text-reveal');
        
        textElements.forEach(element => {
            gsap.fromTo(element, {
                opacity: 0
            }, {
                opacity: 1,
                duration: 0.1,
                scrollTrigger: {
                    trigger: element,
                    start: "top 80%",
                    onEnter: () => {
                        element.style.animation = 'textRevealAnimation 1.5s ease-in-out forwards';
                    }
                }
            });
        });
    }

    animateCounter(element, finalValue) {
        gsap.fromTo(element, {
            textContent: 0
        }, {
            textContent: finalValue,
            duration: 2,
            ease: "power2.out",
            snap: { textContent: 1 },
            onUpdate: function() {
                const current = Math.ceil(this.targets()[0].textContent);
                element.textContent = current.toLocaleString();
            }
        });
    }

    enhancedHoverEnter(element) {
        gsap.to(element, {
            y: -8,
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(195, 232, 141, 0.2)",
            duration: 0.4,
            ease: "power2.out"
        });
    }

    enhancedHoverLeave(element) {
        gsap.to(element, {
            y: 0,
            scale: 1,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            duration: 0.4,
            ease: "power2.out"
        });
    }

    buttonClickEffect(button, event) {
        // 클릭 포지션 기반 리플 효과
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${x}px;
            top: ${y}px;
            width: 20px;
            height: 20px;
            margin-left: -10px;
            margin-top: -10px;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
        
        // 버튼 스케일 효과
        gsap.to(button, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut"
        });
    }

    createCTAClickEffect(button) {
        // 특별한 CTA 버튼 효과
        const tl = gsap.timeline();
        
        tl.to(button, {
            scale: 1.1,
            duration: 0.2,
            ease: "power2.out"
        })
        .to(button, {
            scale: 1,
            duration: 0.3,
            ease: "elastic.out(1, 0.3)"
        })
        .fromTo(button, {
            boxShadow: "0 0 0 0 rgba(195, 232, 141, 0.7)"
        }, {
            boxShadow: "0 0 0 30px rgba(195, 232, 141, 0)",
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.3");
    }

    triggerSectionEntryAnimation(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        // 섹션별 특별 효과
        switch (sectionId) {
            case 'origin':
                this.createGrowthParticles(section);
                break;
            case 'innovation':
                this.createSparkleEffect(section);
                break;
            case 'future':
                this.createFutureGlow(section);
                break;
        }
    }

    createGrowthParticles(section) {
        const particles = [];
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'growth-particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: #C3E88D;
                border-radius: 50%;
                pointer-events: none;
                z-index: 100;
            `;
            
            section.appendChild(particle);
            particles.push(particle);
            
            gsap.fromTo(particle, {
                x: Math.random() * section.offsetWidth,
                y: section.offsetHeight,
                opacity: 0
            }, {
                x: `+=${Math.random() * 200 - 100}`,
                y: -100,
                opacity: 1,
                duration: 2 + Math.random() * 2,
                ease: "power2.out",
                onComplete: () => {
                    particle.remove();
                }
            });
        }
    }

    createSparkleEffect(section) {
        const sparkles = [];
        for (let i = 0; i < 15; i++) {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = '✨';
            sparkle.style.cssText = `
                position: absolute;
                font-size: 12px;
                pointer-events: none;
                z-index: 100;
            `;
            
            section.appendChild(sparkle);
            sparkles.push(sparkle);
            
            gsap.fromTo(sparkle, {
                x: Math.random() * section.offsetWidth,
                y: Math.random() * section.offsetHeight,
                opacity: 0,
                scale: 0
            }, {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: "back.out(1.7)",
                delay: Math.random() * 1,
                onComplete: () => {
                    gsap.to(sparkle, {
                        opacity: 0,
                        duration: 1,
                        delay: 1,
                        onComplete: () => sparkle.remove()
                    });
                }
            });
        }
    }

    createFutureGlow(section) {
        const glowOverlay = document.createElement('div');
        glowOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, rgba(195, 232, 141, 0.1) 0%, transparent 70%);
            pointer-events: none;
            z-index: 10;
        `;
        
        section.appendChild(glowOverlay);
        
        gsap.fromTo(glowOverlay, {
            opacity: 0
        }, {
            opacity: 1,
            duration: 2,
            ease: "power2.inOut",
            onComplete: () => {
                gsap.to(glowOverlay, {
                    opacity: 0,
                    duration: 3,
                    delay: 2,
                    onComplete: () => glowOverlay.remove()
                });
            }
        });
    }

    destroy() {
        this.scrollTriggers.forEach(st => st.kill());
        this.animations.clear();
    }
}

// 파티클 시스템 클래스
class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.animationId = null;
    }

    init() {
        this.createParticles();
        this.animate();
    }

    createParticles() {
        const particleCount = window.innerWidth > 768 ? 50 : 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(195, 232, 141, 0.5);
                border-radius: 50%;
                pointer-events: none;
            `;
            
            this.container.appendChild(particle);
            
            this.particles.push({
                element: particle,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: Math.random() * 100
            });
        }
    }

    animate() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life += 1;
            
            // 화면 경계 처리
            if (particle.x < 0 || particle.x > window.innerWidth) {
                particle.vx *= -1;
            }
            if (particle.y < 0 || particle.y > window.innerHeight) {
                particle.vy *= -1;
            }
            
            // 투명도 조절
            const opacity = Math.sin(particle.life * 0.01) * 0.5 + 0.3;
            
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
            particle.element.style.opacity = opacity;
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    resize() {
        this.particles.forEach(particle => {
            if (particle.x > window.innerWidth) particle.x = window.innerWidth;
            if (particle.y > window.innerHeight) particle.y = window.innerHeight;
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.particles.forEach(particle => {
            particle.element.remove();
        });
        
        this.particles = [];
    }
}

// CSS 애니메이션 추가
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .overview-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
    }
    
    .modal-content {
        position: relative;
        background: #05060A;
        border: 1px solid rgba(195, 232, 141, 0.3);
        border-radius: 20px;
        padding: 2rem;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
        margin: 2rem;
    }
    
    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(195, 232, 141, 0.2);
    }
    
    .modal-header h3 {
        color: #C3E88D;
        font-size: 1.5rem;
        font-weight: 700;
    }
    
    .modal-close {
        background: none;
        border: none;
        color: #ffffff;
        font-size: 2rem;
        cursor: pointer;
        transition: color 0.3s ease;
    }
    
    .modal-close:hover {
        color: #C3E88D;
    }
    
    .timeline-overview {
        display: grid;
        gap: 1rem;
    }
    
    .overview-item {
        display: flex;
        align-items: center;
        gap: 2rem;
        padding: 1.5rem;
        background: rgba(195, 232, 141, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(195, 232, 141, 0.1);
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .overview-item:hover {
        background: rgba(195, 232, 141, 0.1);
        transform: translateX(10px);
    }
    
    .overview-year {
        font-weight: 800;
        color: #C3E88D;
        font-size: 1.1rem;
        min-width: 100px;
    }
    
    .overview-title {
        font-weight: 700;
        color: #ffffff;
        font-size: 1.2rem;
    }
    
    .overview-desc {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
    }
`;

document.head.appendChild(additionalStyles);

// 페이지 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    const timelineController = new EnhancedTimelineController();
    
    // 전역에서 접근 가능하도록 설정 (디버깅용)
    window.timelineController = timelineController;
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    if (window.timelineController) {
        window.timelineController.destroy();
    }
});