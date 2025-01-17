import { SQSEvent, SQSRecord, Context, SQSBatchResponse } from 'aws-lambda';

// Error types
/**
 * Custom error class for business logic validation failures
 * Extends the base Error class to provide specific error type identification
 * Messages with this error type will be sent to DLQ after max retries
 * @class BusinessLogicError
 * @extends Error
 */
class BusinessLogicError extends Error {
  /**
   * Creates a new BusinessLogicError instance
   * @param message - The error message describing the business logic failure
   */
  constructor(message: string) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}

/**
 * Custom error class for temporary/transient failures that should be retried
 * Extends the base Error class to provide specific error type identification
 * @class TemporaryError
 * @extends Error
 */
class TemporaryError extends Error {
  /**
   * Creates a new TemporaryError instance
   * @param message - The error message describing the temporary failure
   */
  constructor(message: string) {
    super(message);
    this.name = 'TemporaryError';
  }
}

/**
 * Represents the result of processing a single SQS message
 * @interface ProcessingResult
 * @property {boolean} success - Indicates if the message was processed successfully
 * @property {string} messageId - The unique ID of the processed SQS message
 * @property {Error} [error] - Optional error object if processing failed
 */
interface ProcessingResult {
  success: boolean;
  messageId: string;
  error?: Error;
}

/**
 * Processes a single SQS record and returns the processing result
 * @param record - The SQS record to process
 * @returns ProcessingResult indicating success/failure and any error details
 * 
 * This function:
 * 1. Parses the message body as JSON
 * 2. Handles different error scenarios based on message type:
 *    - 'business-error': Throws BusinessLogicError
 *    - 'temporary-error': Throws TemporaryError  
 *    - 'timeout': Simulates a timeout after 5 seconds
 * 3. Returns a ProcessingResult with:
 *    - success: boolean indicating if processing succeeded
 *    - messageId: The original SQS message ID
 *    - error: Any error that occurred during processing
 */
const processRecord = async (record: SQSRecord): Promise<ProcessingResult> => {
  const body = JSON.parse(record.body);
  
  try {
    if (body.type === 'business-error') {
      throw new BusinessLogicError('Invalid business logic');
    }
    
    if (body.type === 'temporary-error') {
      throw new TemporaryError('Temporary processing error');
    }
    
    if (body.type === 'timeout') {
      await new Promise(resolve => setTimeout(resolve, 5000));
      throw new Error('Operation timed out');
    }
    
    console.log('Successfully processed record:', body);
    return {
      success: true,
      messageId: record.messageId
    };

  } catch (error) {
    console.error(`Error processing record ${record.messageId}:`, error);
    return {
      success: false,
      messageId: record.messageId,
      error: error as Error
    };
  }
};

/**
 * AWS Lambda handler function for processing SQS messages in batch
 * @param event - The SQS event containing batch of messages to process
 * @param context - AWS Lambda context object
 * @returns SQSBatchResponse containing any failed message IDs that should be retried
 *
 * This handler:
 * 1. Processes all SQS records in the batch concurrently
 * 2. Tracks failed messages and their error types:
 *    - BusinessLogicError: Will be sent to DLQ after max retries
 *    - TemporaryError: Will be retried
 *    - Other errors: Will be retried
 * 3. Returns batch item failures to trigger retries as needed
 */
export const handler = async (event: SQSEvent, context: Context): Promise<SQSBatchResponse> => {
    console.log('Processing batch of:', event.Records.length);
    
    const batchItemFailures: { itemIdentifier: string }[] = [];
    const processingPromises: Promise<ProcessingResult>[] = [];
  
    for (const record of event.Records) {
      processingPromises.push(processRecord(record));
    }
  
    const results = await Promise.all(processingPromises);
  
    results.forEach((result) => {
      if (!result.success) {
        batchItemFailures.push({ itemIdentifier: result.messageId });
        
        if (result.error instanceof BusinessLogicError) {
          console.log(`Business logic error for message ${result.messageId} - will be sent to DLQ after max retries`);
        } else if (result.error instanceof TemporaryError) {
          console.log(`Temporary error for message ${result.messageId} - will retry`);
        } else {
          console.log(`Unknown error for message ${result.messageId} - will retry`);
        }
      } else {
        console.log(`Successfully processed message ${result.messageId}`);
      }
    });
  
    return {
      batchItemFailures
    };
  };  
