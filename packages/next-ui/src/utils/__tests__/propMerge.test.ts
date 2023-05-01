import {
  flatStyleClasses,
  joinStyleClasses,
  propMerge,
  styleClassMerge,
} from '../merge';

// Note: what about function "merges"?

describe('propMerge override', () => {
  test('Two object top override', () => {
    expect(propMerge({ foo: 'a' }, { foo: 'b' })).toEqual({ foo: 'b' });
    expect(propMerge({ foo: 'a' }, { foo: undefined })).toEqual({ foo: 'a' });
    expect(propMerge({ foo: undefined }, { foo: 'a' })).toEqual({ foo: 'a' });
    expect(propMerge({ foo: 'a' }, {})).toEqual({ foo: 'a' });
    expect(propMerge({}, { foo: 'a' })).toEqual({ foo: 'a' });
    expect(propMerge({}, {})).toEqual({});
  });

  test('Two object deep (I) override', () => {
    expect(propMerge({ foo: { bar: 'a' }, baz: 'a' }, {})).toEqual({
      foo: { bar: 'a' },
      baz: 'a',
    });
    expect(
      propMerge({ foo: { bar: 'a' }, baz: 'a' }, { foo: { bar: 'b' } })
    ).toEqual({
      foo: { bar: 'b' },
      baz: 'a',
    });
    expect(propMerge({ foo: {} }, { foo: { bar: 'b' } })).toEqual({
      foo: { bar: 'b' },
    });
    expect(propMerge({ foo: { bar: 'a' } }, { foo: {} })).toEqual({
      foo: { bar: 'a' },
    });
    expect(
      propMerge({ foo: { bar: 'a', baz: 'b' } }, { foo: { bar: 'c' } })
    ).toEqual({
      foo: { bar: 'c', baz: 'b' },
    });
  });

  test('Two object deep (II) override', () => {
    expect(propMerge({ foo: { bar: { fox: 'a', baz: 'a' } } }, {})).toEqual({
      foo: { bar: { fox: 'a', baz: 'a' } },
    });
    expect(
      propMerge(
        { foo: { bar: { fox: 'a', baz: 'a' } } },
        { foo: { bar: { baz: 'c' } } }
      )
    ).toEqual({
      foo: { bar: { fox: 'a', baz: 'c' } },
    });
  });
});

describe('joinStyleClasses', () => {
  test('equality sample', () => {
    expect(joinStyleClasses(['foo', 'bar', 'baz'])).toBe('foo bar baz');
    expect(joinStyleClasses(['a', 'b', 'c'])).toBe('a b c');
    expect(joinStyleClasses(['a', 'b', ' '])).toBe('a b  ');
    expect(joinStyleClasses(['a', 'b'])).toBe('a b');
    expect(joinStyleClasses(['a'])).toBe('a');
    expect(joinStyleClasses([' '])).toBe(' ');
    expect(joinStyleClasses([])).toBe('');
  });

  test('inequality sample', () => {
    expect(joinStyleClasses(['foo bar', 'baz'])).toBe('foo bar baz');
    expect(joinStyleClasses(['foo  bar', 'baz'])).toBe('foo  bar baz');
  });
});

describe('flatStyleClasses', () => {
  test('simple equality', () => {
    expect(flatStyleClasses('a', 'b', 'c')).toEqual(['a', 'b', 'c']);
    expect(flatStyleClasses('a', ['b', 'c'])).toEqual(['a', 'b', 'c']);
    expect(flatStyleClasses(['a', 'b'], 'c')).toEqual(['a', 'b', 'c']);
  });

  test('whitespace splitting', () => {
    expect(flatStyleClasses('a b', 'c')).toEqual(['a', 'b', 'c']);
    expect(flatStyleClasses('a', 'b c')).toEqual(['a', 'b', 'c']);
    expect(flatStyleClasses('a b', 'c ')).toEqual(['a', 'b', 'c']);
    // prettier-ignore
    expect(flatStyleClasses('a', ['b c', 'd e']))
      .toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  test('arbitrary', () => {
    expect(flatStyleClasses()).toEqual([]);
    expect(flatStyleClasses([], [])).toEqual([]);
    expect(flatStyleClasses([], [''])).toEqual([]);
    expect(flatStyleClasses('', 'b')).toEqual(['b']);
    expect(flatStyleClasses('a', '')).toEqual(['a']);
  });
});

describe('styleClassMerge', () => {
  test('sample data', () => {
    expect(styleClassMerge('a', ['b', 'c'])).toBe('a b c');
    expect(styleClassMerge(['a', 'b'], 'c')).toBe('a b c');
    expect(styleClassMerge(['a b'], 'c d')).toBe('a b c d');
    expect(styleClassMerge('a b', ['c d'])).toBe('a b c d');
    expect(styleClassMerge(['a b'], ['c d'])).toBe('a b c d');
  });
});
