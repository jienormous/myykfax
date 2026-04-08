type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController<Uint8Array>;
};

const clients = new Set<SSEClient>();
const encoder = new TextEncoder();

export function addClient(client: SSEClient) {
  clients.add(client);
}

export function removeClient(client: SSEClient) {
  clients.delete(client);
}

export function broadcast(event: string, data: unknown) {
  const message = encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  for (const client of clients) {
    try {
      client.controller.enqueue(message);
    } catch {
      clients.delete(client);
    }
  }
}

export function clientCount() {
  return clients.size;
}
