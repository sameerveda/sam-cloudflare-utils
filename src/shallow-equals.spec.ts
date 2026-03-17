import { isShallowEquals } from './shallow-equals';

describe('isShallowEquals', () => {
  test('isShallowEquals', () => {
    expect(isShallowEquals(null, undefined)).toBeTruthy();
  });
});
