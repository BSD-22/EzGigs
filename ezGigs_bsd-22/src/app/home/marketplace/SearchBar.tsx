"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    router.push(`/home/marketplace?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative">
      <input
        type="text"
        placeholder="Search tickets by name, venue, or date..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00F5A0]/50"
      />
      <button
        type="submit"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E2DE2] hover:text-[#00F5A0] transition-colors">
        🔍
      </button>
    </form>
  );
};

export default SearchBar;
