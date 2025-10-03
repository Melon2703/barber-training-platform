import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServerClient } from "@/lib/supabaseServer";

type Guide = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
};

type GuideStep = {
  id: string;
  guide_id: string;
  order_index: number;
  text: string | null;
  image_path: string | null;
  created_at: string;
};

type EnrichedGuideStep = GuideStep & {
  image_url: string | null;
};

type PageParams = {
  params: {
    id: string;
  };
};

async function getGuideWithSteps(id: string): Promise<{
  guide: Guide | null;
  steps: EnrichedGuideStep[];
}> {
  const supabase = supabaseServerClient();

  const { data: guide, error: guideError } = await supabase
    .from("guides")
    .select("id, title, description, created_at")
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (guideError || !guide) {
    return { guide: null, steps: [] };
  }

  const { data: steps, error: stepsError } = await supabase
    .from("guide_steps")
    .select("id, guide_id, order_index, text, image_path, created_at")
    .eq("guide_id", id)
    .order("order_index", { ascending: true });

  if (stepsError) {
    throw new Error(stepsError.message);
  }

  const storage = supabase.storage.from("guide-images");

  const enrichedSteps = (steps ?? []).map<EnrichedGuideStep>((step) => {
    if (!step.image_path) {
      return { ...step, image_url: null };
    }

    const { data } = storage.getPublicUrl(step.image_path);
    return { ...step, image_url: data.publicUrl ?? null };
  });

  return { guide, steps: enrichedSteps };
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

export default async function GuideDetailsPage({ params }: PageParams) {
  const { id } = params;
  const { guide, steps } = await getGuideWithSteps(id);

  if (!guide) {
    notFound();
  }

  return (
    <main
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "2rem 1rem",
      }}
    >
      <Link href="/" style={{ color: "#1c7ed6" }}>
        ← Back to guides
      </Link>
      <header style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0 }}>{guide.title}</h1>
        {guide.description && (
          <p style={{ marginTop: "0.75rem", color: "#495057" }}>
            {guide.description}
          </p>
        )}
        <small style={{ color: "#868e96" }}>
          Published {formatDate(guide.created_at)}
        </small>
      </header>

      {steps.length === 0 ? (
        <p>This guide does not have any steps yet.</p>
      ) : (
        <ol style={{ padding: 0, listStyle: "none", margin: 0 }}>
          {steps.map((step, index) => (
            <li
              key={step.id}
              style={{
                background: "#fff",
                borderRadius: "0.75rem",
                padding: "1.5rem",
                marginBottom: "1.5rem",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
              }}
            >
              <h2 style={{ margin: "0 0 0.75rem" }}>Step {index + 1}</h2>
              {step.text && (
                <p style={{ margin: "0 0 0.75rem", color: "#495057" }}>
                  {step.text}
                </p>
              )}
              {step.image_url && (
                <div>
                  <img
                    src={step.image_url}
                    alt={step.text ?? `Guide step ${index + 1}`}
                    style={{
                      display: "block",
                      width: "100%",
                      height: "auto",
                      borderRadius: "0.5rem",
                      background: "#dee2e6",
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
