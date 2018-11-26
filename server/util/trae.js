import fetch from 'node-fetch'
import config from '@/config/environment'

async function handleErrors (response) {
  if (!response.ok) {
    throw Error(await response.text())
  }
  let resp
  if (response.headers.get('content-type').includes('application/json')) {
    resp = await response.json()
  } else {
    resp = await response.text()
  }
  return resp
}

function req (url, options) {
  return new Promise((resolve, reject) => {
    fetch(url,
      options
    ).then(handleErrors)
      .then(response => resolve(response))
      .catch(reason => {
        reject(reason)
      })
  })
}

export default function trae (url, method, body) {
  const options = {
    method,
    headers: { 'x-api-key': config.api.key }
  }
  if (body) {
    options.body = JSON.stringify(body)
    options.headers['Content-Type'] = 'application/json'
  }
  return req(url, options)
}

export const request = (url, method, body) => {
  const options = {
    method
  }
  if (body) {
    options.body = JSON.stringify(body)
    options.headers['Content-Type'] = 'application/json'
  }
  return req(url, options)
}
