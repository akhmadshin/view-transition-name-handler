const VIEW_TRANSITION_NAME = '__VTNH_transition-name';
let key = 'initial';
let previousKey = undefined;
let transitionEndElementSelector = undefined;
let transitionEndAttributeName = undefined;
let transitionEndAttributeValue = undefined;

const cleanUpTransition = () => {
  const viewTransitionElements = Array.from(document.querySelectorAll<HTMLElement>('[style*="view-transition-name: ' + VIEW_TRANSITION_NAME + '"]'));
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

export const handleTransitionStarted = ({ element, attributeName = 'src', attributeValue }: {
  element?: HTMLElement | null;
  attributeName?: string;
  attributeValue: string;
}) => {
  if (element) {
    const linkSelector = getElementSelector(element);
    transitionEndElementSelector = linkSelector;
    transitionEndAttributeValue = attributeValue;
    transitionEndAttributeName = attributeName;
    cleanUpTransition();
    element.style.viewTransitionName = VIEW_TRANSITION_NAME;
  }
}

export const handleHistoryTransitionStarted = (nextRouterKey: string = 'initial') => {
  const routerKey = key ?? 'initial';
  transitionEndAttributeName = undefined;
  transitionEndAttributeValue = undefined;

  const transitionElementSelector = sessionStorage.getItem(`__VTNH_view_transition_element_selector_${routerKey}-${nextRouterKey}`) || '';
  if (transitionElementSelector) {
    const transitionElement = document.querySelector<HTMLElement>(transitionElementSelector);
    if (transitionElement) {
      cleanUpTransition();
      transitionElement.style.viewTransitionName = VIEW_TRANSITION_NAME;
    }
  }
}

export const handleRouteChangeComplete = (_key?: string) => {
  const routerKey = _key ?? 'initial';
  previousKey = key ?? 'initial';
  key = routerKey;

  if (transitionEndElementSelector) {
    sessionStorage.setItem(`__VTNH_view_transition_element_selector_${previousKey}-${key}`, transitionEndElementSelector);
    transitionEndElementSelector = undefined;
  }
  const backRouterKey = `${key}-${previousKey}`;
  const transitionElementSelector = sessionStorage.getItem(`__VTNH_view_transition_element_selector_${backRouterKey}`);

  if (transitionElementSelector) {
    handleHistoryNavigationComplete(transitionElementSelector);
  } else {
    handleLinkNavigationComplete(backRouterKey);
  }
}

const handleHistoryNavigationComplete = (selector: string) => {
  const element = document.querySelector<HTMLElement>(selector);
  if (element) {
    cleanUpTransition();
    element.style.viewTransitionName = VIEW_TRANSITION_NAME;
  }
}

const handleLinkNavigationComplete = (backRouterKey: string) => {
  const transitionElement = document.querySelector<HTMLElement>(`[${transitionEndAttributeName}="${transitionEndAttributeValue}"]`);
  transitionEndAttributeValue = undefined;
  transitionEndAttributeName = undefined;

  if (transitionElement) {
    cleanUpTransition();
    const transitionElementSelector = getElementSelector(transitionElement) || '';
    transitionElement.style.viewTransitionName = VIEW_TRANSITION_NAME;
    sessionStorage.setItem(`__VTNH_view_transition_element_selector_${backRouterKey}`, transitionElementSelector);
  }
}
