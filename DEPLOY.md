# 🚀 Deploy Quest Board with Shared AI to Vercel

## IMPORTANT: Choose Your AI Setup

### Option A: Shared AI Key (Default) — Site Owner Pays
All users use YOUR API key automatically. No setup needed for visitors.

### Option B: Individual API Keys — Each User Brings Their Own
Users enter their own API key in Settings → AI tab.

---

## Step 1: Get a Free Google Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

**Free limits**: 1,500 requests/day, 15 requests/minute

---

## Step 2: Create a GitHub Repository

1. Go to https://github.com/new
2. Name it `quest-board`
3. Make it **Public** or **Private**
4. **Do NOT** initialize with README (we already have one)
5. Click **Create repository**

---

## Step 3: Push Your Code to GitHub

Run these commands in your project folder:

```bash
cd "c:/Users/iris.bai/OneDrive - University Of Houston/Gamify"

# Check if GitHub repo exists (replace with your username)
git remote add origin https://github.com/YOUR_USERNAME/quest-board.git

# If you get "fatal: remote origin already exists", that's fine
git add .
git commit -m "Update: Server proxy for shared AI key"
git push -u origin main
```

---

## Step 4: Deploy to Vercel

1. Go to https://vercel.com and sign up with GitHub
2. Click **"Add New Project"**
3. Select your `quest-board` repository
4. **Framework Preset**: Select `Other` (static HTML)
5. **Root Directory**: `./`
6. Click **Deploy**

---

## Step 5: Add Environment Variable (CRITICAL for Shared AI)

After deploying, you MUST add your API key as a secret environment variable:

1. In Vercel dashboard, go to your project
2. Click **Settings** tab → **Environment Variables**
3. Add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key from Step 1
4. Click **Save**
5. **Redeploy**: Go to Deployments → click the 3 dots on latest → **Redeploy**

---

## Step 6: Enable AI on Your Live Site

1. Open your Vercel URL
2. Click **Customize** (⚙️) in sidebar
3. Click the **AI** tab (🤖)
4. Toggle **"Enable AI-powered suggestions"** ON
5. Select **"Server (Shared)"** as provider
6. No API key needed — it uses your server key!
7. Click **Suggestions** (💡) to test

---

## How It Works

| Feature | Individual Keys | Shared Key (Server) |
|---------|----------------|---------------------|
| Who pays? | Each user | You (site owner) |
| User setup? | Enter own API key | None needed |
| Key security | User's browser | Hidden on server |
| Provider options | Gemini, OpenAI, Chrome | Gemini only |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Server configuration error" | Add `GEMINI_API_KEY` env var in Vercel Settings |
| AI not working after enabling | Redeploy after adding env var |
| Rate limited (429) | Gemini free = 15 req/min; wait or upgrade |
| Suggestions empty | Add and complete some quests first so AI has data |

---

## Switching to OpenAI (Optional)

If you prefer OpenAI over Gemini:

1. Add `OPENAI_API_KEY` as env var in Vercel
2. Modify `api/gemini.js` to call `/api/openai` instead
3. Or switch provider to "OpenAI" in Settings and enter your key
