import React, { useState, useEffect } from 'react';

// Activity 인터페이스 정의
interface Activity {
    id: number;
    type: 'solve' | 'review' | 'join' | 'milestone';
    user: string;
    content: string;
    time: string;
    icon: string;
}

// 실시간 활동 피드 데이터 (TecoTecoPage.tsx에서 가져옴)
const recentActivities: Activity[] = [
    {
        id: 1,
        type: 'solve',
        user: 'renechoi',
        content: 'LeetCode 322. Coin Change 문제를 해결했어요',
        time: '방금 전',
        icon: '✅'
    },
    {
        id: 2,
        type: 'review',
        user: 'kdelay',
        content: 'DFS/BFS 주제로 코드 리뷰를 진행했어요',
        time: '5분 전',
        icon: '💬'
    },
    {
        id: 3,
        type: 'milestone',
        user: 'vvoohhee',
        content: '100일 연속 출석 달성! 🎉',
        time: '1시간 전',
        icon: '🏆'
    },
    {
        id: 4,
        type: 'join',
        user: '새로운 멤버',
        content: 'TecoTeco에 합류했어요',
        time: '2시간 전',
        icon: '👋'
    }
];

const ActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState(recentActivities);
    const [isLive, setIsLive] = useState(true);

    // 실시간 업데이트 시뮬레이션
    useEffect(() => {
        if (!isLive) return;

        const interval = setInterval(() => {
            const newActivity: Activity = {
                id: Date.now(),
                type: ['solve', 'review', 'join', 'milestone'][Math.floor(Math.random() * 4)] as Activity['type'],
                user: ['새로운 멤버', 'renechoi', 'kdelay', 'vvoohhee'][Math.floor(Math.random() * 4)],
                content: '새로운 활동이 있어요',
                time: '방금 전',
                icon: ['✅', '💬', '👋', '🏆'][Math.floor(Math.random() * 4)]
            };

            setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
        }, 10000); // 10초마다 업데이트

        return () => clearInterval(interval);
    }, [isLive]);

    return (
        <div className="activity-feed">
            <div className="feed-header">
                <h3>🔥 지금 이 순간, TecoTeco는</h3>
                <button
                    className={`live-toggle ${isLive ? 'active' : ''}`}
                    onClick={() => setIsLive(!isLive)}
                >
                    <span className="live-dot"></span>
                    {isLive ? 'LIVE' : 'PAUSED'}
                </button>
            </div>
            <div className="activities-list">
                {activities.map((activity, index) => (
                    <div
                        key={activity.id}
                        className={`activity-item ${index === 0 ? 'new' : ''}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <span className="activity-icon">{activity.icon}</span>
                        <div className="activity-content">
                            <p>
                                <strong>{activity.user}</strong>
                                {activity.content}
                            </p>
                            <span className="activity-time">{activity.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityFeed;