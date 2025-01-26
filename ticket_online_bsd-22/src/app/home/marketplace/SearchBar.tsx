"use client";

import { useState } from "react";

const SearchBar = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search tickets by name, venue, or date..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-black/40 backdrop-blur-xl border border-[#8E2DE2]/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00F5A0]/50"
      />
      <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E2DE2] hover:text-[#00F5A0] transition-colors">🔍</button>
    </div>
  );
};

export default SearchBar;
