import {
  EditIcon,
  IconButton,
  TrashIcon,
} from '@hypothesis/frontend-shared/lib/next';
import { h, FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

import { AnnotationData } from '../../../types/annotator';
import { Annotation, Target } from '../../../types/api';
import { Chat, Message } from '../../../types/chat';
import { isOrphan, quote } from '../../helpers/annotation-metadata';
import { ChatsService } from '../../services/chats';
import { useSidebarStore } from '../../store';
import AnnotationQuote from '../Annotation/AnnotationQuote';
import AnnotationTimestamps from '../Annotation/AnnotationTimestamps';
import Excerpt from '../Excerpt';
import ChatMessage from './ChatMessage';

/**
 * @typedef {import('../../types/api').Annotation} Annotation
 */

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
    <div class="bg-white p-3 mb-3">
      <div class="flex mb-3">
        <div class="flex grow flex-row pl-2 text-md text-color-text font-bold">
          {/* <span class="pl-1.5">{chat.messages?.length} Responses</span> */}H
          User
        </div>
        <div className="flex justify-end grow" style={{ opacity: 0.5 }}>
          <AnnotationTimestamps
            annotationCreated={chat.created as string}
            annotationUpdated={chat.updated as string}
            annotationURL={''}
            withEditedTimestamp={false}
          />
        </div>
      </div>
      <div class="w-full mb-3">
        {chat.annotation && (
          <AnnotationQuote
            quote={quote(chat.annotation) as string}
            isHovered={false}
            isOrphan={isOrphan(chat.annotation)}
          />
        )}
      </div>
      <Excerpt
        collapse={collapsed}
        collapsedHeight={150}
        inlineControls={true}
        onCollapsibleChanged={setCollapsible}
        onToggleCollapsed={setCollapsed}
        overflowThreshold={20}
      >
        <div class="grid gap-2 h-496">
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
      <div class="flex">
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
