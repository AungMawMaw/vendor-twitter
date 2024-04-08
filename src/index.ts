import {
  dynamodb_getAllScanResult,
  dynamodb_scanTable,
  dynamodb_updateTweet,
} from "./aws";
import { Vendor } from "./types/vendor";
import { Rule } from "./types/twitter";
import { setRules } from "./rules";
import express from "express";

import dotenv from "dotenv";
import { createSQSQueue } from "./aws_sqs";
import router from "./healthcheck";
dotenv.config();
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const init = async () => {
  const vendors_tableName = process.env.AWS_TABLE_NAME ?? "";
  const PORT = process.env.PORT ?? 80;
  try {
    const app = express();
    app.use("/", router);
    app.listen(PORT, () => {
      console.log("healthcheck is listening on port", PORT);
    });
  } catch (e) {
    if (e instanceof Error) {
      console.log("e.message");
      process.exit(1);
    } else {
      console.log("init expected error");
      process.exit(1);
    }
  }

  // const vendors_table = await dynamodb_descriveTable(vendors_tableName);
  // console.log(vendors_table);
  //
  // const scan_table = dynamodb_scanTable(vendors_tableName, 5);
  // console.log((await scan_table.next()).value);
  // console.log((await scan_table.next()).value);
  // console.log((await scan_table.next()).value);

  // const vendor_datas =
  //   await dynamodb_getAllScanResult<Vendor>(vendors_tableName);
  // console.log(vendor_datas);
  // console.log(vendor_datas.length);

  // await dynamodb_updateTweet(
  //   vendors_tableName,
  //   {
  //     id: "tweet_1",
  //     userId: "DCTacoTruck",
  //     userName: "DC Taco Truck",
  //     text: "txt tweet",
  //     date: Date.now().toString(),
  //     geo: {
  //       id: "geo1",
  //       name: "geo loc 1",
  //       country: "country 1",
  //       fullName: "place 1",
  //       placeType: "place 1",
  //       country_code: "country code",
  //       coordinates: {
  //         lat: 34.33333,
  //         long: 11.1111,
  //       },
  //     },
  //   },
  //   "DCTacoTruck",
  // );

  // const sqs_name = process.env.SQS_QUEUE_NAME ?? "";
  // const sqs_url = await checkSQSQueueExists(sqs_name);
  // if (!sqs_url) {
  // const sqs_url2 = await createSQSQueue(sqs_name);
  //   sqs_url2 && sqs_send_msg(sqs_url2, "test mesg");
  //   // sqs_url2 && ( (sqs_url2 instanceof Error)? await deleteSQSQueue(sqs_name) : await sqs_send_msg(sqs_name,'test message'))
  //
  //   // if (sqs_url2 instanceof Error) {
  //   //   await deleteSQSQueue(sqs_name);
  //   // } else {
  //   //   await sqs_send_msg(sqs_url2, "test message");
  //   // }
  // } else {
  //   await sqs_send_msg(sqs_url, "test message");
  // }
  // await deleteSQSQueue(sqs_name);
  //
  // const vendors = await dynamodb_getAllScanResult<Vendor>(vendors_tableName);
  // const vendorList = vendors.map((vendor) => vendor.twitterId);
  //
  // const rules: Rule[] = [
  //   {
  //     value: `has:geo (from: ${vendorList.join(" OR from: ")})`,
  //     tag: "vendors-geo",
  //   },
  // ];
  //
  // const rules: Rule[] = [
  //   {
  //     // value: "has:geo from:aaa OR from:bbbb",
  //     value: "cat has:images -grum",
  //     tag: "vendors-geo",
  //   },
  // ];
  // await setRules(rules);

  // const getallrules = await getAllRules();
  // console.log(getallrules);
  // await deleteAllRules(getallrules);

  // if (!(vendors_table instanceof Error)) {
  //   //Delete table
  //   await dynamodb_deleteTable(vendors_tableName);
  //   await delay(6000);
  // }
  //
  // const vendors_tableParams: AWS.DynamoDB.CreateTableInput = {
  //   TableName: vendors_tableName,
  //   KeySchema: [{ AttributeName: "twitterId", KeyType: "HASH" }],
  //   AttributeDefinitions: [{ AttributeName: "twitterId", AttributeType: "S" }],
  //   ProvisionedThroughput: {
  //     ReadCapacityUnits: 10,
  //     WriteCapacityUnits: 10,
  //   },
  // };
  // await dynamodb_createTable(vendors_tableParams);
  // await delay(12000);
  // for (const i in vendors) {
  //   const vendor = vendors[i];
  //   const res = await dynamodb_createRecord(vendors_tableName, vendor);
  //   if (res instanceof Error) {
  //     console.log("Error", vendor, res);
  //   }
  // }
};
init();
