import * as Net from '../net'
import * as Storage from '../storage'
import { useNavigate } from 'react-router';
import React from 'react';
import { Container } from '@mui/material';
import QRCode from 'react-qr-code';

export default function Login() {
  const navigator = useNavigate()
  const [qr, setQr] = React.useState('')
  const loginInterval = React.useRef<NodeJS.Timeout | null>(null)

  const checkLogin = (loginId: string) => {  
    Net.checkLogin(loginId, async (json: any) => {
      if (loginInterval.current) {
        clearInterval(loginInterval.current)
      }
      await Storage.setValue('username', json.username)
      await Storage.setValue('imgApiKey', json.imgApiKey)
      await Storage.setValue('lastLoginRoom', json.roomId)
      await Storage.setAvatar(json.username, json.avatar)
      navigator('/')
    })
  }

  React.useEffect(() => {
    Net.getQR().then(qr => {
      setQr(qr)
      let loginId = new URL(qr).search
      loginInterval.current = setInterval(() => {
        checkLogin(loginId)
      }, 1000)
    }).catch(e => {
      console.log("error: ", e)
    })
  }, [])
  return (
    <Container>
      <QRCode value={qr} />
    </Container>
  )
}
