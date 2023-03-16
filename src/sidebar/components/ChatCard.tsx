import { h, FunctionalComponent } from 'preact';

import { Chat } from '../../types/chat';

interface ChatProps {
  chat: Chat;
}

export default function ChatCard({ chat }: ChatProps) {
  return (
    <div>
      <div style={{ height: 20 }}>{chat.title}</div>
    </div>
  );
}
