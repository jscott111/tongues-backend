#!/bin/bash

# Script to check and fix common Cloud Build permission issues

echo "🔍 Checking Cloud Build permissions..."

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No project ID found. Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Project ID: $PROJECT_ID"

# Get project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
echo "📋 Project Number: $PROJECT_NUMBER"

# Check if required APIs are enabled
echo ""
echo "🔌 Checking required APIs..."

APIS=("run.googleapis.com" "cloudbuild.googleapis.com" "containerregistry.googleapis.com")
for api in "${APIS[@]}"; do
    if gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
        echo "✅ $api is enabled"
    else
        echo "❌ $api is not enabled"
        echo "   Enabling $api..."
        gcloud services enable $api
    fi
done

# Check IAM permissions
echo ""
echo "🔐 Checking IAM permissions..."

CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Check Cloud Run Admin role
if gcloud projects get-iam-policy $PROJECT_ID --flatten="bindings[].members" --format="value(bindings.role)" --filter="bindings.members:$CLOUD_BUILD_SA" | grep -q "roles/run.admin"; then
    echo "✅ Cloud Build has Cloud Run Admin role"
else
    echo "❌ Cloud Build missing Cloud Run Admin role"
    echo "   Granting Cloud Run Admin role..."
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$CLOUD_BUILD_SA" \
        --role="roles/run.admin"
fi

# Check Service Account User role
if gcloud projects get-iam-policy $PROJECT_ID --flatten="bindings[].members" --format="value(bindings.role)" --filter="bindings.members:$CLOUD_BUILD_SA" | grep -q "roles/iam.serviceAccountUser"; then
    echo "✅ Cloud Build has Service Account User role"
else
    echo "❌ Cloud Build missing Service Account User role"
    echo "   Granting Service Account User role..."
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$CLOUD_BUILD_SA" \
        --role="roles/iam.serviceAccountUser"
fi

# Check Storage Admin role
if gcloud projects get-iam-policy $PROJECT_ID --flatten="bindings[].members" --format="value(bindings.role)" --filter="bindings.members:$CLOUD_BUILD_SA" | grep -q "roles/storage.admin"; then
    echo "✅ Cloud Build has Storage Admin role"
else
    echo "❌ Cloud Build missing Storage Admin role"
    echo "   Granting Storage Admin role..."
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$CLOUD_BUILD_SA" \
        --role="roles/storage.admin"
fi

echo ""
echo "✅ Permission check complete!"
echo ""
echo "🚀 You can now try deploying again:"
echo "   gcloud builds submit --config cloudbuild.yaml"
echo ""
echo "🔍 Or use the debug configuration for more details:"
echo "   gcloud builds submit --config cloudbuild-debug.yaml"
