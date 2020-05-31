import DraggableResizable from '@/libs/draggable-resizable/index.vue';
import {reactive} from 'vue';

export const columns = [
  {
    title: 'Date',
    dataIndex: 'date',
    width: 200
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    width: 100
  },
  {
    title: 'Type',
    dataIndex: 'type',
    width: 100
  },
  {
    title: 'Note',
    dataIndex: 'note',
    width: 100
  },
  {
    title: 'Action',
    key: 'action',
    scopedSlots: {customRender: 'action'}
  }
];
const draggingMap = {};

columns.forEach(col => {
  draggingMap[col.key] = col.width;
});
const draggingState = reactive(draggingMap);
const DraggableResizable2 = DraggableResizable as any;
export default (props, children) => {
  let thDom = null;
  const {key, ...restProps} = props;
  const col = columns.find(col => {
    const k = col.dataIndex || col.key;
    return k === key;
  });
  if (!col.width) {
    return <th {...restProps}>{children}</th>;
  }
  const onDrag = x => {
    draggingState[key] = 0;
    col.width = Math.max(x, 1);
  };

  const onDragstop = () => {
    draggingState[key] = thDom.getBoundingClientRect().width;
  };
  return (
      <th {...restProps}
          ref={(el) => thDom = el}
          width={col.width} class="resize-table-th">
        {children}
        <DraggableResizable2
            key={col.key}
            class="table-draggable-handle"
            w={10}
            x={draggingState[key] || col.width}
            z={1}
            axis="x"
            draggable={true}
            resizable={false}
            onDragging={onDrag}
            onDragstop={onDragstop}/>
      </th>
  );
};
