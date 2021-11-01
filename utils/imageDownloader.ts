import * as request from "request"

export const imageDownloader = (url: string): Promise<Buffer> => new Promise<Buffer>((resolve, reject) => {
  // `encoding: null` is important - otherwise you'll get non-buffer response body
  request({ url, encoding: null }, (e, res, body) => {
    if (e) { return reject(e) }
    else if (200 <= res.statusCode && res.statusCode < 300) {
      return resolve(body)
    } else {
      return reject(new Error(`Unexpected response status ${res.statusCode}`))
    }
  })
})