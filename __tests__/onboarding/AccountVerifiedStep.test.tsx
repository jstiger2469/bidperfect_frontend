import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tantml:query/react-query'
import { AccountVerifiedStep } from '@/components/onboarding/steps/AccountVerifiedStep'

// Mock the hooks
jest.mock('@/lib/useOnboarding', () => ({
  useStepSaver: () => ({
    saveDebounced: jest.fn(),
    saveImmediate: jest.fn(),
    isSaving: false,
    error: null,
    isSuccess: false,
  }),
}))

describe('AccountVerifiedStep', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('renders with email verification status', () => {
    render(
      <AccountVerifiedStep
        emailVerified={true}
        mfaEnabled={false}
        onContinue={jest.fn()}
      />,
      { wrapper }
    )

    expect(screen.getByText('Verify Your Account')).toBeInTheDocument()
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('disables continue button when email not verified', () => {
    render(
      <AccountVerifiedStep
        emailVerified={false}
        mfaEnabled={false}
        onContinue={jest.fn()}
      />,
      { wrapper }
    )

    const continueButton = screen.getByRole('button', { name: /continue/i })
    expect(continueButton).toBeDisabled()
  })

  it('enables continue button when email verified', () => {
    render(
      <AccountVerifiedStep
        emailVerified={true}
        mfaEnabled={false}
        onContinue={jest.fn()}
      />,
      { wrapper }
    )

    const continueButton = screen.getByRole('button', { name: /continue/i })
    expect(continueButton).not.toBeDisabled()
  })

  it('toggles MFA switch', async () => {
    const user = userEvent.setup()
    
    render(
      <AccountVerifiedStep
        emailVerified={true}
        mfaEnabled={false}
        onContinue={jest.fn()}
      />,
      { wrapper }
    )

    const mfaSwitch = screen.getByRole('switch', { name: /enable mfa/i })
    await user.click(mfaSwitch)

    await waitFor(() => {
      expect(screen.getByText(/MFA will be configured/i)).toBeInTheDocument()
    })
  })
})

