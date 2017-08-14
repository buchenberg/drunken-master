import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Http } from '@angular/http';
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
  myData: Array<any>;
  title = 'Drunken Master';
  content = JSON.stringify(this.myData);
  // constructor(private http:Http) {
  //   this.http.get('https://jsonplaceholder.typicode.com/photos')
  //     .map(response => response.json())
  //     .subscribe(res => this.myData = res);

  // }
}
