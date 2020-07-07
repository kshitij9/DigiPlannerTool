import { Component, OnInit } from '@angular/core';
import { AuthService, SocialUser } from 'angularx-social-login';
import { UserService } from './user.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title:string = 'digi-planner';
  currentUser:string;
  userType:string;
  constructor(private userService:UserService,private router:Router){
    this.userService.loggedIn.subscribe(() => {
      this.currentUser = 'Admin';
    })

    this.userService.loggedOut.subscribe(() => {
      this.currentUser = '';
    });
  }

  ngOnInit(): void {
    if(localStorage.getItem('loggedInAsAdmin') === '1'){
      this.userService.adminLoggedIn();
    }
  }

  checkIfLoggedIn(){
    return localStorage.getItem('loggedInAsAdmin') === '1';
  }

  signOut(){
    this.router.navigate(['/login']);
    this.userService.adminLoggedOut();
    localStorage.setItem('loggedInAsAdmin', '0');
  }

  goToHome(){
    if(this.currentUser){
        this.router.navigate(['/home']);      
    }else{
      console.log('not logged in');
      this.router.navigate(['/login']);
    }
  }  
}
