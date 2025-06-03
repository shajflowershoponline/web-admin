import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ResolveEnd, ActivatedRouteSnapshot, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, RouterEvent } from '@angular/router';
import { filter } from 'rxjs';
import { RouteService } from './services/route.service';
import { AppConfigService } from './services/app-config.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StorageService } from './services/storage.service';
import { OneSignal } from 'onesignal-ngx';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title;
  grantNotif = false;
  showLoader = false;
  constructor(
    private oneSignal: OneSignal,
    private titleService:Title,
    private router: Router,
    private snackBar:MatSnackBar,
    private appconfig: AppConfigService,
    private storageService: StorageService,
    private routeService: RouteService) {
      if(this.storageService.getLoginProfile()?.staffUserId) {
        const { staffUserId } = this.storageService.getLoginProfile();
      }
      if (!window.Notification) {
        console.log('Browser does not support notifications.')
      } else {
        // check if permission is already granted
        if (Notification.permission === 'granted') {
          // show notification here
          this.grantNotif = true;
        } else {
          // request permission from the user
          Notification.requestPermission()
            .then(function (p) {
              if (p === 'granted') {
                // show notification here
              } else {
                console.log('User blocked notifications.')
              }
            })
            .catch(function (err) {
              console.error(err)
            })
        }
      }
    this.setupTitleListener();
  }
  ngOnInit(): void {
  }
  private setupTitleListener() {
    this.router.events.pipe(filter(e => e instanceof ResolveEnd)).subscribe((e: any) => {
      const { data } = this.getDeepestChildSnapshot(e.state.root);
      this.routeService.changeData(data);
      if(data?.['title']){
        this.title = data['title'];
        this.titleService.setTitle(`${this.title} | ${this.appconfig.config.appName}`);
      }
      this.navigationInterceptor(e);
    });
  }

  getDeepestChildSnapshot(snapshot: ActivatedRouteSnapshot) {
    let deepestChild = snapshot.firstChild;
    while (deepestChild?.firstChild) {
      deepestChild = deepestChild.firstChild
    };
    return deepestChild || snapshot
  }
  // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
    }
    if (event instanceof NavigationEnd) {
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
    }
    if (event instanceof NavigationError) {
    }
  }
}
