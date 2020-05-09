import {defineComponent, getCurrentInstance, inject, nextTick, onBeforeUnmount, onMounted, ref, RendererNode} from 'vue';
import {ConfigConsumerProps, IConfigProvider} from '../config-provider';
import TransitionEvents from './css-animation/Event';
import raf from './raf';

let styleForPesudo;

// Where el is the DOM element you'd like to test for visibility
function isHidden(element) {
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  return !element || element.offsetParent === null;
}

function isNotGrey(color) {
  // eslint-disable-next-line no-useless-escape
  const match = (color || '').match(/rgba?\((\d*), (\d*), (\d*)(, [\.\d]*)?\)/);
  if (match && match[1] && match[2] && match[3]) {
    return !(match[1] === match[2] && match[2] === match[3]);
  }
  return true;
}

export default defineComponent({
  name: 'Wave',
  props: ['insertExtraNode'],
  setup(props, ctx) {
    const componentInstance = getCurrentInstance();
    const configProvider: IConfigProvider = inject('configProvider') || ConfigConsumerProps;
    const csp = ref(configProvider.csp);
    const instance = ref(null);
    const clickWaveTimeoutId = ref(null);
    const animationStart = ref(false);
    const destroy = ref(false);
    onMounted(() => {
      nextTick(() => {
        const node = componentInstance.vnode.el;
        if (node.nodeType !== 1) {
          return;
        }
        instance.value = bindAnimationEvent(node);
      });
    });
    onBeforeUnmount(() => {
      if (instance.value) {
        instance.value.cancel();
      }
      if (clickWaveTimeoutId.value) {
        clearTimeout(clickWaveTimeoutId.value);
      }
      destroy.value = true;
    });
    const extraNode = ref(document.createElement('div'));

    const onClick = (node, waveColor) => {
      if (!node || isHidden(node) || node.className.indexOf('-leave') >= 0) {
        return;
      }
      const {insertExtraNode} = props;
      extraNode.value.className = 'ant-click-animating-node';
      const attributeName = getAttributeName();
      node.removeAttribute(attributeName);
      node.setAttribute(attributeName, 'true');
      // Not white or transparnt or grey
      styleForPesudo = styleForPesudo || document.createElement('style');
      if (
          waveColor &&
          waveColor !== '#ffffff' &&
          waveColor !== 'rgb(255, 255, 255)' &&
          isNotGrey(waveColor) &&
          !/rgba\(\d*, \d*, \d*, 0\)/.test(waveColor) && // any transparent rgba color
          waveColor !== 'transparent'
      ) {
        // Add nonce if CSP exist
        if (csp.value && csp.value.nonce) {
          styleForPesudo.nonce = csp.value.nonce;
        }
        extraNode.value.style.borderColor = waveColor;
        styleForPesudo.innerHTML = `
        [ant-click-animating-without-extra-node='true']::after, .ant-click-animating-node {
          --antd-wave-shadow-color: ${waveColor};
        }`;
        if (!document.body.contains(styleForPesudo)) {
          document.body.appendChild(styleForPesudo);
        }
      }
      if (insertExtraNode) {
        node.appendChild(extraNode.value);
      }
      TransitionEvents.addStartEventListener(node, onTransitionStart);
      TransitionEvents.addEndEventListener(node, onTransitionEnd);
    };
    const onTransitionStart = (e) => {
      if (destroy.value) {
        return;
      }

      const node = componentInstance.vnode.el;
      if (!e || e.target !== node) {
        return;
      }

      if (!animationStart) {
        resetEffect(node);
      }
    };
    const onTransitionEnd = (e) => {
      if (!e || e.animationName !== 'fadeEffect') {
        return;
      }
      resetEffect(e.target);
    };
    const getAttributeName = () => {
      const {insertExtraNode} = props;
      return insertExtraNode ? 'ant-click-animating' : 'ant-click-animating-without-extra-node';
    };
    const animationStartId = ref(null);
    const bindAnimationEvent = (node) => {
      if (
          !node ||
          !node.getAttribute ||
          node.getAttribute('disabled') ||
          node.className.indexOf('disabled') >= 0
      ) {
        return;
      }
      const clickEventHandler = e => {
        // Fix radio button click twice
        console.log(e);
        if (e.target.tagName === 'INPUT' || isHidden(e.target)) {
          return;
        }
        resetEffect(node);
        // Get wave color from target
        const waveColor =
            getComputedStyle(node).getPropertyValue('border-top-color') || // Firefox Compatible
            getComputedStyle(node).getPropertyValue('border-color') ||
            getComputedStyle(node).getPropertyValue('background-color');
        clickWaveTimeoutId.value = window.setTimeout(() => onClick(node, waveColor), 0);
        raf.cancel(animationStartId.value);
        animationStart.value = true;

        // Render to trigger transition event cost 3 frames. Let's delay 10 frames to reset this.
        animationStartId.value = raf(() => {
          animationStart.value = false;
        }, 10);
      };
      node.addEventListener('click', clickEventHandler, true);
      return {
        cancel: () => {
          node.removeEventListener('click', clickEventHandler, true);
        }
      };
    };

    const resetEffect = (node) => {
      if (!node || node === extraNode.value || !(node instanceof Element)) {
        return;
      }
      const {insertExtraNode} = props;
      const attributeName = getAttributeName();
      node.setAttribute(attributeName, 'false'); // edge has bug on `removeAttribute` #14466
      if (styleForPesudo) {
        styleForPesudo.innerHTML = '';
      }
      if (insertExtraNode && extraNode.value && node.contains(extraNode.value)) {
        node.removeChild(extraNode.value);
      }
      TransitionEvents.removeStartEventListener(node, onTransitionStart);
      TransitionEvents.removeEndEventListener(node, onTransitionEnd);
    };
    return {configProvider, onClick, csp};
  },
  render() {
    if (this.configProvider.csp) {
      this.csp = this.configProvider.csp;
    }
    return this.$slots.default && this.$slots.default()[0];
  }
});
