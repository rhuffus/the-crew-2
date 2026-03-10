export abstract class Entity<TId> {
  constructor(public readonly id: TId) {}

  equals(other: Entity<TId>): boolean {
    if (other === null || other === undefined) return false
    if (this === other) return true
    return this.id === other.id
  }
}
