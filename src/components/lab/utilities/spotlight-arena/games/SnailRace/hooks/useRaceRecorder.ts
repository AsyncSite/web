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

      // MediaRecorder 설정 함수
      const setupMediaRecorder = (stream: MediaStream) => {
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
          videoBitsPerSecond: 5000000, // 5 Mbps로 증가하여 고품질 녹화
        };

        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;

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
          console.log(
            'MediaRecorder stopped, chunks:',
            chunksRef.current.length,
          );
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
                    console.log(
                      'Recording too large for localStorage, keeping in memory only',
                    );
                  } else {
                    try {
                      localStorage.setItem('snailRaceRecording', base64String);
                      localStorage.setItem(
                        'snailRaceRecordingTime',
                        new Date().toISOString(),
                      );
                      console.log(
                        'Recording saved to localStorage successfully',
                      );
                      // 저장 확인
                      const saved = localStorage.getItem('snailRaceRecording');
                      console.log('Verification - recording saved:', !!saved);
                    } catch (e) {
                      // localStorage 저장 실패 시 메모리에만 보관
                      console.error('Failed to save to localStorage:', e);
                    }
                  }
                }
              };
              reader.readAsDataURL(blob);
            } catch (error) {
              console.error('Failed to process recording:', error);
              // 녹화 처리 실패 시 메모리에만 보관
            }
          } else {
            console.warn('No chunks recorded, nothing to save');
          }

          // 타이머 정리
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        };

        console.log('Starting MediaRecorder with options:', options);
        console.log('MediaRecorder state before start:', mediaRecorder.state);

        // 녹화 시작 - 100ms마다 데이터 수집하여 짧은 녹화도 캡처
        mediaRecorder.start(100); // 100ms마다 데이터 수집
        console.log('MediaRecorder.start() called with 100ms timeslice');
        console.log('MediaRecorder state after start:', mediaRecorder.state);

        // 만약 상태는 recording인데 onstart가 발생하지 않으면 수동으로 처리
        setTimeout(() => {
          if (mediaRecorder.state === 'recording' && isStartingRef.current) {
            console.log(
              'MediaRecorder is recording but onstart did not fire, manually handling...',
            );
            startTimeRef.current = Date.now();
            setIsRecording(true);
            setIsPaused(false);
            setIsStarting(false);
            isStartingRef.current = false;
            // 녹화 시간 타이머 시작
            timerRef.current = window.setInterval(updateRecordingTime, 100);
          } else if (
            mediaRecorder.state === 'inactive' &&
            isStartingRef.current
          ) {
            console.error('MediaRecorder failed to start after 500ms');
            setIsStarting(false);
            isStartingRef.current = false;
            alert(
              '녹화 시작에 실패했습니다. Canvas가 제대로 렌더링되었는지 확인해주세요.',
            );
          }
        }, 500); // 500ms로 단축

        // 초기 데이터 요청을 위해 짧은 지연 후 requestData 호출
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.requestData();
            console.log('Initial data request sent');
          }
        }, 100);
      };

      // Stage 객체인지 Canvas 엘리먼트인지 확인
      if (
        canvasRef.current &&
        typeof canvasRef.current.toCanvas === 'function'
      ) {
        console.log('Konva Stage detected');

        // 모든 레이어를 합친 canvas를 생성
        const stage = canvasRef.current;
        
        // Konva Stage의 실제 canvas 엘리먼트들을 찾기
        let konvaCanvases: HTMLCanvasElement[] = [];
        try {
          const container = stage.container();
          if (container) {
            const canvasElements = container.getElementsByTagName('canvas');
            konvaCanvases = Array.from(canvasElements) as HTMLCanvasElement[];
            console.log('Found Konva canvases:', konvaCanvases.length);
          }
        } catch (e) {
          console.error('Error finding Konva canvases:', e);
        }

        // offscreen canvas 생성 (모든 레이어를 합치기 위해)
        const offscreenCanvas = document.createElement('canvas');
        // Stage 크기가 0일 경우 기본값 사용
        const stageWidth = stage.width() || 1000;
        const stageHeight = stage.height() || 600;
        
        // 더 높은 해상도를 위해 2배 크기로 설정
        const scale = 2;
        offscreenCanvas.width = stageWidth * scale;
        offscreenCanvas.height = stageHeight * scale;
        const ctx = offscreenCanvas.getContext('2d');
        
        // 고품질 렌더링 설정
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          // 스케일 설정
          ctx.scale(scale, scale);
        }
        
        console.log('Offscreen canvas size:', offscreenCanvas.width, 'x', offscreenCanvas.height, 'Scale:', scale);

        if (!ctx) {
          throw new Error('Failed to create offscreen canvas context');
        }

        // 프레임 캡처 함수 - 직접 canvas를 읽어오는 방식
        const captureFrame = () => {
          try {
            // 매번 최신 canvas 엘리먼트들을 다시 찾기
            try {
              const container = stage.container();
              if (container) {
                const canvasElements = container.getElementsByTagName('canvas');
                if (canvasElements.length > 0) {
                  konvaCanvases = Array.from(canvasElements) as HTMLCanvasElement[];
                }
              }
            } catch (e) {
              // 에러 무시
            }
            
            // 배경색으로 초기화 (스케일 적용 전 전체 캔버스 크기로)
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0); // 스케일 리셋
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
            ctx.restore();
            
            // Konva의 모든 canvas 레이어를 순서대로 그리기
            if (konvaCanvases.length > 0) {
              let hasDrawnContent = false;
              konvaCanvases.forEach((canvas, index) => {
                try {
                  if (canvas.width > 0 && canvas.height > 0) {
                    // 축소해서 그리기 (더 많은 영역 캡처)
                    const zoomFactor = 0.3; // 60% 크기로 축소하여 더 많은 영역 보이게
                    ctx.save();
                    // 중앙에 축소된 이미지 배치
                    const scaledWidth = canvas.width * zoomFactor;
                    const scaledHeight = canvas.height * zoomFactor;
                    const offsetX = (stageWidth - scaledWidth) / 2;
                    const offsetY = (stageHeight - scaledHeight) / 2;
                    ctx.drawImage(canvas, offsetX, offsetY, scaledWidth, scaledHeight);
                    ctx.restore();
                    hasDrawnContent = true;
                  }
                } catch (e) {
                  console.error(`Error drawing canvas layer ${index}:`, e);
                }
              });
              
              // 아무것도 그리지 못했으면 로그
              if (!hasDrawnContent) {
                console.log('No content drawn from Konva canvases');
              }
            } else {
              // Konva canvas를 찾지 못한 경우 fallback
              stage.toCanvas({
                callback: (canvas: HTMLCanvasElement) => {
                  ctx.drawImage(canvas, 0, 0);
                },
              });
            }
          } catch (error) {
            console.error('Error capturing frame:', error);
          }
        };

        // 초기 프레임을 캡처하고 stream 생성
        // 타임아웃을 설정하여 Stage가 준비되지 않은 경우도 처리
        let callbackCalled = false;
        
        const timeoutId = setTimeout(() => {
          if (!callbackCalled) {
            console.log('Stage toCanvas timeout, using offscreen canvas directly');
            
            // 테스트 패턴 그리기 (고해상도)
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0); // 스케일 리셋
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
            ctx.fillStyle = '#333';
            ctx.font = '60px Arial'; // 2배 크기
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('녹화 준비 중...', offscreenCanvas.width / 2, offscreenCanvas.height / 2);
            ctx.restore();
            
            // 빈 캔버스로라도 스트림 생성
            const frameInterval = setInterval(captureFrame, 33); // 30fps
            chunksRef.current = [];
            (chunksRef as any).frameInterval = frameInterval;
            
            stream = offscreenCanvas.captureStream(30); // 30fps로 증가
            console.log('Stream created with test pattern, tracks:', stream.getTracks().length);
            
            // 스트림 활성화를 위해 초기 프레임 강제 업데이트
            const track = stream.getVideoTracks()[0];
            if (track) {
              console.log('Video track state:', track.readyState);
            }
            
            setupMediaRecorder(stream);
          }
        }, 500); // 500ms 후에도 콜백이 호출되지 않으면 강제 진행
        
        // 초기 프레임 캡처 시도
        const captureInitialFrame = () => {
          callbackCalled = true;
          clearTimeout(timeoutId);
          
          // 초기 프레임 캡처
          captureFrame();
          
          // 주기적으로 프레임 업데이트 (25fps)
          const frameInterval = setInterval(captureFrame, 40); // 40ms = 25fps

          // MediaRecorder 종료 시 interval 정리를 위해 저장
          chunksRef.current = []; // 초기화
          (chunksRef as any).frameInterval = frameInterval;

          stream = offscreenCanvas.captureStream(25);
          console.log(
            'Stream created from Konva canvases, tracks:',
            stream.getTracks().length,
          );

          // 여기서부터 MediaRecorder 생성 로직 계속
          setupMediaRecorder(stream);
        };
        
        // 즉시 시작 시도
        if (konvaCanvases.length > 0) {
          console.log('Konva canvases ready, starting immediately');
          captureInitialFrame();
        } else {
          // fallback으로 toCanvas 사용
          stage.toCanvas({
            callback: (canvas: HTMLCanvasElement) => {
              callbackCalled = true;
              clearTimeout(timeoutId);
              
              ctx.drawImage(canvas, 0, 0);
              console.log('Initial frame captured via toCanvas');
              
              // 주기적으로 프레임 업데이트 (25fps)
              const frameInterval = setInterval(captureFrame, 33); // 33ms = 30fps

              // MediaRecorder 종료 시 interval 정리를 위해 저장
              chunksRef.current = []; // 초기화
              (chunksRef as any).frameInterval = frameInterval;

              stream = offscreenCanvas.captureStream(30); // 30fps로 증가
              console.log(
                'Stream created from merged Konva layers, tracks:',
                stream.getTracks().length,
              );

              // 여기서부터 MediaRecorder 생성 로직 계속
              setupMediaRecorder(stream);
            },
          });
        }

        return; // Konva 처리의 경우 여기서 종료 (비동기로 setupMediaRecorder 호출됨)
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
        console.log(
          'Stream created:',
          stream,
          'Active tracks:',
          stream.getTracks().length,
        );

        // 일반 canvas의 경우 바로 MediaRecorder 설정
        setupMediaRecorder(stream);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsStarting(false);
      alert(
        '녹화를 시작할 수 없습니다. 브라우저가 Canvas 녹화를 지원하는지 확인해주세요.',
      );
    }
  }, [canvasRef, isRecording, isStarting, updateRecordingTime]);

  // 녹화 중지
  const stopRecording = useCallback(() => {
    console.log(
      'stopRecording called, isRecording:',
      isRecording,
      'mediaRecorder state:',
      mediaRecorderRef.current?.state,
      'chunks so far:',
      chunksRef.current.length,
    );
    if (mediaRecorderRef.current && isRecording) {
      // 데이터를 강제로 요청하고 약간의 지연 후 중지
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.requestData();
        console.log('Requested final data before stopping');

        // 100ms 후에 중지하여 마지막 데이터가 수집되도록 함
        setTimeout(() => {
          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state === 'recording'
          ) {
            console.log(
              'Stopping MediaRecorder after delay, chunks:',
              chunksRef.current.length,
            );
            mediaRecorderRef.current.stop();
            setRecordingTime(0);
          }
        }, 100);
      } else {
        mediaRecorderRef.current.stop();
        setRecordingTime(0);
      }
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
