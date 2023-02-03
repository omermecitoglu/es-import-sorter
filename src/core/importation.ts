export default class Importation {
  isType: boolean;
  isDirecitve: boolean;
  defaultName: string | null;
  names: string[];
  rawNames: string;
  module: string;

  constructor(isType: boolean, isDirecitve: boolean, rawNames: string, module: string) {
    this.isType = isType;
    this.isDirecitve = isDirecitve;
    this.rawNames = rawNames;
    const [defaultName, names] = this.fetchNames(rawNames);
    this.defaultName = defaultName;
    this.names = names;
    this.module = module;
  }

  get imp() {
    return this.isType ? "import type" : "import";
  }

  get isEmpty() {
    return !this.defaultName && !this.names.length;
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
    const m = /{(.*)}/.exec(rawNames);
    if (m?.length === 2) {
      return m[1].split(",").map(n => n.trim());
    }
    return [];
  }

  getNameListFormatted(sortNames: boolean) {
    const n = sortNames ? this.names.sort() : this.names;
    return n.length ? `{ ${n.join(", ")} }` : "";
  }

  namesFormatted(sortNames: boolean) {
    if (sortNames) {
      const names = this.getNameListFormatted(true);
      const d = this.defaultName;
      if (this.defaultName) {
        if (!names.length) {
          return this.defaultName;
        }
        return `${this.defaultName}, ${names}`;
      }
      return names;
    }
    return this.rawNames;
  }

  build(semiColon: boolean, sortNames: boolean) {
    if (this.isDirecitve) {
      return `"${this.module}"${semiColon ? ";" : ""}`;
    }
    const names = this.namesFormatted(sortNames);
    if (!names.length) {
      return `${this.imp} "${this.module}"${semiColon ? ";" : ""}`;
    }
    return `${this.imp} ${names} from "${this.module}"${semiColon ? ";" : ""}`;
  }

  static test(raw: string): [boolean, boolean, boolean, string, string] {
    const c1 = /^['|"]use client['|"]/.exec(raw);
    if (c1) {
      return [
        // isImport
        true,
        // isType
        false,
        // isDirecitve
        true,
        // names
        "",
        // module
        "use client",
      ];
    }
    const x = /^import ['|"](.*)['|"]/.exec(raw);
    if (x) {
      return [
        // isImport
        x.length === 2,
        // isType
        false,
        // isDirecitve
        false,
        // names
        "",
        // module
        x[1],
      ];
    }
    const mt = /^import type (.*) from ['|"](.*)['|"]/.exec(raw);
    if (mt) {
      return [
        // isImport
        mt.length === 3,
        // isType
        true,
        // isDirecitve
        false,
        // names
        mt[1],
        // module
        mt[2],
      ];
    }
    const m = /^import (.*) from ['|"](.*)['|"]/.exec(raw);
    if (m) {
      return [
        // isImport
        m.length === 3,
        // isType
        false,
        // isDirecitve
        false,
        // names
        m[1],
        // module
        m[2],
      ];
    }
    return [false, false, false, "", ""];
  }
}
