import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit
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
