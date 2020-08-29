import colors from '../mixins/BigglyColors';

const bigglyStatusColorPicker = (type, key, value) => (
  colors[type].find( item => item[key] === value) ?
  colors[type].find( item => item[key] === value)
  :
  colors[type].find( item => item[key] === 'Default')
)

export default bigglyStatusColorPicker