#!/bin/bash

# Database setup script for Google Cloud SQL
# Usage: ./setup-database.sh [PROJECT_ID] [INSTANCE_NAME] [DATABASE_NAME]

set -e

PROJECT_ID=${1:-$(gcloud config get-value project)}
INSTANCE_NAME=${2:-"scribe-db"}
DATABASE_NAME=${3:-"scribe"}

if [ -z "$PROJECT_ID" ]; then
    echo "❌ No project ID provided. Usage: ./setup-database.sh [PROJECT_ID] [INSTANCE_NAME] [DATABASE_NAME]"
    exit 1
fi

echo "🚀 Setting up Cloud SQL database..."
echo "📋 Project: $PROJECT_ID"
echo "🗄️  Instance: $INSTANCE_NAME"
echo "📊 Database: $DATABASE_NAME"

# Enable required APIs
echo "📋 Enabling required APIs..."
gcloud services enable sqladmin.googleapis.com
gcloud services enable sql-component.googleapis.com

# Create Cloud SQL instance
echo "🗄️  Creating Cloud SQL instance..."
gcloud sql instances create $INSTANCE_NAME \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --root-password=$(openssl rand -base64 32) \
    --storage-type=SSD \
    --storage-size=10GB \
    --backup-start-time=03:00 \
    --enable-bin-log \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=03 \
    --project=$PROJECT_ID

# Create database
echo "📊 Creating database..."
gcloud sql databases create $DATABASE_NAME \
    --instance=$INSTANCE_NAME \
    --project=$PROJECT_ID

# Create application user
echo "👤 Creating application user..."
DB_USER="scribe_user"
DB_PASSWORD=$(openssl rand -base64 32)

gcloud sql users create $DB_USER \
    --instance=$INSTANCE_NAME \
    --password=$DB_PASSWORD \
    --project=$PROJECT_ID

# Get connection details
CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format='value(connectionName)')
PUBLIC_IP=$(gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format='value(ipAddresses[0].ipAddress)')

echo "✅ Database setup complete!"
echo ""
echo "📝 Connection Details:"
echo "   Host: $PUBLIC_IP"
echo "   Port: 5432"
echo "   Database: $DATABASE_NAME"
echo "   User: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo "   Connection Name: $CONNECTION_NAME"
echo ""
echo "🔧 Environment Variables for Cloud Run:"
echo "   DB_TYPE=postgres"
echo "   DB_HOST=$PUBLIC_IP"
echo "   DB_PORT=5432"
echo "   DB_NAME=$DATABASE_NAME"
echo "   DB_USER=$DB_USER"
echo "   DB_PASSWORD=$DB_PASSWORD"
echo "   DB_SSL=true"
echo ""
echo "🔒 Security Note:"
echo "   - Store the password in Google Secret Manager"
echo "   - Configure authorized networks for production"
echo "   - Enable SSL connections only"
