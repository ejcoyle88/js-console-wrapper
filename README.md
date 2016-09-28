## js-console-wrapper
A small wrapper around the window.console object so that various other loggers can be injected.

### Usage Example
```javascript
window.wrapper = new ConsoleWrapper({
  // If true, perform the normal behavior of the function as well as
  // calling any attached callbacks.
  passThrough: false,
  // Set the initial logging level.
  logLevel: ConsoleWrapper.logLevel.log
});

window.console = window.wrapper.wrap(window.console);

// The emitter will pass back the current logging level, and an array
// of the arguments passed to the console function.
window.wrapper.on(ConsoleWrapper.events.log, function(logLevel, args) {
  // Log levels can be used to filter out logs on the fly.
  if(logLevel <= ConsoleWrapper.logLevels.log) {
    // Send all console.log events off to some api somewhere.
    $.put('someLogger/newLog', args);
  }
});

// You can also capture events that arnt normally on console.
window.wrapper.on('silentLog', function(logLevel, args) {
  $.put('someLogger/newLog', p);
});

// At some point later
console.log('I hope no customers see this super secret password:', 'abc123');
console.emit('silentLog', 'Or you can also do this');
```
