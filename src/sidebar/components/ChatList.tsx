import {
  EditIcon,
  IconButton,
  TrashFilledIcon,
} from '@hypothesis/frontend-shared/lib/next';
import { h, FunctionalComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import { ChatIcon } from '../../images/assets';

import { Chat } from '../../types/chat';
import { isOrphan, quote } from '../helpers/annotation-metadata';
import { ChatsService } from '../services/chats';
import { useSidebarStore } from '../store';
import AnnotationQuote from './Annotation/AnnotationQuote';
import ChatCard from './ChatCard';

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

  const displayChats = useMemo(() => {
    console.log(store.getChats());
    

    if (store.getChats()) {
      return store.getChats().map((chat, index) => {
        
        const props = `chats-${index}`;
        
        return (
        <div class="flex flex-col">
        <div class="flex">
          <div class="flex grow flex-row-reverse pl-2"><ChatIcon/> <span class="pl-1.5">{chat.messages?.length} Responses</span></div>
          <div class="flex-row">Date</div>
        </div>
        <div class="w-full">
        <AnnotationQuote
            quote={chat.title || ''}
            isHovered={false}
            isOrphan={isOrphan(store.getCurrentAnnotation())}
          />
        </div>
        <div class="flex flex-row-reverse">
          <div class="flex grow"></div>
        <IconButton
                icon={EditIcon}
                title="Edit"
                onClick={() => onEdit(chat.id)}/>
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
