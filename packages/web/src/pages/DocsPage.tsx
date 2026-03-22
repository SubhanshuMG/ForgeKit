// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import React from 'react';
import './DocsPage.css';

const DOCS_LINKS = [
  { title: 'Quick Start', desc: 'Get from zero to a running project in 2 minutes', href: 'https://github.com/forgekit/forgekit/blob/main/docs/quickstart.md' },
  { title: 'CLI Reference', desc: 'All commands, flags, and options for @forgekit/cli', href: 'https://github.com/forgekit/forgekit/blob/main/docs/cli.md' },
  { title: 'Template Authoring', desc: 'How to create and contribute new templates', href: 'https://github.com/forgekit/forgekit/blob/main/docs/templates.md' },
  { title: 'Architecture', desc: 'How ForgeKit is structured and why', href: 'https://github.com/forgekit/forgekit/blob/main/docs/architecture.md' },
  { title: 'Contributing', desc: 'How to contribute code, templates, or docs', href: 'https://github.com/forgekit/forgekit/blob/main/CONTRIBUTING.md' },
  { title: 'Security', desc: 'Reporting vulnerabilities and security design', href: 'https://github.com/forgekit/forgekit/blob/main/SECURITY.md' },
];

export default function DocsPage() {
  return (
    <div className="docs-page">
      <div className="page-inner">
        <h1 className="section-title">Documentation</h1>
        <p className="section-subtitle">Everything you need to use and contribute to ForgeKit</p>
        <div className="docs-grid">
          {DOCS_LINKS.map(doc => (
            <a key={doc.title} href={doc.href} target="_blank" rel="noopener noreferrer" className="card docs-card">
              <h3>{doc.title}</h3>
              <p>{doc.desc}</p>
              <span className="docs-arrow">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
