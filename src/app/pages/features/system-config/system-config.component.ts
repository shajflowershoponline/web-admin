import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { catchError, debounceTime, map, of, ReplaySubject, Subject, switchMap } from 'rxjs';
import { SystemConfig } from 'src/app/models/system-config';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GeoLocationService } from 'src/app/services/geo-location.service';
import { StorageService } from 'src/app/services/storage.service';
import { SystemConfigService } from 'src/app/services/system-config.service';
import { LocationMapViewerComponent } from 'src/app/shared/location-map-viewer/location-map-viewer.component';
import { environment } from 'src/environments/environment';

export class SystemConfigView {
  key: string;
  value: any;
  title?: string;
  edit?: boolean;
  canEdit?: boolean;
  sequence?: number;
  dirty?: boolean;
  valid?: boolean;
};

@Component({
  selector: 'app-system-config',
  templateUrl: './system-config.component.html',
  styleUrl: './system-config.component.scss',
  host: {
    class: "page-component"
  }
})
export class SystemConfigComponent {
  selectedCoords = { lat: 0, lng: 0 };
  systemConfigs: SystemConfigView[] = [];
  originalConfigs: SystemConfigView[] = [];
  isLoading = false;
  error;
  @ViewChild('locationMapViewer') locationMapViewer!: LocationMapViewerComponent;
  autocompleteService = new google.maps.places.AutocompleteService();
  geocoder = new google.maps.Geocoder();
  placesService: google.maps.places.PlacesService;
  placeResults: { description?: string; place_id: string; main_text?: string }[] = [];

  constructor(private systemConfigService: SystemConfigService,
    private geoLocationService: GeoLocationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public appConfig: AppConfigService,
    private storageService: StorageService,
    private sanitizer: DomSanitizer,
    private readonly cdr: ChangeDetectorRef,
    public router: Router) {

  }

  get prod() {
    return environment.production;
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.loadSettings();

  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
  }

