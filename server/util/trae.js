import fetch from 'node-fetch'
import config from '@/config/environment'

export default function trae (url, method, body) {
  const options = {
    method,
    headers: { 'x-api-key': config.api.key }
  }
  if (body) {
    options.body = JSON.stringify(body)
    options.headers['Content-Type'] = 'application/json'
  }
  return fetch(url,
    options
  ).then(res => res.json())
}
