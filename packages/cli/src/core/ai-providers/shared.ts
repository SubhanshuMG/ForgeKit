// Copyright 2026 ForgeKit Contributors
// SPDX-License-Identifier: Apache-2.0
// https://github.com/SubhanshuMG/ForgeKit
import { ProjectSpec, Template } from '../../types';
import { sanitizeProjectName } from '../security';

export function buildSystemPrompt(templates: Template[]): string {
  const templateList = templates
    .map(t => `- ${t.id}: ${t.name} (${t.stack.join(', ')}) — ${t.description}`)
    .join('\n');

  return `You are ForgeKit's AI assistant. Given a project description, select the best matching template and suggest a project name.

Available templates:
${templateList}

Respond with ONLY a valid JSON object (no markdown, no explanation outside the JSON):
{
  "templateId": "the-template-id",
  "projectName": "suggested-kebab-case-name",
  "explanation": "Brief explanation of why this template fits the request"
}

Rules:
- templateId MUST be one of the available template IDs listed above
- projectName should be lowercase kebab-case, descriptive, and under 50 characters
- If the description doesn't clearly match any template, pick the closest one and explain why`;
}

export function parseAIResponse(content: string, templates: Template[]): ProjectSpec {
  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = content.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(
      'AI returned an invalid response. Please try rephrasing your project description.'
    );
  }

  const templateId = String(parsed.templateId || '');
  const projectName = sanitizeProjectName(String(parsed.projectName || 'my-project'));
  const explanation = String(parsed.explanation || '');

  // Validate templateId exists
  const validIds = templates.map(t => t.id);
  if (!validIds.includes(templateId)) {
    throw new Error(
      `AI suggested template "${templateId}" which doesn't exist. ` +
      `Available: ${validIds.join(', ')}`
    );
  }

  return {
    templateId,
    projectName,
    variables: { name: projectName },
    explanation,
  };
}
