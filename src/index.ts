let key = 'initial';
let previousKey = undefined;
let transitionEndElementSelector = undefined;
let transitionEndAttributeName = undefined;
let transitionEndAttributeValue = undefined;

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

export const handleTransitionStarted = ({ fromElement, toAttributeName = 'src', toAttributeValue }: {
  fromElement?: HTMLElement | null;
  toAttributeName?: string;
  toAttributeValue: string;
}) => {
  if (fromElement) {
    const linkSelector = getElementSelector(fromElement);
    transitionEndElementSelector = linkSelector;
    transitionEndAttributeValue = toAttributeValue;
    transitionEndAttributeName = toAttributeName;
    const viewTransitionName = linkSelector.replace(/[^a-zA-Z0-9]/g, '');
    cleanUpTransition(viewTransitionName);
    fromElement.style.viewTransitionName = viewTransitionName;
  }
}

export const handleHistoryTransitionStarted = (navigatedRouterKey: string = 'initial') => {
  const routerKey = key ?? 'initial';
  transitionEndAttributeName = undefined;
  transitionEndAttributeValue = undefined;
  const previousTransitionElementSelector = sessionStorage.getItem(`__VTNH_view_transition_element_selector_${navigatedRouterKey}-${routerKey}`);
  const transitionElementSelector = sessionStorage.getItem(`__VTNH_view_transition_element_selector_${routerKey}-${navigatedRouterKey}`) || '';
  if (transitionElementSelector) {
    const viewTransitionName = previousTransitionElementSelector.replace(/[^a-zA-Z0-9]/g, '');
    const transitionElement = document.querySelector<HTMLElement>(transitionElementSelector);
    if (transitionElement) {
      cleanUpTransition(viewTransitionName);
      transitionElement.style.viewTransitionName = viewTransitionName;
    }
  }
}

export const handleRouteChangeComplete = (currentRouterKey?: string) => {
  const routerKey = currentRouterKey ?? 'initial';
  previousKey = key ?? 'initial';
  key = routerKey;

  if (transitionEndElementSelector) {
    sessionStorage.setItem(`__VTNH_view_transition_element_selector_${previousKey}-${key}`, transitionEndElementSelector);
  }
  const backRouterKey = `${key}-${previousKey}`;
  const transitionElementSelector = sessionStorage.getItem(`__VTNH_view_transition_element_selector_${backRouterKey}`);
  if (transitionElementSelector) {
    const viewTransitionName = transitionElementSelector.replace(/[^a-zA-Z0-9]/g, '');
    const transitionEndElement = document.querySelector<HTMLElement | null>(transitionElementSelector);
    handleHistoryNavigationComplete(transitionEndElement, viewTransitionName);
  } else {
    handleLinkNavigationComplete(backRouterKey, transitionEndElementSelector.replace(/[^a-zA-Z0-9]/g, ''));
  }
  transitionEndElementSelector = undefined;
}

const handleHistoryNavigationComplete = (transitionEndElement: HTMLElement | null, name: string) => {
  if (transitionEndElement) {
    cleanUpTransition(name);
    transitionEndElement.style.viewTransitionName = name;
  }
}

const handleLinkNavigationComplete = (backRouterKey: string, name: string) => {
  const transitionElement = document.querySelector<HTMLElement>(`[${transitionEndAttributeName}="${transitionEndAttributeValue}"]`);
  transitionEndAttributeValue = undefined;
  transitionEndAttributeName = undefined;

  if (transitionElement) {
    cleanUpTransition(name);
    const transitionElementSelector = getElementSelector(transitionElement) || '';
    transitionElement.style.viewTransitionName = name;
    sessionStorage.setItem(`__VTNH_view_transition_element_selector_${backRouterKey}`, transitionElementSelector);
  }
}
