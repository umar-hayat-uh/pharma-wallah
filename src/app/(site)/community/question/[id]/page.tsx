import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

/**
 * Legacy route: /community/question/<old questions.id>.
 *
 * The migration copied every legacy question into `community_posts`, keeping
 * its original id in `legacy_question_id`. That column is what lets an old URL
 * resolve to its new post rather than 404 — so every link shared before the
 * rebuild still works.
 */
export default async function LegacyQuestionRedirect({
    params,
}: {
    params: { id: string };
}) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);

    if (isUuid) {
        try {
            const supabase = await createServerSupabaseClient();
            const { data } = await supabase
                .from("community_posts")
                .select("id")
                .eq("legacy_question_id", params.id)
                .maybeSingle();

            if (data?.id) redirect(`/community/post/${data.id}`);
        } catch (err) {
            // `redirect()` throws by design — rethrow it, and only swallow a
            // genuine lookup failure so a database blip still lands the reader
            // on the feed instead of an error page.
            if (err && typeof err === "object" && "digest" in err) throw err;
            console.warn("[community] legacy question lookup failed:", err);
        }
    }

    redirect("/community");
}
