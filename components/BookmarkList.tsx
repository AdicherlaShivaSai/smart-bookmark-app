"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function BookmarkList({ user }: any) {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  // Fetch bookmarks
  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };

  // Realtime + initial fetch
  useEffect(() => {
    fetchBookmarks();

    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        fetchBookmarks,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  // Add bookmark
  const addBookmark = async () => {
    if (!title || !url) return;

    await supabase.from("bookmarks").insert({
      title,
      url,
    });

    setTitle("");
    setUrl("");
    fetchBookmarks(); // ensures UI update
  };

  // Delete bookmark
  const deleteBookmark = async (id: string) => {
    await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    fetchBookmarks();
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center pt-16">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-sm p-6 mb-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Bookmarks</h1>

          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-900 transition"
          >
            Logout
          </button>
        </div>

        {/* Add Bookmark */}
        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Bookmark title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button
            onClick={addBookmark}
            className="bg-blue-600 text-white text-sm px-4 rounded-md hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>

        {/* Empty state */}
        {bookmarks.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">
            No bookmarks yet. Add your first one 🚀
          </p>
        )}

        {/* Bookmark list */}
        <ul className="space-y-3">
          {bookmarks.map((b) => (
            <li
              key={b.id}
              className="flex justify-between items-center border border-gray-200 rounded-md px-4 py-3"
            >
              <a
                href={b.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline truncate max-w-[70%]"
              >
                {b.title}
              </a>

              <button
                onClick={() => deleteBookmark(b.id)}
                className="text-sm text-red-500 hover:text-red-700 transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
