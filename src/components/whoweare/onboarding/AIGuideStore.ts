import * as THREE from 'three';

interface DialogueStep {
  id: string;
  text: string;
  action?: 'move' | 'point' | 'highlight';
  target?: THREE.Vector3 | string;
  choices?: {
    text: string;
    next: string;
  }[];
  duration?: number;
}

class AIGuideStore {
  private currentDialogueId: string = 'greeting';
  private dialogueHistory: string[] = ['greeting'];
  private interactionHistory: { type: string; id: string; timestamp: number }[] = [];
  private dialogueScript: Map<string, DialogueStep> = new Map();
  
  constructor() {
    this.initializeDialogues();
  }
  
  private initializeDialogues() {
    const dialogues: DialogueStep[] = [
      {
        id: 'greeting',
        text: '안녕하세요! 저는 Async예요. AsyncSite 우주 정거장에 오신 걸 환영해요! 🚀',
        duration: 3000,
        choices: [
          { text: '안녕하세요!', next: 'introduction' },
          { text: '혼자 둘러볼게요', next: 'explore_alone' }
        ]
      },
      {
        id: 'introduction',
        text: '이곳은 우리 팀의 이야기와 철학이 담긴 특별한 공간이에요. 제가 안내해드릴게요!',
        duration: 3000,
        choices: [
          { text: '좋아요, 안내해주세요!', next: 'tour_start' },
          { text: '나중에 할게요', next: 'explore_alone' }
        ]
      },
      {
        id: 'tour_start',
        text: '먼저 저 빛나는 카드들을 보세요. 우리의 철학이 담겨있어요.',
        action: 'point',
        target: 'nearest_story',
        duration: 3000,
        choices: [
          { text: '카드를 볼게요', next: 'story_guide' },
          { text: '팀원들을 먼저 보고 싶어요', next: 'team_introduction' }
        ]
      },
      {
        id: 'story_guide',
        text: '카드를 클릭하면 자세한 이야기를 볼 수 있어요. 한번 시도해보세요!',
        action: 'highlight',
        target: 'story_panel_1',
        duration: 3000,
        choices: [
          { text: '클릭해볼게요', next: 'wait_for_story' },
          { text: '팀원들을 먼저 볼래요', next: 'team_introduction' }
        ]
      },
      {
        id: 'after_story_click',
        text: '잘하셨어요! 이런 식으로 모든 이야기를 탐험할 수 있어요.',
        duration: 2000,
        choices: [
          { text: '다른 카드도 볼게요', next: 'continue_stories' },
          { text: '팀원들을 만나고 싶어요', next: 'team_introduction' }
        ]
      },
      {
        id: 'team_introduction',
        text: '이제 우리 팀원들을 만나볼 차례예요. 각자의 궤도를 돌고 있죠.',
        action: 'highlight',
        target: 'all_members',
        duration: 3000,
        choices: [
          { text: '팀원들을 자세히 볼게요', next: 'member_guide' },
          { text: '멋지네요!', next: 'navigation_tip' }
        ]
      },
      {
        id: 'member_guide',
        text: '팀원을 클릭하면 더 자세히 알아볼 수 있어요. 누구부터 만나보실래요?',
        action: 'point',
        target: 'member_rene',
        duration: 3000,
        choices: [
          { text: '클릭해볼게요', next: 'wait_for_member' },
          { text: '다른 것도 둘러볼래요', next: 'navigation_tip' }
        ]
      },
      {
        id: 'after_member_click',
        text: '멋지네요! 각 팀원들은 고유한 색깔과 이야기를 가지고 있어요.',
        duration: 2000,
        choices: [
          { text: '다른 팀원도 만나볼게요', next: 'continue_members' },
          { text: '충분히 봤어요', next: 'tour_end' }
        ]
      },
      {
        id: 'navigation_tip',
        text: '잠깐! 마우스를 드래그하면 공간을 회전시킬 수 있어요. 시도해보세요!',
        duration: 3000,
        choices: [
          { text: '알겠어요!', next: 'free_explore' },
          { text: '투어 마치기', next: 'tour_end' }
        ]
      },
      {
        id: 'tour_end',
        text: '탐험을 즐기셨나요? 언제든 궁금한 것이 있으면 저를 불러주세요! ✨',
        duration: 3000,
        choices: [
          { text: '고마워요!', next: 'complete' },
          { text: '다시 안내해주세요', next: 'tour_start' }
        ]
      },
      {
        id: 'explore_alone',
        text: '알겠어요! 혼자 둘러보시다가 도움이 필요하면 언제든 저를 불러주세요. 즐거운 탐험 되세요! 🌟',
        duration: 3000
      },
      {
        id: 'continue_stories',
        text: '다른 카드들도 각각 특별한 의미가 있어요. 모두 둘러보세요!',
        duration: 2000,
        choices: [
          { text: '계속 둘러볼게요', next: 'free_explore' },
          { text: '팀원들을 만나볼게요', next: 'team_introduction' }
        ]
      },
      {
        id: 'continue_members',
        text: '좋아요! 다른 팀원들도 만나보세요. 모두 특별한 재능을 가지고 있어요.',
        duration: 2000,
        choices: [
          { text: '계속 둘러볼게요', next: 'free_explore' },
          { text: '스토리 카드도 볼게요', next: 'tour_start' }
        ]
      },
      {
        id: 'complete',
        text: '즐거운 여행이 되셨길 바라요! AsyncSite 우주에서 뵙게 되어 반가웠어요! 🚀✨',
        duration: 3000
      },
      {
        id: 'wait_for_story',
        text: '천천히 살펴보세요. 클릭하면 자세한 내용을 볼 수 있어요!',
        duration: 3000,
        choices: [
          { text: '다 봤어요', next: 'after_story_click' },
          { text: '팀원들을 볼래요', next: 'team_introduction' }
        ]
      },
      {
        id: 'wait_for_member',
        text: '팀원을 클릭해서 만나보세요! 각자의 이야기가 기다리고 있어요.',
        duration: 3000,
        choices: [
          { text: '다 봤어요', next: 'after_member_click' },
          { text: '스토리를 볼래요', next: 'tour_start' }
        ]
      },
      {
        id: 'free_explore',
        text: '자유롭게 탐험해보세요! 궁금한 것이 있으면 언제든 클릭해보세요.',
        duration: 3000,
        choices: [
          { text: '계속 둘러볼게요', next: 'complete' },
          { text: '다시 안내받고 싶어요', next: 'tour_start' }
        ]
      }
    ];
    
    dialogues.forEach(dialogue => {
      this.dialogueScript.set(dialogue.id, dialogue);
    });
  }
  
