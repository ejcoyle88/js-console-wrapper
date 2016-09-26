## js-console-wrapper
A small wrapper around the window.console object so that various other loggers can be injected.

### Usage Example
```javascript
window.wrapper = new ConsoleWrapper({
  // If true, perform the normal behavior of the function as well as
  // calling any attached callbacks.
  passThrough: false
});

window.console = window.wrapper.wrap(window.console);

window.wrapper.on(ConsoleWrapper.events.log, function(params) {
  // Send all console.log events off to some api somewhere.
  $.put('someLogger/newLog', params) 
});

// At some point later
console.log('I hope no customers see this super secret password:', 'abc123');
```
