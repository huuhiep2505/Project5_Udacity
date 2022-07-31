import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { CakeItem } from '../models/CakeItem'
import { CakeUpdate } from '../models/CakeUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('CakesAccess')

export class CakesAccess {
    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly cakesTable = process.env.CAKES_TABLE
    ) {}
  
    async getCakeItem(userId: string, cakeId: string): Promise<CakeItem> {
      return (
        await this.docClient
          .get({
            TableName: this.cakesTable,
            Key: {
              userId,
              cakeId
            }
          })
          .promise()
      ).Item as CakeItem
    }
  
    async getAllCakes(userId: string): Promise<CakeItem[]> {
      logger.info('Get all cakes')
      const result = await this.docClient
        .query({
          TableName: this.cakesTable,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          }
        })
        .promise()
  
      return result.Items as CakeItem[]
    }
  
    async createCake(cakeItem: CakeItem): Promise<CakeItem> {
      logger.info('Create new cake')
      await this.docClient
        .put({
          TableName: this.cakesTable,
          Item: cakeItem
        })
        .promise()
      return cakeItem
    }
  
    async updateCakeItem(userId: string, cakeId: string, cakeUpdate: CakeUpdate) {
      logger.info(`Update cake ${cakeId} with ${JSON.stringify(cakeUpdate)}`)
      await this.docClient
        .update({
          TableName: this.cakesTable,
          Key: {
            userId,
            cakeId
          },
          UpdateExpression: 'set #name = :name, done = :done, dueDate = :dueDate',
          ExpressionAttributeNames: {
            '#name': 'name'
          },
          ExpressionAttributeValues: {
            ':name': cakeUpdate.name,
            ':done': cakeUpdate.done,
            ':dueDate': cakeUpdate.dueDate
          }
        })
        .promise()
    }
  
    async deleteCakeItem(userId: string, cakeId: string) {
      logger.info(`delete cake with Id : ${cakeId}`)
      await this.docClient
        .delete({
          TableName: this.cakesTable,
          Key: {
            userId,
            cakeId
          }
        })
        .promise()
    }
  
    async updateAttachmentUrl(userId: string, cakeId: string, newUrl: string) {
      logger.info(
        `Update ${newUrl} attachment URL for cake with ${cakeId} in table ${this.cakesTable}`
      )
  
      await this.docClient
        .update({
          TableName: this.cakesTable,
          Key: {
            userId,
            cakeId
          },
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': newUrl
          }
        })
        .promise()
    }
  }
  
  function createDynamoDBClient(): DocumentClient {
    if (process.env.IS_OFFLINE) {
      logger.info('Create a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }