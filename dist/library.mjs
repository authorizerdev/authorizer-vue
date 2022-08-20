import { openBlock, createElementBlock, createElementVNode } from 'vue';

var script$1 = {
	name: 'InputText',
};

const _hoisted_1$1 = { type: "text" };

function render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("input", _hoisted_1$1))
}

script$1.render = render$1;
script$1.__file = "src/InputText.vue";

var script = {
	name: 'InputTextarea',
};

const _hoisted_1 = /*#__PURE__*/createElementVNode("h1", null, "hello world!!", -1 /* HOISTED */);
const _hoisted_2 = /*#__PURE__*/createElementVNode("textarea", null, null, -1 /* HOISTED */);
const _hoisted_3 = [
  _hoisted_1,
  _hoisted_2
];

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", null, _hoisted_3))
}

script.render = render;
script.__file = "src/InputTextarea.vue";

var components = { InputTextarea: script, InputText: script$1 };

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

export { plugin as default };
