#!/bin/bash

# Deploy script for Google Cloud Run
# Usage: ./deploy.sh [PROJECT_ID]

set -e

# Get project ID from argument or gcloud config
PROJECT_ID=${1:-$(gcloud config get-value project)}

if [ -z "$PROJECT_ID" ]; then
    echo "❌ No project ID provided. Usage: ./deploy.sh [PROJECT_ID]"
    echo "   Or set default project: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "🚀 Deploying to project: $PROJECT_ID"

# Enable required APIs
echo "📋 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Submit build to Cloud Build
echo "🔨 Building and deploying..."
gcloud builds submit --config cloudbuild.yaml --project $PROJECT_ID

# Get the service URL
SERVICE_URL=$(gcloud run services describe scribe-backend --region=us-central1 --project=$PROJECT_ID --format='value(status.url)')

echo "✅ Deployment complete!"
echo "🌐 Service URL: $SERVICE_URL"
echo "🔍 Health check: $SERVICE_URL/api/health"

# Test the deployment
echo "🧪 Testing deployment..."
curl -s "$SERVICE_URL/api/health" | jq . || echo "❌ Health check failed"

echo ""
echo "📝 Next steps:"
echo "1. Update your frontend CORS_ORIGIN to include: $SERVICE_URL"
echo "2. Set environment variables in Cloud Run console:"
echo "   - JWT_SECRET"
echo "   - AZURE_TRANSLATOR_KEY" 
echo "   - AZURE_TRANSLATOR_REGION"
echo "   - CORS_ORIGIN (your frontend domains)"