  loadSettings() {
    try {
      this.systemConfigService.getAll().subscribe(res => {
        if (res.success) {
          const items = res.data.map((x: {
            index: number;
            key: string;
            value: any;
          }) => {
            let { key, value } = x;
            let title = x.key;
            let show = true;
            let sequence = 0;
            let canEdit = true;
            if (x.key === "DELIVERY_RATE") {
              title = "Base Rate and Delivery Rate by KM ";
              sequence = 0;
              const { min, rateByKm } = JSON.parse(value);
              value = {
                min: min??0,
                rateByKm: rateByKm??0
              };
            } else if (x.key === "STORE_LOCATION_NAME") {
              title = "Location Address";
              sequence = 1;
            } else if (x.key === "STORE_LOCATION_COORDINATES") {
              title = "Location Address Map";
              value = value.split(", ") as any;
              show = false;
              this.selectedCoords = { lat: parseFloat(value[0]), lng: parseFloat(value[1]) };
              sequence = 2;
              canEdit = false;
            } else if (x.key === "SOCIAL_FACEBOOK_LINK") {
              title = "Facebook link";
              sequence = 3;
            } else if (x.key === "CLIENT_SITE_SLIDES_CONTENTS") {
              title = "Client Site: Slides contents";
              sequence = 4;
              value = JSON.parse(value);
            } else if (x.key === "CLIENT_SITE_HISTORY_CONTENTS") {
              title = "Client Site: History Content";
              sequence = 5;
              value = JSON.parse(value);
            } else if (x.key === "CLIENT_SITE_FOOTER_BANNER_CONTENT") {
              title = "Client Site: Footer Banner content";
              sequence = 6;
              value = JSON.parse(value);
            } else if (x.key === "STORE_SUPPORT_EMAIL") {
              title = "Store Support Email";
              sequence = 7;
            } else if (x.key === "STORE_MOBILE_NUMBER") {
              title = "Store Mobile Number";
              sequence = 8;
            } else if (x.key === "MAXIM_LOCATION_SERVICE_URL") {
              title = "Maxim Location Service API URL";
              show = false;
              sequence = 9;
            } else if (x.key === "MAXIM_LOCATION_SERVICE_API_KEY") {
              title = "Maxim Location Service API Key";
              show = false;
              sequence = 10;
            }
            return {
              title,
              show,
              key,
              value,
              sequence,
              edit: false,
              canEdit
            };
          }).filter(x =>
            x.show
          ).sort((a, b) => {
            return Number(a.sequence) - Number(b.sequence);
          });
          this.originalConfigs = [];
          this.systemConfigs = [];

          for (let item of items) {
            this.originalConfigs.push(JSON.parse(JSON.stringify(item)));
            this.systemConfigs.push(JSON.parse(JSON.stringify(item)));
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        } else {
          this.error = Array.isArray(res.message) ? res.message[0] : res?.message;
          this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
          this.isLoading = false;
        }
      }, (err) => {
        this.error = Array.isArray(err.message) ? err.message[0] : err?.message ? err?.message : err;
        this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
        this.isLoading = false;
      })
    } catch (ex) {
      this.error = Array.isArray(ex.message) ? ex.message[0] : ex?.message ? ex?.message : ex;
      this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
      this.isLoading = false;
    }
  }

  onSaveSettings(setting: SystemConfig) {
    if (!setting) {
      return;
    }
    try {

      this.systemConfigService.save(setting).subscribe(res => {
        if (res.success) {
          if (setting.key === "STORE_LOCATION_NAME") {
            this.onSaveSettings({
              key: "STORE_LOCATION_COORDINATES",
              value: `${this.selectedCoords.lat}, ${this.selectedCoords.lng}`
            });
            setting["dirty"] = false;
          }
          setting["dirty"] = false;
          setting["edit"] = false;
          this.isLoading = false;
          this.loadSettings();
          this.snackBar.open('Settings saved!', 'close', {
            panelClass: ['style-success'],
          });
        } else {
          this.error = Array.isArray(res.message) ? res.message[0] : res?.message;
          this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
          this.isLoading = false;
        }
      }, (err) => {
        this.error = Array.isArray(err.message) ? err.message[0] : err?.message ? err?.message : err;
        this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
        this.isLoading = false;
      })
    } catch (ex) {
      this.error = Array.isArray(ex.message) ? ex.message[0] : ex?.message ? ex?.message : ex;
      this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
      this.isLoading = false;
    }
  }

  geocodeAddress(query: string) {
    return this.geoLocationService.geocodeAddress(query).pipe(
      map((response: any) => (response.data || []).map((item: any) => ({
        label: item.address,
        lat: item.coordinates.lat,
        lng: item.coordinates.lng
      }))),
      catchError(error => {
        return of([]); // fallback to empty array
      })
    );
  }

  onSearchAddressChange(value: any) {
    if (value && value !== '') {

      this.autocompleteService.getPlacePredictions(
        { input: value },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Process the predictions (results)
            this.placeResults = predictions.map(r => {
              return {
                description: r.description,
                place_id: r.place_id,
                main_text: r.structured_formatting.main_text
              }
            });
          }
        }
      );
    } else {
      this.placeResults = []; // Hide dropdown
    }
    this.cdr.detectChanges();
  }

  onAddressSelected(location) {
    if (location && location.place_id) {
      this.placesService.getDetails({ placeId: location.place_id }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          // Get the coordinates
          this.locationMapViewer.updateLocation(place.geometry.location.lat(), place.geometry.location.lng());
          this.locationMapViewer.map.googleMap.setCenter(place.geometry.location);
          this.selectedCoords = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };

          this.systemConfigs.find(x => x.key === "STORE_LOCATION_NAME").value = location.description;
          this.systemConfigs.find(x => x.key === "STORE_LOCATION_NAME").dirty = true;
          this.placeResults = []; // Hide dropdown
          this.systemConfigs.find(x => x.key === "STORE_LOCATION_NAME").valid = true;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.systemConfigs.find(x => x.key === "STORE_LOCATION_NAME").valid = false;
    }

    // Update the map viewer's marker
  }

  sendMessageToIframe(url, data = null, action: "updateContent" | "reload") {
    const iframe = document.getElementById('historyIframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.contentWindow?.postMessage({ action: action, data }, url);
    }

    if (!data["top"] || data["top"] === "" || !data["title"] || data["title"] === "" || !data["sub"] || data["sub"] === "" || !data["description"] || data["description"] === "") {
      this.systemConfigs.find(x => x.key === "CLIENT_SITE_HISTORY_CONTENTS").valid = false;
      this.systemConfigs.find(x => x.key === "CLIENT_SITE_HISTORY_CONTENTS").dirty = true;
    } else {
      this.systemConfigs.find(x => x.key === "CLIENT_SITE_HISTORY_CONTENTS").valid = true;
    }
  }


  onMarkerChanged(coords: { lat: number; lng: number }) {
    this.selectedCoords = coords;

    this.geoLocationService.reverseGeocode(coords.lat, coords.lng).subscribe((label) => {
      this.systemConfigs.find(x => x.key === "STORE_LOCATION_NAME").value = label;
      this.systemConfigs.find(x => x.key === "STORE_LOCATION_NAME").valid = true;
      this.systemConfigs.find(x => x.key === "STORE_LOCATION_NAME").dirty = true;
    });
  }

  onMapReady(locationMapViewer: LocationMapViewerComponent) {
    this.locationMapViewer = locationMapViewer;
    this.locationMapViewer.updateLocation(this.selectedCoords.lat, this.selectedCoords.lng);
    this.placesService = new google.maps.places.PlacesService(this.locationMapViewer.map.googleMap);
  }

  onSlideFileChange(event, slide: 1 | 2) {
    const _value = this.systemConfigs.find(x => x.key === "CLIENT_SITE_SLIDES_CONTENTS").value;

    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const value = this.systemConfigs.find(x => x.key === "CLIENT_SITE_SLIDES_CONTENTS").value;
      value[slide]["image"] = reader.result as string;
      value[slide]["fileName"] = file.name;
      this.systemConfigs.find(x => x.key === "CLIENT_SITE_SLIDES_CONTENTS").value = value;
      this.systemConfigs.find(x => x.key === "CLIENT_SITE_SLIDES_CONTENTS").valid = true;
      this.systemConfigs.find(x => x.key === "CLIENT_SITE_SLIDES_CONTENTS").dirty = true;
    };

    reader.readAsDataURL(file);
  }

  pictureErrorHandler(event, slide) {
    event.target.src = slide === 1 ? 'https://shaj-flower-shop-web-client-ochre.vercel.app/1-1.064affb871dee5ad.jpg' : 'https://shaj-flower-shop-web-client-ochre.vercel.app/1-2.b77f7996de58a054.jpg';
  }
}
