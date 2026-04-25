# Deployment Guide

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (free at vercel.com)
- GitHub account with your project pushed

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/deepfake-platform.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Next.js
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - Add Environment Variables:
     - `NEXT_PUBLIC_API_URL`: Your backend URL (e.g., https://your-backend.herokuapp.com)
   - Click "Deploy"

3. **Update Environment Variables**
   - After deployment, go to project settings
   - Add/update environment variables as needed
   - Redeploy if needed

## Backend Deployment (Heroku)

### Prerequisites
- Heroku account (free at heroku.com)
- Heroku CLI installed

### Steps

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   cd backend
   heroku create neurox-ai-backend
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=mongodb+srv://neurox-admin:password@neurox-ai.zarjcda.mongodb.net/?appName=Neurox-AI
   heroku config:set JWT_SECRET=your-production-secret-key
   heroku config:set JWT_EXPIRE=7d
   heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
   heroku config:set NODE_ENV=production
   ```

5. **Create Procfile**
   Create a file named `Procfile` in the backend directory:
   ```
   web: node server.js
   ```

6. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

7. **Verify Deployment**
   ```bash
   heroku open
   heroku logs --tail
   ```

## Backend Deployment (AWS/Alternative)

### Using Render.com (Free Alternative to Heroku)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: neurox-ai-backend
     - Region: Singapore (or closest)
     - Branch: main
     - Build Command: `npm install`
     - Start Command: `node server.js`
   - Add Environment Variables (same as Heroku)
   - Click "Create Web Service"

## Post-Deployment Checklist

- [ ] Update frontend API URL to point to production backend
- [ ] Test all API endpoints in production
- [ ] Verify MongoDB connection
- [ ] Test file upload functionality
- [ ] Test user authentication
- [ ] Verify security headers are active
- [ ] Test CORS configuration
- [ ] Monitor logs for errors
- [ ] Set up monitoring/alerting

## Environment Variables Reference

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Backend (.env)
```
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MONGODB_URI is correct
   - Verify IP whitelist in MongoDB Atlas
   - Check database user credentials

2. **Build Errors**
   - Ensure all dependencies are in package.json
   - Check Node.js version compatibility
   - Verify build command is correct

3. **CORS Errors**
   - Update FRONTEND_URL in backend
   - Check CORS configuration in server.js
   - Verify allowed origins

4. **File Upload Issues**
   - Check file size limits
   - Verify upload directory exists
   - Check multer configuration
