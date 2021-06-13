import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { InputComponent } from './components/input/input.component';
import { FileManagerComponent } from './pages/file-manager/file-manager.component';
import { FileFolderComponent } from './components/file-folder/file-folder.component';
import { PopUpComponent } from './components/pop-up/pop-up.component';

@NgModule({
  declarations: [
    AppComponent,
    InputComponent,
    FileManagerComponent,
    FileFolderComponent,
    PopUpComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
