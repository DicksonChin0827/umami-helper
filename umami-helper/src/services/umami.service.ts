import { UtmTrackService } from './utm-track.service';

export interface UmamiConfig {
  websiteId: string;
  scriptUrl?: string;
}

export class UmamiService {

  private eventQueue: Array<{ event: string, props: any }> = [];
  private checkInterval: any;
  private websiteId: string;
  private scriptUrl: string;
  private _utmTrackService: UtmTrackService;

  constructor(config: UmamiConfig, utmTrackService?: UtmTrackService) {
    this.websiteId = config.websiteId;
    this.scriptUrl = config.scriptUrl || 'https://analytics.umami.is/script.js';
    this._utmTrackService = utmTrackService || new UtmTrackService();

    this.loadUmami();
    this.initQueueProcessor();
  }

  // used to load umami script
  // since will have different environment, will need to load umami script dynamically
  private loadUmami(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if ((window as any).umami) return;
    if (document.querySelector('script[data-website-id]')) return;
    
    const script = document.createElement('script');
    script.src = this.scriptUrl;
    script.async = true;
    script.setAttribute('data-website-id', this.websiteId);
    document.head.appendChild(script);
  }


  private initQueueProcessor() {
    if (typeof window === 'undefined') return;
    // check if umami is loaded every 500ms
    this.checkInterval = setInterval(() => {
      if ((window as any).umami) {
        this.processQueue();
        // stop the interval after umami is loaded and processed
        clearInterval(this.checkInterval);
      }
    }, 500);
  }

  private processQueue() {
    while (this.eventQueue.length > 0) {
      const { event, props } = this.eventQueue.shift()!;
      if ((window as any).umami) {
         (window as any).umami.track(event, props);
      }
    }
  }

  public track(event: string, props?: any): void {
    if (typeof window === 'undefined') return;

    const utmContext = this._utmTrackService.getUtmDetailInObject();
    const mergedProps = { ...utmContext, ...props };

    if ((window as any).umami) {
      (window as any).umami.track(event, mergedProps);
    } else {
      // to handle if the umami script is not loaded yet
      this.eventQueue.push({ event: event, props: mergedProps });
    }
  }
}