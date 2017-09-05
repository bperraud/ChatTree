import { Injectable } from '@angular/core';
import { ToastsManager } from 'ng2-toastr';

@Injectable()
export class ToastService {

  constructor(public toastr: ToastsManager) {}

  showSuccess(text: string) {
    this.toastr.success(text);
  }

  showCustom(text: string) {
    this.toastr.custom(text);
  }

  showError(text: string) {
    this.toastr.error(text);
  }

}
