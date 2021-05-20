import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})

export class InputComponent implements OnInit
{
  error:string = "";

  @Input() type:string="";
  @Input() label:string="";
  @Input() placeholder:string="";
  @Input() name:string="";

  @Input("ngModel") value:string="";

  constructor()
  {

  }
  ngOnInit(): void
  {
    // this.setError("Test Error");
  }

  getName()
  {
    return this.name;
  }
  getValue()
  {
    return this.value;
  }
  setValue(value:string)
  {
    this.value=value;
  }
  setError()
  {
    this.error="error";
  }
  unsetError()
  {
    this.error="";
  }
}
