# Database Deployment Guide

This guide explains how to set up and deploy your database to Google Cloud SQL.

## Database Options

### 1. Cloud SQL PostgreSQL (Recommended)
- ✅ **Fully managed** PostgreSQL
- ✅ **Automatic backups** and point-in-time recovery
- ✅ **High availability** with read replicas
- ✅ **Automatic scaling** and performance optimization
- ✅ **Security** with encryption at rest and in transit

### 2. Cloud SQL MySQL
- ✅ **Fully managed** MySQL
- ✅ **Similar features** to PostgreSQL
- ❌ **Less optimal** for your current schema

### 3. Firestore (NoSQL)
- ✅ **Serverless** and auto-scaling
- ❌ **Requires code changes** (different data model)
- ❌ **More expensive** for simple queries

## Quick Setup

```bash
# Set up Cloud SQL database
cd scribe-backend
./setup-database.sh YOUR_PROJECT_ID scribe-db scribe
```

## Manual Setup

### 1. Create Cloud SQL Instance

```bash
# Enable APIs
gcloud services enable sqladmin.googleapis.com

# Create instance
gcloud sql instances create scribe-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --root-password=YOUR_ROOT_PASSWORD
```

### 2. Create Database and User

```bash
# Create database
gcloud sql databases create scribe --instance=scribe-db

# Create application user
gcloud sql users create scribe_user \
    --instance=scribe-db \
    --password=YOUR_APP_PASSWORD
```

### 3. Configure Authorized Networks

```bash
# Add your IP for testing
gcloud sql instances patch scribe-db \
    --authorized-networks=YOUR_IP_ADDRESS/32

# For production, use Cloud SQL Proxy or VPC
```

## Environment Variables

Set these in your Cloud Run service:

```bash
DB_TYPE=postgres
DB_HOST=YOUR_DB_IP
DB_PORT=5432
DB_NAME=scribe
DB_USER=scribe_user
DB_PASSWORD=YOUR_APP_PASSWORD
DB_SSL=true
```

## Migration from SQLite

### 1. Export Data from SQLite

```bash
# Export users
sqlite3 data/scribe-dev.db ".dump users" > users_export.sql

# Export sessions
sqlite3 data/scribe-dev.db ".dump sessions" > sessions_export.sql
```

### 2. Import to PostgreSQL

```bash
# Connect to Cloud SQL
gcloud sql connect scribe-db --user=postgres --database=scribe

# Run the migration files
\i migrations/001_create_users_table.sql
\i migrations/002_create_sessions_table.sql
```

## Security Best Practices

### 1. Use Secret Manager

```bash
# Store database password
gcloud secrets create db-password --data-file=password.txt

# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding db-password \
    --member="serviceAccount:YOUR_SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"
```

### 2. Configure SSL

- ✅ **SSL required** for all connections
- ✅ **Certificate validation** enabled
- ✅ **Encrypted connections** only

### 3. Network Security

- ✅ **Authorized networks** configured
- ✅ **Private IP** for production
- ✅ **VPC peering** for internal access

## Monitoring and Maintenance

### 1. Monitoring

```bash
# View database metrics
gcloud sql instances describe scribe-db

# Check connection count
gcloud sql instances describe scribe-db --format='value(settings.ipConfiguration.authorizedNetworks)'
```

### 2. Backups

- ✅ **Automatic daily backups** enabled
- ✅ **Point-in-time recovery** available
- ✅ **Backup retention** configured

### 3. Maintenance

- ✅ **Automatic updates** enabled
- ✅ **Maintenance windows** configured
- ✅ **High availability** for production

## Cost Optimization

### Cloud SQL Pricing

- **Instance**: ~$7-15/month (db-f1-micro)
- **Storage**: $0.17/GB/month
- **Backups**: $0.08/GB/month
- **Network**: $0.12/GB (egress)

### Optimization Tips

1. **Right-size instance** - Start with db-f1-micro
2. **Optimize storage** - Use SSD for better performance
3. **Enable auto-scaling** - Scale based on CPU/memory
4. **Use read replicas** - For read-heavy workloads

## Troubleshooting

### Common Issues

1. **Connection refused** - Check authorized networks
2. **SSL errors** - Verify SSL configuration
3. **Authentication failed** - Check user credentials
4. **Database not found** - Verify database name

### Debug Commands

```bash
# Test connection
gcloud sql connect scribe-db --user=scribe_user --database=scribe

# Check instance status
gcloud sql instances describe scribe-db

# View logs
gcloud sql operations list --instance=scribe-db
```

## Production Checklist

- [ ] Cloud SQL instance created
- [ ] Database and user created
- [ ] SSL enabled and configured
- [ ] Authorized networks configured
- [ ] Environment variables set in Cloud Run
- [ ] Backup strategy configured
- [ ] Monitoring set up
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Disaster recovery plan in place

## Migration Script

```bash
#!/bin/bash
# Complete migration script

# 1. Set up database
./setup-database.sh YOUR_PROJECT_ID

# 2. Update Cloud Run with new environment variables
gcloud run services update scribe-backend \
    --set-env-vars="DB_TYPE=postgres,DB_HOST=YOUR_DB_IP,DB_PORT=5432,DB_NAME=scribe,DB_USER=scribe_user,DB_PASSWORD=YOUR_PASSWORD,DB_SSL=true"

# 3. Test the migration
curl https://your-backend-url.run.app/api/health
```
