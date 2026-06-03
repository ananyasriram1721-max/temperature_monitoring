const BASE_URL = "http://localhost:8000";

export const getLatest = async () => {
  const res = await fetch(`${BASE_URL}/api/v1/sensor-data/latest`);
  return res.json();
};

export const getHistory = async () => {
  const res = await fetch(`${BASE_URL}/api/v1/sensor-data/history`);
  return res.json();
};