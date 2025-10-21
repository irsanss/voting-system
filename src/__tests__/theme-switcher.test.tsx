import { render, screen } from '@testing-library/react'
import { ThemeSwitcher } from '@/components/theme-switcher'

// Mock next-themes
const mockSetTheme = jest.fn()
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
    resolvedTheme: 'light',
  }),
}))

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    mockSetTheme.mockClear()
  })

  it('should render theme switcher button', () => {
    render(<ThemeSwitcher />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<ThemeSwitcher />)
    
    const button = screen.getByRole('button')
    
    // Check for proper ARIA attributes
    expect(button).toHaveAttribute('aria-expanded')
    expect(button).toHaveAttribute('aria-haspopup')
  })

  it('should display sun and moon icons', () => {
    render(<ThemeSwitcher />)
    
    // Check for icons (they should be present but one should be hidden)
    const sunIcon = document.querySelector('.lucide-sun')
    const moonIcon = document.querySelector('.lucide-moon')
    
    expect(sunIcon).toBeInTheDocument()
    expect(moonIcon).toBeInTheDocument()
  })

  it('should have screen reader text', () => {
    render(<ThemeSwitcher />)
    
    const srText = screen.getByText('Switch theme')
    expect(srText).toBeInTheDocument()
    expect(srText).toHaveClass('sr-only')
  })

  it('should be keyboard accessible', () => {
    render(<ThemeSwitcher />)
    
    const button = screen.getByRole('button')
    
    // Test keyboard navigation
    button.focus()
    expect(button).toHaveFocus()
  })

  it('should have proper styling classes', () => {
    render(<ThemeSwitcher />)
    
    const button = screen.getByRole('button')
    
    // Check for Tailwind classes
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })
})