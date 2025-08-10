import React, { useState } from 'react';
import './SectionForms.css';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQSectionFormProps {
  initialData?: {
    title?: string;
    faqs?: FAQItem[];
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

const FAQSectionForm: React.FC<FAQSectionFormProps> = ({
  initialData = {},
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(initialData.title || '자주 묻는 질문');
  const [faqs, setFaqs] = useState<FAQItem[]>(
    initialData.faqs || [
      { question: '', answer: '', category: '' }
    ]
  );

  const handleAddFAQ = () => {
    setFaqs([...faqs, { question: '', answer: '', category: '' }]);
  };

  const handleRemoveFAQ = (index: number) => {
    if (faqs.length > 1) {
      const newFaqs = faqs.filter((_, i) => i !== index);
      setFaqs(newFaqs);
    }
  };

  const handleFAQChange = (index: number, field: keyof FAQItem, value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFaqs(newFaqs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty FAQs
    const validFaqs = faqs.filter(faq => faq.question && faq.answer);
    
    if (validFaqs.length === 0) {
      alert('최소 한 개의 FAQ를 입력해주세요.');
      return;
    }

    onSave({
      title,
      faqs: validFaqs
    });
  };

  // TecoTeco 예시 데이터
  const loadExampleData = () => {
    setTitle('자주 묻는 질문');
    setFaqs([
      {
        question: '프로그래밍 초보자도 참여할 수 있나요?',
        answer: '네, 가능합니다! 기본적인 프로그래밍 문법만 알고 있다면 충분히 따라올 수 있도록 커리큘럼이 구성되어 있습니다. 처음에는 어렵게 느껴질 수 있지만, 함께 학습하며 성장할 수 있습니다.',
        category: '참가 자격'
      },
      {
        question: '스터디 시간에 참석하지 못하면 어떻게 되나요?',
        answer: '부득이한 사정으로 참석하지 못하는 경우, 스터디 자료와 녹화본(가능한 경우)을 제공합니다. 다만, 실시간 참여를 통한 토론과 피드백이 중요하므로 가급적 참석을 권장합니다.',
        category: '스터디 진행'
      },
      {
        question: '스터디 비용은 어떻게 되나요?',
        answer: '현재는 무료로 진행되고 있습니다. 다만, 스터디룸 대여나 특별 세션이 있을 경우 소정의 비용이 발생할 수 있으며, 이는 사전에 공지됩니다.',
        category: '비용'
      },
      {
        question: '사전 학습이 필요한가요?',
        answer: '특별한 사전 학습은 필요하지 않습니다. 다만, 사용하실 프로그래밍 언어의 기본 문법은 숙지하고 계시면 좋습니다. 스터디 시작 전 준비 자료를 제공할 예정입니다.',
        category: '준비사항'
      },
      {
        question: '수료 기준은 어떻게 되나요?',
        answer: '전체 세션의 80% 이상 참석하고, 주어진 과제를 성실히 수행하신 분들께 수료증을 발급해드립니다. 또한 우수 참가자에게는 별도의 혜택이 제공됩니다.',
        category: '수료'
      },
      {
        question: '스터디 후 네트워킹 기회가 있나요?',
        answer: '네, 스터디 종료 후에도 슬랙 채널을 통해 지속적으로 소통할 수 있으며, 정기적인 오프라인 모임도 계획하고 있습니다. 함께 성장하는 개발자 네트워크를 만들어갑니다.',
        category: '네트워킹'
      }
    ]);
  };

  return (
    <form onSubmit={handleSubmit} className="section-form faq-form">
      <div className="form-group">
        <label>섹션 제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 자주 묻는 질문"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <div className="group-header">
          <label>FAQ 목록</label>
          <button 
            type="button" 
            onClick={loadExampleData}
            className="example-btn"
          >
            예시 데이터 불러오기
          </button>
        </div>
        
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div className="item-header">
                <h4>FAQ {index + 1}</h4>
                {faqs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFAQ(index)}
                    className="remove-btn"
                  >
                    삭제
                  </button>
                )}
              </div>
              
              <div className="item-fields">
                <div className="field">
                  <label>카테고리</label>
                  <input
                    type="text"
                    value={faq.category}
                    onChange={(e) => handleFAQChange(index, 'category', e.target.value)}
                    placeholder="예: 참가 자격"
                    className="form-input"
                  />
                </div>
                
                <div className="field">
                  <label>질문 *</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                    placeholder="예: 프로그래밍 초보자도 참여할 수 있나요?"
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="field">
                  <label>답변 *</label>
                  <textarea
                    value={faq.answer}
                    onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                    placeholder="예: 네, 가능합니다! 기본적인 프로그래밍 문법만..."
                    className="form-textarea"
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button
          type="button"
          onClick={handleAddFAQ}
          className="add-btn"
        >
          + FAQ 추가
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

export default FAQSectionForm;