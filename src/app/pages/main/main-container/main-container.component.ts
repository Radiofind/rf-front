import { Component } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarMenuComponent } from '../sidebar-menu/sidebar-menu.component';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrl: './main-container.component.scss',
  imports: [HeaderComponent, SidebarMenuComponent],
})
export class MainContainerComponent {}
