function makeConsoleIESafe(existingConsole) {
  if (Function.prototype.bind && existingConsole && typeof existingConsole.log == "object") {
    var existingConsoleClone = Object.assign({}, existingConsole);
    
    ["log","info","warn","error","assert","dir","clear","profile","profileEnd"].forEach((method) => {
        existingConsoleClone[method] = this.bind(existingConsoleClone[method], existingConsoleClone);
    }, Function.prototype.call);
    
    return existingConsoleClone;
  }
  return existingConsole;
}

export default function wrap(existingConsole) {
  var existingConsoleClone = makeConsoleIESafe(Object.assign({}, existingConsole));
};
