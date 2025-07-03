// src/components/layout/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
    return (
        <div className="bg-[#0B0F19]">
            {/* 하단 네비게이션 높이만큼 여백 추가 */}
            <div className="h-24"></div>
            <footer className="bg-[#0B0F19] py-8 text-center border-t border-[#64748B]/10">
                <p className="text-[#64748B] font-suit">© 2025 Async Site. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Footer;
