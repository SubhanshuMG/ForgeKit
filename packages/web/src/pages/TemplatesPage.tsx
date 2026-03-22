// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import React from 'react';
import { Link } from 'react-router-dom';
import TemplateCard from '../components/TemplateCard';
import { TEMPLATES } from '../data/templates';
import './TemplatesPage.css';

export default function TemplatesPage() {
  return (
    <div className="templates-page">
      <div className="page-inner">
        <div className="page-header">
          <h1 className="section-title">Templates</h1>
          <p className="section-subtitle">Production-ready project starters. Maintained by the ForgeKit team.</p>
          <Link to="/new" className="btn btn-primary">Create a project</Link>
        </div>
        <div className="templates-grid-full">
          {TEMPLATES.map(t => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
        <div className="contribute-cta card">
          <h3>Contribute a template</h3>
          <p>Have a stack you want to see? Open a template request or submit a PR.</p>
          <div className="cta-actions">
            <a href="https://github.com/forgekit/forgekit/issues/new?template=template_request.yml" className="btn btn-primary">Request a template</a>
            <a href="https://github.com/forgekit/forgekit/blob/main/docs/templates.md" className="btn btn-secondary">Template authoring guide</a>
          </div>
        </div>
      </div>
    </div>
  );
}
