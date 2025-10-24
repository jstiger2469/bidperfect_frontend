import { test, expect } from '@playwright/test'

test.describe('Onboarding Flow', () => {
  test('completes self-serve onboarding flow', async ({ page }) => {
    // Navigate to onboarding
    await page.goto('/onboarding')

    // Step 1: Account Verified (assuming email is verified in test)
    await expect(page.getByText('Verify Your Account')).toBeVisible()
    await expect(page.getByText('Verified')).toBeVisible()
    await page.getByRole('button', { name: /continue/i }).click()

    // Step 2: Org Choice
    await expect(page.getByText('Create Your Organization')).toBeVisible()
    await page.getByPlaceholder('Acme Construction Inc.').fill('Test Company')
    await page.getByRole('button', { name: /continue/i }).click()

    // Step 3: Company Profile
    await expect(page.getByText('Company Profile')).toBeVisible()
    await page.getByLabel(/legal name/i).fill('Test Company LLC')
    await page.getByLabel(/street address/i).fill('123 Main St')
    await page.getByLabel(/city/i).fill('New Orleans')
    await page.getByLabel(/state/i).selectOption('LA')
    await page.getByLabel(/zip code/i).fill('70112')
    
    // Add NAICS code
    await page.getByPlaceholder(/e\.g\., 236220/i).fill('236220')
    await page.getByRole('button', { name: /add$/i }).click()
    
    await page.getByRole('button', { name: /continue/i }).click()

    // Step 4: Compliance Intake
    await expect(page.getByText('Compliance Documents')).toBeVisible()
    // Note: File upload testing requires special setup
    // Skip for now and just verify the step renders
    
    // Verify left rail shows progress
    const completedSteps = page.locator('[aria-current="step"]')
    await expect(completedSteps).toBeVisible()
  })

  test('handles invite flow', async ({ page }) => {
    await page.goto('/onboarding?invite=test-token-123')

    // Should skip directly to org choice or company profile
    // depending on backend state
    await expect(page.getByText(/organization/i)).toBeVisible()
  })

  test('shows correct step statuses in left rail', async ({ page }) => {
    await page.goto('/onboarding')

    // First step should be current
    const firstStep = page.locator('button').filter({ hasText: 'Verify Account' })
    await expect(firstStep).toHaveClass(/bg-blue-50/)

    // Other required steps should be locked
    const lockedSteps = page.locator('[aria-label*="Company Profile"]')
    await expect(lockedSteps).toBeDisabled()
  })

  test('prevents navigation to locked steps', async ({ page }) => {
    await page.goto('/onboarding?step=COMPLIANCE_INTAKE')

    // Should redirect to current step (ACCOUNT_VERIFIED) if previous steps incomplete
    await expect(page).toHaveURL(/step=ACCOUNT_VERIFIED/)
  })

  test('allows skipping optional steps', async ({ page }) => {
    // Navigate to an optional step (requires completing blocking steps first)
    await page.goto('/onboarding?step=INTEGRATIONS')

    await expect(page.getByText('Connect Your Tools')).toBeVisible()
    await page.getByRole('button', { name: /skip for now/i }).click()

    // Should proceed to next step
    await expect(page).toHaveURL(/step=TEAM/)
  })
})

