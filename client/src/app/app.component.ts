import { Component, OnInit } from '@angular/core';
// import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { AceEditorComponent } from 'ng2-ace-editor';
import 'rxjs/add/operator/map'
import 'brace';
import 'brace/theme/clouds';
import 'brace/mode/json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  myData: Array<any>;
  title = 'Drunken Master';
  content = '';
  oasUrl = 'http://localhost:9990/swagger';
  oasUpdateUrl = 'http://localhost:9990/oas'

  constructor(private http:HttpClient) {
  }

  updateOAS(oas) {
    localStorage.setItem('oas', JSON.stringify(oas, null, 2))
    this.content = JSON.stringify(oas, null, 2)
  }

  onClickSave() {
    this.http
      .put(this.oasUpdateUrl, this.content)
      .subscribe(result =>
        console.log(result)
      )
  }

  

  ngOnInit() {
    this.http.get(this.oasUrl)
      .subscribe(result =>
        this.updateOAS(result)
      )
  }
}
