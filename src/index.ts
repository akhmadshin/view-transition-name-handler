/**
 * Key representing the current state of the router.
 */
let key: string = 'initial';

/**
 * Stores the previous state key for navigation through history.
 */
let previousKey: string | undefined = undefined;

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
 * Generates a unique CSS selector for a given DOM element, moving up the DOM tree until it reaches the BODY tag.
 * @param elm - The DOM element to generate a selector for.
 * @return A CSS selector string.
 */
function getElementSelector(elm: Element): string {
  if (elm.tagName === "BODY") return "BODY";
  const names: string[] = [];
  while (elm.parentElement && elm.tagName !== "BODY") {
    if (elm.id) {
      names.unshift(`#${elm.id}`);
      break;
    } else {
      let index = 1, sibling = elm;
      while (sibling.previousElementSibling) {
        sibling = sibling.previousElementSibling;
        index++;
      }
      names.unshift(`${elm.tagName}:nth-child(${index})`);
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
function setTransitionInfo(fromKey: string, toKey: string, value: TransitionStorageData[]): void {
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
function getTransitionInfo(fromKey: string, toKey: string): TransitionStorageData[] {
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
function getViewTransitionNameFromSelector(selector: string): string {
  return selector.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Applies a view transition name to an element, cleaning up any existing transition name first.
 * @param transitionEndElement - The element to apply the transition name to.
 * @param viewTransitionName - The name to set for the view transition.
 */
function setViewTransitionName(transitionEndElement: HTMLElement | null, viewTransitionName: string): void {
  if (transitionEndElement && viewTransitionName) {
    cleanUpTransition(viewTransitionName);
    transitionEndElement.style.viewTransitionName = viewTransitionName;
  }
}

/**
 * Removes the view transition name from an element.
 * @param {string} name - The transition name to clean up.
 */
function cleanUpTransition(name: string): void {
  const el = document.querySelector<HTMLElement>(`[style*="view-transition-name: ${name}"]`);
  if (el) {
    el.style.viewTransitionName = '';
  }
}


/**
 * Processes transitions when they start, setting view-transition-name and updating endTransitions variable.
 * @param transitions - An array of transition data including elements, attributes, and transition specifics.
 */
export function handleTransitionStarted(transitions: {
  fromElement?: HTMLElement | null;
  transitionName?: string;
  toAttributeName?: string;
  toAttributeValue: string;
}[]): void {
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
    });
}

/**
 * Handles the start of a history-based transition, applying previous transition data to elements.
 * @param navigatedRouterKey - The key of the router state being navigated to.
 */
export function handleHistoryTransitionStarted(navigatedRouterKey: string = 'initial'): void {
  const currentKey = key ?? 'initial';
  const data = getTransitionInfo(currentKey, navigatedRouterKey);
  const prevData = getTransitionInfo(navigatedRouterKey, currentKey);

  data.forEach(({ transitionName, fromSelector }, index) => {
    const previousTransition = prevData[index];
    if (fromSelector && previousTransition?.fromSelector) {
      const viewTransitionName = transitionName || getViewTransitionNameFromSelector(previousTransition.fromSelector);
      const transitionElement = document.querySelector<HTMLElement>(fromSelector);
      setViewTransitionName(transitionElement, viewTransitionName);
    }
  });
}

/**
 * Completes handling of route changes, updating keys and managing transition storage.
 * @param currentRouterKey - The key of the current router state, defaults to 'initial' if not provided.
 * @returns The result of either handleDirectNavigation or handleHistoryNavigation based on transitions.
 */
export function handleRouteChangeComplete(currentRouterKey?: string): void {
  const newKey = currentRouterKey ?? 'initial';
  previousKey = key;
  key = newKey;

  if (endTransitions.length) {
    handleNavigationComplete();
  } else {
    handleHistoryNavigationComplete();
  }
}

/**
 * Handles navigation by setting up forward and back transitions.
 */
function handleNavigationComplete(): void {
  setTransitionInfo(previousKey ?? 'initial', key, endTransitions);
  const reverseTransitions = endTransitions.map(({ toAttributeName, toAttributeValue, transitionName }) => {
    const transitionElement = document.querySelector<HTMLElement>(`[${toAttributeName}="${toAttributeValue}"]`);
    if (transitionElement) {
      setViewTransitionName(transitionElement, transitionName);
      const selector = getElementSelector(transitionElement);
      return { fromSelector: selector, transitionName };
    }
  }).filter(Boolean) as TransitionStorageData[];
  setTransitionInfo(key, previousKey ?? 'initial', reverseTransitions);
  endTransitions = [];
}

/**
 * Handles navigation from history by applying previously stored transitions.
 */
function handleHistoryNavigationComplete(): void {
  const transitionData = getTransitionInfo(key, previousKey ?? 'initial');
  transitionData.forEach(({ transitionName, fromSelector }) => {
    const viewTransitionName = transitionName || getViewTransitionNameFromSelector(fromSelector);
    const element = document.querySelector<HTMLElement>(fromSelector);
    setViewTransitionName(element, viewTransitionName);
  });
}