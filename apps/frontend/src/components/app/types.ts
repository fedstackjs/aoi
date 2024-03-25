import type { IApp, IAppSettings } from '@aoi-js/server'

import type { MapEntity } from '@/types/server'

export interface IAppDTO extends MapEntity<IApp> {
  capability: string
  settings: IAppSettings
}

export interface IAppSettingsDTO extends IAppSettings {}
