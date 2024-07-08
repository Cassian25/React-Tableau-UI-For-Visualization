import React, { useRef, useState, useEffect } from "react";
import {
  Bar,
  Bubble,
  Line,
  Pie,
  PolarArea,
  Radar,
  Scatter,
} from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { Button, Select } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import RawOnOutlinedIcon from "@mui/icons-material/RawOnOutlined";
import DataArraySharpIcon from "@mui/icons-material/DataArraySharp";
import { DraggableCore } from "react-draggable";
import { evaluate, create, all } from "mathjs";

const math = create(all);
ChartJS.register(...registerables, zoomPlugin);

const { Option } = Select;

const ChartComponent = ({
  graphType,
  aggregationFunction,
  droppedHeaders,
  fileData,
}) => {
  const chartRefs = useRef([]);
  const [displayMode, setDisplayMode] = useState("raw");
  const [aggregatedGraphType, setAggregatedGraphType] = useState("bar");

  useEffect(() => {
    console.log("Aggregation Function: ", aggregationFunction);
    console.log("Dropped Headers: ", droppedHeaders);
  }, [aggregationFunction, droppedHeaders]);

  const isNumeric = (n) => !isNaN(parseFloat(n)) && isFinite(n);

  const calculateAggregation = (header, aggregation, fileData, percentage) => {
    const data = fileData
      .map((row) => row[header])
      .filter((item) => item !== null && item !== undefined);
    console.log(`Calculating ${aggregation} for header ${header}:`, data);

    if (data.length === 0) {
      return "No data available";
    }

    switch (aggregation) {
      case "Concat":
        return data.join("");
      case "Count":
        return data.length;
      case "CountDistinct":
        return new Set(data.map(String)).size;
      case "Mode":
        const frequency = {};
        data.forEach((value) => {
          const key =
            value !== undefined && value !== null
              ? value.toString()
              : "null/undefined";
          frequency[key] = (frequency[key] || 0) + 1;
        });
        const maxFreq = Math.max(...Object.values(frequency));
        const modeValues = Object.keys(frequency).filter(
          (key) => frequency[key] === maxFreq
        );
        return modeValues.join(", ");
      case "Minimum":
        if (data.every((d) => typeof d === "number")) {
          return Math.min(...data.map(Number));
        } else {
          return data.slice().sort((a, b) => {
            if (typeof a === "string" && typeof b === "string") {
              return a.localeCompare(b);
            } else if (typeof a === "number" && typeof b === "string") {
              return -1;
            } else if (typeof a === "string" && typeof b === "number") {
              return 1;
            } else {
              return a - b;
            }
          })[0];
        }
      case "Maximum":
        if (data.every((d) => typeof d === "number")) {
          return Math.max(...data.map(Number));
        } else {
          return data.slice().sort((a, b) => {
            if (typeof a === "string" && typeof b === "string") {
              return b.localeCompare(a);
            } else if (typeof a === "number" && typeof b === "string") {
              return 1;
            } else if (typeof a === "string" && typeof b === "number") {
              return -1;
            } else {
              return b - a;
            }
          })[0];
        }
      case "Sum":
        let sum = 0;
        for (const value of data) {
          if (typeof value === "number") {
            sum += value;
          } else if (typeof value === "string") {
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue)) {
              sum += numericValue;
            } else if (value.length === 1) {
              sum += value.charCodeAt(0);
            } else {
              sum += value.length;
            }
          } else if (typeof value === "boolean") {
            sum += value ? 1 : 0;
          } else if (typeof value === "object") {
            sum += Object.keys(value).length;
          }
        }
        return sum;
      case "Average":
        const getValue = (item) => {
          if (typeof item === "number") return item;
          if (typeof item === "string") return item.length;
          if (typeof item === "boolean") return item ? 1 : 0;
          if (item instanceof Date) return item.getTime();
          if (typeof item === "object") return JSON.stringify(item).length;
          return 0;
        };
        return data.reduce((acc, val) => acc + getValue(val), 0) / data.length;
      case "Median":
        const sortedData = data.slice().sort((a, b) => {
          if (typeof a === "number" && typeof b === "number") {
            return a - b;
          } else if (typeof a === "string" && typeof b === "string") {
            return a.localeCompare(b);
          } else if (typeof a === "object" && typeof b === "object") {
            return new Date(a) - new Date(b);
          } else if (typeof a === "number" && typeof b === "string") {
            return a - new Date(b).getTime();
          } else if (typeof a === "string" && typeof b === "number") {
            return new Date(a).getTime() - b;
          } else if (typeof a === "object" && typeof b === "string") {
            return new Date(a) - new Date(b).getTime();
          } else if (typeof a === "string" && typeof b === "object") {
            return new Date(a).getTime() - new Date(b);
          } else {
            return String(a).localeCompare(String(b));
          }
        });
        const middleIndex = Math.floor(sortedData.length / 2);
        if (sortedData.length % 2 === 0) {
          return (sortedData[middleIndex - 1] + sortedData[middleIndex]) / 2;
        } else {
          return sortedData[middleIndex];
        }
      case "Range":
        const convertedValues = data.map((value) => {
          if (typeof value === "number") return value;
          if (typeof value === "string")
            return isNumeric(value) ? Number(value) : value.length;
          if (typeof value === "boolean") return value ? 1 : 0;
          if (value instanceof Date) return value.getTime();
          if (typeof value === "object") return JSON.stringify(value).length;
          return 0;
        });
        const minValue = math.min(convertedValues);
        const maxValue = math.max(convertedValues);
        const rangeValue = maxValue - minValue;
        console.log(`Range: ${rangeValue}, Min: ${minValue}, Max: ${maxValue}`);
        return rangeValue;
      case "Attribute":
        const uniqueValues = new Set(
          data.map((x) => (typeof x === "object" ? JSON.stringify(x) : x))
        );
        return Array.from(uniqueValues)[0];
      case "Percentage":
        const numericData = data
          .map((x) => {
            try {
              if (typeof x === "number") {
                return x;
              } else if (typeof x === "string") {
                const result = math.evaluate(x);
                return typeof result === "number" ? result : parseFloat(result);
              } else {
                return undefined;
              }
            } catch (error) {
              console.error(error);
              return undefined;
            }
          })
          .filter((x) => typeof x !== "undefined" && !isNaN(x));
        if (numericData.length > 0) {
          const sum = math.sum(numericData);
          if (math.equal(sum, 0)) {
            return "0%";
          } else {
            const lastValue = numericData[numericData.length - 1];
            const percentageValue = math.divide(lastValue, sum) * 100;
            const percentage =
              math.isNaN(percentageValue) ||
              math.equal(percentageValue, math.infinity)
                ? 0
                : percentageValue.toFixed(2);
            return ` ${percentage}%`;
          }
        } else {
          return "0%";
        }
      default:
        return "Unknown aggregation function";
    }
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  const hashFunction = (str) => {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; str.length > i; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash;
    }
    return hash;
  };

  const processData = (header) => {
    const data = fileData.map((row) => row[header]);
    const allNumeric = data.every(isNumeric);
    const backgroundColor = getRandomColor();
    const borderColor = backgroundColor;
    const labels = fileData.map((row) => row["Index"]);
    if (allNumeric) {
      return {
        labels,
        datasets: [
          {
            label: header,
            data,
            backgroundColor,
            borderColor,
            borderWidth: 1,
          },
        ],
      };
    } else {
      const counts = {};
      data.forEach((item) => {
        const key =
          item !== undefined && item !== null
            ? item.toString()
            : "null/undefined";
        counts[key] = (counts[key] || 0) + 1;
      });
      return {
        labels: Object.keys(counts),
        datasets: [
          {
            label: header,
            data: Object.values(counts),
            backgroundColor,
            borderColor,
            borderWidth: 1,
          },
        ],
      };
    }
  };

  const processDataForAggregation = (headers) => {
    const labels = headers;
    const datasets = [
      {
        label: `${aggregationFunction} of Headers`,
        backgroundColor: headers.map(() => getRandomColor()),
        borderColor: headers.map(() => getRandomColor()),
        borderWidth: 1,
        data: headers.map((header) => {
          const aggregationResult = calculateAggregation(
            header,
            aggregationFunction,
            fileData
          );
          console.log(
            `Aggregation Result for ${header} with ${aggregationFunction}:`,
            aggregationResult
          );
          if (typeof aggregationResult === "number") {
            return aggregationResult;
          } else if (typeof aggregationResult === "string") {
            return aggregationResult.length;
          } else {
            return 0;
          }
        }),
        fill: true,
      },
    ];
    return { labels, datasets };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text:
          displayMode === "aggregated"
            ? "Aggregated Graphs"
            : `Data Of Each Header`,
      },
      legend: {
        position: "top",
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "xy",
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
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const datasetLabel = tooltipItem.dataset.label || "";
            const dataLabel = tooltipItem.raw;
            if (displayMode === "aggregated") {
              const aggregationResult = calculateAggregation(
                tooltipItem.label,
                aggregationFunction,
                fileData
              );
              return `${aggregationFunction} of ${tooltipItem.label}: ${aggregationResult}`;
            } else {
              return `${datasetLabel}: ${dataLabel}`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        type: "category",
        grid: {
          tickColor: "red",
        },
        ticks: {
          color: "red",
        },
        title: {
          display: true,
          text: "Category",
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        title: {
          display: true,
          text: "Value",
        },
        beginAtZero: true,
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
    },
    onHover: (event, chartElement) => {
      event.native.target.style.cursor = chartElement[0]
        ? "pointer"
        : "default";
    },
  };

  const resetZoom = () => {
    chartRefs.current.forEach((chart) => {
      if (chart) {
        chart.resetZoom();
      }
    });
  };

  const renderChart = (header, index) => {
    const chartData =
      displayMode === "aggregated"
        ? processDataForAggregation(droppedHeaders)
        : processData(header);

    const chartOptionsWithTitle = {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        title: {
          display: true,
          text: `Chart for ${header}`,
        },
      },
    };

    const chartContainerStyle = {
      width: "800px",
      height: "700px",
      marginBottom: "20px",
      marginLeft: "150px",
    };

    const chartComponent = (ChartComponent) => (
      <DraggableCore>
        <div>
          <ChartComponent
            ref={(el) => (chartRefs.current[index] = el)}
            data={chartData}
            options={chartOptionsWithTitle}
          />
        </div>
      </DraggableCore>
    );

    return (
      <div key={index} style={chartContainerStyle}>
        {(() => {
          switch (graphType) {
            case "line":
              return chartComponent(Line);
            case "bar":
              return chartComponent(Bar);
            case "pie":
              return chartComponent(Pie);
            case "polarArea":
              return chartComponent(PolarArea);
            case "radar":
              return chartComponent(Radar);
            case "scatter":
              return chartComponent(Scatter);
            case "area":
              return chartComponent((props) => (
                <Line
                  {...props}
                  data={{
                    ...chartData,
                    datasets: chartData.datasets.map((dataset) => ({
                      ...dataset,
                      fill: true,
                    })),
                  }}
                />
              ));
            case "bubble":
              return chartComponent(Bubble);
            default:
              return null;
          }
        })()}
      </div>
    );
  };

  const handleAggregatedGraphTypeChange = (value) => {
    setAggregatedGraphType(value);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          margin: "20px 0",
        }}
      >
        <Button onClick={resetZoom} icon={<RedoOutlined />}>
          Reset Zoom
        </Button>
        <Button onClick={() => setDisplayMode("raw")}>
          <RawOnOutlinedIcon />
          Show Raw Data
        </Button>
        <Button
          onClick={() => setDisplayMode("aggregated")}
          icon={<DataArraySharpIcon />}
        >
          Show Aggregated Data
        </Button>
      </div>

      <div className="chart-wrapper" style={{ marginBottom: "20px" }}>
        {displayMode === "aggregated"
          ? renderChart(droppedHeaders[0], 0)
          : droppedHeaders.map((header, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                {renderChart(header, index)}
              </div>
            ))}
      </div>
    </div>
  );
};

export default ChartComponent;
