// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/new', label: 'New Project' },
  { path: '/templates', label: 'Templates' },
  { path: '/docs', label: 'Docs' },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">⚡</span>
            <span className="brand-name">ForgeKit</span>
          </Link>
          <ul className="navbar-links">
            {NAV_ITEMS.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`navbar-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="navbar-actions">
            <a
              href="https://github.com/forgekit/forgekit"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>
      <main className="main">{children}</main>
    </div>
  );
}
