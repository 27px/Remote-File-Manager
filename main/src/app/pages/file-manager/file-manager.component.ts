import { Component, AfterViewInit, Input, ViewChildren } from '@angular/core';

// Components
import { FileFolderComponent } from "../../components/file-folder/file-folder.component";
import { PopUpComponent } from "../../components/pop-up/pop-up.component";

// data models
import sortType from '../../../model/sortType';
import keyBoardStatus from '../../../model/keyBoardStatus';
import dragDimension from "../../../model/dragDimension";
import { fs } from "../../../model/fs";// file folder operations list
// import AVAILABLE_FILE_ICONS from "../../../default-values/AVAILABLE_FILE_ICONS";
import AVAILABLE_POP_UP_ICONS from "../../../default-values/AVAILABLE_POP_UP_ICONS";
import config from "../../config/config";

let dynamic_port = localStorage.getItem("USED_PORT") || config.server.PORT;
let domain:string = `http://${config.server.HOST}:${dynamic_port}`;
let socket:any = new WebSocket(`ws://localhost:${dynamic_port}`);
let isSocketOpen:boolean = false;

// Custom Functions
const _=(s:string):any=>document.querySelector(s);
const $=(s:string):any=>document.querySelectorAll(s);

declare global // extending window to contain main attribute (for attaching electron's functions)
{
  interface Window
  {
    main:any;
  }
}
let keyState={
  ctrl: false,
  shift: false,
  alt: false,
  caps: false
};

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.css']
})
export class FileManagerComponent implements AfterViewInit
{
  @Input() theme: string = "light"; // theme
  @ViewChildren(FileFolderComponent) filesAndFolders:any;
  @ViewChildren(PopUpComponent) popUpElement:any;

  dragging: boolean = false; // currently dragging or not
  drag: dragDimension = new dragDimension();
  path: string[] = []; // directory path
  contents: any[] = []; // directory contents
  search: any = null; // search element
  editPathInput: any = null;
  sort: sortType = new sortType("type","asc"); // sort by type and arrange as ascending
  noItems: boolean = false;
  error_loading: string = ""; // "" for no error else error message
  loading: boolean = false;
  INITIAL_PATH: string = "/";
  editingPath: boolean = false; // currently editing path
  default_icon_size_index:number = 2; // default 2
  iconSizes: string[] = ["ex-sm", "sm", "md", "lg", "ex-lg", "hg"];
  iconSizeIndex: any = this.default_icon_size_index; // medium by default
  connections: any[] = [];
  popUp: any = this.initialPopUpState();
  contextMenu: any = null;
  paste:any = null;
  inBrowser:boolean = false;
  process_id:number = 0; // id to keep track of background tast netween server and client using socket
  background_processes:any = []; // accessed with process_id (number), not with array index
  keyboard:keyBoardStatus = keyState;
  isProgressActive:boolean = false;
  online: boolean = navigator.onLine;
  current_server:string|null = null;
  current_test_connection:string | null = null;
  isWin:boolean|null=null;
  finished_loaded_init_contents:boolean = false;
  finished_setting_up_socket:boolean = false;
  max_spash_visibility_over:boolean = false;
  minimum_splash_visibility:number = 0; // default 2000 for visual effects and 0 for performance
  isDriveListing:boolean=false; // if loading a list of drives or not (only in local)

