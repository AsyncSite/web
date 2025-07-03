import React from 'react';
import RoutineCalendar from '../Routine/RoutineCalendar';
import { CalendarEvent, calendarEvents } from '../../../data';

interface CalendarProps {
  events?: CalendarEvent[];
}

const Calendar: React.FC<CalendarProps> = ({ events = calendarEvents }) => {
    return (
        <section id="calendar" className="py-20 px-4 bg-[#0B0F19]">
            <div className="max-w-6xl mx-auto">
                {/* 섹션 헤더 */}
                <div className="text-center mb-16">
                    {/* 타이틀: Space Grotesk */}
                    <h2 className="text-4xl md:text-5xl font-bold text-[#F8FAFC] mb-4 font-space-grotesk">
                        Routine
                    </h2>
                    {/* 한글 본문: SUIT */}
                    <p className="text-[#64748B] text-lg max-w-2xl mx-auto font-suit">
                        꾸준한 성장을 위한 우리의 일정과 활동들
                    </p>
                </div>

                {/* 캘린더 컴포넌트 */}
                <RoutineCalendar events={events} />
            </div>
        </section>
    );
};

export default Calendar;
