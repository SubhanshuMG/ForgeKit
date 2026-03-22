// Copyright 2026 ForgeKit Contributors. Licensed under Apache 2.0.
export interface Template {
  id: string;
  name: string;
  description: string;
  stack: string[];
  version: string;
}

export interface ProjectConfig {
  name: string;
  templateId: string;
  outputDir: string;
  skipInstall: boolean;
}
