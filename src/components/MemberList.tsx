import { List, CellMeasurer, CellMeasurerCache, ScrollParams } from 'react-virtualized'
import { Member, Message } from '../types';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { info } from '@tauri-apps/plugin-log';
import MemberItem from './MemberItem';

type MemeberListProps = {
  members: Member[],
  width: number,
  height: number
}

export interface MemberListRef {
}

export default forwardRef<MemberListRef, MemeberListProps>((props, ref) => {

  const localRef = useRef<List>(null)

  const cache = new CellMeasurerCache({
    defaultHeight: 80,
    fixedWidth: true
  });
  
  useEffect(() => {
    info(`member list size: ${props.members.length}`)
  }, [])

  return (
    <List
      ref={localRef}
      rowCount={props.members.length}
      height={props.height}
      width={props.width}
      deferredMeasurementCache={cache}
      rowHeight={cache.rowHeight}
      rowRenderer={(p) => (
        <CellMeasurer
          cache={cache}
          key={p.key}
          parent={p.parent}
          rowIndex={p.index}
          columnIndex={0}
        >
          {({ measure, registerChild }) => (
            <MemberItem
              ref={registerChild}
              member={props.members[p.index]}
              index={p.index}
              onLoad={measure}
              style={p.style}
            />
          )}
        </CellMeasurer>
      )}
    />
  );
});
