import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AdminBoardComponent } from './admin-board/admin-board.component';
import { UserBoardComponent } from './user-board/user-board.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatModule } from './material.module';

import { SocialLoginModule, AuthServiceConfig } from "angularx-social-login";
import { GoogleLoginProvider} from "angularx-social-login";

import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { JoinRoomDialogComponent } from './join-room-dialog/join-room-dialog.component';
import { ViewBoardsComponent } from './view-boards/view-boards.component';
import { CreateBoardDialogComponent } from './create-board-dialog/create-board-dialog.component';
import { HttpClientModule } from '@angular/common/http';

let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider("610664320073-4ik734pbbflijv056jr130n5k6e7ia8q.apps.googleusercontent.com")
  },
]);

export function provideConfig() {
  return config;
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminBoardComponent,
    UserBoardComponent,
    HomeComponent,
    JoinRoomDialogComponent,
    ViewBoardsComponent,
    CreateBoardDialogComponent,
  ],
  imports: [
    BrowserModule,
    SocialLoginModule,
    BrowserAnimationsModule,
    MatModule,
    AppRoutingModule,
    HttpClientModule
  ],
  entryComponents:[
    JoinRoomDialogComponent,
    CreateBoardDialogComponent
  ],
  providers: [
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
