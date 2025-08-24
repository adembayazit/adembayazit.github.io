// functions/get-upload-signature.js
import ImageKit from "imagekit";

export async function handler(event, context) {
  const imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT
  });

  const result = imagekit.getAuthenticationParameters();

  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
}