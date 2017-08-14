import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { AceEditorComponent } from 'ng2-ace-editor';
import 'brace';
import 'brace/theme/clouds';
import 'brace/mode/json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Drunken Master';
  jsonExample = { "foo": "bar" }
  content = JSON.stringify(this.jsonExample);
}
