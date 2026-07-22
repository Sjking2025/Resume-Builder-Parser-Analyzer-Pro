export const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
      image.src = url
    })
  
  export function getRadianAngle(degreeValue) {
    return (degreeValue * Math.PI) / 180
  }
  
  /**
   * Returns the new bounding area of a rotated rectangle.
   */
  export function rotateSize(width, height, rotation) {
    const rotRad = getRadianAngle(rotation)
  
    return {
      width:
        Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height:
        Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
  }
  
  /**
   * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
   */
  export default async function getCroppedImg(
    imageSrc,
    pixelCrop,
    rotation = 0,
    flip = { horizontal: false, vertical: false },
    aspectRatio = 1 // 1 for circle/square, 0.75 for 3:4
  ) {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
  
    if (!ctx) {
      return null
    }
  
    const rotRad = getRadianAngle(rotation)
  
    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      image.width,
      image.height,
      rotation
    )
  
    // set canvas size to match the bounding box
    canvas.width = bBoxWidth
    canvas.height = bBoxHeight
  
    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
    ctx.rotate(rotRad)
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
    ctx.translate(-image.width / 2, -image.height / 2)
  
    // draw rotated image
    ctx.drawImage(image, 0, 0)
  
    // croppedAreaPixels values are bounding box relative
    // extract the cropped image using these values
    const data = ctx.getImageData(
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height
    )
  
    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
  
    // paste generated rotate image at the top left corner
    ctx.putImageData(data, 0, 0)
  
    // As Base64 string (compress to keep size down)
    return new Promise((resolve, reject) => {
      // Create a smaller canvas if image is too big to save space
      const MAX_SIZE = 400;
      let targetWidth = canvas.width;
      let targetHeight = canvas.height;
  
      if (targetWidth > MAX_SIZE || targetHeight > MAX_SIZE) {
        if (targetWidth > targetHeight) {
          targetHeight = Math.round((targetHeight * MAX_SIZE) / targetWidth);
          targetWidth = MAX_SIZE;
        } else {
          targetWidth = Math.round((targetWidth * MAX_SIZE) / targetHeight);
          targetHeight = MAX_SIZE;
        }
      }
  
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetWidth;
      finalCanvas.height = targetHeight;
      const finalCtx = finalCanvas.getContext('2d');
      
      // We want to avoid transparent black backgrounds on JPEGs, fill with white first
      finalCtx.fillStyle = '#ffffff';
      finalCtx.fillRect(0, 0, targetWidth, targetHeight);
      
      finalCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
      
      const base64Image = finalCanvas.toDataURL('image/jpeg', 0.8);
      resolve(base64Image);
    })
  }
