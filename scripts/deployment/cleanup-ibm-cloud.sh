#!/bin/bash

# IBM Cloud Cleanup Script
# Version: 0.1.0
# Description: Clean up IBM Cloud Code Engine resources

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
IMAGE_NAME="voting-system"

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

# Confirm cleanup
confirm_cleanup() {
    echo -e "${YELLOW}WARNING: This will delete all resources for $APP_NAME${NC}"
    echo -e "${YELLOW}This includes the application, secrets, and container images${NC}"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cleanup cancelled"
        exit 0
    fi
}

# Delete application
delete_application() {
    log_info "Deleting application: $APP_NAME"
    ibmcloud ce application delete --name $APP_NAME --force || {
        log_warning "Application not found or already deleted"
    }
    log_success "Application deleted"
}

# Delete secrets
delete_secrets() {
    log_info "Deleting secrets..."
    ibmcloud ce secret delete --name nextauth-secret --force || {
        log_warning "Secret not found or already deleted"
    }
    log_success "Secrets deleted"
}

# Delete container images
delete_images() {
    log_info "Deleting container images..."
    
    # Get registry URL
    REGISTRY_URL=$(ibmcloud cr region | grep "Container Registry" | awk '{print $3}')
    FULL_IMAGE_NAME="$REGISTRY_URL/$NAMESPACE/$IMAGE_NAME"
    
    # Delete all tags
    ibmcloud cr image-rm "$FULL_IMAGE_NAME:latest" || {
        log_warning "Image not found or already deleted"
    }
    
    log_success "Container images deleted"
}

# Delete namespace (optional)
delete_namespace() {
    read -p "Do you want to delete the entire namespace '$NAMESPACE'? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deleting namespace: $NAMESPACE"
        ibmcloud ce project delete --name $NAMESPACE --force || {
            log_warning "Namespace not found or already deleted"
        }
        log_success "Namespace deleted"
    else
        log_info "Namespace preserved"
    fi
}

# Main cleanup function
main() {
    log_info "Starting cleanup for $APP_NAME"
    log_info "Version: 0.1.0"
    
    # Check if IBM Cloud CLI is installed
    if ! command -v ibmcloud &> /dev/null; then
        log_error "IBM Cloud CLI is not installed"
        exit 1
    fi
    
    # Confirm cleanup
    confirm_cleanup
    
    # Set target
    ibmcloud ce project select --name $NAMESPACE || {
        log_warning "Namespace not found, skipping some cleanup steps"
    }
    
    # Run cleanup functions
    delete_application
    delete_secrets
    delete_images
    delete_namespace
    
    log_success "Cleanup completed!"
    log_info "All resources for $APP_NAME have been deleted"
}

# Run main function
main "$@"