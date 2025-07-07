import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router, ResolveEnd, ActivatedRouteSnapshot, RouterEvent, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { StaffUser } from 'src/app/models/staff-user';
import { AppConfigService } from 'src/app/services/app-config.service';
import { AuthService } from 'src/app/services/auth.service';
import { RouteService } from 'src/app/services/route.service';
import { StorageService } from 'src/app/services/storage.service';
import { AlertDialogModel } from 'src/app/shared/components/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/components/alert-dialog/alert-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss'],
  host: {
    class: "component-wrapper"
  }
})
export class FeaturesComponent implements OnInit, AfterViewInit{
  appName = "";
  title = "";
  loading = false;
  drawerDefaultOpened = false;
  details = false;
  profile: StaffUser;
  currentGroup;
  disableGroupAnimation = true;
  _unReadNotificationCount: number = 0;
  profileLoaded = false;
  disableToolBarShadow = false;
  constructor(
    private titleService:Title,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private storageService: StorageService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private routeService: RouteService
    ) {
      this.profile = this.storageService.getLoginProfile();
      if(this.profile && this.profile.userName) {
      }
      this.onResize();
      this.routeService.data$.subscribe((res: { title: string; admin: boolean; details: boolean }) => {
        this.title = res.title;
        this.details = res.details;

      });
  }
  async ngOnInit(): Promise<void> {
    await this.getNotifCount();
  }

  ngAfterViewInit(): void {
    if(document.querySelector(".page-container").querySelector("mat-toolbar")) {
      this.disableToolBarShadow = true;
    } else {
      this.disableToolBarShadow = false;
    }
    this.cdr.detectChanges();
  }

  get unReadNotificationCount() {
    return this._unReadNotificationCount;
  }

  async getNotifCount() {
    // const res = await this.notificationsService.getUnreadByUser(this.profile.userId).toPromise();
    // this.storageService.saveUnreadNotificationCount(res.data);
    // let count = this.storageService.getUnreadNotificationCount();
    // if(!isNaN(Number(count))) {
    //   this._unReadNotificationCount = Number(count);
    // } else if(count && isNaN(Number(count))) {
    //   this._unReadNotificationCount = 0;
    // } else {
    //   this._unReadNotificationCount = 0
    // }
  }

  onActivate(event) {
    this.currentGroup = event?.route?.snapshot?.data["group"] && event?.route?.snapshot?.data["group"] !== undefined ? event?.route?.snapshot?.data["group"] : null;
    this.onResize();
    setTimeout(()=> {
      if(document.querySelector(".page-container").querySelector("mat-toolbar")) {
        this.disableToolBarShadow = true;
      } else {
        this.disableToolBarShadow = false;
      }
      this.cdr.detectChanges();
    }, 500)
  }

  expand(group = "") {
    return this.currentGroup?.toLowerCase() === group.toLowerCase();
  }

  showGroupMenu(pages = []) {
    return this.profile && this.profile.staffAccess && this.profile?.staffAccess?.accessPages?.some(x=> pages.some(p => p.toLowerCase() === x.page.toLowerCase()) && x.view === true);
  }

  showMenu(page: string) {
    return this.profile && this.profile.staffAccess && this.profile?.staffAccess?.accessPages?.some(x=>x.page.toLowerCase() === page.toLowerCase() && x.view === true);
  }

  signOut() {
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = 'Are you sure you want to logout?';
    dialogData.confirmButton = {
      visible: true,
      text: 'yes',
      color: 'primary',
    };
    dialogData.dismissButton = {
      visible: true,
      text: 'cancel',
    };
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      maxWidth: '400px',
      closeOnNavigation: true,
    });

    dialogRef.componentInstance.alertDialogConfig = dialogData;
    dialogRef.componentInstance.conFirm.subscribe(async (confirmed: any) => {
      const profile = this.storageService.getLoginProfile();
      this.storageService.saveLoginProfile(null);
      this.authService.redirectToPage(true)
      dialogRef.close();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    if(window.innerWidth >= 960) {
      this.drawerDefaultOpened = true;
    } else {
      this.drawerDefaultOpened = false;
    }
  }
}
