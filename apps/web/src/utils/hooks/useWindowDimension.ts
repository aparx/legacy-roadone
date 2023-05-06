export type WindowDimension = {
  width: number;
  height: number;
};

export function useWindowDimension() {
  throw new Error('unsupported'); // TODO with bounce-back
}

export function getWindowDimension(window: Window): WindowDimension {
  return { width: window.innerWidth, height: window.innerHeight };
}
