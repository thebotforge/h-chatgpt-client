import { IconButton, TrashIcon } from '@hypothesis/frontend-shared/lib/next';
import { h, FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';

import { Message } from '../../../types/chat.js';
import { roundElapsedTime, tokenCost } from '../../util/chat.js';
import { formatDate } from '../../util/time.js';
import { ChatbotIcon } from './../../../images/assets.js';
import ChatStats from './ChatStats.js';

interface MessageItemProps {
  message: Message;
  onDeleteMessage?: (messageId: string) => void;
}

const ChatMessage: FunctionComponent<MessageItemProps> = ({
  message,
  onDeleteMessage,
}) => {
  const props = `chat-messages-${message.id}`;
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isHoveringChatIcon, setIsHoveringChatIcon] = useState<boolean>(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseEnterChatIcon = () => {
    setIsHoveringChatIcon(true);
  };

  const handleMouseLeaveChatIcon = () => {
    setIsHoveringChatIcon(false);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div
      aria-label={props}
      class="relative flex items-start justify-end grow flex-row hover:cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {message.role === 'assistant' && (
        <div>
          <div
            class="bg-gray-100 p-1 rounded-xl"
            onMouseEnter={handleMouseEnterChatIcon}
            onMouseLeave={handleMouseLeaveChatIcon}
          >
            <ChatbotIcon />
          </div>
          {isHoveringChatIcon && (
            <ChatStats>
              {
                <>
                  <div class="focus-visible-ring absolute z-1 border shadow rounded bg-grey-7 px-3 py-2 text-white w-64">
                    <p><strong>{formatDate(new Date(message.timestamp))}</strong></p>
                    <p><strong>Model: </strong>{message.model || 'GPT-4'}</p>
                    <p><strong>Tokens:</strong></p>
                    <ul style={{ listStyle: 'disc', listStylePosition: 'inside'}}>
                      <li>
                        {message?.usage?.prompt_tokens || 0} prompt tokens ($
                        {tokenCost(message?.usage?.prompt_tokens || 0)})
                      </li>
                      <li>
                        {message?.usage?.completion_tokens || 0} completion
                        tokens ($
                        {tokenCost(message?.usage?.completion_tokens || 0)})
                      </li>
                      <li>
                        {message?.usage?.total_tokens || 0} total tokens ($
                        {tokenCost(message?.usage?.total_tokens || 0)})
                      </li>
                    </ul>
                    <p><strong>API time:</strong>     {roundElapsedTime(message.apiTime || 0)}</p>
                    
                
                  </div>
                </>
              }
            </ChatStats>
          )}
        </div>
      )}

      {message.role === 'user' ? (
        <div class="flex justify-end">
          <div class="rounded-lg p-1.5 px-3 space-x-2.5 bg-gray-100">
            {message.displayMessage?.trim()}
          </div>
        </div>
      ) : (
        <div class={'flex items-center pl-2'}>{message.content.trim()}</div>
      )}

      {isHovering && onDeleteMessage && (
        <div class="absolute border border-gray-100 rounded bg-white top-0 shadow" style={{ right: '-0.5rem'}}>
          <IconButton
            icon={TrashIcon}
            title="Edit"
            onClick={() => onDeleteMessage(message.id)}
          />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
