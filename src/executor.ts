export abstract class Executor<TModel> {
  abstract create(model: TModel): void
  abstract readCollection(): Promise<TModel[]>
  abstract read(model: TModel): void
  abstract update(model: TModel): void
  abstract delete(model: TModel): void
}
