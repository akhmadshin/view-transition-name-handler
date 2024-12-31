let key = 'initial';
let previousKey = undefined;
let endTransitions = [];

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
    const viewTransitionName = linkSelector.replace(/[^a-zA-Z0-9]/g, '');
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
  const transitionNames = (sessionStorage.getItem(`__VTNH_view_transition_names_${navigatedRouterKey}-${routerKey}`) || '').split(',');
  const previousTransitionElementSelectors = (sessionStorage.getItem(`__VTNH_view_transition_element_selector_${navigatedRouterKey}-${routerKey}`) || '').split(',');
  const transitionElementSelectors = (sessionStorage.getItem(`__VTNH_view_transition_element_selector_${routerKey}-${navigatedRouterKey}`) || '').split(',');

  transitionElementSelectors.forEach((selector, i) => {
    const previousSelector = previousTransitionElementSelectors[i];
    const transitionName = transitionNames[i];
    if (selector && previousSelector) {
      let viewTransitionName = previousSelector.replace(/[^a-zA-Z0-9]/g, '');
      const transitionElement = document.querySelector<HTMLElement>(selector);
      if (transitionElement) {
        viewTransitionName = transitionName ? transitionName : viewTransitionName
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
    sessionStorage.setItem(
      `__VTNH_view_transition_names_${previousKey}-${key}`,
        endTransitions.map(({ transitionName }) => transitionName).join(',')
      );

    let transitionElementSelectors = [];
    endTransitions.forEach(({ fromSelector, toAttributeName, toAttributeValue, transitionName }) => {
      if (fromSelector) {
        let viewTransitionName = fromSelector.replace(/[^a-zA-Z0-9]/g, '');
        const transitionElement = document.querySelector<HTMLElement>(`[${toAttributeName}="${toAttributeValue}"]`);
        if (transitionElement) {
          const transitionElementSelector = getElementSelector(transitionElement) || '';
          viewTransitionName = transitionName ? transitionName : viewTransitionName;
          cleanUpTransition(viewTransitionName);
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
  const transitionNames = (sessionStorage.getItem(`__VTNH_view_transition_names_${backRouterKey}`) || '').split(',');
  transitionElementSelectors.forEach((selector, i) => {
    const transitionName = transitionNames[i];
    const viewTransitionName = selector.replace(/[^a-zA-Z0-9]/g, '');
    const transitionEndElement = document.querySelector<HTMLElement | null>(selector);
    handleHistoryNavigationComplete(transitionEndElement, transitionName ? transitionName : viewTransitionName);
  })
}

const handleHistoryNavigationComplete = (transitionEndElement: HTMLElement | null, name: string) => {
  endTransitions = [];
  cleanUpTransition(name);
  if (transitionEndElement) {
    const transitionName= transitionEndElement.getAttribute('data-transition-name');
    transitionEndElement.style.viewTransitionName = transitionName ? transitionName : name;
  }
  setTimeout(() => {
    cleanUpTransition(name);
  }, 0)
}
