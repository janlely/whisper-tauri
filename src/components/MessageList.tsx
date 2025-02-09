import { List, CellMeasurer, CellMeasurerCache, ScrollParams } from 'react-virtualized'
import { Message } from '../types';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import MessageItem from './MessageItem';
import { info } from '@tauri-apps/plugin-log';

type MessageListProps = {
  messages: Message[],
  width: number,
  height: number
}

export interface ListRef {
  scrollToEnd: () => void
}

export default forwardRef<ListRef, MessageListProps>((props, ref) => {

  const isAtBottom = useRef(false);
  const isAtTop = useRef(false);
  const localRef = useRef<List>(null)

  const cache = new CellMeasurerCache({
    defaultHeight: 80,
    fixedWidth: true
  });

  const handleScroll = (p: ScrollParams) => {
    //TODO: 判断是否触底或者触顶，并更新状态
    const { clientHeight, scrollHeight, scrollTop } = p;
    const threshold = 1; // 允许1像素的误差避免舍入问题

    // 是否触底：滚动位置 + 容器高度 >= 总内容高度 - 阈值
    const bottomReached = scrollTop + clientHeight >= scrollHeight - threshold;
    isAtBottom.current = bottomReached
    info(`isAtBottom: ${isAtBottom.current}`)

    // 是否触顶：滚动位置 <= 阈值
    const topReached = scrollTop <= threshold;
    isAtTop.current = topReached
    info(`isAtTop: ${isAtTop.current}`)
  }

  useImperativeHandle(ref, () => ({
    scrollToEnd: () => {
      localRef.current?.scrollToRow(props.messages.length - 1)
    }
  }));


  useEffect(() => {
    if (isAtBottom.current) {
      //TODO: 滑动到最底部
      info(`滑动到最底部`)
      localRef.current?.scrollToRow(props.messages.length - 1)
    }
  }, [props.messages])

  return (
    <List
      ref={localRef}
      rowCount={props.messages.length}
      height={props.height}
      width={props.width}
      deferredMeasurementCache={cache}
      rowHeight={cache.rowHeight}
      onScroll={handleScroll}
      rowRenderer={(p) => (
        <CellMeasurer
          cache={cache}
          key={p.key}
          parent={p.parent}
          rowIndex={p.index}
          columnIndex={0}
        >
          {({ measure, registerChild }) => (
            <MessageItem
              ref={registerChild}
              message={props.messages[p.index]}
              style={p.style}
              onLoad={measure}
              index={p.index}
            />
          )}
        </CellMeasurer>
      )}
    />
  );
});
