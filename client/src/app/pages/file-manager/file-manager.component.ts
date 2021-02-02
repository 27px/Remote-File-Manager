import { Component, OnInit, Input } from '@angular/core';

import data from '../../../assets/data/folder-data';

const _=(s:string):any=>document.querySelector(s);
const $=(s:string):any=>document.querySelectorAll(s);

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.css']
})
export class FileManagerComponent implements OnInit
{
  @Input() theme: string = "light"; // theme
  dragging: boolean = false; // currently dragging or not
  initY: number = 0; // Initial Drag Selection coordinates
  initX: number = 0; // Initial Drag Selection coordinates
  top: number = 0; // Drag selector dimensions
  left: number = 0; // Drag selector dimensions
  width: number = 0; // Drag selector dimensions
  height: number = 0; // Drag selector dimensions
  path: string[] = this.parsePath(data.path); // directory path
  contents: any[] = data.contents; // directory contents
  constructor()
  {
    let theme:any=localStorage.getItem("theme");
    if(theme!=null)
    {
      this.theme=theme;
    }
  }
  ngOnInit(): void
  {

  }
  switchTheme()
  {
    this.theme=this.theme=="dark"?"light":"dark";
    localStorage.setItem("theme",this.theme);
  }
  rightClick(event:any):void
  {
    event.preventDefault();
    console.log("right click");
  }
  mouseDown(event:any)
  {
    let {clientX:x,clientY:y}=event;
    this.initY=y;
    this.initX=x;
    this.setSelectDimensions(x,y,0,0);
    this.dragging=true;
  }
  mouseMoving(event:any)
  {
    if(this.dragging)
    {
      let {
        clientX:x,
        clientY:y
      }=event;
      // bottom right drag selection
      if(this.initY<y && this.initX<x)
      {
        this.setSelectDimensions(this.initX,this.initY,x-this.initX,y-this.initY);
      }
      // bottom left drag selection
      else if(this.initY<y && this.initX>=x)
      {
        this.setSelectDimensions(x,this.initY,this.initX-x,y-this.initY);
      }
      // top right drag selection
      else if(this.initY>=y && this.initX<x)
      {
        this.setSelectDimensions(this.initX,y,x-this.initX,this.initY-y);
      }
      // top left drag selectiong
      else if(this.initY>=y && this.initX>=x)
      {
        this.setSelectDimensions(x,y,this.initX-x,this.initY-y);
      }
    }
  }
  mouseUp()
  {
    this.dragging=false;
  }
  // set dragging box
  setSelectDimensions(x:number,y:number,w:number,h:number)
  {
    this.top=y;
    this.left=x;
    this.width=w;
    this.height=h;
  }
  preventDefault(event:any)
  {
    event.preventDefault();
  }
  preventPropagation(event:any)
  {
    event.stopPropagation();
  }
  shortcut(event:any)
  {
    //Control Key was also pressing
    if(event.ctrlKey)
    {
      // key: k
      if(event.keyCode==70)
      {
        event.preventDefault();
        _("#search")?.focus()
      }
    }
  }
  //split url path to array of drirectory path
  parsePath(url:string):string[]
  {
    return url.replace(/(:\/\/|\\)/g,"/").split("/");
  }
}
