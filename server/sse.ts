type SSEClient = {
  id: string;
  send: (event: string, data: unknown) => Promise<void>;
};

const clients = new Set<SSEClient>();

export function addClient(client: SSEClient) {
  clients.add(client);
}

export function removeClient(client: SSEClient) {
  clients.delete(client);
}

export async function broadcast(event: string, data: unknown) {
  const dead: SSEClient[] = [];
  for (const client of clients) {
    try {
      await client.send(event, data);
    } catch {
      dead.push(client);
    }
  }
  for (const c of dead) clients.delete(c);
}

export function clientCount() {
  return clients.size;
}
