export function debounce<T extends (...args: any[]) => void>(fn: T, wait: number) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
