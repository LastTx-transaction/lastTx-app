# Google Cloud Scheduler + Supabase Edge Function Setup

This setup uses Google Cloud Scheduler to call your existing Supabase Edge Function at the scheduled time.

## Architecture Flow

1. **User Creates Will** → Saved to Supabase database
2. **Google Cloud Scheduler Job Created** → Scheduled to execute at specific time
3. **At Execution Time** → Google Cloud Scheduler calls your Supabase Edge Function
4. **Edge Function Executes** → Processes will and sends email
5. **Status Updated** → Will marked as executed in database

## Setup Steps

### 1. Google Cloud Setup

1. **Create Google Cloud Project**:

   ```bash
   gcloud projects create your-project-id
   gcloud config set project your-project-id
   ```

2. **Enable Cloud Scheduler API**:

   ```bash
   gcloud services enable cloudscheduler.googleapis.com
   ```

3. **Create Service Account**:

   ```bash
   gcloud iam service-accounts create will-scheduler \
     --display-name="Will Scheduler Service Account"

   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:will-scheduler@your-project-id.iam.gserviceaccount.com" \
     --role="roles/cloudscheduler.admin"
   ```

4. **Generate Service Account Key**:
   ```bash
   gcloud iam service-accounts keys create ./service-account-key.json \
     --iam-account=will-scheduler@your-project-id.iam.gserviceaccount.com
   ```

### 2. Supabase Setup

1. **Create your Edge Function** in Supabase (you mentioned you already have this)
2. **Make sure it accepts** a POST request with `smartContractId` in the body
3. **Get your Supabase URL and anon key** from Settings → API

### 3. Environment Variables

Create `.env.local`:

```env
# Supabase Configuration
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_CLOUD_KEY_FILE=./service-account-key.json

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Schema

Run this in your Supabase SQL Editor:

```sql
-- Create wills table
CREATE TABLE wills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  smart_contract_id TEXT NOT NULL UNIQUE,
  date_of_execution TIMESTAMP WITH TIME ZONE NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  message TEXT,
  percentage_of_money INTEGER NOT NULL CHECK (percentage_of_money > 0 AND percentage_of_money <= 100),
  owner_address TEXT NOT NULL,
  owner_email TEXT,
  owner_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'executed', 'cancelled', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_wills_smart_contract_id ON wills(smart_contract_id);
CREATE INDEX idx_wills_status ON wills(status);
```

## How It Works

1. **When user creates a will**:

   - Will data is saved to Supabase
   - Google Cloud Scheduler job is created
   - Job is scheduled to call `https://your-project.supabase.co/functions/v1/execute-will`

2. **At the scheduled time**:

   - Google Cloud Scheduler makes HTTP POST to your Supabase Edge Function
   - Sends `{"smartContractId": "your-contract-id"}` in the body
   - Uses your Supabase anon key for authentication

3. **Your Supabase Edge Function**:
   - Receives the request
   - Looks up will data in database
   - Sends email to recipient
   - Updates will status to "executed"

## Benefits

- ✅ **External Scheduling**: Runs independently of your app server
- ✅ **Reliable**: Google Cloud infrastructure
- ✅ **Simple**: Direct HTTP call to your existing Edge Function
- ✅ **Scalable**: Handles multiple scheduled jobs
- ✅ **Cost Effective**: Pay per execution

## Testing

1. **Test locally**:

   ```bash
   npm run dev
   ```

2. **Create a test will** with a near-future execution date

3. **Check Google Cloud Console**:

   - Go to Cloud Scheduler
   - See your scheduled job
   - Monitor execution logs

4. **Verify in Supabase**:
   - Check if will status changes to "executed"
   - Check Edge Function logs

## Production

For production, make sure to:

1. Update `NEXT_PUBLIC_APP_URL` to your production domain
2. Use production Supabase project
3. Set proper Google Cloud project and region
4. Secure your service account key

That's it! Google Cloud Scheduler will now call your Supabase Edge Function directly at the scheduled time.
