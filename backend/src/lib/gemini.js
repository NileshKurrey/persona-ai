import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
});


export const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

export default client;
