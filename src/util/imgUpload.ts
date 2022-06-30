const AWS = require("aws-sdk");
require("dotenv").config();
import moment from "./moment";
const bucketName = process.env.AWS_BUCKET_NAME;
const bucketRegion = process.env.AWS_REGION;

AWS.config.update({
    region: bucketRegion,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
let s3 = new AWS.S3({});

export const imageUpload = async (base64: string, directoryName: string) => {

    // @ts-ignore
    const base64Data = new Buffer.from(
        base64.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
    );

    const type = base64.split(";")[0].split("/")[1];
    const params = {
        Bucket: bucketName,
        Key: `${directoryName}/${moment().format(
            "YYYYMMDD"
        )}/${new Date().getTime()}.${type}`, // type is not required
        Body: base64Data,
        ACL: "public-read",
        ContentEncoding: "base64", // required
        ContentType: `image/${type}`, // required. Notice the back ticks
    };

    let location = "";
    let key = "";
    try {
        const { Location, Key } = await s3.upload(params).promise();
        location = Location;
        key = Key;
    } catch (error) {
        console.log(error);
    }


    return location;
};

export const imageDelete = async (imageUrl) => {
    if (!imageUrl) return;
    const key = imageUrl.split("s3.ap-northeast-2.amazonaws.com/")[1];
    return await s3
        .deleteObject({
            Bucket: bucketName,
            Key: key,
        })
        .promise();
};
