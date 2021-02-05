import { Component, OnInit, Input } from '@angular/core';

import data from '../../../assets/data/folder-data';
import sortType from '../../../model/sortType';
import dragDimension from "../../../model/dragDimension";

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
  drag: dragDimension = new dragDimension();
  path: string[] = this.parsePath(data.path); // directory path
  contents: any[] = data.contents; // directory contents
  search: any = null; // search element
  sort: sortType = new sortType("type","asc"); // sort by type and arrange as ascending

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
    this.search=_("#search");
    this.arrange();
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
    this.drag.initY=y;
    this.drag.initX=x;
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
      if(this.drag.initY<y && this.drag.initX<x)
      {
        this.setSelectDimensions(this.drag.initX,this.drag.initY,x-this.drag.initX,y-this.drag.initY);
      }
      // bottom left drag selection
      else if(this.drag.initY<y && this.drag.initX>=x)
      {
        this.setSelectDimensions(x,this.drag.initY,this.drag.initX-x,y-this.drag.initY);
      }
      // top right drag selection
      else if(this.drag.initY>=y && this.drag.initX<x)
      {
        this.setSelectDimensions(this.drag.initX,y,x-this.drag.initX,this.drag.initY-y);
      }
      // top left drag selectiong
      else if(this.drag.initY>=y && this.drag.initX>=x)
      {
        this.setSelectDimensions(x,y,this.drag.initX-x,this.drag.initY-y);
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
    this.drag.top=y;
    this.drag.left=x;
    this.drag.width=w;
    this.drag.height=h;
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
  // typing in search box
  searching()
  {
    let key=this.search.value;
    this.contents.map(content=>{
      if(content.name.toLowerCase().indexOf(key.toLowerCase())==-1)
      {
        content.hidden=true;// not a match
      }
      else
      {
        content.hidden=false;
      }
      return content;
    });
  }
  strcmp(a:any,b:any):1|-1|0
  {
    let x=a.name;
    let y=b.name;
    if(x<y)
    {
      return -1;
    }
    else if(x>y)
    {
      return 1;
    }
    return 0;
  }
  //sort
  arrange()
  {
    console.warn(this.sort);
  }
}
