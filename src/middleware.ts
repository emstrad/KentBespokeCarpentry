import { NextResponse, type NextRequest } from "next/server";
import { NAP } from "@/lib/site";

/**
 * TEMPORARY holding page. While this file exists every page on the site shows "under
 * construction" and every other URL redirects to the homepage. Nothing else has been changed.
 * To put the full site back, delete this file and redeploy.
 *
 * Served with 503 + Retry-After so search engines treat it as a short outage and keep the
 * existing pages indexed rather than replacing them with this page.
 */

const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#0e2140">
<title>${NAP.shortName} | Website under construction</title>
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<style>
  *{box-sizing:border-box}
  html,body{margin:0;height:100%}
  body{background:#fff;color:#0e2140;font-family:Montserrat,system-ui,-apple-system,"Segoe UI",sans-serif;
    display:flex;align-items:center;justify-content:center;padding:32px 16px;text-align:center}
  main{max-width:560px;width:100%}
  img{width:min(260px,70vw);height:auto;margin:0 auto 40px;display:block}
  h1{font-weight:400;font-size:clamp(26px,5vw,38px);letter-spacing:.02em;margin:0 0 16px}
  p{color:rgba(14,33,64,.78);font-size:clamp(16px,2.4vw,18px);line-height:1.6;margin:0 0 32px}
  .contact{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
  a{color:#fff;background:#0e2140;text-decoration:none;border-radius:999px;padding:14px 24px;font-size:15px;min-height:48px;display:inline-flex;align-items:center}
  a:hover{background:#1b3560}
</style>
</head>
<body>
<main>
  <img src="/assets/logo-navy.png" alt="${NAP.name}">
  <h1>Website under construction</h1>
  <p>Our new website is on its way. In the meantime, we're still taking on work across Kent, so please get in touch.</p>
  <div class="contact">
    <a href="${NAP.phoneHref}">Call ${NAP.phoneDisplay}</a>
    <a href="${NAP.emailHref}">Email us</a>
  </div>
</main>
</body>
</html>`;

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/", req.url), 307);
  }
  return new NextResponse(html, {
    status: 503,
    headers: { "Content-Type": "text/html; charset=utf-8", "Retry-After": "86400", "Cache-Control": "no-store" },
  });
}

// Static files (logo, icon, Next internals) still load; every page and API route is caught.
export const config = {
  matcher: ["/((?!_next/|assets/|icon.svg|favicon.ico).*)"],
};
