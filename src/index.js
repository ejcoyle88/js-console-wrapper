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

function makeConsoleIESafe(existingConsole) {
  if (!Function.prototype.bind || !existingConsole || !(typeof existingConsole.log === 'object')) {
    return existingConsole;
  }

  var existingConsoleClone = Object.assign({}, existingConsole);

  ['log', 'info', 'warn', 'error', 'assert', 'dir', 'clear', 'profile', 'profileEnd'].forEach(function (method) {
    existingConsoleClone[method] = this.bind(existingConsoleClone[method], existingConsoleClone);
  }, Function.prototype.call);

  return existingConsoleClone;
}

function wrapperFunc(emitter, passThrough, event, defaultFn) {
  let args = Array.prototype.slice.call(arguments);
  args = args.slice(4);
  emitter.emit(event, args);
  if (passThrough) {
    defaultFn.apply(this, args);
  }
}

export default class ConsoleWrapper {
  static _defaultOptions = {
    // If true, perform the normal behavior of the function as well as
    // calling any attached callbacks.
    passThrough: true
  };
  static events = createConstants(
      'log', 'info', 'warn', 'error', 'assert',
      'dir', 'clear', 'profile', 'profileEnd'
  );

  constructor(options) {
    this._options = Object.assign({}, ConsoleWrapper._defaultOptions, options);
    this._emitter = new EventEmitter();
    this._wrapperFn = wrapperFunc.bind(this, this._emitter, this._options.passThrough);
    this._eventLog = [];
    this._existingConsole = null;
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
    let consoleClone = makeConsoleIESafe(existingConsole);
    let newConsole = { existingConsole: existingConsole };
    for (let event in ConsoleWrapper.events) {
      if(ConsoleWrapper.events.hasOwnProperty(event)) {
        newConsole[event] = this._wrapperFn.bind(consoleClone, event, consoleClone[event]);
        this._emitter.on(event, (p) => this._eventLog.push({ EventName: event, ...p }));
      }
    }
    return newConsole;
  };
}

