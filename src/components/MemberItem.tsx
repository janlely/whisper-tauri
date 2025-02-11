import { Avatar, Stack, Typography } from "@mui/material"
import { Member } from "../types"
import { forwardRef, useRef } from "react"
import { convertFileSrc } from "@tauri-apps/api/core"

export type MemberItemProps = {
  member: Member,
  style: any,
  index: number,
  onLoad: () => void
}
export default forwardRef<HTMLDivElement, MemberItemProps>(({ member, style, onLoad, index }, ref) => {
  const itemRef = useRef<HTMLDivElement>(null)
  // info(`member avatar: ${member.avatar}`)

  return (
    <div ref={ref} style={style} onLoad={onLoad}>
      <Stack ref={itemRef} direction='row' spacing={2} padding={1}>
        <Avatar src={convertFileSrc(member.avatar!)} />
        <Typography alignSelf={'center'}>{member.name}</Typography>
      </Stack>
    </div>
  )
})