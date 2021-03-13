import { Component, OnInit, Input, Output, ElementRef, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-file-folder',
  templateUrl: './file-folder.component.html',
  styleUrls: ['./file-folder.component.css']
})
export class FileFolderComponent implements OnInit
{
  @Input() content:any = null;
  @Output() openFolder:EventEmitter<any>=new EventEmitter();

  constructor(public element:ElementRef)
  {

  }
  ngOnInit(): void
  {

  }
  openDir(folder:string)
  {
    this.openFolder.emit(folder);
  }
  preventPropagation(event:any)
  {
    event.stopPropagation();
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
}
