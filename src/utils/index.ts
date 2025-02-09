// import { EventEmitter } from 'events';

// let ee: EventEmitter | undefined

export const uniqueByProperty = (items: any[], propGetter: (_: any) => any): any[] => {
  const seen = new Set();
  return items.filter(item => {
    const propValue = propGetter(item);
    if (seen.has(propValue)) {
      return false;
    } else {
      seen.add(propValue);
      return true;
    }
  });
}

// export const getEventEmitter = () => {
//   if (!ee) {
//     ee = new EventEmitter()
//   }
//   return ee
// }
