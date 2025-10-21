# Deployment Guide

This guide provides detailed instructions for deploying the Voting System to various platforms.

## 🚀 Deployment Options

### 1. IBM Cloud Code Engine (Recommended)

#### Prerequisites
- IBM Cloud account
- IBM Cloud CLI installed
- Docker installed

#### Step-by-Step Deployment

1. **Install IBM Cloud CLI**
   ```bash
   curl -fsSL https://clis.cloud.ibm.com/install/linux | sh
   ```

2. **Install Code Engine Plugin**
   ```bash
   ibmcloud plugin install code-engine
   ```

3. **Login to IBM Cloud**
   ```bash
   ibmcloud login --region us-south
   ```

4. **Create Namespace**
   ```bash
   ibmcloud ce project create --name voting-system
   ibmcloud ce project select --name voting-system
   ```

5. **Deploy Application**
   ```bash
   npm run deploy:ibm
   ```

6. **Set Up Environment**
   ```bash
   npm run deploy:ibm:setup
   ```

#### Manual Deployment

1. **Build Docker Image**
   ```bash
   docker build -t voting-system .
   ```

2. **Tag and Push to Registry**
   ```bash
   ibmcloud cr login
   docker tag voting-system us.icr.io/your-namespace/voting-system:latest
   docker push us.icr.io/your-namespace/voting-system:latest
   ```

3. **Deploy to Code Engine**
   ```bash
   ibmcloud ce application create \
     --name voting-system \
     --image us.icr.io/your-namespace/voting-system:latest \
     --port 3000 \
     --memory 1Gi \
     --cpu 0.5
   ```

### 2. Vercel

#### Prerequisites
- Vercel account
- Vercel CLI installed

#### Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Production**
   ```bash
   npm run deploy:vercel
   ```

3. **Deploy Preview**
   ```bash
   npm run deploy:preview
   ```

#### Environment Variables
Set these in Vercel dashboard:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### 3. Docker

#### Local Deployment

1. **Build Image**
   ```bash
   npm run docker:build
   ```

2. **Run Container**
   ```bash
   npm run docker:run
   ```

#### Docker Compose

1. **Start Services**
   ```bash
   npm run docker:compose:up
   ```

2. **Stop Services**
   ```bash
   npm run docker:compose:down
   ```

### 4. Traditional VPS

#### Prerequisites
- Server with Node.js 18+
- Nginx (optional)
- SSL certificate

#### Deployment Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/voting-system.git
   cd voting-system
   ```

2. **Install Dependencies**
   ```bash
   npm ci --production
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

4. **Set Up Environment**
   ```bash
   cp .env.example .env.production
   # Edit .env.production
   ```

5. **Start Application**
   ```bash
   npm start
   ```

6. **Set Up Process Manager**
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   ```

## 🔧 Configuration

### Environment Variables

#### Required Variables
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Application URL

#### Optional Variables
- `REDIS_URL` - Redis connection for sessions
- `SMTP_HOST` - Email server host
- `SMTP_USER` - Email server username
- `SMTP_PASS` - Email server password

### Database Setup

#### SQLite (Default)
```bash
npm run db:push
```

#### PostgreSQL
1. Update `DATABASE_URL` in environment
2. Install PostgreSQL client: `npm install pg`
3. Run migrations: `npm run db:push`

### SSL Configuration

#### IBM Cloud Code Engine
SSL is automatically handled by IBM Cloud.

#### Vercel
SSL is automatically handled by Vercel.

#### Custom Domain
1. Obtain SSL certificate
2. Configure Nginx or similar
3. Update DNS records

## 🔍 Monitoring and Logging

### IBM Cloud Code Engine
```bash
# View application logs
ibmcloud ce application logs --name voting-system

# View application status
ibmcloud ce application get --name voting-system
```

### Vercel
- Access logs through Vercel dashboard
- Use Vercel Analytics for monitoring

### Docker
```bash
# View container logs
docker logs voting-system

# Monitor container stats
docker stats voting-system
```

## 🔒 Security Considerations

### Environment Security
- Use strong secrets
- Rotate secrets regularly
- Don't commit secrets to version control

### Network Security
- Use HTTPS in production
- Configure CORS properly
- Implement rate limiting

### Database Security
- Use strong database passwords
- Limit database access
- Regular backups

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear build cache
npm run clean

# Reinstall dependencies
npm run clean:all
```

#### Database Connection Issues
```bash
# Check database URL
echo $DATABASE_URL

# Reset database
npm run db:reset
```

#### Deployment Failures
```bash
# Check logs
ibmcloud ce application logs --name voting-system

# Check resource usage
ibmcloud ce application get --name voting-system
```

### Health Checks

#### API Health Check
```bash
curl https://your-domain.com/api/health
```

#### Database Health Check
```bash
# Test database connection
npx prisma db pull
```

## 📊 Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run analyze
```

### Database Optimization
- Use indexes
- Optimize queries
- Regular maintenance

### Caching
- Implement Redis caching
- Use CDN for static assets
- Enable browser caching

## 🔄 CI/CD Integration

### GitHub Actions
- Automatic testing on PR
- Automatic deployment on merge
- Security scanning

### Manual Deployment
```bash
# Full release process
npm run release

# Deploy to specific platform
npm run deploy:ibm
npm run deploy:vercel
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Security scan passed
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database backed up

### Post-deployment
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] SSL certificate valid
- [ ] Performance tested
- [ ] User acceptance tested

## 🆘 Support

### Documentation
- [README.md](./README.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)

### Community
- GitHub Issues
- Discord Community
- Stack Overflow

### Emergency Contacts
- Development Team
- Infrastructure Team
- Security Team

---

For additional help, create an issue in the GitHub repository.