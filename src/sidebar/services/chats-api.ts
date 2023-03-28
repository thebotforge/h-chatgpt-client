// Define types for the request and response objects
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
} from '../../types/chats-api';

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



class CustomResponse extends Response {
  elapsedTime: number;

  constructor(response: Response, elapsedTime: number) {
    super(response.body, response);
    this.elapsedTime = elapsedTime;
  }
}


/**
 * @param {import('../store').SidebarStore} store
 */
export class ChatAPIService {
  // Set the URL for the Chat API and store the API key
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly apiKey;
  private readonly store;

  constructor(apiKey: string, store: any) {
    // Store the API key
    this.apiKey = apiKey;
    this.store = store;
  }

  customFetch(
    url: string,
    options = {},
    onRequestStarted: Function,
    onRequestEnded: Function
  ) {


    const startTime = performance.now(); // Get the start timestamp

    if (typeof onRequestStarted === 'function') {
      onRequestStarted();
    }

    return fetch(url, options)
      .then(response => {

        const endTime = performance.now(); // Get the end timestamp
        const elapsedTime = endTime - startTime; // Calculate the elapsed time
        console.log(`API call took ${elapsedTime} ms`); // Log the elapsed time
        

        if (typeof onRequestEnded === 'function') {
          onRequestEnded();
        }
        
        return new CustomResponse(response, elapsedTime);
      })
      .catch(error => {
        if (typeof onRequestEnded === 'function') {
          onRequestEnded();
        }
        throw error;
      });
  }

  async completeChat(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    });

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    };

    const response = await this.customFetch(
      this.apiUrl,
      options,
      this.store.apiRequestStarted,
      this.store.apiRequestFinished
    );
    if (!response.ok) {
      throw new Error(
        `Failed to complete chat: ${response.status} ${response.statusText}`
      );
    }

    const responseData = (await response.json()) as ChatCompletionResponse;
    responseData.elapsedTime = response.elapsedTime;
    // Return the response data
    return responseData;
  }
}
