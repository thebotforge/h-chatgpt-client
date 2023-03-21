import {
  IconButton,
  TrashFilledIcon,
} from '@hypothesis/frontend-shared/lib/next';
import { h, FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';

import { Message } from '../../../types/chat.js';
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
  console.log(isHovering);
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseEnterChatIcon = () => {
    setIsHoveringChatIcon(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleMouseLeaveChatIcon = () => {
    setIsHoveringChatIcon(false);
  };

  return (
    <div
      aria-label={props}
      class="relative flex flex-row hover:cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {message.role === 'assistant' && (
        <div>
          <div
            onMouseEnter={handleMouseEnterChatIcon}
            onMouseLeave={handleMouseLeaveChatIcon}
          >
            <ChatbotIcon />
          </div>
          {isHoveringChatIcon && (
            <ChatStats>
              {
                <>
                  <p>{message.timestamp}</p>
                  <p>Model: GPT-4</p>
                  <p>Tokens:</p>
                  <ul>
                    <li>{message?.usage?.prompt_tokens} prompt tokens ($0.0003)</li>
                    <li> {message?.usage?.completion_tokens} completion tokens ($0.0004)</li>
                    <li>{message?.usage?.total_tokens} total tokens ($0.0007)</li>
                  </ul>
                </>
              }
            </ChatStats>
          )}
        </div>
      )}

      <div>{message.content.trim()}</div>

      {isHovering && onDeleteMessage && (
        <div className="absolute top-0 right-0">
          <IconButton
            icon={TrashFilledIcon}
            title="Edit"
            onClick={() => onDeleteMessage(message.id)}
          />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
