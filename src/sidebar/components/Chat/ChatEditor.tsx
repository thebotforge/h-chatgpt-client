import ModalNext from '@hypothesis/frontend-shared/lib/components/feedback/Modal.js';
import {
  Button,
  CancelIcon,
  HelpIcon,
  IconButton,
  Input,
  Spinner,
} from '@hypothesis/frontend-shared/lib/next';
import { useCallback, useState, useRef, useMemo } from 'preact/hooks';

import { Chat } from '../../../types/chat';
import { isOrphan, quote } from '../../helpers/annotation-metadata';
import type { TagsService } from '../../services/tags';
import { ChatsService } from '../../services/chats';
import { useSidebarStore } from '../../store';
import { tokenCost, tokenCount } from '../../util/chat';
import AnnotationBody from '../Annotation/AnnotationBody';
import AnnotationQuote from '../Annotation/AnnotationQuote';
import ChatMessage from './ChatMessage';
import ChatStats from './ChatStats';
import TagEditor from '../TagEditor';

export declare type OnSubmit = (name?: string) => Promise<boolean>;

export type ChatEditorProps = {
  chatsService: ChatsService;
  tags: TagsService;
};

export default function ChatEditor({ chatsService }: ChatEditorProps) {
  const store = useSidebarStore();
  const [msg, setMsg] = useState('');
  const service = chatsService;
  // Track the currently-entered text in the tag editor's input
  const [pendingTag, setPendingTag] = useState<string | null>(null);
  const isEmpty = false; //!text && !tags.length;
  const inputRef = useRef<HTMLInputElement>(null);
  const promptToken = tokenCount(store.getChats(),'prompt_tokens')
  const completionToken = tokenCount(store.getChats(),'completion_tokens')
  const totalToken = promptToken + completionToken
  const currentChat = store.getCurrentChat();
  const currentAnnotation = store.getCurrentAnnotation();
  const tags = currentChat?.tags ?? [];
  const [isHoveringChatIcon, setIsHoveringChatIcon] = useState<boolean>(false);

  const handleReset = () => {
    setMsg('');
  };

  const onEditTags = useCallback(
    (tags: string[]) => {
      console.log(tags)
    },
    [currentChat, store]
  );

  const onAddTag = useCallback(
    /**
     * Verify `newTag` has content and is not a duplicate; add the tag
     *
     * @return `true` if tag was added to the draft; `false` if duplicate or
     * empty
     */
    (newTag: string) => {
      // @ts-ignore
      if (!newTag || tags.indexOf(newTag) >= 0) {
        // don't add empty or duplicate tags
        return false;
      }
      const tagList = [...tags, newTag];
      // Update the tag locally for the suggested-tag list
      //tagsService.store(tagList);
      onEditTags(tagList);
      return true;
    },
    [onEditTags, tags]
  );

  const onRemoveTag = useCallback(
    /**
     * Remove tag from draft if present.
     *
     * @return `true` if tag removed from draft, `false` if tag not found in
     * draft tags
     */
    (tag: string) => {
      const newTagList = [...tags]; // make a copy
      // @ts-ignore
      const index = newTagList.indexOf(tag);
      if (index >= 0) {
        newTagList.splice(index, 1);
        onEditTags(newTagList);
        return true;
      }
      return false;
    },
    [onEditTags, tags]
  );

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

  // Revert changes to this annotation
  const onCancel = () => {
    console.log('cancel')
    store.clearAnnotation();
    store.clearChat();
  };

  // Revert changes to this annotation
  const onSave = () => {
    console.log('save')
    chatsService.saveChat();
  };

  const suggestions = useMemo(() => {
    const suggestions = [
      {"tag": "Explain", "suggestion": "Can you explain what this means"},
      {"tag": "Summarize", "suggestion": "Can you summarize this"},
      {"tag": "Translate", "suggestion": "Can you translate this"}
    ];

    return (
      <div class={'flex flex-row'}>
        {suggestions.map(suggestion => {
          return (
            <button
              onClick={() =>
                handleTextFieldChange({ target: { textContent: suggestion.suggestion } })
              }
              class="inline-block mr bg-gray-100 p-2.5 gap-x-1.5 text-sm font-bold transition duration-200 ease-in-out hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
              style="margin-right: 4px;">
              {suggestion.tag}
            </button>
          );
        })}
      </div>
    );
  }, [store.getCurrentChat()]);

  const messages = useMemo(() => {
      if (showMessages()) {
        return (
          <div class="grid gap-4 p-3 pt-0">
            {(currentChat?.messages ?? [])
              .filter(message => message?.role !== 'system')
              .map((message, index) => {
                const props = `chat-messages-${index}`;
                return (
                  <ChatMessage message={message} onDeleteMessage={onDeleteMessage} />
                );
              })}
          </div>
        );
      }
    }, [store, currentChat, currentAnnotation]);

  const header = useMemo(() => {
    const annotationQuote =
      store.getCurrentAnnotation() && store.getCurrentAnnotation().target
        ? quote(store.getCurrentAnnotation())
        : '';
    return (
      <div class="p-3">
        {store.getCurrentAnnotation() &&
          store.getCurrentAnnotation().target && (<div class={"text-md text-color-text font-bold mb-2"}>H User</div>)}
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

      </div>
    );
  }, [currentAnnotation]);
  const handleMouseEnterChatIcon = () => {
    setIsHoveringChatIcon(true);
  };

  const handleMouseLeaveChatIcon = () => {
    setIsHoveringChatIcon(false);
  };
  return (
    <>
      <div class="flex flex-col bg-white mb-3">
        {header}
        {messages}
        {store.getCurrentAnnotation().$tag && store.isLoading() && (
          <Spinner size="md" />
        )}
        {store.getCurrentAnnotation() &&
          store.getCurrentAnnotation().target && (
            <>
              <div class="p-3">{suggestions}</div>
              <div class="p-3 pt-0">
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
              <div class="relative flex flex-col p-3 border-t border-gray-1" style={"justify-content: space-between;"}>
                <div class="flex flex-col">
                    <TagEditor
                    onAddTag={onAddTag}
                    onRemoveTag={onRemoveTag}
                    onTagInput={setPendingTag}
                    tagList={tags}
                  />
                </div>
                <div class="flex flex-row">
                  
                  <div class="grow">
                  <div class="flex flex-row space-x-2 p-3">
                    <Button data-testid="save-button" onClick={onSave} size="lg" classes="bg-grey-4">
                      Save
                    </Button>
                    <Button data-testid="cancel-button" onClick={onCancel} size="lg">
                      <CancelIcon />
                      Cancel
                    </Button>
                    </div>
                  </div>
                  <div class="flex items-center">   <IconButton
                icon={HelpIcon}
                onMouseEnter={handleMouseEnterChatIcon}
                onMouseLeave={handleMouseLeaveChatIcon}
                size="xs"
                title="Info"
              /></div>
                </div>

              </div>
          
              {isHoveringChatIcon && (
            <ChatStats>
              {
                <>
                <div style="top: 10px; right: 28px;" class="focus-visible-ring absolute z-1 border shadow rounded bg-grey-7 px-3 py-2 text-white">

                  <p>Model: {'GPT-4'}</p>
                  <p>Tokens:</p>
                  <ul>
                    <li>
                      {promptToken || 0} prompt tokens ($
                      {tokenCost(promptToken || 0)})
                    </li>
                    <li>
                      {completionToken || 0} completion tokens
                      (${tokenCost(completionToken || 0)})
                    </li>
                    <li>
                      {totalToken || 0} total tokens ($
                      {tokenCost(totalToken || 0)})
                    </li>
                  </ul>
                  </div>
                </>
              }
            </ChatStats>
          )}
              



            </>
          )}
      </div>
    </>
  );
}

