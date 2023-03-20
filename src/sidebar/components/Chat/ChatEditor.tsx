import ModalNext from '@hypothesis/frontend-shared/lib/components/feedback/Modal.js';
import {
  Button,
  IconButton,
  Input,
  Spinner,
  TrashFilledIcon,
} from '@hypothesis/frontend-shared/lib/next';
import { useCallback, useState, useRef, useMemo } from 'preact/hooks';

import { Chat } from '../../../types/chat';
import { isOrphan, quote } from '../../helpers/annotation-metadata';
import { withServices } from '../../service-context';
import { ChatsService } from '../../services/chats';
import { useSidebarStore } from '../../store';
import AnnotationBody from '../Annotation/AnnotationBody';
import AnnotationQuote from '../Annotation/AnnotationQuote';
import { PersonIcon, ChatbotIcon } from './../../../images/assets.js';
import ChatMessage from './ChatMessage';

export declare type OnSubmit = (name?: string) => Promise<boolean>;

export type ChatEditorProps = {
  chatsService: ChatsService;
};

export default function ChatEditor({ chatsService }: ChatEditorProps) {
  const store = useSidebarStore();
  const [msg, setMsg] = useState('');
  const service = chatsService;

  const isEmpty = false; //!text && !tags.length;
  const inputRef = useRef<HTMLInputElement>(null);

  const currentChat = store.getCurrentChat();
  const currentAnnotation = store.getCurrentAnnotation();

  const handleReset = () => {
    setMsg('');
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    sendMessage();
  };

  const sendMessage = () => {
    if (!store.getCurrentAnnotation()) alert('select some text');

    service.sendMessage();
    console.log('talk to the ChatAPI');
    handleReset();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const key = event.key;
    if (isEmpty) {
      return;
    }
    if (key === 'Enter') {
      event.stopPropagation();
      event.preventDefault();
      sendMessage();
    }
  };

  const onChange = useCallback(
    (event: any) => {
      const value = event.target.value;
      setMsg(value);
      store.updateUserMessage(value || 'no txtx');
      console.log('Button clicked');
    },
    [store]
  );

  const handleTextFieldChange = useCallback(
    (event: any) => {
      const value = event.target.textContent;
      setMsg(value);
      store.updateUserMessage(value);
    },
    [store]
  );

  const onDeleteMessage = (id: string | undefined) => {
    //remove the message
    if (id !== undefined) {
      console.log(`remove ${id}`);
      service.deleteChatMessage(id);
    }
  };

  const showMessages = useCallback(() => {
    return (
      currentChat && currentChat.messages && currentChat.messages.length > 0
      //&& store.getCurrentAnnotation().$tag === currentChat.annotationTag
    );
  }, [store, currentChat]);

  const suggestions = useMemo(() => {
    const suggest = ['Explain', 'Summarize', 'Translate'];

    return (
      <div class={'flex flex-row'}>
        {suggest.map(suggestion => {
          return (
            <button
              onClick={() =>
                handleTextFieldChange({ target: { textContent: suggestion } })
              }
              class="inline-block bg-gray-200 mr-2 mb-2 py-1 px-3 text-sm font-bold bg-gray-100 transition duration-200 ease-in-out hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
            >
              {suggestion}
            </button>
          );
        })}
      </div>
    );
  }, [store.getCurrentChat()]);
  const messages = useMemo(() => {
    if (showMessages()) {
      return (currentChat?.messages ?? [])
        .filter(message => message?.role !== 'system')
        .map((message, index) => {
          const props = `chat-messages-${index}`;
          return (
            <ChatMessage message={message} onDeleteMessage={onDeleteMessage} />
          );
        });
    }
  }, [store, currentChat, currentAnnotation]);

  const header = useMemo(() => {
    const annotationQuote =
      store.getCurrentAnnotation() && store.getCurrentAnnotation().target
        ? quote(store.getCurrentAnnotation())
        : '';
    return (
      <div>
        {store.getCurrentAnnotation() && (
          <AnnotationQuote
            quote={annotationQuote || ''}
            isHovered={false}
            isOrphan={isOrphan(store.getCurrentAnnotation())}
          />
        )}

        {store.getCurrentAnnotation() &&
          store.getCurrentAnnotation().target && (
            <AnnotationBody annotation={store.getCurrentAnnotation()} />
          )}
      </div>
    );
  }, [currentAnnotation]);

  return (
    <>
      <div class="flex flex-col">
        {header}
        {messages}
        {store.getCurrentAnnotation().$tag && store.isLoading() && (
          <Spinner size="md" />
        )}
        {store.getCurrentAnnotation() &&
          store.getCurrentAnnotation().target && (
            <>
              <div class="flex flex-row">
                <div class="p-4 w-3/4">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder={'Add a custom prompt'}
                    name="message"
                    value={msg}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    class="bg-gray-100 border border-solid border-gray-400 rounded"
                  />
                </div>
                <div class="p-4 w-1/4">
                  <Button type="submit" onClick={handleSubmit}>
                    Chat
                  </Button>
                </div>
              </div>
              <div>{suggestions}</div>
            </>
          )}
      </div>
    </>
  );
}

// export default withServices(ChatEditor, [
//     'chatsService'
//   ]);
