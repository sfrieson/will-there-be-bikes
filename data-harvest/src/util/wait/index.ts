export default function wait (seconds: number): WaiterInterface {
  let timeout: NodeJS.Timer;
  let resolveFromPromise: Function;

  return {
    over: new Promise((resolve) => {
      resolveFromPromise = resolve;
      timeout = setTimeout(resolve, seconds * 1000);
    }),
    cancel: () => {
      clearTimeout(timeout);
      resolveFromPromise();
    }
  };
};

export interface WaiterInterface {
  over: Promise<number>,
  cancel: Function
}
