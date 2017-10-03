import { Component, HostBinding, OnInit, ViewContainerRef } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { Router } from '@angular/router';

import { User } from '../_models/user';
import { ToastsManager } from 'ng2-toastr';
import { fadeInRouteAnimation } from '../_animations/fade-in-out.animation';

import * as $ from 'jquery';

@Component({
  selector   : 'app-login',
  templateUrl: './login.component.html',
  styleUrls  : ['./login.component.less'],
  animations : [fadeInRouteAnimation]
})
export class LoginComponent implements OnInit {
  @HostBinding('@routeAnimation') routeAnimation = true;
  @HostBinding('style.display') display          = 'block';
  @HostBinding('style.position') position        = 'absolute';

  login_form: any;
  login_user: User;
  signup_form: any;
  signup_user: User;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastsManager,
    private vcr: ViewContainerRef
  ) {
    this.login_user  = new User;
    this.login_form  = {
      submitted           : false,
      emailChanged        : false,
      passwordChanged     : false,
      emailErrorMessage   : '',
      passwordErrorMessage: ''
    };
    this.signup_user = new User;
    this.signup_form = {
      submitted                  : false,
      emailChanged               : false,
      confirmPasswordChanged     : false,
      emailErrorMessage          : '',
      confirmPasswordErrorMessage: ''
    };
    this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    let LoginModalController = {
      tabsElementName  : ".logmod__tabs li",
      tabElementName   : ".logmod__tab",
      inputElementsName: ".logmod__form .input",
      hidePasswordName : ".hide-password",

      inputElements: null,
      tabsElement  : null,
      tabElement   : null,
      hidePassword : null,

      activeTab   : null,
      tabSelection: 0, // 0 - first, 1 - second

      findElements: function () {
        let base = this;

        base.tabsElement   = $(base.tabsElementName);
        base.tabElement    = $(base.tabElementName);
        base.inputElements = $(base.inputElementsName);
        base.hidePassword  = $(base.hidePasswordName);

        return base;
      },

      setState: function (state) {
        let base = this,
          elem = null;

        if (!state) {
          state = 0;
        }

        if (base.tabsElement) {
          elem = $(base.tabsElement[state]);
          elem.addClass("current");
          $("." + elem.attr("data-tabtar")).addClass("show");
        }

        return base;
      },

      getActiveTab: function () {
        let base = this;

        base.tabsElement.each(function (i, el) {
          if ($(el).hasClass("current")) {
            base.activeTab = $(el);
          }
        });

        return base;
      },

      addClickEvents: function () {
        let base = this;

        base.tabsElement.on("click", function (e) {
          let targetTab = $(this).attr("data-tabtar");

          e.preventDefault();
          base.activeTab.removeClass("current");
          base.activeTab = $(this);
          base.activeTab.addClass("current");

          base.tabElement.each(function (i, el) {
            let $el = $(el);
            $el.removeClass("show");
            if ($el.hasClass(targetTab)) {
              $el.addClass("show");
            }
          });
        });

        base.inputElements.find("label").on("click", function () {
          let $this  = $(this),
            $input = $this.next("input");

          $input.focus();
        });

        return base;
      },

      initialize: function () {
        let base = this;
        base.findElements().setState().getActiveTab().addClickEvents();
      }
    };

    LoginModalController.initialize();
  }

  private login(user) {
    this.auth.loginUser(user).subscribe(res => {

      // If successful
      if (res['success'] === true) {
        this.auth.setUser(res['data']['user']);

        // TODO: default must also be a possible attribute of User model
        let defaultConvId = res['data']['user'].conversations[0];
        if (defaultConvId) {
          this.router.navigate(['/conversation', defaultConvId]);
          return;
        }

        this.router.navigate(['/']);
        return;
      }

      // Error handling
      if (res['data']['type'] === 'email')
        this.login_form.emailErrorMessage = res['message'];
      else if (res['data']['type'] === 'password')
        this.login_form.passwordErrorMessage = res['message'];
      else
        throw new Error("Bad error message type");
    });
  }

  onLoginSubmit(formIsValid: boolean) {
    this.login_form.submitted = true;
    if (!formIsValid) return false;

    this.login_form.emailChanged = this.login_form.passwordChanged = false;
    this.login_form.emailErrorMessage = this.login_form.passwordErrorMessage = '';
    this.login(this.login_user);
  }

  // ---------------------------------------------------------
  // ------------------------ SIGN UP ------------------------
  // ---------------------------------------------------------

  private signup(user, signupForm) {
    this.auth.signupUser(user).subscribe(res => {

      // If successful
      if (res['success'] === true) {
        this.auth.setUser(res['data']['user']);

        // Clean form
        signupForm.resetForm();
        this.signup_form.submitted = false;

        this.showSignupSuccess();
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
        return;
      }

      // Error handling
      if (res['data']['type'] === 'email')
        this.signup_form.emailErrorMessage = res['message'];
      else if (res['data']['type'] === 'passwordConfirm')
        this.signup_form.confirmPasswordErrorMessage = res['message'];
      else
        throw new Error("Bad error message type");
    });
  }

  onSignupSubmit(formIsValid: boolean, signupForm) {
    this.signup_form.submitted = true;
    if (!formIsValid) return false;

    this.signup_form.emailChanged = this.signup_form.confirmPasswordChanged = false;
    this.signup_form.emailErrorMessage = this.signup_form.confirmPasswordErrorMessage = '';

    if (this.signup_user.password !== this.signup_user.confirmPassword) {
      this.signup_form.confirmPasswordErrorMessage = 'Le mot de passe et sa confirmation doivent être identiques';
      return false;
    }

    this.signup(this.signup_user, signupForm);
  }

  private showSignupSuccess() {
    this.toastr.custom(
      'Inscription réussie, redirection dans 3s'
    );
  }

}
