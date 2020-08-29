import { withRouter } from 'react-router-dom';
import { withAuthenticator } from 'aws-amplify-react';
import App from './App'

it('renders without crashing', () => {
  withRouter(withAuthenticator(App))
})

test('two plus two equals four', () => {
  expect(2+2).toBe(4)
})
