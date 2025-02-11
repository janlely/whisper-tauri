import React from 'react';
import './BubbleContainer.css';

type BubbleContainerProps = {
  children: React.ReactNode;
  style?: React.CSSProperties,
};

const BubbleContainer = React.forwardRef<HTMLDivElement, BubbleContainerProps>(({ children, style }: BubbleContainerProps, ref) => {
  return (
    <div ref={ref} className={`bubble-container arrow`} style={{...style, '--container-bg' : style?.backgroundColor || '#4CAF50'}}>
      <div className="bubble-content">
        {children}
      </div>
    </div>
  );
});

export default BubbleContainer;