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
    alt: false
  }
  @Input('attr-index') index: number = -1;
  @Output() openFolder: EventEmitter<any> = new EventEmitter();
  @Output() clearAllSelections: EventEmitter<any> = new EventEmitter();

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
    if(!this.keyboard.ctrl)
    {
      this.clearAllSelections.emit();
      this.content.selected=true;
    }
    else
    {
      this.toggleItemSelection();
    }
  }
  toggleItemSelection()
  {
    this.content.selected=!this.content.selected;
  }
  getDimensions()
  {
    return this.element.nativeElement.children[0].getBoundingClientRect();
  }

  redHighlight()
  {
    this.element.nativeElement.children[0].classList.add("red");
  }
  redUnHighlight()
  {
    this.element.nativeElement.children[0].classList.remove("red");
  }
}
