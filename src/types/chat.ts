import { AnnotationData } from './annotator';
import { Annotation } from './api';
import { ChatMessage } from './chats-api';

export interface Usage {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
}

export interface Parameters {
  temperature: number;
  apiKey?: string;
  initialSystemPrompt?: string;
}

export interface Message {
  id: string;
  chatID: string | undefined;
  parentID?: string;
  timestamp: number;
  role: string;
  content: string;
  parameters?: Parameters;
  done?: boolean;
  usage?: Usage;
  model?: string;
  userMessage?: string;
}

export interface UserSubmittedMessage {
  chatID: string;
  parentID?: string;
  content: string;
  requestedParameters: Parameters;
}

export interface OpenAIMessage {
  role: string;
  content: string;
}

export function getOpenAIMessage(message: Message): ChatMessage {
  return {
    role: message.role,
    content: message.content,
  };
}

export interface Chat {
  id?: string;
  title?: string | null;
  messages?: Message[];
  created?: string | undefined;
  updated?: string;
  annotation?: AnnotationData | Annotation;
  editing?: boolean;
}

export interface RootState {
  messages: string[];
}
