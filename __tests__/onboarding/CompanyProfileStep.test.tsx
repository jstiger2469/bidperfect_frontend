import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CompanyProfileStep } from '@/components/onboarding/steps/CompanyProfileStep'

jest.mock('@/lib/useOnboarding', () => ({
  useStepSaver: () => ({
    saveDebounced: jest.fn(),
    saveImmediate: jest.fn(),
    isSaving: false,
    error: null,
    isSuccess: false,
  }),
}))

describe('CompanyProfileStep', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('renders all required fields', () => {
    render(<CompanyProfileStep onContinue={jest.fn()} />, { wrapper })

    expect(screen.getByLabelText(/legal name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    
    render(<CompanyProfileStep onContinue={jest.fn()} />, { wrapper })

    const continueButton = screen.getByRole('button', { name: /continue/i })
    await user.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText(/legal name is required/i)).toBeInTheDocument()
    })
  })

  it('adds and removes NAICS codes', async () => {
    const user = userEvent.setup()
    
    render(<CompanyProfileStep onContinue={jest.fn()} />, { wrapper })

    const naicsInput = screen.getByPlaceholderText(/e\.g\., 236220/i)
    await user.type(naicsInput, '236220')
    
    const addButton = screen.getByRole('button', { name: /add$/i })
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('236220')).toBeInTheDocument()
    })
  })
})

