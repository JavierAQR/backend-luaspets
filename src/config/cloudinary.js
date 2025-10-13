import cloudinary from 'cloudinary'
import { CLODIDNARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from './config.js'

cloudinary.v2.config({
  cloud_name: CLODIDNARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
})

export default cloudinary.v2
