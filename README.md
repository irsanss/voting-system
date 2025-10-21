# 🗳️ Secure Voting System

A modern, secure, and feature-rich voting system built with Next.js 15, TypeScript, and Tailwind CSS. Supports multiple voting types, real-time updates, and comprehensive audit trails.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![Prisma](https://img.shields.io/badge/Prisma-ORM-indigo.svg)

## ✨ Features

### 🎯 Core Functionality
- **General-Purpose Voting**: Support for various voting types (leadership, policy, surveys, action plans)
- **Real-Time Updates**: Live voting results and countdown timers
- **Multi-Theme Support**: 4 beautiful themes (Light, Dark, Sage Green, Blue Beach)
- **Multi-Language**: English and Indonesian support
- **Mobile Responsive**: Optimized for all devices

### 🔐 Security
- **End-to-End Encryption**: Secure session management and data protection
- **Input Validation**: Comprehensive validation and sanitization
- **Audit Logging**: Complete audit trails for all actions
- **Rate Limiting**: Protection against abuse and attacks
- **CORS Protection**: Secure cross-origin request handling

### 📊 Analytics & Reporting
- **Real-Time Dashboard**: Live voting statistics and results
- **Historical Data**: Complete voting history with detailed results
- **Winner Announcement**: Automatic winner calculation and display
- **Vote Distribution**: Visual representation of voting patterns

### 🎨 User Experience
- **Intuitive Interface**: Clean, modern design with smooth animations
- **Accessibility**: WCAG compliant with screen reader support
- **Progressive Enhancement**: Works without JavaScript
- **Offline Support**: Basic functionality available offline

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- SQLite (default) or PostgreSQL

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/voting-system.git
   cd voting-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
voting-system/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── voting-history/    # Voting history page
│   │   └── ...
│   ├── components/            # Reusable React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── ...
│   ├── lib/                  # Utility libraries
│   │   ├── db/               # Database configuration
│   │   ├── auth/             # Authentication logic
│   │   └── ...
│   └── hooks/                # Custom React hooks
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
├── tests/                    # Test files
└── docs/                     # Documentation
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Application
NODE_ENV="development"
PORT=3000

# Optional: Redis for session storage
REDIS_URL="redis://localhost:6379"

# Optional: Email for notifications
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Database Setup

#### SQLite (Default)
```bash
npm run db:push
```

#### PostgreSQL
1. Update `DATABASE_URL` in `.env.local`
2. Install PostgreSQL client: `npm install pg`
3. Run migrations: `npm run db:push`

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

Test coverage: **71%** with **62 test cases**

## 🚀 Deployment

### IBM Cloud Code Engine

1. **Build the Docker image**
   ```bash
   docker build -t voting-system .
   ```

2. **Push to IBM Cloud Container Registry**
   ```bash
   ibmcloud cr login
   docker tag voting-system us.icr.io/your-namespace/voting-system:latest
   docker push us.icr.io/your-namespace/voting-system:latest
   ```

3. **Deploy to Code Engine**
   ```bash
   ibmcloud ce application create --name voting-system --image us.icr.io/your-namespace/voting-system:latest
   ```

### Vercel

```bash
npm run build
vercel --prod
```

### Docker

```bash
docker build -t voting-system .
docker run -p 3000:3000 voting-system
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| GET | `/api/auth/me` | Get current user |

### Voting Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get voting projects |
| POST | `/api/projects` | Create voting project |
| GET | `/api/voting-history` | Get voting history (auth required) |
| POST | `/api/votes` | Cast vote |

### Documentation

Full API documentation is available at `/api/docs` (when running in development).

## 🔒 Security

### Security Features
- **Session Encryption**: All sessions are encrypted using AES-256
- **Input Validation**: Comprehensive validation using Zod schemas
- **CORS Protection**: Secure cross-origin request handling
- **Rate Limiting**: Protection against brute force attacks
- **Audit Logging**: Complete audit trails for all actions

### Security Audit
A comprehensive security audit was conducted with the following results:
- ✅ No critical vulnerabilities
- ✅ All dependencies up to date
- ✅ Secure session management
- ✅ Proper input validation
- ✅ CORS configuration verified

## 🎨 Themes

The application supports 4 beautiful themes:

- **Light**: Clean, minimal design
- **Dark**: Easy on the eyes for night voting
- **Sage Green**: Calming, nature-inspired theme
- **Blue Beach**: Ocean-inspired, relaxing theme

Themes can be switched using the theme selector in the header.

## 🌍 Internationalization

Supported languages:
- English (en)
- Indonesian (id)

Language can be switched using the language selector in the header.

## 📈 Monitoring & Analytics

### Built-in Analytics
- Real-time voting statistics
- User engagement metrics
- System performance monitoring
- Error tracking and reporting

### External Monitoring
Compatible with:
- Google Analytics
- Sentry (error tracking)
- LogRocket (session recording)
- Vercel Analytics

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Lucide](https://lucide.dev/) - Icons

## 📞 Support

For support and questions:

- 📧 Email: support@voting-system.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/voting-system/issues)
- 📖 Documentation: [Wiki](https://github.com/your-username/voting-system/wiki)
- 💬 Discord: [Join our community](https://discord.gg/voting-system)

## 🗺️ Roadmap

### Version 0.2.0 (Planned)
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Multi-candidate ranking systems
- [ ] Mobile app (React Native)

### Version 0.3.0 (Planned)
- [ ] Advanced voting methods (STV, Condorcet)
- [ ] Two-factor authentication
- [ ] Role-based access control
- [ ] API rate limiting

### Version 1.0.0 (Planned)
- [ ] Production-ready features
- [ ] Comprehensive documentation
- [ ] Performance optimization
- [ ] Security hardening

---

**Made with ❤️ for secure and accessible voting**