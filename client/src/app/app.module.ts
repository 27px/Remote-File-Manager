import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { NavComponent } from './components/nav/nav.component';
import { LoginComponent } from './pages/login/login.component';
import { InputComponent } from './components/input/input.component';
import { SignupComponent } from './pages/signup/signup.component';
import { FileManagerComponent } from './pages/file-manager/file-manager.component';
import { FileFolderComponent } from './components/file-folder/file-folder.component';
import { PopUpComponent } from './components/pop-up/pop-up.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavComponent,
    LoginComponent,
    InputComponent,
    SignupComponent,
    FileManagerComponent,
    FileFolderComponent,
    PopUpComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
