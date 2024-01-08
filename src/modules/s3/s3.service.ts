import { PutObjectCommand, GetObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Service {

    private readonly S3 = new S3Client({
        region: process.env.REGION,
        credentials: {
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.SERCRET_KEY
        }
    })

    upload(fileName: string, file: Buffer) {
        return this.S3.send(
            new PutObjectCommand({
                Bucket: 'foodmap1492',
                Key: fileName,
                Body: file,
            }),
        );

    }

    async getFile(fileName: string) {
        return await getSignedUrl(this.S3, new GetObjectCommand({
            Bucket: 'foodmap1492',
            Key: fileName
        }))
    }

    async deleteFile(fileName: string) {
        return this.S3.send(
            new DeleteObjectCommand({
                Bucket: 'foodmap1492',
                Key: fileName,
            }),
        );
    }

}
