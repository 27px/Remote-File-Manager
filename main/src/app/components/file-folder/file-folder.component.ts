import { Component, OnInit, Input, Output, ElementRef, EventEmitter } from '@angular/core';

import keyBoardStatus from '../../../model/keyBoardStatus';

@Component({
  selector: 'app-file-folder',
  templateUrl: './file-folder.component.html',
  styleUrls: ['./file-folder.component.css']
})
export class FileFolderComponent implements OnInit
{
  @Input() content: any = null;
  @Input() keyboard: keyBoardStatus = {
    ctrl: false,
    shift: false,
    alt: false,
    caps: false
  }
  @Input('attr-index') index: number = -1;
  @Input('isCut') isCut: boolean = false;
  @Output() openFolder: EventEmitter<any> = new EventEmitter();
  @Output() clearAllSelections: EventEmitter<any> = new EventEmitter();
  @Output() shiftSelection: EventEmitter<any> = new EventEmitter();

  constructor(public element: ElementRef)
  {

  }
  ngOnInit(): void
  {

  }
  openDir(folder:string,readable:boolean=true)
  {
    this.openFolder.emit({
      folder,
      readable
    });
  }
  getData()
  {
    return this.content;
  }
  hide()
  {
    this.element.nativeElement.classList.add("hidden");
  }
  show()
  {
    this.element.nativeElement.classList.remove("hidden");
  }
  clicked(event:any)
  {
    event.stopPropagation();
    if(this.keyboard.ctrl)
    {
      this.toggleItemSelection();
    }
    else if(this.keyboard.shift)
    {
      this.shiftSelection.emit(this.index);
    }
    else
    {
      this.clearAllSelections.emit();
      this.content.selected=true;
    }
  }
  toggleItemSelection()
  {
    this.content.selected=!this.content.selected;
  }
  setItemSelection(state:boolean)
  {
    this.content.selected=state;
  }
  getDimensions()
  {
    return this.element.nativeElement.children[0].getBoundingClientRect();
  }
  getFolderClasses()
  {
    let classList=[
      'item',
      'folder'
    ];
    if(!this.content.readable) {
      classList.push('not-readable');
    }
    else if(this.content.filled) {
      classList.push('filled');
    }
    if(this.content.selected) {
      classList.push('item-selected');
    }
    if(this.isCut) {
      classList.push('item-cut');
    }
    return classList.join(" ");
  }
  getFileClasses()
  {
    let classList=[
      'item',
      'file'
    ];
    if(!this.content.readable) {
      classList.push('not-readable');
    }
    if(this.content.selected) {
      classList.push('item-selected');
    }
    if(this.isCut) {
      classList.push('item-cut');
    }
    return classList.join(" ");
  }
  getDriveClasses()
  {
    let classList=[
      'item',
      'drive'
    ];
    if(this.content.selected) {
      classList.push('item-selected');
    }
    let percent=parseInt(this.content.capacity.percentage);
    if(percent>80) {
      classList.push('high');
    }
    return classList.join(" ");
  }
  getSizeDetails(capacity:any):string
  {
    return `${this.byteToUnitString(capacity.used_space)} used of ${this.byteToUnitString(capacity.total_space)}`;
  }
  byteToUnitString(size:number):string
  {
    let s=size, unit=0, units=['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    while(s>=1024)
    {
      unit++;
      s=Math.floor(s/1024);
    }
    return `${s} ${units[unit]}`;
  }
}
