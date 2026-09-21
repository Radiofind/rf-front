import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarMenuComponent } from '../../../features/components/sidebar-menu/sidebar-menu.component';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrl: './main-container.component.scss',
  imports: [HeaderComponent, SidebarMenuComponent, RouterOutlet],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class MainContainerComponent {}
