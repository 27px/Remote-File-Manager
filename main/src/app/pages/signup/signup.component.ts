import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit
{
  @Input() error:string="";

  constructor()
  {

  }

  ngOnInit(): void
  {

  }
  setError(err: string): void
  {
    this.error=err;
  }
  unSetError(): void
  {
    this.error="";
  }
}
