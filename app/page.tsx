"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import BookmarkList from "@/components/BookmarkList";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
  });
};


  if (!user) {
    return (
      <main className="flex h-screen items-center justify-center">
        <button
          onClick={loginWithGoogle}
          className="px-6 py-3 bg-black text-white rounded"
        >
          Sign in with Google
        </button>
      </main>
    );
  }

  return <BookmarkList user={user} />;
}
