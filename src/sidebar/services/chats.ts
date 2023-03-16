import { TextQuoteSelector } from '../../annotator/anchoring/types';
import { generateHexString } from '../../shared/random';
import { AnnotationData } from '../../types/annotator';
import { getOpenAIMessage, Message } from '../../types/chat';
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
} from '../../types/chats-api';
import * as metadata from '../helpers/annotation-metadata';
import { SidebarStore } from '../store';
import { ChatAPIService } from './chats-api';

/**
 * @typedef {import('../../types/api').Annotation} Annotation
 * @typedef {import('../../types/annotator').AnnotationData} AnnotationData
 * @typedef {import('../../types/api').SavedAnnotation} SavedAnnotation
 */

/**
 * A service for creating, updating and persisting annotations both in the
 * local store and on the backend via the API.
 */
// @inject
export class ChatsService {
  private _api: ChatAPIService;
  private _store: SidebarStore;
  private _chatService?: ChatAPIService;

  /**
   * @param {import('./chats-api').ChatAPIService} api
   * @param {import('../store').SidebarStore} store
   */
  constructor(api: ChatAPIService, store: SidebarStore) {
    this._api = api;
    this._store = store;
  }

  /**
   * Populate a new annotation object from `annotation` and add it to the store.
   * Create a draft for it unless it's a highlight and clear other empty
   * drafts out of the way.
   *
   * @param {Omit<AnnotationData, '$tag'>} annotationData
   * @param {Date} now
   */
  create(annotationData: AnnotationData, now = new Date()) {
    const annotation = this._initialize(annotationData, now);
    console.log(annotation.$tag);
    this._store.createAnnotation(annotation);
  }

  _initialize(annotationData: AnnotationData, now = new Date()) {
    console.log(annotationData);
    const $tag = generateHexString(8);
    /** @type {Annotation} */
    const annotation = Object.assign(
      {
        created: now.toISOString(),
        tags: [],
        text: '',
        updated: now.toISOString(),
        tag: '',
        hidden: false,
        links: {},
        document: { title: '' },
      },
      annotationData
    );
    return annotation;
  }

  private messages: string[] = [];

  async sendNewMessage() {
    console.log('initial chat');
    const annotation = this._store.getCurrentAnnotation();

    if (!annotation.$tag) {
      alert('no annotation');
      return;
    }

    const {
      uri,
      document: { title },
      target: [{ selector }],
    } = annotation;

    const { exact } = selector.find(
      ({ type }: any) => type === 'TextQuoteSelector'
    );

    const newChatData = {
      id: generateHexString(8),
      annotationTag: annotation.$tag,
      title: `Chat about: ${title}`,
      messages: [],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };

    this._store.updateChat(newChatData);

    const newSystemMessage: Message = {
      id: generateHexString(8),
      chatID: this._store.getCurrentChat().id,
      timestamp: Date.now(),
      role: 'system',
      content: 'You are a helpful assistant and want to help with this text.',
      done: true,
    };

    this._store.createChatMessage(
      this._store.getCurrentChat(),
      newSystemMessage
    );

    //get all the values I need

    let newMessage: Message = {
      id: generateHexString(8),
      chatID: this._store.getCurrentChat().id,
      timestamp: Date.now(),
      role: 'user',
      content: `
      Look at the following annotation:
      URL: ${uri} 
      Title: ${title}
      Text: ${exact}
      ${this._store.getCurrentMessage()}
      `.trim(),
      done: true,
    };
    this._store.createChatMessage(this._store.getCurrentChat(), newMessage);
  }

  public async sendMessage() {
    //this.messages.push(this._store.getCurrentChat());
    console.log('Message sent:', this._store.getCurrentChat());
    try {
      //check if current message has an id
      if (this._store.getCurrentChat().id) {
        console.log('follow on chat');

        let newMessage: Message = {
          id: generateHexString(8),
          chatID: this._store.getCurrentChat().id,
          timestamp: Date.now(),
          role: 'user',
          content: `${this._store.getCurrentMessage()}`.trim(),
          done: true,
        };
        this._store.createChatMessage(this._store.getCurrentChat(), newMessage);
        await this.completeMessage();
      } else {
        //if not then create a new chat
        await this.sendNewMessage();
        await this.completeMessage();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async completeMessage() {
    try {
      const request: ChatCompletionRequest = {
        model: 'gpt-3.5-turbo',
        messages: this._store.getCurrentChat().messages?.map(getOpenAIMessage),
        n: 1,
      };

      this._chatService = new ChatAPIService(
        this._store.getOpenAIApiKey(),
        this._store
      );

      const response = await this._chatService.completeChat(request);
      const cleanedMessage =
        response['choices'][0]['message']['content'].trim();
      const cleanedRole = response['choices'][0]['message']['role'].trim();
      const responseMessage: Message = {
        id: generateHexString(8),
        chatID: this._store.getCurrentChat().id,
        timestamp: Date.now(),
        role: cleanedRole,
        content: cleanedMessage,
        done: true,
      };
      this._store.createChatMessage(
        this._store.getCurrentChat(),
        responseMessage
      );
    } catch (error) {
      console.log(`problem sending to service ${error}`);
    }
  }

  public getMessages() {
    return this.messages;
  }
}
