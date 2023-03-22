import {
  EditIcon,
  IconButton,
  TrashIcon,
} from '@hypothesis/frontend-shared/lib/next';
import { h, FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

import { Chat, Message } from '../../../types/chat';
import { isOrphan } from '../../helpers/annotation-metadata';
import { ChatsService } from '../../services/chats';
import { useSidebarStore } from '../../store';
import AnnotationQuote from '../Annotation/AnnotationQuote';
import AnnotationTimestamps from '../Annotation/AnnotationTimestamps';
import Excerpt from '../Excerpt';
import ChatMessage from './ChatMessage';

interface ChatProps {
  chat: Chat;
  onEdit: (id: string | undefined) => void;
  onDeleteChat: (id: string | undefined) => void;
  onDeleteMessage: (id: string | undefined) => void;
}

export default function ChatCard({
  chat,
  onEdit,
  onDeleteChat,
  onDeleteMessage,
}: ChatProps) {
  const store = useSidebarStore();
  // Should the text content of `Excerpt` be rendered in a collapsed state,
  // assuming it is collapsible (exceeds allotted collapsed space)?
  const [collapsed, setCollapsed] = useState(true);

  // Does the text content of `Excerpt` take up enough vertical space that
  // collapsing/expanding is relevant?
  const [collapsible, setCollapsible] = useState(false);
  return (
    <div class="flex flex-col bg-white p-3 mb-3">
      <div class="flex">
        <div class="flex grow flex-row pl-2 text-md text-color-text font-bold">
          {/* <span class="pl-1.5">{chat.messages?.length} Responses</span> */}
          H User
        </div>
        <div className="flex justify-end grow">
          <AnnotationTimestamps
            annotationCreated={chat.created as string}
            annotationUpdated={chat.updated as string}
            annotationURL={''}
            withEditedTimestamp={false}
          />
        </div>
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
              return (
                <ChatMessage
                  onDeleteMessage={onDeleteMessage}
                  message={message as Message}
                />
              );
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
          icon={TrashIcon}
          title="Edit"
          onClick={() => onDeleteChat(chat.id)}
        />
      </div>
    </div>
  );
}
