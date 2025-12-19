export default defineEventHandler(async (event) => {
  return sendRedirect(event, "/legacy-items.json");
});
