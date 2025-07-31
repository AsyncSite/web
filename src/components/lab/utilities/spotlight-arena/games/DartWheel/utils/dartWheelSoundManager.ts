export type DartWheelSoundType = 
  | 'spin_start'
  | 'spin_loop'
  | 'tick'
  | 'spin_end'
  | 'result_low'
  | 'result_medium'
  | 'result_high'
  | 'result_bonus'
  | 'countdown'
  | 'bgm';

interface DartWheelSound {
  audio: HTMLAudioElement;
  volume: number;
  loop: boolean;
}

class DartWheelSoundManager {
  private dartWheelSounds: Map<DartWheelSoundType, DartWheelSound> = new Map();
  private dartWheelMasterVolume: number = 0.7;
  private dartWheelIsMuted: boolean = false;
  private dartWheelSoundEnabled: boolean = true;
  
  constructor() {
    this.initializeDartWheelSounds();
  }

  private initializeDartWheelSounds(): void {
    // 사운드 URL 정의 (실제 구현 시 실제 파일 경로로 변경)
    const soundUrls: Record<DartWheelSoundType, { url: string; volume: number; loop: boolean }> = {
      spin_start: { url: '/sounds/dartwheel/spin-start.mp3', volume: 0.8, loop: false },
      spin_loop: { url: '/sounds/dartwheel/spin-loop.mp3', volume: 0.5, loop: true },
      tick: { url: '/sounds/dartwheel/tick.mp3', volume: 0.3, loop: false },
      spin_end: { url: '/sounds/dartwheel/spin-end.mp3', volume: 0.7, loop: false },
      result_low: { url: '/sounds/dartwheel/result-low.mp3', volume: 0.6, loop: false },
      result_medium: { url: '/sounds/dartwheel/result-medium.mp3', volume: 0.7, loop: false },
      result_high: { url: '/sounds/dartwheel/result-high.mp3', volume: 0.8, loop: false },
      result_bonus: { url: '/sounds/dartwheel/result-bonus.mp3', volume: 1.0, loop: false },
      countdown: { url: '/sounds/dartwheel/countdown.mp3', volume: 0.5, loop: false },
      bgm: { url: '/sounds/dartwheel/bgm.mp3', volume: 0.3, loop: true },
    };

    // Web Audio API를 사용한 더미 사운드 생성 (실제 파일이 없을 때)
    Object.entries(soundUrls).forEach(([type, config]) => {
      const audio = new Audio();
      
      // 오류 처리
      audio.addEventListener('error', () => {
        console.warn(`DartWheel sound not found: ${type}`);
        // 더미 사운드 생성
        this.createDartWheelDummySound(type as DartWheelSoundType, config);
      });

      audio.src = config.url;
      audio.volume = config.volume * this.dartWheelMasterVolume;
      audio.loop = config.loop;
      audio.preload = 'auto';

      this.dartWheelSounds.set(type as DartWheelSoundType, {
        audio,
        volume: config.volume,
        loop: config.loop,
      });
    });
  }

  private createDartWheelDummySound(
    type: DartWheelSoundType, 
    config: { volume: number; loop: boolean }
  ): void {
    // Web Audio API를 사용한 간단한 사운드 생성
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // 사운드 타입별 주파수 설정
    const frequencies: Record<DartWheelSoundType, number> = {
      spin_start: 200,
      spin_loop: 150,
      tick: 800,
      spin_end: 100,
      result_low: 300,
      result_medium: 500,
      result_high: 700,
      result_bonus: 1000,
      countdown: 600,
      bgm: 440,
    };

    oscillator.frequency.value = frequencies[type];
    oscillator.type = 'sine';
    
    gainNode.gain.value = 0;
    gainNode.gain.linearRampToValueAtTime(
      config.volume * this.dartWheelMasterVolume * 0.1, 
      audioContext.currentTime + 0.01
    );
    gainNode.gain.linearRampToValueAtTime(
      0, 
      audioContext.currentTime + 0.2
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 더미 Audio 객체 생성
    const dummyAudio = new Audio();
    dummyAudio.volume = config.volume * this.dartWheelMasterVolume;
    dummyAudio.loop = config.loop;
    
    // play 메서드 오버라이드
    dummyAudio.play = () => {
      if (this.dartWheelSoundEnabled && !this.dartWheelIsMuted) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.frequency.value = frequencies[type];
        osc.type = 'sine';
        gain.gain.value = config.volume * this.dartWheelMasterVolume * 0.1;
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start();
        osc.stop(audioContext.currentTime + 0.2);
      }
      return Promise.resolve();
    };

    this.dartWheelSounds.set(type, {
      audio: dummyAudio,
      volume: config.volume,
      loop: config.loop,
    });
  }

  // 사운드 재생
  public playDartWheelSound(type: DartWheelSoundType): void {
    if (!this.dartWheelSoundEnabled || this.dartWheelIsMuted) return;

    const sound = this.dartWheelSounds.get(type);
    if (!sound) return;

    // 틱 사운드는 중복 재생 가능
    if (type === 'tick') {
      const clonedAudio = sound.audio.cloneNode() as HTMLAudioElement;
      clonedAudio.volume = sound.volume * this.dartWheelMasterVolume;
      clonedAudio.play().catch(() => {});
      return;
    }

    // 다른 사운드는 재시작
    sound.audio.currentTime = 0;
    sound.audio.play().catch(() => {});
  }

  // 사운드 정지
  public stopDartWheelSound(type: DartWheelSoundType): void {
    const sound = this.dartWheelSounds.get(type);
    if (!sound) return;

    sound.audio.pause();
    sound.audio.currentTime = 0;
  }

  // 모든 사운드 정지
  public stopAllDartWheelSounds(): void {
    this.dartWheelSounds.forEach((sound) => {
      sound.audio.pause();
      sound.audio.currentTime = 0;
    });
  }

  // 볼륨 설정
  public setDartWheelMasterVolume(volume: number): void {
    this.dartWheelMasterVolume = Math.max(0, Math.min(1, volume));
    this.updateDartWheelVolumes();
  }

  // 음소거 토글
  public toggleDartWheelMute(): void {
    this.dartWheelIsMuted = !this.dartWheelIsMuted;
    if (this.dartWheelIsMuted) {
      this.stopAllDartWheelSounds();
    }
  }

  // 사운드 활성화/비활성화
  public setDartWheelSoundEnabled(enabled: boolean): void {
    this.dartWheelSoundEnabled = enabled;
    if (!enabled) {
      this.stopAllDartWheelSounds();
    }
  }

  // 볼륨 업데이트
  private updateDartWheelVolumes(): void {
    this.dartWheelSounds.forEach((sound) => {
      sound.audio.volume = sound.volume * this.dartWheelMasterVolume;
    });
  }

  // 현재 설정 가져오기
  public getDartWheelSoundSettings() {
    return {
      masterVolume: this.dartWheelMasterVolume,
      isMuted: this.dartWheelIsMuted,
      isEnabled: this.dartWheelSoundEnabled,
    };
  }

  // 정리
  public cleanup(): void {
    this.stopAllDartWheelSounds();
    this.dartWheelSounds.clear();
  }
}

// 싱글톤 인스턴스
export const dartWheelSoundManager = new DartWheelSoundManager();