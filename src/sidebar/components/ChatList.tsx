import {
  Button,
  CollapseIcon,
  EditIcon,
  ExpandIcon,
  IconButton,
} from '@hypothesis/frontend-shared/lib/next';
import classNames from 'classnames';
import { h, FunctionalComponent } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { AnnotationData } from '../../types/annotator';

import { Chat, Message } from '../../types/chat';
import { isOrphan, quote } from '../helpers/annotation-metadata';
import { ChatsService } from '../services/chats';
import { useSidebarStore } from '../store';
import AnnotationQuote from './Annotation/AnnotationQuote';
import ChatCard from './Chat/ChatCard';
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
  const currentChat = store.getCurrentChat();
  const onEdit = (id: string | undefined) => {
    //do something to the selected chat
    //change the current chat to this id

    if (id !== undefined) {
      const chat = store.findChatByID(id);
      
      store.updateCurrentChat(chat as Chat);
      // @ts-ignore
      store.createAnnotation(chat.annotation)
    }
  };

  const onDeleteChat = (id: string | undefined) => {
    //remove the message
    if (id !== undefined) {
      chatsService.deleteChat(id);
    }
  };

  const onDeleteMessage = (id: string | undefined) => {
    //remove the message
    if (id !== undefined) {
      chatsService.deleteChatMessage(id);
    }
  };

  const displayChats = useMemo(() => {
    if (store.getChats()) {
      const filteredChats = currentChat
        ? store.getChats().filter(item => item.id !== currentChat?.id)
        : store.getChats();
      return filteredChats.map((chat, index) => {
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
  }, [store, chats, currentChat]);
  return <div>{displayChats}</div>;
};

export default ChatList;
