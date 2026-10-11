// Reading and immutably updating nested values by path: "copy.home.hero.title", "services.2.name".

export type Path = (string | number)[];

export function toPath(path: string | Path): Path {
  if (Array.isArray(path)) return path;
  return path === "" ? [] : path.split(".").map((p) => (/^\d+$/.test(p) ? Number(p) : p));
}

export function join(...parts: (string | number | Path)[]): Path {
  return parts.flatMap((p) => (Array.isArray(p) ? p : toPath(String(p))));
}

export function getAt(obj: unknown, path: string | Path): any {
  let cur: any = obj;
  for (const key of toPath(path)) {
    if (cur == null) return undefined;
    cur = cur[key];
  }
  return cur;
}

export function setAt<T>(obj: T, path: string | Path, value: unknown): T {
  const [head, ...rest] = toPath(path);
  if (head === undefined) return value as T;
  const container: any = Array.isArray(obj) ? [...obj] : { ...(obj as object) };
  container[head] = setAt(container[head], rest, value);
  return container as T;
}
