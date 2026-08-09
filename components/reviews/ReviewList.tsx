"use client";

import { Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type ReviewRow = {
  id: string;
  rating: number;
  sentiment: "like" | "dislike" | null;
  display_name: string | null;
  body: string | null;
  created_at: string;
};

/** Rendered for a null `display_name`. Never written to the database — a
 *  stored "Anonymous" would be indistinguishable from someone who typed it. */
const ANONYMOUS = "Anonymous";

const PAGE_SIZE = 10;

export type ReviewListProps = {
  target: string;
  refreshKey: number;
};

/** "View All Reviews" — a glass dialog, 10 per page, fetched lazily on open. */
export function ReviewList({ target, refreshKey }: ReviewListProps) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open || !supabaseConfigured) return;
    setLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let cancelled = false;
    getSupabase()
      .from("reviews")
      .select("id, rating, sentiment, display_name, body, created_at", {
        count: "exact",
      })
      .eq("target", target)
      // Grouped in the query, never in JS after the fetch — sorting a single
      // page client-side would order that page's ten rows and nothing else,
      // so the groups would restart on every page.
      //
      // `sentiment_rank` is the generated column from SUPABASE_SCHEMA.sql:
      // like → 0, null → 1, dislike → 2. Ordering on `sentiment` itself
      // cannot produce this — 'dislike' sorts before 'like'.
      .order("sentiment_rank", { ascending: true })
      .order("created_at", { ascending: false })
      // The tiebreak that makes the sort TOTAL, which is what `.range()`
      // needs. `created_at` is not unique — two rows inserted in the same
      // microsecond, or seeded together, compare equal, and Postgres is then
      // free to return them in a different order on the query for page 2 than
      // it did for page 1. That is exactly how paginated lists duplicate one
      // row and drop another. A unique final key removes the freedom.
      .order("id", { ascending: false })
      .range(from, to)
      .then(({ data, count: total, error }) => {
        if (cancelled) return;
        // The error was previously dropped, so any failed query rendered as
        // "No reviews yet." — a sentence that is indistinguishable from the
        // truth and therefore worse than an error. Caught for real when this
        // query started ordering on `sentiment_rank`: before the migration is
        // applied it 400s with `42703 column does not exist`, and the list
        // quietly claimed the film had no reviews at all.
        setFailed(Boolean(error));
        setRows(data ?? []);
        setCount(total ?? 0);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, page, target, refreshKey]);

  if (!supabaseConfigured) return null;

  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setPage(0);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View All Reviews
        </Button>
      </DialogTrigger>
      <DialogContent className="glass max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-display-sm text-gold uppercase">
            Reviews
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-mid text-body-sm">Loading…</p>
        ) : failed ? (
          <p className="text-mid text-body-sm">
            Reviews could not be loaded. Please try again.
          </p>
        ) : rows.length === 0 ? (
          <p className="text-mid text-body-sm">No reviews yet.</p>
        ) : (
          <ul className="divide-hairline divide-y">
            {rows.map((r) => (
              <li key={r.id} className="py-4 first:pt-0">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={cn(
                          "size-3.5",
                          n <= r.rating
                            ? "fill-gold-bright text-gold-bright"
                            : "fill-transparent text-mid",
                        )}
                      />
                    ))}
                  </div>
                  {r.sentiment === "like" ? (
                    <ThumbsUp className="text-mid size-3.5" aria-hidden="true" />
                  ) : r.sentiment === "dislike" ? (
                    <ThumbsDown className="text-mid size-3.5" aria-hidden="true" />
                  ) : null}
                  <span className="text-mid text-body-sm ml-auto">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                {/* White, not gold — a reviewer's name is content. Gold marks
                    skeleton and state (CLAUDE.md §3). Bebas because it labels
                    who wrote this, which is exactly what Bebas is for. */}
                <p className="font-eyebrow text-eyebrow-sm text-hi mt-2 uppercase">
                  {r.display_name ?? ANONYMOUS}
                </p>
                {r.body ? <p className="text-mid text-body-sm mt-1">{r.body}</p> : null}
              </li>
            ))}
          </ul>
        )}

        {pageCount > 1 ? (
          <div className="mt-2 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <span className="text-mid text-body-sm">
              Page {page + 1} of {pageCount}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              Next
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default ReviewList;
