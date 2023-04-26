import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

async function uploadFileToS3() {
  const s3 = new AWS.S3();

  const params = {
    Bucket: 'my-bucket',
    Key: 'my-file.txt',
    Body: 'Hello World!'
  };

  try {
    const data = await s3.upload(params).promise();
    console.log('File uploaded successfully:', data.Location);
  } catch (err) {
    console.log('Error uploading file:', err);
  }
}