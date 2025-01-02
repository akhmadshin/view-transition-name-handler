let key = 'initial';
let previousKey = undefined;
let endTransitions: Transition[] = [];

interface Transition extends TransitionStorageData {
  toAttributeName: string,
  toAttributeValue: string,
}

interface TransitionStorageData {
  transitionName: string;
  fromSelector: string;
}

const cleanUpTransition = (name: string) => {
  const el = document.querySelector<HTMLElement>('[style*="view-transition-name: ' + name + '"]');
  if (!el) {
    return;
  }
  el.style.viewTransitionName = '';
}

const getElementSelector = (elm: Element) => {
  if (elm.tagName === "BODY") return "BODY";
  const names = [];
  while (elm.parentElement && elm.tagName.toUpperCase() !== "BODY") {
    if (elm.id) {
      names.unshift("#" + elm.getAttribute("id")); // getAttribute, because `elm.id` could also return a child element with name "id"
      break; // Because ID should be unique, no more is needed. Remove the break, if you always want a full path.
    } else {
      let c = 1, e = elm;
      for (; e.previousElementSibling; e = e.previousElementSibling, c++) ;
      names.unshift(elm.tagName + ":nth-child(" + c + ")");
    }
    elm = elm.parentElement;
  }
  return names.join(">");
}

const setTransitionInfo = (fromKey: string, toKey: string, value: TransitionStorageData[]) => {
  sessionStorage.setItem(
    `__VTNH_view_transition_${fromKey}_${toKey}_`,
    JSON.stringify(value)
  );
}

const getTransitionInfo = (fromKey: string, toKey: string) => {
  let value: TransitionStorageData[] | undefined;
  try {
    const v = sessionStorage.getItem(`__VTNH_view_transition_${fromKey}_${toKey}_`)
    value = JSON.parse(v!)
  } catch {
    value = undefined;
  }

  return value;
}

const getViewTransitionNameFromSelector = (selector: string) => selector.replace(/[^a-zA-Z0-9]/g, '');

export const handleTransitionStarted = (transitions: {
  fromElement?: HTMLElement | null;
  transitionName?: string;
  toAttributeName?: string;
  toAttributeValue: string;
}[]) => {
  endTransitions = transitions.map(({ fromElement, toAttributeName = 'src', toAttributeValue, transitionName = '' }) => {
    if (!fromElement) {
      return
    }
    const linkSelector = getElementSelector(fromElement);
    const viewTransitionName = getViewTransitionNameFromSelector(linkSelector);
    cleanUpTransition(viewTransitionName);
    fromElement.style.viewTransitionName = transitionName ? transitionName : viewTransitionName;

    return {
      fromSelector: linkSelector,
      transitionName,
      toAttributeName,
      toAttributeValue,
    };
  })
}

export const handleHistoryTransitionStarted = (navigatedRouterKey: string = 'initial') => {
  const routerKey = key ?? 'initial';
  const data = getTransitionInfo(routerKey, navigatedRouterKey);
  const prevData = getTransitionInfo(navigatedRouterKey, routerKey);

  data.forEach(({ transitionName, fromSelector }, index: number) => {
    const previousTransition = prevData[index];
    const previousSelector  = previousTransition.fromSelector;

    if (fromSelector && previousSelector) {
      const viewTransitionName = transitionName || getViewTransitionNameFromSelector(previousSelector);
      const transitionElement = document.querySelector<HTMLElement>(fromSelector);
      if (transitionElement) {
        cleanUpTransition(viewTransitionName);
        transitionElement.style.viewTransitionName = viewTransitionName;
      }
    }
  })
}

export const handleRouteChangeComplete = (currentRouterKey?: string) => {
  const routerKey = currentRouterKey ?? 'initial';
  previousKey = key ?? 'initial';
  key = routerKey;
  if (endTransitions.length) {
    setTransitionInfo(previousKey, key, endTransitions)

    setTransitionInfo(key, previousKey, endTransitions.map(({ toAttributeName, toAttributeValue, transitionName }) => {
      const transitionElement = document.querySelector<HTMLElement>(`[${toAttributeName}="${toAttributeValue}"]`);
      if (transitionElement) {
        runTransitionEnd(transitionElement, transitionName)

        const transitionElementSelector = getElementSelector(transitionElement) || '';
        return {
          fromSelector: transitionElementSelector,
          transitionName,
        }
      }
    }))

    endTransitions = [];
    return;
  }
  endTransitions = [];
  const transitionData = getTransitionInfo(key, previousKey);
  transitionData.forEach(({ transitionName, fromSelector }, i) => {
    const viewTransitionName = transitionName || getViewTransitionNameFromSelector(fromSelector);
    const transitionEndElement = document.querySelector<HTMLElement | null>(fromSelector);
    runHistoryTransitionEnd(transitionEndElement, viewTransitionName);
  })
}

const runHistoryTransitionEnd = (transitionEndElement: HTMLElement | null, viewTransitionName: string) => {
  if (transitionEndElement && viewTransitionName) {
    cleanUpTransition(viewTransitionName);
    transitionEndElement.style.viewTransitionName = viewTransitionName;
    setTimeout(() => {
      cleanUpTransition(viewTransitionName);
    }, 0)
  }
}

const runTransitionEnd = (transitionElement: HTMLElement | null, viewTransitionName: string) => {
  if (transitionElement) {
    cleanUpTransition(viewTransitionName);
    transitionElement.style.viewTransitionName = viewTransitionName;
    setTimeout(() => {
      cleanUpTransition(viewTransitionName);
    }, 0)
  }
}
