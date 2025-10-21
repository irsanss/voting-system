#!/bin/bash

# IBM Cloud Environment Setup Script
# Version: 0.1.0
# Description: Set up environment variables and secrets for IBM Cloud Code Engine

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="voting-system"
NAMESPACE="voting-system"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Generate random secret
generate_secret() {
    openssl rand -base64 32
}

# Set up environment variables
setup_environment() {
    log_info "Setting up environment variables..."
    
    # Generate secrets
    NEXTAUTH_SECRET=$(generate_secret)
    DATABASE_URL="file:./db/prod.db"
    
    # Create environment file
    cat > .env.production << EOF
# Database
DATABASE_URL="$DATABASE_URL"

# NextAuth.js
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NEXTAUTH_URL="https://$(ibmcloud ce application get --name $APP_NAME --output json | jq -r '.status.url')"

# Application
NODE_ENV="production"
PORT=3000
NEXT_TELEMETRY_DISABLED=1

# Optional: Redis for session storage
# REDIS_URL="redis://redis:6379"

# Optional: Email configuration
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT=587
# SMTP_USER="your-email@gmail.com"
# SMTP_PASS="your-app-password"
EOF
    
    log_success "Environment variables configured"
    log_warning "Please review .env.production file before deployment"
}

# Set up IBM Cloud secrets
setup_ibm_secrets() {
    log_info "Setting up IBM Cloud secrets..."
    
    # Generate secrets
    NEXTAUTH_SECRET=$(generate_secret)
    
    # Create secrets in IBM Cloud
    ibmcloud ce secret create --name nextauth-secret --from-literal=NEXTAUTH_SECRET="$NEXTAUTH_SECRET" || {
        log_warning "Secret already exists, updating..."
        ibmcloud ce secret update --name nextauth-secret --from-literal=NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
    }
    
    log_success "IBM Cloud secrets configured"
}

# Configure application with secrets
configure_app() {
    log_info "Configuring application with secrets..."
    
    # Update application to use secrets
    ibmcloud ce application update \
        --name $APP_NAME \
        --env-from-secret nextauth-secret \
        --env NODE_ENV=production \
        --env PORT=3000 \
        --env NEXT_TELEMETRY_DISABLED=1 \
        --env DATABASE_URL="file:./db/prod.db"
    
    log_success "Application configured with secrets"
}

# Verify setup
verify_setup() {
    log_info "Verifying setup..."
    
    # Check application status
    ibmcloud ce application get --name $APP_NAME
    
    # Check secrets
    ibmcloud ce secret list
    
    log_success "Setup verification completed"
}

# Main function
main() {
    log_info "Setting up environment for $APP_NAME"
    log_info "Version: 0.1.0"
    
    # Check if IBM Cloud CLI is installed
    if ! command -v ibmcloud &> /dev/null; then
        log_error "IBM Cloud CLI is not installed"
        exit 1
    fi
    
    # Set target
    ibmcloud ce project select --name $NAMESPACE
    
    # Run setup functions
    setup_environment
    setup_ibm_secrets
    configure_app
    verify_setup
    
    log_success "Environment setup completed!"
    log_info "Next steps:"
    log_info "1. Test the application at the provided URL"
    log_info "2. Set up database migrations if needed"
    log_info "3. Configure monitoring and logging"
    log_info "4. Set up custom domain and SSL"
}

# Run main function
main "$@"