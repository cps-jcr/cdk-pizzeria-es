import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class CdkPizzeriaEsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    // Queues

    const pendingOrdersQueue = new Queue (this, 'PendingOrdersQueue', {});


    // Functions

    const newOrderFunction = new Function(this, 'NewOrderFunction', {
      runtime: Runtime.NODEJS_24_X,
      handler: 'handler.newOrder',
      code: Code.fromAsset('lib/functions'),
      environment: {
        PENDING_ORDERS_QUEUE_URL: pendingOrdersQueue.queueUrl,
      }
    });

    pendingOrdersQueue.grantSendMessages(newOrderFunction);

    const getOrderFunction = new Function(this, 'GetOrderFunction', {
      runtime: Runtime.NODEJS_24_X,
      handler: 'handler.getOrder',
      code: Code.fromAsset('lib/functions'),
    });

    const prepOrderFunction = new Function(this, 'PrepOrderFunction', {
      runtime: Runtime.NODEJS_24_X,
      handler: 'handler.prepOrder',
      code: Code.fromAsset('lib/functions'),
    });

    prepOrderFunction.addEventSource(new SqsEventSource(pendingOrdersQueue, {
      batchSize: 1
    }))


    // API Gateway

    const api = new apigateway.RestApi(this, 'PizzeriaApi', {
      restApiName: 'Pizzeria CDK Service',
    });

    const orderResource = api.root.addResource('order');
    orderResource.addMethod('POST', new apigateway.LambdaIntegration(newOrderFunction));
    orderResource.addResource('{orderId}').addMethod('GET', new apigateway.LambdaIntegration(getOrderFunction));

  }
}
