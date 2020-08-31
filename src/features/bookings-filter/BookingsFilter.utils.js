import colorPicker from '../../App.utils'

export const flagColor = (flag, jsonFlags = []) => {
  if(!flag || jsonFlags.length === 0) return

  let color = (colorPicker('template', 'colorLabel', (jsonFlags.find(
    flagObj => flagObj.value === flag
  ) || {}).colorLabel) || {}).color

  if(!color || color.length === 0) {
    return '#969696'
  }

  return color
}
