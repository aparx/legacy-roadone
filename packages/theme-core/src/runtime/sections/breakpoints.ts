import {
  DynamicBreakpointName,
  dynamicBreakpoints,
  DynamicBreakpointSection,
} from '../../reference';

export type MediaLogicOperator = 'not';

export class RuntimeBreakpoints {
  constructor(readonly points: DynamicBreakpointSection) {}

  point(name: DynamicBreakpointName): number {
    return this.points[name];
  }

  gte(name: DynamicBreakpointName, op?: MediaLogicOperator): string {
    return `@media${this._gte(name, op)}`;
  }

  lte(name: DynamicBreakpointName, op?: MediaLogicOperator): string {
    return `@media${this._lte(name, op)}`;
  }

  // name and the next highest or gte or lte `name`
  only(name: DynamicBreakpointName, op?: MediaLogicOperator): string {
    const index = this._index(name);
    const next = this._next(index);
    if (next == null) return index === 0 ? this.lte(name) : this.gte(name, op);
    return `@media${this._gte(name, op)} and ${this._lte(next, op)}`;
  }

  protected _gte(name: DynamicBreakpointName, op?: MediaLogicOperator) {
    return `${this._operator(op)}(min-width: ${this.point(name)}px)`;
  }

  protected _lte(name: DynamicBreakpointName, op?: MediaLogicOperator) {
    return `${this._operator(op)}(max-width: ${this.point(name)}px)`;
  }

  protected _index(name: DynamicBreakpointName) {
    return dynamicBreakpoints.findIndex((bp) => bp === name);
  }

  protected _operator(op: MediaLogicOperator | undefined) {
    return op?.length ? ` ${op} ` : '';
  }

  protected _next(index: number): DynamicBreakpointName | null {
    if (index < 0 || index >= dynamicBreakpoints.length)
      throw new Error(`Unknown breakpoint index: ${index}`);
    if (1 + index === dynamicBreakpoints.length) return null;
    return dynamicBreakpoints[1 + index];
  }

  protected _previous(index: number): DynamicBreakpointName | null {
    if (index < 0 || index >= dynamicBreakpoints.length)
      throw new Error(`Unknown breakpoint index: ${index}`);
    return index - 1 < 0 ? null : dynamicBreakpoints[index - 1];
  }
}
