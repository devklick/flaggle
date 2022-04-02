export interface Country {
  name: Name;
  flags: Flags;
}

export interface Name {
  common: string;
  official: string;
}

export interface Flags {
  png: string;
  svg: string;
}
