# 🚀 Deployment Guide (React + Supabase)

## 1. Push to GitHub

1. Create a new repository on [GitHub](https://github.com/new).
2. Run these commands in this folder:

```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** -> **Project**
3. Import your repository
4. **Environment Variables**:
   Add your Supabase credentials:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
5. Click **Deploy**

## 3. Verify
Once deployed, visit the URL provided by Vercel.

**Note**: Since we reverted the Python backend, this deployment uses your original Supabase backend. All data and authentication will work as before!
