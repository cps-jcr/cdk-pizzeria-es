import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Function } from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class CdkPizzeriaEsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const newOrderFunction = new Function(this, 'NewOrderFunction', {
      runtime: Runtime.NODEJS_24_X,
      handler: 'handler.newOrder',
      code: Code.fromAsset('lib/functions'),
    });

    const api = new apigateway.RestApi(this, 'PizzeriaApi', {
      restApiName: 'Pizzeria CDK Service',
    });

    const orderResource = api.root.addResource('order');
    orderResource.addMethod('POST', new apigateway.LambdaIntegration(newOrderFunction));

  }
}
