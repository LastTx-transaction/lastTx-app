# Testing Your LastTx Inheritance App

This guide will help you test the complete flow from will creation to email execution.

## 🧪 Test Setup

### 1. Environment Variables

Create `.env.local` with:

```env
# Supabase
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_CLOUD_KEY_FILE=./service-account-key.json

# SendGrid (for your Supabase Edge Function)
SENDGRID_API_KEY=your_sendgrid_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase Setup

1. **Deploy your Edge Function** (the `supabase.ts` file):

   ```bash
   supabase functions deploy send-email
   ```

2. **Set Edge Function Environment Variables** in Supabase Dashboard:

   - `SENDGRID_API_KEY`: Your SendGrid API key
   - `SUPABASE_URL`: https://uyjlgjniribwpvsflqrr.supabase.co
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key

3. **Run the database schema**:
   ```sql
   -- Copy and paste content from supabase-schema.sql
   ```

## 🧪 Test Scenarios

### Test 1: Quick Email Test (5 minutes)

**Purpose**: Test if your Edge Function works and sends emails

1. **Set execution time 5 minutes from now**:

   ```javascript
   const testTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
   console.log("Test execution time:", testTime.toISOString());
   ```

2. **Create a will** with these details:

   - **Recipient Email**: Your own email (so you receive it)
   - **Recipient Name**: "Test Recipient"
   - **Percentage**: 50%
   - **Message**: "This is a test inheritance"
   - **Execution Date**: Use the time from step 1

3. **Wait 5 minutes** and check:
   - Your email inbox
   - Google Cloud Scheduler logs
   - Supabase Edge Function logs
   - Database will status

### Test 2: Manual Edge Function Test

**Purpose**: Test your Edge Function directly without waiting

1. **Get a smart contract ID** from your database or create a will first

2. **Test the Edge Function directly**:

   ```bash
   curl -X POST https://uyjlgjniribwpvsflqrr.supabase.co/functions/v1/send-email \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
     -d '{"id": "your-smart-contract-id"}'
   ```

3. **Check the response** and your email

### Test 3: Complete Flow Test (Tomorrow)

**Purpose**: Test the complete realistic scenario

1. **Create a will** with execution time tomorrow at a specific hour
2. **Monitor the entire flow**:
   - Database entry creation
   - Google Cloud Scheduler job creation
   - Scheduled execution
   - Email delivery
   - Status update

## 🔍 Debugging & Monitoring

### Check Google Cloud Scheduler

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to Cloud Scheduler
3. Find jobs named `will-execution-{contractId}`
4. Check execution history and logs

### Check Supabase Edge Function Logs

1. Go to Supabase Dashboard
2. Navigate to Edge Functions → send-email
3. Check the Logs tab for execution details

### Check Database Status

```sql
-- See all wills and their status
SELECT smart_contract_id, recipient_email, status, date_of_execution, executed_at
FROM wills
ORDER BY created_at DESC;

-- See pending wills
SELECT * FROM wills WHERE status = 'active';

-- See executed wills
SELECT * FROM wills WHERE status = 'executed';
```

### Common Issues & Solutions

**1. "Function not found" error**

- Make sure you deployed the Edge Function: `supabase functions deploy send-email`
- Check the function name matches in your Google Cloud Scheduler

**2. "Missing environment variables" error**

- Set environment variables in Supabase Dashboard → Edge Functions → send-email → Settings

**3. "SendGrid authentication failed"**

- Verify your SendGrid API key is correct
- Check if your SendGrid account is verified

**4. "Will not found" error**

- Check if the smart contract ID exists in database
- Verify the will status is 'active'

**5. Cron job not executing**

- Check Google Cloud Scheduler permissions
- Verify the cron expression format
- Check Cloud Scheduler region settings

## 📧 Email Testing Tips

### Use Your Own Email First

- Set recipient email to your own email address
- This way you can see exactly what recipients will receive

### Test Different Scenarios

1. **With personal message** - Add a custom message
2. **Without personal message** - Leave message empty
3. **Different percentages** - Test 25%, 50%, 100%
4. **Different owner names** - Test with and without owner names

### Email Content Validation

Check that the email includes:

- ✅ Beautiful HTML formatting
- ✅ Recipient name
- ✅ Owner name (if provided)
- ✅ Inheritance percentage
- ✅ Personal message (if provided)
- ✅ Smart contract ID
- ✅ Claim link: http://localhost:3000/claim-will
- ✅ Professional styling

## 🚀 Quick Test Command

Run this to test your entire setup quickly:

```bash
# 1. Start your app
npm run dev

# 2. Create a test will with 2-minute execution time
# (Use your frontend or API directly)

# 3. Monitor logs in real-time
# Terminal 1: Check app logs
# Terminal 2: Check Google Cloud Scheduler
# Terminal 3: Check Supabase function logs

# 4. Verify email arrives in 2 minutes
```

## ✅ Success Criteria

Your test is successful when:

- ✅ Will is saved to Supabase database
- ✅ Google Cloud Scheduler job is created
- ✅ Job executes at the scheduled time
- ✅ Beautiful HTML email is sent to recipient
- ✅ Will status updates to 'executed'
- ✅ Scheduled job is cleaned up

Happy testing! 🎉
