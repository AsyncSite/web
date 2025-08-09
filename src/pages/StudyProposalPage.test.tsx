import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import StudyProposalPage from './StudyProposalPage';
import * as studyService from '../api/studyService';

// Mock the studyService
jest.mock('../api/studyService');

const mockedStudyService = studyService as jest.Mocked<typeof studyService>;

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('StudyProposalPage - One-time Study Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders StudyProposalPage with recurrence type dropdown', () => {
    renderWithRouter(<StudyProposalPage />);
    
    expect(screen.getByText('스터디 제안하기')).toBeInTheDocument();
    expect(screen.getByLabelText(/반복 유형/)).toBeInTheDocument();
  });

  test('selects ONE_TIME recurrence type and auto-syncs dates', () => {
    renderWithRouter(<StudyProposalPage />);
    
    const recurrenceSelect = screen.getByLabelText(/반복 유형/) as HTMLSelectElement;
    const startDateInput = screen.getByLabelText(/시작일/) as HTMLInputElement;
    const endDateInput = screen.getByLabelText(/종료일/) as HTMLInputElement;
    
    // Select ONE_TIME recurrence
    fireEvent.change(recurrenceSelect, { target: { value: 'ONE_TIME' } });
    expect(recurrenceSelect.value).toBe('ONE_TIME');
    
    // Set start date
    const testDate = '2025-08-10';
    fireEvent.change(startDateInput, { target: { value: testDate } });
    
    // Check if end date is auto-synced and disabled
    expect(endDateInput.value).toBe(testDate);
    expect(endDateInput).toBeDisabled();
  });

  test('shows one-time study visual indicator', () => {
    renderWithRouter(<StudyProposalPage />);
    
    const recurrenceSelect = screen.getByLabelText(/반복 유형/) as HTMLSelectElement;
    
    // Select ONE_TIME
    fireEvent.change(recurrenceSelect, { target: { value: 'ONE_TIME' } });
    
    // Check for visual indicator
    expect(screen.getByText(/1회성 스터디/)).toBeInTheDocument();
  });

  test('submits one-time study proposal correctly', async () => {
    mockedStudyService.proposeStudy.mockResolvedValue({
      id: 'test-id',
      title: 'React 특강',
      description: '1회성 React 특강',
      proposerId: 'user001',
      status: 'PENDING',
      createdAt: '2025-08-09T00:00:00Z',
      updatedAt: '2025-08-09T00:00:00Z',
      type: 'ONE_TIME',
      recurrenceType: 'ONE_TIME',
      startDate: '2025-08-10',
      endDate: '2025-08-10'
    });

    renderWithRouter(<StudyProposalPage />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/스터디 제목/), { 
      target: { value: 'React 특강' } 
    });
    fireEvent.change(screen.getByLabelText(/설명/), { 
      target: { value: '1회성 React 특강' } 
    });
    fireEvent.change(screen.getByLabelText(/반복 유형/), { 
      target: { value: 'ONE_TIME' } 
    });
    fireEvent.change(screen.getByLabelText(/시작일/), { 
      target: { value: '2025-08-10' } 
    });
    fireEvent.change(screen.getByLabelText(/일정/), { 
      target: { value: '14:00-17:00' } 
    });
    fireEvent.change(screen.getByLabelText(/기간/), { 
      target: { value: '3시간' } 
    });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /제안하기/ });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockedStudyService.proposeStudy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'React 특강',
          description: '1회성 React 특강',
          recurrenceType: 'ONE_TIME',
          startDate: '2025-08-10',
          endDate: '2025-08-10'
        })
      );
    });
  });

  test('handles recurring study selection correctly', () => {
    renderWithRouter(<StudyProposalPage />);
    
    const recurrenceSelect = screen.getByLabelText(/반복 유형/) as HTMLSelectElement;
    const endDateInput = screen.getByLabelText(/종료일/) as HTMLInputElement;
    
    // Start with ONE_TIME
    fireEvent.change(recurrenceSelect, { target: { value: 'ONE_TIME' } });
    expect(endDateInput).toBeDisabled();
    
    // Change to WEEKLY
    fireEvent.change(recurrenceSelect, { target: { value: 'WEEKLY' } });
    expect(endDateInput).not.toBeDisabled();
    
    // Verify different dates can be set for recurring study
    fireEvent.change(screen.getByLabelText(/시작일/), { 
      target: { value: '2025-08-10' } 
    });
    fireEvent.change(endDateInput, { 
      target: { value: '2025-10-31' } 
    });
    
    expect(endDateInput.value).toBe('2025-10-31');
  });

  test('displays all recurrence type options', () => {
    renderWithRouter(<StudyProposalPage />);
    
    const recurrenceSelect = screen.getByLabelText(/반복 유형/) as HTMLSelectElement;
    const options = Array.from(recurrenceSelect.options).map(opt => opt.value);
    
    expect(options).toContain('ONE_TIME');
    expect(options).toContain('DAILY');
    expect(options).toContain('WEEKLY');
    expect(options).toContain('BIWEEKLY');
    expect(options).toContain('MONTHLY');
  });
});