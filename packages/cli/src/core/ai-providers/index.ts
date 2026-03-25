// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import { AIProvider } from '../../types';
import { loadConfig } from '../config';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';

export function getAIProvider(): AIProvider {
  const config = loadConfig();

  // Check env vars first (preferred), then config
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Prefer config-specified provider if both keys exist
  const preferred = config.ai?.provider;
  const model = config.ai?.model;

  if (preferred === 'anthropic' && anthropicKey) {
    return new AnthropicProvider(anthropicKey, model);
  }
  if (preferred === 'openai' && openaiKey) {
    return new OpenAIProvider(openaiKey, model);
  }

  // Auto-detect: prefer Anthropic if available
  if (anthropicKey) {
    return new AnthropicProvider(anthropicKey, model);
  }
  if (openaiKey) {
    return new OpenAIProvider(openaiKey, model);
  }

  throw new Error(
    'No AI provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable.\n\n' +
    '  export OPENAI_API_KEY=sk-...\n' +
    '  # or\n' +
    '  export ANTHROPIC_API_KEY=sk-ant-...\n'
  );
}
