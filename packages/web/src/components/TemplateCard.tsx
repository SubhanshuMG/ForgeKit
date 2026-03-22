// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import React from 'react';
import { Template } from '../types';
import '../styles/components.css';
import './TemplateCard.css';

interface TemplateCardProps {
  template: Template;
  selected?: boolean;
  onClick?: () => void;
}

const STACK_ICONS: Record<string, string> = {
  node: '🟢', react: '⚛️', typescript: '🔷', python: '🐍',
  fastapi: '⚡', docker: '🐳', postgresql: '🐘', jupyter: '📓',
  mlflow: '📊', vite: '⚡', express: '🚂',
};

export default function TemplateCard({ template, selected = false, onClick }: TemplateCardProps) {
  return (
    <div
      className={`card clickable template-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      aria-pressed={selected}
    >
      <div className="template-card-header">
        <span className="template-id badge badge-default">{template.id}</span>
        {selected && <span className="badge badge-accent">Selected</span>}
      </div>
      <h3 className="template-name">{template.name}</h3>
      <p className="template-description">{template.description}</p>
      <div className="template-stack">
        {template.stack.map(tech => (
          <span key={tech} className="stack-tag">
            {STACK_ICONS[tech] || '▪'} {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
