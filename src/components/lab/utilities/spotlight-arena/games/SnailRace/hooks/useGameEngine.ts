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
  onEventTrigger,
}: UseGameEngineProps) => {
  const [snails, setSnails] = useState<Snail[]>(initialSnails);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const lastEventTimeRef = useRef<number>(0);
  const winnersRef = useRef<Participant[]>([]);
  const isRunningRef = useRef(false);

  // 게임 루프
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (!isRunningRef.current) return;

      const deltaTime = timestamp - lastTimeRef.current;

      // 첫 프레임이거나 deltaTime이 너무 큰 경우 처리
      if (lastTimeRef.current === 0 || deltaTime > 1000) {
        lastTimeRef.current = timestamp;
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      lastTimeRef.current = timestamp;

      // 랜덤 이벤트 발생 체크
      let shouldTriggerEvent = false;
      let pendingEventSnailId: string | null = null;
      let pendingEventName: string | null = null;

      if (timestamp - lastEventTimeRef.current > randomFloat(2000, 4000)) {
        lastEventTimeRef.current = timestamp;
        shouldTriggerEvent = true;
      }

      setSnails((prevSnails) => {
        let updatedSnails = prevSnails.map((snail) => {
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
          speed += randomFloat(-0.1, 0.1);
          speed = Math.max(0.05, speed); // 최소 속도 보장

          // 위치 업데이트 (deltaTime을 1000으로 나누어 초 단위로 변환)
          // 속도를 더욱 느리게 조정 (달팽이처럼!)
          const movement = speed * (deltaTime / 1000) * 1.2;
          let newPosition = snail.position + movement;

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

        // 랜덤 이벤트 처리
        if (shouldTriggerEvent) {
          // 아직 완주하지 않은 달팽이 중 선택
          const activeSnails = updatedSnails.filter(
            (s) => s.position < trackLength && !s.activeEvent,
          );

          if (activeSnails.length > 0 && randomChance(0.7)) {
            // 70% 확률로 이벤트 발생
            const targetSnail = randomElement(activeSnails);
            const event = randomElement(events);

            if (targetSnail && event) {
              pendingEventSnailId = targetSnail.id;
              pendingEventName = event.name;

              updatedSnails = updatedSnails.map((s) =>
                s.id === targetSnail.id
                  ? {
                      ...s,
                      activeEvent: {
                        event,
                        startTime: timestamp,
                      },
                    }
                  : s,
              );
            }
          }
        }

        // 승자가 정해졌는지 확인
        if (winnersRef.current.length >= winnerCount) {
          isRunningRef.current = false;
          onRaceComplete(winnersRef.current);
        }

        return updatedSnails;
      });

      // 이벤트 트리거는 setState 밖에서 처리
      if (pendingEventSnailId && pendingEventName) {
        onEventTrigger(pendingEventSnailId, pendingEventName);
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    },
    [trackLength, winnerCount, events, onRaceComplete, onEventTrigger],
  );

  const startRace = useCallback(() => {
    isRunningRef.current = true;
    winnersRef.current = [];
    lastTimeRef.current = 0; // 0으로 초기화하여 첫 프레임 감지
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
    setSnails(
      initialSnails.map((snail) => ({
        ...snail,
        baseSpeed: snail.baseSpeed || 0.5 + Math.random() * 0.7, // 더 느린 기본 속도
      })),
    );
  }, [initialSnails]);

  return {
    snails,
    startRace,
    stopRace,
  };
};

export default useGameEngine;
