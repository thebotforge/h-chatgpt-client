import {
  IconButton,
  TrashFilledIcon,
} from '@hypothesis/frontend-shared/lib/next';
import { h, FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';

import { Message } from '../../../types/chat.js';
import { ChatbotIcon } from './../../../images/assets.js';

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
  console.log(isHovering);
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };
  return (
    <div
      aria-label={props}
      class="relative flex flex-row hover:cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div>{message.role === 'assistant' && <ChatbotIcon />}</div>

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
