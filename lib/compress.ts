import Compressor from "compressorjs";

export const compress = async (file: File) => {
  if (!file.type.startsWith("image/")) return file;

  return new Promise<File>((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
      success(result) {
        resolve(result as File);
      },
      error(err) {
        reject(err);
      },
    });
  });
};
