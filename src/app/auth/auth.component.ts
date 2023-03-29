import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent  implements OnInit, OnDestroy {
  constructor() {}

  ngOnInit() {
    document.body.style.backgroundColor = 'black';
  }

  ngOnDestroy() {
    document.body.style.backgroundColor = '';
  }
}