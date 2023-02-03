import Importation from "./importation";
import { Position, Range, TextEdit } from "vscode";

function isNodeModule(moduleName: string) {
  return !/^(.|..|~)\//.test(moduleName);
}

function sortByModuleName(module1: string, module2: string) {
  if (isNodeModule(module1) && !isNodeModule(module2)) return -1;
  if (!isNodeModule(module1) && isNodeModule(module2)) return 1;
  return module1 < module2 ? -1 : 1;
}

function sortImports() {
  return (a: Importation, b: Importation) => {
    if (a.isDirecitve) return -1;
    if (a.isEmpty && !b.isEmpty) return -1;
    if (!a.isEmpty && b.isEmpty) return 1;
    const ad = a.defaultName;
    const bd = b.defaultName;
    if (ad || bd) {
      if (!ad) return 1;
      if (!bd) return -1;
      return ad < bd ? -1 : 1;
    }
    return sortByModuleName(a.module, b.module);
  };
}

function buildImports(imports: Importation[], eol: string) {
  return imports.map(i => i.build(true, true)).join(eol);
}

export function format(text: string, eol: string) {
  const edits = [];
  const lines = text.split(eol);
  const importList = [];
  let code_started = false;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const [isImport, isType, isDirecitve, names, module] = Importation.test(line);
    if (isImport) {
      importList.push(new Importation(isType, isDirecitve, names, module));
      edits.push(TextEdit.delete(new Range(new Position(index, 0), new Position(index + 1, 0))));
    } else if (!line.length && !code_started) {
      edits.push(TextEdit.delete(new Range(new Position(index, 0), new Position(index + 1, 0))));
    } else {
      code_started = true;
    }
  }
  if (importList.length) {
    importList.sort(sortImports());
    const imports = buildImports(importList, eol);
    edits.push(TextEdit.insert(new Position(0, 0), imports + eol + eol));
  }
  return edits;
}
