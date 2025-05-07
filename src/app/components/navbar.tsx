'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">GreenKitchen</div>
      <div className="navbar-links">
        <Link href="/user" className="navbar-link">
          Home
        </Link>
        <Link href="/explore" className="navbar-link">
          Explore
        </Link>
        <Link href="/upload" className="navbar-button">
          Upload Recipe
        </Link>
      </div>
    </nav>
  );
}