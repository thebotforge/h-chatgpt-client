import { createSelector } from 'reselect';

import * as metadata from '../../helpers/annotation-metadata';
import { countIf, trueKeys, toTrueMap } from '../../util/collections';
import { createStoreModule, makeAction } from '../create-store';

/**
 * @typedef {import('../../../types/api').Annotation} Annotation
 * @typedef {import('../../../types/config').SidebarSettings} SidebarSettings
 * @typedef {import("../../../types/sidebar").TabName} TabName
 */

/**
 * @typedef {Record<string, boolean>} BooleanMap
 * @typedef {'Location'|'Newest'|'Oldest'| 'Chat'} SortKey
 */

/**
 * Default sort keys for each tab.
 *
 * @type {Record<TabName, SortKey>}
 */
const TAB_SORTKEY_DEFAULT = {
  annotation: 'Location',
  chat: 'Chat',
  note: 'Oldest',
  orphan: 'Location',
};

/** @param {SidebarSettings} settings */
function initialSelection(settings) {
  /** @type {BooleanMap} */
  const selection = {};
  // TODO: Do not take into account existence of `settings.query` here
  // once root-thread-building is fully updated: the decision of whether
  // selection trumps any query is not one for the store to make
  if (settings.annotations && !settings.query) {
    selection[settings.annotations] = true;
  }
  return selection;
}

/** @param {SidebarSettings} settings */
function initialState(settings) {
  return {
    /**
     * A set of annotations that are currently "selected" by the user —
     * these will supersede other filters/selections.
     */
    selected: initialSelection(settings),

    // Explicitly-expanded or -collapsed annotations (threads). A collapsed
    // annotation thread will not show its replies; an expanded thread will
    // show its replies. Note that there are other factors affecting
    // collapsed states, e.g., top-level threads are collapsed by default
    // until explicitly expanded.
    expanded: initialSelection(settings),

    /**
     * Set of threads that have been "forced" visible by the user
     * (e.g. by clicking on "Show x more" button) even though they may not
     * match the currently-applied filters.
     *
     * @type {BooleanMap}
     */
    forcedVisible: {},

    /** @type {TabName} */
    selectedTab: 'chat',

    /**
     * Sort order for annotations.
     *
     * @type {SortKey}
     */
    sortKey: TAB_SORTKEY_DEFAULT.annotation,

    /**
     * ID or tag of an annotation that should be given keyboard focus.
     *
     * @type {string|null}
     */
    focusRequest: null,
  };
}

/** @typedef {ReturnType<initialState>} State */

/**
 * @param {TabName} newTab
 * @param {TabName} oldTab
 */
const setTab = (newTab, oldTab) => {
  // Do nothing if the "new tab" is the same as the tab already selected.
  // This will avoid resetting the `sortKey`, too.
  if (oldTab === newTab) {
    return {};
  }
  return {
    selectedTab: newTab,
    sortKey: /** @type {SortKey} */ (TAB_SORTKEY_DEFAULT[newTab]),
  };
};

const resetSelection = () => {
  return {
    forcedVisible: {},
    selected: {},
  };
};

