// import { Vendor } from "./types/vendor";
// import dotenv from "dotenv";
// import { TweetFormatted } from "./types/twitter";
// dotenv.config();
// import {
//   DescribeTableCommand,
//   DynamoDBClient,
//   ListTablesCommand,
// } from "@aws-sdk/client-dynamodb";
//
// // AWS.config.update({ region: process.env.AWS_REGION });
//
// // const { DynamoDB } = AWS;
// // const dynamodb = new DynamoDB();
//
// const dbclient = new DynamoDBClient({ region: process.env.AWS_REGION });
//
// (async function () {
//   // const dbclient = new DynamoDBClient({ region: process.env.AWS_REGION });
//   try {
//     const result = await dbclient.send(new ListTablesCommand());
//     result.TableNames?.forEach(function (item, index) {
//       console.log(item);
//     });
//   } catch (e) {
//     console.error(e);
//   }
// });
// // // 1. create a table
// // export const dynamodb_createTable = async (
// //   params: AWS.DynamoDB.CreateTableInput,
// // ) => {
// //   try {
// //     const result = await dynamodb.createTable(params).promise();
// //     console.log("Table created", result);
// //   } catch (e) {
// //     if (e instanceof Error) {
// //       throw e;
// //     }
// //     throw new Error("dynamodb_createTable error obj unknown type");
// //   }
// // };
// // 2. describe a table
// //
// // export const dynamodb_descriveTable = async (tableName: string) => {
// //   try {
// //     const table = await dbclient
// //       .describeTable({
// //         TableName: tableName,
// //       })
// //       .promise();
// //     console.log("table retrieved", table);
// //     return table;
// //   } catch (e) {
// //     if (e instanceof Error) {
// //       throw e;
// //     }
// //     throw new Error("dynamodb_descriveTable error obj unknown type");
// //   }
// // };
// export const dynamodb_descriveTable = async (tableName: string) => {
//   try {
//     const client = new DynamoDBClient({ region: "YOUR_REGION" }); // Specify your AWS region
//
//     const command = new DescribeTableCommand({ TableName: tableName });
//
//     const response = await client.send(command);
//
//     console.log("Table retrieved", response.Table);
//     return response.Table;
//   } catch (error) {
//     console.error("Error describing table:", error);
//     throw error;
//   }
// };
// export const dynamodb_scanTable = async function* (
//   tableName: string,
//   limit: number = 25,
//   lastEvaluatedKey?: AWS.DynamoDB.Key,
// ) {
//   while (true) {
//     const params: AWS.DynamoDB.ScanInput = {
//       TableName: tableName,
//       Limit: limit,
//     };
//     if (lastEvaluatedKey) {
//       params.ExclusiveStartKey = lastEvaluatedKey;
//     }
//     try {
//       const result = await dynamodb.scan(params).promise();
//       if (!result.Count) {
//         return;
//       }
//       lastEvaluatedKey = (result as AWS.DynamoDB.ScanOutput).LastEvaluatedKey;
//       result.Items = result.Items?.map((item) => unmarshall(item));
//       yield result;
//     } catch (e) {
//       if (e instanceof Error) {
//         throw e;
//       }
//       throw new Error("dynamodb_scanTable unexped error");
//     }
//   }
// };
// export const dynamodb_getAllScanResult = async <T>(
//   tableName: string,
//   limite: number = 25,
// ) => {
//   try {
//     await dynamodb_descriveTable(tableName);
//
//     const scanTableGen = dynamodb_scanTable(tableName, limite);
//
//     const results: T[] = [];
//     let isdone = false;
//
//     while (!isdone) {
//       const iterator = await scanTableGen.next();
//
//       if (!iterator) {
//         throw new Error("no iterator return");
//       }
//       if (iterator.done || !iterator.value.LastEvaluatedKey) {
//         isdone = true;
//       }
//       if (iterator.value) {
//         iterator.value.Items!.forEach((result: any) => results.push(result));
//       }
//     }
//     return results;
//   } catch (e) {
//     if (e instanceof Error) {
//       throw e;
//     }
//     throw new Error("dynamodb_getAllScanResult unexped Error");
//   }
// };
//
// export const dynamodb_updateTweet = async (
//   tableName: string,
//   tweet: TweetFormatted,
//   tweetId: string,
// ) => {
//   try {
//     const params: AWS.DynamoDB.UpdateItemInput = {
//       TableName: tableName,
//       Key: marshall({
//         tweetId: tweetId,
//       }),
//       UpdateExpression:
//         "set #tweets = list_append(if_not_exists(#tweets, :empty_list), :tweet), #updated = :updated",
//       ExpressionAttributeNames: {
//         "#tweets": "tweets",
//         "#updated": "updated",
//       },
//       ExpressionAttributeValues: marshall({
//         ":tweet": [tweet],
//         ":updated": Date.now(),
//         ":empty_list": [],
//       }),
//     };
//     const result = await dynamodb.updateItem(params).promise();
//     console.log("Tweet added to recorded");
//     return result;
//   } catch (e) {
//     if (e instanceof Error) {
//       // throw e
//       return e; // because ths is throusand update xd
//     }
//     throw new Error("dynamodb_updateTweet unexped Error");
//   }
// };
//
// // // 3. delete a table
// // export const dynamodb_deleteTable = async (tableName: string) => {
// //   try {
// //     const result = await dynamodb
// //       .deleteTable({ TableName: tableName })
// //       .promise();
// //     console.log("delete table", result);
// //     return result;
// //   } catch (e) {
// //     if (e instanceof Error) {
// //       throw e;
// //     }
// //     throw new Error("dynamodb_deleteTable error unknown type");
// //   }
// // };
// // // 4. create a record
// // export const dynamodb_createRecord = async (
// //   tableName: string,
// //   vendor: Vendor,
// // ) => {
// //   try {
// //     const result = await dynamodb
// //       .putItem({ TableName: tableName, Item: marshall(vendor) })
// //       .promise();
// //     console.log("record created");
// //     return result;
// //   } catch (e) {
// //     if (e instanceof Error) {
// //       throw e;
// //     }
// //     throw new Error("dynamodb_deleteTable error unknown type");
// //   }
// // };
