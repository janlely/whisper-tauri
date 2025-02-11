import { Typography } from "@mui/material"
import { useState } from "react"
import { emit } from '@tauri-apps/api/event';
import { Message } from "../types";
import { info } from "@tauri-apps/plugin-log";

type MessageOperatorProps = {
  children: React.ReactNode,
  label: string,
  msg: Message|null
}
export function MessageOperator({children, label, msg} : MessageOperatorProps) {
  const [bgOpacity, setBgOpacity] = useState(0)

  const handleClick = () => {
    info('点击操作按钮')
    if (label === '引用') {
      info(`引用消息: ${JSON.stringify(msg)}`)
      emit('messageOperation', {
        type: 'quote',
        msg: msg!
      })
    } else if (label === '删除') {
      info(`删除消息: ${JSON.stringify(msg)}`)
      emit('messageOperation', {
        type: 'delete',
        msg: msg!
      })
    }
  }
  return (
    <div
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 2px',
        backgroundColor: `rgba(255, 255, 255, ${bgOpacity})`,
      }}
      onMouseEnter={() => {
        setBgOpacity(1)
      }}
      onMouseLeave={() => {
        setBgOpacity(0)
      }}
      onClick={handleClick}
    >
      {children}
      <Typography fontSize={14} color="black">{label}</Typography>
    </div>
  )
}

export function DeleteIcon() {
  return (
    <svg width="24" height="28" viewBox="0 0 24 24" >
      <g id="SVGRepo_bgCarrier" stroke-width="0" />
      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.624" />
      <g id="SVGRepo_iconCarrier">
        <path d="M10 12V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M14 12V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M4 7H20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    </svg>
  )
}

export function QuoteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="28" fill="none">
      <g id="SVGRepo_bgCarrier" stroke-width="0" />
      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />
      <g id="SVGRepo_iconCarrier">
        <path opacity="0.4" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#292D32" />
        <path d="M8.19 16.78H9.67999C10.77 16.78 11.62 15.93 11.62 14.84V13.35C11.62 12.26 10.77 11.41 9.67999 11.41H7.77C7.85 9.59997 8.27 9.33 9.48 8.62C9.84 8.41 9.95001 7.95003 9.74001 7.59003C9.60001 7.35003 9.35 7.21997 9.09 7.21997C8.96 7.21997 8.83001 7.25001 8.71001 7.32001C6.92001 8.38001 6.25 9.07002 6.25 12.15V14.82C6.25 15.91 7.12 16.78 8.19 16.78Z" fill="#292D32" />
        <path d="M14.3209 16.78H15.8109C16.9009 16.78 17.7509 15.93 17.7509 14.84V13.35C17.7509 12.26 16.9009 11.41 15.8109 11.41H13.9008C13.9808 9.59997 14.4009 9.33 15.6109 8.62C15.9709 8.41 16.0808 7.95003 15.8708 7.59003C15.7308 7.35003 15.4809 7.21997 15.2209 7.21997C15.0909 7.21997 14.9609 7.25001 14.8409 7.32001C13.0509 8.38001 12.3809 9.07002 12.3809 12.15V14.82C12.3909 15.91 13.2609 16.78 14.3209 16.78Z" fill="#292D32" />
      </g>
    </svg>
  )
}