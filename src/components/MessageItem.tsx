import { Avatar, Paper, Stack, styled } from "@mui/material"
import { AudioMessage, ImageMessage, Message, MessageType, TextMessage } from "../types"
import { CSSProperties, useRef } from "react"
import { info } from "@tauri-apps/plugin-log"
import { convertFileSrc } from "@tauri-apps/api/core"
import AudioAnimatedIcon from "./AudioAnimationIcon"
import React from "react"

export type MessageItemProps = {
  message: Message,
  style: any,
  onLoad: () => void
  index: number,
}

const TextPaper = styled(Paper)(({ theme }) => ({
  maxWidth: '40%',
  padding: theme.spacing(2),
  ...theme.typography.body2,
  textAlign: 'center',
  whiteSpace: 'pre-wrap',
}));

export default React.forwardRef<HTMLDivElement, MessageItemProps>(({ message, style, onLoad, index }, ref) => {
  const itemRef = useRef<HTMLDivElement>(null)
  info(`message avatar: ${message.avatar}`)


  return (
    <div ref={ref} style={style} onLoad={onLoad}>
      <Stack ref={itemRef} direction={message.isSender ? 'row-reverse' : 'row'} padding={1} spacing={2}>
        <div />
        <Avatar src={convertFileSrc(message.avatar!)} sx={{ alignSelf: 'center' }} />
        <Content msg={message} />
      </Stack>
    </div>
  )
})

function Content({msg}: {msg: Message}) {
  const [playing, setPlaying] = React.useState(false)
  const styles = {
    audioContainer: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: '8px 12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'transform 0.1s',
      '&:active': {
        transform: 'scale(0.98)'
      }
    },
    durationText: {
      margin: '0 10px',
      fontSize: 14,
      color: '#333333'
    }
  };
  const containerStyle: CSSProperties = {
    ...styles.audioContainer,
    justifyContent: msg.isSender ? 'flex-end' : 'flex-start',
    flexDirection: msg.isSender ? 'row-reverse' : 'row'
  };
  switch (msg.type) {
    case MessageType.TEXT:
      return (<TextPaper>{(msg.content as TextMessage).text}</TextPaper>)
    case MessageType.IMAGE:
      return (
        <div style={{ width: '100px' }}>
          {/* 设置固定宽度，保持原图片的长宽比 */}
          <img
            src={(msg.content as ImageMessage).thumbnail}
            style={{
              width: '100%', // 设置图片宽度为容器的100%
              height: 'auto', // 让浏览器自动计算高度
              objectFit: 'contain', // 确保图片按比例填充容器
            }}
          />
        </div>
      )
    case MessageType.AUDIO:
      return (
        <div
          onClick={() => setPlaying(!playing)}
          role="button"
          tabIndex={0}
          style={containerStyle}
        >
          <span style={styles.durationText}>
            {Math.round((msg.content as AudioMessage).duration / 1000)}s
          </span>
          <AudioAnimatedIcon
            size={24}
            playing={playing}
            rotate={msg.isSender ? 180 : 0}
          />
        </div>
      )
    default:
      return null
  }
}