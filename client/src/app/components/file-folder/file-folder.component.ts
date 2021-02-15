import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-file-folder',
  templateUrl: './file-folder.component.html',
  styleUrls: ['./file-folder.component.css']
})
export class FileFolderComponent implements OnInit
{
  @Input() content:any = null;

  hidden:boolean = false;

  constructor()
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
    this.hidden=true;
  }
  show()
  {
    this.hidden=false;
  }
}
