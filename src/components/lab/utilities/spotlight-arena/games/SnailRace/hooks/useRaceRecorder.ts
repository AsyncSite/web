import { useRef, useCallback, useState, useEffect } from 'react';

interface UseRaceRecorderProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
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
  const [hasRecording, setHasRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  // localStorage에서 녹화 데이터 확인 및 복원
  useEffect(() => {
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
    } else {
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

    setIsStarting(true);

    try {
      // Canvas에서 스트림 가져오기
      const stream = canvasRef.current.captureStream(30); // 30 FPS
      // MediaRecorder 설정
      const options = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      };

      // 지원되는 MIME 타입 확인
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = []; // 새 녹화를 위해 chunks 초기화

      // 이벤트 핸들러 설정
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        startTimeRef.current = Date.now();
        setIsRecording(true);
        setIsPaused(false);
        setIsStarting(false);
        // 녹화 시간 타이머 시작
        timerRef.current = window.setInterval(updateRecordingTime, 100);
      };

      mediaRecorder.onstop = () => {
        console.log('[useRaceRecorder] Recording stopped, chunks:', chunksRef.current.length);
        setIsRecording(false);
        setIsPaused(false);

        // 녹화된 데이터가 있으면 Blob 생성
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          console.log('[useRaceRecorder] Created blob, size:', blob.size);
          setRecordedBlob(blob);
          setHasRecording(true);

          // Blob을 Base64로 변환하여 localStorage에 저장 (임시 해결책)
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              localStorage.setItem('snailRaceRecording', reader.result as string);
              localStorage.setItem('snailRaceRecordingTime', new Date().toISOString());
            }
          };
          reader.readAsDataURL(blob);
        } else {
          console.log('[useRaceRecorder] No chunks recorded');
        }

        // 타이머 정리
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      // 녹화 시작
      mediaRecorder.start(100); // 100ms마다 데이터 수집
    } catch (error) {
      setIsStarting(false);
      alert('녹화를 시작할 수 없습니다. 브라우저가 Canvas 녹화를 지원하는지 확인해주세요.');
    }
  }, [canvasRef, isRecording, isStarting, updateRecordingTime]);

  // 녹화 중지
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
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
