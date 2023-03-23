import { Button, Input } from '@hypothesis/frontend-shared/lib/next';
import { useState } from 'preact/hooks';

import { useSidebarStore } from '../../store';

export type ChatOpenApiKeyProps = {
  onClick: (key: string) => void;
};

/**
 * A sidebar panel that prompts a user to log in (or sign up) to annotate.
 */
export default function ChatOpenApiKey({ onClick }: ChatOpenApiKeyProps) {
  const [key, setKey] = useState('');

  function handleTextFieldChange(event: any) {
    setKey(event.target.value);
  }
  return (
    <div class="grid gap-2 mb-3">
      <p>Please add your OpenAI key, this is stored only on this device.</p>
      <div class="flex items-stretch gap-x-1">
        <Input
        onInput={handleTextFieldChange}
        placeholder={'Paste your API key here'}
      />
      <Button title="Log in" variant="primary" onClick={() => onClick(key)}>
        Log in
      </Button>
      </div>
    </div>
  );
}
