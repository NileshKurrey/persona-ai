import { HITESH_PROFILE, HITESH_SYSTEM_PROMPT } from './hitesh.js';
import { PIYUSH_PROFILE, PIYUSH_SYSTEM_PROMPT } from './piyush.js';

export const PERSONAS = {
  hitesh: {
    profile: HITESH_PROFILE,
    systemPrompt: HITESH_SYSTEM_PROMPT,
  },
  piyush: {
    profile: PIYUSH_PROFILE,
    systemPrompt: PIYUSH_SYSTEM_PROMPT,
  },
};

export function getPersona(id) {
  return PERSONAS[id];
}

export function listProfiles() {
  return Object.values(PERSONAS).map((p) => p.profile);
}
