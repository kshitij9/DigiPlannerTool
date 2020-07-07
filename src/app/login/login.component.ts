import { Component, OnInit } from '@angular/core';
import { AuthService, SocialUser, GoogleLoginProvider } from 'angularx-social-login';
import { UserService } from '../user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  currentUser:SocialUser;
  userType:string="admin";
  inH:number;
  isLoggedIn:boolean = true;
  userName: string = "";
  password: string = "";
  constructor(
    private authService:AuthService,
    private userService:UserService,
    private snackBar:MatSnackBar,
    private router:Router){
      this.inH = window.innerHeight*0.9;
  }

  ngOnInit():void {
    if(localStorage.getItem('loggedInAsAdmin') === '1'){
      this.isLoggedIn = true;
      this.userService.adminLoggedIn();
      this.router.navigate(['/home']);
    } else {
      this.isLoggedIn = false;
    }
  }

  onChange(event):void {   
    this.userType=event.value;
  }

  signIn():void {

    if(this.userName.toLowerCase() == 'admin' && this.password.toLowerCase() == 'admin'){
      this.showSnackBar('Login Successful','cancel');
      this.userService.adminLoggedIn();
      localStorage.setItem('loggedInAsAdmin', '1');
      this.router.navigate(['/home']);
    }
    // this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user) => {
    //   if(user){
    //     this.userService.verifyUser(user.email).subscribe((result) => {
    //       console.log(result['success']);
    //       if(result['success']){
    //         let data = result['data'];
    //         console.log(data);
    //         if((data['roles'][0] === 1 && this.userType === 'admin') || (data['roles'][0] === 2 && this.userType === 'user')) {
    //             this.showSnackBar('Login Successful','cancel');
    //             this.router.navigate(['/home']);
    //         } else {
    //             this.signOut();
    //             this.showSnackBar('invalid user or usertype!','cancel');
    //         } 
    //       }else{
    //         this.signOut();
    //         this.showSnackBar(result['messages'],'cancel');
    //       }
    //     }); 
    //   }
    // }).catch(error => {
    //   console.log(error);
    //   this.showSnackBar('Error in signing in','cancel');
    // });
  }

  signOut():void {
    this.authService.signOut();
  }

  checkIfFieldIsEmpty() {
    return this.userName.length === 0 || this.password.length === 0;
  }

  showSnackBar(message:string,action:string):void {
    this.snackBar.open(message,action,{
      duration:3000,
    });
  }

}
