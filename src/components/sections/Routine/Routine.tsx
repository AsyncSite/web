import React from 'react';

const Routine: React.FC = () => {
    return (
        <section id="routine" className="py-20 px-4 bg-[#0B0F19]">
            <div className="max-w-6xl mx-auto">
                {/* 섹션 헤더 */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-[#F8FAFC] mb-4 font-space-grotesk">
                        Routine
                    </h2>
                    <p className="text-[#64748B] text-lg max-w-2xl mx-auto font-suit">
                        꾸준한 성장을 위한 우리의 일상적인 활동들
                    </p>
                </div>

                {/* 루틴 내용 - 추후 추가 예정 */}
                <div className="text-center">
                    <p className="text-[#64748B] font-suit">
                        루틴 관련 내용이 곧 추가될 예정입니다.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Routine;
