import { Promise } from 'es6-promise';

export default class GoogleMapsLoader {

  private static instance: GoogleMapsLoader;

  static URL = 'https://maps.googleapis.com/maps/api/js';
  static KEY = null;
  static LIBRARIES = [];
  static CLIENT = null;
  static CHANNEL = null;
  static LANGUAGE = null;
  static REGION = null;
  static VERSION = '3.18';
  static WINDOW_CALLBACK_NAME = '__google_maps_api_provider_initializator__';

  public static Event = {
    LOADED: 'google-maps:loaded',
  }

  private _script = null;

  constructor(
    private _key = GoogleMapsLoader.KEY,
    private _libraries = GoogleMapsLoader.LIBRARIES,
    private _client = GoogleMapsLoader.CLIENT,
    private _channel = GoogleMapsLoader.CHANNEL,
    private _language = GoogleMapsLoader.LANGUAGE,
    private _region = GoogleMapsLoader.KEY,
    private _version = GoogleMapsLoader.VERSION,
  ) { }

  public static getInstance(
    key = GoogleMapsLoader.KEY,
    libraries = GoogleMapsLoader.LIBRARIES,
    client = GoogleMapsLoader.CLIENT,
    channel = GoogleMapsLoader.CHANNEL,
    language = GoogleMapsLoader.LANGUAGE,
    region = GoogleMapsLoader.KEY,
    version = GoogleMapsLoader.VERSION,
  ) {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader(key, libraries, client, channel, language, region, version);
    }
    return GoogleMapsLoader.instance;
  }

  public isLoaded(): boolean {
    return typeof this.google === 'object' && typeof this.google.maps === 'object';
  }

  public load(): Promise<any> {
    return new Promise<any>((resolve: (google: any) => void, reject: (err: string) => void) => {
      // Check if google maps is already loaded and then resolve
      if (this.isLoaded()) {
        resolve(this.google);

      } else {
        const loading = GoogleMapsLoader['loading'];

        if (GoogleMapsLoader['loading']) {
          var instance = this;
          this.addEventListener(GoogleMapsLoader.Event.LOADED, function handler(event) {
            resolve(event.data);
            instance.removeEventListener(GoogleMapsLoader.Event.LOADED, handler);
          });

        } else {
          GoogleMapsLoader['loading'] = true;

          window[GoogleMapsLoader.WINDOW_CALLBACK_NAME] = () => {
            this.emit(GoogleMapsLoader.Event.LOADED, this.google);
            resolve(this.google);
          };

          this._createLoader();
        }
      }
    });
  }

  public unload(): Promise<any> {
    return new Promise((resolve: () => void, reject: (err: string) => void) => {
      const events = GoogleMapsLoader['events'] || {};
      for (let event in events) {
        events[event].length = 0;
      }

      delete window.google;
      delete window[GoogleMapsLoader.WINDOW_CALLBACK_NAME];

      if (this._script !== null) {
        this._script.parentElement.removeChild(this._script);
        this._script = null;
      }

      if (GoogleMapsLoader['loading']) {
        var instance = this;
        this.addEventListener(GoogleMapsLoader.Event.LOADED, function handler() {
          resolve();
          instance.removeEventListener(GoogleMapsLoader.Event.LOADED, handler);
        });
      } else {
        resolve();
      }
    });
  }

  private _createLoader(): void {
    this._script = document.createElement('script');
    this._script.type = 'text/javascript';
    this._script.src = this._createUrl();
    document.head.appendChild(this._script);
  }

  private _createUrl(): string {
    let url = GoogleMapsLoader.URL;
    url += `?callback=${GoogleMapsLoader.WINDOW_CALLBACK_NAME}`;
    url += this._key ? `&key=${this._key}` : ``;
    url += this._libraries.length > 0 ? `&libraries=${this._libraries.join(',')}` : ``;
    url += this._client ? `&client=${this._client}&v=${GoogleMapsLoader.VERSION}` : ``;
    url += this._channel ? `&channel=${this._channel}` : ``;
    url += this._language ? `&language=${this._language}` : ``;
    url += this._region ? `&region=${this._region}` : ``;
    return url;
  }

  //------------------------------------------------------------------------------------
  // EVENT HANDLERS
  //------------------------------------------------------------------------------------

  addEventListener(event: string, fn: (event: { event: string, data?: any }) => void) {
    const events = GoogleMapsLoader['events'] = GoogleMapsLoader['events'] || {};
    events[event] = events[event] || []
    events[event].push(fn);
  };

  removeEventListener(event: string, fn: (event: { event: string, data?: any }) => void) {
    const events = GoogleMapsLoader['events'] = GoogleMapsLoader['events'] || {};
    if (event in events === false) return;
    events[event].splice(events[event].indexOf(fn), 1);
  };

  emit(event: string, data?: any) {
    const events = GoogleMapsLoader['events'] = GoogleMapsLoader['events'] || {};
    if (event in events === false) return;
    for (var i = 0; i < events[event].length; i++) {
      events[event][i].apply(this, { event: event, data: data });
    }
  }

  //------------------------------------------------------------------------------------
  // GETTERS AND SETTERS
  //------------------------------------------------------------------------------------

  public get google() {
    return window.google;
  }

  public set key(apiKey: string) {
    this._key = apiKey;
  }

  public set libraries(libraries: string[]) {
    this._libraries = libraries;
  }

  public set client(client: string) {
    this._client = client;
  }

  public set channel(channel: string) {
    this._channel = channel;
  }

  public set language(language: string) {
    this._language = language;
  }

  public set region(region: string) {
    this._region = region;
  }

  public set version(version: string) {
    this._version = version;
  }
}