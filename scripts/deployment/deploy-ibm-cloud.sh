#!/bin/bash

# IBM Cloud Code Engine Deployment Script
# Version: 0.1.0
# Description: Deploy voting system to IBM Cloud Code Engine

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="voting-system"
IMAGE_NAME="voting-system"
REGION="us-south"
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

# Check if IBM Cloud CLI is installed
check_ibm_cli() {
    if ! command -v ibmcloud &> /dev/null; then
        log_error "IBM Cloud CLI is not installed. Please install it first."
        echo "Visit: https://cloud.ibm.com/docs/cli?topic=cli-getting-started"
        exit 1
    fi
    log_success "IBM Cloud CLI found"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install it first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    log_success "Docker found"
}

# Login to IBM Cloud
ibm_login() {
    log_info "Logging into IBM Cloud..."
    ibmcloud login --region $REGION
    log_success "Logged into IBM Cloud"
}

# Set target to Code Engine
set_code_engine_target() {
    log_info "Setting target to Code Engine..."
    ibmcloud ce project select --name $NAMESPACE || {
        log_info "Creating new namespace: $NAMESPACE"
        ibmcloud ce project create --name $NAMESPACE
        ibmcloud ce project select --name $NAMESPACE
    }
    log_success "Code Engine target set"
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."
    docker build -t $IMAGE_NAME:latest .
    log_success "Docker image built"
}

# Tag and push to IBM Cloud Container Registry
push_to_registry() {
    log_info "Pushing to IBM Cloud Container Registry..."
    
    # Get registry URL
    REGISTRY_URL=$(ibmcloud cr region | grep "Container Registry" | awk '{print $3}')
    FULL_IMAGE_NAME="$REGISTRY_URL/$NAMESPACE/$IMAGE_NAME:latest"
    
    # Tag image
    docker tag $IMAGE_NAME:latest $FULL_IMAGE_NAME
    
    # Push image
    docker push $FULL_IMAGE_NAME
    
    log_success "Image pushed to registry: $FULL_IMAGE_NAME"
    echo $FULL_IMAGE_NAME > .image_name
}

# Deploy to Code Engine
deploy_to_code_engine() {
    log_info "Deploying to Code Engine..."
    
    FULL_IMAGE_NAME=$(cat .image_name)
    
    # Create or update application
    ibmcloud ce application create \
        --name $APP_NAME \
        --image $FULL_IMAGE_NAME \
        --port 3000 \
        --memory 1Gi \
        --cpu 0.5 \
        --min-scale 1 \
        --max-scale 3 \
        --env NODE_ENV=production \
        --env PORT=3000 \
        --env NEXT_TELEMETRY_DISABLED=1 || {
        log_info "Application exists, updating..."
        ibmcloud ce application update \
            --name $APP_NAME \
            --image $FULL_IMAGE_NAME
    }
    
    log_success "Application deployed"
}

# Get application URL
get_app_url() {
    log_info "Getting application URL..."
    APP_URL=$(ibmcloud ce application get --name $APP_NAME --output json | jq -r '.status.url')
    log_success "Application deployed at: $APP_URL"
    
    # Health check
    log_info "Performing health check..."
    sleep 10
    if curl -f "$APP_URL/api/health" > /dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_warning "Health check failed, but deployment may still be starting"
    fi
}

# Cleanup
cleanup() {
    log_info "Cleaning up..."
    rm -f .image_name
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    log_info "Starting deployment of $APP_NAME to IBM Cloud Code Engine"
    log_info "Version: 0.1.0"
    
    check_ibm_cli
    check_docker
    ibm_login
    set_code_engine_target
    build_image
    push_to_registry
    deploy_to_code_engine
    get_app_url
    cleanup
    
    log_success "Deployment completed successfully!"
    log_info "Next steps:"
    log_info "1. Configure environment variables in IBM Cloud Code Engine"
    log_info "2. Set up database connection"
    log_info "3. Configure custom domain (optional)"
    log_info "4. Set up monitoring and alerts"
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@"