# Cloud Build Troubleshooting Guide

## Common Cloud Build Errors

### ERROR: build step 2 "gcr.io/google.com/cloudsdktool/cloud-sdk" failed

This error typically occurs during the Cloud Run deployment step. Here are the most common causes and solutions:

#### 1. IAM Permissions Issue
**Problem**: Cloud Build service account doesn't have permission to deploy to Cloud Run.

**Solution**:
```bash
# Grant Cloud Build service account the Cloud Run Admin role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:YOUR_PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
    --role="roles/run.admin"

# Grant Cloud Build service account the Service Account User role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:YOUR_PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"
```

#### 2. Container Registry Permissions
**Problem**: Cloud Build can't push to Container Registry.

**Solution**:
```bash
# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com

# Grant Storage Admin role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:YOUR_PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
    --role="roles/storage.admin"
```

#### 3. Cloud Run API Not Enabled
**Problem**: Cloud Run API is not enabled for the project.

**Solution**:
```bash
# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

#### 4. Resource Quotas Exceeded
**Problem**: Project has exceeded Cloud Run resource quotas.

**Solution**:
- Check quotas in Google Cloud Console
- Request quota increases if needed
- Reduce memory/CPU requirements in cloudbuild.yaml

#### 5. Invalid Environment Variables
**Problem**: Required environment variables are not set.

**Solution**:
- Set environment variables in Cloud Run console
- Or add them to cloudbuild.yaml with `--set-env-vars`

## Debugging Steps

### 1. Use Debug Cloud Build Configuration
```bash
# Use the debug configuration to get more detailed logs
gcloud builds submit --config cloudbuild-debug.yaml
```

### 2. Check Build Logs
```bash
# List recent builds
gcloud builds list --limit=5

# Get detailed logs for a specific build
gcloud builds log BUILD_ID
```

### 3. Test Docker Build Locally
```bash
# Build the Docker image locally to test
docker build -t scribe-backend-test .

# Run the container locally
docker run -p 3001:3001 scribe-backend-test
```

### 4. Check Service Status
```bash
# List Cloud Run services
gcloud run services list --region=us-central1

# Get service details
gcloud run services describe scribe-backend --region=us-central1
```

## Environment Variables Required

Make sure these environment variables are set in Cloud Run:

### Required
- `NODE_ENV=prod`
- `JWT_SECRET` - Your JWT secret key
- `AZURE_TRANSLATOR_KEY` - Azure Translator API key
- `AZURE_TRANSLATOR_REGION` - Azure Translator region

### Database (if using PostgreSQL)
- `DB_TYPE=postgres`
- `DB_HOST` - Your Cloud SQL instance IP
- `DB_PORT=5432`
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_SSL=true`

### CORS
- `CORS_ORIGIN` - Comma-separated list of allowed origins

## Manual Deployment

If Cloud Build continues to fail, you can deploy manually:

### 1. Build and Push Image
```bash
# Build the image
docker build -t gcr.io/YOUR_PROJECT_ID/scribe-backend .

# Push to Container Registry
docker push gcr.io/YOUR_PROJECT_ID/scribe-backend
```

### 2. Deploy to Cloud Run
```bash
gcloud run deploy scribe-backend \
    --image gcr.io/YOUR_PROJECT_ID/scribe-backend \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --port 3001 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --set-env-vars NODE_ENV=prod
```

## Getting Help

If you're still having issues:

1. Check the Cloud Build logs in the Google Cloud Console
2. Verify all required APIs are enabled
3. Ensure IAM permissions are correctly set
4. Test the Docker build locally first
5. Check that all environment variables are set correctly
