import React, { useState } from 'react';
import { EnhancedHeader } from '../components/layout';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Calendar as CalendarIcon, List, Clock, Users, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent, calendarEvents, getWaveColor, getTypeColor } from '../data';
import { usePageTransition, useScrollOnChange } from '../hooks/usePageTransition';

interface CalendarPageProps {
  events?: CalendarEvent[];
}

const CalendarPage: React.FC<CalendarPageProps> = ({ events = calendarEvents }) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWaves, setSelectedWaves] = useState<string[]>([]);

  // 페이지 전환 훅 사용
  const { isReady } = usePageTransition({
    enableLoading: true,
    loadingTime: 500
  });

  // 뷰 모드 변경 시 스크롤
  useScrollOnChange(viewMode);

  // 전달받은 이벤트 사용 (빈 배열이면 빈 캘린더 표시)

  // 필터링된 이벤트 반환
  const getFilteredEvents = () => {
    if (selectedWaves.length === 0) return events;
    return events.filter(event => selectedWaves.includes(event.wave));
  };

  // Wave 필터 토글 (다중 선택)
  const toggleWaveFilter = (wave: string) => {
    setSelectedWaves(prev =>
      prev.includes(wave)
        ? prev.filter(w => w !== wave)
        : [...prev, wave]
    );
  };

  // 전체 보기
  const clearAllFilters = () => {
    setSelectedWaves([]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const renderCalendarView = () => {
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 빈 칸 추가 (이전 달)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 p-2"></div>);
    }

    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getFilteredEvents().filter(event => event.date === dateString);
      const isToday = new Date().toDateString() === new Date(dateString).toDateString();

      days.push(
        <div key={day} className="h-32 p-2 hover:bg-[#0F172A]/30 transition-colors rounded-lg">
          <div className={`text-sm font-medium mb-2 ${isToday ? 'text-[#6366F1] font-bold' : 'text-[#F8FAFC]'}`}>
            {day}
            {isToday && <div className="w-1.5 h-1.5 bg-[#6366F1] rounded-full mt-1"></div>}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map(event => {
              const waveColor = getWaveColor(event.wave);
              return (
                <div
                  key={event.id}
                  className={`text-xs px-2 py-1 rounded-md ${waveColor.bg} ${waveColor.text} truncate font-medium border ${waveColor.border}`}
                  title={`${event.title} - ${event.time}`}
                >
                  {event.title}
                </div>
              );
            })}
            {dayEvents.length > 3 && (
              <div className="text-xs text-[#64748B] px-2">+{dayEvents.length - 3}개 더</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-[#0F172A]/30 rounded-2xl p-6 backdrop-blur-sm">
        {/* 캘린더 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-3 rounded-xl hover:bg-[#6366F1]/10 text-[#64748B] hover:text-[#6366F1] transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h3 className="text-2xl font-bold text-[#F8FAFC] font-space-grotesk">
            {currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
          </h3>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-3 rounded-xl hover:bg-[#6366F1]/10 text-[#64748B] hover:text-[#6366F1] transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <div key={day} className={`p-3 text-center font-semibold ${index === 0 ? 'text-[#EF4444]' : index === 6 ? 'text-[#06B6D4]' : 'text-[#64748B]'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* 캘린더 그리드 */}
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const sortedEvents = [...getFilteredEvents()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
      <div key="list-view" className="space-y-4">
        {sortedEvents.map(event => (
          <Card key={`list-${event.id}`} variant="cosmic" className="hover:scale-[1.01] transition-transform duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                    <Badge className={`${getWaveColor(event.wave).bg} ${getWaveColor(event.wave).text} border ${getWaveColor(event.wave).border}`}>
                      {event.wave}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mb-1">
                    {event.title}
                  </CardTitle>
                  <CardDescription>
                    {event.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-6 text-sm text-[#64748B]">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{event.participants}명</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className={`page-container min-h-screen bg-[#0B0F19] transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      <EnhancedHeader />
      
      <main className="pt-20 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#06B6D4] to-[#6366F1] rounded-full flex items-center justify-center">
                <CalendarIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            {/* 타이틀: Space Grotesk */}
            <h1 className="text-4xl md:text-5xl font-bold text-[#F8FAFC] mb-4 font-space-grotesk">
              Calendar
            </h1>
            {/* 한글 본문: SUIT */}
            <p className="text-[#64748B] text-lg max-w-2xl mx-auto font-suit">
              Wave 활동들의 일정을 한눈에 확인하고 관리하세요
            </p>
          </div>

          {/* 메인 컨텐츠 - 좌우 배치 */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 왼쪽: 사이드바 (통계) */}
            <div className="lg:col-span-1">
              <div className="bg-[#0F172A]/30 rounded-2xl p-6 backdrop-blur-sm mb-6">
                <h3 className="text-lg font-bold text-[#F8FAFC] mb-4 font-space-grotesk">이번 달 활동</h3>

                {/* 전체 보기 버튼 */}
                <button
                  onClick={clearAllFilters}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 mb-3 ${
                    selectedWaves.length === 0
                      ? 'bg-[#6366F1]/20 border border-[#6366F1]/30'
                      : 'hover:bg-[#64748B]/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#6366F1] to-[#A855F7]"></div>
                    <span className="text-sm text-[#F8FAFC] font-suit font-medium">전체 보기</span>
                  </div>
                  <span className="text-sm text-[#64748B] font-poppins">{events.length}개</span>
                </button>

                <div className="space-y-2">
                  {Object.entries(
                    events.reduce((acc, event) => {
                      acc[event.wave] = (acc[event.wave] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([wave, count]) => {
                    const waveColor = getWaveColor(wave);
                    const isSelected = selectedWaves.includes(wave);

                    return (
                      <button
                        key={wave}
                        onClick={() => toggleWaveFilter(wave)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                          isSelected
                            ? `${waveColor.bg} ${waveColor.border} border`
                            : 'hover:bg-[#64748B]/10 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${waveColor.bg.replace('/15', '')}`}></div>
                          <span className={`text-sm font-suit font-medium ${isSelected ? waveColor.text : 'text-[#F8FAFC]'}`}>
                            {wave}
                          </span>
                        </div>
                        <span className={`text-sm font-poppins ${isSelected ? waveColor.text : 'text-[#64748B]'}`}>
                          {count}개
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 뷰 모드 토글 */}
              <div className="bg-[#0F172A]/50 rounded-lg p-1 border border-[#64748B]/10">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200 font-suit mb-1 ${
                    viewMode === 'calendar'
                      ? 'bg-[#6366F1] text-white'
                      : 'text-[#64748B] hover:text-[#F8FAFC]'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span className="font-medium">캘린더</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200 font-suit ${
                    viewMode === 'list'
                      ? 'bg-[#6366F1] text-white'
                      : 'text-[#64748B] hover:text-[#F8FAFC]'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="font-medium">리스트</span>
                </button>
              </div>
            </div>

            {/* 오른쪽: 메인 컨텐츠 */}
            <div className="lg:col-span-3">
              {viewMode === 'calendar' && (
                <div key="calendar-view">
                  {renderCalendarView()}
                </div>
              )}
              {viewMode === 'list' && (
                <div key="list-view">
                  {renderListView()}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
