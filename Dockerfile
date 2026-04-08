FROM oven/bun:1
WORKDIR /app

COPY client/package.json client/bun.lockb* ./client/
RUN cd client && bun install

COPY server/package.json server/bun.lockb* ./server/
RUN cd server && bun install

COPY . .
RUN cd client && bun run build

EXPOSE 3000
CMD ["bun", "run", "server/index.ts"]
