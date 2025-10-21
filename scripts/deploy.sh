#!/bin/bash

# IBM Cloud Code Engine Deployment Script
set -e

echo "🚀 Deploying Voting System to IBM Cloud Code Engine..."

# Configuration
IMAGE_NAME="voting-system"
REGISTRY_URL="us.icr.io"
NAMESPACE="your-namespace"  # Replace with your IBM Cloud namespace
PROJECT_NAME="voting-project"
VERSION=${1:-latest}
REGION="us-south"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  Image: ${IMAGE_NAME}:${VERSION}"
echo "  Registry: ${REGISTRY_URL}"
echo "  Namespace: ${NAMESPACE}"
echo "  Project: ${PROJECT_NAME}"
echo "  Region: ${REGION}"

# Check if IBM Cloud CLI is installed
if ! command -v ibmcloud &> /dev/null; then
    echo -e "${RED}❌ IBM Cloud CLI is not installed. Please install it first.${NC}"
    echo "   Visit: https://cloud.ibm.com/docs/cli?topic=cli-install-ibmcloud-cli"
    exit 1
fi

# Login to IBM Cloud
echo -e "${BLUE}🔐 Logging into IBM Cloud...${NC}"
ibmcloud login --region ${REGION}

# Target the correct region
ibmcloud target -r ${REGION}

# Login to Container Registry
echo -e "${BLUE}🏷️  Logging into Container Registry...${NC}"
ibmcloud cr login

# Check if namespace exists, create if not
if ! ibmcloud cr namespace-get ${NAMESPACE} &> /dev/null; then
    echo -e "${YELLOW}📝 Creating namespace: ${NAMESPACE}${NC}"
    ibmcloud cr namespace-add ${NAMESPACE}
fi

# Push the image
echo -e "${GREEN}📤 Pushing image to registry...${NC}"
docker push ${REGISTRY_URL}/${NAMESPACE}/${IMAGE_NAME}:${VERSION}

# Create or get Code Engine project
echo -e "${BLUE}📂 Setting up Code Engine project...${NC}"
if ! ibmcloud ce project get -n ${PROJECT_NAME} &> /dev/null; then
    echo -e "${YELLOW}📝 Creating Code Engine project: ${PROJECT_NAME}${NC}"
    ibmcloud ce project create -n ${PROJECT_NAME}
fi

ibmcloud ce project select -n ${PROJECT_NAME}

# Create secrets
echo -e "${BLUE}🔐 Creating secrets...${NC}"

# Create app secrets
if ! ibmcloud ce secret get -n voting-secrets &> /dev/null; then
    echo -e "${YELLOW}📝 Creating voting-secrets...${NC}"
    ibmcloud ce secret create \
        --name voting-secrets \
        --from-literal=encryption-key=$(openssl rand -hex 32) \
        --from-literal=session-secret=$(openssl rand -hex 32) \
        --from-literal=csrf-secret=$(openssl rand -hex 32)
fi

# Note: COS secrets need to be created manually with actual credentials
echo -e "${YELLOW}⚠️  Please create cos-credentials secret manually with your COS credentials:${NC}"
echo "   ibmcloud ce secret create \\"
echo "     --name cos-credentials \\"
echo "     --from-literal=endpoint=YOUR_COS_ENDPOINT \\"
echo "     --from-literal=access-key-id=YOUR_ACCESS_KEY \\"
echo "     --from-literal=secret-access-key=YOUR_SECRET_KEY \\"
echo "     --from-literal=region=us-south \\"
echo "     --from-literal=bucket-name=YOUR_BUCKET_NAME"

# Deploy the application
echo -e "${GREEN}🚀 Deploying application to Code Engine...${NC}"
ibmcloud ce application create \
    --name voting-system \
    --image ${REGISTRY_URL}/${NAMESPACE}/${IMAGE_NAME}:${VERSION} \
    --port 3000 \
    --min-scale 1 \
    --max-scale 3 \
    --cpu 0.25 \
    --memory 512Mi \
    --env-from-secret voting-secrets \
    --env-from-secret cos-credentials

# Get the application URL
echo -e "${BLUE}🌐 Getting application URL...${NC}"
APP_URL=$(ibmcloud ce application get -n voting-system -o json | jq -r '.status.url')

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}📱 Application URL: ${APP_URL}${NC}"
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "  1. Update your DNS to point to ${APP_URL}"
echo "  2. Configure SSL certificate if needed"
echo "  3. Test the application at ${APP_URL}"
echo "  4. Set up monitoring and alerts"

# Show application status
echo -e "${BLUE}📊 Application status:${NC}"
ibmcloud ce application get -n voting-system