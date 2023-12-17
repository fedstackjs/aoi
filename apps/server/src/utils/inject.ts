// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars
export interface InjectionPoint<_T> extends Symbol {}
export type InjectionPayload<T> = T extends InjectionPoint<infer U> ? U : never
export interface IContainer {
  [key: symbol]: unknown
}

export function createInjectionContainer(): IContainer {
  return Object.create(null)
}

export function defineInjectionPoint<T>(name: string): InjectionPoint<T> {
  return Symbol(name)
}

export function provide<T>(container: IContainer, point: InjectionPoint<T>, value: T): void {
  if ((point as symbol) in container)
    throw new Error(`Duplicate injection point ${point.toString()}`)
  container[point as symbol] = value
}

export function inject<T>(container: IContainer, point: InjectionPoint<T>): T {
  const value = container[point as symbol]
  if (value === undefined) throw new Error(`Missing injection point ${point.toString()}`)
  return value as T
}
