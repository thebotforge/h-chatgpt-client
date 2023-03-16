import { AnnotationData } from '../../../types/annotator';
import { Chat, Message } from '../../../types/chat';
import { createStoreModule, makeAction } from '../create-store';

/**
 * @typedef {import('../../../types/config').SidebarSettings} SidebarSettings
 */
export type State = typeof initialState;

const initialState = {
  chatting: true,
  chat: {},
  chats: [],
  annotation: {},
  openAIApiKey: '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',
  currentMessage: '',
};

/**
 *
 * @param {State} state
 */
function isChatting(state: any) {
  return state.chatting;
}

const reducers = {
  /**
   * @param {State} state
   * @param {{ message: string }} action
   */
  UPDATE_MESSAGE(state: any, action: { message: string }) {
    return {
      ...state,
      currentMessage: action.message,
    };
  },

  /**
   * @param {State} state
   * @param {{ annotation: AnnotationData }} action
   */
  UPDATE_ANNOTATION(state: any, action: { annotation: AnnotationData }) {
    return {
      annotation: action.annotation,
    };
  },

  /**
   * @param {State} state
   * @param {{ openAIApiKey: string }} action
   */
  UPDATE_KEY(state: any, action: { openAIApiKey: any }) {
    return {
      openAIApiKey: action.openAIApiKey,
    };
  },

  /**
   * @param {State} state
   * @param {{ action: string }} action
   */
  ADD_CHAT_MESSAGE(
    state: any,
    action: { chat: Chat; message: Message }
  ): Partial<State> {
    const chat = state.chat;

    return {
      ...state,
      chat: { ...chat, messages: [...chat.messages, action.message] },
    };
  },

  /**
   * @param {State} state
   * @param {{ action: string }} action
   */
  UPDATE_CHAT(state: any, action: { chat: Chat }): Partial<State> {
    // Find the chat object with the matching chatID
    const chatIndex = state.chats.findIndex(
      (chat: Chat) => chat.id === action.chat.id
    );
    let chats = state.chats;

    if (chatIndex === -1) {
      // Chat not found, add it to the chats array
      chats = [...state.chats, action.chat];
    } else {
      // Chat found, update it in the chats array
      chats[chatIndex] = action.chat;
    }

    return {
      ...state,
      chat: action.chat,
      chats: chats,
    };
  },
};

function createChatMessage(chat: Chat, message: Message) {
  return makeAction(reducers, 'ADD_CHAT_MESSAGE', { chat, message });
}

function updateUserMessage(message: any) {
  return makeAction(reducers, 'UPDATE_MESSAGE', { message });
}

/**
 * Return all chats
 */
function getChats(state: State): Chat[] {
  return state.chats;
}

/**
 * Create or update a chat
 *
 * @param {ChatID} chat
 * @param {ChatChanges} changes
 */
function updateChat(chat: Chat) {
  return makeAction(reducers, 'UPDATE_CHAT', { chat });
}

/**
 * Update
 *
 * @param {ChatID} chat
 * @param {ChatChanges} changes
 */
function addChat(chat: Chat) {
  return makeAction(reducers, 'UPDATE_CHAT', { chat });
}

/**
 * Create the annotation
 *
 * @param {AnnotationID} annotation
 * @param {ChatChanges} changes
 */
function createAnnotation(annotation: AnnotationData) {
  return makeAction(reducers, 'UPDATE_ANNOTATION', { annotation });
}

/**
 * Create the key
 *
 * @param {openAIApiKey} openAIApiKey
 */
function createOpenAIApiKey(openAIApiKey: string) {
  return makeAction(reducers, 'UPDATE_KEY', { openAIApiKey });
}

/**
 * get the current chats
 */
function getCurrentChat(state: State): Chat {
  return state.chat;
}

/**
 * get the current chats
 */
function getCurrentAnnotation(state: State): any {
  return state.annotation;
}

function getOpenAIApiKey(state: State): any {
  return state.openAIApiKey;
}

function getCurrentMessage(state: State): any {
  return state.currentMessage;
}

/**
 * Return true when any activity is happening in the app that needs to complete
 * before the UI is ready for interactivity with annotations.
 *
 * @param {State} state
 */
function needsOpenApiKey(state: State) {
  return !state.openAIApiKey;
}

function findChatByID(state: State, id: string) {
  return findByID(state.chats, id);
}

function findByID(chats: Chat[], id: string) {
  return chats.find(a => a.id === id);
}

export const chatsModule = createStoreModule(initialState, {
  namespace: 'chats',
  reducers,

  actionCreators: {
    updateUserMessage,
    updateChat,
    createAnnotation,
    createOpenAIApiKey,
    createChatMessage,
  },

  selectors: {
    isChatting,
    getChats,
    getCurrentChat,
    getCurrentAnnotation,
    getOpenAIApiKey,
    getCurrentMessage,
    needsOpenApiKey,
    findChatByID,
  },
});
