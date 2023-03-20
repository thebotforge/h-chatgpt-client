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

import { ChatIcon } from '../../images/assets';
import { Chat, Message } from '../../types/chat';
import { isOrphan, quote } from '../helpers/annotation-metadata';
import { ChatsService } from '../services/chats';
import { useSidebarStore } from '../store';
import AnnotationQuote from './Annotation/AnnotationQuote';
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
  // Should the text content of `Excerpt` be rendered in a collapsed state,
  // assuming it is collapsible (exceeds allotted collapsed space)?
  const [collapsed, setCollapsed] = useState(true);

  // Does the text content of `Excerpt` take up enough vertical space that
  // collapsing/expanding is relevant?
  const [collapsible, setCollapsible] = useState(false);
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

  const displayChats = useMemo(() => {
    console.log(store.getChats());
    console.groupCollapsed(collapsed);
    if (store.getChats()) {
      return store.getChats().map((chat, index) => {
        const props = `chats-${index}`;

        return (
          <div class="flex flex-col">
            <div class="flex">
              <div class="flex grow flex-row pl-2">
                {/* <span class="pl-1.5">{chat.messages?.length} Responses</span> */}
              </div>
              <div class="flex-row">Date</div>
            </div>
            <div class="w-full">
              <AnnotationQuote
                quote={chat.title || ''}
                isHovered={false}
                isOrphan={isOrphan(store.getCurrentAnnotation())}
              />
            </div>
            <Excerpt
              collapse={collapsed}
              collapsedHeight={150}
              inlineControls={true}
              onCollapsibleChanged={setCollapsible}
              onToggleCollapsed={setCollapsed}
              overflowThreshold={20}
            >
              <div class="h-496">
                {(chat?.messages ?? [])
                  .filter(message => message?.role !== 'system')
                  .map((message, index) => {
                    return <ChatMessage message={message as Message} />;
                  })}
              </div>
            </Excerpt>
            <div class="flex flex-row-reverse">
              <div class="flex grow"></div>
              <IconButton
                icon={EditIcon}
                title="Edit"
                onClick={() => onEdit(chat.id)}
              />
              <IconButton
                icon={TrashFilledIcon}
                title="Edit"
                onClick={() => onDeleteChat(chat.id)}
              />
            </div>
          </div>
        );
      });
    }
  }, [store, chats]);
  return <div>{displayChats}</div>;
};

export default ChatList;
