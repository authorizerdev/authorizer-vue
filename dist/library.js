'use strict';

var vue = require('vue');

var script$7 = {
	name: 'AuthorizerProvider',
};

const _hoisted_1 = /*#__PURE__*/vue.createElementVNode("h1", null, "Authorizer Provider Component", -1 /* HOISTED */);
const _hoisted_2 = [
  _hoisted_1
];

function render$7(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, _hoisted_2))
}

script$7.render = render$7;
script$7.__file = "src/components/AuthorizerProvider.vue";

var script$6 = {
	name: 'AuthorizerSignup',
};

function render$6(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer Signup Component"))
}

script$6.render = render$6;
script$6.__file = "src/components/AuthorizerSignup.vue";

var script$5 = {
	name: 'AuthorizerBasicAuthLogin',
};

function render$5(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer BasicAuthLogin Component"))
}

script$5.render = render$5;
script$5.__file = "src/components/AuthorizerBasicAuthLogin.vue";

var script$4 = {
	name: 'AuthorizerMagicLinkLogin',
};

function render$4(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer MagicLinkLogin Component"))
}

script$4.render = render$4;
script$4.__file = "src/components/AuthorizerMagicLinkLogin.vue";

var script$3 = {
	name: 'AuthorizerForgotPassword',
};

function render$3(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer ForgotPassword Component"))
}

script$3.render = render$3;
script$3.__file = "src/components/AuthorizerForgotPassword.vue";

var script$2 = {
	name: 'AuthorizerSocialLogin',
};

function render$2(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer SocialLogin Component"))
}

script$2.render = render$2;
script$2.__file = "src/components/AuthorizerSocialLogin.vue";

var script$1 = {
	name: 'AuthorizerResetPassword',
};

function render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer ResetPassword Component"))
}

script$1.render = render$1;
script$1.__file = "src/components/AuthorizerResetPassword.vue";

var script = {
	name: 'AuthorizerVerifyOtp',
};

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("div", null, "Authorizer VerifyOtp Component"))
}

script.render = render;
script.__file = "src/components/AuthorizerVerifyOtp.vue";

var components = {
	AuthorizerProvider: script$7,
	AuthorizerSignup: script$6,
	AuthorizerBasicAuthLogin: script$5,
	AuthorizerMagicLinkLogin: script$4,
	AuthorizerForgotPassword: script$3,
	AuthorizerSocialLogin: script$2,
	AuthorizerResetPassword: script$1,
	AuthorizerVerifyOtp: script,
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
