import { Component, OnInit, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'app-file-folder',
  templateUrl: './file-folder.component.html',
  styleUrls: ['./file-folder.component.css']
})
export class FileFolderComponent implements OnInit
{
  @Input() content:any = null;

  hidden:boolean = false;

  constructor(public element:ElementRef)
  {

  }
  ngOnInit(): void
  {

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
