import { Message, MessageState } from "../types";
import axios, { Axios } from 'axios';
import * as Storage from '../storage';
import { exists, BaseDirectory, stat, mkdir } from '@tauri-apps/plugin-fs';
import { upload, download } from '@tauri-apps/plugin-upload';
import { error, info } from "@tauri-apps/plugin-log";
import { appDataDir, join } from "@tauri-apps/api/path";


let wsClient: WebSocket | undefined
let axiosCli: Axios | undefined
const baseUrl = 'https://talk.janlely.com';
export const disconnect = () => {
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    console.log('close socket connection')
    wsClient.close(1000, 'logout')
  }
}
export const ping = () => {
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    console.log("ping")
    wsClient.send('ping')
  }
}
export const connect = (roomId: string, onopen: () => void, onmessage: (_: string) => void, onclose: () => void) => {
  console.log(`connect to ${roomId}`)
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    return
  }
  wsClient = new WebSocket(`${baseUrl}/chat-ws?${roomId}`);

  wsClient.onopen = () => {
    console.log("WebSocket connected");
    onopen()
  };

  wsClient.onclose = (e) => {
    console.log(`WebSocket disconnected, code: ${e.code}, ${e.reason}`);
    if (e.code === 3401) {
      onclose()
    } else {
      if (e.code === 1000 && e.reason === 'logout') {
        console.log('logout')
        wsClient = undefined
        return
      }
      setTimeout(() => {
        connect(roomId, onopen, onmessage, onclose)
      }, 1000);
    }
  };

  wsClient.onmessage = (e) => {
    onmessage(e.data)
  };
}

export async function recallMessage(uuid: number, roomId: string): Promise<boolean> {
  return getAxiosCli().get("/api/chat/recall", {
    params: {
      uuid: uuid.toString()
    },
    headers: {
      "RoomId": encodeURIComponent(roomId)
    }
  }).then(res => {
    if (res.status === 200) {
      return true
    }
    return false
  }).catch(e => {
    console.log('recallMessage error: ', e)
    return false
  })
}


export function sendMessage(
  message: Message,
  roomId: string,
  onSuccess: (uuid: number) => void,
  on401: () => void,
  onerror: (error: any) => void
) {
  getAxiosCli().post("/api/chat/send", {
    messageId: message.msgId,
    type: message.type,
    data: JSON.stringify(message.content),
    quote: message.quote ? message.quote.uuid : 0
  }, {
    headers: {
      "RoomId": encodeURIComponent(roomId)
    }
  }).then(res => {
    console.log(`response status: ${res.status}`)
    if (res.status === 401) {
      on401()
      return
    }
    onSuccess(res.data.uuid)
  }).catch(e => {
    onerror(e)
  })
}


export async function ackMessages(
  roomId: string,
  uuid: number
) {
  getAxiosCli().get("/api/chat/ack", {
    params: {
      uuid: uuid.toString()
    },
    headers: {
      "RoomId": encodeURIComponent(roomId)
    }
  }).then(res => {
    console.log(`ackMessages response status: ${res.status}`)
  }).catch(e => {
    console.log("ackMessages error: ", e.message)
  })
}

export function syncMessages(
  roomId: string,
  onSuccess: (msgs: Message[]) => void,
  on401: () => void,
  onerror: (e: any) => void
) {
  getAxiosCli().get("/api/chat/pull", {
    headers: {
      "RoomId": encodeURIComponent(roomId)
    }
  }).then(async res => {
    if (res.status === 401) {
      on401()
      return
    }
    console.log(`response date: ${JSON.stringify(res.data)}`)
    const receivedMessages: {
      message: {
        messageId: number,
        type: number,
        data: string,
        sender: string
      },
      send: boolean,
      success: boolean,
      uuid: number,
      avatar: string,
      quote: number
    }[] = res.data
    console.log("receivedMessages: ", receivedMessages)
    onSuccess(await Promise.all(receivedMessages.map(async m => ({
      msgId: m.message.messageId,
      senderId: m.message.sender,
      content: JSON.parse(m.message.data),
      uuid: m.uuid,
      type: m.message.type,
      state: MessageState.SUCCESS,
      roomId: roomId,
      isSender: false,
      avatar: m.avatar,
      quote: await Storage.getMessageByUUID(m.quote) 
    }))))

  }).catch(e => {
    onerror(e)
  })
}


