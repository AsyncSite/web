import { useEffect, useState, useCallback } from 'react';

interface UseResultRecordingReturn {
  hasRecording: boolean;
  downloadRecording: () => void;
}

const useResultRecording = (): UseResultRecordingReturn => {
  const [hasRecording, setHasRecording] = useState(false);

  // 컴포넌트 마운트 시 localStorage 확인
  useEffect(() => {
    const checkRecording = () => {
      try {
        const savedRecording = localStorage.getItem('snailRaceRecording');
        const recordingTime = localStorage.getItem('snailRaceRecordingTime');

        if (savedRecording && recordingTime) {
          // 녹화 시간 확인 (24시간 이내)
          const recordedAt = new Date(recordingTime).getTime();
          const now = new Date().getTime();
          const hoursSinceRecording = (now - recordedAt) / (1000 * 60 * 60);

          if (hoursSinceRecording < 24) {
            setHasRecording(true);
          } else {
            // 오래된 녹화는 삭제
            localStorage.removeItem('snailRaceRecording');
            localStorage.removeItem('snailRaceRecordingTime');
          }
        }
      } catch (e) {
        // localStorage 접근 실패 시 무시
      }
    };

    checkRecording();
    // localStorage 변경 감지
    const handleStorageChange = () => checkRecording();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const downloadRecording = useCallback(() => {
    const savedRecording = localStorage.getItem('snailRaceRecording');

    if (!savedRecording) {
      alert('다운로드할 녹화 영상이 없습니다.');
      return;
    }

    // Base64를 Blob으로 변환하여 다운로드
    fetch(savedRecording)
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const recordingTime = localStorage.getItem('snailRaceRecordingTime');
        const date = recordingTime
          ? new Date(recordingTime).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10);
        a.download = `snail-race-recording-${date}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);

        // 다운로드 후 정리
        try {
          localStorage.removeItem('snailRaceRecording');
          localStorage.removeItem('snailRaceRecordingTime');
        } catch (e) {
          // localStorage 정리 실패 시 무시
        }
        setHasRecording(false);
      })
      .catch(() => {
        alert('녹화 다운로드 중 오류가 발생했습니다.');
      });
  }, []);

  return {
    hasRecording,
    downloadRecording,
  };
};

export default useResultRecording;
