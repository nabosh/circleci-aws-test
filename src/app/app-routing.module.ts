import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthurlComponent } from './authurl/authurl.component';

const routes: Routes = [
  { path: 'authurl', component: AuthurlComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
