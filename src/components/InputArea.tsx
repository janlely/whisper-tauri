import React from "react";

type InputAreaProps = {
  onEnter: (text: string) => void
}

export default React.forwardRef(function InputArea(props: InputAreaProps, ref: React.Ref<HTMLTextAreaElement>) {

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

  return (
    <textarea
      style={{
        width: '100%',
        height: '100%',
        resize: 'none',
        border: 'none',
        padding: 10,
        outline: 'none',
        fontSize: 16
      }}
      onKeyDown={handleTextareaKeyDwon}
      value={textValue}
      onChange={e => setTextValue(e.target.value)}
      ref={ref}
    />
  )
})
// export default function InputArea({onEnter}: InputAreaProps) {
// }