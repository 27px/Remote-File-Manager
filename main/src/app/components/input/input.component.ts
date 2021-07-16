import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-input",
  templateUrl: "./input.component.html",
  styleUrls: ["./input.component.css"]
})
export class InputComponent implements OnInit {
  error: string = "";
  error_message: string | null = null;

  @Input() type: string = "";
  @Input() label: string = "";
  @Input() placeholder: string = "";
  @Input() name: string = "";

  @Input("ngModel") value: string = "";

  constructor() {}
  ngOnInit(): void {
    // this.setError("Test Error");
  }

  getName(): string {
    return this.name;
  }
  getValue() {
    return this.value;
  }
  setValue(value: string) {
    this.value = value;
  }
  setError(message: string | null = null) {
    this.error = "error";
    if (message != null) {
      this.error_message = message;
    }
  }
  unsetError() {
    this.error = "";
    this.error_message = null;
  }
}
