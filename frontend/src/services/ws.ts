// ws.ts
export const createSensorSocket = () => {
  // Use 'wss' for HTTPS sites and 'ws' for HTTP sites
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.host;
  return new WebSocket(`${protocol}://${host}/ws/sensor`);
};