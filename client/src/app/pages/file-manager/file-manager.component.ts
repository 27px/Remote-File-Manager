import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.css']
})
export class FileManagerComponent implements OnInit
{
  @Input() theme: any = "light";
  dragging:boolean=false;
  initY:number=0;
  initX:number=0;
  top:number=0;
  left:number=0;
  width:number=0;
  height:number=0;
  folders=[
    {
      "name":"New Folder 01",
      "filled":false
    },
    {
      "name":"New Folder 02",
      "filled":true
    },
    {
      "name":"New Folder 03",
      "filled":false
    },
    {
      "name":"New Folder 04",
      "filled":false
    },
    {
      "name":"New Folder 05",
      "filled":false
    },
    {
      "name":"New Folder 06",
      "filled":false
    },
    {
      "name":"New Folder 07",
      "filled":false
    },
    {
      "name":"New Folder 08",
      "filled":false
    },
    {
      "name":"New Folder 09",
      "filled":false
    },
    {
      "name":"New Folder 10",
      "filled":false
    }
  ];
  files=[
    "File 01.txt",
    "File 02.txt",
    "File 03.txt",
    "File 04.txt",
    "File 05.txt",
    "File 06.txt",
    "File 07.txt",
    "File 08.txt",
    "File 09.txt",
    "File 10.txt"
  ];

  constructor()
  {
    let t:any=localStorage.getItem("theme");
    if(t!=null)
    {
      this.theme=t;
    }
  }
  ngOnInit(): void { }

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
      let {clientX:x,clientY:y}=event;
      if(this.initY<y && this.initX<x)//quad 4
      {
        this.setSelectDimensions(this.initX,this.initY,x-this.initX,y-this.initY);
      }
      else if(this.initY<y && this.initX>=x)//quad 3
      {
        this.setSelectDimensions(x,this.initY,this.initX-x,y-this.initY);
      }
      else if(this.initY>=y && this.initX<x)//quad 2
      {
        this.setSelectDimensions(this.initX,y,x-this.initX,this.initY-y);
      }
      else if(this.initY>=y && this.initX>=x)//quad 1
      {
        this.setSelectDimensions(x,y,this.initX-x,this.initY-y);
      }
    }
  }
  mouseUp()
  {
    this.dragging=false;
  }
  setSelectDimensions(x:number,y:number,w:number,h:number)
  {
    this.top=y;
    this.left=x;
    this.width=w;
    this.height=h;
  }
  prevent(event:any)
  {
    event.stopPropagation();
  }
}
