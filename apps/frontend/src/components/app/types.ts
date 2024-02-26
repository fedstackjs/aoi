import type { MapEntity } from '@/types/server'
import type { IApp, IAppSettings } from '@aoi-js/server'

export interface IAppDTO extends MapEntity<IApp> {
  capability: string
  settings: IAppSettings
}

export interface IAppSettingsDTO extends IAppSettings {}
