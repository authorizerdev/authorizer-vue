'use strict';

var vue = require('vue');

var script$8 = {
	name: 'AuthorizerProvider',
};

const _hoisted_1 = /*#__PURE__*/vue.createElementVNode("h1", null, "Authorizer Provider Component", -1 /* HOISTED */);
const _hoisted_2 = [
  _hoisted_1
];

function render$8(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, _hoisted_2))
}

script$8.render = render$8;
script$8.__file = "src/components/AuthorizerProvider.vue";

var script$7 = {
	name: 'AuthorizerSignup',
};

function render$7(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer Signup Component"))
}

script$7.render = render$7;
script$7.__file = "src/components/AuthorizerSignup.vue";

var script$6 = {
	name: 'AuthorizerBasicAuthLogin',
};

function render$6(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer BasicAuthLogin Component"))
}

script$6.render = render$6;
script$6.__file = "src/components/AuthorizerBasicAuthLogin.vue";

var script$5 = {
	name: 'AuthorizerMagicLinkLogin',
};

function render$5(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer MagicLinkLogin Component"))
}

script$5.render = render$5;
script$5.__file = "src/components/AuthorizerMagicLinkLogin.vue";

var script$4 = {
	name: 'AuthorizerForgotPassword',
};

function render$4(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer ForgotPassword Component"))
}

script$4.render = render$4;
script$4.__file = "src/components/AuthorizerForgotPassword.vue";

var script$3 = {
	name: 'AuthorizerSocialLogin',
};

function render$3(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer SocialLogin Component"))
}

script$3.render = render$3;
script$3.__file = "src/components/AuthorizerSocialLogin.vue";

var script$2 = {
	name: 'AuthorizerResetPassword',
};

function render$2(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer ResetPassword Component"))
}

script$2.render = render$2;
script$2.__file = "src/components/AuthorizerResetPassword.vue";

var script$1 = {
	name: 'AuthorizerVerifyOtp',
};

function render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer VerifyOtp Component"))
}

script$1.render = render$1;
script$1.__file = "src/components/AuthorizerVerifyOtp.vue";

var script = {
	name: 'Authorizer',
};

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer Component"))
}

script.render = render;
script.__file = "src/components/Authorizer.vue";

var components = {
	AuthorizerProvider: script$8,
	AuthorizerSignup: script$7,
	AuthorizerBasicAuthLogin: script$6,
	AuthorizerMagicLinkLogin: script$5,
	AuthorizerForgotPassword: script$4,
	AuthorizerSocialLogin: script$3,
	AuthorizerResetPassword: script$2,
	AuthorizerVerifyOtp: script$1,
	Authorizer: script,
};

const plugin = {
	install(Vue) {
		for (const prop in components) {
			if (components.hasOwnProperty(prop)) {
				const component = components[prop];
				Vue.component(component.name, component);
			}
		}
	},
};

module.exports = plugin;
