import { mergeApplicationConfig, type ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { APP_BASE_HREF } from '@angular/common';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: APP_BASE_HREF,
      useValue: '/',
    }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
