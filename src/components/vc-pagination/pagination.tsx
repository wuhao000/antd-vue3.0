import {KeyName} from '@/components/_util/keycode';
import {useLocalValue} from '@/tools/value';
import {defineComponent, getCurrentInstance, nextTick, ref, watch} from 'vue';
import {getComponentFromProp} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import KEYCODE from './keycode';
import LOCALE from './locale/zh_CN';
import Options from './options';
import Pager from './pager';

// 是否是正整数
function isInteger(value) {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

function defaultItemRender(page, type, element) {
  return element;
}

function calculatePage(p, statePageSize, props) {
  let pageSize = p;
  if (typeof pageSize === 'undefined') {
    pageSize = statePageSize;
  }
  return Math.floor((props.total - 1) / pageSize) + 1;
}

export default defineComponent({
  name: 'Pagination',
  props: {
    disabled: PropTypes.bool,
    prefixCls: PropTypes.string.def('rc-pagination'),
    selectPrefixCls: PropTypes.string.def('rc-select'),
    current: PropTypes.number,
    defaultCurrent: PropTypes.number.def(1),
    total: PropTypes.number.def(0),
    pageSize: PropTypes.number,
    defaultPageSize: PropTypes.number.def(10),
    hideOnSinglePage: PropTypes.bool.def(false),
    showSizeChanger: PropTypes.bool.def(false),
    showLessItems: PropTypes.bool.def(false),
    // showSizeChange: PropTypes.func.def(noop),
    selectComponentClass: PropTypes.any,
    showPrevNextJumpers: PropTypes.bool.def(true),
    showQuickJumper: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]).def(false),
    showTitle: PropTypes.bool.def(true),
    pageSizeOptions: PropTypes.arrayOf(PropTypes.string),
    buildOptionText: PropTypes.func,
    showTotal: PropTypes.func,
    simple: PropTypes.bool,
    locale: PropTypes.object.def(LOCALE),
    itemRender: PropTypes.func.def(() => defaultItemRender),
    prevIcon: PropTypes.any,
    nextIcon: PropTypes.any,
    jumpPrevIcon: PropTypes.any,
    jumpNextIcon: PropTypes.any
  },
  setup($props, {emit}) {
    const paginationNode = ref(undefined);
    const {value: stateCurrent, setValue: setCurrent} = useLocalValue($props.defaultCurrent, 'current');
    const {value: statePageSize, setValue: setPageSize} = useLocalValue($props.defaultPageSize, 'pageSize');
    const stateCurrentInputValue = ref(stateCurrent.value);
    const getJumpPrevPage = () => {
      return Math.max(1, stateCurrent.value - ($props.showLessItems ? 3 : 5));
    };
    watch(() => stateCurrent.value, (val, oldValue) => {
      nextTick(() => {
        if (paginationNode.value) {
          const lastCurrentNode = paginationNode.value.querySelector(
              `.${$props.prefixCls}-item-${oldValue}`
          );
          if (lastCurrentNode && document.activeElement === lastCurrentNode) {
            lastCurrentNode.blur();
          }
        }
      });
    });
    watch(() => $props.total, () => {
      const newCurrent = calculatePage($props.pageSize, statePageSize.valeu, $props);
      if ($props.current !== undefined) {
        const current = Math.min($props.current, newCurrent);
        stateCurrent.value = current;
        stateCurrentInputValue.value = current;
      } else {
        let current = stateCurrent.value;
        if (current === 0 && newCurrent > 0) {
          current = 1;
        } else {
          current = Math.min(stateCurrent.value, newCurrent);
        }
        stateCurrent.value = current;
      }
    });
    watch(() => $props.current, (val) => {
      stateCurrentInputValue.value = val;
    });
    watch(() => $props.pageSize, (val) => {
      let current = stateCurrent.value;
      const newCurrent = calculatePage(val, statePageSize.value, $props);
      current = current > newCurrent ? newCurrent : current;
      if ($props.current === undefined) {
        stateCurrent.value = current;
        stateCurrentInputValue.value = current;
      }
      statePageSize.value = val;
    });
    const getJumpNextPage = () => {
      return Math.min(
          calculatePage(undefined, statePageSize.value, $props),
          stateCurrent.value + ($props.showLessItems ? 3 : 5)
      );
    };
    const instance = getCurrentInstance();
    const getItemIcon = (icon) => {
      const {prefixCls} = $props;
      return getComponentFromProp(instance, icon, $props) || (
          <a class={`${prefixCls}-item-link`}/>
      );
    };
    const getValidValue = (e) => {
      const inputValue = e.target.value;
      const allPages = calculatePage(undefined, statePageSize.value, $props);
      let value;
      if (inputValue === '') {
        value = inputValue;
      } else if (isNaN(Number(inputValue))) {
        value = stateCurrentInputValue.value;
      } else if (inputValue >= allPages) {
        value = allPages;
      } else {
        value = Number(inputValue);
      }
      return value;
    };
    const isValid = (page) => {
      return isInteger(page) && page !== stateCurrent;
    };
    const shouldDisplayQuickJumper = () => {
      const {showQuickJumper, pageSize, total} = $props;
      if (total <= pageSize) {
        return false;
      }
      return showQuickJumper;
    };
    const handleKeyDown = (event) => {
      if (event.keyCode === KEYCODE.ARROW_UP || event.keyCode === KEYCODE.ARROW_DOWN) {
        event.preventDefault();
      }
    };
    const handleKeyUp = (e) => {
      if (e.target.composing) {
        return;
      }
      const value = getValidValue(e);
      const stateCurrentInputValueV = stateCurrentInputValue.value;

      if (value !== stateCurrentInputValueV) {
        stateCurrentInputValueV.value = value;
      }

      if (e.key === KeyName.Enter) {
        handleChange(value);
      } else if (e.keyCode === KEYCODE.ARROW_UP) {
        handleChange(value - 1);
      } else if (e.keyCode === KEYCODE.ARROW_DOWN) {
        handleChange(value + 1);
      }
    };
    const changePageSize = (size) => {
      let current = stateCurrent.value;
      const preCurrent = current;
      const newCurrent = calculatePage(size, statePageSize.value, $props);
      current = current > newCurrent ? newCurrent : current;
      // fix the issue:
      // Once 'total' is 0, 'current' in 'onShowSizeChange' is 0, which is not correct.
      if (newCurrent === 0) {
        current = stateCurrent;
      }
      if (typeof size === 'number') {
        setPageSize(size);
        setCurrent(current);
        stateCurrentInputValue.value = current;
      }
      emit('update:pageSize', size);
      emit('showSizeChange', current, size);
      if (current !== preCurrent) {
        emit('change.current', current, size);
      }
    };
    const handleChange = (p) => {
      const {disabled} = $props;
      let page = p;
      if (isValid(page) && !disabled) {
        const currentPage = calculatePage(undefined, statePageSize.value, $props);
        if (page > currentPage) {
          page = currentPage;
        } else if (page < 1) {
          page = 1;
        }
        setCurrent(page);
        stateCurrentInputValue.value = page;
        // this.$emit('input', page)
        emit('change', page, statePageSize);
        emit('change.current', page, statePageSize);
        return page;
      }
      return stateCurrent;
    };
    const prev = () => {
      if (hasPrev()) {
        handleChange(stateCurrent.value - 1);
      }
    };
    const next = () => {
      if (hasNext()) {
        handleChange(stateCurrent.value + 1);
      }
    };
    const jumpPrev = () => {
      handleChange(getJumpPrevPage());
    };
    const jumpNext = () => {
      handleChange(getJumpNextPage());
    };
    const hasPrev = () => {
      return stateCurrent.value > 1;
    };
    const hasNext = () => {
      return stateCurrent.value < calculatePage(undefined, statePageSize.value, $props);
    };
    const runIfEnter = (event, callback, ...restParams) => {
      if (event.key === 'Enter' || event.charCode === 13) {
        callback(...restParams);
      }
    };
    const setPaginationNode = (el) => {
      paginationNode.value = el;
    };
    const runIfEnterPrev = (event) => {
      runIfEnter(event, prev);
    };
    const runIfEnterNext = (event) => {
      runIfEnter(event, next);
    };
    const runIfEnterJumpPrev = (event) => {
      runIfEnter(event, jumpPrev);
    };
    const runIfEnterJumpNext = (event) => {
      runIfEnter(event, jumpNext);
    };
    const handleGoTO = (event) => {
      if (event.keyCode === KEYCODE.ENTER || event.type === 'click') {
        handleChange(stateCurrentInputValue);
      }
    };


    return {
      getJumpPrevPage,
      getJumpNextPage,
      getItemIcon,
      getValidValue,
      isValid,
      shouldDisplayQuickJumper,
      handleKeyDown,
      handleKeyUp,
      changePageSize,
      handleChange,
      prev,
      next,
      jumpPrev,
      jumpNext,
      hasPrev,
      hasNext,
      runIfEnter,
      runIfEnterPrev,
      runIfEnterNext,
      runIfEnterJumpPrev,
      runIfEnterJumpNext,
      handleGoTO,
      stateCurrentInputValue,
      stateCurrent,
      statePageSize,
      setPaginationNode
    };
  },
  render(ctx) {
    const {prefixCls, disabled} = this.$props;

    // When hideOnSinglePage is true and there is only 1 page, hide the pager
    if (this.hideOnSinglePage === true && this.total <= this.statePageSize) {
      return null;
    }
    const props = this.$props;
    const locale = this.locale;

    const allPages = calculatePage(undefined, this.statePageSize, this.$props);
    const pagerList = [];
    let jumpPrev = null;
    let jumpNext = null;
    let firstPager = null;
    let lastPager = null;
    let gotoButton = null;
    const goButton = this.showQuickJumper && this.showQuickJumper.goButton;
    const pageBufferSize = this.showLessItems ? 1 : 2;
    const {stateCurrent, statePageSize} = this;
    const prevPage = stateCurrent - 1 > 0 ? stateCurrent - 1 : 0;
    const nextPage = stateCurrent + 1 < allPages ? stateCurrent + 1 : allPages;

    if (this.simple) {
      if (goButton) {
        if (typeof goButton === 'boolean') {
          gotoButton = (
              <button type="button" onClick={this.handleGoTO} onKeyup={this.handleGoTO}>
                {locale.jump_to_confirm}
              </button>
          );
        } else {
          gotoButton = (
              <span onClick={this.handleGoTO} onKeyup={this.handleGoTO}>
              {goButton}
            </span>
          );
        }
        gotoButton = (
            <li
                title={this.showTitle ? `${locale.jump_to}${this.stateCurrent}/${allPages}` : null}
                class={`${prefixCls}-simple-pager`}
            >
              {gotoButton}
            </li>
        );
      }
      const hasPrev = this.hasPrev();
      const hasNext = this.hasNext();
      return (
          <ul class={`${prefixCls} ${prefixCls}-simple`}>
            <li title={this.showTitle ? locale.prev_page : null}
                onClick={this.prev}
                tabindex={hasPrev ? 0 : null}
                onKeypress={this.runIfEnterPrev}
                class={`${hasPrev ? '' : `${prefixCls}-disabled`} ${prefixCls}-prev`}
                aria-disabled={!this.hasPrev()}>
              {ctx.itemRender(prevPage, 'prev', this.getItemIcon('prevIcon'))}
            </li>
            <li
                title={this.showTitle ? `${stateCurrent}/${allPages}` : null}
                class={`${prefixCls}-simple-pager`}
            >
              <input
                  type="text"
                  value={this.stateCurrentInputValue}
                  onKeydown={this.handleKeyDown}
                  onKeyup={this.handleKeyUp}
                  onInput={this.handleKeyUp}
                  size={3}
                  {...{
                    directives: [
                      {
                        name: 'ant-input'
                      }
                    ]
                  }}
              />
              <span class={`${prefixCls}-slash`}>／</span>
              {allPages}
            </li>
            <li
                title={this.showTitle ? locale.next_page : null}
                onClick={this.next}
                tabindex={this.hasNext ? 0 : null}
                onKeypress={this.runIfEnterNext}
                class={`${hasNext ? '' : `${prefixCls}-disabled`} ${prefixCls}-next`}
                aria-disabled={!this.hasNext()}
            >
              {ctx.itemRender(nextPage, 'next', this.getItemIcon('nextIcon'))}
            </li>
            {gotoButton}
          </ul>
      );
    }
    if (allPages <= 5 + pageBufferSize * 2) {
      const pagerProps = {
        locale,
        rootPrefixCls: prefixCls,
        showTitle: props.showTitle,
        itemRender: props.itemRender,
        onClick: this.handleChange,
        onKeypress: this.runIfEnter
      };
      if (!allPages) {
        pagerList.push(
            <Pager {...pagerProps} key="noPager" page={allPages} class={`${prefixCls}-disabled`}/>
        );
      }
      for (let i = 1; i <= allPages; i++) {
        const active = stateCurrent === i;
        pagerList.push(<Pager {...pagerProps} key={i} page={i} active={active}/>);
      }
    } else {
      const prevItemTitle = this.showLessItems ? locale.prev_3 : locale.prev_5;
      const nextItemTitle = this.showLessItems ? locale.next_3 : locale.next_5;
      if (this.showPrevNextJumpers) {
        let jumpPrevClassString = `${prefixCls}-jump-prev`;
        if (props.jumpPrevIcon) {
          jumpPrevClassString += ` ${prefixCls}-jump-prev-custom-icon`;
        }
        jumpPrev = (
            <li title={this.showTitle ? prevItemTitle : null}
                key="prev"
                onClick={this.jumpPrev}
                tabindex={0}
                onKeypress={this.runIfEnterJumpPrev}
                class={jumpPrevClassString}>
              {ctx.itemRender(this.getJumpPrevPage(), 'jump-prev', this.getItemIcon('jumpPrevIcon'))}
            </li>
        );
        let jumpNextClassString = `${prefixCls}-jump-next`;
        if (props.jumpNextIcon) {
          jumpNextClassString += ` ${prefixCls}-jump-next-custom-icon`;
        }
        jumpNext = (
            <li title={this.showTitle ? nextItemTitle : null}
                key="next"
                tabindex={0}
                onClick={this.jumpNext}
                onKeypress={this.runIfEnterJumpNext}
                class={jumpNextClassString}>
              {ctx.itemRender(this.getJumpNextPage(), 'jump-next', this.getItemIcon('jumpNextIcon'))}
            </li>
        );
      }

      lastPager = (
          <Pager
              locale={locale}
              last={true}
              rootPrefixCls={prefixCls}
              onClick={this.handleChange}
              onKeypress={this.runIfEnter}
              key={allPages}
              page={allPages}
              active={false}
              showTitle={this.showTitle}
              itemRender={ctx.itemRender}
          />
      );
      firstPager = (
          <Pager
              locale={locale}
              rootPrefixCls={prefixCls}
              onClick={this.handleChange}
              onKeypress={this.runIfEnter}
              key={1}
              page={1}
              active={false}
              showTitle={this.showTitle}
              itemRender={ctx.itemRender}
          />
      );

      let left = Math.max(1, stateCurrent - pageBufferSize);
      let right = Math.min(stateCurrent + pageBufferSize, allPages);

      if (stateCurrent - 1 <= pageBufferSize) {
        right = 1 + pageBufferSize * 2;
      }

      if (allPages - stateCurrent <= pageBufferSize) {
        left = allPages - pageBufferSize * 2;
      }

      for (let i = left; i <= right; i++) {
        const active = stateCurrent === i;
        pagerList.push(
            <Pager
                locale={locale}
                rootPrefixCls={prefixCls}
                onClick={this.handleChange}
                onKeypress={this.runIfEnter}
                key={i}
                page={i}
                active={active}
                showTitle={this.showTitle}
                itemRender={ctx.itemRender}
            />
        );
      }

      if (stateCurrent - 1 >= pageBufferSize * 2 && stateCurrent !== 1 + 2) {
        pagerList[0] = (
            <Pager
                locale={locale}
                rootPrefixCls={prefixCls}
                onClick={this.handleChange}
                onKeypress={this.runIfEnter}
                key={left}
                page={left}
                class={`${prefixCls}-item-after-jump-prev`}
                active={false}
                showTitle={this.showTitle}
                itemRender={ctx.itemRender}
            />
        );
        pagerList.unshift(jumpPrev);
      }
      if (allPages - stateCurrent >= pageBufferSize * 2 && stateCurrent !== allPages - 2) {
        pagerList[pagerList.length - 1] = (
            <Pager
                locale={locale}
                rootPrefixCls={prefixCls}
                onClick={this.handleChange}
                onKeypress={this.runIfEnter}
                key={right}
                page={right}
                class={`${prefixCls}-item-before-jump-next`}
                active={false}
                showTitle={this.showTitle}
                itemRender={ctx.itemRender}
            />
        );
        pagerList.push(jumpNext);
      }

      if (left !== 1) {
        pagerList.unshift(firstPager);
      }
      if (right !== allPages) {
        pagerList.push(lastPager);
      }
    }

    let totalText = null;

    if (this.showTotal) {
      totalText = (
          <li class={`${prefixCls}-total-text`}>
            {this.showTotal(this.total, [
              this.total === 0 ? 0 : (stateCurrent - 1) * statePageSize + 1,
              stateCurrent * statePageSize > this.total ? this.total : stateCurrent * statePageSize
            ])}
          </li>
      );
    }
    const prevDisabled = !this.hasPrev() || !allPages;
    const nextDisabled = !this.hasNext() || !allPages;
    const buildOptionText = this.buildOptionText || this.$slots.buildOptionText;
    return (
        <ul class={{[`${prefixCls}`]: true, [`${prefixCls}-disabled`]: disabled}}
            unselectable="on"
            ref={ctx.setPaginationNode}>
          {totalText}
          <li title={this.showTitle ? locale.prev_page : null}
              onClick={this.prev}
              tabindex={prevDisabled ? null : 0}
              onKeypress={this.runIfEnterPrev}
              class={`${!prevDisabled ? '' : `${prefixCls}-disabled`} ${prefixCls}-prev`}
              aria-disabled={prevDisabled}>
            {ctx.itemRender(prevPage, 'prev', this.getItemIcon('prevIcon'))}
          </li>
          {pagerList}
          <li
              title={this.showTitle ? locale.next_page : null}
              onClick={this.next}
              tabindex={nextDisabled ? null : 0}
              onKeypress={this.runIfEnterNext}
              class={`${!nextDisabled ? '' : `${prefixCls}-disabled`} ${prefixCls}-next`}
              aria-disabled={nextDisabled}>
            {ctx.itemRender(nextPage, 'next', this.getItemIcon('nextIcon'))}
          </li>
          <Options
              disabled={disabled}
              locale={locale}
              rootPrefixCls={prefixCls}
              selectComponentClass={this.selectComponentClass}
              selectPrefixCls={this.selectPrefixCls}
              changeSize={this.showSizeChanger ? this.changePageSize : null}
              current={stateCurrent}
              pageSize={statePageSize}
              pageSizeOptions={this.pageSizeOptions}
              buildOptionText={buildOptionText || null}
              quickGo={this.shouldDisplayQuickJumper() ? this.handleChange : null}
              goButton={goButton}
          />
        </ul>
    );
  }
}) as any;
