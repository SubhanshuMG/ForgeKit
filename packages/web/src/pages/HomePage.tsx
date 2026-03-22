// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import React from 'react';
import { Link } from 'react-router-dom';
import TemplateCard from '../components/TemplateCard';
import { TEMPLATES } from '../data/templates';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge badge badge-accent">v0.1 — Early Access</div>
          <h1 className="hero-title">
            Ship faster.<br />
            <span className="hero-accent">Start in seconds.</span>
          </h1>
          <p className="hero-subtitle">
            ForgeKit scaffolds production-ready projects from battle-tested templates.
            No configuration, no boilerplate, no wasted time.
          </p>
          <div className="hero-actions">
            <Link to="/new" className="btn btn-primary btn-lg">
              Create project
            </Link>
            <a
              href="https://github.com/forgekit/forgekit"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-lg"
            >
              View on GitHub
            </a>
          </div>
          <div className="hero-cli">
            <code>npx @forgekit/cli new</code>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Templates</h2>
            <p className="section-subtitle">Production-ready starting points for every stack</p>
          </div>
          <div className="templates-grid">
            {TEMPLATES.map(t => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
          <div className="section-footer">
            <Link to="/templates" className="btn btn-ghost">
              View all templates →
            </Link>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="features-grid">
            {[
              { icon: '⚡', title: 'Day-1 ready', desc: 'Every template runs on first scaffold. No broken starters.' },
              { icon: '🔒', title: 'Security first', desc: 'Path sandboxing, dependency auditing, and secret scanning built in.' },
              { icon: '🧩', title: 'Modular', desc: 'Add templates without touching core. The right abstraction, no more.' },
              { icon: '📖', title: 'Open source', desc: 'Apache 2.0. Fork it, extend it, contribute back. No lock-in.' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
