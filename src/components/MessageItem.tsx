import { Avatar, Paper, Stack, styled } from "@mui/material"
import { AudioMessage, ImageMessage, Message, MessageType, TextMessage } from "../types"
import { CSSProperties, useRef } from "react"
import { convertFileSrc } from "@tauri-apps/api/core"
import AudioAnimatedIcon from "./AudioAnimationIcon"
import React from "react"
import { preventWheel } from "../App"

export type MessageItemProps = {
  message: Message,
  style: any,
  onLoad: () => void
  index: number,
  popUpOperator: (rect: DOMRect, msg: Message) => void
}


export default React.forwardRef<HTMLDivElement, MessageItemProps>(({ message, style, onLoad, index, popUpOperator }, ref) => {

  // info(`message avatar: ${message.avatar}`)
  const contentRef = useRef<HTMLDivElement>(null)

  const onRightClick = () => {
    popUpOperator(contentRef.current!.getBoundingClientRect(), message)
    preventWheel()
  }
  
  return (
    <div ref={ref} style={style} onLoad={onLoad}>
      <Stack direction={message.isSender ? 'row-reverse' : 'row'} padding={1} spacing={2}>
        <div />
        <Avatar src={convertFileSrc(message.avatar!)} sx={{ alignSelf: 'center' }} />
        <Content ref={contentRef} msg={message} onRightClick={onRightClick}/>
      </Stack>
    </div>
  )
})


const TextPaper = styled(Paper)(({ theme }) => ({
  // maxWidth: '40%',
  padding: theme.spacing(2),
  ...theme.typography.body2,
  textAlign: 'center',
  whiteSpace: 'pre-wrap',
}));

type ContentProps = {
  msg: Message,
  onRightClick: () => void
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(
  ({msg, onRightClick}, ref) => {
    
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
  
  let content;
  switch (msg.type) {
    case MessageType.TEXT:
      content = (<TextPaper>{(msg.content as TextMessage).text}</TextPaper>)
      break;
    case MessageType.IMAGE:
      content = (
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
      break;
    case MessageType.AUDIO:
      content = (
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
      break;
    default:
      content = (<p>not supported</p>)
  }

  return (
    <div ref={ref} style={{maxWidth: '40%'}} onContextMenu={onRightClick}>
      {content}
    </div>
  )
  } 
)

