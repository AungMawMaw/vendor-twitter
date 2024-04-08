import {
  CreateQueueCommand,
  CreateQueueCommandInput,
  DeleteQueueCommand,
  DeleteQueueCommandInput,
  GetQueueUrlCommand,
  GetQueueUrlCommandInput,
  QueueDoesNotExist,
  SQSClient,
  SendMessageCommand,
  SendMessageCommandInput,
  SendMessageCommandOutput,
} from "@aws-sdk/client-sqs";
import dotenv from "dotenv";
dotenv.config();

const sqsClient = new SQSClient({ region: process.env.US_EAST_1 });

// 1. Function to create an SQS queue
export const createSQSQueue = async (queueName: string) => {
  try {
    // Construct parameters for CreateQueueCommand
    const createParams: CreateQueueCommandInput = {
      QueueName: queueName,
    };

    // Create a new queue using the CreateQueueCommand
    const createQueueCommand = new CreateQueueCommand(createParams);
    const createResult = await sqsClient.send(createQueueCommand);

    console.log("created queue", queueName);

    return createResult.QueueUrl;
  } catch (error) {
    console.error("Error creating queue:", error);
    throw error;
  }
};

// 2. Function to check if an SQS queue exists
export const checkSQSQueueExists = async (queueName: string) => {
  try {
    // Construct parameters for GetQueueUrlCommand
    const params: GetQueueUrlCommandInput = {
      QueueName: queueName,
    };

    // Send the GetQueueUrlCommand to get the queue URL
    const getQueueUrlCommand = new GetQueueUrlCommand(params);
    const result = await sqsClient.send(getQueueUrlCommand);

    // If no error is thrown, the queue exists
    // return true;
    return result.QueueUrl;
  } catch (error) {
    // If an error is thrown, check if it's a QueueDoesNotExist error
    if (error instanceof QueueDoesNotExist) {
      console.error("The queue does not exist:", error.message);
      return false; // Queue does not exist
    } else {
      // Re-throw other errors
      throw error;
    }
  }
};
export const deleteSQSQueue = async (queueUrl: string) => {
  try {
    // Construct parameters for DeleteQueueCommand
    const params: DeleteQueueCommandInput = {
      QueueUrl: queueUrl,
    };

    // Create a new DeleteQueueCommand with the parameters
    const command = new DeleteQueueCommand(params);

    // Delete the queue using the DeleteQueueCommand
    const result = await sqsClient.send(command);

    // Log the result if needed
    console.log("Queue deleted:", result);

    return result; // Optionally, you can return the result
  } catch (error) {
    console.error("Error deleting queue:", error);
    throw error;
  }
};
export const sqs_send_msg = async (queueUrl: string, messageBody: string) => {
  try {
    // Construct parameters for SendMessageCommand
    const params: SendMessageCommandInput = {
      QueueUrl: queueUrl,
      MessageBody: messageBody,
    };

    // Create a new SendMessageCommand with the parameters
    const command = new SendMessageCommand(params);

    // Send the message using the SQS client
    const result = await sqsClient.send(command);

    // Log the result if needed
    console.log("Message sent:", result);

    return result; // Optionally, you can return the result
  } catch (e) {
    console.log("sqs_send_msg error", e);
  }
};
