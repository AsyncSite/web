import React, { useEffect, useRef, useState } from 'react';
import './Header.css';

const Header: React.FC = () => {
    const [isFixedTop, setIsFixedTop] = useState(false);
    const headerRef = useRef<HTMLElement | null>(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    useEffect(() => {
        // Header의 높이를 측정
        if (headerRef.current) {
            setHeaderHeight(headerRef.current.offsetHeight);
        }

        function handleScroll() {
            const introSection = document.getElementById('intro');
            if (!introSection) return;

            // 인트로 섹션의 바닥 위치
            const introRect = introSection.getBoundingClientRect();
            const introBottom = introRect.bottom + window.scrollY;

            // 현재 스크롤 위치
            const scrollTop = window.scrollY || document.documentElement.scrollTop;

            // Header의 높이를 고려하여 고정 시점 조정
            if (scrollTop >= (introBottom - headerHeight)) {
                setIsFixedTop(true);
            } else {
                setIsFixedTop(false);
            }
        }

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // 초기 스크롤 위치에 따라 상태 설정

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [headerHeight]);

    return (
        <header ref={headerRef} className={`main-header ${isFixedTop ? 'fixed-top' : ''}`}>
            <div className="header-inner">
                {/* --- 여기서 "ㅇㅇㅁ" 로고를 SVG 파일로 삽입 --- */}
                <div className="logo">
                    <img
                        src={process.env.PUBLIC_URL + '/assets/IlilmanLogo.svg'}
                        alt="ㅇㅇㅁ 로고"
                        style={{ height: '40px' }}
                    />
                </div>

                <nav>
                    <ul>
                        <li><a href="/">HOME</a></li>
                        <li><a href="/">ABOUT</a></li>
                        <li><a href="#">MOIM</a></li>
                        <li><a href="#">JOIN US</a></li>
                        <li><a href="/">CONTACT</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
