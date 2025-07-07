import { SpotlightArenaProvider } from '../../../utilities/spotlight-arena/shared/contexts';
import GameHistoryViewer from '../../../utilities/spotlight-arena/history/GameHistoryViewer';
import StatsDashboard from '../../../utilities/spotlight-arena/stats/StatsDashboard';
import LobbyStep from './components/LobbyStep';
import ArcadeStep from './components/ArcadeStep';
import GameStep from './components/GameStep';
import { useSpotlightArena } from './hooks/useSpotlightArena';
import './SpotlightArenaPage.css';

const SpotlightArenaContent = () => {
  const {
    currentStep,
    participants,
    winnerCount,
    selectedGame,
    snailAnimation,
    showScrollTop,
    handlers,
  } = useSpotlightArena();

  return (
    <div className="spotlight-arena">
      <div className="spotlight-arena-container">
        {currentStep === 'lobby' && (
          <LobbyStep
            participants={participants}
            winnerCount={winnerCount}
            onParticipantsChange={handlers.handleParticipantsChange}
            onWinnerCountChange={handlers.handleWinnerCountChange}
            onNext={handlers.handleNextToArcade}
            onBackToLab={handlers.handleBackToLab}
            onViewStats={handlers.handleViewStats}
          />
        )}

        {currentStep === 'arcade' && (
          <ArcadeStep
            participants={participants}
            onGameSelect={handlers.handleGameSelect}
            onBack={handlers.handleBackToLobby}
          />
        )}

        {currentStep === 'game' && (
          <GameStep
            selectedGame={selectedGame!}
            participants={participants}
            winnerCount={winnerCount}
            snailAnimation={snailAnimation}
            onBackToLobby={handlers.handleBackToLobby}
            onBackToArcade={handlers.handleBackToArcade}
          />
        )}

        {currentStep === 'history' && (
          <GameHistoryViewer
            onBack={handlers.handleViewStats}
            onSelectParticipant={(participantId) => {
              console.log('Selected participant:', participantId);
            }}
          />
        )}

        {currentStep === 'stats' && (
          <StatsDashboard
            onBack={handlers.handleBackToLobby}
            onViewHistory={handlers.handleViewHistory}
            onSelectParticipant={(participantId) => {
              console.log('Selected participant:', participantId);
            }}
          />
        )}
      </div>

      {showScrollTop && (
        <button
          className="floating-action-button"
          onClick={handlers.scrollToTop}
          aria-label="맨 위로 이동"
        >
          ↑
        </button>
      )}
    </div>
  );
};

const SpotlightArenaPage = () => {
  return (
    <SpotlightArenaProvider>
      <SpotlightArenaContent />
    </SpotlightArenaProvider>
  );
};

export default SpotlightArenaPage;
