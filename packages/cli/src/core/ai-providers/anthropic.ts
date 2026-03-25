// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import * as https from 'https';
import { AIProvider, ProjectSpec, Template } from '../../types';
import { buildSystemPrompt, parseAIResponse } from './shared';

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || 'claude-sonnet-4-6';
  }

  async generateProjectSpec(description: string, templates: Template[]): Promise<ProjectSpec> {
    const systemPrompt = buildSystemPrompt(templates);

    const payload = JSON.stringify({
      model: this.model,
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        { role: 'user', content: description },
      ],
    });

    const response = await this.callAPI(payload);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content = (response as any).content?.[0]?.text;
    if (!content) {
      throw new Error('Anthropic returned an empty response. Please try again.');
    }
    return parseAIResponse(content, templates);
  }

  private callAPI(payload: string): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: 'api.anthropic.com',
          path: '/v1/messages',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => {
            const body = Buffer.concat(chunks).toString('utf-8');
            if (res.statusCode && res.statusCode >= 400) {
              let message = `Anthropic API error (HTTP ${res.statusCode})`;
              try {
                const parsed = JSON.parse(body);
                if (parsed.error?.message) message = parsed.error.message;
              } catch { /* use default message */ }
              reject(new Error(message));
              return;
            }
            try {
              resolve(JSON.parse(body));
            } catch {
              reject(new Error('Failed to parse Anthropic response'));
            }
          });
          res.on('error', reject);
        }
      );
      req.on('error', reject);
      // Validate payload is well-formed JSON before sending to external API
      JSON.parse(payload);
      req.write(payload);
      req.end();
    });
  }
}
