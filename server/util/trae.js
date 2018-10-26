import fetch from 'node-fetch'
import config from '@/config/environment'

async function handleErrors (response) {
  if (!response.ok) {
    throw Error(await response.text())
  }
  const json = await response.json()
  return json
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