  constructor()
  {
    // web socket
    this.setUpSocket();

    // set theme
    this.theme=localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme",this.theme); // dark or light mode // default light

    // hide close and minimize if in browser
    this.inBrowser=(typeof (window?.main) == 'undefined');

    // set icon size
    this.setIconSizeIndex(localStorage.getItem("icon-size") ?? this.default_icon_size_index); // default is medium

    // set connections
    this.connections=this.getConnections();

    // Connect and load contents
    this.connectToFileSystem(null,true); // loading from local file system

    // offline listener
    window.addEventListener("offline", (event) => {
      this.online=false;
      this.toast("error","You are offline");
    });

    // online listener
    window.addEventListener("online", (event) => {
      this.online=true;
      this.toast("success","Back online");
    });

    setTimeout(()=>{
      this.max_spash_visibility_over=true;
    },this.minimum_splash_visibility);

  }
  ngAfterViewInit(): void
  {
    this.search=_("#search");
    this.editPathInput=_("#editable-path");
    this.arrange();
  }
  closeProgress()
  {
    this.isProgressActive=false;
  }
  toggleProgressState()
  {
    this.isProgressActive=!this.isProgressActive;
  }
  getProcessTitle(type:string)
  {
    if(type==fs.DELETE)
    {
      return "Deleting";
    }
    else if(type==fs.NEW_FOLDER)
    {
      return "Creating New Folder";
    }
    else if(type==fs.NEW_FILE)
    {
      return "Creating New File";
    }
    else if(type==fs.RENAME)
    {
      return "Renaming";
    }
    else if(type==fs.CUT_PASTE)
    {
      return "Moving";
    }
    else if(type==fs.COPY_PASTE)
    {
      return "Copying";
    }
    return "In progress";
  }
  setUpSocket()
  {
    socket.startBackgroundProcess=(type:fs,data:any,progressIndefinite:boolean=true)=>{
      let process={
        process_id:this.process_id,
        type,
        data,
        progressIndefinite, // progress calculatable 0 to 100 - false, unknown amount of time - true
        progress:0,
        status:"in-progress"
      };
      socket.send(JSON.stringify(process));
      this.background_processes[this.process_id]=process;
      return this.process_id++;
    };
    socket.onopen=(event:any)=>{
      //connected
      isSocketOpen=true;
      socket.send(JSON.stringify({
        type:"settings",
        data:{
          ///// settings_config:"etc."
        }
      }));
    };

    socket.onmessage=(event:any)=>{
      try
      {
        let data=JSON.parse(event.data);
        if(data.type=="progress") {
          this.background_processes[data.process_id].progress=data.progress;
        }
        else if(data.type=="completed") {
          this.background_processes[data.process_id].status="completed";
          if(data.reload) {
            this.loadDirContents(this.getCWD());
          }
          this.toast("success",data.message);
        }
        else if(data.type=="failed") {
          console.error(data)
          this.background_processes[data.process_id].status="failed";
          this.toast("error",data.message);
        }
        else if(data.type=="partial-success") {
          this.background_processes[data.process_id].status="failed"; // partial is also fail
          if(data.reload) {
            this.loadDirContents(this.getCWD());
          }
          this.toast("warning",data.message);
        }
        else if(data.type=="settings") {
          // loaded settings configured in server
          this.isWin=data.data.isWin;
          this.finished_setting_up_socket=true;
        }
      }
      catch(error)
      {
        console.error(error.message);
        console.warn(event.data);
      }
    }

    socket.onclose=()=>{
      socket={
        // socket is cleared and function returns null;
        startBackgroundProcess:(a:any={},b:any={},c:any={})=>null
      };
      isSocketOpen=false;
    }
  }
  openDir(data:any)
  {
    if(data.readable)
    {
      this.loadDirContents(this.getCWD(data.folder));
    }
    else
    {
      this.toast("error",`Directory "${data.folder}" is not accessible`);
    }
  }
  moveToDir(event:any)
  {
    let index=event.currentTarget.getAttribute("data-index");
    let temp=this.path.slice(0,index).join("/") || "/";
    temp=this.normalize_path(temp);
    this.loadDirContents(temp);
  }
  goBackOneDir()
  {
    if(this.path.length<1)
    {
      return;
    }
    let path=[...this.path];
    path.pop();
    this.loadDirContents(path.join("/") || "/");
  }
  refresh()
  {
    this.loadDirContents(this.getCWD());
  }
  normalize_path(path:string):string
  {
    return path.replace("://",":").replace(":/",":").replace(":","://"); // if collon(:) is present then it should be ://
  }
  getCWD(extra_path:string="")
  {
    let temp=`${this.path.join("/")}/`;
    temp=temp!="/"?temp:"";
    temp=temp.includes(":")?temp:(temp.startsWith("/")?temp:(this.isWin?temp:`/${temp}`)); // adds slash in front if linux path (identified by colon : (only present in windows, but not present in root path of windows))
    temp =`${temp}${extra_path}`;
    temp=this.normalize_path(temp);
    return temp || "/";
  }
  toast(type:string="info",message:string,delay:number=4000)
  {
    let delayOffset=800;
    let box=document.createElement("div");
    box.classList.add("toast");
    box.classList.add(`toast-${type}`);
    box.innerHTML=message;
    _(".toast-container")?.appendChild(box);
    setTimeout(()=>{
      box.classList.add("toast-fade");
    },delay);
    setTimeout(()=>{
      box?.parentNode?.removeChild(box);
    },delay+delayOffset);
  }
  loadDirContents(path:string,fromSplash:boolean=false)
  {
    if(this.loading) {
      this.toast("warning","Please wait while loading is completed.");
      return;
    }
    this.loading=true;
    this.contents=[];
    let protocol,body;
    if(this.current_server==null) {
      protocol="local";
      body=JSON.stringify({ path });
    }
    else {
      protocol="ssh";
      body=JSON.stringify({ server_id: this.current_server, path });
    }
    fetch(`${domain}/fs/${protocol}/dir-contents/`,{
      method:"POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body
    }).then(resp=>{
      if(resp.status===200) {
        return resp.json();
      }
      throw new Error("status error");
    }).then(data=>{
      // console.log(data);
      if(data.status)
      {
        this.isDriveListing=data.type=="drive";
        this.path=this.parsePath(data.path);
        this.contents=data.contents.map((item:any)=>{
          item.selected=false;// file selected (for cut/copy etc) status
          item.isDrive=this.isDriveListing;
          return item;
        });
        this.noItems=this.contents.length<1;
        this.error_loading="";
        this.arrange();// sort
      }
      else
      {
        console.log(`%c${data.message}`,"color:#FC0");
        console.log(`%c${data.error_log}`,"color:#F00");
        if(data.customError)
        {
          throw {
            name:"customError",
            message:data.message
          };
        }
        throw new Error("Some Error occured");
      }
    }).catch(err=>{
      console.log(err.message);
      let err_msg=err.name==="customError"?err.message:"Something went wrong";
      this.toast("error",err_msg);
      this.error_loading=err_msg;
      this.path=this.parsePath("/");
      this.contents=[];
      this.noItems=true;
    }).finally(()=>{
      this.loading=false;
      this.editingPath=false;
      if(fromSplash)
      {
        this.finished_loaded_init_contents=true;
      }
    });
  }
  switchTheme()
  {
    let body=document.body;
    this.theme=body.getAttribute("data-theme")=="dark"?"light":"dark";
    body.setAttribute("data-theme",this.theme);
    localStorage.setItem("theme",this.theme);
  }
  mouseDown(event:any)
  {
    let isRightClick=event.button===2;
    if(!(this.keyboard.ctrl || this.keyboard.shift || isRightClick))
    {
      this.clearSelection();
    }
    let {clientX:x,clientY:y}=event;
    this.drag.initY=y;
    this.drag.initX=x;
    this.setSelectDimensions(x,y,0,0);
    this.dragging=true;
  }
  mouseMoving(event:any)
  {
    if(!this.dragging)
    {
      return;
    }
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
    this.selectItemsInDragBox();
  }
  mouseUp()
  {
    this.dragging=false;
  }
  selectItemsInDragBox()
  {
    this.filesAndFolders?._results?.forEach((item:any)=>{
      // exit, already selected and ctrl is pressed
      if(this.keyboard.ctrl && item.content.selected)
      {
        return;
      }
      let i=item.getDimensions(),d:any=this.drag;
      d.right=d.left+d.width;
      d.bottom=d.top+d.height;

      let item_left_in_drag_x = i.left>d.left && i.left<d.right;
      let item_right_in_drag_x = i.right>d.left && i.right<d.right;
      let item_x_in_drag_x = item_left_in_drag_x || item_right_in_drag_x;
      let item_top_in_drag_y = i.top>d.top && i.top<d.bottom;
      let item_bottom_in_drag_y = i.bottom>d.top && i.bottom<d.bottom;
      let item_y_in_drag_y = item_top_in_drag_y || item_bottom_in_drag_y;
      let item_in_drag = item_x_in_drag_x && item_y_in_drag_y;

      let drag_left_in_item_x = d.left>i.left && d.left<i.right;
      let drag_right_in_item_x = d.right>i.left && d.right<i.right;
      let drag_x_in_item_x = drag_left_in_item_x || drag_right_in_item_x;
      let drag_top_in_item_y = d.top>i.top && d.top<i.bottom;
      let drag_bottom_in_item_y = d.bottom>i.top && d.bottom<i.bottom;
      let drag_y_in_item_y = drag_top_in_item_y || drag_bottom_in_item_y;
      let drag_in_item = drag_x_in_item_x && drag_y_in_item_y;

      let drag_x_between_item_x = drag_x_in_item_x && item_y_in_drag_y;
      let drag_y_between_item_y = drag_y_in_item_y && item_x_in_drag_x;
      let drag_between_item = drag_x_between_item_x || drag_y_between_item_y;

      let select = item_in_drag || drag_in_item || drag_between_item;

      item.setItemSelection(select);
    });
  }
  // clear file/folder selection
  clearSelection()
  {
    this.contents=this.contents.map(content=>{
      content.selected=false;
      return content;
    });
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
  updateKeyBoardState(event:any)
  {
    this.keyboard.ctrl=event.ctrlKey;
    this.keyboard.shift=event.shiftKey;
    this.keyboard.alt=event.altKey;
    this.keyboard.caps=event.getModifierState('CapsLock');
  }
  shortcut(event:any)
  {
    let key=event.keyCode;
    this.updateKeyBoardState(event);

    let ctrl=this.keyboard.ctrl;
    let shift=this.keyboard.shift;
    let alt=this.keyboard.alt;
    let caps=this.keyboard.caps;

    // console.log(key);
    if(ctrl || shift || alt)
    {
      //Control Key was also pressing
      if(ctrl)
      {
        // Select all
        if(key===65) // key: a
        {
          event.preventDefault();
          this.selectAll();
        }
        // find/search
        if(key===70) // key: f
        {
          event.preventDefault();
          _("#search")?.focus();
        }
        // invert selection
        if(key===73) // key: i
        {
          event.preventDefault();
          this.invertAllItemSelections();
        }
        // refresh
        if(key==82) // key: r
        {
          event.preventDefault();
          this.refresh()
        }
        // increase icon size
        if(key==107 || key==187) // key: +
        {
          event.preventDefault();
          this.setIconSizeIndex(this.iconSizeIndex+1);
        }
        // decrease icon size
        if(key==109 || key==189) // key: -
        {
          event.preventDefault();
          this.setIconSizeIndex(this.iconSizeIndex-1);
        }
        // reset icon size to medium
        if(key==96 || key==48)// key 0
        {
          event.preventDefault();
          this.setIconSizeIndex(this.default_icon_size_index);
        }
        // ctrl + shift + [any number]
        if(shift)
        {
          let k_start=49,k_end=54,t_n=this.iconSizes.length;
          if(key>=k_start && key<=k_end)
          {
            event.preventDefault();
            this.setIconSizeIndex((t_n-1)-((key-(k_start-t_n))%t_n));
          }
        }
      }
    }
    else if(key===114) // F3 : search
    {
      event.preventDefault();
      _("#search")?.focus();
    }
    else if(key===115) // F4 : Edit Path
    {
      this.editThePath();
    }
    else if(key===116) // F5 : Refresh
    {
      event.preventDefault();
      this.refresh()
    }
    else if(key===8) // backspace
    {
      event.preventDefault();
      this.goBackOneDir();
    }
  }
  editThePath()
  {
    this.editPathInput.value=this.path.join("/") || "/";
    this.editingPath=true;
    this.editPathInput.selectionStart=0;
    this.editPathInput.selectionEnd=this.editPathInput.value.length-1;
    _("#editable-path")?.focus();
  }
  //split url path to array of drirectory path
  parsePath(url:string):string[]
  {
    // replaces different types of slashes like ( :// , \ , / ) to one type to ( / ) before spliting
    return url?.replace(/(:\/\/|\\)/g,"/")?.split("/")?.filter(dir=>dir!="");
  }
  stopPropagation(event:any)
  {
    event?.stopPropagation();
    this.updateKeyBoardState(event);
    this.closeMenu();
  }
  // typing in search box
  searching(event:any)
  {
    event?.stopPropagation();
    this.updateKeyBoardState(event);
    this.closeMenu();

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
    let x=a.name.toLowerCase(),y=b.name.toLowerCase();//ignore case
    return x<y?-1:x>y?1:0;
  }
  //sort
  arrange()
  {
    let {key,order}=this.sort;
    if(key=="type")// sort by file/folder type
    {
      let temp_files:any[]=[],temp_folders:any[]=[];
      this.contents.forEach(content=>{
        // console.log(content);
        if(content.folder)
        {
          temp_folders.push(content);
        }
        else
        {
          temp_files.push(content);
        }
      });
      temp_files=this.alphabeticalSort(temp_files) || [];
      temp_folders=this.alphabeticalSort(temp_folders) || [];
      this.contents=[...temp_folders,...temp_files];
    }
    if(key=="name")// sort by file/folder name
    {
      this.contents=this.alphabeticalSort(this.contents) || [];
    }
    else if(key=="size")// sort by file size
    {
      // incorrect size is returned from ssh plugin
      console.error("sort by size not implemented");
      // this.contents.sort((a,b)=>a.properties.size-b.properties.size);
    }
    else if(key=="date")// sort by date
    {
      // incorrect date is returned from ssh plugin
      console.error("sort by date not implemented");
      // this.contents.sort((a,b)=>b.properties.mtime-a.properties.mtime);
    }
    if(order=="desc")// descending order
    {
      this.contents.reverse();
    }
  }
  alphabeticalSort(data:any[]=[])
  {
    let temp=[...data];
    temp.sort(this.strcmp);
    return temp;
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
  toggleEditPath()
  {
    this.editPathInput.value=this.path.join("/") || "/";
    this.editingPath=!this.editingPath;
    _("#editable-path")?.focus();
  }
  typingPath(event:any)
  {
    event?.stopPropagation();
    this.updateKeyBoardState(event);
    this.closeMenu();
    let key=event.keyCode;
    if(key===13)// enter
    {
      this.goToPath();
    }
    else if(key===27)// escape
    {
      // reset path
      this.editingPath=false;
    }
  }
  goToPath():void
  {
    this.loadDirContents(this.editPathInput.value || "/");
  }
  updateIconSize(offset:number):void
  {
    this.setIconSizeIndex(this.iconSizeIndex+offset);
  }
  selectAll():void
  {
    this.contents=this.contents.map(content=>{
      content.selected=true;
      return content;
    });
  }
  invertAllItemSelections():void
  {
    this.contents=this.contents.map(content=>{
      content.selected=!content.selected;
      return content;
    });
  }
  setIconSizeIndex(index:any):void
  {
    this.iconSizeIndex=Math.min(this.iconSizes.length-1,Math.max(0,index));
    localStorage.setItem("icon-size",this.iconSizeIndex);
  }
  shiftSelection(current:number)
  {
    let start=this.getFirstSelectedItem();
    if(start!=null)
    {
      this.selectFileFolderFromIndex(start,current);
    }
    else
    {
      this.contents[current].selected=true;
    }
  }
  selectFileFolderFromIndex(a:number,b:number)
  {
    let start=Math.min(a,b),end=Math.max(a,b);
    for(let i=0,n=this.contents.length;i<n;i++)
    {
      this.contents[i].selected=(i>=start && i<=end);
    }
  }
  getFirstSelectedItem():number|null
  {
    for(let i=0,n=this.contents.length;i<n;i++)
    {
      if(this.contents[i].selected)
      {
        return i;
      }
    }
    return null;
  }
  setConnections(connections:any[])
  {
    localStorage.setItem("connections",btoa(JSON.stringify(connections)));
  }
  getConnections():any[]
  {
    return JSON.parse(atob(localStorage.getItem("connections") ?? "") || "[]") || [];
  }
  getNumberOfSelectedItems()
  {
    let count=0;
    this.contents.forEach((item:any)=>{
      if(item.selected)
      {
        count++;
      }
    });
    return count;
  }
  deleteConnection(event:any,index:number)
  {
    event?.stopPropagation();
    this.closeMenu();
    this.showPopUp("confirm","Delete Connection",`Are you sure you want to delete the connection : "${this.connections[index].name}"?`,"delete","Delete",(data:any)=>{
      let deleting_server_id=`${this.connections[index]['user']}@${this.connections[index]['server']}`;
      this.connections=[...this.connections.slice(0,index),...this.connections.slice(index+1)];
      this.setConnections(this.connections);
      this.closePopUp();
      if(this.current_server == deleting_server_id)
      {
        this.connectToFileSystem(null);
      }
    },"Cancel",(data:any)=>{
      this.closePopUp();
    },true);
  }
  connectToFileSystem(id:any,fromSplash:boolean=false)
  {
    if(this.loading)
    {
      this.toast("warning","Please wait while loading is completed.");
      return;
    }
    if(id==null)
    {
      this.current_server=null;
      this.loadDirContents(this.INITIAL_PATH,fromSplash);
      return;
    }
    this.loading=true;
    this.contents=[];
    let connection=this.connections[id];
    this.current_server=`${connection.user}@${connection.server}`;
    fetch(`${domain}/fs/ssh/connect`,{
      method:"POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body:JSON.stringify({
        server:connection.server,
        user:connection.user,
        password:connection.password,
        force:false
      })
    }).then(resp=>{
      return resp.json();
    }).then(data=>{
      this.loading=false;
      if(data.status) {
        this.loadDirContents(this.INITIAL_PATH);
      }
      else {
        throw data; // to display data in error to view status
      }
    }).catch(error=>{
      console.error(error);
      this.loading=false;
      this.noItems=true;
      this.error_loading="Connection failed";
    })
  }
  testConnection(server:string, user:string, password:string)
  {
    let testing_connection=`${user}@${server}`;
    this.current_test_connection=testing_connection;
    this.popUp.test_connection="loading";
    fetch(`${domain}/fs/ssh/connect`,{
      method:"POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body:JSON.stringify({ server, user, password, force:true })
    }).then(resp=>{
      return resp.json();
    }).then(data=>{
      if(data.status) {
        if(data.data==this.current_test_connection) // if not it is from old request
        {
          this.popUp.test_connection="success";
        }
        // old test status, no need to update
      }
      else {
        throw new Error("Connection Failed");
      }
    }).catch(error=>{
      if(testing_connection==this.current_test_connection) // if not it is from old request
      {
        this.popUp.test_connection="failed";
      }
    });
  }
  initialPopUpState()
  {
    return {
      active: false, // visible or not
      type: "confirm", // normal popup with ok and cancel
      icon:"", // icon type
      title: "", // title
      body: "", // content
      ok: null, // ok event
      cancel: null, // cancel event
      misk: null, // additional event
      test_connection: null, // testing status
      backgroundCancellation: true // cancel event when clicked on background
    };
  }
  //
  // Example showPopUp
  //
  // this.showPopUp("confirm","Title",`Message`,"default","Ok",(data:any)=>{},"Cancel",(data:any)=>{
  //   this.closePopUp();
  // },true);
  //
  showPopUp(type:string="confirm",title:string,body:string|null,icon:string|null,ok:string|null,okHandler:any,cancel:string|null,cancelHandler:any,backgroundCancellation:boolean=true,misk:string|null=null,miskHandler:any=null)
  {
    icon=AVAILABLE_POP_UP_ICONS.includes(icon ?? "")?icon:"default";
    this.popUp={
      active: true,
      type,
      icon,
      title,
      body,
      ok: ok==null?null:{
        text: ok,
        handler: okHandler
      },
      cancel: cancel==null?null:{
        text: cancel,
        handler: cancelHandler
      },
      misk: misk==null?null:{
        text: misk,
        handler: miskHandler
      },
      test_connection: null, // testing status
      backgroundCancellation
    }
  }
  closePopUp()
  {
    this.popUp=this.initialPopUpState();
  }
  handlePopUpEvent(type:string,data:any)
  {
    this.popUp[type].handler(data);
  }
  addConnection()
  {
    this.showPopUp("connection-properties","New Connection",null,"default","Add",(data:any)=>{
      let connection:any={};
      connection.protocol="ssh";
      connection.name=data["connection-name"];
      connection.description=data["connection-description"];
      connection.server=data["connection-server"];
      connection.user=data["connection-user"];
      connection.password=data["connection-password"];
      this.connections.push(connection);
      this.setConnections(this.connections);
      this.closePopUp();
    },"Cancel",(data:any)=>{
      this.closePopUp();
    },false,"Test",(data:any)=>{
      this.testConnection(data["connection-server"], data["connection-user"], data["connection-password"]);
    });
  }
  editConnection(event:any,id:number)
  {
    event.stopPropagation();
    this.closeMenu();
    let connection=this.connections[id];
    this.popUpElement._results[0].editConnectionData={
      "connection-name":connection.name,
      "connection-description":connection.description,
      "connection-server":connection.server,
      "connection-user":connection.user,
      "connection-password":connection.password
    };
    this.showPopUp("connection-properties","Edit Connection",null,"default","Save",(data:any)=>{
      let connection:any={};
      connection.protocol="ssh";
      connection.name=data["connection-name"];
      connection.description=data["connection-description"];
      connection.server=data["connection-server"];
      connection.user=data["connection-user"];
      connection.password=data["connection-password"];
      this.connections[id]=connection;
      this.setConnections(this.connections);
      this.closePopUp();
    },"Cancel",(data:any)=>{
      this.closePopUp();
    },false,"Test",(data:any)=>{
      this.testConnection(data["connection-server"], data["connection-user"], data["connection-password"]);
    });
  }
  rightClick(event:any,fromMain:boolean=true,isFolder:boolean=false,multipleSelected:boolean=false):void
  {
    event?.preventDefault();
    let menu=_(".context-menu")?.getBoundingClientRect();
    let screen=document.body.getBoundingClientRect();
    let w=menu.width;
    let h=menu.height;
    let offsetX=screen.width-w;
    let offsetY=screen.height-h;
    let x=event.clientX;
    let y=event.clientY;
    let left=(x<offsetX)?x:x-w;
    let top=(y<offsetY)?y:y-h;
    let selectedItems=null;
    if(!fromMain) {
      selectedItems=this.contents.filter((item:any)=>item.selected);
    }
    this.contextMenu={
      visibility:"hidden",
      fromMain,
      isFolder,
      multipleSelected,
      top:top+"px",
      left:left+"px",
      x,
      y,
      selectedItems
    };
  }
  getContextMenuStyle()
  {
    return {
      visibility:this.contextMenu?.visibility ?? "hidden",
      top:this.contextMenu?.top || 0,
      left:this.contextMenu?.left || 0
    };
  }
  closeMenu()
  {
    this.contextMenu=null;
  }
  fileFolderRightClick(event:any,isFolder:boolean,index:number)
  {
    event?.preventDefault();
    event?.stopPropagation();
    this.closePopUp();
    let multipleSelected=this.getNumberOfSelectedItems()>0;
    this.contents[index].selected=true; // select currently right clicked also
    this.rightClick(event,false,isFolder,multipleSelected);
    setTimeout(this.setMenuStyle,0);
  }
  setMenuStyle()
  {
    if(this.contextMenu!=null)
    {
      let menu=_(".context-menu")?.getBoundingClientRect();
      let screen=document.body.getBoundingClientRect();
      let w=menu.width;
      let h=menu.height;
      let offsetX=screen.width-w;
      let offsetY=screen.height-h;
      let x=this.contextMenu.x;
      let y=this.contextMenu.y;
      let left=(x<offsetX)?x:x-w;
      let top=(y<offsetY)?y:y-h;
      this.contextMenu.top=top+"px";
      this.contextMenu.left=left+"px";
      this.contextMenu.visibility="visible";
    }
    return false;
  }
  newFileFolder(type:string)
  {
    let max_n=0;
    let isFolder = type=="folder";
    let pattern = isFolder?/^New Folder [0-9]+$/:/^Text Document [0-9]+\.txt$/;
    let operation = isFolder?fs.NEW_FOLDER:fs.NEW_FILE;
    this.contents.forEach((item:any)=>{
      if(isFolder==item.folder && pattern.test(item.name)) {
        max_n=Math.max(max_n,parseInt(item.name.split(" ").pop()));
      }
    });
    let status = socket.startBackgroundProcess(operation, {
      source: {
        server: this.current_server,
        baseFolder: this.getCWD(),
        files: [
          isFolder?`New Folder ${++max_n}`:`Text Document ${++max_n}.txt`
        ]
      }
    });
    if(status===null) {
      this.toast("error","Not Connected to Server, Reconnect");
    }
  }
  deleteFileFolder()
  {
    let operation = fs.DELETE;
    let list = this.contextMenu.selectedItems.map((item:any)=>{
      return {
        name:item.name,
        isFolder:item.folder
      }
    });
    this.showPopUp("confirm","Delete",`Are you sure you want to delete ${list.map((item:any)=>`"${item.name}"`).join(", ")}`,"delete","Delete",(data:any)=>{
      let status = socket.startBackgroundProcess(operation, {
        source: {
          server: this.current_server,
          baseFolder: this.getCWD(),
          files: list
        }
      });
      if(status===null) {
        this.toast("error","Not Connected to Server, Reconnect");
      }
      this.closePopUp();
    },"Cancel",(data:any)=>{
      this.closePopUp();
    },true);
  }
  hideBackgroundProcess(id:number)
  {
    delete this.background_processes[id];
  }
  isBackgroundProssessesRunning()
  {
    return this.background_processes.some((process:any)=>{
      return process.status=="in-progress";
    });
  }
  getContentContainerStyle()
  {
    let classList=[
      'contents',
      'scroller'
    ];
    if(!this.isProgressActive)
    {
      classList.push('wide');
    }
    if(this.isDriveListing)
    {
      classList.push('drive-container');
    }
    return classList.join(" ");
  }
  printSourceFiles(list:any)
  {
    if(typeof list[0] == "string") {
      return list?.join(", ");
    }
    if(typeof list[0] == "object") {
      return list?.map((item:any)=>item.name)?.join(", ");
    }
    return '';
  }
}
