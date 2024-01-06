import createApp from "./app";

const app = createApp();

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}/`);
});