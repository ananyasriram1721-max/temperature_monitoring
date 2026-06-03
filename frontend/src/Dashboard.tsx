import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  AppBar,
  Toolbar,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

/* ---------------- TYPES ---------------- */

type LatestSensorData = {
  id: number;
  temperature: number;
  humidity: number;
  predicted_temperature: number;
  ir_detected: boolean | number; // Handles both strict booleans and 1/0 integers from SQLite
};

type HistoryData = {
  id: number;
  temperature: number;
  humidity: number;
  predicted_temperature: number;
  ir_detected: boolean | number;
};

// Replace your existing BASE_URL line with this:
const BASE_URL = "https://temperaturemonitoring-production.up.railway.app";

export default function Dashboard() {
  const [latest, setLatest] = useState<LatestSensorData | null>(null);
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [status, setStatus] = useState<"LIVE" | "ERROR">("LIVE");

  /* ---------------- FETCH ---------------- */

  const fetchData = useCallback(async () => {
    try {
      const [lRes, hRes] = await Promise.all([
        fetch(`${BASE_URL}/api/v1/sensor-data/latest`),
        fetch(`${BASE_URL}/api/v1/sensor-data/history`),
      ]);

      if (!lRes.ok || !hRes.ok) throw new Error("API error");

      const latestData: LatestSensorData = await lRes.json();
      const historyData: HistoryData[] = await hRes.json();

      setLatest(latestData);
      setHistory(historyData);
      setStatus("LIVE");
    } catch (err) {
      console.error(err);
      setStatus("ERROR");
    }
  }, []);

  /* ---------------- SAFE POLLING ---------------- */

  useEffect(() => {
    let active = true;

    const loop = async () => {
      while (active) {
        await fetchData();
        await new Promise((r) => setTimeout(r, 2000));
      }
    };

    loop();

    return () => {
      active = false;
    };
  }, [fetchData]);

  /* ---------------- ANALYTICS CALCULATIONS ---------------- */
  
  const totalReadings = history.length;
  const maxTemp = totalReadings > 0 ? Math.max(...history.map(d => d.temperature)) : 0;
  const avgHumidity = totalReadings > 0 ? (history.reduce((acc, d) => acc + d.humidity, 0) / totalReadings).toFixed(1) : 0;
  
  // Safe comparison evaluations (No loose string comparison checks)
  const irTriggerCount = history.filter(d => d.ir_detected === true || d.ir_detected === 1).length;

  const isIrCurrentlyDetected = latest 
    ? (latest.ir_detected === true || latest.ir_detected === 1) 
    : false;

  /* ---------------- UI ---------------- */

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        color: "#111827",
        p: 0,
        m: 0,
      }}
    >
      {/* TOP BAR */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography sx={{ fontWeight: 600, color: "#111827" }}>
            IoT Monitoring Console
          </Typography>

          <Chip
            label={status === "LIVE" ? "● LIVE" : "● ERROR"}
            sx={{
              fontWeight: 600,
              bgcolor: status === "LIVE" ? "#ecfdf5" : "#fef2f2",
              color: status === "LIVE" ? "#065f46" : "#991b1b",
              border: "1px solid #e5e7eb",
            }}
          />
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {/* TITLE */}
        <Typography sx={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>
          Device Overview
        </Typography>

        <Typography sx={{ fontSize: 13, color: "#6b7280", mb: 3 }}>
          Real-time sensor telemetry & historical analytics system
        </Typography>

        {/* METRICS */}
        {latest && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
              gap: 2,
              mb: 3,
            }}
          >
            <MetricCard label="Temperature" value={`${latest.temperature}°C`} />
            <MetricCard label="Humidity" value={`${latest.humidity}%`} />
            <MetricCard label="Predicted" value={`${latest.predicted_temperature}°C`} />
            <MetricCard
              label="IR Sensor Status"
              value={isIrCurrentlyDetected ? "🚨 DETECTED" : "🟢 CLEAR"}
              highlight={isIrCurrentlyDetected}
            />
          </Box>
        )}

        {/* ANALYTICS HIGHLIGHT OVERVIEW */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
            mb: 4,
          }}
        >
          <Box sx={{ p: 2, border: "1px dashed #e5e7eb", borderRadius: 2 }}>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>Peak Temp Recorded</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>{maxTemp}°C</Typography>
          </Box>
          <Box sx={{ p: 2, border: "1px dashed #e5e7eb", borderRadius: 2 }}>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>Historical Avg Humidity</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>{avgHumidity}%</Typography>
          </Box>
          <Box sx={{ p: 2, border: "1px dashed #e5e7eb", borderRadius: 2 }}>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>IR Trigger Logs Caught</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#b91c1c" }}>{irTriggerCount} events</Typography>
          </Box>
        </Box>

        {/* CHART SECTION */}
        <Card sx={cardStyle}>
          <CardContent>
            <Typography sx={{ fontWeight: 600, color: "#111827" }}>
              Live Sensor Trends & Analytics Timeline
            </Typography>
            <Divider sx={{ my: 1.5, borderColor: "#e5e7eb" }} />

            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" />
                <XAxis dataKey="id" stroke="#4b5563" tick={{ fill: '#4b5563' }} />
                <YAxis stroke="#4b5563" tick={{ fill: '#4b5563' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827' }}
                />
                <Legend verticalAlign="top" height={36}/>
                <Line
                  name="Actual Temp (°C)"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
                <Line
                  name="Predicted Temp (°C)"
                  type="monotone"
                  dataKey="predicted_temperature"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line
                  name="Humidity (%)"
                  type="monotone"
                  dataKey="humidity"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* HISTORY DATA TABLE SECTION */}
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#111827", mt: 4, mb: 1.5 }}>
          Historical Telemetry Log (Last 50 entries)
        </Typography>

        <TableContainer component={Paper} sx={{ border: "1px solid #e5e7eb", boxShadow: "none", borderRadius: 3, overflow: "hidden", mb: 5 }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "#f9fafb" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Data Frame ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Temperature</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Humidity</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Predicted Space Value</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#374151" }}>IR Sensor State</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((row) => {
                const isRowIrTriggered = row.ir_detected === true || row.ir_detected === 1;
                return (
                  <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ color: "#4b5563" }}>#{row.id}</TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "#111827" }}>{row.temperature}°C</TableCell>
                    <TableCell sx={{ color: "#111827" }}>{row.humidity}%</TableCell>
                    <TableCell sx={{ color: "#6b7280" }}>{row.predicted_temperature}°C</TableCell>
                    <TableCell>
                      {isRowIrTriggered ? (
                        <Chip size="small" label="DETECTED" sx={{ bgcolor: "#fef2f2", color: "#991b1b", fontWeight: 600, border: "1px solid #fca5a5" }} />
                      ) : (
                        <Chip size="small" label="CLEAR" sx={{ bgcolor: "#f9fafb", color: "#4b5563", fontWeight: 500 }} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: "#9ca3af" }}>
                    No incoming sensor historical telemetry available yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

/* ---------------- METRIC CARD ---------------- */

function MetricCard({ 
  label, 
  value, 
  highlight = false 
}: { 
  label: string; 
  value: string; 
  highlight?: boolean; 
}) {
  return (
    <Card sx={{
      ...cardStyle,
      transition: "all 0.3s ease",
      borderColor: highlight ? "#f87171" : "#e5e7eb",
      backgroundColor: highlight ? "#fef2f2 !important" : "#ffffff !important"
    }}>
      <CardContent>
        <Typography sx={{ fontSize: 12, color: highlight ? "#991b1b" : "#6b7280", fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography sx={{ 
          fontSize: 24, 
          fontWeight: 700, 
          mt: 1, 
          color: highlight ? "#dc2626" : "#111827",
        }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

/* ---------------- GLOBAL COMPONENT STYLE OBJECT ---------------- */

const cardStyle = {
  backgroundColor: "#ffffff !important",
  border: "1px solid #e5e7eb",
  borderRadius: 3,
  boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
  "& .MuiCardContent-root": {
    backgroundColor: "#ffffff",
  }
};