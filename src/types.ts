export interface CosmicConfig {
  ollamaModel: string;
  ollamaUrl: string;
}

export interface JournalEntry {
  time: string;
  text: string;
  tags: string[];
}

export interface ProjectMeta {
  name: string;
  description?: string;
}

export interface SearchFilter {
  text?: string;
  tag?: string;
  from?: string;
  to?: string;
}
