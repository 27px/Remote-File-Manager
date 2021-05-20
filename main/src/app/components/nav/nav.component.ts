import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  @Input()
  active:string="";

  appTitle:string="File Manager";
  menuActive:boolean=false;

  constructor() { }
  ngOnInit(): void { }

  isActive(tab:string)
  {
    return tab==this.active?"active link":"link";
  }
  toggleMenu()
  {
    this.menuActive=!this.menuActive;
  }
  closeMenu()
  {
    this.menuActive=false;
  }
}
