# Deploy to GitHub Pages

Your repo is ready to push. Follow these steps:

## Step 1: Push to GitHub

### Option A: Using Cursor (easiest)
1. Open **Source Control** (Ctrl+Shift+G) or click the branch icon in the left sidebar
2. Click **Publish Branch** or **Publish to GitHub**
3. If prompted, choose:
   - **Repository name:** `ODB` (or `odbread-website`)
   - **Visibility:** Private or Public
4. Cursor will create the repo and push your `main` branch

### Option B: Using GitHub website
1. Go to [github.com/new](https://github.com/new)
2. Create a new repository:
   - **Name:** `ODB` or `odbread-website`
   - **Visibility:** Public (required for free GitHub Pages)
   - **Do NOT** initialize with README (you already have one)
3. After creating, copy the repo URL (e.g. `https://github.com/YOUR_USERNAME/ODB.git`)
4. In terminal, run:
   ```powershell
   cd c:\Users\petew\Source\ODB
   git remote add origin https://github.com/YOUR_USERNAME/ODB.git
   git push -u origin main
   ```

## Step 2: Enable GitHub Pages

1. Go to your repo on GitHub (e.g. `https://github.com/YOUR_USERNAME/ODB`)
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Build and deployment**:
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `/(root)`
4. Click **Save**

## Step 3: Wait and visit

- Your site will be live at: `https://YOUR_USERNAME.github.io/ODB/`
- First deploy can take 1–2 minutes

## Step 4: Add odbread.com (optional)

1. In repo **Settings** → **Pages** → **Custom domain**
2. Enter `odbread.com`
3. At your domain registrar, add a CNAME record: `odbread.com` → `YOUR_USERNAME.github.io`
