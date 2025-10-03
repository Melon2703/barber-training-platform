import Link from "next/link";

export default function GuideNotFound() {
  return (
    <main
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "2rem 1rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: "1rem" }}>Guide Not Found</h1>
      <p style={{ marginBottom: "1.5rem", color: "#495057" }}>
        We could not locate the guide you are looking for.
      </p>
      <Link href="/" style={{ color: "#1c7ed6" }}>
        Return to guides list
      </Link>
    </main>
  );
}
