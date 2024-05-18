// import { globalLogger as logger } from "./Logger";
// import { formatString } from "./Strings";
// import { ExitCodes } from "../config/Errors";
// import { DeleteFile } from "./deletingFile";
// import { Storage } from "@google-cloud/storage";


// const storage = new Storage({
//   keyFilename: "storage-secret.json",
// });

// const bucket = storage.bucket("micro-quest-storage");



// /**
//  * @description  uploads the zip file to google cloud storage
//  * @param path  path to the zip file
//  * @returns  url of the uploaded file : string
//  */
// export async function uploadZipToCloud(path: string, fileName: string): Promise<string> {
//   try {
//     const uploadedFile = await bucket.upload(path, {
//       destination: `uploads/${fileName}`,
//       metadata: {
//         cacheControl: "public, max-age=31536000",
//       },
//     });


//     DeleteFile(path);
//     let link = uploadedFile[0].metadata.mediaLink;
//     if (!link) throw new Error("Upload Error");
//     return link;
//   } catch (err) {
//     const msg = formatString(ExitCodes.GOOGLE_CLOUD_STORAGE_ERROR_GENERIC.message, {
//       error: err,
//     });
//     logger.error(msg, {
//       code: ExitCodes.GOOGLE_CLOUD_STORAGE_ERROR_GENERIC.code,
//       type: ExitCodes.GOOGLE_CLOUD_STORAGE_ERROR_GENERIC.type,
//     });
//     throw new Error("GOOGLE_CLOUD_STORAGE error");
//   }
// }
