"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export function useSupabaseUser() {
    // Use a ref to hold the supabase client — created once, never changes,
    // and does NOT participate in the render cycle (unlike useMemo which
    // can still re-compute if React decides to discard the memo cache).
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for future auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // supabase is from a ref — guaranteed stable, safe to omit

    return { user, loading };
}