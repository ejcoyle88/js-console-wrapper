import { EventEmitter } from 'events';

function createConstants() {
  let constants = {};
  let argsLen = arguments.length;
  for (let i = 0; i < argsLen; i++) {
    let constant = arguments[i];
    constants[constant] = constant;
  }
  return constants;
}

function makeConsoleIESafe(events, existingConsole) {
  if (!Function.prototype.bind || !existingConsole || !(typeof existingConsole.log === 'object')) {
    return existingConsole;
  }

  var existingConsoleClone = Object.assign({}, existingConsole);

  events.forEach(function (method) {
    existingConsoleClone[method] = this.bind(existingConsoleClone[method], existingConsoleClone);
  }, Function.prototype.call);

  return existingConsoleClone;
}

export default class ConsoleWrapper {
  static logLevels = {
    log: 0,
    info: 1,
    warn: 2,
    error: 3
  };
  static _defaultOptions = {
    // If true, perform the normal behavior of the function as well as
    // calling any attached callbacks.
    passThrough: true,
    logLevel: ConsoleWrapper.logLevels.log
  };
  static _events = [
    'log', 'info', 'warn', 'error', 'assert',
    'dir', 'clear', 'profile', 'profileEnd'
  ];
  static events = createConstants.apply(ConsoleWrapper, ConsoleWrapper._events);

  constructor(options) {
    this._options = Object.assign({}, ConsoleWrapper._defaultOptions, options);
    this._logLevel = this._options.logLevel;
    this._eventLog = [];
    this._emitter = new EventEmitter();
    this._emit = this.wrapperFunc.bind(this, function(){});
  }

  getEventLogLevel(event) {
    return ConsoleWrapper.logLevels[event];
  }

  wrapperFunc(defaultFn, event) {
    let args = Array.prototype.slice.call(arguments);
    args = args.slice(2);
    this._emitter.emit(event, this._logLevel, args);
    this._eventLog.push({ EventName: event, LogLevel: this._logLevel, ...args });
    var eventLogLevel = this.getEventLogLevel(event);
    if (this._options.passThrough && (eventLogLevel == null || eventLogLevel >= this._logLevel)) {
      defaultFn.apply(this, args);
    }
  }

  setLogLevel(logLevel) {
    this._logLevel = logLevel;
  }

  getEventLog = () => {
    return this._eventLog;
  };

  on = (event, cb) => {
    return this._emitter.on(event, cb);
  };

  removeListener = (event, cb) => {
    return this._emitter.removeListener(event, cb);
  };

  wrap = (existingConsole) => {
    let consoleClone = makeConsoleIESafe(ConsoleWrapper._events, existingConsole);
    let newConsole = {
      existingConsole: existingConsole,
      emit: this._emit
    };
    for (let event in ConsoleWrapper.events) {
      if(ConsoleWrapper.events.hasOwnProperty(event)) {
        newConsole[event] = this.wrapperFunc.bind(this, consoleClone[event], event);
      }
    }
    return newConsole;
  };
}

