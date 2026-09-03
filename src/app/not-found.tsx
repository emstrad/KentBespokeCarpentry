import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section intro" style={{ paddingTop: "clamp(140px,20vw,240px)" }}>
      <h1 className="h-md">Page not found</h1>
      <p className="lede">That page isn&apos;t here. Head back home or get in touch.</p>
      <Link href="/" className="pill pill--navy">Back to home</Link>
    </section>
  );
}
