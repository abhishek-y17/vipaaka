"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useCallback, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { clearRated, hasRated, markRated } from "@/lib/anon-id";
import { ensureAnonSession, getSupabase, supabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";

import { StarRating } from "./StarRating";

export type Sentiment = "like" | "dislike";

const MAX_BODY = 1000;
/** Mirrors `char_length(display_name) <= 40` in the schema's insert/update
 *  policies. Client-side truncation is a courtesy; the check constraint and
 *  the RLS `with check` are the control. */
const MAX_NAME = 40;

export type ReviewFormProps = {
  target: string;
  /** Fired after a submit actually lands, so the parent can refetch stats/list. */
  onSubmitted: () => void;
};

/**
 * Rating, sentiment, optional display name, optional body, honeypot, gold
 * Submit.
 *
 * Optimistic: the "thanks" state and the localStorage flag land the instant
 * Submit is pressed, before the network call resolves. If the insert fails,
 * both roll back and a toast explains why — the alternative (waiting on the
 * round-trip before showing anything) is the slow, un-cinematic version of
 * this interaction.
 */
export function ReviewForm({ target, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitted, setSubmitted] = useState(() => hasRated(target));
  const [pending, startTransition] = useTransition();
  const warmedRef = useRef(false);

  /**
   * Mint the anonymous session on first real interaction with this form —
   * never on mount, in a layout, or in a provider.
   *
   * Every `signInAnonymously()` creates a row in `auth.users` and counts as a
   * monthly active user against the 50,000 free-tier cap. Bootstrapping
   * identity on page load spends that budget on every visitor who scrolls
   * past, which is nearly all of them; touching a star is the first moment
   * someone has actually expressed intent to review.
   *
   * Fired here rather than at submit so the round-trip overlaps with typing
   * instead of being added to it. A ref, not state — this must not re-render,
   * and it must fire exactly once per mount regardless of how many stars,
   * pills and keystrokes follow. On failure the guard is released so the next
   * interaction retries; submit calls this again anyway and surfaces the real
   * error there.
   */
  const warmSession = useCallback(() => {
    if (warmedRef.current) return;
    warmedRef.current = true;
    void ensureAnonSession().catch(() => {
      warmedRef.current = false;
    });
  }, []);

  if (!supabaseConfigured) {
    return <p className="text-mid text-body-sm">Reviews are temporarily unavailable.</p>;
  }

  /**
   * Reopen the form on an existing review.
   *
   * This is the fix for the sentiment bug, and the bug was never in the pills.
   * They toggle correctly, the value reaches the payload correctly, and the
   * upsert's ON CONFLICT updates it correctly — verified for `like`,
   * `dislike` and `null`. What was broken is that there was no way back to
   * them: once `hasRated` was set, the form was replaced permanently by a
   * panel promising "rate again any time to update it", with nothing to rate
   * with. Sentiment looked stuck because it was unreachable.
   *
   * It also fixes a quieter, worse bug. Reopening a blank form and
   * resubmitting sent `body: null` and `display_name: null` over the top of
   * the existing row, so changing your rating silently erased your review
   * text. The upsert writes the whole row, so the form has to be loaded with
   * the whole row first.
   *
   * Fetching here — on a click — rather than on mount is what keeps the lazy
   * sign-in rule intact: reading your own row needs `auth.uid()`, and minting
   * a session to prefill a form nobody asked to open would spend an MAU on
   * every visitor who has ever reviewed.
   */
  const beginEdit = () => {
    startTransition(async () => {
      try {
        const uid = await ensureAnonSession();
        const { data, error } = await getSupabase()
          .from("reviews")
          .select("rating, sentiment, display_name, body")
          .eq("anon_id", uid)
          .eq("target", target)
          .maybeSingle();
        if (error) throw error;

        // `data` is null when the device flag outlived the session — cleared
        // storage, a different browser profile. An empty form is the honest
        // outcome; there is nothing of theirs to load.
        setRating(data?.rating ?? 0);
        setSentiment((data?.sentiment as Sentiment | null) ?? null);
        setName(data?.display_name ?? "");
        setBody(data?.body ?? "");
        setSubmitted(false);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Could not load your review.",
        );
      }
    });
  };

  if (submitted) {
    return (
      <div className="glass rounded-lg p-6 sm:p-8">
        <p className="text-hi text-body-sm">
          Thanks — your review is in. You can change it any time.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={beginEdit}
          disabled={pending}
          className="mt-4"
        >
          {pending ? "Loading…" : "Edit your review"}
        </Button>
      </div>
    );
  }

  const canSubmit = rating > 0 && !pending;

  const submit = () => {
    if (honeypot) return; // silently drop — bots only fill this
    if (rating === 0) {
      toast.error("Pick a star rating first.");
      return;
    }

    setSubmitted(true);
    markRated(target);

    startTransition(async () => {
      try {
        const uid = await ensureAnonSession();
        const { error } = await getSupabase()
          .from("reviews")
          .upsert(
            {
              anon_id: uid,
              target,
              rating,
              sentiment,
              // Trimmed then emptied to null, so a name of pure whitespace
              // stores as "no name" rather than as a blank one. `null` is what
              // ReviewList renders as "Anonymous" — the literal string is
              // never written, or it would be indistinguishable from someone
              // who typed it.
              display_name: name.trim() || null,
              body: body.trim() || null,
            },
            { onConflict: "anon_id,target" },
          );
        if (error) throw error;

        toast.success("Review submitted. Thank you.");
        onSubmitted();
      } catch (err) {
        setSubmitted(false);
        clearRated(target);
        toast.error(err instanceof Error ? err.message : "Could not submit your review.");
      }
    });
  };

  return (
    <div className="glass relative rounded-lg p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        {/* Each of these three is a "first real interaction" per the lazy
            session rule: a star, a pill, a keystroke. */}
        <StarRating
          value={rating}
          onChange={(n) => {
            warmSession();
            setRating(n);
          }}
          disabled={pending}
        />

        <div className="flex gap-2">
          <button
            type="button"
            aria-pressed={sentiment === "like"}
            disabled={pending}
            onClick={() => {
              warmSession();
              setSentiment(sentiment === "like" ? null : "like");
            }}
            className={cn(
              "ease-cinema dur-fast text-body-sm flex h-9 items-center gap-2 rounded-full border px-4 transition-colors disabled:opacity-50",
              sentiment === "like"
                ? "border-gold bg-gold/10 text-gold-bright"
                : "border-hairline text-mid hover:text-hi",
            )}
          >
            <ThumbsUp className="size-4" aria-hidden="true" />
            Like
          </button>
          <button
            type="button"
            aria-pressed={sentiment === "dislike"}
            disabled={pending}
            onClick={() => {
              warmSession();
              setSentiment(sentiment === "dislike" ? null : "dislike");
            }}
            className={cn(
              "ease-cinema dur-fast text-body-sm flex h-9 items-center gap-2 rounded-full border px-4 transition-colors disabled:opacity-50",
              sentiment === "dislike"
                ? "border-gold bg-gold/10 text-gold-bright"
                : "border-hairline text-mid hover:text-hi",
            )}
          >
            <ThumbsDown className="size-4" aria-hidden="true" />
            Dislike
          </button>
        </div>
      </div>

      <div className="mt-5">
        {/* `aria-label` as well as the placeholder, not instead of it — a
            placeholder is not an accessible name and disappears the moment
            you type. Same field styling as the Textarea below; no new
            tokens. */}
        <Input
          type="text"
          value={name}
          disabled={pending}
          onChange={(e) => {
            warmSession();
            setName(e.target.value.slice(0, MAX_NAME));
          }}
          aria-label="Your name (optional)"
          placeholder="Your name (optional)"
          maxLength={MAX_NAME}
          autoComplete="name"
        />
      </div>

      <div className="mt-3">
        <Textarea
          value={body}
          disabled={pending}
          onChange={(e) => {
            warmSession();
            setBody(e.target.value.slice(0, MAX_BODY));
          }}
          placeholder="Optional — what stayed with you?"
          className="min-h-24"
          maxLength={MAX_BODY}
        />
        <p className="text-mid text-body-sm mt-1 text-right tabular-nums">
          {body.length}/{MAX_BODY}
        </p>
      </div>

      {/* Honeypot: invisible to people, catnip to bots. Never in the tab order. */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <Button type="button" onClick={submit} disabled={!canSubmit} className="mt-6">
        {pending ? "Submitting…" : "Submit Review"}
      </Button>
    </div>
  );
}

export default ReviewForm;
