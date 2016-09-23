## js-console-wrapper
A small wrapper around the window.console object so that various other wrappers can be injected.

### Usage Example
```javascript
window.wrapper = new ConsoleWrapper({ passThrough: false });
window.console = window.wrapper.wrap(window.console);
window.wrapper.on(ConsoleWrapper.events.log, function(params) { $.put('someLogger/newLog', params) });

// At some point later
console.log('I hope no customers see this super secret password:', 'abc123');
```
