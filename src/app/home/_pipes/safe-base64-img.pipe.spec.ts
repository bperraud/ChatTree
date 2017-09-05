import { SafeBase64ImgPipe } from './safe-base64-img.pipe';

describe('SafeBase64ImgPipe', () => {
  it('create an instance', () => {
    const pipe = new SafeBase64ImgPipe();
    expect(pipe).toBeTruthy();
  });
});
