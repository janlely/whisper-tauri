import React, { useImperativeHandle } from "react";

type InputAreaProps = {
  onEnter: (text: string) => void
  style?: React.CSSProperties
}

export interface InputAreaRef {
  appendText: (txt: string) => void,
  clear: () => void,
}

export default React.forwardRef<InputAreaRef, InputAreaProps>((props, ref) => {

  const [textValue, setTextValue] = React.useState('')

  const handleTextareaKeyDwon = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      setTextValue(pre => pre + '\n')
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      props.onEnter(textValue)
    }
  }

  useImperativeHandle(ref, () => ({
    appendText: (txt: string) => {
      setTextValue(pre => pre + txt)
    },
    clear: () => {
      setTextValue('')
    }
  }));

  return (
    <textarea
      style={{
        width: '100%',
        // maxHeight: '100%',
        resize: 'none',
        border: 'none',
        padding: 10,
        outline: 'none',
        fontSize: 16,
        ...props.style
      }}
      onKeyDown={handleTextareaKeyDwon}
      value={textValue}
      onChange={e => setTextValue(e.target.value)}
      // ref={ref}
    />
  )
})
// export default function InputArea({onEnter}: InputAreaProps) {
// }