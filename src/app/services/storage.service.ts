import { Injectable } from '@angular/core';
import { StaffUser } from '../models/staff-user';
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  getLoginProfile(): StaffUser {
    let profile: any = this.get('loginProfile');
    if(JSON.parse(profile) !== null && profile !== ''){
      const user: StaffUser = JSON.parse(profile);
      if(!user) {
        return null;
      }
      if(user.staffAccess && user.staffAccess.accessPages) {
        user.staffAccess.accessPages = user.staffAccess?.accessPages?.map(x=> {
          x.modify = x.modify.toString().trim() === "true";
          x.view = x.view.toString().trim() === "true";
          return x;
        })
      }
      return user;
    }
    else {return null;}
  }
  saveLoginProfile(value: StaffUser){
    return this.set('loginProfile', JSON.stringify(value));
  }
  getAccessToken(){
    return this.get('accessToken');
  }
  saveAccessToken(value: any){
    return this.set('accessToken', value);
  }
  getRefreshToken(){
    return this.get('refreshToken');
  }
  saveRefreshToken(value: any){
    return this.set('refreshToken', value);
  }
  getSessionExpiredDate(){
    return this.get('sessionExpiredDate');
  }
  saveSessionExpiredDate(value: any){
    return this.set('sessionExpiredDate', value);
  }
  getUnreadNotificationCount(){
    return this.get('unReadNotificationCount');
  }
  saveUnreadNotificationCount(value: any){
    return this.set('unReadNotificationCount', value);
  }
  getCurrentLocation(){
    let currentLocationJSON: any = this.get('currentLocation');
    if(JSON.parse(currentLocationJSON) !== null && currentLocationJSON !== ''){
      const currentLocation: {latitude: string, longitude: string} = JSON.parse(currentLocationJSON);
      if(!currentLocation) {
        return null;
      }
      return currentLocation;
    }
    else {return null;};
  }
  saveCurrentLocation(value: any){
    return this.set('currentLocation', JSON.stringify(value));
  }
  private set(key: string, value: any){
    localStorage.setItem(key, value);
  }
  private get(key: string){
    return localStorage.getItem(key);
  }
}
