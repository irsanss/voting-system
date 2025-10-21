#!/bin/bash

# IBM Cloud Build Script for Voting System
set -e

echo "🏗️  Building Voting System for IBM Cloud Code Engine..."

# Configuration
IMAGE_NAME="voting-system"
REGISTRY_URL="us.icr.io"
NAMESPACE="your-namespace"  # Replace with your IBM Cloud namespace
VERSION=${1:-latest}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  Image: ${IMAGE_NAME}"
echo "  Registry: ${REGISTRY_URL}"
echo "  Namespace: ${NAMESPACE}"
echo "  Version: ${VERSION}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker.${NC}"
    exit 1
fi

# Build the Docker image
echo -e "${GREEN}🐳 Building Docker image...${NC}"
docker build -t ${IMAGE_NAME}:${VERSION} .

# Tag the image for IBM Cloud Registry
echo -e "${GREEN}🏷️  Tagging image for IBM Cloud Registry...${NC}"
docker tag ${IMAGE_NAME}:${VERSION} ${REGISTRY_URL}/${NAMESPACE}/${IMAGE_NAME}:${VERSION}

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "  1. Login to IBM Cloud Registry: ibmcloud cr login"
echo "  2. Push the image: docker push ${REGISTRY_URL}/${NAMESPACE}/${IMAGE_NAME}:${VERSION}"
echo "  3. Deploy to Code Engine: ./scripts/deploy.sh ${VERSION}"