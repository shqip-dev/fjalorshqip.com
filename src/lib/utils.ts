export const groupBy = <T>(list: T[], keyGetter: (elem: T) => string) => {
  return list.reduce(
    (acc, elem) => {
      return pushToListGroup(acc, keyGetter(elem), elem);
    },
    {} as {
      [key: string]: T[];
    }
  );
};

export const pushToListGroup = <T>(
  acc: { [key: string]: T[] },
  key: string,
  elem: T
) => {
  if (acc[key]) {
    acc[key].push(elem);
  } else {
    acc[key] = [elem];
  }
  return acc;
};

export const sortByKey = <T>(list: T[], keyGetter: (elem: T) => string) => {
  return [...list].sort((a, b) => {
    const left = keyGetter(a);
    const right = keyGetter(b);
    if (left === right) {
      return 0;
    }
    return left < right ? -1 : 1;
  });
};

export const isSameList = (a: string[], b: string[]) => {
  return a.length === b.length && a.every((elem, idx) => elem === b[idx]);
};

// Keeps the elements of `list` whose key also occurs in `other`, at most one per
// key and in the order `list` had them.
export const intersectBy = <T>(
  list: T[],
  other: T[],
  keyGetter: (elem: T) => string
) => {
  const otherKeys = new Set(other.map(keyGetter));
  const seen = new Set<string>();

  return list.filter((elem) => {
    const key = keyGetter(elem);
    if (!otherKeys.has(key) || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// Trailing-edge debounce: only the last call within `wait` ms runs.
export const debounce = <T extends unknown[]>(
  fn: (...args: T) => void,
  wait: number
) => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
};
