export async function asyncFilter<T extends any>(arr: T[], predicate: (x: T) => Promise<boolean>) {
  return Promise.all(arr.map(predicate)).then((results) => arr.filter((_v, index) => results[index]));
}
