import {FetchError} from '../utils/Error';
import {Log} from '../utils/Log';

export class Drive  {
  /**
   * It saves the text to the drive.
   * @param {string} folderId - The ID of the folder you want to save the file into.
   * @param {string} fileName - The name of the file you want to create.
   * @param {string} mainText - The text you want to save.
   * @param {string} [extention='text/plain'] - The file extention.
   * @returns A download url for the text.
   */
  static saveToDrive(folderId: string, fileName: string, mainText: string, extention: string = 'text/plain') {
    const folder: GoogleAppsScript.Drive.Folder = DriveApp.getFolderById(folderId);
    if (!folder) {
      throw new FetchError('The folder could not find.');
    }
    const file = DriveApp.createFile(fileName, mainText, extention);
    file.moveTo(folder);
    Log.log(`Saved ${fileName}.\nDownloadlink: ${file.getDownloadUrl()}`);
    return file.getDownloadUrl();
  }
};
