import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { URI } from './constants';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  loggedOut: Subject<any>;
  loggedIn: Subject<any>;
  constructor(private http:HttpClient) { 
    this.loggedOut = new Subject();
    this.loggedIn = new Subject();
  }
  
  getUserType(email:string){
    return this.http.get(`${URI}/user/${email}`);
  }

  adminLoggedOut() {
    this.loggedOut.next();
  }

  adminLoggedIn() {
    this.loggedIn.next();
  }

}
