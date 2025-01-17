
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

/**
 * AWS Lambda function handler that processes API Gateway events
 * 
 * @param event - The API Gateway event containing request details
 * @param context - The Lambda execution context
 * @returns Promise<APIGatewayProxyResult> - Returns a promise that resolves to an API Gateway response
 *
 * This handler:
 * 1. Logs the incoming event and context for debugging
 * 2. Processes the request (business logic to be implemented)
 * 3. Returns a 200 success response with CORS headers if successful
 * 4. Returns a 500 error response if an error occurs
 */
export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('Received context:', JSON.stringify(context, null, 2));

  try {
    // Your business logic here

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // CORS headers
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        message: "Go Serverless v3.0! Your function executed successfully!",
        input: event,
        requestId: context.awsRequestId
      })
    };
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Internal server error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        requestId: context.awsRequestId
      })
    };
  }
};
