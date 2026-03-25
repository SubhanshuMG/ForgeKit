// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import * as https from 'https';
import { AIProvider, ProjectSpec, Template } from '../../types';
import { buildSystemPrompt, parseAIResponse } from './shared';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || 'gpt-4o';
  }

  async generateProjectSpec(description: string, templates: Template[]): Promise<ProjectSpec> {
    const systemPrompt = buildSystemPrompt(templates);

    const payload = JSON.stringify({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: description },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const response = await this.callAPI(payload);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content = (response as any).choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned an empty response. Please try again.');
    }
    return parseAIResponse(content, templates);
  }

  private callAPI(payload: string): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: 'api.openai.com',
          path: '/v1/chat/completions',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => {
            const body = Buffer.concat(chunks).toString('utf-8');
            if (res.statusCode && res.statusCode >= 400) {
              let message = `OpenAI API error (HTTP ${res.statusCode})`;
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
              reject(new Error('Failed to parse OpenAI response'));
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