export function pullMessage(
  roomId: string,
  uuid: number,
  direction: "before" | "after",
  tillNoMore: boolean,
  onSuccess: (msgs: Message[]) => void,
  on401: () => void,
  onerror: (e: any) => void
) {
  console.log(`request: roomId: ${roomId}, uuid: ${uuid}, direction: ${direction}`)
  getAxiosCli().post("/api/chat/pull", {
    uuid: uuid,
    direction: direction
  }, {
    headers: {
      "RoomId": encodeURIComponent(roomId)
    }
  }).then(async res => {
    if (res.status === 401) {
      on401()
      return
    }
    console.log(`response date: ${JSON.stringify(res.data)}`)
    const receivedMessages: {
      message: {
        messageId: number,
        type: number,
        data: string,
        sender: string
      },
      send: boolean,
      success: boolean,
      uuid: number,
      quote: number
    }[] = res.data
    console.log("receivedMessages: ", receivedMessages)
    onSuccess(await Promise.all(receivedMessages.map(async m => ({
      msgId: m.message.messageId,
      senderId: m.message.sender,
      content: JSON.parse(m.message.data),
      uuid: m.uuid,
      type: m.message.type,
      state: MessageState.SUCCESS,
      roomId: roomId,
      isSender: false,
      quote: await Storage.getMessageByUUID(m.quote) 
    }))))
    if (tillNoMore && direction === "after" && receivedMessages.length > 0) {
      pullMessage(roomId, receivedMessages[receivedMessages.length - 1].uuid, "after", tillNoMore, onSuccess, on401, onerror)
    }
  }).catch(e => {
    onerror(e)
  })
}


export async function downloadFile(
  url: string,
  roomId: string,
  tag?: string
): Promise<string> {

  if (!await exists(roomId, { baseDir: BaseDirectory.AppData })) {
    await mkdir(roomId, { baseDir: BaseDirectory.AppData }) 
  }
  const metadata = await stat(roomId, { baseDir: BaseDirectory.AppData })
  if (metadata.isFile) {
    throw new Error("dir不是一个目录")
  }
  const fileName = url.split("/").pop()
  const fileUrl = tag ? `${roomId}/${tag}_${fileName}` : `${roomId}/${Date.now().toString()}_${fileName}`
  let targetLocation =  await join(await appDataDir(), fileUrl);
  info(`location to save file: ${fileUrl}`) 
  if (await exists(fileUrl, { baseDir: BaseDirectory.AppData })) {
    return targetLocation 
  }
  info(`targetLocation: ${targetLocation}`)
  await download(
    url,
    targetLocation,
    ({ progress, total }) =>
      info(`Downloaded ${progress} of ${total} bytes`) // a callback that will be called with the download progress
  ).catch(e => {
    error(`download error: ${e}`)
  });
  return targetLocation
}


export function login(roomId: string, username: string, optToken: string, onSuccess: (apiKey: string, avatar: string) => void, onerror: () => void) {
  getAxiosCli().post("/api/login", {
    username: username,
    roomId: roomId,
    token: optToken
  }).then(res => {
    if (res.status !== 200) {
      console.log("response status: ", res.status)
      onerror()
    } else {
      onSuccess(res.data.imgApiKey, res.data.avatar)
    }
  }).catch(e => {
    console.log("error: ", e.message)
    onerror()
  })
}


function getAxiosCli() {
  if (!axiosCli) {
    console.log(`API_URL: ${baseUrl}`)
    axiosCli = axios.create({
      baseURL: baseUrl,
    })
  }
  return axiosCli
}

// export async function uploadToImgBB(uri: string, uploadProgress?: (progress: number) => void): Promise<string> {
//   const imgApiKey = await Storage.getValue('imgApiKey')
//   console.log(`apiKey: `, imgApiKey)
//   const uploadTask = FileSystem.createUploadTask('https://api.imgbb.com/1/upload', uri, {
//     fieldName: 'file',
//     httpMethod: 'POST',
//     uploadType: FileSystem.FileSystemUploadType.MULTIPART,
//     parameters: {
//       "expiration": "604800",
//       "key": imgApiKey! 
//     },
//     headers: {
//       'Content-Type': 'multipart/form-data',
//       'Accept': 'application/json'
//     }
//   }, ({ totalBytesSent, totalBytesExpectedToSend }) => {
//     const progress = parseFloat((totalBytesSent / (totalBytesExpectedToSend || 1)).toFixed(2));
//     uploadProgress?.(progress)
//   });

//   return uploadTask.uploadAsync().then(res => {
//     console.log('result body: ', res?.body)
//     return JSON.parse(res!.body).data.url
//   }).catch(e => {
//     console.log('upload error: ', e)
//     throw new Error("上传失败")
//   })
// }

export async function uploadFile(fileUrl: string, uploadProgress?: (progress: number) => void): Promise<string> {
  return upload(
    'https://fars.ee',
    BaseDirectory.AppData + fileUrl,
    ({ progress, total }) => {
      console.log(`Uploaded ${progress} of ${total} bytes`) // a callback that will be called with the upload progress
      uploadProgress?.(progress)
    }
  ).then(res => {
    console.log(res)
    return res
  })
  .catch(e => {
    console.log('upload error: ', e)
    throw new Error("上传失败")
  });
}

export async function getQR(): Promise<string> {
  return getAxiosCli().get("/api/qr").then(res => {
    return res.data
  }).catch(e => { 
    throw e
  })
}

export async function checkLogin(loginId: string, onSuccess: (json: any) => void) {
  getAxiosCli().get(`/api/login/${loginId}`).then(res => {
    onSuccess(res.data)
  }).catch(e => {
    console.log("error: ", e)
  })
}