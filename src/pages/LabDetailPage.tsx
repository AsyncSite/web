import { useParams } from "react-router-dom";
import './LabPage.css';

import { Tetris, DeductionGame } from "../components/lab/playground";


const LabDetailPage = () => {
    const { subject } = useParams()
    console.log(subject)


    const renderContetns = () => {
        switch (subject) {
            case "tetris":
                return <Tetris />
            case "deduction-game":
                return <DeductionGame />
            default:
                return (
                    <h1 className="lab-title">준비중...</h1>
                )
        }
    }

    return (
        <div className="lab-page">
             <main className="lab-content">
                {renderContetns()}
             </main>
        </div>
    )
}

export default LabDetailPage;