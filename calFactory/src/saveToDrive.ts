import {FetchError} from'./Error';

/**
 * It saves the text to the drive.
 * @param {string} folderId - The ID of the folder you want to save the file into.
 * @param {string} fileName - The name of the file you want to create.
 * @param {string} mainText - The text you want to save.
 * @param {string} [extention=txt] - The file extention.
 * @returns A download url for the text.
 */
export const saveToDrive=(folderId:string,fileName:string,mainText:string,extention:string="txt")=>{
  const folder:GoogleAppsScript.Drive.Folder=DriveApp.getFolderById(folderId);
  if(!folder){throw new FetchError(`The folder could not find.`)}
  const file=DriveApp.createFile(fileName, mainText, extention);
  file.moveTo(folder);
  Logger.log(`Saved ${fileName}.\nDownloadlink: ${file.getDownloadUrl()}`)
  return file.getDownloadUrl();
}
