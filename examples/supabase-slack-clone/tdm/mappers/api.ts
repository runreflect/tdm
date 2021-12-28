import axios from 'axios'
import { Channel } from '../schemas/channel'
import { Message } from '../schemas/message'
import { User } from '../schemas/user'
import jwt from 'jsonwebtoken'

export class SupabaseApi {
  appName: string
  baseUrl: string
  headers: Record<string, string>

  constructor(appName: string, apiKey: string) {
    this.appName = appName
    this.baseUrl = `https://${appName}.supabase.co/rest/v1`

    this.headers = {
      apikey: apiKey,
      authorization: `Bearer ${apiKey}`, // Must be service-role API key
    }
  }

  async getChannels(): Promise<Channel[]> {
    const response = await axios.get(`${this.baseUrl}/channels?select=` + encodeURIComponent('*'), { headers: this.headers })
    return response.data
  }

  async createChannel(channel: Omit<Channel, 'id' | 'inserted_at'>): Promise<unknown> {
    const response = await axios.post(`${this.baseUrl}/channels`, channel, { headers: this.headers })
    return response.data
  }

  async updateChannel(id: number, channel: Omit<Channel, 'id' | 'inserted_at'>): Promise<unknown> {
    const response = await axios.patch(`${this.baseUrl}/channels?id=eq.${encodeURIComponent(id)}`, channel, { headers: this.headers })
    return response.data
  }

  async deleteChannel(id: number): Promise<unknown> {
    const response = await axios.delete(`${this.baseUrl}/channels?id=eq.${encodeURIComponent(id)}`, { headers: this.headers })
    return response.data
  }

  async getMessages(): Promise<Message[]> {
    const response = await axios.get(`${this.baseUrl}/messages?select=*%2Cauthor%3Auser_id%28*%29&order=inserted_at.asc.nullslast`, { headers: this.headers })
    return response.data
  }

  async createMessage(message: Omit<Message, 'id' | 'inserted_at'>): Promise<unknown> {
    const response = await axios.post(`${this.baseUrl}/messages`, message, { headers: this.headers })
    return response.data
  }

  async updateMessage(id: number, message: Omit<Message, 'id' | 'inserted_at'>): Promise<unknown> {
    const response = await axios.patch(`${this.baseUrl}/messages?id=eq.${encodeURIComponent(id)}`, message, { headers: this.headers })
    return response.data
  }

  async deleteMessage(id: number): Promise<unknown> {
    const response = await axios.delete(`${this.baseUrl}/messages?id=eq.${encodeURIComponent(id)}`, { headers: this.headers })
    return response.data
  }

  async getUsers(): Promise<User[]> {
    const response = await axios.get(`${this.baseUrl}/users?select=*`, { headers: this.headers })
    return response.data
  }

  async createUser(user: Omit<User, 'id'>): Promise<unknown> {
    const response = await axios.post(`${this.baseUrl}/users`, user, { headers: this.headers })
    return response.data
  }
  
  async updateUser(id: string, user: Omit<User, 'id' | 'inserted_at'>): Promise<unknown> {
    const response = await axios.patch(`${this.baseUrl}/users?id=eq.${encodeURIComponent(id)}`, user, { headers: this.headers })
    return response.data
  }

  async deleteUser(id: string): Promise<unknown> {
    const response = await axios.delete(`${this.baseUrl}/users?id=eq.${encodeURIComponent(id)}`, { headers: this.headers })
    return response.data
  }
}
