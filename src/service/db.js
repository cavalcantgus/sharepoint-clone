import Dexie from 'dexie';

export const db = new Dexie('geracao-bancaria');

db.version(1).stores({
  queue: '++id,type,status,createdAt'
});
