import { CardActions, Spinner } from '@hypothesis/frontend-shared/lib/next';
import classnames from 'classnames';
import { useMemo } from 'preact/hooks';

import type { Chat as IChat } from '../../../types/chats-api';
import { isSaved, quote } from '../../helpers/annotation-metadata';
import { withServices } from '../../service-context';
import { ChatsService } from '../../services/chats';
import { useSidebarStore } from '../../store';
import ChatEditor from './ChatEditor';

function SavingMessage() {
  return (
    <div
      className={classnames(
        'flex grow justify-end items-center gap-x-1',
        // Make sure height matches that of action-bar icons so that there
        // isn't a height change when transitioning in and out of saving state
        'h-8 touch:h-touch-minimum'
      )}
      data-testid="saving-message"
    >
      <span
        // Slowly fade in the Spinner such that it only shows up if the saving
        // is slow
        className="text-[16px] animate-fade-in-slow"
      >
        <Spinner size="sm" />
      </span>
      <div className="text-color-text-light font-medium">Saving...</div>
    </div>
  );
}

export type ChatProps = {
  chat: IChat;
  //   annotation: IAnnotation;
  //   isReply: boolean;
  //   /** Number of replies to this annotation's thread */
  //   replyCount: number;
  //   /** Is the thread to which this annotation belongs currently collapsed? */
  //   threadIsCollapsed: boolean;
  //   /**
  //    * Callback to expand/collapse reply threads. The presence of a function
  //    * indicates a toggle should be rendered.
  //    */
  //   onToggleReplies?: () => void;

  // injected
  chatsService: ChatsService;
};

/**
 * A single annotation.
 *
 * @param {ChatProps} props
 */
function Chat({
  chat,
  //   annotation,
  //   isReply,
  //   onToggleReplies,
  //   replyCount,
  //   threadIsCollapsed,
  chatsService,
}: ChatProps) {
  const store = useSidebarStore();

  //   const annotationQuote = quote(annotation);
  const draft = store.getDraft(chat);
  //   const userid = store.profile().userid;

  //   const isHovered = store.isAnnotationHovered(annotation.$tag);
  const isSaving = false; //store.isSavingAnnotation(annotation);

  const isEditing = !!draft && !isSaving;

  const isChat = store.isChatting();

  const useAnnotation = store.getCurrentAnnotation();

  //   const isCollapsedReply = isReply && threadIsCollapsed;

  //   const showActions = !isSaving && !isEditing && isSaved(annotation);

  //   const defaultAuthority = store.defaultAuthority();
  //   const displayNamesEnabled = store.isFeatureEnabled('client_display_names');

  //   const onReply = () => {
  //     if (isSaved(annotation) && userid) {
  //       annotationsService.reply(annotation, userid);
  //     }
  //   };

  //   const authorName = useMemo(
  //     () =>
  //       annotationDisplayName(annotation, defaultAuthority, displayNamesEnabled),
  //     [annotation, defaultAuthority, displayNamesEnabled]
  //   );

  //   const annotationDescription = isSaved(annotation)
  //     ? annotationRole(annotation)
  //     : `New ${annotationRole(annotation).toLowerCase()}`;

  return (
    <div className="space-y-4">
      {useAnnotation && <ChatEditor chatsService={chatsService} />}
    </div>
  );
}

export default withServices(Chat, ['chatsService']);
