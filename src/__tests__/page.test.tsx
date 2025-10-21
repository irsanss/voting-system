import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import Home from '@/app/page'

// Mock the next/link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

// Mock the theme switcher
jest.mock('@/components/theme-switcher', () => {
  return function MockThemeSwitcher() {
    return <div data-testid="theme-switcher">Theme Switcher</div>
  }
})

describe('Home Page', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('should render the home page correctly', () => {
    render(<Home />)
    
    // Check main elements
    expect(screen.getByText('Apartment Voting System')).toBeInTheDocument()
    expect(screen.getByText(/Welcome to the Apartment Voting System/)).toBeInTheDocument()
    expect(screen.getByText(/Secure, transparent, and efficient voting/)).toBeInTheDocument()
  })

  it('should display language selector', () => {
    render(<Home />)
    
    const languageSelector = screen.getByRole('combobox')
    expect(languageSelector).toBeInTheDocument()
  })

  it('should display theme switcher', () => {
    render(<Home />)
    
    const themeSwitcher = screen.getByTestId('theme-switcher')
    expect(themeSwitcher).toBeInTheDocument()
  })

  it('should display login button', () => {
    render(<Home />)
    
    const loginButton = screen.getByText('Login')
    expect(loginButton).toBeInTheDocument()
    expect(loginButton.closest('a')).toHaveAttribute('href', '/auth/login')
  })

  it('should display get started button', () => {
    render(<Home />)
    
    const getStartedButton = screen.getByText('Get Started')
    expect(getStartedButton).toBeInTheDocument()
    expect(getStartedButton.closest('a')).toHaveAttribute('href', '/auth/register')
  })

  it('should display view candidates button', () => {
    render(<Home />)
    
    const viewCandidatesButton = screen.getByText('View Candidates')
    expect(viewCandidatesButton).toBeInTheDocument()
    expect(viewCandidatesButton.closest('a')).toHaveAttribute('href', '/candidates')
  })

  it('should display feature cards', () => {
    render(<Home />)
    
    // Check for feature titles
    expect(screen.getByText('Candidates')).toBeInTheDocument()
    expect(screen.getByText('Voting')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should change language when selected', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    const languageSelector = screen.getByRole('combobox')
    
    // Change to Bahasa
    await user.selectOptions(languageSelector, 'id')
    
    // Check if text changed to Bahasa
    await waitFor(() => {
      expect(screen.getByText('Sistem Voting Apartemen')).toBeInTheDocument()
    })
  })

  it('should save language preference to localStorage', async () => {
    const user = userEvent.setup()
    render(<Home />)
    
    const languageSelector = screen.getByRole('combobox')
    
    // Change to Bahasa
    await user.selectOptions(languageSelector, 'id')
    
    // Check if saved to localStorage
    expect(localStorage.getItem('language')).toBe('id')
  })

  it('should load saved language from localStorage', () => {
    // Set saved language
    localStorage.setItem('language', 'id')
    
    render(<Home />)
    
    // Check if loaded language is applied
    expect(screen.getByText('Sistem Voting Apartemen')).toBeInTheDocument()
  })

  it('should display footer with current year', () => {
    render(<Home />)
    
    const footer = screen.getByText(/© 2025 Apartment Voting System/)
    expect(footer).toBeInTheDocument()
  })

  it('should have proper links for feature cards', () => {
    render(<Home />)
    
    // Check feature card links
    const links = screen.getAllByRole('link')
    const hrefs = links.map(link => link.getAttribute('href'))
    
    expect(hrefs).toContain('/candidates')
    expect(hrefs).toContain('/vote')
    expect(hrefs).toContain('/dashboard')
  })

  it('should display proper descriptions for features', () => {
    render(<Home />)
    
    expect(screen.getByText('Meet the candidates running for apartment leadership')).toBeInTheDocument()
    expect(screen.getByText('Cast your vote securely and conveniently')).toBeInTheDocument()
    expect(screen.getByText('View real-time election results and statistics')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<Home />)
    
    // Check for proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 2 })
    expect(mainHeading).toBeInTheDocument()
    
    // Check for navigation elements
    const navigation = screen.getByRole('navigation')
    expect(navigation).toBeInTheDocument()
    
    // Check for main content area
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
  })

  it('should be responsive', () => {
    render(<Home />)
    
    // Check if responsive classes are applied
    const container = document.querySelector('.container')
    expect(container).toBeInTheDocument()
    
    const grid = document.querySelector('.grid')
    expect(grid).toBeInTheDocument()
  })
})