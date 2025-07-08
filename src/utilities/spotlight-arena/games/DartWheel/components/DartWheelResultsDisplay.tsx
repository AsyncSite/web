import { DartWheelSpinResult } from '../types/dartWheel';
import './DartWheelResultsDisplay.css';

interface DartWheelResultsDisplayProps {
  dartWheelResults: DartWheelSpinResult[];
  dartWheelShowLatestOnly?: boolean;
}

function DartWheelResultsDisplay({ 
  dartWheelResults,
  dartWheelShowLatestOnly = false
}: DartWheelResultsDisplayProps): React.ReactNode {
  const dartWheelDisplayResults = dartWheelShowLatestOnly 
    ? dartWheelResults.slice(-1) 
    : dartWheelResults;

  const dartWheelSortedResults = [...dartWheelResults].sort(
    (a, b) => b.section.value - a.section.value
  );

  return (
    <div className="dart-wheel-results-display">
      <h3 className="dart-wheel-results-title">게임 결과</h3>
      
      {dartWheelDisplayResults.length === 0 ? (
        <div className="dart-wheel-results-empty">
          아직 결과가 없습니다
        </div>
      ) : (
        <>
          <div className="dart-wheel-results-list">
            {dartWheelDisplayResults.map((result, index) => (
              <div 
                key={`dart-wheel-result-${result.participant.id}-${index}`}
                className="dart-wheel-result-item"
                style={{ 
                  borderLeftColor: result.section.color,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="dart-wheel-result-participant">
                  {result.participant.name}
                </div>
                <div className="dart-wheel-result-score">
                  <span className="dart-wheel-result-value">
                    {result.section.value}
                  </span>
                  <span className="dart-wheel-result-label">점</span>
                </div>
              </div>
            ))}
          </div>

          {!dartWheelShowLatestOnly && dartWheelResults.length > 1 && (
            <div className="dart-wheel-results-summary">
              <h4 className="dart-wheel-summary-title">현재 순위</h4>
              <div className="dart-wheel-ranking-list">
                {dartWheelSortedResults.slice(0, 3).map((result, index) => (
                  <div 
                    key={`dart-wheel-rank-${result.participant.id}`}
                    className={`dart-wheel-ranking-item dart-wheel-rank-${index + 1}`}
                  >
                    <div className="dart-wheel-rank-number">{index + 1}</div>
                    <div className="dart-wheel-rank-name">
                      {result.participant.name}
                    </div>
                    <div className="dart-wheel-rank-score">
                      {result.section.value}점
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DartWheelResultsDisplay;