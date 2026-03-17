import { encodeParams } from './params-utils';

describe('encodeParams', () => {
  test('simple', () => {
    expect(encodeParams({ 1: '1' })).toBe('1=1');
  });
});
