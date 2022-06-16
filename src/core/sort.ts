import { Position, Range, TextEdit } from "vscode";
import Importation from "./importation";

function sortImports() {
  return (a: Importation, b: Importation) => {
    const ad = a.defaultName;
    const bd = b.defaultName;
    if (ad || bd) {
      if (!ad) return 1;
      if (!bd) return -1;
      return ad < bd ? -1 : 1;
    }
    return a.module < b.module ? -1 : 1;
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
    const [isImport, names, module] = Importation.test(line);
    if (isImport) {
      importList.push(new Importation(names, module));
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