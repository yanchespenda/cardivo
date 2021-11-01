if (
  process.env.LD_LIBRARY_PATH == null ||
  !process.env.LD_LIBRARY_PATH.includes(
    `${process.env.PWD}/node_modules/canvas/build/Release:`,
  )
) {
  process.env.LD_LIBRARY_PATH = `${
    process.env.PWD
  }/node_modules/canvas/build/Release:${process.env.LD_LIBRARY_PATH || ''}`;
}

import { NowRequest, NowResponse } from '@vercel/node';
import Canvas from 'canvas';
import { ParsedCanvasRequest } from '../typings/types';
import path from 'path';


export default async function render(req: NowRequest, res: NowResponse) {
  try {

    const {
      avatar,
      username,
      discriminator
    }: ParsedCanvasRequest = req.query as any

    if (!avatar || !username) {
      throw new Error('Missing query params')
    }

    if (!/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/.test(String(avatar))) {
      throw new Error('Invalid avatar url')
    }

    /**
     * Load a font
     */
    Canvas.registerFont(path.join(__dirname, '..', 'fonts', 'Roboto-Regular.ttf'), { family: 'Roboto' })

    /**
     * Create a new canvas for rounded avatar
     */
    const canvasAvatar = Canvas.createCanvas(500, 500)
    const canvasAvatarCtx = canvasAvatar.getContext('2d')
    const canvasAvatarImage = await Canvas.loadImage(String(avatar))
    canvasAvatarCtx.save()
    canvasAvatarCtx.beginPath()
    canvasAvatarCtx.arc(250, 250, 250, 0, Math.PI * 2, false)
    // canvasAvatarCtx.strokeStyle = '#2465D3'
    canvasAvatarCtx.stroke()
    canvasAvatarCtx.clip()
    canvasAvatarCtx.drawImage(canvasAvatarImage, 0, 0, 500, 500)
    canvasAvatarCtx.restore()

    // img.src = 'https://avatars.githubusercontent.com/u/13547711?v=4'

    /**
     * Create a new canvas
     */
    const canvas = Canvas.createCanvas(2000, 750)
    const ctx = canvas.getContext('2d')

    /**
     * Add a background image
     */
    const backgroundImage = await Canvas.loadImage(path.join(__dirname, '..', 'data', 'base.png'))
    ctx.drawImage(backgroundImage, 0, 0)

    /**
     * Insert rounded avatar
     */
    const avatarImage = await Canvas.loadImage(canvasAvatar.toBuffer())
    ctx.drawImage(avatarImage, 450, 140)

    /**
     * Greeting text
     */
    ctx.font = '92px Roboto'
    ctx.fillStyle = '#FAFAFA'
    ctx.fillText(`Nyanpasu! ✋`, 1150, 280)

    /**
     * Username text
     */
    ctx.font = '72px Roboto'
    ctx.fillStyle = '#FAFAFA'
    ctx.fillText(`${String(username)}${discriminator ? `#${String(discriminator)}` : ``}`, 1150, 420)

    /**
     * Response as image
     */
    res.setHeader('Content-type', 'image/png')
    return res.send(canvas.toBuffer())
  } catch (e) {
    return res.send({
      status: 'err',
      message: e.message
    })
  }
}
