import { CakesAccess } from '../dataLayer/cakesAcess'
import { AttachmentUtils } from '../fileStorage/attachmentUtils';
import { CakeItem } from '../models/CakeItem'
import { CreateCakeRequest } from '../requests/CreateCakeRequest'
import { UpdateCakeRequest } from '../requests/UpdateCakeRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

const logger = createLogger('cakes')

const cakesAccess = new CakesAccess()
const attachmentUtil = new AttachmentUtils()

export async function getCakes(userId: string) {
  logger.info(`Retrieving all cakes for user ${userId}`, { userId })
  return await cakesAccess.getAllCakes(userId)
}

export async function createCake(
  userId: string,
  createCakeRequest: CreateCakeRequest
): Promise<CakeItem> {
  const cakeId = uuid.v4()

  const newItem: CakeItem = {
    userId,
    cakeId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...createCakeRequest
  }

  await cakesAccess.createCake(newItem)

  return newItem
}

async function checkCake(userId: string, cakeId: string) {
  const existItem = await cakesAccess.getCakeItem(userId, cakeId)
  if (!existItem) {
    throw new createError.NotFound(`Cake with id: ${cakeId} not found`)
  }

  if (existItem.userId !== userId) {
    throw new createError.BadRequest('User not authorized to update item')
  }
}

export async function updateCake(
  userId: string,
  cakeId: string,
  updateRequest: UpdateCakeRequest
) {
  await checkCake(userId, cakeId)

  cakesAccess.updateCakeItem(userId, cakeId, updateRequest)
}

export async function deleteCake(userId: string, cakeId: string) {
  await checkCake(userId, cakeId)

  cakesAccess.deleteCakeItem(userId, cakeId)
}

export async function updateAttachmentUrl(
  userId: string,
  cakeId: string,
  attachmentId: string
) {
  await checkCake(userId, cakeId)

  const url = await attachmentUtil.getAttachmentUrl(attachmentId)

  await cakesAccess.updateAttachmentUrl(userId, cakeId, url)
}

export async function generateAttachmentUrl(id: string): Promise<string> {
  return await attachmentUtil.getUploadUrl(id)
}