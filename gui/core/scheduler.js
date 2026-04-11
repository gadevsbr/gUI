import { createQueue } from "../utils/queue.js";

const queue = createQueue();
let scheduled = false;
let flushing = false;
let batchDepth = 0;

export function scheduleJob(job) {
  if (!queue.add(job)) {
    return;
  }

  if (!scheduled && batchDepth === 0) {
    scheduled = true;
    queueMicrotask(flushJobs);
  }
}

export function batch(fn) {
  batchDepth += 1;
  try {
    return fn();
  } finally {
    batchDepth -= 1;
    if (batchDepth === 0 && queue.size > 0 && !scheduled && !flushing) {
      flushJobs();
    }
  }
}

export function flushJobs() {
  if (flushing) {
    return;
  }

  scheduled = false;
  flushing = true;

  try {
    while (queue.size > 0) {
      const batch = queue.drain();

      for (const job of batch) {
        job();
      }
    }
  } finally {
    flushing = false;

    if (queue.size > 0 && !scheduled) {
      scheduled = true;
      queueMicrotask(flushJobs);
    }
  }
}
