import { createClient } from '@supabase/supabase-js';
import { CloudSchedulerClient } from '@google-cloud/scheduler';
import { NextRequest, NextResponse } from 'next/server';

// Check if email features are configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const hasSupabaseConfig = supabaseUrl && supabaseKey;

const hasGoogleCloudConfig =
  process.env.GOOGLE_CLOUD_PROJECT_ID &&
  process.env.GOOGLE_CLOUD_CLIENT_EMAIL &&
  process.env.GOOGLE_CLOUD_PRIVATE_KEY;

// Only initialize if configured
const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

const schedulerClient = hasGoogleCloudConfig
  ? new CloudSchedulerClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY!.replace(
          /\\n/g,
          '\n',
        ),
      },
    })
  : null;

interface WillData {
  smartContractId: string;
  willId?: number; // Optional will ID from smart contract (auto-incrementing number)
  dateOfExecution: string; // ISO date string
  recipientName: string;
  recipientEmail: string;
  message: string;
  percentageOfMoney: number;
  ownerAddress: string;
  ownerEmail?: string;
  ownerName?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Early return if neither email features are configured
    if (!hasSupabaseConfig || !hasGoogleCloudConfig) {
      return NextResponse.json({
        success: true,
        message:
          'Will created successfully. Email notifications are not configured.',
      });
    }

    const willData: WillData = await request.json();

    // Validate required fields
    if (
      !willData.smartContractId ||
      !willData.dateOfExecution ||
      !willData.recipientEmail ||
      !willData.recipientName ||
      !willData.ownerAddress
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Save will data to Supabase
    const willInsertData: {
      smart_contract_id: string;
      date_of_execution: string;
      recipient_name: string;
      recipient_email: string;
      message: string;
      percentage_of_money: number;
      owner_address: string;
      owner_email?: string;
      owner_name?: string;
      status: string;
      created_at: string;
      will_id?: string;
    } = {
      smart_contract_id: willData.smartContractId,
      date_of_execution: willData.dateOfExecution,
      recipient_name: willData.recipientName,
      recipient_email: willData.recipientEmail,
      message: willData.message,
      percentage_of_money: willData.percentageOfMoney,
      owner_address: willData.ownerAddress,
      owner_email: willData.ownerEmail,
      owner_name: willData.ownerName,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    // Include willId if provided (convert number to string for Supabase)
    if (willData.willId) {
      willInsertData.will_id = willData.willId.toString();
    }

    const { data: savedWill, error: supabaseError } = await supabase!
      .from('wills')
      .insert([willInsertData])
      .select()
      .single();

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      return NextResponse.json(
        { error: 'Failed to save will data' },
        { status: 500 },
      );
    }

    // Schedule job using Google Cloud Scheduler to call Supabase Edge Function directly
    try {
      const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID!;
      const location = process.env.GOOGLE_CLOUD_LOCATION ?? 'us-central1'; // Use default if not set
      const parent = `projects/${projectId}/locations/${location}`;

      // Create job name using smart contract ID
      const jobName = `will-execution-${willData.smartContractId}`;
      const fullJobName = `${parent}/jobs/${jobName}`;

      // Convert execution date to cron format for ONE-TIME execution
      const executionDate = new Date(willData.dateOfExecution);

      // Debug timezone information
      console.log('=== SCHEDULER TIMEZONE DEBUG ===');
      console.log('Received dateOfExecution:', willData.dateOfExecution);
      console.log('Parsed execution date (UTC):', executionDate.toISOString());
      console.log('Parsed execution date (Local):', executionDate.toString());
      console.log('Minutes:', executionDate.getUTCMinutes());
      console.log('Hours:', executionDate.getUTCHours());
      console.log('Date:', executionDate.getUTCDate());
      console.log('Month:', executionDate.getUTCMonth() + 1);

      // Use UTC methods to ensure consistent timezone handling
      // Format: MINUTE HOUR DAY_OF_MONTH MONTH DAY_OF_WEEK
      // IMPORTANT: Use UTC methods since timeZone is set to UTC
      const cronExpression = `${executionDate.getUTCMinutes()} ${executionDate.getUTCHours()} ${executionDate.getUTCDate()} ${
        executionDate.getUTCMonth() + 1
      } *`;

      const job = {
        name: fullJobName,
        description: `Execute will for smart contract ${willData.smartContractId} - ONE TIME ONLY`,
        httpTarget: {
          uri: `${supabaseUrl}/functions/v1/send-email`, // Call your existing Supabase Edge Function
          httpMethod: 'POST' as const,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`, // Use your Supabase anon key for the Edge Function call
          },
          body: Buffer.from(
            JSON.stringify({
              id: willData.smartContractId, // Only pass the ID
              jobName: jobName, // Pass job name so Edge Function can delete the scheduler job
            }),
          ),
        },
        schedule: cronExpression,
        timeZone: 'UTC', // It's good practice to use UTC for scheduling
      };

      const [createdJob] = await schedulerClient!.createJob({
        parent,
        job,
      });

      console.log(`Scheduled job created: ${createdJob.name}`);

      return NextResponse.json({
        success: true,
        willId: savedWill.id,
        scheduledJobName: createdJob.name,
        message: 'Will created and scheduled with Google Cloud Scheduler',
      });
    } catch (schedulerError) {
      console.error('Google Cloud Scheduler error:', schedulerError);

      // Optionally delete the Supabase record if scheduling fails
      // This ensures data consistency if the scheduling step fails
      await supabase!.from('wills').delete().eq('id', savedWill.id);
      console.log(
        `Deleted Supabase record for failed schedule: ${savedWill.id}`,
      );

      return NextResponse.json(
        { error: 'Failed to schedule will execution' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
