# Smart Agriculture Management System - Vercel Deployment Guide

This document provides step-by-step instructions to deploy both the **React Frontend** and the **Serverless API Backend** to **Vercel** with a live, persistent database.

---

## 1. Prerequisites & Environment Variables

You need to establish three environment variables. These must be set inside your **Vercel Project Dashboard** (or in a `.env` file for local testing):

| Variable Name | Description | Example / Recommendations |
| :--- | :--- | :--- |
| `MONGODB_URI` | Connection string to your MongoDB Atlas cluster | `mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/smart-agriculture` |
| `JWT_SECRET` | Secret key used to encrypt and verify JWT Auth tokens | A secure random string (e.g., `8f49e49a1d43a7587...`) |
| `GEMINI_API_KEY` | Google AI Studio Gemini API Key | Secure secret from your Google AI Studio Account |

---

## 2. Step-by-Step Vercel Deployment

There are two primary methods to deploy your application to Vercel:

### Method A: Deploying with the Vercel CLI

If you have the node package manager and Vercel CLI installed on your machine:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Trigger Deployment**:
   Run the following command at the root of this project:
   ```bash
   vercel
   ```
   *Follow the command-line prompts to configure a new project.*

4. **Assign Environment Variables**:
   Go to your project on the **Vercel Web Dashboard**, navigate to **Settings** > **Environment Variables**, and add the three variables listed in Section 1.

5. **Commit & Redeploy**:
   Apply variables by executing a production build:
   ```bash
   vercel --prod
   ```

---

### Method B: Deploying with GitHub Integration (Recommended)

1. **Upload Code to GitHub**:
   Initialize git, commit, and push this workspace to your private or public GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Smart Agriculture System"
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

2. **Import Project to Vercel**:
   - Log in to your [Vercel Dashboard](https://vercel.com).
   - Click **Add New...** > **Project**.
   - Select your newly pushed GitHub repository.

3. **Configure Project Settings**:
   - **Framework Preset**: Detects **Vite** automatically.
   - **Root Directory**: `./` (default).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: Expand this section and submit:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `GEMINI_API_KEY`

4. **Deploy**:
   Click **Deploy**. Vercel will compile the React single-page app into static assets, stand up each of the Node.js Serverless Functions in the `api/` directory, and wire up custom path routing specified in `vercel.json`.

---

## 3. Database Initializer (Seeding)

The system is configured with self-bootstrapping intelligence. On the very first database query made via the Vercel Serverless api, the `db-client.js` module automatically:
- Checks if the MongoDB structure exists.
- If empty, creates the standard collection schemas.
- Injects initial market crops, weather advisories, demo farms, crops, financial transactions, and a default admin credential so you can try out the system immediately.

### Default Seeding Account Credentials:
- **Default Email**: `admin@farm.com`
- **Default Password**: `admin123`
- **Default Role**: Admin (can access general and admin dashboards)

---

## 4. Local Testing & Verification

You can test both Vercel Serverless Functions and the React app locally using the Vercel development command:
```bash
vercel dev
```
This runs a local emulation of Vercel routes and serverless handlers on port `3000` alongside Vite Hot Module Replacement.
