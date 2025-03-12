import { drive_v3, google } from "googleapis";
import path from "node:path";
import { Readable } from "node:stream";
import mime from "mime-types";
import { AppError } from "../utils/AppError.ts";
import type { Request, Response } from "express";

class GoogleDriveService {
  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:8080/api/v1/google/oauth2callback"
  );
  private drive = google.drive({ version: "v3", auth: this.oauth2Client });

  async setCredentials({ access_token }: { access_token: string }) {
    this.oauth2Client.setCredentials({ access_token });
  }

  async getFolderId(folderName: string) {
    try {
      const response = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: "files(id)",
      });

      return response.data.files?.length ? response?.data?.files[0]?.id : undefined;
    } catch (error) {
      throw error;
    }
  }

  async createFolder(folderName: string) {
    try {
      const fileMetadata = {
        name: folderName,
        parents: ["root"],
        mimeType: "application/vnd.google-apps.folder",
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: "id",
      });

      return response.data.id;
    } catch (error) {
      throw error;
    }
  }

  async uploadFile({ file }: { file: Express.Multer.File }) {
    try {
      const mimeType = mime.lookup(file.originalname);

      if (!mimeType) throw AppError.badRequest("unavailable mime type: " + file.originalname);

      let folderID = await this.getFolderId("My_DISK_APP");

      if (!folderID) {
        folderID = await this.createFolder("My_DISK_APP");
      }
      if (!folderID) throw AppError.badRequest("Folder not found. Create folder My_DISK_APP!");

      const fileMetadata = {
        name: file.originalname,
        parents: [folderID], //["1sDTfl4AvPkY6xxBYx00Jwy03STJ4dJv7"],
      };

      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);

      const media = {
        mimeType: mimeType,
        body: bufferStream,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id",
      });

      return response.data.id;
    } catch (error) {
      throw error;
    }
  }

  // async listFolders(req: Request, res: Response) {
  //   try {
  //     const response = await this.drive.files.list({
  //       // q: "mimeType='application/vnd.google-apps.folder'", // Filter for folders
  //       // fields: "files(id, name)",
  //     });

  //     const folders = response.data.files;
  //     if (folders?.length) {
  //       res.json({ data: folders });
  //     } else {
  //       res.send("No folders found.");
  //     }
  //   } catch (error) {
  //     console.error("Error listing folders:", error);
  //   }
  // }
}

export default new GoogleDriveService();
