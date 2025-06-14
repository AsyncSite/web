// src/pages/TecoTecoPage/sections/ReviewsSection.tsx
import React, { useState } from 'react';
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
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

    const goToNextReview = () => {
        setCurrentReviewIndex((prevIndex) =>
            (prevIndex + 1) % tecotecoReviews.length
        );
    };

    const goToPrevReview = () => {
        setCurrentReviewIndex((prevIndex) =>
            (prevIndex - 1 + tecotecoReviews.length) % tecotecoReviews.length
        );
    };

    const goToReview = (index: number) => {
        setCurrentReviewIndex(index);
    };

    return (
        <section className="tecoteco-reviews-section">
            <h2 className="section-title">💬 TecoTeco 멤버들은 이렇게 느꼈어요.</h2>
            <p className="section-subtitle">
                우리 모임을 가장 잘 표현하는 <span className="highlight">생생한 이야기들</span>입니다.
            </p>
            <div className="tecoteco-keywords-list">
                {tecotecoKeywords.map((keyword, index) => (
                    <span key={index} className="tecoteco-keyword-tag">
                        {keyword}
                    </span>
                ))}
            </div>
            <div className="tecoteco-carousel-container">
                <button className="carousel-nav-button prev" onClick={goToPrevReview}>
                    &lt;
                </button>
                <div className="tecoteco-reviews-carousel-wrapper">
                    <div
                        className="tecoteco-reviews-list"
                        style={{ transform: `translateX(-${currentReviewIndex * 100}%)` }}
                    >
                        {tecotecoReviews.map((review, index) => (
                            <ReviewCard key={index} review={review} />
                        ))}
                    </div>
                </div>
                <button className="carousel-nav-button next" onClick={goToNextReview}>
                    &gt;
                </button>
            </div>
            <div className="carousel-indicators">
                {tecotecoReviews.map((_, index) => (
                    <span
                        key={index}
                        className={`indicator-dot ${currentReviewIndex === index ? 'active' : ''}`}
                        onClick={() => goToReview(index)}
                    ></span>
                ))}
            </div>
            <div className="tecoteco-view-all-reviews-wrapper">
                <button className="tecoteco-view-all-reviews-button">후기 전체 보기 (N개)</button>
            </div>
        </section>
    );
};