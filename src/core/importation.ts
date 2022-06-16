export default class Importation {
  defaultName: string | null;
  names: string[];
  rawNames: string;
  module: string;

  constructor(rawNames: string, module: string) {
    this.rawNames = rawNames;
    const [defaultName, names] = this.fetchNames(rawNames);
    this.defaultName = defaultName;
    this.names = names;
    this.module = module;
  }

  fetchNames(rawNames: string): [string | null, string[]] {
    return [this.getDefaultName(rawNames), this.getNameList(rawNames)];
  }

  getDefaultName(rawNames: string) {
    if (rawNames.trim().substring(0, 1) === "{") {
      return null;
    }
    const comma = rawNames.indexOf(",");
    return rawNames.substring(0, comma > 0 ? comma : rawNames.length);
  }

  getNameList(rawNames: string) {
    const m = /{(.*)}/g.exec(rawNames);
    if (m?.length === 2) {
      return m[1].split(",").map(n => n.trim());
    }
    return [];
  }

  get nameListFormatted() {
    const n = this.names;
    return n.length ? `{ ${n.join(", ")} }` : "";
  }

  namesFormatted(sortNames: boolean) {
    if (sortNames) {
      const names = this.nameListFormatted;
      const d = this.defaultName;
      if (this.defaultName) {
        if (!names.length) {
          return this.defaultName;
        }
        return `${this.defaultName}, ${names}`;
      }
      return names;
    }
    return this.names;
  }

  build(semiColon: boolean, sortNames: boolean) {
    return `import ${this.namesFormatted(sortNames)} from "${this.module}"${semiColon ? ";" : ""}`;
  }

  static test(raw: string): [boolean, string, string] {
    const m = /import (.*) from "(.*)"/g.exec(raw);
    if (m) {
      return [m.length === 3, m[1], m[2]];
    }
    return [false, "", ""];
  }
}
