import { UTM_KEYS } from '../constant/constant';
import { UtmTrackContext } from '../model/utm-track-context.interface';

type UTM_KEY = typeof UTM_KEYS[number];

export class UtmTrackService {

  private readonly STORAGE_KEY = 'utm';
  private readonly UTM_KEYS = UTM_KEYS;

  private getFromUrl(): Partial<Record<UTM_KEY, string>> {
    if (typeof window === 'undefined') return {};
    
    const params = new URLSearchParams(window.location.search);

    return this.UTM_KEYS.reduce((detail, key) => {
      const value = params.get(key);
      if (value) detail[key] = value;
      return detail;
    }, {} as Partial<Record<UTM_KEY, string>>);
  }

  private getReferrer(): string | null {
    if (typeof document === 'undefined') return null;
    return document.referrer || null;
  }

  private getFromStorage(): Record<string, string> {
    if (typeof localStorage === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  private saveToStorage(utms: Record<string, string>): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(utms));
  }
  
  // init utm details
  public init(defaults: Partial<Record<string, string>> = {}): void {
    const fromUrl = this.getFromUrl();
    //load the local utm details, for handle redirect to singpass or other action
    const stored = this.getFromStorage();

    const merged = {
      ...defaults,
      ...stored,
      ...fromUrl
    };

    this.saveToStorage(this.normalize(merged));
  }

  // used to filter out undefined values and return as new object with all field with value 
  private normalize(input: Record<string, string | undefined>): Record<string, string> {
    return Object.entries(input).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {} as Record<string, string>);
  }

  public getUtmDetail(): Record<string, string> {
    return this.getFromStorage();
  }

  // used to return utm details as UtmTrackContext object
  public getUtmDetailInObject(): UtmTrackContext {
    const utm = this.getFromStorage();
    return {
      utm_source: utm.utm_source ?? null,
      utm_medium: utm.utm_medium ?? null,
      utm_campaign: utm.utm_campaign ?? null,
      utm_term: utm.utm_term ?? null,
      utm_content: utm.utm_content ?? null,
      referrer: this.getReferrer(),
      tracked_by: 'umami'
    };
  }

  // used to return utm details by key
  public getUtmDetailByKey(key: string): string | undefined {
    return this.getFromStorage()[key];
  }

  public clearUtmDetail(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
