/**
 * Tests for Onboarding Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Onboarding from '../Onboarding';
import * as authApi from '../../api/auth';
import * as onboardingApi from '../../api/onboarding';

// Mock the API modules
vi.mock('../../api/auth');
vi.mock('../../api/onboarding');

const renderOnboarding = () => {
  return render(
    <BrowserRouter>
      <Onboarding />
    </BrowserRouter>
  );
};

describe('Onboarding Component', () => {
  it('should render the account step initially', () => {
    renderOnboarding();
    
    expect(screen.getByText('Welcome!')).toBeInTheDocument();
    expect(screen.getByText(/connecting your energy account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it('should show progress indicator', () => {
    renderOnboarding();
    
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('should require all fields in account step', async () => {
    renderOnboarding();
    
    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    // Form validation should prevent submission
    expect(vi.mocked(authApi.authApi.register)).not.toHaveBeenCalled();
  });

  it('should proceed to solar step after successful account setup', async () => {
    vi.mocked(authApi.authApi.register).mockResolvedValue({
      userId: 'user123',
      token: 'token123',
    });
    vi.mocked(authApi.authApi.linkEnergyAccount).mockResolvedValue({
      success: true,
      accountLinked: true,
    });

    renderOnboarding();

    // Fill in account form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/account id/i), {
      target: { value: 'ACC123' },
    });
    fireEvent.change(screen.getByLabelText(/account password/i), {
      target: { value: 'accpass' },
    });

    // Submit form
    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    // Wait for solar step to appear
    await waitFor(() => {
      expect(screen.getByText('Solar System')).toBeInTheDocument();
    });

    expect(screen.getByText(/tell us about your solar panels/i)).toBeInTheDocument();
  });

  it('should allow user to select "no solar"', async () => {
    vi.mocked(authApi.authApi.register).mockResolvedValue({
      userId: 'user123',
      token: 'token123',
    });
    vi.mocked(authApi.authApi.linkEnergyAccount).mockResolvedValue({
      success: true,
      accountLinked: true,
    });
    vi.mocked(onboardingApi.onboardingApi.configureSolarSystem).mockResolvedValue({
      success: true,
    });

    renderOnboarding();

    // Complete account step
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/account id/i), {
      target: { value: 'ACC123' },
    });
    fireEvent.change(screen.getByLabelText(/account password/i), {
      target: { value: 'accpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Wait for solar step
    await waitFor(() => {
      expect(screen.getByText('Solar System')).toBeInTheDocument();
    });

    // Select "no solar"
    const noSolarButton = screen.getByRole('button', { name: /no, i don't have solar/i });
    fireEvent.click(noSolarButton);

    // Submit
    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    // Should proceed to explanation
    await waitFor(() => {
      expect(screen.getByText(/you're all set!/i)).toBeInTheDocument();
    });

    expect(vi.mocked(onboardingApi.onboardingApi.configureSolarSystem)).toHaveBeenCalledWith({
      hasSolar: false,
      systemSizeKw: undefined,
      tiltDegrees: undefined,
      orientation: undefined,
    });
  });

  it('should show solar configuration fields when user has solar', async () => {
    vi.mocked(authApi.authApi.register).mockResolvedValue({
      userId: 'user123',
      token: 'token123',
    });
    vi.mocked(authApi.authApi.linkEnergyAccount).mockResolvedValue({
      success: true,
      accountLinked: true,
    });

    renderOnboarding();

    // Complete account step
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/account id/i), {
      target: { value: 'ACC123' },
    });
    fireEvent.change(screen.getByLabelText(/account password/i), {
      target: { value: 'accpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Wait for solar step
    await waitFor(() => {
      expect(screen.getByText('Solar System')).toBeInTheDocument();
    });

    // Select "yes solar"
    const yesSolarButton = screen.getByRole('button', { name: /yes, i have solar panels/i });
    fireEvent.click(yesSolarButton);

    // Solar fields should appear
    expect(screen.getByLabelText(/system size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/panel tilt/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/orientation/i)).toBeInTheDocument();
  });

  it('should display error messages', async () => {
    vi.mocked(authApi.authApi.register).mockRejectedValue(
      new Error('Email already exists')
    );

    renderOnboarding();

    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/account id/i), {
      target: { value: 'ACC123' },
    });
    fireEvent.change(screen.getByLabelText(/account password/i), {
      target: { value: 'accpass' },
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Error should appear
    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  it('should show explanation step with appropriate content', async () => {
    vi.mocked(authApi.authApi.register).mockResolvedValue({
      userId: 'user123',
      token: 'token123',
    });
    vi.mocked(authApi.authApi.linkEnergyAccount).mockResolvedValue({
      success: true,
      accountLinked: true,
    });
    vi.mocked(onboardingApi.onboardingApi.configureSolarSystem).mockResolvedValue({
      success: true,
    });

    renderOnboarding();

    // Complete account step
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/account id/i), {
      target: { value: 'ACC123' },
    });
    fireEvent.change(screen.getByLabelText(/account password/i), {
      target: { value: 'accpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Complete solar step
    await waitFor(() => {
      expect(screen.getByText('Solar System')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /no, i don't have solar/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Check explanation content
    await waitFor(() => {
      expect(screen.getByText(/you're all set!/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/smart energy timing/i)).toBeInTheDocument();
    expect(screen.getByText(/actionable advice/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });
});
