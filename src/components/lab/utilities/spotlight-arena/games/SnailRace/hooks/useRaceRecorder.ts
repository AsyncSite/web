import { useRef, useCallback, useState, useEffect } from 'react';

interface UseRaceRecorderProps {
  canvasRef: React.RefObject<HTMLCanvasElement | any>; // any 타입 추가하여 Konva Stage도 받을 수 있도록
  fileName?: string;
}

interface UseRaceRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  startRecording: () => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  downloadRecording: () => void;
  isStarting: boolean;
  hasRecording: boolean;
}

const useRaceRecorder = ({
  canvasRef,
  fileName = 'snail-race-recording',
}: UseRaceRecorderProps): UseRaceRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const isStartingRef = useRef(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  // localStorage에서 녹화 데이터 확인 및 복원
  useEffect(() => {
    try {
      // 먼저 localStorage 용량 확인을 위해 오래된 데이터 정리
      const recordingTime = localStorage.getItem('snailRaceRecordingTime');
      if (recordingTime) {
        const recordedAt = new Date(recordingTime).getTime();
        const now = new Date().getTime();
        const hoursSinceRecording = (now - recordedAt) / (1000 * 60 * 60);
        // 1시간 이상 지난 녹화는 자동 삭제
        if (hoursSinceRecording > 1) {
          localStorage.removeItem('snailRaceRecording');
          localStorage.removeItem('snailRaceRecordingTime');
          return;
        }
      }
      const savedRecording = localStorage.getItem('snailRaceRecording');
      if (savedRecording) {
        // Base64를 Blob으로 변환
        fetch(savedRecording)
          .then((res) => res.blob())
          .then((blob) => {
            setRecordedBlob(blob);
            setHasRecording(true);
          })
          .catch(() => {
            localStorage.removeItem('snailRaceRecording');
            localStorage.removeItem('snailRaceRecordingTime');
          });
      }
    } catch (e) {
      // localStorage 접근 실패 시 무시
    }
  }, []);

  // 녹화 시간 업데이트
  const updateRecordingTime = useCallback(() => {
    if (startTimeRef.current && !isPaused) {
      setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }
  }, [isPaused]);

  // 녹화 시작
  const startRecording = useCallback(() => {
    if (!canvasRef.current || isRecording || isStarting) return;

    console.log('Starting recording...', canvasRef.current);
    setIsStarting(true);
    isStartingRef.current = true;

    try {
      let stream;

      // Stage 객체인지 Canvas 엘리먼트인지 확인
      if (canvasRef.current && typeof canvasRef.current.toCanvas === 'function') {
        console.log('Konva Stage detected');

        // 모든 레이어를 합친 canvas를 생성
        const stage = canvasRef.current;

        // offscreen canvas 생성 (모든 레이어를 합치기 위해)
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = stage.width();
        offscreenCanvas.height = stage.height();
        const ctx = offscreenCanvas.getContext('2d');

        if (!ctx) {
          throw new Error('Failed to create offscreen canvas context');
        }

        // 프레임 캡처 함수
        const captureFrame = () => {
          // Konva Stage의 toCanvas를 사용하여 모든 레이어를 합친 이미지 가져오기
          stage.toCanvas({
            callback: (canvas: HTMLCanvasElement) => {
              ctx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
              ctx.drawImage(canvas, 0, 0);
            },
          });
        };

        // 초기 프레임 캡처
        captureFrame();

        // 주기적으로 프레임 업데이트 (25fps)
        const frameInterval = setInterval(captureFrame, 40); // 40ms = 25fps

        // MediaRecorder 종료 시 interval 정리를 위해 저장
        chunksRef.current = []; // 초기화
        (chunksRef as any).frameInterval = frameInterval;

        stream = offscreenCanvas.captureStream(25);
        console.log('Stream created from merged Konva layers');
      } else {
        console.log('Regular canvas detected');
        // 일반 Canvas 엘리먼트인 경우
        const canvas = canvasRef.current as HTMLCanvasElement;

        // Canvas의 크기와 내용 확인
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);

        // Canvas가 비어있지 않은지 확인
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // 작은 테스트 그리기로 canvas가 작동하는지 확인
          const imageData = ctx.getImageData(0, 0, 1, 1);
          console.log(
            'Canvas has content:',
            imageData.data.some((pixel) => pixel > 0),
          );
        }

        stream = canvas.captureStream(25);
        console.log('Stream created:', stream, 'Active tracks:', stream.getTracks().length);
      }

      // 지원되는 MIME 타입 확인 및 설정
      let options: MediaRecorderOptions = {};

      // 다양한 코덱 시도
      const mimeTypes = [
        'video/webm;codecs=vp8',
        'video/webm',
        'video/webm;codecs=vp9',
        'video/webm;codecs=h264',
      ];

      let selectedMimeType = 'video/webm';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      options = {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 200000, // 200 Kbps로 대폭 줄여서 파일 크기 최소화
      };

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = []; // 새 녹화를 위해 chunks 초기화

      // 이벤트 핸들러 설정
      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available, size:', event.data.size);
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log('Chunk added, total chunks:', chunksRef.current.length);
        }
      };

      mediaRecorder.onstart = () => {
        console.log('MediaRecorder started successfully');
        startTimeRef.current = Date.now();
        setIsRecording(true);
        setIsPaused(false);
        setIsStarting(false);
        isStartingRef.current = false;
        // 녹화 시간 타이머 시작
        timerRef.current = window.setInterval(updateRecordingTime, 100);
      };
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setIsStarting(false);
        isStartingRef.current = false;
        alert('녹화 중 오류가 발생했습니다.');
      };

      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped, chunks:', chunksRef.current.length);
        setIsRecording(false);
        setIsPaused(false);

        // 프레임 캡처 interval 정리
        if ((chunksRef as any).frameInterval) {
          clearInterval((chunksRef as any).frameInterval);
          delete (chunksRef as any).frameInterval;
        }

        // 녹화된 데이터가 있으면 Blob 생성
        if (chunksRef.current.length > 0) {
          // 올바른 MIME 타입으로 Blob 생성
          const blob = new Blob(chunksRef.current, {
            type: mediaRecorder.mimeType || 'video/webm',
          });
          console.log('Created blob, size:', blob.size);
          setRecordedBlob(blob);
          setHasRecording(true);

          // localStorage 저장 시도 (크기 체크)
          try {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (reader.result) {
                const base64String = reader.result as string;
                // 크기 체크 (localStorage는 일반적으로 5-10MB 제한)
                const sizeInMB = (base64String.length * 0.75) / 1024 / 1024;
                console.log('Recording size:', sizeInMB.toFixed(2), 'MB');
                if (sizeInMB > 2) {
                  // 2MB 이상이면 메모리에만 보관
                  console.log('Recording too large for localStorage, keeping in memory only');
                } else {
                  try {
                    localStorage.setItem('snailRaceRecording', base64String);
                    localStorage.setItem('snailRaceRecordingTime', new Date().toISOString());
                    console.log('Recording saved to localStorage');
                  } catch (e) {
                    // localStorage 저장 실패 시 메모리에만 보관
                    console.error('Failed to save to localStorage:', e);
                  }
                }
              }
            };
            reader.readAsDataURL(blob);
          } catch (error) {
            // 녹화 처리 실패 시 메모리에만 보관
          }
        }

        // 타이머 정리
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      console.log('Starting MediaRecorder with options:', options);
      console.log('MediaRecorder state before start:', mediaRecorder.state);

      // 녹화 시작
      mediaRecorder.start(1000); // 1초마다 데이터 수집 (더 안정적)
      console.log('MediaRecorder.start() called');
      console.log('MediaRecorder state after start:', mediaRecorder.state);

      // 만약 상태는 recording인데 onstart가 발생하지 않으면 수동으로 처리
      setTimeout(() => {
        if (mediaRecorder.state === 'recording' && isStartingRef.current) {
          console.log('MediaRecorder is recording but onstart did not fire, manually handling...');
          startTimeRef.current = Date.now();
          setIsRecording(true);
          setIsPaused(false);
          setIsStarting(false);
          isStartingRef.current = false;
          // 녹화 시간 타이머 시작
          timerRef.current = window.setInterval(updateRecordingTime, 100);
        } else if (mediaRecorder.state === 'inactive' && isStartingRef.current) {
          console.error('MediaRecorder failed to start after 500ms');
          setIsStarting(false);
          isStartingRef.current = false;
          alert('녹화 시작에 실패했습니다. Canvas가 제대로 렌더링되었는지 확인해주세요.');
        }
      }, 500); // 500ms로 단축
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsStarting(false);
      alert('녹화를 시작할 수 없습니다. 브라우저가 Canvas 녹화를 지원하는지 확인해주세요.');
    }
  }, [canvasRef, isRecording, isStarting, updateRecordingTime]);

  // 녹화 중지
  const stopRecording = useCallback(() => {
    console.log(
      'stopRecording called, isRecording:',
      isRecording,
      'mediaRecorder state:',
      mediaRecorderRef.current?.state,
    );
    if (mediaRecorderRef.current && isRecording) {
      // 데이터를 강제로 요청
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.requestData();
      }
      mediaRecorderRef.current.stop();
      setRecordingTime(0);
    }
  }, [isRecording]);

  // 녹화 일시정지
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  }, [isRecording, isPaused]);

  // 녹화 재개
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  }, [isRecording, isPaused]);

  // 녹화 다운로드
  const downloadRecording = useCallback(() => {
    // recordedBlob이 없으면 localStorage에서 다시 시도
    if (!recordedBlob) {
      const savedRecording = localStorage.getItem('snailRaceRecording');
      if (savedRecording) {
        fetch(savedRecording)
          .then((res) => res.blob())
          .then((blob) => {
            // 다운로드 링크 생성
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 100);

            // 다운로드 후 localStorage 정리 (선택사항)
            // localStorage.removeItem('snailRaceRecording');
            // localStorage.removeItem('snailRaceRecordingTime');
          })
          .catch(() => {
            alert('다운로드할 녹화 영상을 찾을 수 없습니다.');
          });
      } else {
        alert('다운로드할 녹화 영상이 없습니다.');
      }
      return;
    }

    // recordedBlob이 있으면 직접 다운로드
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [recordedBlob, fileName]);

  return {
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadRecording,
    isStarting,
    hasRecording,
  };
};

export default useRaceRecorder;
export { useRaceRecorder };
