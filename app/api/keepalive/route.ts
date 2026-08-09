import { NextResponse } from "next/server";

/**
 * Keeps the Supabase project from pausing.
 *
 * Free projects pause after seven days with no API traffic, and dashboard
 * visits do not count — the first visitor after that gets a cold project and
 * a failed review load, which is exactly the failure nobody notices until a
 * launch weekend. `vercel.json` hits this weekly.
 *
 * Deliberately the cheapest possible request: a `HEAD`-shaped count against
 * `reviews`, `Prefer: count=exact` with a zero-row range, so Postgres answers
 * from the index and returns no bodies. It reads the count out of the
 * `Content-Range` header rather than parsing rows.
 *
 * Anon key only. A cron endpoint is a public URL, and the one credential that
 * must never be reachable from anything Vercel serves is `service_role`
 * (CLAUDE.md §2 rule 3). RLS lets anon read reviews, which is all this needs.
 */

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // 200, not 500: an unconfigured environment is not a cron failure, and a
    // red cron every week trains everyone to ignore the one that matters.
    return NextResponse.json(
      { ok: false, reason: "supabase-not-configured" },
      { status: 200 },
    );
  }

  try {
    const res = await fetch(`${url}/rest/v1/reviews?select=id`, {
      method: "GET",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "count=exact",
        Range: "0-0",
        "Range-Unit": "items",
      },
      cache: "no-store",
    });

    // "0-0/12" -> 12. `*/0` on an empty table, which is still a live project.
    const count = res.headers.get("content-range")?.split("/")[1] ?? null;

    return NextResponse.json(
      { ok: res.ok, status: res.status, reviews: count, at: new Date().toISOString() },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, reason: err instanceof Error ? err.message : "unknown" },
      { status: 200 },
    );
  }
}
