import { SQSEvent, Context } from 'aws-lambda';

 /**
 * AWS Lambda handler function that processes SQS events
 * @param {SQSEvent} event - The SQS event object containing the records/messages to be processed
 * @param {Context} context - The AWS Lambda context object providing runtime information
 * @returns {Promise<Object>} Returns a promise that resolves to an object containing:
 *                           - statusCode: HTTP status code (200 for success)
 *                           - body: JSON stringified response with message and input event
 */
export const handler = async (event: SQSEvent, context: Context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('Received context:', JSON.stringify(context, null, 2));
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: "Go Serverless v3.0! This is a cron event which runs every minute but dont worry it will not charge much money!",
          input: event,
        },
        null,
        2
      ),
    };
  };
