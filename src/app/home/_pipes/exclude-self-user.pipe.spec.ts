import { ExcludeSelfUserPipe } from './exclude-self-user.pipe';

describe('ExcludeSelfUserPipe', () => {
  it('create an instance', () => {
    const pipe = new ExcludeSelfUserPipe();
    expect(pipe).toBeTruthy();
  });
});
