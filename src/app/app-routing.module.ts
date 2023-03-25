import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthurlComponent } from './authurl/authurl.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'authurl', component: AuthurlComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
