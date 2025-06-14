// src/pages/TecoTecoPage/sections/ReviewsSection.tsx
import React, { useState, useEffect, useRef } from 'react';
import { tecotecoKeywords, tecotecoReviews } from '../utils/constants';
import { Review } from '../utils/types';
import './ReviewsSection.css';

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
    <div className="tecoteco-review-card">
        <div className="tecoteco-review-header">
            <span className="tecoteco-reviewer-name">{review.name}</span>
            <span className="tecoteco-review-meta">모임에 {review.attendCount}회 참석하고 작성한 후기예요. {review.timeAgo}</span>
        </div>
        <h4 className="tecoteco-review-title">{review.title}</h4>
        <p className="tecoteco-review-content">{review.content}</p>
        <div className="tecoteco-review-footer">
            <div className="tecoteco-review-emojis">
                {review.emojis.map((emoji, idx) => (
                    <span key={idx}>{emoji}</span>
                ))}
            </div>
            <span className="tecoteco-review-likes">🧡 {review.likes}</span>
        </div>
    </div>
);

export const ReviewsSection: React.FC = () => {
    const [visibleReviewsCount, setVisibleReviewsCount] = useState(3); // 초기 3개만 표시
    const [allReviewsVisible, setAllReviewsVisible] = useState(false); // '더보기' 버튼 상태
    const sectionRef = useRef<HTMLElement>(null); // 섹션 전체를 참조

    const handleViewMore = () => {
        setAllReviewsVisible(true);
        setVisibleReviewsCount(tecotecoReviews.length);
    };

    // 섹션 높이 동적 조절을 위한 useEffect
    useEffect(() => {
        if (sectionRef.current) {
            // 리뷰가 추가되거나 줄어들 때마다 스크롤바가 필요 없도록 min-height를 자동으로 조절합니다.
            // 여기서는 CSS Transition으로 처리하므로, 직접적인 height 조작은 피합니다.
            // 대신, CSS에서 `grid-auto-rows`나 `flex-grow` 등을 활용하여 자연스럽게 늘어나도록 합니다.
        }
    }, [visibleReviewsCount]);

    return (
        <section className="tecoteco-reviews-section" ref={sectionRef}>
            <div className="section-tag-header">솔직한 후기</div>
            <h2 className="section-title">
                가장 진솔한 이야기, <br/> TecoTeco 멤버들의 목소리 🗣️
            </h2>
            <p className="section-subtitle">
                숫자와 코드만으로는 설명할 수 없는 <span className="highlight">우리 모임의 진짜 가치</span>를 들어보세요.
            </p>

            <div className="tecoteco-keywords-list">
                {tecotecoKeywords.map((keyword, index) => (
                    <span key={index} className="tecoteco-keyword-tag">
                        {keyword}
                    </span>
                ))}
            </div>

            <div className="tecoteco-reviews-grid"> {/* 새로운 그리드 컨테이너 */}
                {tecotecoReviews.slice(0, visibleReviewsCount).map((review, index) => (
                    <ReviewCard key={index} review={review} />
                ))}
            </div>

            {!allReviewsVisible && visibleReviewsCount < tecotecoReviews.length && (
                <div className="tecoteco-view-all-reviews-wrapper">
                    <button className="tecoteco-view-all-reviews-button" onClick={handleViewMore}>
                        후기 전체 보기 ({tecotecoReviews.length}개)
                    </button>
                </div>
            )}
        </section>
    );
};