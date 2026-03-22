// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import React, { useState } from 'react';
import TemplateCard from '../components/TemplateCard';
import { TEMPLATES } from '../data/templates';
import { Template } from '../types';
import './NewProjectPage.css';

type Step = 'template' | 'configure' | 'result';

export default function NewProjectPage() {
  const [step, setStep] = useState<Step>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [projectName, setProjectName] = useState('');

  function handleSelectTemplate(t: Template) {
    setSelectedTemplate(t);
    setStep('configure');
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setStep('result');
  }

  if (step === 'result') {
    return (
      <div className="new-page">
        <div className="new-inner">
          <div className="result-card card">
            <div className="result-icon">✅</div>
            <h2>Ready to scaffold!</h2>
            <p>Run this command in your terminal:</p>
            <pre className="result-command">
              <code>npx @forgekit/cli new {projectName} --template {selectedTemplate?.id}</code>
            </pre>
            <p className="result-note">
              The web UI integration with the CLI is coming in a future release.
              For now, use the CLI command above.
            </p>
            <button className="btn btn-secondary" onClick={() => { setStep('template'); setSelectedTemplate(null); setProjectName(''); }}>
              Start over
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'configure' && selectedTemplate) {
    return (
      <div className="new-page">
        <div className="new-inner">
          <div className="step-header">
            <button className="btn btn-ghost" onClick={() => setStep('template')}>← Back</button>
            <div className="step-indicator">Step 2 of 2</div>
          </div>
          <h1 className="section-title">Configure your project</h1>
          <p className="section-subtitle">Using template: <strong>{selectedTemplate.name}</strong></p>

          <form onSubmit={handleCreate} className="configure-form">
            <div className="form-group">
              <label className="label" htmlFor="projectName">Project name</label>
              <input
                id="projectName"
                type="text"
                className="input"
                placeholder="my-awesome-project"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                required
                pattern="[a-z0-9-_]+"
                title="Lowercase letters, numbers, hyphens, and underscores only"
                autoFocus
              />
              <span className="input-hint">Lowercase letters, numbers, and hyphens only</span>
            </div>
            <button type="submit" className="btn btn-primary" disabled={!projectName.trim()}>
              Generate command →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="new-page">
      <div className="new-inner">
        <div className="step-indicator">Step 1 of 2</div>
        <h1 className="section-title">Choose a template</h1>
        <p className="section-subtitle">Select the stack that best fits your project</p>
        <div className="templates-grid">
          {TEMPLATES.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              selected={selectedTemplate?.id === t.id}
              onClick={() => handleSelectTemplate(t)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
