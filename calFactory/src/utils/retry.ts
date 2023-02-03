function retry<T, U>(fn: (arg: T) => U, arg: T, maxCount: number, count=1): U {
  Utilities.sleep(100 * (count ** 2));
  try {
    const result = fn(arg);
    return result;
  }catch(e){
  if (count > maxCount) {
    throw new Error("@retry: too many retry.")
  }
    return retry(fn, arg, maxCount, count + 1);
  }
}
