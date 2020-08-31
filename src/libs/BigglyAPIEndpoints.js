export const baseURL = 
  window.location.origin.includes('localhost') ?
  'http://localhost:5000'
  :
  window.location.origin.includes('192.168') ?
  'http://localhost:5000'
  :
  ''
