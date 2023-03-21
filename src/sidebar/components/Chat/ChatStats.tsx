import { FunctionComponent, h } from 'preact';

interface MessageItemProps {
  stats?: string;
}

const ChatStats: FunctionComponent<MessageItemProps> = ({ children }) => {
  return (
    <div class="focus-visible-ring absolute z-1 border shadow rounded bg-grey-7 px-3 py-2 text-white">
      {children}
    </div>
  );
};

export default ChatStats;
