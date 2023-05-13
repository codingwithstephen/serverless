import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import AWS from 'aws-sdk';
import { createLogger } from '../../utils/logger';

const logger = createLogger('generateUploadUrl');

const bucketName = process.env.IMAGES_S3_BUCKET;
const s3 = new AWS.S3({
  signatureVersion: 'v4' // Use Sigv4 algorithm
});

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId;
      logger.info(event.pathParameters);
      logger.info("Generate upload url");
      logger.info(todoId);

      console.log("Before getSignedUrl");

      const signedUrl = await getSignedUrl(todoId);

      console.log("After getSignedUrl");

      return {
        statusCode: 200,
        body: JSON.stringify(signedUrl)
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal server error' })
      };
    }
  }
);

async function getSignedUrl(todoId: string) {
  const params = {
    Bucket: bucketName,
    Key: todoId,
    Expires: parseInt(process.env.SIGNED_URL_EXPIRATION)
  };

  return new Promise<string>((resolve, reject) => {
    s3.getSignedUrl('putObject', params, (error: Error, url: string) => {
      if (error) {
        reject(error);
      } else {
        resolve(url);
      }
    });
  });
}

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  );
