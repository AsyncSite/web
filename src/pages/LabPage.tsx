import { TemplateHeader } from '../components/layout';
import ItemBox from '../components/lab/ItemBox';
import './LabPage.css';

// 임시 데이터
const labItems = [
    {
        title: "테트리스",
        description: "Ai로 시작한 테트리스 게임만들기 고도화는 어디까지 시킬 수 있는 것인가?",
        imageUrl: "/lab/images/tetris.png",
        link: "tetris"
    },
    // 필요한 만큼 아이템 추가
];

const LabPage = () => {
    return (        
        <div className="lab-page">
            <main className="lab-content">
                <h1 className="lab-title">실험실</h1>
                <span className="lab-title-sub">11맨 맴버들의 실험실! 다양한 프로젝트를 확인해보세요.</span>
                <div className="lab-grid">
                    {labItems.map((item, index) => (
                        <ItemBox
                            key={index}
                            title={item.title}
                            description={item.description}
                            imageUrl={item.imageUrl}
                            link={item.link}
                        />
                    ))}
                </div>
            </main>
        </div>
    )
}
export default LabPage;