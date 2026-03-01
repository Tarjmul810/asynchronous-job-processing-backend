import { buildApp } from "./app";

const start = async () => {
  const app = await buildApp();

  process.on("SIGTERM", async () => {
    console.log("SIGTERM received. Shutting down...");
    await app.close();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("SIGINT received. Shutting down...");
    await app.close();
    process.exit(0);
  });

  try {
    await app.listen({ port: 3001 });
    console.log("Server running on http://localhost:3001");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
