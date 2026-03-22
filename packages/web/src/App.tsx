// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import NewProjectPage from './pages/NewProjectPage';
import TemplatesPage from './pages/TemplatesPage';
import DocsPage from './pages/DocsPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new" element={<NewProjectPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/docs" element={<DocsPage />} />
      </Routes>
    </Layout>
  );
}
