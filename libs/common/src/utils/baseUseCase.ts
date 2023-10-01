import { ObjectLiteral, Repository } from 'typeorm';

export enum RollbackTypeEnum {
  CREATE,
  UPDATE,
}

export interface RollbackStackItem<Entity extends ObjectLiteral> {
  object: Entity;
  repository: Repository<Entity>;
  type: RollbackTypeEnum;
}

export class BaseUseCase {
  rollbackStack: RollbackStackItem<any>[] = [];

  protected async rollback(): Promise<void> {
    console.log('Executing rollback');

    for (const rollbackItem of this.rollbackStack) {
      const { object, repository, type } = rollbackItem;

      if (type == RollbackTypeEnum.CREATE && object.id) {
        console.log(`Deleting object with id ${object.id}`);
        await repository.delete(object.id);
        return;
      }

      console.log(`Updating to previous state object with id ${object.id}`);
      await repository.update(object.id, object);
    }
  }
}
