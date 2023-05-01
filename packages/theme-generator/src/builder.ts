import { merge } from 'lodash';
import type { ReferenceSection, SystemSection, Theme } from 'theme-core';
import type { DeepPartial, Required } from 'utility-types';

export type BuilderMergeInput<TThis, THold> =
  | DeepPartial<THold>
  | ((this: TThis) => DeepPartial<THold>);

export type SectionBuilderParent<
  TData,
  TParentData = never
> = TData extends Theme
  ? undefined
  : TParentData extends Theme
  ? ThemeBuilder
  : TParentData extends undefined
  ? undefined
  : SectionBuilder<TParentData>;

// prettier-ignore
export type SectionBuilderRoot<TThisData> =
  TThisData extends Theme ? undefined : ThemeBuilder;

// prettier-ignore
export type SectionDependency<TData, TParentData = any>
  = SectionBuilder<TData, TParentData, any>;

export type SectionDependencyArray<
  TDependencies extends readonly SectionDependency<any>[]
> = TDependencies extends [] ? undefined | null | [] : TDependencies;

export type ThemeGeneratorInput = DeepPartial<Omit<Theme, 'ref'>> &
  Pick<Theme, 'ref'>;

export type SectionDataMergePriority = 'fresh' | 'present';

export interface SectionBuilder<
  TData,
  TParentData = never,
  TDependencies extends readonly SectionDependency<any>[] = []
> {
  update(data: TData): Promise<this>;
  assign(bulkData: Partial<TData>): Promise<this>;
  merge(
    input: BuilderMergeInput<this, TData>,
    priority?: SectionDataMergePriority
  ): Promise<this>;
  current(): DeepPartial<TData>;
  /** Finds and returns the root section [O(1) or O(n)] */
  root(): SectionBuilderRoot<TData>;
  get parent(): SectionBuilderParent<TData, TParentData>;
  get dependencies(): SectionDependencyArray<TDependencies>;

  /** Unsafe operation that expects the underlying data to be built on call. */
  build(): TData;
  generate(): Promise<this>;
}

export interface ThemeBuilder extends SectionBuilder<Theme> {
  input(): ThemeGeneratorInput;
  /** Might return a more up-to-date version of `input`. */
  reference(): ReferenceSection;
  system(): DeepPartial<SystemSection>;
  build(): Theme;
}

export abstract class SectionGenerator<
  TData extends {},
  TParentData = never,
  TDependencies extends readonly SectionDependency<any>[] = []
> implements SectionBuilder<TData, TParentData, TDependencies>
{
  private readonly _root: SectionBuilderRoot<TData>;

  public constructor(
    private readonly _parent: SectionBuilderParent<TData, TParentData>,
    private readonly _dependencies: SectionDependencyArray<TDependencies>,
    private _data: DeepPartial<TData> = {} as any
  ) {
    let p: undefined | SectionBuilder<any, any, any>;
    let lead: typeof p;
    for (p = this; (p = p?.parent) != null; lead = p);
    this._root = lead as SectionBuilderRoot<TData>;
  }

  abstract generate(): Promise<this>;

  async update(data: TData): Promise<this> {
    this._data = data as DeepPartial<TData>;
    return this;
  }

  get parent(): SectionBuilderParent<TData, TParentData> {
    return this._parent;
  }

  get dependencies(): SectionDependencyArray<TDependencies> {
    return this._dependencies;
  }

  async assign(bulkData: Partial<TData>): Promise<this> {
    this._data = Object.assign(this._data, bulkData);
    return this;
  }

  current(): DeepPartial<TData> {
    return this._data;
  }

  build(): TData {
    return this._data as TData;
  }

  async merge(
    input: BuilderMergeInput<this, TData>,
    priority: SectionDataMergePriority = 'fresh'
  ): Promise<this> {
    if (typeof input === 'function') input = input.call(this);
    if (priority === 'fresh') this._data = merge(this._data, input);
    else this._data = merge(Object.assign({}, input), this._data);
    return this;
  }

  root(): SectionBuilderRoot<TData> {
    return this._root;
  }
}
