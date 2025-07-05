export type TeamNameTemplate = 
    | 'default' 
    | 'korean' 
    | 'color' 
    | 'military' 
    | 'animal'
    | 'zodiac'
    | 'element'
    | 'planet'
    | 'music'
    | 'direction'
    | 'season'
    | 'mythology'
    | 'gemstone'
    | 'value'
    | 'food'
    | 'roman'
    | 'custom';

export interface TeamNameTemplateOption {
    id: TeamNameTemplate;
    label: string;
    getTeamName: (index: number) => string;
}

export const TEAM_NAME_TEMPLATES: TeamNameTemplateOption[] = [
    {
        id: 'default',
        label: 'Team 1, 2, 3',
        getTeamName: (index) => `Team ${index + 1}`
    },
    {
        id: 'korean',
        label: 'A조, B조, C조',
        getTeamName: (index) => {
            const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
            return `${letters[index] || index + 1}조`;
        }
    },
    {
        id: 'color',
        label: '레드팀, 블루팀...',
        getTeamName: (index) => {
            const colors = ['레드', '블루', '그린', '옐로우', '퍼플', '오렌지', '핑크', '브라운', '그레이', '블랙'];
            return `${colors[index] || `팀${index + 1}`}팀`;
        }
    },
    {
        id: 'military',
        label: '알파팀, 브라보팀...',
        getTeamName: (index) => {
            const codes = ['알파', '브라보', '찰리', '델타', '에코', '폭스트롯', '골프', '호텔', '인디아', '줄리엣'];
            return `${codes[index] || `팀${index + 1}`}팀`;
        }
    },
    {
        id: 'animal',
        label: '호랑이팀, 독수리팀...',
        getTeamName: (index) => {
            const animals = ['호랑이', '독수리', '사자', '늑대', '표범', '매', '곰', '여우', '치타', '팔콘'];
            return `${animals[index] || `팀${index + 1}`}팀`;
        }
    },
    {
        id: 'zodiac',
        label: '자축인묘... (띠)',
        getTeamName: (index) => {
            const zodiac = ['자(쥐)', '축(소)', '인(호랑이)', '묘(토끼)', '진(용)', '사(뱀)', '오(말)', '미(양)', '신(원숭이)', '유(닭)', '술(개)', '해(돼지)'];
            return `${zodiac[index % 12]}팀`;
        }
    },
    {
        id: 'element',
        label: '불꽃팀, 물결팀...',
        getTeamName: (index) => {
            const elements = ['불꽃', '물결', '바람', '대지', '번개', '얼음', '빛', '어둠', '자연', '강철'];
            return `${elements[index] || `팀${index + 1}`}팀`;
        }
    },
    {
        id: 'planet',
        label: '수성팀, 금성팀...',
        getTeamName: (index) => {
            const planets = ['수성', '금성', '지구', '화성', '목성', '토성', '천왕성', '해왕성', '태양', '달'];
            return `${planets[index] || `팀${index + 1}`}팀`;
        }
    },
    {
        id: 'music',
        label: '도레미파...',
        getTeamName: (index) => {
            const notes = ['도', '레', '미', '파', '솔', '라', '시', '도#', '레#', '파#', '솔#', '라#'];
            return `${notes[index % notes.length]}팀`;
        }
    },
    {
        id: 'direction',
        label: '동군, 서군, 남군, 북군',
        getTeamName: (index) => {
            const directions = ['동', '서', '남', '북', '중앙', '동북', '동남', '서북', '서남'];
            return `${directions[index] || `제${index + 1}`}군`;
        }
    },
    {
        id: 'season',
        label: '봄팀, 여름팀...',
        getTeamName: (index) => {
            const seasons = ['봄', '여름', '가을', '겨울', '새봄', '한여름', '늦가을', '한겨울'];
            return `${seasons[index % seasons.length]}팀`;
        }
    },
    {
        id: 'mythology',
        label: '제우스팀, 아테나팀...',
        getTeamName: (index) => {
            const gods = ['제우스', '아테나', '아폴로', '아르테미스', '포세이돈', '헤르메스', '아레스', '헤파이스토스', '데메테르', '헤라'];
            return `${gods[index] || `팀${index + 1}`}팀`;
        }
    },
    {
        id: 'animal',
        label: '호랑이팀, 독수리팀...',
        getTeamName: (index) => {
            const animals = ['호랑이', '독수리', '사자', '늑대', '표범', '매', '곰', '여우', '치타', '팔콘'];
            return `${animals[index] || `팀${index + 1}`}팀`;
        }
    },
    {
        id: 'zodiac',
        label: '자축인묘... (띠)',
        getTeamName: (index) => {
            const zodiac = ['자(쥐)', '축(소)', '인(호랑이)', '묘(토끼)', '진(용)', '사(뱀)', '오(말)', '미(양)', '신(원숭이)', '유(닭)', '술(개)', '해(돼지)'];
            return `${zodiac[index % 12]}팀`;
        }
    },
    {
        id: 'element',
        label: '불꽃팀, 물결팀...',
        getTeamName: (index) => {
            const elements = ['불꽃', '물결', '바람', '대지', '번개', '얼음', '빛', '어둠', '자연', '강철'];
            return `${elements[index] || `팀${index + 1}`}팀`;
        }
    },
    {
        id: 'planet',
        label: '수성팀, 금성팀...',
        getTeamName: (index) => {
            const planets = ['수성', '금성', '지구', '화성', '목성', '토성', '천왕성', '해왕성', '태양', '달'];
            return `${planets[index] || `팀${index + 1}`}팀`;
        }
    },
    {
        id: 'music',
        label: '도레미파...',
        getTeamName: (index) => {
            const notes = ['도', '레', '미', '파', '솔', '라', '시', '도#', '레#', '파#', '솔#', '라#'];
            return `${notes[index % notes.length]}팀`;
        }
    },
    {
        id: 'direction',
        label: '동군, 서군, 남군, 북군',
        getTeamName: (index) => {
            const directions = ['동', '서', '남', '북', '중앙', '동북', '동남', '서북', '서남'];
            return `${directions[index] || `제${index + 1}`}군`;
        }
    },
    {
        id: 'season',
        label: '봄팀, 여름팀...',
        getTeamName: (index) => {
            const seasons = ['봄', '여름', '가을', '겨울', '새봄', '한여름', '늦가을', '한겨울'];
            return `${seasons[index % seasons.length]}팀`;
        }
    },
    {
        id: 'mythology',
        label: '제우스팀, 아테나팀...',
        getTeamName: (index) => {
            const gods = ['제우스', '아테나', '아폴로', '아르테미스', '포세이돈', '헤르메스', '아레스', '헤파이스토스', '데메테르', '헤라'];
            return `${gods[index] || `팀${index + 1}`}팀`;
        }
    },
    {
        id: 'gemstone',
        label: '다이아팀, 루비팀...',
        getTeamName: (index) => {
            const gems = ['다이아몬드', '루비', '사파이어', '에메랄드', '자수정', '진주', '오팔', '토파즈', '가넷', '페리도트'];
            return `${gems[index] || `팀${index + 1}`}팀`;
        }
    },
    {
        id: 'value',
        label: '열정팀, 도전팀...',
        getTeamName: (index) => {
            const values = ['열정', '도전', '창의', '혁신', '신뢰', '성장', '비전', '희망', '협동', '성실'];
            return `${values[index] || `팀${index + 1}`}팀`;
        }
    },
    {
        id: 'food',
        label: '치킨팀, 피자팀...',
        getTeamName: (index) => {
            const foods = ['치킨', '피자', '떡볶이', '라면', '김밥', '초밥', '파스타', '햄버거', '핫도그', '타코'];
            return `${foods[index] || `팀${index + 1}`}팀`;
        }
    },
    {
        id: 'roman',
        label: 'Team I, II, III...',
        getTeamName: (index) => {
            const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
            return `Team ${numerals[index] || index + 1}`;
        }
    }
];