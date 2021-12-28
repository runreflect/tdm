export abstract class Executor<T> {
  abstract create(model: T): void
  abstract readAll(): Promise<T[]>
  abstract update(model: T): void
  abstract delete(model: T): void
}
