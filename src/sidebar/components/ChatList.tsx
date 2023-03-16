import { EditIcon, IconButton } from '@hypothesis/frontend-shared/lib/next';
import { h, FunctionalComponent } from 'preact';
import { useMemo } from 'preact/hooks';

import { Chat } from '../../types/chat';
import { useSidebarStore } from '../store';
import ChatCard from './ChatCard';

export type ChatListProps = {
  chats: Chat[];
};

const ChatList: FunctionalComponent<ChatListProps> = ({ chats }) => {
  const store = useSidebarStore();
  store.getChats();
  const onEdit = (id: string) => {
    //do something to the selected chat
    //change the current chat to this id

    const chat = store.findChatByID(id);

    store.updateChat(chat as Chat);
  };
  const displayChats = useMemo(() => {
    console.log(store.getChats());
    if (store.getChats()) {
      return store.getChats().map((chat, index) => {
        // only add an id if itemPrefixId is passed
        const props = `chats-${index}`;

        return (
          <div aria-label={props} class="flex flex-row">
            <div role="option">{chat.title?.trim()}</div>
            <div>
              <IconButton
                icon={EditIcon}
                title="Edit"
                onClick={() => onEdit('k')}
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
