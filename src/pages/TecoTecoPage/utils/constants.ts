// src/pages/TecoTecoPage/utils/constants.ts

import { Contributor, Review, FAQItem, StepContent } from './types';


export const tecotecoMembers: Contributor[] = [
    {
        name: "renechoi",
        githubId: "renechoi",
        imageUrl: process.env.PUBLIC_URL + '/images/face/rene.png',
        tecotecoContribution: "알고리즘 문제 해결사 🏆",
        joinDate: "2024-11-01" // 예시 날짜
    },
    {
        name: "kdelay",
        githubId: "kdelay",
        imageUrl: process.env.PUBLIC_URL + '/images/face/kdelay.png',
        tecotecoContribution: "꼼꼼한 코드 리뷰어 📝",
        joinDate: "2024-12-15"
    },
    {
        name: "vvoohhee",
        githubId: "vvoohhee",
        imageUrl: process.env.PUBLIC_URL + '/images/face/vvoohhee.png',
        tecotecoContribution: "성장하는 AI 스터디 리더 💡",
        joinDate: "2025-01-20"
    },
    {
        name: "KrongDev",
        githubId: "KrongDev",
        imageUrl: 'https://avatars.githubusercontent.com/u/138358867?s=40&v=4',
        tecotecoContribution: "질문과 답변의 오작교 💬",
        joinDate: "2025-02-28"
    },
    {
        name: "who's next?",
        githubId: "your-next-profile",
        imageUrl: process.env.PUBLIC_URL + '/images/face/another.png',
        tecotecoContribution: "당신의 합류를 기다려요 👋",
        joinDate: undefined // 아직 합류하지 않음
    }
];

export const tecotecoKeywords: string[] = [
    "😌 편안한 분위기", "💥 사고의 확장", "🤗 배려왕 멤버",
    "🥳 즐거운 분위기", "📝 꼼꼼한 코드 리뷰", "👩‍💻 실전 코딩",
    "🧠 논리적 사고력", "🗣️ 커뮤니케이션 역량", "🤖 AI 활용",
    "🌱 함께 성장"
];

export const tecotecoReviews: Review[] = [
    {
        name: "익명1",
        attendCount: 3,
        timeAgo: "6달 전",
        title: "인생의 의미",
        content: "누가 시킨것도 ..부자가 되는 것도 아닌데 코딩테스트 문제를 풀고 바쁜 일상을 탈탈 털어 진지한 이야기를 나눈 소중한 경험",
        emojis: ["😃", "✨", "🔥"],
        likes: 2,
    },
    {
        name: "익명2",
        attendCount: 10,
        timeAgo: "2년 전",
        title: "Better together !",
        content: "혼자서는 엄두도 못 냈던 어려운 알고리즘 문제들! 테코테코 모임에서 함께 고민하고 해결하며 완독하는 뿌듯함을 느꼈습니다. 함께라면 우린 해낼 수 있어요!",
        emojis: ["🧡", "😍", "😃"],
        likes: 1,
    },
    {
        name: "익명3",
        attendCount: 8,
        timeAgo: "1년 전",
        title: "많은 것들을 배운 시간이었습니다!",
        content: "운이 좋게 좋은 문제, 열정적인 멤버, 그리고 많은 것을 배울 수 있는 동료들이 있는 모임에 참여하게 돼서 정말 의미 있는 시간이었습니다. 감사합니다 :)",
        emojis: ["☺️", "👍", "💡"],
        likes: 1,
    },
];

export const tecotecoFaqs: FAQItem[] = [
    {
        id: 1,
        question: '테코테코는 어떤 스터디인가요?',
        answer: '테코테코는 코딩 테스트 완전 정복을 목표로 하는 알고리즘 스터디입니다. 단순히 문제를 푸는 것을 넘어, 논리적 사고력과 커뮤니케이션 역량 강화를 지향합니다.'
    },
    {
        id: 2,
        question: '모임은 언제, 어디서 진행되나요?',
        answer: '매주 금요일 저녁 7:30 ~ 9:30에 강남역 인근 스터디룸에서 오프라인 모임을 중심으로 진행됩니다. 상황에 따라 온라인(Discord)으로 전환될 수 있습니다.'
    },
    {
        id: 3,
        question: '스터디 비용은 어떻게 되나요?',
        answer: '스터디룸 대관료는 참석자끼리 N/1로 정산합니다. 별도의 회비나 멤버십 비용은 없습니다.'
    },
    {
        id: 4,
        question: '참여하려면 어떻게 해야 하나요?',
        answer: '현재는 공식 모집은 진행하고 있지 않아요. 관심 있으신 분들은 @renechoi에게 커피챗을 요청해주시면 참여 방법을 안내해 드립니다.'
    },
    {
        id: 5,
        question: '코딩 테스트 실력이 부족해도 참여할 수 있나요?',
        answer: '네, 실력에 관계없이 누구나 참여할 수 있습니다. 함께의 가치를 중요하게 생각하며, 서로 돕고 배우며 성장할 수 있는 환경을 지향합니다.'
    }
];

export const tecotecoSteps: StepContent[] = [
    {
        label: "문제를 만나고",
        title: "새로운 도전, 익숙한 문제",
        description: "혼자서는 엄두 내지 못했던 문제들. TecoTeco에서는 그 문제들을 피하지 않고, 함께 마주하며 새로운 도전을 시작합니다. 작은 성공들이 쌓여 큰 자신감으로 이어질 거예요.",
        image: process.env.PUBLIC_URL + '/images/step_problem.png',
    },
    {
        label: "질문하고",
        title: "멈추지 않는 호기심, 날카로운 질문",
        description: "막히는 지점 앞에서 주저하지 마세요. '이건 왜 이렇게 될까?', '더 좋은 방법은 없을까?' 끊임없이 질문하고 서로에게 배우며 이해의 폭을 넓힙니다. 질문하는 용기가 성장의 첫걸음입니다.",
        image: process.env.PUBLIC_URL + '/images/step_question.png',
    },
    {
        label: "파고들고",
        title: "본질을 꿰뚫는 깊이 있는 탐구",
        description: "단순히 정답을 아는 것을 넘어, 문제의 본질과 숨겨진 원리를 집요하게 파고듭니다. 함께 토론하며 '아하!' 하고 깨닫는 순간, 지적 성장의 짜릿함을 경험할 수 있습니다.",
        image: process.env.PUBLIC_URL + '/images/step_explore.png',
    },
    {
        label: "리뷰하고",
        title: "성장을 위한 따뜻한 피드백",
        description: "서로의 코드를 읽고, 배우고, 더 나은 코드를 위해 아낌없이 피드백합니다. 나를 돌아보고 동료의 시야를 빌려 나의 코드를 한층 더 성장시키는 소중한 시간입니다.",
        image: process.env.PUBLIC_URL + '/images/step_review.png',
    },
    {
        label: "성장해요",
        title: "코드를 넘어, 삶의 이야기",
        description: "알고리즘을 넘어 개발 문화, 커리어 고민, 소소한 일상까지. 코드를 매개로 연결된 소중한 인연들이 함께 성장해요.",
        image: process.env.PUBLIC_URL + '/images/step_talk.png',
    },
];