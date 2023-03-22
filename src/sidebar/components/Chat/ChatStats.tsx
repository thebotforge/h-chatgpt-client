import { FunctionComponent, h } from 'preact';

interface MessageItemProps {

}

const ChatStats: FunctionComponent<MessageItemProps> = ({ children }) => {
  return (<>
      {children}
      </>
  );
};

export default ChatStats;
