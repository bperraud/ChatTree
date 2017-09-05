import { ToastOptions } from 'ng2-toastr';

export class ToastCustomOptions extends ToastOptions {
  animate    = 'flyRight';
  toastLife  = 3000;
  enableHTML = true;
}
