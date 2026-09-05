import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import { NgxSonnerToaster } from "ngx-sonner";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
