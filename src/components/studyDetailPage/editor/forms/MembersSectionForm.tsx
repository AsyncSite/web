import React, { useState } from 'react';
import './SectionForms.css';

interface Member {
  name: string;
  role: string;
  bio: string;
  image: string;
}

interface MembersSectionFormProps {
  initialData?: {
    title?: string;
    members?: Member[];
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

const MembersSectionForm: React.FC<MembersSectionFormProps> = ({
  initialData = {},
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(initialData.title || '함께하는 사람들');
  const [members, setMembers] = useState<Member[]>(
    initialData.members || [
      { name: '', role: '', bio: '', image: '' }
    ]
  );

  const handleAddMember = () => {
    setMembers([...members, { name: '', role: '', bio: '', image: '' }]);
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > 1) {
      const newMembers = members.filter((_, i) => i !== index);
      setMembers(newMembers);
    }
  };

  const handleMemberChange = (index: number, field: keyof Member, value: string) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty members
    const validMembers = members.filter(member => member.name && member.role);
    
    if (validMembers.length === 0) {
      alert('최소 한 명의 멤버를 입력해주세요.');
      return;
    }

    onSave({
      title,
      members: validMembers
    });
  };

  // TecoTeco 예시 데이터
  const loadExampleData = () => {
    setTitle('함께하는 사람들');
    setMembers([
      {
        name: 'renechoi',
        role: '스터디 리더',
        bio: 'DP의 최적화 방법과 스터디 운영의 노하우를 공유합니다',
        image: '/images/face/rene.png'
      },
      {
        name: 'kdelay',
        role: '코드 리뷰어',
        bio: 'DP의 진정한 의미를 깨달았고, 코드 리뷰 스킬을 키웠어요',
        image: '/images/face/kdelay.png'
      },
      {
        name: 'KrongDev',
        role: '문제 해결사',
        bio: 'DFS/BFS를 완전히 이해하게 됐고, 문제 해결 패턴을 익혔어요',
        image: 'https://avatars.githubusercontent.com/u/138358867?s=40&v=4'
      },
      {
        name: '탁형',
        role: '멘토',
        bio: 'BFS 최적화 방법을 터득했고, 설명하는 능력을 키웠어요',
        image: '/images/face/xxx.png'
      }
    ]);
  };

  return (
    <form onSubmit={handleSubmit} className="section-form members-form">
      <div className="form-group">
        <label>섹션 제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 함께하는 사람들"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <div className="group-header">
          <label>멤버 목록</label>
          <button 
            type="button" 
            onClick={loadExampleData}
            className="example-btn"
          >
            예시 데이터 불러오기
          </button>
        </div>
        
        <div className="members-list">
          {members.map((member, index) => (
            <div key={index} className="member-item">
              <div className="member-header">
                <h4>멤버 {index + 1}</h4>
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(index)}
                    className="remove-btn"
                  >
                    삭제
                  </button>
                )}
              </div>
              
              <div className="member-fields">
                <div className="field-row">
                  <div className="field">
                    <label>이름 *</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                      placeholder="예: renechoi"
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="field">
                    <label>역할 *</label>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                      placeholder="예: 스터디 리더"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="field">
                  <label>소개</label>
                  <textarea
                    value={member.bio}
                    onChange={(e) => handleMemberChange(index, 'bio', e.target.value)}
                    placeholder="예: DP의 최적화 방법과 스터디 운영의 노하우를 공유합니다"
                    className="form-textarea"
                    rows={2}
                  />
                </div>
                
                <div className="field">
                  <label>프로필 이미지 URL</label>
                  <input
                    type="text"
                    value={member.image}
                    onChange={(e) => handleMemberChange(index, 'image', e.target.value)}
                    placeholder="예: /images/face/profile.png 또는 https://..."
                    className="form-input"
                  />
                  {member.image && (
                    <div className="image-preview">
                      <img src={member.image} alt={member.name} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button
          type="button"
          onClick={handleAddMember}
          className="add-btn"
        >
          + 멤버 추가
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

export default MembersSectionForm;