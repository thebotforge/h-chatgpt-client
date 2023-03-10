// Define types for the request and response objects
interface ChatMessage {
  role: string;
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
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

interface ChatCompletionResponse {
  completions: {
    message: string;
    model: string;
    choices: {
      text: string;
      index: number;
      logprobs: any;
      finish_reason: string;
    }[];
  }[];
}


/*
  ChatService class that interacts with the Chat API
  const chatService = new ChatService('your_api_key_here');

  const request = {
    model: 'gpt-3.5-turbo',
    messages: [{ text: 'Hi', speaker: 'user' }],
    n: 1,
  };

  chatService.completeChat(request)
    .then(response => console.log(response))
    .catch(error => console.error(error));
*/
export class ChatService {
  // Set the URL for the Chat API and store the API key
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    // Store the API key
    this.apiKey = apiKey;
  }




  async completeChat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    });

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    };

    const response = await fetch(this.apiUrl, options);

    if (!response.ok) {
      throw new Error(`Failed to complete chat: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json() as ChatCompletionResponse;

    // Return the response data
    return responseData;
  }
}