import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const hasSupabaseConfig = supabaseUrl && supabaseKey;

// Only initialize if configured
const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

interface GetContractIdsRequest {
  ownerAddress: string;
}

export async function POST(request: NextRequest) {
  try {
    // Early return if Supabase is not configured
    if (!hasSupabaseConfig || !supabase) {
      return NextResponse.json({
        contractIds: {},
        message: "Supabase not configured, using fallback contract IDs",
      });
    }

    const { ownerAddress }: GetContractIdsRequest = await request.json();

    if (!ownerAddress) {
      return NextResponse.json(
        { error: "Owner address is required" },
        { status: 400 }
      );
    }

    // Fetch all wills for this owner from Supabase, ordered by creation time
    const { data: wills, error } = await supabase
      .from("wills")
      .select("smart_contract_id, created_at")
      .eq("owner_address", ownerAddress)
      .order("created_at", { ascending: true }); // Order by creation time to match smart contract will ID sequence

    if (error) {
      console.error("Error fetching contract IDs:", error);
      return NextResponse.json({
        contractIds: {},
        message: "Failed to fetch contract IDs from database",
      });
    }

    // Create a mapping of will ID to transaction ID
    // The smart contract assigns will IDs sequentially (1, 2, 3, etc.)
    // The smart_contract_id field in Supabase contains the transaction ID that was used to create the will
    const contractIds: Record<string, string> = {};

    if (wills && wills.length > 0) {
      // Map each will ID (1-based index) to its corresponding transaction ID
      wills.forEach((will, index) => {
        const willId = (index + 1).toString(); // Smart contract will IDs start from 1
        contractIds[willId] = will.smart_contract_id; // smart_contract_id is actually the transaction ID
      });
    }

    return NextResponse.json({
      contractIds,
      message: "Contract IDs fetched successfully",
    });
  } catch (error) {
    console.error("Error in get-contract-ids API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
