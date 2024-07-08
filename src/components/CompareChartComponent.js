import React, { useRef } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { Button } from "antd";
import { RollbackOutlined, RedoOutlined } from "@ant-design/icons";

ChartJS.register(...registerables, zoomPlugin);

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const CompareChartComponent = ({ selectedHeaders, fileData, onBack }) => {
  const chartRef = useRef(null);

  const processData = (headers) => {
    const datasets = headers.map((header) => {
      const data = fileData.map((row) => row[header]);
      const isNumeric = data.every((item) => !isNaN(parseFloat(item)));

      const backgroundColor = getRandomColor();
      const borderColor = backgroundColor;

      if (isNumeric) {
        return {
          label: header,
          data,
          backgroundColor,
          borderColor,
          borderWidth: 1,
          fill: true,
        };
      } else {
        const counts = {};
        data.forEach((item) => (counts[item] = (counts[item] || 0) + 1));

        return {
          label: header,
          data: Object.values(counts),
          backgroundColor,
          borderColor,
          borderWidth: 1,
          fill: false,
        };
      }
    });

    const labels = fileData.map((row, index) => `Row ${index + 1}`);

    return {
      labels,
      datasets,
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Comparison Chart for Selected Headers`,
      },
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const { dataset, dataIndex } = context;
            const value = fileData[dataIndex][dataset.label];
            return `${dataset.label}: ${value}`;
          },
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "xy",
          threshold: 5,
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "xy",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          beginAtZero: true,
        },
      },
    },
  };

  const chartData = processData(selectedHeaders);

  const resetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  return (
    <div>
      {selectedHeaders.length > 0 && (
        <p>Selected Headers: {selectedHeaders.join(", ")}</p>
      )}
      <Button
        onClick={onBack}
        style={{ margin: "10px" }}
        icon={<RollbackOutlined />}
      >
        Back to Charts
      </Button>
      <Button
        onClick={resetZoom}
        style={{ margin: "10px" }}
        icon={<RedoOutlined />}
      >
        Reset Zoom
      </Button>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div
          className="chart-wrapper"
          style={{
            width: "200vh",
            height: "100vh",
            marginTop: "20px",
            marginLeft: "0",
          }}
        >
          <Line
            ref={chartRef}
            data={chartData}
            options={chartOptions}
            width={1000}
            height={500}
          />
        </div>
      </div>
    </div>
  );
};

export default CompareChartComponent;
