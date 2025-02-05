import { TextQuoteSelector } from '../../annotator/anchoring/types';
import { generateHexString } from '../../shared/random';
import { AnnotationData } from '../../types/annotator';
import { getOpenAIMessage, Message, Usage,Chat } from '../../types/chat';
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
} from '../../types/chats-api';
import * as metadata from '../helpers/annotation-metadata';
import { SidebarStore } from '../store';
import { ChatAPIService } from './chats-api';
import { LocalStorageService } from './local-storage';
import { ToastMessengerService } from './toast-messenger';

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
  private _localStorage: LocalStorageService;
  private _toastMessenger: ToastMessengerService;

  /**
   * @param {import('./chats-api').ChatAPIService} api
   * @param {import('../store').SidebarStore} store
   */
  constructor(
    api: ChatAPIService,
    store: SidebarStore,
    localStorage: LocalStorageService,
    toastMessenger: ToastMessengerService
  ) {
    this._api = api;
    this._store = store;
    this._localStorage = localStorage;
    this._toastMessenger = toastMessenger;
    const localKey = this._store.getDefault('openAIApiKey');
    if (typeof localKey === 'string') {
      this._store.createOpenAIApiKey(localKey);
    }
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
    this._store.createAnnotation(annotation);
    this._store.clearChat();
  }

  _initialize(annotationData: AnnotationData, now = new Date()) {
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
      annotation: annotation,
      title: `Chat about: ${title}`,
      messages: [],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      tags: [],
    };

    this._store.updateCurrentChat(newChatData)

    const newSystemMessage: Message = {
      id: generateHexString(8),
      chatID: this._store.getCurrentChat()?.id,
      timestamp: Date.now(),
      apiTime: 0,
      role: 'system',
      content: 'You are a helpful assistant and want to help with this text.',
      done: true,
    };

    this._store.createChatMessage(newSystemMessage);

    //get all the values I need

    let newMessage: Message = {
      id: generateHexString(8),
      chatID: this._store.getCurrentChat()?.id,
      timestamp: Date.now(),
      role: 'user',
      content:
        `This chat is about the document at: "${uri}" with the title "${title}" the text in question is "${exact}" ${this._store.getCurrentMessage()}`.trim(),
      done: true,
      displayMessage: this._store.getCurrentMessage(),
    };

    this._store.createChatMessage(newMessage);
  }

  public async sendMessage() {
    try {
      //check if current message has an id
      if (
        this._store.getCurrentChat() !== undefined &&
        this._store.getCurrentChat()?.id &&
        this._store.getCurrentChat()?.annotation?.$tag ===
          this._store.getCurrentAnnotation().$tag
      ) {
        console.log('follow on chat');

        let newMessage: Message = {
          id: generateHexString(8),
          chatID: this._store.getCurrentChat()?.id,
          timestamp: Date.now(),
          role: 'user',
          content: `${this._store.getCurrentMessage()}`.trim(),
          done: true,
          displayMessage: `${this._store.getCurrentMessage()}`.trim(),
        };
        this._store.createChatMessage(newMessage);
        await this.completeMessage();
        this.persistChats();
      } else {
        console.log('new chat');
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
        messages: this._store.getCurrentChat()?.messages?.map(getOpenAIMessage),
        n: 1,
      };

      this._chatService = new ChatAPIService(
        this._store.getOpenAIApiKey(),
        this._store,
        this._toastMessenger
      );

      const response = await this._chatService.completeChat(request);
      const cleanedMessage =
        response['choices'][0]['message']['content'].trim();
      const cleanedRole = response['choices'][0]['message']['role'].trim();
      
      const responseMessage: Message = {
        id: generateHexString(8),
        chatID: this._store.getCurrentChat()?.id,
        timestamp: Date.now(),
        role: cleanedRole,
        content: cleanedMessage,
        done: true,
        model: response.model,
        usage: response.usage as Usage,
        apiTime: response.elapsedTime
      };
      this._store.createChatMessage(responseMessage);
   
    } catch (error) {
      console.log(`problem sending to service ${error}`);
      const responseMessage: Message = {
        id: generateHexString(8),
        chatID: this._store.getCurrentChat()?.id,
        timestamp: Date.now(),
        role: 'assistant',
        apiTime: 0,
        content:
          '****************sorry I had a problem with the service*************',
        done: true,
      };
      this._store.createChatMessage(responseMessage);
    }
  }

  persistChats() {
    this._localStorage.setObject('hypothesis.ai.chats', this._store.getChats());
  }
  deleteChatMessage(id: string) {
    this._store.deleteChatMessage(id);
    this.persistChats();
  }

  deleteChat(id: string) {
    this._store.deleteChat(id);
    this.persistChats();
  }

  saveChat() {
    this._store.updateChat(this._store.getCurrentChat() as Chat)
    this._store.clearChat();
    this.persistChats();
  }

  public getMessages() {
    return this.messages;
  }
}
