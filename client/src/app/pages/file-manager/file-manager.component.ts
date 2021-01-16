import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.css']
})
export class FileManagerComponent implements OnInit
{
  @Input() theme: any = "light";

  constructor()
  {
    let t:any=localStorage.getItem("theme");
    if(t!=null)
    {
      this.theme=t;
    }
  }
  ngOnInit(): void { }

  rightClick(event:any):void
  {
    event.preventDefault();
    console.log("RC");
  }
  switchTheme()
  {
    this.theme=this.theme=="dark"?"light":"dark";
    localStorage.setItem("theme",this.theme);
  }
}
