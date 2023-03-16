import { useEffect, useState } from 'preact/hooks';

import { withServices } from '../service-context';
import type { LoadChatsService } from '../services/load-chats';
import { useSidebarStore } from '../store';
import SidebarContentError from './SidebarContentError';
import ThreadList from './ThreadList';
import { useRootThread } from './hooks/use-root-thread';

type ChatsViewProps = {
  // Injected
  loadChatsService: LoadChatsService;
};

/**
 * The main content for the single annotation page (aka. https://hypothes.is/a/<annotation ID>)
 */
function ChatView({ loadChatsService }: ChatsViewProps) {
  const store = useSidebarStore();
  const annotationId = store.routeParams().id;
  const rootThread = useRootThread();
  const userid = store.profile().userid;

  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    setFetchError(false);
    store.clearAnnotations();

    // loadChatsService
    //   .loadChats(annotationId)
    //   .then(annots => {
    //     // Find the top-level chat in the thread that `chatId` is
    //     // part of. This will be different to `chatId` if `chatId`
    //     // is a reply. A top-level chat will not have any references.
    //     const topLevelAnnot = annots.filter(
    //       ann => (ann.references || []).length === 0
    //     )[0];

    //     if (!topLevelAnnot) {
    //       // We were able to fetch chatss in the thread that `chatId`
    //       // is part of (note that `chatId` may refer to a reply) but
    //       // couldn't find a top-level (non-reply) chat in that thread.
    //       //
    //       // This might happen if the top-level chat was deleted or
    //       // moderated or had its permissions changed.
    //       //
    //       // We need to decide what what be the most useful behavior in this case
    //       // and implement it.
    //       /* istanbul ignore next */
    //       return;
    //     }

    //     // Make the full thread of chats visible. By default replies are
    //     // not shown until the user expands the thread.
    //     annots.forEach(annot => annot.id && store.setExpanded(annot.id, true));

    //     // FIXME - This should show a visual indication of which reply the
    //     // annotation ID in the URL refers to. That isn't currently working.
    //     if (topLevelAnnot.id !== annotationId) {
    //       store.highlightAnnotations([annotationId]);
    //     }
    //   })
    //   .catch(() => {
    //     setFetchError(true);
    //   });
  }, [
    annotationId,

    // This is not used by the effect but ensures that the chat is
    // fetched after the user logs in/out, in case the chat is private.
    userid,

    // Static dependencies.
    loadChatsService,
    store,
  ]);

  return (
    <>
      {/* <ThreadList threads={rootThread.children} />,
      <div>chats should be here</div> */}
    </>
  );
}

export default withServices(ChatView, ['loadChatsService']);
