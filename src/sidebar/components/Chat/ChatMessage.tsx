import {
  IconButton,
  TrashFilledIcon,
} from '@hypothesis/frontend-shared/lib/next';
import { h, FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';

import { Message } from '../../../types/chat.js';
import { tokenCost } from '../../util/chat.js';
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
      class="relative flex justify-end grow flex-row hover:cursor-pointer"
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
                  <p>{formatDate(new Date(message.timestamp))}</p>
                  <p>Model: {message.model}</p>
                  <p>Tokens:</p>
                  <ul>
                    <li>{message?.usage?.prompt_tokens || 0} prompt tokens (${tokenCost(message?.usage?.prompt_tokens || 0)})</li>
                    <li> {message?.usage?.completion_tokens || 0} completion tokens (${tokenCost(message?.usage?.completion_tokens || 0)})</li>
                    <li>{message?.usage?.total_tokens || 0} total tokens (${tokenCost(message?.usage?.total_tokens || 0)})</li>
                  </ul>
                </>
              }
            </ChatStats>
          )}
        </div>
      )}
        
        {message.role === 'user' ? <div class="flex justify-end"><span>{message.content.trim()}</span></div> : 
        <div class={"pl-2"}>{message.content.trim()}</div>}

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
