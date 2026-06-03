// api.ts

// By removing BASE_URL and starting paths with '/', 
// the browser automatically requests data from the 
// same domain/host that served the website.

export const getLatest = async () => {
  try {
    const res = await fetch("/api/v1/sensor-data/latest");
    if (!res.ok) throw new Error("Network response was not ok");
    return await res.json();
  } catch (error) {
    console.error("Error fetching latest data:", error);
    throw error;
  }
};

export const getHistory = async () => {
  try {
    const res = await fetch("/api/v1/sensor-data/history");
    if (!res.ok) throw new Error("Network response was not ok");
    return await res.json();
  } catch (error) {
    console.error("Error fetching history data:", error);
    throw error;
  }
};