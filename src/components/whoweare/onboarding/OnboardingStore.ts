class OnboardingStore {
  private lastInteractionTime: number = Date.now();
  private interactionCount: number = 0;
  private viewedStories: Set<string> = new Set();
  private viewedMembers: Set<string> = new Set();
  private currentStep: number = 0;
  private isOnboardingActive: boolean = true;
  
  checkInactivity(): string | null {
    const now = Date.now();
    const timeSinceLastInteraction = now - this.lastInteractionTime;
    
    if (timeSinceLastInteraction > 15000 && this.interactionCount === 0) {
      // 15초 동안 인터랙션 없음 - 가장 가까운 요소 하이라이트
      return 'highlight-nearest';
    }
    
    if (this.viewedStories.size >= 3 && this.viewedMembers.size === 0) {
      // 스토리 3개 이상 봤는데 멤버는 안 봄
      return 'suggest-members';
    }
    
    if (this.viewedStories.size >= 5 && this.viewedMembers.size >= 3) {
      // 충분히 탐색함 - CTA 표시
      return 'show-cta';
    }
    
    return null;
  }
  
  recordInteraction(type: 'story' | 'member' | 'drag' | 'zoom', id?: string) {
    this.lastInteractionTime = Date.now();
    this.interactionCount++;
    
    if (type === 'story' && id) {
      this.viewedStories.add(id);
      // 첫 스토리 클릭 시 다음 단계로
      if (this.viewedStories.size === 1 && this.currentStep === 1) {
        this.currentStep = 2;
      }
    } else if (type === 'member' && id) {
      this.viewedMembers.add(id);
    } else if (type === 'drag' && this.currentStep === 0) {
      // 첫 드래그 시 다음 단계로
      this.currentStep = 1;
    }
  }
  
  getCurrentStep(): number {
    return this.currentStep;
  }
  
  setCurrentStep(step: number) {
    this.currentStep = step;
  }
  
  isActive(): boolean {
    return this.isOnboardingActive;
  }
  
  complete() {
    this.isOnboardingActive = false;
    localStorage.setItem('whoweare-hybrid-onboarding', 'true');
  }
  
  skip() {
    this.isOnboardingActive = false;
    localStorage.setItem('whoweare-hybrid-onboarding', 'true');
  }
  
  reset() {
    this.lastInteractionTime = Date.now();
    this.interactionCount = 0;
    this.viewedStories.clear();
    this.viewedMembers.clear();
    this.currentStep = 0;
    this.isOnboardingActive = true;
    localStorage.removeItem('whoweare-hybrid-onboarding');
  }
  
  getStats() {
    return {
      interactionCount: this.interactionCount,
      viewedStories: this.viewedStories.size,
      viewedMembers: this.viewedMembers.size,
      currentStep: this.currentStep,
      isActive: this.isOnboardingActive
    };
  }
}

export const hybridOnboardingStore = new OnboardingStore();