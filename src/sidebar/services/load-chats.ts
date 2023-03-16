import type { Chat } from '../../types/chats-api';
import type { SortBy, SortOrder } from '../search-client';
import type { SidebarStore } from '../store';
import { ChatAPIService } from './chats-api';

export type LoadChatsOptions = {
  groupId: string;
  uris?: string[];
  /**
   * If number of annotations in search results exceeds this value, do not load
   * annotations (see: `SearchClient`)
   */
  maxResults?: number;

  /**
   * `sortBy` and `sortOrder` control in what order annotations are loaded. To
   * minimize visible content changing as annotations load, `sortBy` and
   * `sortOrder` should be chosen to correlate with the expected presentation
   * order of annotations/threads in the current view.
   */
  sortBy?: SortBy;
  sortOrder?: SortOrder;

  /**
   * Optional error handler for SearchClient. Default error handling logs errors
   * to console.
   */
  onError?: (error: Error) => void;
};

/**
 * A service for fetching annotations via the Hypothesis API and loading them
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

  constructor(api: ChatAPIService, store: SidebarStore) {
    this._api = api;
    this._store = store;
  }

  /**
   * Load chats from local storage.
   *
   */
  load({
    groupId,
    uris,
    onError,
    maxResults,
    sortBy,
    sortOrder,
  }: LoadChatsOptions) {
    console.log('load all the chats');
  }
}