  getDialogueForAction(action: string): string {
    switch (action) {
      case 'intro':
        return this.dialogueScript.get('greeting')?.text || '';
      case 'story':
        const storyClicks = this.interactionHistory.filter(h => h.type === 'story').length;
        // First story click
        if (storyClicks === 1) {
          this.currentDialogueId = 'after_story_click';
          return this.dialogueScript.get('after_story_click')?.text || '';
        }
        // Repeated story clicks - provide helpful guidance
        else if (storyClicks > 1) {
          const messages = [
            '다른 카드들도 둘러보셨나요? 각각 특별한 의미가 있어요.',
            '이 카드를 다시 보시는군요! 다른 카드들도 확인해보세요.',
            '좋아요! 천천히 모든 이야기를 살펴보세요.',
            '카드를 자세히 보고 계시네요. 팀원들도 만나보실래요?'
          ];
          return messages[Math.min(storyClicks - 2, messages.length - 1)];
        }
        return '';
      case 'member':
        const memberClicks = this.interactionHistory.filter(h => h.type === 'member').length;
        // First member click
        if (memberClicks === 1) {
          this.currentDialogueId = 'after_member_click';
          return this.dialogueScript.get('after_member_click')?.text || '';
        }
        // Repeated member clicks - provide helpful guidance
        else if (memberClicks > 1) {
          const messages = [
            '다른 팀원들도 만나보셨나요? 모두 특별한 재능이 있어요.',
            '이 팀원을 다시 보시는군요! 다른 팀원들도 확인해보세요.',
            '좋아요! 각 팀원의 이야기를 천천히 살펴보세요.',
            '팀원들을 자세히 보고 계시네요. 스토리 카드도 보실래요?'
          ];
          return messages[Math.min(memberClicks - 2, messages.length - 1)];
        }
        return '';
      default:
        return '';
    }
  }
  
  processUserResponse(choiceText: string): string {
    const currentDialogue = this.dialogueScript.get(this.currentDialogueId);
    if (!currentDialogue || !currentDialogue.choices) return '';
    
    const choice = currentDialogue.choices.find(c => c.text === choiceText);
    if (choice) {
      this.currentDialogueId = choice.next;
      this.dialogueHistory.push(choice.next);
      const nextDialogue = this.dialogueScript.get(choice.next);
      return nextDialogue?.text || '';
    }
    
    return '';
  }
  
  getCurrentDialogue(): DialogueStep | undefined {
    return this.dialogueScript.get(this.currentDialogueId);
  }
  
  getChoices(): { text: string; next: string }[] | undefined {
    return this.dialogueScript.get(this.currentDialogueId)?.choices;
  }
  
  getCurrentAction(): { action?: string; target?: any } {
    const dialogue = this.dialogueScript.get(this.currentDialogueId);
    return {
      action: dialogue?.action,
      target: dialogue?.target
    };
  }
  
  recordInteraction(type: string, id: string) {
    this.interactionHistory.push({
      type,
      id,
      timestamp: Date.now()
    });
  }
  
  skip() {
    this.currentDialogueId = 'explore_alone';
    localStorage.setItem('whoweare-ai-guide-seen', 'true');
  }
  
  complete() {
    this.currentDialogueId = 'complete';
    localStorage.setItem('whoweare-ai-guide-seen', 'true');
  }
  
  reset() {
    this.currentDialogueId = 'greeting';
    this.dialogueHistory = ['greeting'];
    this.interactionHistory = [];
    localStorage.removeItem('whoweare-ai-guide-seen');
  }
  
  isEndDialogue(): boolean {
    return this.currentDialogueId === 'explore_alone' || 
           this.currentDialogueId === 'complete';
  }
  
  canGoBack(): boolean {
    return this.dialogueHistory.length > 1;
  }
  
  goBack(): string {
    if (this.dialogueHistory.length > 1) {
      // 현재 대화 제거
      this.dialogueHistory.pop();
      // 이전 대화로 이동
      const previousId = this.dialogueHistory[this.dialogueHistory.length - 1];
      this.currentDialogueId = previousId;
      const dialogue = this.dialogueScript.get(previousId);
      return dialogue?.text || '';
    }
    return '';
  }
}

export const aiGuideStore = new AIGuideStore();