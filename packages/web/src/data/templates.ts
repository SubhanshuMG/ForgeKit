// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import { Template } from '../types';

export const TEMPLATES: Template[] = [
  {
    id: 'web-app',
    name: 'Web App (Node + React)',
    description: 'Full-stack web application with Node.js backend and React frontend',
    stack: ['node', 'react', 'typescript', 'express', 'vite'],
    version: '1.0.0',
  },
  {
    id: 'api-service',
    name: 'API Service (Python + FastAPI)',
    description: 'REST API service with FastAPI, PostgreSQL, and Docker',
    stack: ['python', 'fastapi', 'postgresql', 'docker'],
    version: '1.0.0',
  },
  {
    id: 'ml-pipeline',
    name: 'ML Pipeline (Python + Jupyter)',
    description: 'Machine learning workflow with Python, Jupyter, MLflow, and reproducible experiments',
    stack: ['python', 'jupyter', 'mlflow'],
    version: '1.0.0',
  },
];
