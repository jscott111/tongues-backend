# Google Cloud Run Deployment

This guide explains how to deploy the Scribe backend to Google Cloud Run.

## Prerequisites

1. **Google Cloud SDK** installed and configured
2. **Docker** installed locally
3. **Google Cloud Project** with billing enabled

## Quick Deployment

```bash
# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Run the deployment script
./deploy.sh
```

## Manual Deployment

### 1. Enable Required APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Build and Deploy

```bash
gcloud builds submit --config cloudbuild.yaml
```

### 3. Set Environment Variables

In the Google Cloud Console:

1. Go to **Cloud Run** → **scribe-backend**
2. Click **Edit & Deploy New Revision**
3. Go to **Variables & Secrets** tab
4. Add these environment variables:

```
NODE_ENV=prod
JWT_SECRET=your-super-secret-jwt-key-here
AZURE_TRANSLATOR_KEY=your-azure-translator-key
AZURE_TRANSLATOR_REGION=your-azure-region
CORS_ORIGIN=https://your-frontend-domain.com,https://your-translation-domain.com
```

## Configuration

### Cloud Build (cloudbuild.yaml)

- **Image**: Built from Dockerfile
- **Region**: us-central1
- **Memory**: 512Mi
- **CPU**: 1
- **Max Instances**: 10
- **Port**: 3001
- **Public Access**: Enabled (for TranslationApp)

### Dockerfile

- **Base**: Node.js 18 Alpine
- **Security**: Non-root user
- **Health Check**: Built-in endpoint
- **Database**: SQLite (persistent storage)

## Security Considerations

1. **CORS**: Configured to only allow your frontend domains
2. **Authentication**: JWT tokens required for InputApp
3. **Session-based**: TranslationApp uses session IDs only
4. **Environment Variables**: Sensitive data stored as secrets

## Monitoring

- **Health Check**: `GET /api/health`
- **Logs**: Available in Cloud Logging
- **Metrics**: Available in Cloud Monitoring

## Troubleshooting

### Common Issues

1. **CORS Errors**: Update CORS_ORIGIN environment variable
2. **Database Issues**: SQLite file is ephemeral, consider Cloud SQL for production
3. **Memory Issues**: Increase memory allocation in Cloud Run settings

### Logs

```bash
# View logs
gcloud logs read --service=scribe-backend --limit=50
```

## Production Recommendations

1. **Database**: Migrate to Cloud SQL (PostgreSQL)
2. **Secrets**: Use Secret Manager for sensitive data
3. **Monitoring**: Set up alerts and dashboards
4. **Scaling**: Configure auto-scaling based on traffic
5. **CDN**: Use Cloud CDN for static assets
