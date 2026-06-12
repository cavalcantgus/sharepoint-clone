import { db } from './db';

export async function addToQueue(item) {
  return db.queue.add({
    ...item,
    status: 'pending',
    createdAt: new Date().toISOString(),
  })
}

export async function getPendingItems() {
  return db.queue
  .where('status')
  .equals('pending')
  .toArray();
}

export async function markAsDone(id) {
  return db.queue.update(id, {
    status: 'done',
  })
}

export async function removeItem(id) {
  return db.queue.delete(id);
}
