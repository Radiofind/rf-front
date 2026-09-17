import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { LoaderComponent } from './shared/components/loader/loader.component';
import { SnackbarContainerComponent } from './shared/components/snackbar-container/snackbar-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderComponent, SnackbarContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppComponent {}
