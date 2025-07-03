import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getWaveColor, CalendarEvent, calendarEvents } from '../../../data';

interface RoutineCalendarProps {
    events?: CalendarEvent[];
}

const RoutineCalendar: React.FC<RoutineCalendarProps> = ({ events = calendarEvents }) => {
    const [currentDate, setCurrentDate] = useState(new Date());



    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 p-2"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(event => event.date === dateString);
            const isToday = new Date().toDateString() === new Date(dateString).toDateString();

            days.push(
                <div key={day} className="h-24 p-2 hover:bg-[#0F172A]/30 transition-colors rounded-lg">
                    <div className={`text-sm font-medium mb-2 ${isToday ? 'text-[#6366F1] font-bold' : 'text-[#F8FAFC]'}`}>
                        {day}
                        {isToday && <div className="w-1.5 h-1.5 bg-[#6366F1] rounded-full mt-1"></div>}
                    </div>
                    <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => {
                            const waveColor = getWaveColor(event.wave);
                            return (
                                <div
                                    key={event.id}
                                    className={`text-xs px-2 py-1 rounded-md ${waveColor.bg} ${waveColor.text} truncate font-medium border ${waveColor.border}`}
                                    title={event.title}
                                >
                                    {event.title}
                                </div>
                            );
                        })}
                        {dayEvents.length > 2 && (
                            <div className="text-xs text-[#64748B] px-2">+{dayEvents.length - 2}개 더</div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-[#0F172A]/30 rounded-2xl p-6 backdrop-blur-sm">
                {/* 헤더 */}
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

                {/* 요일 */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                        <div key={day} className={`p-3 text-center font-semibold font-suit ${index === 0 ? 'text-[#EF4444]' : index === 6 ? 'text-[#06B6D4]' : 'text-[#64748B]'}`}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* 날짜 박스 */}
                <div className="grid grid-cols-7 gap-2">
                    {days}
                </div>
            </div>
        );
    };

    return renderCalendar();
};

export default RoutineCalendar;
