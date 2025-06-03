import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private storageService: StorageService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      let canActivate = false;
    const profile = this.storageService.getLoginProfile();
    if(!profile) {
      this.router.navigate(['auth']);
    }
    if(!profile.staffAccess) {
      this.router.navigate(['auth']);
    }

    if(next.data["title"] && !["home", "dashboard"].some(x=>x === next.data["title"].toLowerCase()) &&
    (profile.staffAccess && !profile.staffAccess.accessPages.some(x=>x.page.trim().toUpperCase() === next.data["title"].trim().toUpperCase() && x.view === true))) {
      this.router.navigate(['no-access'], {
        state: {
          "no-access-url": state.url,
          "no-access-page": next.data["title"]
        }
      });
    }
    if(profile && profile.accessGranted) {
      canActivate = true;
    }
    if(canActivate && next.data && next.data["title"]) {
      next.data = {
        ...next.data,
        access: profile.staffAccess && profile.staffAccess.accessPages.find(x=>x.page.trim().toUpperCase() === next.data["title"].toString().toUpperCase())
      };
    }
    return canActivate;
  }

}
