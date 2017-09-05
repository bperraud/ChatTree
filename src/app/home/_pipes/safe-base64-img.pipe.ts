import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeBase64Img'
})
export class SafeBase64ImgPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(base64: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(base64);
  }

}
