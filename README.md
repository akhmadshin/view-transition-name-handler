# view-transition-name-handler

That library manages the view-transition-name property between two dom nodes during client navigation.
* First class support for history(back/forward) navigation. 
* No dependencies, just 100 lines of code.
* Works with any router; you can use it with any meta-framework
* Any scenario is possible. By utilizing custom data attributes you can achieve transition from `<img>` to any other tag (`<iframe>`/`<video>`/`<canvas>`/`<div>`).

## Installation

```sh
$ npm install view-transition-name-handler
```
```sh
$ yarn add view-transition-name-handler
```

## API
### handleTransitionStarted
Call that function before navigation
```
handleTransitionStarted({ fromElement, toAttributeName = 'src', toAttributeValue })
```
* fromElement - DOM element that starts transition
* toAttributeName and toAttributeValue - are used to find DOM element that should finish transition

### handleHistoryTransitionStarted
Should be called on "popstate" event.
```
handleHistoryTransitionStarted(navigatedRouterKey: string = 'initial)
```

### handleRouteChangeComplete
Should be called once navigation is completed.
```
handleRouteChangeComplete(currentRouterKey: string)
```

