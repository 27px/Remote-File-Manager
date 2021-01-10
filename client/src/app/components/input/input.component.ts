import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})

export class InputComponent implements OnInit {

  @Input() type:string="";
  @Input() label:string="";
  @Input() placeholder:string="";
  @Input() name:string="";

  constructor()
  {

  }
  ngOnInit(): void
  {
    // this.setError("Test Error");
  }
}
