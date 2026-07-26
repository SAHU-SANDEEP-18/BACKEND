import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export async function uploadToImageKit(buffer, fileName, folder = "chat-uploads") {
  const result = await imagekit.upload({
    file: buffer,
    fileName,
    folder,
  });

  return {
    url: result.url,
    fileId: result.fileId,
  };
}