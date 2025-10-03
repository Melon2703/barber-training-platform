import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabaseServer";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = context.params;

  if (!id) {
    return NextResponse.json({ error: "Guide id is required" }, { status: 400 });
  }

  try {
    const supabase = supabaseServerClient();

    const { data: guide, error: guideError } = await supabase
      .from("guides")
      .select("id, title, description, created_at")
      .eq("id", id)
      .eq("is_public", true)
      .single();

    if (guideError) {
      if (guideError.code === "PGRST116" || guideError.code === "PGRST103") {
        return NextResponse.json({ error: "Guide not found" }, { status: 404 });
      }

      return NextResponse.json({ error: guideError.message }, { status: 500 });
    }

    const { data: steps, error: stepsError } = await supabase
      .from("guide_steps")
      .select("id, guide_id, order_index, text, image_path, created_at")
      .eq("guide_id", id)
      .order("order_index", { ascending: true });

    if (stepsError) {
      return NextResponse.json({ error: stepsError.message }, { status: 500 });
    }

    return NextResponse.json({ ...guide, steps: steps ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
