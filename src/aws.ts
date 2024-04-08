import {
  DynamoDBClient,
  DescribeTableCommand,
  ScanCommand,
  ScanCommandOutput,
  UpdateItemCommand,
  UpdateItemCommandOutput,
  DescribeTableCommandOutput,
  ScanCommandInput,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { TweetFormatted } from "./types/twitter";
import dotenv from "dotenv";
import AWS from "@aws-sdk/types";
import {
  SQSClient,
  SendMessageCommand,
  SendMessageCommandInput,
  SendMessageCommandOutput,
} from "@aws-sdk/client-sqs";
dotenv.config();

const client = new DynamoDBClient({ region: process.env.US_EAST_1 });

// Describe a table
export const dynamodb_descriveTable = async (
  tableName: string,
): Promise<DescribeTableCommandOutput> => {
  try {
    const command = new DescribeTableCommand({ TableName: tableName });
    const response = await client.send(command);
    console.log("Table retrieved", response.Table);
    return response;
  } catch (error) {
    console.error("Error describing table:", error);
    throw error;
  }
};

// Scan a table
export const dynamodb_scanTable = async function* (
  tableName: string,
  limit: number = 25,
  lastEvaluatedKey?: Record<string, any>,
): AsyncGenerator<ScanCommandOutput, void, undefined> {
  while (true) {
    const params: ScanCommandInput = {
      TableName: tableName,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    };
    try {
      const command = new ScanCommand(params);
      const result = await client.send(command);
      if (!result.Count) {
        return;
      }
      lastEvaluatedKey = result.LastEvaluatedKey;
      result.Items = result.Items!.map((item) => unmarshall(item));
      yield result;
    } catch (e) {
      console.error("Error scanning table:", e);
      throw e;
    }
  }
};

// Get all scan results
export const dynamodb_getAllScanResult = async <T>(
  tableName: string,
  limit: number = 25,
): Promise<T[]> => {
  try {
    await dynamodb_descriveTable(tableName);

    const scanTableGen = dynamodb_scanTable(tableName, limit);

    const results: T[] = [];
    let isDone = false;

    while (!isDone) {
      const { done, value } = await scanTableGen.next();
      if (done || !value!.LastEvaluatedKey) {
        isDone = true;
      }
      if (value) {
        value.Items!.forEach((result: any) => results.push(result));
      }
    }
    return results;
  } catch (e) {
    console.error("Error getting all scan results:", e);
    throw e;
  }
};

// Update a tweet
export const dynamodb_updateTweet = async (
  tableName: string,
  tweet: TweetFormatted,
  tweeterId: string,
) => {
  try {
    const params: UpdateItemCommandInput = {
      TableName: tableName,
      Key: marshall({
        twitterId: tweeterId,
      }),
      UpdateExpression:
        "set #tweets = list_append(if_not_exists(#tweets, :empty_list), :tweet), #updated = :updated",
      ExpressionAttributeNames: {
        "#tweets": "tweets",
        "#updated": "updated",
      },
      ExpressionAttributeValues: marshall({
        ":tweet": [tweet],
        ":updated": Date.now(),
        ":empty_list": [],
      }),
    };
    const command = new UpdateItemCommand(params);
    const result = await client.send(command);
    console.log("Tweet added to recorded", result.$metadata);
    return result;
  } catch (e) {
    console.error("Error updating tweet:", e);
    throw e;
  }
};
// sqs
