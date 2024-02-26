import type { UUID, Long } from 'mongodb'
import type { AccessLevel } from '@aoi-js/server'

export type MapEntity<T> = {
  [key in keyof T]: T[key] extends UUID
    ? string
    : T[key] extends Long
      ? string
      : T[key] extends AccessLevel
        ? number
        : T[key]
}
