/**
 * Key representing the current state of the router.
 */
let key = 'initial';

/**
 * Stores the previous state key for navigation through history.
 */
let previousKey = undefined;
/**
 * Array to hold transition data for finishing transition at the end of a navigation.
 */
let endTransitions: Transition[] = [];

interface Transition extends TransitionStorageData {
  toAttributeName: string;
  toAttributeValue: string;
}

interface TransitionStorageData {
  transitionName: string;
  fromSelector: string;
}

/**
 * Cleans up the view transition name from an element.
 * @param {string} name - The transition name to clean up.
 */
const cleanUpTransition = (name: string) => {
  const el = document.querySelector<HTMLElement>(`[style*="view-transition-name: ${name}"]`);
  if (el) {
    el.style.viewTransitionName = '';
  }
}

/**
 * Generates a unique CSS selector for a given DOM element, moving up the DOM tree until it reaches the BODY tag.
 * @param elm - The DOM element to generate a selector for.
 * @return A CSS selector string.
 */
const getElementSelector = (elm: Element): string => {
  if (elm.tagName === "BODY") return "BODY";
  const names = [];
  while (elm.parentElement && elm.tagName.toUpperCase() !== "BODY") {
    if (elm.id) {
      names.unshift(`#${elm.id}`);
      break;
    } else {
      let c = 1, e = elm;
      for (; e.previousElementSibling; e = e.previousElementSibling, c++) {}
      names.unshift(`${elm.tagName}:nth-child(${c})`);
    }
    elm = elm.parentElement;
  }
  return names.join(">");
}
/**
 * Stores transition information in sessionStorage for later retrieval.
 * @param fromKey - Key representing the state from which the transition starts.
 * @param toKey - Key representing the state to which the transition goes.
 * @param value - An array of TransitionStorageData to store.
 */
const setTransitionInfo = (fromKey: string, toKey: string, value: TransitionStorageData[]) => {
  sessionStorage.setItem(
    `__VTNH_view_transition_${fromKey}_${toKey}_`,
    JSON.stringify(value)
  );
}

/**
 * Retrieves transition information from sessionStorage.
 * @param fromKey - Key representing the starting state of the transition.
 * @param toKey - Key representing the ending state of the transition.
 * @return An array of TransitionStorageData or an empty array if not found or error.
 */
const getTransitionInfo = (fromKey: string, toKey: string): TransitionStorageData[] => {
  const storageKey = `__VTNH_view_transition_${fromKey}_${toKey}_`;
  const storedValue = sessionStorage.getItem(storageKey);
  if (!storedValue) return [];

  try {
    return JSON.parse(storedValue) ?? [];
  } catch (error) {
    console.error('Error parsing transition info:', error);
    return [];
  }
}

/**
 * Converts a CSS selector into a name suitable for view-transition-name by removing non-alphanumeric characters.
 * @param selector - The CSS selector to convert.
 * @return A string with only alphanumeric characters.
 */
const getViewTransitionNameFromSelector = (selector: string) => selector.replace(/[^a-zA-Z0-9]/g, '');

/**
 * Applies a view transition name to an element, cleaning up any existing transition name first.
 * @param transitionEndElement - The element to apply the transition name to.
 * @param viewTransitionName - The name to set for the view transition.
 */
const setViewTransitionName = (transitionEndElement: HTMLElement | null, viewTransitionName: string) => {
  if (transitionEndElement && viewTransitionName) {
    cleanUpTransition(viewTransitionName);
    transitionEndElement.style.viewTransitionName = viewTransitionName;
  }
}

/**
 * Processes transitions when they start, setting view-transition-name and updating endTransitions variable  .
 * @param transitions - An array of transition data including elements, attributes, and transition specifics.
 */
export const handleTransitionStarted = (transitions: {
  fromElement?: HTMLElement | null;
  transitionName?: string;
  toAttributeName?: string;
  toAttributeValue: string;
}[]) => {
  endTransitions = transitions
    .filter(({ fromElement }) => fromElement)
    .map(({ fromElement, toAttributeName = 'src', toAttributeValue, transitionName = '' }) => {
      const linkSelector = getElementSelector(fromElement);
      const viewTransitionName = transitionName || getViewTransitionNameFromSelector(linkSelector);
      setViewTransitionName(fromElement, viewTransitionName);
      return {
        fromSelector: linkSelector,
        transitionName,
        toAttributeName,
        toAttributeValue,
      };
  })
}

/**
 * Handles the start of a history-based transition, applying previous transition data to elements.
 * @param navigatedRouterKey - The key of the router state being navigated to.
 */
export const handleHistoryTransitionStarted = (navigatedRouterKey: string = 'initial') => {
  const currentKey = key ?? 'initial';
  const data = getTransitionInfo(currentKey, navigatedRouterKey);
  const prevData = getTransitionInfo(navigatedRouterKey, currentKey);

  data.forEach(({ transitionName, fromSelector }, index) => {
    const previousTransition = prevData[index];
    if (fromSelector && previousTransition?.fromSelector) {
      const viewTransitionName = transitionName || getViewTransitionNameFromSelector(previousTransition?.fromSelector);
      const transitionElement = document.querySelector<HTMLElement>(fromSelector);
      setViewTransitionName(transitionElement, viewTransitionName);
    }
  })
}

/**
 * Completes handling of route changes, updating keys and managing transition storage.
 * @param currentRouterKey - The key of the current router state, defaults to 'initial' if not provided.
 * @returns The result of either handleDirectNavigation or handleHistoryNavigation based on transitions.
 */
export const handleRouteChangeComplete = (currentRouterKey?: string) => {
  const newKey = currentRouterKey ?? 'initial';
  previousKey = key ?? 'initial';
  key = newKey;
  return endTransitions.length ? handleDirectNavigation() : handleHistoryNavigation()
}

/**
 * Handles direct navigation by setting up forward and back transitions.
 */
const handleDirectNavigation = () => {
  setTransitionInfo(previousKey, key, endTransitions)
  const reverseTransitions = endTransitions.map(({ toAttributeName, toAttributeValue, transitionName }) => {
    const transitionElement = document.querySelector<HTMLElement>(`[${toAttributeName}="${toAttributeValue}"]`);
    if (transitionElement) {
      setViewTransitionName(transitionElement, transitionName)
      const selector = getElementSelector(transitionElement) || '';
      return { fromSelector: selector, transitionName };
    }
  }).filter(Boolean) as TransitionStorageData[];
  setTransitionInfo(key, previousKey, reverseTransitions)
  endTransitions = [];
}

/**
 * Handles navigation from history by applying previously stored transitions.
 */
const handleHistoryNavigation = () => {
  const transitionData = getTransitionInfo(key, previousKey);
  transitionData?.forEach(({ transitionName, fromSelector }) => {
    const viewTransitionName = transitionName || getViewTransitionNameFromSelector(fromSelector);
    const element = document.querySelector<HTMLElement>(fromSelector);
    setViewTransitionName(element, viewTransitionName);
  })
}