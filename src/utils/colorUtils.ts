// 색상 시스템 통합 유틸리티

interface ColorConfig {
  bg: string;
  text: string;
  border: string;
}

// Wave별 색상 매핑
const WAVE_COLORS: Record<string, ColorConfig> = {
  '테코테코': { bg: 'bg-[#6366F1]/15', text: 'text-[#6366F1]', border: 'border-[#6366F1]/30' },
  'DEVLOG-14': { bg: 'bg-[#10B981]/15', text: 'text-[#10B981]', border: 'border-[#10B981]/30' },
  '디핑소스': { bg: 'bg-[#F59E0B]/15', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/30' },
  '터닝페이지': { bg: 'bg-[#EC4899]/15', text: 'text-[#EC4899]', border: 'border-[#EC4899]/30' },
  '커리어로그': { bg: 'bg-[#8B5CF6]/15', text: 'text-[#8B5CF6]', border: 'border-[#8B5CF6]/30' },
  '커리어': { bg: 'bg-[#06B6D4]/15', text: 'text-[#06B6D4]', border: 'border-[#06B6D4]/30' },
};

// 이벤트 타입별 색상 매핑
const TYPE_COLORS: Record<string, string> = {
  'study': 'bg-[#6366F1]/20 text-[#6366F1] border-[#6366F1]/30',
  'meeting': 'bg-[#06B6D4]/20 text-[#06B6D4] border-[#06B6D4]/30',
  'project': 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30',
  'social': 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30',
};

// 스터디 모집 상태별 색상 매핑
const RECRUITMENT_STATUS_COLORS: Record<string, string> = {
  'recruiting': 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30',
  'full': 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30',
  'closed': 'bg-[#64748B]/20 text-[#64748B] border-[#64748B]/30',
};

// 기본 색상
const DEFAULT_WAVE_COLOR: ColorConfig = { 
  bg: 'bg-[#64748B]/15', 
  text: 'text-[#64748B]', 
  border: 'border-[#64748B]/30' 
};

const DEFAULT_TYPE_COLOR = 'bg-[#64748B]/20 text-[#64748B] border-[#64748B]/30';

// 공개 함수들
export const getWaveColor = (wave: string): ColorConfig => {
  return WAVE_COLORS[wave] || DEFAULT_WAVE_COLOR;
};

export const getTypeColor = (type: string): string => {
  return TYPE_COLORS[type] || DEFAULT_TYPE_COLOR;
};

export const getRecruitmentStatusColor = (status: string): string => {
  return RECRUITMENT_STATUS_COLORS[status] || DEFAULT_TYPE_COLOR;
};

export const getRecruitmentStatusText = (status: string): string => {
  const texts = {
    'recruiting': '모집 중',
    'full': '모집 완료',
    'closed': '모집 마감',
  };
  return texts[status as keyof typeof texts] || '상태 미정';
};

// 색상 유틸리티 함수들
export const lightenColor = (colorClass: string, opacity: number = 0.5): string => {
  return colorClass.replace(/\/\d+/, `/${Math.round(opacity * 100)}`);
};

export const darkenColor = (colorClass: string): string => {
  return colorClass.replace(/\/\d+/, '/80');
};
