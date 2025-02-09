import { Box, Divider, Stack, Typography } from "@mui/material";
// import AutoSizer from 'react-virtualized-auto-sizer';
import { AudioMessage, Member, Message, MessageState, MessageType, TextMessage } from "../types";
import React, { useEffect, useRef } from "react";
import MemberItem from "../components/MemberItem";
import { uniqueByProperty } from "../utils";
import { listen } from '@tauri-apps/api/event';
import * as Storage from '../storage'
import * as Net from '../net'
import { error, info } from "@tauri-apps/plugin-log";
import CropOriginalIcon from '@mui/icons-material/CropOriginal';
import Emoji from "../components/Emoji";
import InputArea from "../components/InputArea";
import { useNavigate } from 'react-router';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import MessageList, { ListRef } from "../components/MessageList.tsx";
import { AutoSizer } from 'react-virtualized'
import MemberList from "../components/MemberList.tsx";

type UpdateMessages = {
  (newMessages: Message[]): void;
  (updateFn: (pre: Message[]) => Message[]): void;
};

type UpdateMembers = {
  (newMembers: Member[]): void;
  (updateFn: (pre: Member[]) => Member[]): void;
};

export default function Rome() {

  const [members, setMembers] = React.useState<Member[]>([])
  const memberItemHeights = React.useRef<number[]>([]);
  const membersRef = React.useRef<Member[]>([]);

  const [messages, setMessages] = React.useState<Message[]>([])
  const messagesRef = React.useRef<Message[]>([]);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const navigate = useNavigate()
  const usernameRef = React.useRef<string>('')
  const [roomId, setRoomId] = React.useState<string>('')
  const roomIdRef = React.useRef<string>('')
  const [quoteMsg, setQuoteMsg] = React.useState<Message|null>(null)
  const connectExpire = React.useRef<number>(0) 
  const pingTaskRef = React.useRef<NodeJS.Timeout | null>(null)
  const msgListRef = useRef<ListRef>(null)

  useEffect(() => {

    updateMessages([{
      msgId: 123456,
      senderId: 'jnabo',
      content: { text: 'hello world this is a long message, and this is a long message, and this is a long message' },
      uuid: 123456,
      type: MessageType.TEXT,
      state: MessageState.SUCCESS,
      roomId: '好好学习',
      isSender: false,
      quote: null,
      avatar: 'https://fars.ee/4qz8.jpg',
    }, {
      msgId: 1234567,
      senderId: 'janlely',
      content: { text: 'hello world this is a long message, and this is a long message, and this is a long message' },
      uuid: 1234567,
      type: MessageType.TEXT,
      state: MessageState.SUCCESS,
      roomId: '好好学习',
      isSender: true,
      quote: null,
      avatar: 'https://fars.ee/FxFd.jpg',
    }, {
      msgId: 12345678,
      senderId: 'janlely',
      content: { thumbnail: 'https://miro.medium.com/v2/resize:fit:860/format:webp/1*VwObgwu89zLXga4my0XD9Q.png', img: 'https://miro.medium.com/v2/resize:fit:860/format:webp/1*VwObgwu89zLXga4my0XD9Q.png' },
      uuid: 12345678,
      type: MessageType.IMAGE,
      state: MessageState.SUCCESS,
      roomId: '好好学习',
      isSender: true,
      quote: null,
      avatar: 'https://fars.ee/FxFd.jpg',
    }, {
      msgId: 123456789,
      senderId: 'janlely',
      content: { audio: 'https://xxx.xxx.xxx/x/x/x/xx.mp3', duration: 10000 },
      uuid: 123456789,
      type: MessageType.AUDIO,
      state: MessageState.SUCCESS,
      roomId: '好好学习',
      isSender: true,
      quote: null,
      avatar: 'https://fars.ee/FxFd.jpg',
    }, {
      msgId: 1234567890,
      senderId: 'jnabo',
      content: { audio: 'https://xxx.xxx.xxx/x/x/x/xx.mp3', duration: 10000 },
      uuid: 1234567890,
      type: MessageType.AUDIO,
      state: MessageState.SUCCESS,
      roomId: '好好学习',
      isSender: false,
      quote: null,
      avatar: 'https://fars.ee/4qz8.jpg',
    }, {
      msgId: 1234567891,
      senderId: 'janlely',
      content: { text: 'hello world' },
      uuid: 1234567891,
      type: MessageType.TEXT,
      state: MessageState.SUCCESS,
      roomId: '好好学习',
      isSender: true,
      quote: null,
      avatar: 'https://fars.ee/FxFd.jpg',
    }, {
      msgId: 1234567892,
      senderId: 'janlely',
      content: { text: 'hello world2' },
      uuid: 1234567892,
      type: MessageType.TEXT,
      state: MessageState.SUCCESS,
      roomId: '好好学习',
      isSender: true,
      quote: null,
      avatar: 'https://fars.ee/FxFd.jpg',
    }, {
      msgId: 1234567893,
      senderId: 'janlely',
      content: { text: 'hello world3' },
      uuid: 1234567893,
      type: MessageType.TEXT,
      state: MessageState.SUCCESS,
      roomId: '好好学习',
      isSender: true,
      quote: null,
      avatar: 'https://fars.ee/FxFd.jpg',
    }, {
      msgId: 1234567894,
      senderId: 'janlely',
      content: { text: 'hello world3' },
      uuid: 1234567894,
      type: MessageType.TEXT,
      state: MessageState.SUCCESS,
      roomId: '好好学习',
      isSender: true,
      quote: null,
      avatar: 'https://fars.ee/FxFd.jpg',
    }, {
      msgId: 1234567895,
      senderId: 'janlely',
      content: { text: 'hello world3' },
      uuid: 1234567895,
      type: MessageType.TEXT,
      state: MessageState.SUCCESS,
      roomId: '好好学习',
      isSender: true,
      quote: null,
      avatar: 'https://fars.ee/FxFd.jpg',
    }, {
      msgId: 1234567896,
      senderId: 'janlely',
      content: { text: 'hello world3' },
      uuid: 1234567896,
      type: MessageType.TEXT,
      state: MessageState.SUCCESS,
      roomId: '好好学习',
      isSender: true,
      quote: null,
      avatar: 'https://fars.ee/FxFd.jpg',
    }])

    // updateMessages(
    //   [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(i => ({
    //     msgId: i,
    //     senderId: 'janlely',
    //     content: { text: `hello world${i}` },
    //     uuid: i,
    //     type: MessageType.TEXT,
    //     state: MessageState.SUCCESS,
    //     roomId: '好好学习',
    //     isSender: false,
    //     quote: null,
    //     avatar: 'https://fars.ee/FxFd.jpg',
    //   }))
    // )
    updateMembers(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(i => ({
        name: `member${i}`,
        avatar: 'https://fars.ee/FxFd.jpg',
      }))
    )
  }, [])

  //   updateMembers([{
  //     name: 'janlely',
  //     avatar: 'https://fars.ee/FxFd.jpg',
  //   }, {
  //     name: 'jnabo',
  //     avatar: 'https://fars.ee/4qz8.jpg',
  //   }, {
  //     name: 'hello',
  //     avatar: 'https://fars.ee/4qz8.jpg',
  //   }])
  // }, [])

  const updateMembers: UpdateMembers = async (input) => {
    if (typeof input === 'function') {
      membersRef.current = await addAvatar2(uniqueByProperty(input(membersRef.current), item => item.name))
    } else {
      membersRef.current = await addAvatar2(uniqueByProperty(input, item => item.name))
    }
    memberItemHeights.current = new Array(membersRef.current.length).fill(0)
    setMembers(membersRef.current)

  }
  const updateMessages: UpdateMessages = async (input)  => {
    if (typeof input === 'function') {
      messagesRef.current = await addAvatar(uniqueByProperty(input(messagesRef.current), item => item.senderId + item.msgId))
    } else {
      messagesRef.current = await addAvatar(uniqueByProperty(input, item => item.senderId + item.msgId))
    }
    setMessages(messagesRef.current)
  }

  const addAvatar2 = async (members: Member[]): Promise<Member[]> => {
    try {
      for (const mem of members) {
        if (mem.avatar && mem.avatar.startsWith('http')) {
          await Storage.setAvatar(mem.name, mem.avatar)
        }
      }
      return Promise.all(members.map(async mem => {
        mem.avatar = await Storage.getAvatar(mem.name)
        return mem 
      }))
    } catch (e) {
      error(`error: ${e}`)
      return []
    }
  }

  const addAvatar = async (messages: Message[]): Promise<Message[]> => {
    info('addAvatar called with updating messages')
    try {
      for (const msg of messages) {
        if (msg.avatar && msg.avatar.startsWith('http')) {
          await Storage.setAvatar(msg.senderId, msg.avatar)
        }
      }
      return Promise.all(messages.map(async msg => {
        msg.avatar = await Storage.getAvatar(msg.senderId)
        info(`message avatar: ${msg.avatar}`)
        return msg
      }))
    } catch (e) {
      return []
    }
  }

  const sendMessage = (msg: Message, id: number) => {
    info(`message to send: ${JSON.stringify(msg)}`)
    Net.sendMessage(msg, roomIdRef.current,
      (uuid: number) => {
        info(`uuid: ${uuid.toString()}`)
        Storage.updateUUID(id, uuid)
        .then(() => {
          info("send message success")
          updateMessages(pre => pre.map(m => (
            msg.senderId + msg.msgId === m.senderId + m.msgId ? {
              ...m, state: MessageState.SUCCESS, uuid: uuid
            } : m
          )))
        }).catch(e => {
          // Alert.alert('[index.sendMessage]',`更新uuid失败: ${JSON.stringify(e)}`)
          error(`updateUUID error: ${JSON.stringify(e)}`)
        })
      },
      () => {
        logout()
      },
      () => {
        Storage.failed(roomIdRef.current, msg.msgId).then(() => {
          info("send message failed")
          updateMessages(pre => pre.map(m => (
            msg.senderId + msg.msgId === m.senderId + m.msgId ? {
              ...m, state: MessageState.FAILED
            } : m
          )))
          
        })
      }
    )
  }

  const sendText = async (text: string) => {
    const message = {
      msgId: Date.now(),
      senderId: usernameRef.current,
      content: { text: text },
      type: MessageType.TEXT,
      uuid: Date.now(),
      state: MessageState.SENDING,
      isSender: true,
      roomId: roomIdRef.current,
      quote: quoteMsg
    }
    updateMessages(pre => [...pre,message])
    msgListRef.current?.scrollToEnd()
    // Storage.saveMessage(message).then(id => {
    //   sendMessage(message, id)
    //   setQuoteMsg(null)
    // }).catch(e => {
    //   error(`save message error: ${JSON.stringify(e)}`)
    // })
  }

  const updateRoomId = (roomId: string) => {
    roomIdRef.current = roomId
    setRoomId(roomId)
  }

  const getLocalMessages = async () => {
    try {
      const messages = await Storage.getMessages(roomIdRef.current, "before", 100)
      info(`getMessages: ${JSON.stringify(messages)}`)
      updateMessages(messages)
    } catch (e) {
      // Alert.alert('[index.getLocalMessages]',`获取本地消息失败: ${JSON.stringify(error)}`)
      error(`error: ${JSON.stringify(e)}`)
    }
  }
  const syncMessages = async () => {
    Net.syncMessages(roomIdRef.current, onMessagePulled, () => {
      logout()
    }, (e) => {
      // Alert.alert('[index.syncMessages]',`同步消息失败: ${JSON.stringify(e)}`)
      error("sync message failed: ", e)
    })
  }
  const onMessagePulled = async (msgs: Message[]) => {
    if (msgs.length === 0) {
      return
    }
    //图片，视频下载缩略图
    const newMessages = await Promise.all(msgs.map(async msg => {
      if (msg.type === MessageType.IMAGE || msg.type === MessageType.VIDEO) {
        info(`start download image file: ${(msg.content as { thumbnail: string }).thumbnail}`)
        const fileUrl = await Net.downloadFile((msg.content as { thumbnail: string }).thumbnail,
          roomIdRef.current)
        info(`download and save file to : ${fileUrl}`)
        return { ...msg, content: { ...(msg.content as object), thumbnail: fileUrl } } as Message
      }
      if (msg.type === MessageType.AUDIO) {
        info(`start download auto file: ${(msg.content as AudioMessage).audio}`)
        const fileUrl = await Net.downloadFile((msg.content as AudioMessage).audio,
          roomIdRef.current)
        info(`download and save audo to : ${fileUrl}`)
        return { ...msg, content: { ...(msg.content as AudioMessage), audio: fileUrl } } as Message
      }
      info(`not image or video or audio: ${msg.type}`)
      return msg
    }))
    await Storage.saveMessages(newMessages)
    updateMessages(pre => [...newMessages, ...pre])
    //ack
    await Net.ackMessages(roomIdRef.current, msgs[0].uuid)
    if (msgs.length >= 100) {
      syncMessages()
    }
  }

  const pingEvery15Seconds = () => {
    if (pingTaskRef.current) {
      clearInterval(pingTaskRef.current)
    }
    pingTaskRef.current = setInterval(() => {
      Net.ping()
    }, 15000)
  }

  useEffect(() => {
    Promise.all([
      Storage.getValue('username'),
      Storage.getValue('lastLoginRoom')
    ]).then(([username, lastLoginRoom]) => {
      if (!username || !lastLoginRoom) {
        logout()
        return
      }
      usernameRef.current = username!
      updateRoomId(lastLoginRoom)
      //显示现有消息
      getLocalMessages()
      //拉取最新消息
      syncMessages()
      //订阅消息上面的操作
      listen<{ type: string, msg: Message }>('messageOperation', (event) => {
        const {type, msg} = event.payload
        if (msg.roomId !== roomIdRef.current) {
          info('not my message')
          return
        }
        if (type === 'delete') {
          // deleteMessage(msg.uuid)
        } else if (type === 'copy' && msg.type === MessageType.TEXT) {
          writeText((msg.content as TextMessage).text)
        } else if (type === 'recall' && msg.type === MessageType.TEXT) {
          // recallMessage(msg.uuid)
        } else if (type === 'quote' && msg.type === MessageType.TEXT) {
          // quoteMessage(msg)
        }
      })

      info(`connect to room: ${roomIdRef.current}`)
      Net.connect(roomIdRef.current, () => {
        info("connected")
        connectExpire.current = Date.now() + 30000
        pingEvery15Seconds()
        syncMessages()
      }, (msg: string) => {
        if (msg === "notify") {
          syncMessages()
        } else if (msg === "pong") {
          info("pong")
          connectExpire.current = Date.now() + 30000
        } else if (msg.startsWith('recall')) {
          // handleOthersRecall(parseInt(msg.substring(7)))
        }
      }, () => {
        logout()
      })
    }).catch(e => {
      error(`useEffect error: ${JSON.stringify(e)}`)
      logout()
    })
  }, [])

  const logout = () => {
    navigate('/login')
  }

  return (
    <Stack direction='row' sx={{ height: '100vh', width: '100vw', border: '1px solid lightgray' }}>
      <Box sx={{ flex: 0.4, backgroundColor: 'white' }}>
        <AutoSizer>
          {({ height, width }) => (
            <MemberList
              members={members}
              height={height}
              width={width}
            />
          )}
        </AutoSizer>
      </Box>
      <Divider orientation="vertical" />
      <Stack sx={{ flex: 1 }}>
        <Box sx={{ flex: 0.1, backgroundColor: 'white', justifyContent: 'space-between' }}>
          <Typography variant="h5">{roomIdRef.current}</Typography>
        </Box>
        <Divider />
        <Box sx={{ flex: 1 }}>
          <AutoSizer>
            {({ height, width }) => (
              <MessageList
                ref={msgListRef}
                messages={messages}
                height={height}
                width={width}
              />
            )}
          </AutoSizer>
        </Box>
        <Divider />
        <Stack direction='row' spacing={1} sx={{ flex: 0.05, paddingTop: 0.5, paddingLeft: 0.5 }}>
          <Emoji />
          <CropOriginalIcon />
        </Stack>
        <Box sx={{ flex: 0.25 }}>
          <InputArea onEnter={sendText} ref={textareaRef} />
        </Box>
      </Stack>
    </Stack>
  )
}