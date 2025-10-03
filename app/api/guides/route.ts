import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = supabaseServerClient();
    const { data, error } = await supabase
      .from("guides")
      .select("id, title, description, created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
