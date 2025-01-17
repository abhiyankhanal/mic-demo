# SAM Template for MIC demo

## Prerequisite
- aws cli
- sam cli
- aws accounts and proper access to lambda, sqs, api gateway, eventbridge, cloudformation, s3 and creating permission for the same

## Build

Navigate to the base directory and install require node modules.
`npm install --omit=dev`  
`npm install esbuild --location=global` (one-off)  
`$ sam build`

## Deployment

`$ sam deploy --stack-name <stack-name> --profile <profile-name> --region <region> --parameter-overrides Env=<String that gets added to the layer name> --resolve-s3`

# mic-demo
