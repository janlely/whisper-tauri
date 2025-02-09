import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import EmojiPicker from 'emoji-picker-react';
import React from 'react';

type EmojiProps = {
  onPick: (emoji: string) => void
}

export default function Emoji({onPick}: EmojiProps) {
  const emojiRef = React.useRef<HTMLDivElement>(null);
  const [showEmoji, setShowEmoji] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });

  // 更新位置函数
  const updatePosition = React.useCallback(() => {
    if (emojiRef.current) {
      const rect = emojiRef.current.getBoundingClientRect();
      setPos({ x: rect.x, y: rect.y });
    }
  }, []);

  React.useEffect(() => {
    // 初始获取位置
    updatePosition();

    // 添加窗口 resize 监听
    window.addEventListener('resize', updatePosition);
    
    return () => {
      // 清理时移除监听
      window.removeEventListener('resize', updatePosition);
    };
  }, [updatePosition]);

  return (
    <div ref={emojiRef}>
      <SentimentSatisfiedAltIcon onClick={() => setShowEmoji(!showEmoji)} />
      {showEmoji && <TheEmojiPicker anchorPos={pos} onPick={onPick}/>}
    </div>
  );
}

type EmojiPickerProps = {
  anchorPos: { x: number; y: number };
  onPick: (emoji: string) => void;
};

function TheEmojiPicker({ anchorPos, onPick }: EmojiPickerProps) {
  const pickerRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [visible, setVisible] = React.useState(false);

  // 更新位置函数
  const updatePickerPosition = React.useCallback(() => {
    if (pickerRef.current) {
      const rect = pickerRef.current.getBoundingClientRect();
      setPosition({
        top: anchorPos.y - rect.height - 10, // 10px 间距
        left: anchorPos.x,
      });
    }
  }, [anchorPos]);

  React.useEffect(() => {
    updatePickerPosition();
    setVisible(true);

    // 添加窗口 resize 监听
    window.addEventListener('resize', updatePickerPosition);
    
    return () => {
      window.removeEventListener('resize', updatePickerPosition);
    };
  }, [updatePickerPosition]);

  return (
    <div
      ref={pickerRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        visibility: visible ? 'visible' : 'hidden',
        zIndex: 9999, // 确保在顶层
      }}
    >
      <EmojiPicker onEmojiClick={(e) => {
        onPick(e.emoji)
      }} />
    </div>
  );
}