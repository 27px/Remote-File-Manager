// @ts-nocheck
// the above comment is to disable typescript check, angular is showing some stupid error
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChildren
} from "@angular/core";

import { InputComponent } from "../input/input.component";

interface stringKey {
  [key: string]: any;
}

@Component({
  selector: "app-pop-up",
  templateUrl: "./pop-up.component.html",
  styleUrls: ["./pop-up.component.css"]
})
export class PopUpComponent implements OnInit {
  editConnectionData: any = null;
  alreadySetEditData: boolean = false;

  @Input() popUp: any = {};

  @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
  @Output() misk: EventEmitter<any> = new EventEmitter<any>();
  @Output() ok: EventEmitter<any> = new EventEmitter<any>();

  @ViewChildren(InputComponent) elements: any = null;

  constructor() {}

  ngOnInit(): void {}

  stopPropagation(event: any) {
    event?.stopPropagation();
  }
  emitOk() {
    let data = null;
    // connection properties
    if (this.popUp.type == "connection-properties") {
      data = this.getConnectionProperties();
      this.alreadySetEditData = false;
      this.editConnectionData = null;
    } else if (this.popUp.type == "rename") {
      data = this.getRenameNewName();
    }
    this.ok.emit(data);
  }
  getConnectionProperties() {
    let data = {},
      error = false;
    this.elements._results.forEach((item: stringKey) => {
      if (item.getValue() == "") {
        error = true;
        item.setError();
      } else {
        item.unsetError();
        data[item.getName()] = item.getValue();
      }
    });
    if (error) {
      return null;
    }
    return data;
  }
  getRenameNewName() {
    let item = this.elements._results[0];
    // querySelector used due to getValue returns old value
    let name =
      document?.querySelector("#rename-new-name")?.value ?? item.getValue();
    if (name == "") {
      item.setError();
      return null;
    }
    if (/[/\\:*?"<>|]/.test(name)) {
      item.setError('Cannot contain symbols /\\:*?"<>| ');
      return null;
    } else {
      item.unsetError();
      return name;
    }
  }
  emitCancel() {
    this.alreadySetEditData = false;
    this.editConnectionData = null;
    this.cancel.emit(null);
  }
  emitMisk() {
    let data;
    if (this.popUp.misk.text == "Test") {
      // test connection
      data = this.getConnectionProperties();
      if (data !== null) {
        this.misk.emit(data);
      }
    } else {
      // others
      this.misk.emit(data);
    }
  }
  setEditConnectionData() {
    if (
      this.editConnectionData != null &&
      this.elements._results.length > 0 &&
      !this.alreadySetEditData
    ) {
      let data = this.editConnectionData;
      this.elements._results.forEach((item: any) => {
        item.setValue(data[item.getName()]);
      });
      this.alreadySetEditData = true;
    }
    return false; // to not render the dummy element
  }
  setRenameData() {
    this.elements?._results?.[0]?.setValue(this.renameData);
    return false; // to not render the dummy element
  }
}
