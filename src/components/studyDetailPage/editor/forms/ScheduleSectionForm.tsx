import React, { useState } from 'react';
import './SectionForms.css';

interface ScheduleItem {
  week: string;
  topic: string;
  description: string;
  materials?: string;
}

interface ScheduleSectionFormProps {
  initialData?: {
    title?: string;
    schedule?: ScheduleItem[];
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ScheduleSectionForm: React.FC<ScheduleSectionFormProps> = ({
  initialData = {},
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(initialData.title || '스터디 일정');
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    initialData.schedule || [
      { week: '', topic: '', description: '', materials: '' }
    ]
  );

  const handleAddItem = () => {
    setSchedule([...schedule, { week: '', topic: '', description: '', materials: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (schedule.length > 1) {
      const newSchedule = schedule.filter((_, i) => i !== index);
      setSchedule(newSchedule);
    }
  };

  const handleItemChange = (index: number, field: keyof ScheduleItem, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty items
    const validSchedule = schedule.filter(item => item.week && item.topic);
    
    if (validSchedule.length === 0) {
      alert('최소 한 개의 일정을 입력해주세요.');
      return;
    }

    onSave({
      title,
      schedule: validSchedule
    });
  };

  // TecoTeco 예시 데이터
  const loadExampleData = () => {
    setTitle('12주 완성 커리큘럼');
    setSchedule([
      {
        week: '1-2주차',
        topic: '기초 다지기',
        description: '시간 복잡도, 공간 복잡도, 기본 자료구조 (배열, 연결 리스트, 스택, 큐)',
        materials: '프로그래머스 Level 1 문제'
      },
      {
        week: '3-4주차',
        topic: 'DFS/BFS 마스터',
        description: '깊이 우선 탐색과 너비 우선 탐색의 원리와 구현, 그래프 탐색 문제 풀이',
        materials: '백준 DFS/BFS 문제집'
      },
      {
        week: '5-6주차',
        topic: 'DP 정복하기',
        description: '동적 계획법의 개념, Top-down vs Bottom-up, 메모이제이션',
        materials: 'LeetCode DP 문제'
      },
      {
        week: '7-8주차',
        topic: '그리디 & 정렬',
        description: '탐욕 알고리즘의 원리, 정렬 알고리즘 구현과 활용',
        materials: '코딩테스트 기출문제'
      },
      {
        week: '9-10주차',
        topic: '그래프 심화',
        description: '최단 경로 (다익스트라, 벨만-포드), 최소 신장 트리 (크루스칼, 프림)',
        materials: '백준 골드 문제'
      },
      {
        week: '11-12주차',
        topic: '실전 모의고사',
        description: '실제 코딩테스트 환경에서 시간 제한 내 문제 해결 연습',
        materials: '기업 코딩테스트 기출'
      }
    ]);
  };

  return (
    <form onSubmit={handleSubmit} className="section-form schedule-form">
      <div className="form-group">
        <label>섹션 제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 12주 완성 커리큘럼"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <div className="group-header">
          <label>일정 목록</label>
          <button 
            type="button" 
            onClick={loadExampleData}
            className="example-btn"
          >
            예시 데이터 불러오기
          </button>
        </div>
        
        <div className="schedule-list">
          {schedule.map((item, index) => (
            <div key={index} className="schedule-item">
              <div className="item-header">
                <h4>일정 {index + 1}</h4>
                {schedule.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="remove-btn"
                  >
                    삭제
                  </button>
                )}
              </div>
              
              <div className="item-fields">
                <div className="field-row">
                  <div className="field">
                    <label>주차/기간 *</label>
                    <input
                      type="text"
                      value={item.week}
                      onChange={(e) => handleItemChange(index, 'week', e.target.value)}
                      placeholder="예: 1-2주차"
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="field">
                    <label>주제 *</label>
                    <input
                      type="text"
                      value={item.topic}
                      onChange={(e) => handleItemChange(index, 'topic', e.target.value)}
                      placeholder="예: 기초 다지기"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="field">
                  <label>설명</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="예: 시간 복잡도, 공간 복잡도, 기본 자료구조..."
                    className="form-textarea"
                    rows={2}
                  />
                </div>
                
                <div className="field">
                  <label>학습 자료</label>
                  <input
                    type="text"
                    value={item.materials}
                    onChange={(e) => handleItemChange(index, 'materials', e.target.value)}
                    placeholder="예: 프로그래머스 Level 1 문제"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button
          type="button"
          onClick={handleAddItem}
          className="add-btn"
        >
          + 일정 추가
        </button>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          취소
        </button>
        <button type="submit" className="save-btn">
          저장
        </button>
      </div>
    </form>
  );
};

export default ScheduleSectionForm;