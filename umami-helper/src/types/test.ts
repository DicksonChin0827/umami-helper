export {};

interface Umami {
  track(event?: string, data?: any): void;
}

declare global {
  interface Window {
    umami?: Umami;
  }
}