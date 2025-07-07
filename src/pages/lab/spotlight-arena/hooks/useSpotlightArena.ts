import { useState, useEffect, useCallback } from 'react';
import { Participant } from '../../../../components/lab/utilities/spotlight-arena/shared/types';
import { Step } from '../types';
import { LottieAnimationData } from '../types/animation';
import snail1Animation from '../../../../assets/animations/snail/snail_1.json';
import snail2Animation from '../../../../assets/animations/snail/snail_2.json';

export function useSpotlightArena() {
  const [currentStep, setCurrentStep] = useState<Step>('lobby');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winnerCount, setWinnerCount] = useState(1);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [snailAnimation, setSnailAnimation] = useState<LottieAnimationData | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const snailAnimations = [snail1Animation, snail2Animation] as LottieAnimationData[];

  useEffect(() => {
    if (selectedGame === 'snail-race' && !snailAnimation) {
      const randomIndex = Math.floor(Math.random() * snailAnimations.length);
      setSnailAnimation(snailAnimations[randomIndex]);
    }
  }, [selectedGame, snailAnimation, snailAnimations]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleParticipantsChange = useCallback((newParticipants: Participant[]) => {
    setParticipants(newParticipants);
  }, []);

  const handleWinnerCountChange = useCallback((count: number) => {
    setWinnerCount(count);
  }, []);

  const handleNextToArcade = useCallback(() => {
    if (participants.length >= 2) {
      setCurrentStep('arcade');
    }
  }, [participants.length]);

  const handleGameSelect = useCallback((gameId: string) => {
    setSelectedGame(gameId);
    setCurrentStep('game');
  }, []);

  const handleBackToLobby = useCallback(() => {
    setCurrentStep('lobby');
    setSelectedGame(null);
  }, []);

  const handleBackToLab = useCallback(() => {
    window.history.back();
  }, []);

  const handleBackToArcade = useCallback(() => {
    setCurrentStep('arcade');
    setSelectedGame(null);
    setSnailAnimation(null);
  }, []);

  const handleViewStats = useCallback(() => {
    setCurrentStep('stats');
  }, []);

  const handleViewHistory = useCallback(() => {
    setCurrentStep('history');
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    currentStep,
    participants,
    winnerCount,
    selectedGame,
    snailAnimation,
    showScrollTop,
    handlers: {
      handleParticipantsChange,
      handleWinnerCountChange,
      handleNextToArcade,
      handleGameSelect,
      handleBackToLobby,
      handleBackToLab,
      handleBackToArcade,
      handleViewStats,
      handleViewHistory,
      scrollToTop,
    },
  };
}
