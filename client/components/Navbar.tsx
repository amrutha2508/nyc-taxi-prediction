"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '../app/globals.css'

const navItems = [
  { name: 'Overview', path: '/overviewDashboard' },
  { name: 'Datasets', path: '/datasets' },
  { name: 'Models', path: '/models' },
  { name: 'Training', path: '/training' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        
        return (
          <Link
            key={item.path}
            href={item.path}
            className={isActive ? "nav-link active" : "nav-link"}
          >
            {item.name}
          </Link>
        );
      })}
      <span className="nav-link" style={{ cursor: 'pointer' }}>Settings</span>
    </nav>
  );
}