import { createContext, useContext, useState, ReactNode } from 'react';
import { Participant, GameSettings, GameInfo } from '../types';

interface SpotlightArenaContextType {
  // State
  participants: Participant[];
  gameSettings: GameSettings;
  selectedGame: GameInfo | null;
  currentStep: 'lobby' | 'arcade' | 'game';
  
  // Actions
  setParticipants: (participants: Participant[]) => void;
  updateGameSettings: (settings: Partial<GameSettings>) => void;
  selectGame: (game: GameInfo) => void;
  setCurrentStep: (step: 'lobby' | 'arcade' | 'game') => void;
  resetGame: () => void;
}

const SpotlightArenaContext = createContext<SpotlightArenaContextType | undefined>(undefined);

export const useSpotlightArena = () => {
  const context = useContext(SpotlightArenaContext);
  if (!context) {
    throw new Error('useSpotlightArena must be used within SpotlightArenaProvider');
  }
  return context;
};

interface SpotlightArenaProviderProps {
  children: ReactNode;
}

export const SpotlightArenaProvider: React.FC<SpotlightArenaProviderProps> = ({ children }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    participants: [],
    winnerCount: 1,
    allowDuplicates: false
  });
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);
  const [currentStep, setCurrentStep] = useState<'lobby' | 'arcade' | 'game'>('lobby');

  const updateGameSettings = (settings: Partial<GameSettings>) => {
    setGameSettings(prev => ({ ...prev, ...settings }));
  };

  const selectGame = (game: GameInfo) => {
    setSelectedGame(game);
  };

  const resetGame = () => {
    setParticipants([]);
    setGameSettings({
      participants: [],
      winnerCount: 1,
      allowDuplicates: false
    });
    setSelectedGame(null);
    setCurrentStep('lobby');
  };

  const value: SpotlightArenaContextType = {
    participants,
    gameSettings,
    selectedGame,
    currentStep,
    setParticipants,
    updateGameSettings,
    selectGame,
    setCurrentStep,
    resetGame
  };

  return (
    <SpotlightArenaContext.Provider value={value}>
      {children}
    </SpotlightArenaContext.Provider>
  );
};