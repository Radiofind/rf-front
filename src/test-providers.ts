import { provideZonelessChangeDetection } from '@angular/core';

import type { EnvironmentProviders, Provider } from '@angular/core';

const testProviders: (Provider | EnvironmentProviders)[] = [provideZonelessChangeDetection()];

export default testProviders;
