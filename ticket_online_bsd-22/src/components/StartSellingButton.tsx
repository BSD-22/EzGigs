'use client';

import Link from 'next/link';

export default function StartSellingButton() {
  return (
    <Link
      href="/home/marketplace/sell"
      className="inline-block mt-4 bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
      Start Selling
    </Link>
  );
}