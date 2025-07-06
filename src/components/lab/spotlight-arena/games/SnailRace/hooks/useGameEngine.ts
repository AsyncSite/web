import { useState, useRef, useCallback, useEffect } from 'react';
import { Snail, SnailRaceEvent, Participant } from '../../../shared/types';
import { randomFloat, randomElement, randomChance } from '../../../shared/utils/randomUtils';

interface UseGameEngineProps {
  initialSnails: Snail[];
  trackLength: number;
  winnerCount: number;
  events: SnailRaceEvent[];
  onRaceComplete: (winners: Participant[]) => void;
  onEventTrigger: (snailId: string, eventName: string) => void;
}

const useGameEngine = ({
  initialSnails,
  trackLength,
  winnerCount,
  events,
  onRaceComplete,
  onEventTrigger
}: UseGameEngineProps) => {
  const [snails, setSnails] = useState<Snail[]>(initialSnails);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const lastEventTimeRef = useRef<number>(0);
  const winnersRef = useRef<Participant[]>([]);
  const isRunningRef = useRef(false);

  // 게임 루프
  const gameLoop = useCallback((timestamp: number) => {
    if (!isRunningRef.current) return;

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // 달팽이 위치 업데이트
    setSnails(prevSnails => {
      const updatedSnails = prevSnails.map(snail => {
        // 이미 완주한 달팽이는 건너뛰기
        if (snail.position >= trackLength) {
          return snail;
        }

        let speed = snail.baseSpeed;

        // 이벤트 효과 적용
        if (snail.activeEvent) {
          const eventElapsed = timestamp - snail.activeEvent.startTime;
          if (eventElapsed < snail.activeEvent.event.duration) {
            speed *= snail.activeEvent.event.speedModifier;
          } else {
            // 이벤트 종료
            snail = { ...snail, activeEvent: undefined };
          }
        }

        // 랜덤 속도 변화 (자연스러움)
        speed += randomFloat(-0.2, 0.2);
        speed = Math.max(0.1, speed); // 최소 속도 보장

        // 위치 업데이트 (deltaTime을 1000으로 나누어 초 단위로 변환)
        let newPosition = snail.position + speed * (deltaTime / 1000) * 10; // 속도 배율 적용
        
        // 즉시 효과 이벤트 처리 (바람, 점프 등)
        if (snail.activeEvent && snail.activeEvent.event.duration === 0) {
          newPosition += snail.activeEvent.event.speedModifier;
          snail = { ...snail, activeEvent: undefined };
        }

        newPosition = Math.max(0, Math.min(trackLength, newPosition));

        // 완주 체크
        if (newPosition >= trackLength && snail.position < trackLength) {
          if (winnersRef.current.length < winnerCount) {
            winnersRef.current.push(snail.participant);
          }
        }

        return { ...snail, position: newPosition };
      });

      // 승자가 정해졌는지 확인
      if (winnersRef.current.length >= winnerCount) {
        isRunningRef.current = false;
        onRaceComplete(winnersRef.current);
      }

      return updatedSnails;
    });

    // 랜덤 이벤트 발생 (2-4초마다)
    if (timestamp - lastEventTimeRef.current > randomFloat(2000, 4000)) {
      lastEventTimeRef.current = timestamp;
      
      // 아직 완주하지 않은 달팽이 중 선택
      const activeSnails = snails.filter(s => s.position < trackLength && !s.activeEvent);
      
      if (activeSnails.length > 0) {
        const targetSnail = randomElement(activeSnails);
        if (targetSnail && randomChance(0.7)) { // 70% 확률로 이벤트 발생
          const event = randomElement(events);
          if (event) {
            setSnails(prevSnails => 
              prevSnails.map(s => 
                s.id === targetSnail.id 
                  ? { 
                      ...s, 
                      activeEvent: { 
                        event, 
                        startTime: timestamp 
                      } 
                    }
                  : s
              )
            );
            onEventTrigger(targetSnail.id, event.name);
          }
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [trackLength, winnerCount, events, onRaceComplete, onEventTrigger, snails]);

  const startRace = useCallback(() => {
    isRunningRef.current = true;
    winnersRef.current = [];
    lastTimeRef.current = performance.now();
    lastEventTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  const stopRace = useCallback(() => {
    isRunningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // 클린업
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // 초기 달팽이 설정
  useEffect(() => {
    // baseSpeed가 설정된 초기값 사용
    setSnails(initialSnails.map(snail => ({
      ...snail,
      baseSpeed: snail.baseSpeed || (2 + Math.random() * 3)
    })));
  }, [initialSnails]);

  return {
    snails,
    startRace,
    stopRace
  };
};

export default useGameEngine;