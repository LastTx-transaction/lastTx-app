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

interface UpdateWillData {
  smartContractId: string;
  inactivityPeriodMinutes: number;
  ownerAddress: string;
  willId?: number;
  beneficiaryEmail?: string;
  beneficiaryName?: string;
  ownerName?: string;
  personalMessage?: string;
}

export async function POST(request: NextRequest) {
  try {
    const willData: UpdateWillData = await request.json();

    // Validate required fields
    if (
      !willData.smartContractId ||
      !willData.inactivityPeriodMinutes ||
      willData.inactivityPeriodMinutes <= 0 ||
      !willData.ownerAddress
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate new execution date from current time
    const blockchainUpdateTime = new Date();
    const inactivityPeriodMs = willData.inactivityPeriodMinutes * 60 * 1000;
    const newExecutionDate = new Date(
      blockchainUpdateTime.getTime() + inactivityPeriodMs
    );

    // Early return success if no email/scheduling features configured
    if (!hasSupabaseConfig && !hasGoogleCloudConfig) {
      return NextResponse.json({
        success: true,
        message: "Will updated successfully on blockchain.",
      });
    }

    // Background operations - don't block the response
    Promise.resolve().then(async () => {
      try {
        const newTransactionId = willData.smartContractId; // This is the NEW transaction ID (will-3)

        // Find the OLD transaction ID from Supabase to use for scheduler job naming
        let oldTransactionId = newTransactionId; // fallback to new ID
        if (willData.willId && hasSupabaseConfig && supabase) {
          try {
            const { data: willRecord } = await supabase
              .from("wills")
              .select("smart_contract_id")
              .eq("will_id", willData.willId.toString())
              .eq("owner_address", willData.ownerAddress)
              .eq("status", "active")
              .single();

            if (willRecord?.smart_contract_id) {
              oldTransactionId = willRecord.smart_contract_id; // This should be the long hash
            }
          } catch (error) {
            console.error(
              "Error fetching old transaction ID from Supabase:",
              error
            );
            // Continue with the provided smartContractId
          }
        }

        // Update Supabase record
        if (hasSupabaseConfig && supabase) {
          const updateData: {
            date_of_execution: string;
            updated_at: string;
            will_id?: string;
            beneficiary_email?: string;
            beneficiary_name?: string;
            owner_name?: string;
            personal_message?: string;
          } = {
            date_of_execution: newExecutionDate.toISOString(),
            updated_at: new Date().toISOString(),
          };

          if (willData.willId) {
            updateData.will_id = willData.willId.toString();
          }

          if (willData.beneficiaryEmail) {
            updateData.beneficiary_email = willData.beneficiaryEmail;
          }

          if (willData.beneficiaryName) {
            updateData.beneficiary_name = willData.beneficiaryName;
          }

          if (willData.ownerName) {
            updateData.owner_name = willData.ownerName;
          }

          if (willData.personalMessage) {
            updateData.personal_message = willData.personalMessage;
          }

          await supabase
            .from("wills")
            .update(updateData)
            .eq("smart_contract_id", oldTransactionId) // Use old transaction ID to find the record
            .eq("owner_address", willData.ownerAddress)
            .eq("status", "active");
        }

        // Update Google Cloud Scheduler
        if (hasGoogleCloudConfig && schedulerClient) {
          const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID!;
          const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
          const parent = `projects/${projectId}/locations/${location}`;
          // Use the OLD transaction ID for scheduler job name (maintain same identity)
          const jobName = `will-execution-${oldTransactionId}`;
          const fullJobName = `${parent}/jobs/${jobName}`;

          // Delete existing job if it exists
          try {
            await schedulerClient.deleteJob({ name: fullJobName });
          } catch {
            // Job might not exist, which is fine
          }

          // Create new job with updated execution time using the SAME job name
          const cronExpression = `${newExecutionDate.getUTCMinutes()} ${newExecutionDate.getUTCHours()} ${newExecutionDate.getUTCDate()} ${
            newExecutionDate.getUTCMonth() + 1
          } *`;

          const job = {
            name: fullJobName, // Same name as the deleted job
            description: `Execute will for smart contract ${oldTransactionId} - ONE TIME ONLY`,
            httpTarget: {
              uri: `${supabaseUrl}/functions/v1/send-email`,
              httpMethod: "POST" as const,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
              },
              body: Buffer.from(
                JSON.stringify({
                  id: oldTransactionId, // Use the OLD transaction ID for email function
                  jobName: jobName,
                })
              ).toString("base64"),
            },
            schedule: cronExpression,
            timeZone: "UTC",
          };

          await schedulerClient.createJob({
            parent,
            job,
          });
        }
      } catch (error) {
        // Log background errors but don't affect the response
        console.error("Background operation error in update-will:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          willId: willData.willId,
          smartContractId: willData.smartContractId,
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Will updated successfully. Execution date updated.",
      newExecutionDate: newExecutionDate.toISOString(),
    });
  } catch (error) {
    console.error("Error updating will:", error);
    return NextResponse.json(
      { error: "Internal server error while updating will" },
      { status: 500 }
    );
  }
}
