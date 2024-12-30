let key = 'initial';
let previousKey = undefined;
let endTransitions = [];

const cleanUpTransition = (name: string) => {
  const viewTransitionElements = Array.from(document.querySelectorAll<HTMLElement>('[style*="view-transition-name: ' + name + '"]'));
  viewTransitionElements.forEach((el) => {
    el.style.viewTransitionName = '';
  });
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

export const handleTransitionStarted = (transitions: {
  fromElement?: HTMLElement | null;
  toAttributeName?: string;
  toAttributeValue: string;
}[]) => {
  endTransitions = transitions.map(({ fromElement, toAttributeName = 'src', toAttributeValue }) => {
    if (!fromElement) {
      return
    }
    const linkSelector = getElementSelector(fromElement);
    const viewTransitionName = linkSelector.replace(/[^a-zA-Z0-9]/g, '');
    cleanUpTransition(viewTransitionName);
    fromElement.style.viewTransitionName = viewTransitionName;
    return {
      fromSelector: linkSelector,
      toAttributeName,
      toAttributeValue,
    };
  })

}

export const handleHistoryTransitionStarted = (navigatedRouterKey: string = 'initial') => {
  const routerKey = key ?? 'initial';
  const previousTransitionElementSelectors = (sessionStorage.getItem(`__VTNH_view_transition_element_selector_${navigatedRouterKey}-${routerKey}`) || '').split(',');
  const transitionElementSelectors = (sessionStorage.getItem(`__VTNH_view_transition_element_selector_${routerKey}-${navigatedRouterKey}`) || '').split(',');

  transitionElementSelectors.forEach((selector, i) => {
    const previousSelector = previousTransitionElementSelectors[i];
    if (selector && previousSelector) {
      const viewTransitionName = previousSelector.replace(/[^a-zA-Z0-9]/g, '');
      const transitionElement = document.querySelector<HTMLElement>(selector);
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
  const backRouterKey = `${key}-${previousKey}`;

  if (endTransitions.length) {
    sessionStorage.setItem(
      `__VTNH_view_transition_element_selector_${previousKey}-${key}`,
        endTransitions.map(({ fromSelector }) => fromSelector).join(',')
      );

    let transitionElementSelectors = [];
    endTransitions.forEach(({ fromSelector, toAttributeName, toAttributeValue }) => {
      if (fromSelector) {
        const viewTransitionName = fromSelector.replace(/[^a-zA-Z0-9]/g, '');
        const transitionElement = document.querySelector<HTMLElement>(`[${toAttributeName}="${toAttributeValue}"]`);
        cleanUpTransition(viewTransitionName);
        if (transitionElement) {
          const transitionElementSelector = getElementSelector(transitionElement) || '';
          transitionElement.style.viewTransitionName = viewTransitionName;
          transitionElementSelectors.push(transitionElementSelector)
          setTimeout(() => {
            cleanUpTransition(viewTransitionName);
          }, 0)
        }
      }
    })
    sessionStorage.setItem(`__VTNH_view_transition_element_selector_${backRouterKey}`, transitionElementSelectors.join(','));
    endTransitions = [];
    return;
  }
  const transitionElementSelectors = (sessionStorage.getItem(`__VTNH_view_transition_element_selector_${backRouterKey}`) || '').split(',');
  transitionElementSelectors.forEach((selector) => {
    const viewTransitionName = selector.replace(/[^a-zA-Z0-9]/g, '');
    const transitionEndElement = document.querySelector<HTMLElement | null>(selector);
    handleHistoryNavigationComplete(transitionEndElement, viewTransitionName);
  })
}

const handleHistoryNavigationComplete = (transitionEndElement: HTMLElement | null, name: string) => {
  endTransitions = [];
  cleanUpTransition(name);
  if (transitionEndElement) {
    transitionEndElement.style.viewTransitionName = name;
  }
  setTimeout(() => {
    cleanUpTransition(name);
  }, 0)
}
