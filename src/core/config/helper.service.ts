import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
const Jimp = require('jimp');
const https = require('https');
​
/**
 * HelperService
 */
@Injectable()
export class HelperService {​
  /**
   * Separate directory and name from file path
   * 
   * @param {string} file file with complete path i.e. uploads/users/116/946229e4-19dc-4562-957f-d3fb949609b8.png
   * @returns object
   */
  getFilePathAndName(file: string) {
    const DIRECTORY_SEPARATOR = /^win/.test(process.platform) ? "\\" : "/"
​
    let ary = file.split(DIRECTORY_SEPARATOR);
    let file_name = ary[ary.length - 1];
    let file_path = '';
​
    for (let i = 0; i < ary.length - 1; i++) {
      file_path = file_path + ary[i] + DIRECTORY_SEPARATOR;
    }
​
    return { path: file_path, file_name: file_name }
  }
​
  /**
   * Delete a file using file path
   * 
   * @param {string} file file with complete path i.e. uploads/users/116/946229e4-19dc-4562-957f-d3fb949609b8.png
   * @returns 
   */
  async deleteFile(file: string) {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(file)) {
        fs.unlink(file, function (err) {
          if (err) {
            console.error('delete file error');
            console.error(err);
          }
        });
      }
      resolve(true);
    })
  }
​
  /**
   * Resize image using a package jimp
   * @param file string
   * @param width number
   * @param height number
   * @param quality number
   * @param keepRatio boolean
   * @returns 
   */
  async resizeImage(file: string, width: number, height: number, quality: number = 60, keepRatio: boolean = false) {
    return new Promise((resolve, reject) => {
      Jimp.read(file, (err: any, img: any) => {
        if (err) return resolve(err);
​
        let width2 = width;
        let height2 = height;
​
        if (keepRatio) {
          var w = img.bitmap.width;
          var h = img.bitmap.height;
          let r = this.calculateAspectRatioFit(w, h, width, height);
          width2 = r.width;
          height2 = r.height;
        }
​
        const fileData = this.getFilePathAndName(file);
​
        img
          .resize(width2, height2)
          .quality(quality)
          .writeAsync(fileData.path + width + 'x' + height + '_' + fileData.file_name);
​
        resolve(true);
​
      }).catch(function (err) {
        console.error(err);
        resolve(err);
      });
    })
  }
​
  /**
   * 
   * @param srcWidth number
   * @param srcHeight number
   * @param maxWidth number
   * @param maxHeight number
   * @returns object
   */
  calculateAspectRatioFit(srcWidth: number, srcHeight: number, maxWidth: number, maxHeight: number): any {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth * ratio, height: srcHeight * ratio };
  }
​
  async createDirectory(path) {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(path)) {
        resolve(true);
      }
      else {
        fs.mkdir(path, { recursive: true }, error => {
          if (error) {
            reject(error)
          }
          resolve(true);
        });
      }
    }).catch(err => {})
  }
​
  /**
   * Check weather the file or directory exists
   * @param path string
   * @returns boolean
   */
  async pathExist(path: string) {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(path)) {
        resolve(true);
      }
      else {
        resolve(false)
      }
    }).catch(err => {})
  }
​
  /**
   * 
   * @param path string
   * @param buffer any
   * @param type any
   */
  CreateFile(path: string, buffer: any, type: any) {
    return new Promise((resolve, reject) => {
      fs.writeFile(`${path}`, buffer, type, (e: any) => {
        if (e) {
          console.error(e);
          reject(e)
        }
        resolve(true)
      });
    })
  }
​

  /**
   * 
   * @param req 
   * @param path 
   * @returns 
   */
  async GetImage(req:any,path){
    let fileName = req.originalUrl.split('/');
    fileName = fileName.at(-1);
    const isExists = await this.pathExist(join(process.cwd(),path,fileName))
    if(isExists){
      const file = fs.createReadStream(join(process.cwd(),path,fileName));
      return file
    }
    return null;
  }
}
