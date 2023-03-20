import type { Chat } from '../../types/chat';
import type { SortBy, SortOrder } from '../search-client';
import type { SidebarStore } from '../store';
import { ChatAPIService } from './chats-api';
import { LocalStorageService } from './local-storage';

/**
 * A service for fetching annotations via the Hypothesis Chat local storage and loading them
 * into the store.
 *
 * In addition to fetching annotations it also handles configuring the
 * WebSocket connection so that appropriate real-time updates are received
 * for the set of annotations being displayed.
 *
 * @inject
 */
export class LoadChatsService {
  private _api: ChatAPIService;
  private _store: SidebarStore;
  private _localStorage: LocalStorageService;

  constructor(
    api: ChatAPIService,
    store: SidebarStore,
    localStorage: LocalStorageService
  ) {
    this._api = api;
    this._store = store;
    this._localStorage = localStorage;
  }

  /**
   * Load chats from local storage.
   *
   */
  load() {
    console.log('load all the chats');
    const savedChats =
      this._localStorage.getObject('hypothesis.ai.chats') || [];

    savedChats.forEach((chat: Chat) => {
      console.log(chat);
      this._store.updateChat(chat);
    });
  }
}
