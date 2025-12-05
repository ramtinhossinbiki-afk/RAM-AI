export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  isError?: boolean;
  groundingChunks?: GroundingChunk[];
}

export enum ResponseMode {
  CONCISE = 'concise',
  DETAILED = 'detailed'
}