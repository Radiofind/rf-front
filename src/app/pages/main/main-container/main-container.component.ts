import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarMenuComponent } from '../../../features/components/sidebar-menu/sidebar-menu.component';
import { AvatarStateService } from '../../../features/services/avatar-state-service/avatar-state.service';

import type { OnDestroy, OnInit, Signal } from '@angular/core';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrl: './main-container.component.scss',
  imports: [HeaderComponent, SidebarMenuComponent, RouterOutlet],
})
export class MainContainerComponent implements OnInit, OnDestroy {
  private readonly avatarStateService: AvatarStateService = inject(AvatarStateService);

  protected readonly avatarUrl: Signal<string | null> = this.avatarStateService.avatarUrl;

  public ngOnInit(): void {
    void this.avatarStateService.loadAvatar();
  }

  public ngOnDestroy(): void {
    this.avatarStateService.clear();
  }
}
