import { setGlobalDispatcher, Agent } from "undici";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    setGlobalDispatcher(
      new Agent({
        connect: { timeout: 30_000, family: 4 },
        keepAliveTimeout: 4_000,
        keepAliveMaxTimeout: 10_000,
      })
    );
  }
}