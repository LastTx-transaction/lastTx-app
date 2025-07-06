import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { CloudSchedulerClient } from "@google-cloud/scheduler";

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
          "\n"
        ),
      },
    })
  : null;

interface DeleteWillData {
  smartContractId: string;
  willId?: number; // Optional: will ID from smart contract for better mapping
  ownerAddress?: string; // Optional: for better Supabase lookup
}

export async function POST(request: NextRequest) {
  try {
    const willData: DeleteWillData = await request.json();

    // Validate required fields
    if (!willData.smartContractId) {
      return NextResponse.json(
        { error: "Missing smartContractId" },
        { status: 400 }
      );
    }

    // Early return success if no email/scheduling features configured
    if (!hasSupabaseConfig && !hasGoogleCloudConfig) {
      return NextResponse.json({
        success: true,
        message: "Will deleted from blockchain.",
      });
    }

    // Background operations - don't block the response
    Promise.resolve().then(async () => {
      try {
        let actualTransactionId = willData.smartContractId;

        // If we don't have the transaction ID, try to fetch it from Supabase using willId
        if (
          willData.willId &&
          hasSupabaseConfig &&
          supabase &&
          willData.ownerAddress
        ) {
          try {
            const { data: willRecord } = await supabase
              .from("wills")
              .select("smart_contract_id")
              .eq("will_id", willData.willId.toString())
              .eq("owner_address", willData.ownerAddress)
              .single();

            if (willRecord?.smart_contract_id) {
              actualTransactionId = willRecord.smart_contract_id;
            }
          } catch (error) {
            console.error(
              "Error fetching transaction ID from Supabase:",
              error
            );
            // Continue with the provided smartContractId
          }
        }

        // Delete from Supabase if configured
        if (hasSupabaseConfig && supabase) {
          try {
            await supabase
              .from("wills")
              .delete()
              .eq("smart_contract_id", actualTransactionId);
          } catch (error) {
            console.error("Error deleting from Supabase:", error);
          }
        }

        // Delete scheduled job from Google Cloud Scheduler if configured
        if (hasGoogleCloudConfig && schedulerClient) {
          try {
            const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID!;
            const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
            const jobName = `will-execution-${actualTransactionId}`;
            const fullJobName = `projects/${projectId}/locations/${location}/jobs/${jobName}`;

            await schedulerClient.deleteJob({
              name: fullJobName,
            });
          } catch (error) {
            // Job might not exist, which is fine for deletion
            console.log("No scheduled job to delete (this is normal):", error);
          }
        }
      } catch (error) {
        // Log background errors but don't affect the response
        console.error("Background operation error in delete-will:", error);
      }
    });

    return NextResponse.json({
      success: true,
      message: "Will deleted successfully.",
    });
  } catch (error) {
    console.error("Error in delete-will API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
