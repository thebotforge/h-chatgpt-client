import ModalNext from '@hypothesis/frontend-shared/lib/components/feedback/Modal';
import { useEffect, useMemo, useRef } from 'preact/hooks';

import { tabForAnnotation } from '../helpers/tabs';
import { withServices } from '../service-context';
import { ChatsService } from '../services/chats';
import type { FrameSyncService } from '../services/frame-sync';
import type { LoadAnnotationsService } from '../services/load-annotations';
import { LoadChatsService } from '../services/load-chats';
import type { StreamerService } from '../services/streamer';
import { useSidebarStore } from '../store';
import Chat from './Chat/Chat';
import ChatOpenApiKey from './Chat/ChatOpenApiKey';
import ChatList from './ChatList';
import ChatView from './ChatView';
import FilterStatus from './FilterStatus';
import LoggedOutMessage from './LoggedOutMessage';
import LoginPromptPanel from './LoginPromptPanel';
import SelectionTabs from './SelectionTabs';
import SidebarContentError from './SidebarContentError';
import ThreadList from './ThreadList';
import { useRootThread } from './hooks/use-root-thread';

export type SidebarViewProps = {
  onLogin: () => void;
  onSignUp: () => void;

  // injected
  frameSync: FrameSyncService;
  loadAnnotationsService: LoadAnnotationsService;
  loadChatsService: LoadChatsService;
  chatsService: ChatsService;
  streamer: StreamerService;
};

/**
 * Render the content of the sidebar, including tabs and threads (annotations)
 */
function SidebarView({
  frameSync,
  onLogin,
  onSignUp,
  loadAnnotationsService,
  chatsService,
  loadChatsService,
  streamer,
}: SidebarViewProps) {
  const rootThread = useRootThread();

  // Store state values
  const store = useSidebarStore();
  const focusedGroupId = store.focusedGroupId();
  const hasAppliedFilter =
    store.hasAppliedFilter() || store.hasSelectedAnnotations();
  const isLoading = store.isLoading();
  const isLoggedIn = store.isLoggedIn();

  const linkedAnnotationId = store.directLinkedAnnotationId();
  const linkedAnnotation = linkedAnnotationId
    ? store.findAnnotationByID(linkedAnnotationId)
    : undefined;
  const directLinkedTab = linkedAnnotation
    ? tabForAnnotation(linkedAnnotation)
    : 'annotation';

  const searchUris = store.searchUris();
  const sidebarHasOpened = store.hasSidebarOpened();
  const userId = store.profile().userid;

  const chats = store.getChats();

  // If, after loading completes, no `linkedAnnotation` object is present when
  // a `linkedAnnotationId` is set, that indicates an error
  const hasDirectLinkedAnnotationError =
    !isLoading && linkedAnnotationId ? !linkedAnnotation : false;

  const hasDirectLinkedGroupError = store.directLinkedGroupFetchFailed();

  const hasContentError =
    hasDirectLinkedAnnotationError || hasDirectLinkedGroupError;

  const showFilterStatus = !hasContentError;
  const showTabs = !hasContentError && !hasAppliedFilter;
  const showChat = true;
  const needsOpenApiKey = store.needsOpenApiKey();
  // Show a CTA to log in if successfully viewing a direct-linked annotation
  // and not logged in
  const showLoggedOutMessage =
    linkedAnnotationId &&
    !isLoggedIn &&
    !hasDirectLinkedAnnotationError &&
    !isLoading;

  const prevGroupId = useRef(focusedGroupId);

  // Reload annotations when group, user or document search URIs change
  useEffect(() => {
    if (!prevGroupId.current || prevGroupId.current !== focusedGroupId) {
      // Clear any selected annotations and filters when the focused group
      // changes.
      // We don't clear the selection/filters on the initial load when
      // the focused group transitions from null to non-null, as this would clear
      // any filters intended to be used for the initial display (eg. to focus
      // on a particular user).
      if (prevGroupId.current) {
        // Respect applied focus-mode filtering when changing focused group
        const restoreFocus = store.focusState().active;

        store.clearSelection();
        if (restoreFocus) {
          store.toggleFocusMode(true);
        }
      }
      prevGroupId.current = focusedGroupId;
    }
    if (focusedGroupId && searchUris.length) {
      loadAnnotationsService.load({
        groupId: focusedGroupId,
        uris: searchUris,
      });
    }
  }, [
    store,
    // loadAnnotationsService,
    loadChatsService,
    focusedGroupId,
    userId,
    searchUris,
  ]);

  // When a `linkedAnnotationAnchorTag` becomes available, scroll to it
  // and focus it
  useEffect(() => {
    if (linkedAnnotation && linkedAnnotation.$orphan === false) {
      frameSync.hoverAnnotation(linkedAnnotation);
      frameSync.scrollToAnnotation(linkedAnnotation);
      store.selectTab(directLinkedTab);
    } else if (linkedAnnotation) {
      // Make sure to allow for orphaned annotations (which won't have an anchor)
      store.selectTab(directLinkedTab);
    }
  }, [directLinkedTab, frameSync, linkedAnnotation, store]);

  // Connect to the streamer when the sidebar has opened or if user is logged in
  useEffect(() => {
    loadChatsService.load();
  }, [sidebarHasOpened]);

  return (
    <div>
      {hasDirectLinkedAnnotationError && (
        <SidebarContentError
          errorType="annotation"
          onLoginRequest={onLogin}
          showClearSelection={true}
        />
      )}
      {hasDirectLinkedGroupError && (
        <SidebarContentError errorType="group" onLoginRequest={onLogin} />
      )}
      {showTabs && <SelectionTabs isLoading={isLoading} />}
      {needsOpenApiKey && (
        <ChatOpenApiKey
          onClick={key => {
            store.createOpenAIApiKey(key);
            store.setDefault('openAIApiKey', key);
          }}
        />
      )}
      <div class={'bg-white p-3'}>
        {showChat && <Chat chat={{}} />}
        {<ChatList chatsService={chatsService} chats={store.getChats()} />}
      </div>

      {/* {showLoggedOutMessage && <LoggedOutMessage onLogin={onLogin} />} */}
    </div>
  );
}

export default withServices(SidebarView, [
  'frameSync',
  'loadAnnotationsService',
  'loadChatsService',
  'chatsService',
  'streamer',
]);
