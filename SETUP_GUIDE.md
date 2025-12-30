# Studly - AI Study Assistant

## 🎯 Quick Setup Guide

Follow these steps to get Studly running and ready for production.

---

## 📋 Prerequisites

1. **Node.js 18+** installed
2. **Supabase account** (free tier works)
3. **Stripe account** (test mode for development)
4. **AssemblyAI account** (for transcription)
5. **Google AI Studio account** (for Gemini API)

---

## 🔧 Step 1: Supabase Setup

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon key** from Settings > API

### 1.2 Run Database Schema
1. Go to SQL Editor in Supabase Dashboard
2. Copy the contents of `supabase-schema.sql` and run it
3. This creates all necessary tables with Row Level Security

### 1.3 Create Storage Bucket
1. Go to Storage in Supabase Dashboard
2. Create a new bucket called `recordings`
3. Make it **public** (so AssemblyAI can access audio files)
4. Add these policies:
   - **INSERT**: Allow authenticated users to upload to `user_id/*`
   - **SELECT**: Allow public access (for AI processing)

### 1.4 Get Service Role Key
1. Go to Settings > API
2. Copy the **service_role** key (keep this secret!)

---

## 💳 Step 2: Stripe Setup

### 2.1 Create Products
1. Go to Stripe Dashboard > Products
2. Create 3 products with monthly prices:
   - **Basic**: €19.99/month
   - **Pro**: €29.99/month  
   - **Elite**: €39.99/month
3. Copy each **Price ID** (starts with `price_`)

### 2.2 Configure Webhook
1. Go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe-webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **Webhook signing secret** (starts with `whsec_`)

### 2.3 For Local Testing
Use Stripe CLI:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Copy the webhook secret it shows you
```

---

## 🤖 Step 3: AI Services Setup

### 3.1 AssemblyAI
1. Go to [assemblyai.com](https://assemblyai.com)
2. Sign up and get your API key from the dashboard
3. Free tier includes 100 hours/month

### 3.2 Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Create an API key
3. Free tier includes 60 requests/minute

---

## 📝 Step 4: Environment Variables

Create `.env.local` in your project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_ELITE=price_...

# AI Services
ASSEMBLYAI_API_KEY=...
GEMINI_API_KEY=...

# App URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🚀 Step 5: Run Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## ✅ Step 6: Test the Full Flow

### Test Stripe Payments
1. Create an account at `/auth`
2. Choose a plan at `/pricing`
3. Use test card: `4242 4242 4242 4242`
4. Any future expiry, any CVC
5. You should be redirected to `/dashboard`

### Test Recording & AI
1. Go to `/record`
2. Click the microphone to start recording
3. Speak for 30 seconds (test lecture)
4. Stop recording
5. Wait for processing (1-3 minutes)
6. View your notes at `/notes`

---

## 🌐 Step 7: Deploy to Vercel

### 7.1 Push to GitHub
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

### 7.2 Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add ALL environment variables
4. Deploy!

### 7.3 Update URLs
1. Update `NEXT_PUBLIC_SITE_URL` to your Vercel domain
2. Update Stripe webhook URL to production domain
3. Redeploy

### 7.4 Switch Stripe to Live Mode
1. In Stripe Dashboard, switch to Live mode
2. Create products with same structure
3. Update environment variables with live keys
4. Add production webhook endpoint

---

## 📁 File Structure

```
studly/
├── app/
│   ├── api/
│   │   ├── stripe-checkout/route.ts    # Creates checkout sessions
│   │   ├── stripe-webhook/route.ts     # Handles Stripe events
│   │   ├── create-portal-session/route.ts  # Subscription management
│   │   ├── upload-audio/route.ts       # Handles audio uploads
│   │   ├── process-recording/route.ts  # AI processing pipeline
│   │   └── processing-status/route.ts  # Check processing status
│   ├── auth/page.tsx           # Sign up / Sign in
│   ├── dashboard/page.tsx      # User dashboard
│   ├── pricing/page.tsx        # Pricing plans
│   ├── record/page.tsx         # Recording interface
│   ├── notes/
│   │   ├── page.tsx            # Notes list
│   │   └── [id]/page.tsx       # Individual note
│   ├── settings/page.tsx       # Account settings
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/
│   └── NavBar.tsx              # Navigation bar
├── lib/
│   ├── supabaseClient.ts       # Browser Supabase client
│   └── supabaseServer.ts       # Server Supabase client
├── middleware.ts               # Auth & subscription checks
├── .env.local                  # Environment variables
└── supabase-schema.sql         # Database schema
```

---

## 🐛 Troubleshooting

### Webhook not receiving events
- Check Stripe Dashboard > Developers > Webhooks > Logs
- Verify webhook secret matches
- For local testing, ensure Stripe CLI is running

### Audio upload fails
- Check Supabase Storage bucket exists and is public
- Verify file size isn't too large (default limit: 50MB)

### AI processing fails
- Check API keys are valid
- Verify audio URL is publicly accessible
- Check Supabase logs for errors

### Subscription not activating
- Check webhook is receiving events
- Verify database tables exist
- Check RLS policies aren't blocking inserts

---

## 🎉 You're Ready!

Your Studly SaaS is now fully functional with:
- ✅ User authentication
- ✅ Stripe subscription payments
- ✅ Audio recording & upload
- ✅ AI transcription (AssemblyAI)
- ✅ AI note generation (Gemini)
- ✅ Dashboard & settings
- ✅ Production-ready deployment

Good luck with your launch! 🚀
