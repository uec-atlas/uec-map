export default defineEventHandler(async (event) => {
  setHeader(event, "Access-Control-Allow-Origin", "*");
  return sendRedirect(event, "/legacy-items.json");
});
