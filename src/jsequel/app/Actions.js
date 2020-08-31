import api from '../../libs/apiMethods'
import Queries from './Queries'
import SocketLibrary from '../../libs/SocketLibrary'

export default class Actions {

  constructor(apiKey, userKey) {

    this.userKey = userKey
    this.api = api(apiKey)
    this.queries = new Queries()

  }

  getDivisions() {

    let queryObj = this.queries.getDivisions()

    return this.api.listPublic(queryObj)
  }

}
