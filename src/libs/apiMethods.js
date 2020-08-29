import axios from 'axios';
import uuid from 'uuid';
import { endpoints } from '../libs/BigglyAPIEndpoints'

const CancelToken = axios.CancelToken

const stage = (
  window.location.origin.includes('localhost') || 
  window.location.origin.includes('192.168') || 
  window.location.origin === 'http://dev.biggly.co.uk'
) ? 'dev' : 'staging'


// This is just some conversion, originally we used the aws-sdk API package
// to handle our api methods but it actually just uses axios underneath anyway
// so now we're using axios I've just made these methods so we can still use the
// same syntax as the aws-sdk methods.

export const API = {
  async get(stage, uri, config) {
    const url = endpoints.find(conf => conf.name === stage).endpoint
    const res = await axios.get(url + uri, config)
    // console.log(res)
    return res.data
  },
  async put(stage, uri, data, config) {
    const url = endpoints.find(conf => conf.name === stage).endpoint
    const res = await axios.put(url + uri, data, config)
    // console.log(res)
    return res.data
  },
  async post(stage, uri, data, config) {
    const url = endpoints.find(conf => conf.name === stage).endpoint
    const res = await axios.post(url + uri, data, config)
    // console.log(res)
    return res.data
  },
  async del(stage, uri, config) {
    const url = endpoints.find(conf => conf.name === stage).endpoint
    const res = await axios.delete(url + uri, config)
    // console.log(res)
    return res.data
  },
  async custom(method, url, config) {
    let res

    try {
      res = await axios[method](url, config)
    } catch (error) {
      console.log(error)
      return undefined
    }
    return res.data
  }
}

// These are our general purpose endpoint functions. They are the CRUD HTTP methods
// split into Admin and Public which both use different db schemas.
// Admin is allowed to access all parts of the db.
// Public has a more limited access.
// You'll find the schema in the api project folder.

export default apiKey => {
  return {

    // All the get endpoints add a cancel function to this array
    _cancelTokens: [],


    // This function will cancel any un-resolved gets.
    cancelFetches() {

      if(this._cancelTokens.length > 0) this._cancelTokens.forEach(fn => fn())

      this._cancelTokens = []

    },

    _generateCancelToken() {
      return new CancelToken(c => {

        this._cancelTokens.push(c) 

        // Only keep 5 cancel tokens at any time so they don't build up into a massive
        // list we don't need. I could make each endpoint remove it's own cancel function
        // once it resolves but this is just as effective.
        if(this._cancelTokens.length > 5) this._cancelTokens.unshift()

      })
    },


    async custom(method, paramsHandler) {
      let res

      try {
        res = await axios[method](...paramsHandler(apiKey))
      } catch (error) {
        console.log(error)
        return undefined
      }
      return res.data
    },

    // █▀▀█ █▀▀▄ █▀▄▀█ ░▀░ █▀▀▄
    // █▄▄█ █░░█ █░▀░█ ▀█▀ █░░█
    // ▀░░▀ ▀▀▀░ ▀░░░▀ ▀▀▀ ▀░░▀
    
    async deleteAdmin(query, errResult, config) {
      try {
        return await API.del(stage, `/jseq/key/${apiKey}/admin/${encodeURIComponent(JSON.stringify(query))}`, config)
      } catch (err) {
        console.log('There was an error with the general delete: ', err);
        if(errResult) return err;
        return null;
      }
    },
    async createAdmin(query, data, primaryKey = '', errResult, keyResult, config) {
      if(primaryKey.length > 0) {
        data[primaryKey] = uuid.v1();
      }
      let result;
      try {
        result = await API.post(stage, `/jseq/key/${apiKey}/admin/${encodeURIComponent(JSON.stringify(query))}`, data, config)
      } catch (err) {
        console.log('There was an error with the general post: ', err);
        if(errResult) return err;
        return null;
      }
      if(keyResult) return {...result, key: data[primaryKey]};
      return result;
    },
    async updateAdmin(query, data, errResult, config) {
      try {
        return await API.put(stage, `/jseq/key/${apiKey}/admin/${encodeURIComponent(JSON.stringify(query))}`, data, config)
      } catch (err) {
        console.log('There was an error with the general put: ', err);
        if(errResult) return err;
        return null;
      }
    },
    async listAdmin(query, errResult, config = {}) {
      config.cancelToken = this._generateCancelToken()
      let result;
      try {
        result = await API.get(stage, `/jseq/key/${apiKey}/admin/${encodeURIComponent(JSON.stringify(query))}/list`, config)
      } catch (err) {
        console.log('There was an error with the general get: ', err);
        if(errResult) return err;
        return null;
      }
      return result;
    },
    async getAdmin(query, errResult, config = {}) {
      config.cancelToken = this._generateCancelToken()
      try {
        return await API.get(stage, `/jseq/key/${apiKey}/admin/${encodeURIComponent(JSON.stringify(query))}`, config)
      } catch (err) {
        console.log('There was an error with the general get: ', err);
        if(errResult) return err;
        return null;
      }
    },

    // █▀▀█ █░░█ █▀▀▄ █░░ ░▀░ █▀▀
    // █░░█ █░░█ █▀▀▄ █░░ ▀█▀ █░░
    // █▀▀▀ ░▀▀▀ ▀▀▀░ ▀▀▀ ▀▀▀ ▀▀▀

    async deletePublic(query, errResult, config) {
      try {
        return await API.del(stage, `/jseq/key/${apiKey}/public/${encodeURIComponent(JSON.stringify(query))}`, config)
      } catch (err) {
        console.log('There was an error with the general delete: ', err);
        if(errResult) return err;
        return null;
      }
    },
    async createPublic(query, data, primaryKey = '', errResult, keyResult, config) {
      if(primaryKey.length > 0) {
        data[primaryKey] = uuid.v1();
      }
      let result;
      try {
        result = await API.post(stage, `/jseq/key/${apiKey}/public/${encodeURIComponent(JSON.stringify(query))}`, data, config)
      } catch (err) {
        console.log('There was an error with the general post: ', err);
        if(errResult) return err;
        return null;
      }
      if(keyResult) return {...result, key: data[primaryKey]};
      return result;
    },
    async updatePublic(query, data, errResult, config) {
      try {
        return await API.put(stage, `/jseq/key/${apiKey}/public/${encodeURIComponent(JSON.stringify(query))}`, data, config)
      } catch (err) {
        console.log('There was an error with the general put: ', err);
        if(errResult) return err;
        return null;
      }
    },
    async listPublic(query, errResult, config = {}) {
      config.cancelToken = this._generateCancelToken()
      try {
        return await API.get(stage, `/jseq/key/${apiKey}/public/${encodeURIComponent(JSON.stringify(query))}/list`, config)
      } catch (err) {
        console.log('There was an error with the general get: ', err);
        if(errResult) return err;
        return null;
      }
    },
    async getPublic(query, errResult, config = {}) {
      config.cancelToken = this._generateCancelToken()
      try {
        return await API.get(stage, `/jseq/key/${apiKey}/public/${encodeURIComponent(JSON.stringify(query))}`, config)
      } catch (err) {
        console.log('There was an error with the general get: ', err);
        if(errResult) return err;
        return null;
      }
    },
  }
}
