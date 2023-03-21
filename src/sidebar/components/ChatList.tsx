import {
  Button,
  CollapseIcon,
  EditIcon,
  ExpandIcon,
  IconButton,
  TrashFilledIcon,
} from '@hypothesis/frontend-shared/lib/next';
import classNames from 'classnames';
import { h, FunctionalComponent } from 'preact';
import { useMemo, useState } from 'preact/hooks';

import { Chat, Message } from '../../types/chat';
import { isOrphan, quote } from '../helpers/annotation-metadata';
import { ChatsService } from '../services/chats';
import { useSidebarStore } from '../store';
import AnnotationQuote from './Annotation/AnnotationQuote';
import ChatCard from './Chat/ChatCard';
import ChatMessage from './Chat/ChatMessage';
import Excerpt from './Excerpt';

type ToggleMessagesButtonProps = {
  classes?: string;
  setCollapsed: (collapse: boolean) => void;
  collapsed: boolean;
};

/**
 * Button to expand or collapse the annotation excerpt (content)
 */
function ToggleMessagesButton({
  classes,
  setCollapsed,
  collapsed,
}: ToggleMessagesButtonProps) {
  const toggleText = collapsed ? 'More' : 'Less';
  return (
    <Button
      classes={classNames('text-grey-7 font-normal', classes)}
      expanded={!collapsed}
      onClick={() => setCollapsed(!collapsed)}
      title={`Toggle visibility of full chat text: Show ${toggleText}`}
    >
      <div className="flex items-center gap-x-2">
        {collapsed ? (
          <ExpandIcon className="w-3 h-3" />
        ) : (
          <CollapseIcon className="w-3 h-3" />
        )}
        <div>{toggleText}</div>
      </div>
    </Button>
  );
}

export type ChatListProps = {
  chats: Chat[];
  chatsService: ChatsService;
};

const ChatList: FunctionalComponent<ChatListProps> = ({
  chats,
  chatsService,
}) => {
  const store = useSidebarStore();
  store.getChats();
  const onEdit = (id: string | undefined) => {
    //do something to the selected chat
    //change the current chat to this id

    if (id !== undefined) {
      const chat = store.findChatByID(id);

      store.updateChat(chat as Chat);
    }
  };

  const onDeleteChat = (id: string | undefined) => {
    //remove the message
    if (id !== undefined) {
      console.log(`remove ${id}`);
      chatsService.deleteChat(id);
    }
  };

  const onDeleteMessage = (id: string | undefined) => {
    //remove the message
    if (id !== undefined) {
      console.log(`remove ${id}`);
      chatsService.deleteChatMessage(id);
    }
  };

  const displayChats = useMemo(() => {
    if (store.getChats()) {
      return store.getChats().map((chat, index) => {
        const props = `chats-${index}`;

        return (
          <ChatCard
            chat={chat}
            onDeleteMessage={onDeleteMessage}
            onDeleteChat={onDeleteChat}
            onEdit={onEdit}
          />
        );
      });
    }
  }, [store, chats]);
  return <div>{displayChats}</div>;
};

export default ChatList;
