import { createSelector } from 'reselect';

import { AnnotationData } from '../../../types/annotator';
import { Chat, Message } from '../../../types/chat';
import { createStoreModule, makeAction } from '../create-store';

/**
 * @typedef {import('../../../types/config').SidebarSettings} SidebarSettings
 */
export type State = typeof initialState;

const initialState = {
  chatting: true,
  chat: '',
  chats: [],
  annotation: {},
  openAIApiKey: '',
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
  CLEAR_CHAT(): Partial<State> {
    return { chat: '' };
  },

  CLEAR_ANNOTATION():Partial<State> {
    return { annotation: undefined };
  },


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
      ...state,
      annotation: action.annotation,
    };
  },

  /**
   * @param {State} state
   * @param {{ openAIApiKey: string }} action
   */
  UPDATE_KEY(state: any, action: { openAIApiKey: string }) {
    return {
      openAIApiKey: action.openAIApiKey,
    };
  },

  /**
   * @param {State} state
   * @param {{ action: string }} action
   */
  ADD_CHAT_MESSAGE(state: any, action: { message: Message }): Partial<State> {
    let currentChat = getCurrentChat(state);
    let chat = {
      ...currentChat,
      messages: [...(currentChat?.messages || []), action.message],
    };

    const chatIndex = state.chats.findIndex(
      (chat: Chat) => chat.id === state.chat
    );

    return {
      ...state,
      chats: [
        ...state.chats.slice(0, chatIndex),
        chat,
        ...state.chats.slice(chatIndex + 1),
      ],
    };
  },

  /**
   * @param {State} state
   * @param {{ action: string }} action
   */
  DELETE_CHAT_MESSAGE(state: any, action: { id: string }): Partial<State> {
    // Deep copy the state to avoid directly modifying the original state
    const chats = JSON.parse(JSON.stringify(state.chats));

    // Loop through the chats
    for (const chat of chats) {
      // Find the index of the message with the given ID in the current chat's messages array
      const messageIndex = chat.messages.findIndex(
        (message: Message) => message.id === action.id
      );

      // If a message with the given ID is found, remove it from the messages array
      if (messageIndex !== -1) {
        chat.messages.splice(messageIndex, 1);
        break; // Break the loop as the message has been found and deleted
      }
    }

    return {
      ...state,
      chats,
    };
  },

  /**
   * @param {State} state
   * @param {{ action: string }} action
   */
  DELETE_CHAT(state: any, action: { id: string }): Partial<State> {
    // Deep copy the state to avoid directly modifying the original state
    const chats = JSON.parse(JSON.stringify(state.chats));

    const messageIndex = chats.findIndex((chat: Chat) => chat.id === action.id);

    // If a message with the given ID is found, remove it from the messages array
    if (messageIndex !== -1) {
      chats.splice(messageIndex, 1);
    }

    return {
      ...state,
      chats,
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
    let annotation = action.chat.annotation;
    if (chatIndex === -1) {
      // Chat not found, add it to the chats array
      chats = [...state.chats, action.chat];
    } else {
      // Chat found, update it in the chats array
      chats = [
        ...state.chats.slice(0, chatIndex),
        action.chat,
        ...state.chats.slice(chatIndex + 1),
      ];
    }

    return {
      ...state,
      chat: action.chat.id,
      chats: chats,
      annotation: annotation,
    };
  },
};

function createChatMessage(message: Message) {
  return makeAction(reducers, 'ADD_CHAT_MESSAGE', { message });
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
 * get the current chat
 */

function getCurrentChat(state: State) {
  return findByID(state.chats, state.chat);
}

function getCurrentAnnotation(state: State): any {
  return state.annotation;
}

function getOpenAIApiKey(state: State): any {
  return state.openAIApiKey;
}

function getCurrentMessage(state: State): any {
  return state.currentMessage;
}

function chatCount(state: State): string {
  return state.chats.length.toString();
}

function deleteChatMessage(id: string) {
  return makeAction(reducers, 'DELETE_CHAT_MESSAGE', { id: id });
}
function deleteChat(id: string) {
  return makeAction(reducers, 'DELETE_CHAT', { id: id });
}

/** Set the currently displayed chats to the empty set. */
function clearChat() {
  return makeAction(reducers, 'CLEAR_CHAT', undefined);
}

/** Set the currently selected annotation. */
function clearAnnotation() {
  return makeAction(reducers, 'CLEAR_ANNOTATION', undefined);
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
    clearChat,
    clearAnnotation,
    createAnnotation,
    createOpenAIApiKey,
    createChatMessage,
    deleteChatMessage,
    deleteChat,
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
    chatCount
  },
});
