import { Component, AfterViewInit, Input, ViewChildren } from '@angular/core';

// Components
import { FileFolderComponent } from "../../components/file-folder/file-folder.component";

// data models
import data from '../../../assets/data/folder-data';
import sortType from '../../../model/sortType';
import dragDimension from "../../../model/dragDimension";

// Custom Functions
const _=(s:string):any=>document.querySelector(s);
const $=(s:string):any=>document.querySelectorAll(s);

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.css']
})
export class FileManagerComponent implements AfterViewInit
{
  @Input() theme: string = "light"; // theme
  @ViewChildren(FileFolderComponent) filesAndFolders:any;

  dragging: boolean = false; // currently dragging or not
  drag: dragDimension = new dragDimension();
  path: string[] = this.parsePath(data.path); // directory path
  contents: any[] = data.contents; // directory contents
  search: any = null; // search element
  sort: sortType = new sortType("type","asc"); // sort by type and arrange as ascending
  noItems: boolean = this.contents.length<1;
  loading: boolean = false;

  constructor()
  {
    this.loading=true;
    // load items from backend
    this.loading=false;


    let theme:any=localStorage.getItem("theme"); // dark or white mode
    if(theme!=null)
    {
      this.theme=theme;
    }
  }
  ngAfterViewInit(): void
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
    // replaces different types of slashes like ( :// , \ , / ) to one type to ( / ) before spliting
    return url.replace(/(:\/\/|\\)/g,"/").split("/").filter(dir=>dir!="");
  }
  // typing in search box
  searching()
  {
    let key=this.search.value,i=0;
    this.filesAndFolders?._results?.forEach((item:any)=>{
      if(item.getData().name.toLowerCase().indexOf(key.toLowerCase())==-1)
      {
        item.hide();// not a match
      }
      else
      {
        item.show();
        i++;
      }
    });
    this.noItems=i<1;
  }
  strcmp(a:any,b:any):1|-1|0
  {
    return a.name<b.name?-1:a.name>b.name?1:0;
  }
  //sort
  arrange()
  {
    console.warn(this.sort);
  }
  getSelectorStyle()
  {
    return {
      top: this.drag.top+'px',
      left: this.drag.left+'px',
      width: this.drag.width+'px',
      height: this.drag.height+'px'
    };
  }
}
