import getArrayWithoutDuplicates from './getArrayWithoutDuplicates';

describe('getArrayWithoutDuplicates', () => {
  it('should return an array without duplicates', () => {
    const input = [5, 'a', 9, 'b', 'a', 5];

    const output = getArrayWithoutDuplicates(input);

    expect(output).toEqual([5, 'a', 9, 'b']);
  });
});
