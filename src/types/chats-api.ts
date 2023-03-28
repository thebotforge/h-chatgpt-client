import { ClientAnnotationData } from './shared';

export interface ChatMessage {
  role: string;
  content: string;
}

export interface Usage {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
}

export interface ChatCompletionRequest {
  model: string;
  messages?: ChatMessage[];
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: { [token: number]: number };
  user?: string;
}

export interface ChatCompletionResponse {
  usage: Usage;
  model: string;
  created: number;
  id: string;
  object: string;
  elapsedTime: number;
  choices: {
    text: string;
    index: number;
    finish_reason: string;
    message: ChatMessage;
  }[];
}
