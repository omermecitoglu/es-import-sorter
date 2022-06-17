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
    const names = this.namesFormatted(sortNames);
    if (!names.length) {
      return `import "${this.module}"${semiColon ? ";" : ""}`;
    }
    return `import ${names} from "${this.module}"${semiColon ? ";" : ""}`;
  }

  static test(raw: string): [boolean, string, string] {
    const x = /^import ['|"](.*)['|"]/.exec(raw);
    if (x?.length === 2) {
      return [true, "", x[1]];
    }
    const m = /^import (.*) from ['|"](.*)['|"]/.exec(raw);
    if (m) {
      return [m.length === 3, m[1], m[2]];
    }
    return [false, "", ""];
  }
}
