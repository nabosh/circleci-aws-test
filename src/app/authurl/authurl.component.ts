import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-authurl',
  templateUrl: './authurl.component.html',
  styleUrls: ['./authurl.component.css']
})
export class AuthurlComponent  implements OnInit, OnDestroy {
  constructor() {}

  ngOnInit() {
    document.body.style.backgroundColor = 'black';
  }

  ngOnDestroy() {
    document.body.style.backgroundColor = '';
  }
}