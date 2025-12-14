# Vercel Deployment Guide

Complete guide to deploy your FanHub Pre-register application to Vercel with JSON storage.

## 🚀 Quick Deployment

### 1. Prepare Your Repository

```bash
# Migrate existing data to new storage format
node migrate-to-json.js from-db

# Commit all changes to Git
git add .
git commit -m "Add storage abstraction and Vercel deployment config"
git push origin main
```

### 2. Deploy to Vercel

**Option A: Deploy via GitHub (Recommended)**

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js - click "Deploy"

**Option B: Deploy via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts - it will auto-detect your Next.js app
```

### 3. Configure Environment Variables

In Vercel Dashboard > Settings > Environment Variables, add:

```env
STORAGE_TYPE=json
RESEND_API_KEY=your_actual_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### 4. Redeploy

After adding environment variables, trigger a new deployment:
- Push a new commit, OR
- Go to Vercel Dashboard > Deployments > Redeploy

## 📋 Environment Variables

### Required for JSON Storage
- `STORAGE_TYPE=json` (forces JSON storage)
- `RESEND_API_KEY` (from Resend.com)
- `RESEND_FROM_EMAIL` (your sending email)

### Optional
- `NEXT_PUBLIC_BASE_URL` (auto-set by Vercel to your domain)

### For Future Database Migration
When you get a custom domain and want to switch to PostgreSQL:
- `STORAGE_TYPE=database`
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`

## 🔄 Data Migration

### Before Deployment
```bash
# Migrate from PostgreSQL to JSON (if you have existing data)
node migrate-to-json.js from-db

# Or prepare existing JSON data
node migrate-to-json.js existing
```

### After Deployment
Your application will automatically:
- Create empty JSON storage if no data exists
- Use existing data in `/data/registrations.json`
- Handle all storage operations via the unified API

## 🎯 Benefits of This Setup

### ✅ Immediate Benefits
- **Zero Database Setup**: No PostgreSQL configuration needed
- **Fast Deployment**: Deploy in under 2 minutes
- **Free Hosting**: Vercel free tier is generous
- **Automatic HTTPS**: SSL certificates included
- **Global CDN**: Fast worldwide performance

### 🔮 Future Migration Path
- **Easy Database Switch**: Change one environment variable
- **Data Preservation**: Migration scripts included
- **Zero Code Changes**: Same API for both storage types

## 🌐 Accessing Your App

After deployment, your app will be available at:
```
https://your-app-name.vercel.app
```

### Test Your Deployment

1. **Visit the homepage**: Check the registration form loads
2. **Test registration**: Try signing up with an email
3. **Check admin endpoint**: Visit `/api/registrations` to see data
4. **Verify storage type**: Should show `"storageType": "json"`

## 📊 Monitoring

### Vercel Dashboard
- **Analytics**: Page views and performance
- **Function Logs**: API endpoint logs
- **Deployments**: History of all deployments

### Application Endpoints
- `/api/registrations` - View all registrations and stats
- `/api/register` - Registration endpoint
- `/api/verify` - Email verification

## 🔧 Troubleshooting

### Common Issues

**Email not sending**
- Check `RESEND_API_KEY` is valid
- Verify `RESEND_FROM_EMAIL` is configured in Resend
- Check Vercel function logs

**Data not persisting**
- Verify `/data` directory exists in your repository
- Check that `registrations.json` is not in `.gitignore`
- Ensure `STORAGE_TYPE=json` is set

**Build failures**
- Check all imports use correct paths
- Verify no database dependencies when using JSON storage
- Review Vercel build logs

### Debug Commands

```bash
# Test storage locally
npm run dev
curl http://localhost:3000/api/registrations

# Check storage type
curl https://your-app.vercel.app/api/registrations | jq '.storageType'

# View Vercel logs
vercel logs your-app-name
```

## 🔄 Switching to Database Later

When you get a custom domain and want to use PostgreSQL:

1. **Set up your database** (Supabase, Neon, Railway, etc.)
2. **Update Vercel environment variables**:
   ```env
   STORAGE_TYPE=database
   DB_HOST=your-database-host
   DB_NAME=scorefluence
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_PORT=5432
   ```
3. **Migrate your JSON data** to the database
4. **Redeploy** - your app will automatically use database storage

## 🎉 Success!

Your FanHub Pre-register application is now:
- ✅ Deployed on Vercel
- ✅ Using JSON file storage
- ✅ Ready for user registrations
- ✅ Easily upgradeable to database storage

Visit your live application and start collecting pre-registrations! 🚀