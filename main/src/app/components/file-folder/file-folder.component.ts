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
  @Output() openFolder: EventEmitter<any> = new EventEmitter();
  @Output() clearAllSelections: EventEmitter<any> = new EventEmitter();
  @Output() shiftSelection: EventEmitter<any> = new EventEmitter();

  constructor(public element: ElementRef)
  {

  }
  ngOnInit(): void
  {

  }
  openDir(folder:string)
  {
    this.openFolder.emit(folder);
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
    let classes=[
      'item',
      'folder'
    ];
    if(!this.content.readable)
    {
      classes.push('not-readable');
    }
    else if(this.content.filled)
    {
      classes.push('filled');
    }
    if(this.content.selected)
    {
      classes.push('item-selected');
    }
    return classes.join(" ");
  }
  getFileClasses()
  {
    let classes=[
      'item',
      'file'
    ];
    if(!this.content.readable)
    {
      classes.push('not-readable');
    }
    if(this.content.selected)
    {
      classes.push('item-selected');
    }
    return classes.join(" ");
  }
}
