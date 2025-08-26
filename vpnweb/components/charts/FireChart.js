'use client';
import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';

// Fire color palette
const FIRE_COLORS = [
  '#ff4500', '#ff6347', '#ff8c00', '#ffa500', '#dc2626',
  '#ef4444', '#f97316', '#fb923c', '#fdba74', '#fed7aa'
];

const EMBER_COLORS = [
  '#7f1d1d', '#991b1b', '#dc2626', '#ef4444', '#f87171'
];

// Custom tooltip component
const FireTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        sx={{
          p: 2,
          background: 'rgba(26, 26, 26, 0.95)',
          border: '1px solid #ff4500',
          borderRadius: '8px',
          boxShadow: '0 0 20px rgba(255, 69, 0, 0.6)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{
              color: entry.color,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: entry.color,
                boxShadow: `0 0 10px ${entry.color}`
              }}
            />
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// Area Chart Component
export const FireAreaChart = ({ data, title, height = 300 }) => {
  // Validar y limpiar datos
  const validData = Array.isArray(data) ? data : [];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Paper className="chart-container">
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}
        >
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={validData}>
            <defs>
              <linearGradient id="fireGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff4500" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 69, 0, 0.2)" />
            <XAxis
              dataKey="name"
              stroke="#fff"
              fontSize={12}
              tick={{ fill: '#fff' }}
            />
            <YAxis
              stroke="#fff"
              fontSize={12}
              tick={{ fill: '#fff' }}
            />
            <Tooltip content={<FireTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#ff4500"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#fireGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>
    </motion.div>
  );
};

// Bar Chart Component
export const FireBarChart = ({ data, title, height = 300 }) => {
  // Validar y limpiar datos
  const validData = Array.isArray(data) ? data : [];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper className="chart-container">
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}
        >
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={validData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 69, 0, 0.2)" />
            <XAxis
              dataKey="name"
              stroke="#fff"
              fontSize={12}
              tick={{ fill: '#fff' }}
            />
            <YAxis
              stroke="#fff"
              fontSize={12}
              tick={{ fill: '#fff' }}
            />
            <Tooltip content={<FireTooltip />} />
            <Bar
              dataKey="value"
              fill="url(#fireBarGradient)"
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="fireBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff4500" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </motion.div>
  );
};

// Line Chart Component
export const FireLineChart = ({ data, title, height = 300, lines = [] }) => {
  // Validar y limpiar datos
  const validData = Array.isArray(data) ? data : [];
  const validLines = Array.isArray(lines) ? lines : [];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper className="chart-container">
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}
        >
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={validData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 69, 0, 0.2)" />
            <XAxis
              dataKey="name"
              stroke="#fff"
              fontSize={12}
              tick={{ fill: '#fff' }}
            />
            <YAxis
              stroke="#fff"
              fontSize={12}
              tick={{ fill: '#fff' }}
            />
            <Tooltip content={<FireTooltip />} />
            <Legend />
            {validLines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.key}
                stroke={FIRE_COLORS[index % FIRE_COLORS.length]}
                strokeWidth={3}
                dot={{ r: 6, fill: FIRE_COLORS[index % FIRE_COLORS.length] }}
                activeDot={{ r: 8, stroke: FIRE_COLORS[index % FIRE_COLORS.length], strokeWidth: 2, fill: '#fff' }}
                name={line.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </motion.div>
  );
};

// Pie Chart Component
export const FirePieChart = ({ data, title, height = 300 }) => {
  // Validar y limpiar datos
  const validData = Array.isArray(data) ? data : [];
  
  const RADIAN = Math.PI / 180;
  
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
        textShadow="0 1px 3px rgba(0,0,0,0.8)"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Paper className="chart-container">
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={validData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {validData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={FIRE_COLORS[index % FIRE_COLORS.length]}
                  style={{
                    filter: `drop-shadow(0 0 10px ${FIRE_COLORS[index % FIRE_COLORS.length]})`
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<FireTooltip />} />
            <Legend
              wrapperStyle={{
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Paper>
    </motion.div>
  );
};

// Real-time data generator for demo
export const useRealtimeData = (initialData = [], updateInterval = 3000) => {
  const [data, setData] = useState(() => {
    // Asegurar que initialData es un array válido
    if (!Array.isArray(initialData)) {
      return [];
    }
    return initialData;
  });

  useEffect(() => {
    // Solo configurar intervalo si tenemos datos válidos
    if (!Array.isArray(data) || data.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setData(prevData => {
        if (!Array.isArray(prevData)) {
          return [];
        }
        
        return prevData.map(item => {
          if (typeof item === 'object' && item !== null) {
            return {
              ...item,
              value: Math.max(0, (item.value || 0) + (Math.random() - 0.5) * 20)
            };
          }
          return item;
        });
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval, data.length]);

  return data;
};

export default {
  FireAreaChart,
  FireBarChart,
  FireLineChart,
  FirePieChart,
  useRealtimeData
};