const reducers = {
  CLEAR_ANNOTATION_FOCUS_REQUEST() {
    return { focusRequest: null };
  },

  CLEAR_SELECTION() {
    return resetSelection();
  },

  /**
   * @param {State} state
   * @param {{ selection: BooleanMap }} action
   */
  SELECT_ANNOTATIONS(state, action) {
    return { selected: action.selection };
  },

  /**
   * @param {State} state
   * @param {{ tab: TabName }} action
   */
  SELECT_TAB(state, action) {
    return setTab(action.tab, state.selectedTab);
  },

  /**
   * @param {State} state
   * @param {{ id: string, expanded: boolean }} action
   */
  SET_EXPANDED(state, action) {
    const newExpanded = { ...state.expanded };
    newExpanded[action.id] = action.expanded;
    return { expanded: newExpanded };
  },

  /**
   * @param {State} state
   * @param {{ id: string }} action
   */
  SET_ANNOTATION_FOCUS_REQUEST(state, action) {
    return { focusRequest: action.id };
  },

  /**
   * @param {State} state
   * @param {{ id: string, visible: boolean }} action
   */
  SET_FORCED_VISIBLE(state, action) {
    return {
      forcedVisible: { ...state.forcedVisible, [action.id]: action.visible },
    };
  },

  /**
   * @param {State} state
   * @param {{ key: SortKey }} action
   */
  SET_SORT_KEY(state, action) {
    return { sortKey: action.key };
  },

  /**
   * @param {State} state
   * @param {{ toggleIds: string[] }} action
   */
  TOGGLE_SELECTED_ANNOTATIONS(state, action) {
    const selection = { ...state.selected };
    action.toggleIds.forEach(id => {
      selection[id] = !selection[id];
    });
    return { selected: selection };
  },

  /** Actions defined in other modules */

  /**
   * Automatically select the Page Notes tab, for convenience, if all of the
   * top-level annotations in `action.annotations` are Page Notes and the
   * previous annotation count was 0 (i.e. collection empty).
   *
   * @param {State} state
   * @param {{ annotations: Annotation[], currentAnnotationCount: number }} action
   */
  ADD_ANNOTATIONS(state, action) {
    const topLevelAnnotations = action.annotations.filter(
      annotation => !metadata.isReply(annotation)
    );
    const noteCount = countIf(action.annotations, metadata.isPageNote);

    const haveOnlyPageNotes = noteCount === topLevelAnnotations.length;
    if (action.currentAnnotationCount === 0 && haveOnlyPageNotes) {
      return setTab('note', state.selectedTab);
    }
    return {};
  },

  CHANGE_FOCUS_MODE_USER() {
    return resetSelection();
  },

  SET_FILTER() {
    return { ...resetSelection(), expanded: {} };
  },

  SET_FILTER_QUERY() {
    return { ...resetSelection(), expanded: {} };
  },

  SET_FOCUS_MODE() {
    return resetSelection();
  },

  /**
   * @param {State} state
   * @param {{ annotationsToRemove: Annotation[], remainingAnnotations: Annotation[] }} action
   */
  REMOVE_ANNOTATIONS(state, action) {
    let newTab = state.selectedTab;
    // If the orphans tab is selected but no remaining annotations are orphans,
    // switch back to annotations tab
    if (
      newTab === 'orphan' &&
      countIf(action.remainingAnnotations, metadata.isOrphan) === 0
    ) {
      newTab = 'annotation';
    }

    /** @param {BooleanMap} collection */
    const removeAnns = collection => {
      action.annotationsToRemove.forEach(annotation => {
        if (annotation.id) {
          delete collection[annotation.id];
        }
        if (annotation.$tag) {
          delete collection[annotation.$tag];
        }
      });
      return collection;
    };
    return {
      ...setTab(newTab, state.selectedTab),
      expanded: removeAnns({ ...state.expanded }),
      forcedVisible: removeAnns({ ...state.forcedVisible }),
      selected: removeAnns({ ...state.selected }),
    };
  },
};

/**
 * Clear all selected annotations and filters. This will leave user-focus
 * alone, however.
 */
function clearSelection() {
  return makeAction(reducers, 'CLEAR_SELECTION', undefined);
}

/**
 * Set the currently selected annotation IDs. This will replace the current
 * selection. All provided annotation ids will be set to `true` in the selection.
 *
 * @param {string[]} ids - Identifiers of annotations to select
 */
function selectAnnotations(ids) {
  /** @param {import('redux').Dispatch} dispatch */
  return dispatch => {
    dispatch(clearSelection());
    dispatch(
      makeAction(reducers, 'SELECT_ANNOTATIONS', { selection: toTrueMap(ids) })
    );
  };
}

/**
 * Request the UI to give keyboard focus to a given annotation.
 *
 * Once the UI has processed this request, it should be cleared with
 * {@link clearAnnotationFocusRequest}.
 *
 * @param {string} id
 */
function setAnnotationFocusRequest(id) {
  return makeAction(reducers, 'SET_ANNOTATION_FOCUS_REQUEST', { id });
}

/**
 * Clear an annotation focus request created with {@link setAnnotationFocusRequest}.
 */
