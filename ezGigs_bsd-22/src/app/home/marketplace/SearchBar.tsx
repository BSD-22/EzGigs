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
        placeholder=" Search events..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-lg sm:rounded-xl bg-white border border-[#D3D9C9]"
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
