import { Component, OnInit, Input, Output, EventEmitter, ViewChildren } from '@angular/core';

import { InputComponent } from '../input/input.component';

@Component({
  selector: 'app-pop-up',
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.css']
})
export class PopUpComponent implements OnInit
{
  editConnectionData:any = null;
  alreadySetEditData:boolean = false;

  @Input() popUp: any = {};

  @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
  @Output() ok: EventEmitter<any> = new EventEmitter<any>();

  @ViewChildren(InputComponent) elements:any = null;

  constructor()
  {

  }

  ngOnInit(): void
  {

  }

  stopPropagation(event:any)
  {
    event?.stopPropagation();
  }
  emitOk()
  {
    let data=null;
    // connection properties
    if(this.popUp.type=="connection-properties")
    {
      data={};
      let error=false;
      this.elements._results.forEach((item:any)=>{
        if(item.getValue()=="")
        {
          error=true;
          item.setError();
        }
        else
        {
          item.unsetError();
          data[item.getName()]=item.getValue();
        }
      });
      if(error)
      {
        return;
      }
      this.alreadySetEditData=false;
      this.editConnectionData=null;
    }
    this.ok.emit(data);
  }
  emitCancel()
  {
    this.alreadySetEditData=false;
    this.editConnectionData=null;
    this.cancel.emit(null);
  }
  setEditConnectionData()
  {
    if(this.editConnectionData!=null && this.elements._results.length>0 && !this.alreadySetEditData)
    {
      let data=this.editConnectionData;
      this.elements._results.forEach((item:any)=>{
        item.setValue(data[item.getName()]);
      });
      this.alreadySetEditData=true;
    }
    return false;
  }
}
