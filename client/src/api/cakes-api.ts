import { apiEndpoint } from '../config'
import { Cake } from '../types/Cake';
import { CreateCakeRequest } from '../types/CreateCakeRequest';
import Axios from 'axios'
import { UpdateCakeRequest } from '../types/UpdateCakeRequest';

export async function getCakes(idToken: string): Promise<Cake[]> {
  console.log('Fetching cakes')

  const response = await Axios.get(`${apiEndpoint}/cakes`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Cakes:', response.data)
  return response.data.items
}

export async function createCake(
  idToken: string,
  newCake: CreateCakeRequest
): Promise<Cake> {
  const response = await Axios.post(`${apiEndpoint}/cakes`,  JSON.stringify(newCake), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchCake(
  idToken: string,
  cakeId: string,
  updatedCake: UpdateCakeRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/cakes/${cakeId}`, JSON.stringify(updatedCake), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteCake(
  idToken: string,
  cakeId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/cakes/${cakeId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  cakeId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/cakes/${cakeId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
