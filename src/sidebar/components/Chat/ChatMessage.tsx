import {
  IconButton,
  TrashFilledIcon,
} from '@hypothesis/frontend-shared/lib/next';
import { h, FunctionComponent } from 'preact';

import { Message } from '../../../types/chat.js';
import { PersonIcon, ChatbotIcon } from './../../../images/assets.js';

interface MessageItemProps {
  message: Message;
  onDeleteMessage?: (messageId: string) => void;
}

const ChatMessage: FunctionComponent<MessageItemProps> = ({
  message,
  onDeleteMessage,
}) => {
  const props = `chat-messages-${message.id}`;

  return (
    <div aria-label={props} class="flex flex-row">
      <div>
        {message.role === 'assistant' && <ChatbotIcon />}
      </div>

      
      <div>{message.content.trim()}</div>
      <div>
        {onDeleteMessage && (
          <IconButton
            icon={TrashFilledIcon}
            title="Edit"
            onClick={() => onDeleteMessage(message.id)}
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
