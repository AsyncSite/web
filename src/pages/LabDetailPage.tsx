import { useParams } from 'react-router-dom';
import './LabPage.css';

import { Tetris, DeductionGame } from '../components/lab/playground';
import DocuMentor from '../components/lab/ai-studio/documentor/DocuMentor';

const LabDetailPage = () => {
  const { subject } = useParams();

  const renderContents = () => {
    switch (subject) {
      case 'tetris':
        return <Tetris />;
      case 'deduction-game':
        return <DeductionGame />;
      case 'documentor':
        return <DocuMentor />;
      default:
        return <h1 className="lab-title">준비중...</h1>;
    }
  };

  return (
    <div className="lab-page">
      <main className="lab-content">{renderContents()}</main>
    </div>
  );
};

export default LabDetailPage;