function clearAnnotationFocusRequest() {
  return makeAction(reducers, 'CLEAR_ANNOTATION_FOCUS_REQUEST', undefined);
}

/**
 * Set the currently-selected tab to `tabKey`.
 *
 * @param {TabName} tabKey
 */
function selectTab(tabKey) {
  return makeAction(reducers, 'SELECT_TAB', { tab: tabKey });
}

/**
 * Set the expanded state for a single annotation/thread.
 *
 * @param {string} id - annotation (or thread) id
 * @param {boolean} expanded - `true` for expanded replies, `false` to collapse
 */
function setExpanded(id, expanded) {
  return makeAction(reducers, 'SET_EXPANDED', { id, expanded });
}

/**
 * A user may "force" an thread to be visible, even if it would be otherwise
 * not be visible because of applied filters. Set the force-visibility for a
 * single thread, without affecting other forced-visible threads.
 *
 * @param {string} id - Thread id
 * @param {boolean} visible - Should this annotation be visible, even if it
 *        conflicts with current filters?
 */
function setForcedVisible(id, visible) {
  return makeAction(reducers, 'SET_FORCED_VISIBLE', { id, visible });
}

/**
 * Sets the sort key for the annotation list.
 *
 * @param {SortKey} key
 */
function setSortKey(key) {
  return makeAction(reducers, 'SET_SORT_KEY', { key });
}

/**
 * Toggle the selected state for the annotations in `toggledAnnotations`:
 * unselect any that are selected; select any that are unselected.
 *
 * @param {string[]} toggleIds - identifiers of annotations to toggle
 */
function toggleSelectedAnnotations(toggleIds) {
  return makeAction(reducers, 'TOGGLE_SELECTED_ANNOTATIONS', { toggleIds });
}

/**
 * Retrieve map of expanded/collapsed annotations (threads)
 *
 * @param {State} state
 */
function expandedMap(state) {
  return state.expanded;
}

/** @param {State} state */
function annotationFocusRequest(state) {
  return state.focusRequest;
}

const forcedVisibleThreads = createSelector(
  /** @param {State} state */
  state => state.forcedVisible,
  forcedVisible => trueKeys(forcedVisible)
);

/**
 * Are any annotations currently selected?
 */
const hasSelectedAnnotations = createSelector(
  /** @param {State} state */
  state => state.selected,
  selection => trueKeys(selection).length > 0
);

const selectedAnnotations = createSelector(
  /** @param {State} state */
  state => state.selected,
  selection => trueKeys(selection)
);

/**
 * Return the currently-selected tab
 *
 * @param {State} state
 */
function selectedTab(state) {
  return state.selectedTab;
}

const selectionState = createSelector(
  /** @param {State} state */
  state => state,
  selection => {
    return {
      expanded: expandedMap(selection),
      forcedVisible: forcedVisibleThreads(selection),
      selected: selectedAnnotations(selection),
      sortKey: sortKey(selection),
      selectedTab: selectedTab(selection),
    };
  }
);

/**
 * Retrieve the current sort option key.
 *
 * @param {State} state
 */
function sortKey(state) {
  return state.sortKey;
}

/**
 * Retrieve applicable sort options for the currently-selected tab.
 */
const sortKeys = createSelector(
  /** @param {State} state */
  state => state.selectedTab,
  selectedTab => {
    /** @type {SortKey[]} */
    const sortKeysForTab = ['Newest', 'Oldest'];
    if (selectedTab !== 'note') {
      // Location is inapplicable to Notes tab
      sortKeysForTab.push('Location');
    }
    return sortKeysForTab;
  }
);

export const selectionModule = createStoreModule(initialState, {
  namespace: 'selection',
  reducers,

  actionCreators: {
    clearAnnotationFocusRequest,
    clearSelection,
    selectAnnotations,
    selectTab,
    setAnnotationFocusRequest,
    setExpanded,
    setForcedVisible,
    setSortKey,
    toggleSelectedAnnotations,
  },

  selectors: {
    expandedMap,
    annotationFocusRequest,
    forcedVisibleThreads,
    hasSelectedAnnotations,
    selectedAnnotations,
    selectedTab,
    selectionState,
    sortKey,
    sortKeys,
  },
});
