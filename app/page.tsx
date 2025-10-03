import Link from "next/link";
import { supabaseServerClient } from "@/lib/supabaseServer";

type Guide = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
};

async function getGuides(): Promise<{ guides: Guide[]; error?: string }> {
  try {
    const supabase = supabaseServerClient();
    const { data, error } = await supabase
      .from("guides")
      .select("id, title, description, created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) {
      return { guides: [], error: error.message };
    }

    return { guides: data ?? [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { guides: [], error: message };
  }
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

export default async function HomePage() {
  const { guides, error } = await getGuides();

  return (
    <main
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "2rem 1rem",
      }}
    >
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: 0 }}>Barber Training Guides</h1>
        <p style={{ marginTop: "0.5rem", color: "#495057" }}>
          Explore public guides curated to help you sharpen your skills.
        </p>
      </header>

      {error ? (
        <p role="alert" style={{ color: "#c92a2a" }}>
          Failed to load guides: {error}
        </p>
      ) : guides.length === 0 ? (
        <p>No guides are available yet. Please check back later.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {guides.map((guide) => (
            <li
              key={guide.id}
              style={{
                background: "#fff",
                borderRadius: "0.75rem",
                padding: "1.25rem",
                marginBottom: "1rem",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
              }}
            >
              <Link href={`/guides/${guide.id}`}>
                <article>
                  <h2 style={{ margin: "0 0 0.5rem" }}>{guide.title}</h2>
                  {guide.description && (
                    <p style={{ margin: 0, color: "#495057" }}>
                      {guide.description}
                    </p>
                  )}
                  <small style={{ color: "#868e96" }}>
                    {formatDate(guide.created_at)}
                  </small>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
