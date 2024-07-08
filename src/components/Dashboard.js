import React, {
  useState,
  useMemo,
  useCallback,
  lazy,
  Suspense,
  useEffect,
} from "react";
import {
  Layout,
  Button,
  Modal,
  Table,
  Menu,
  Dropdown,
  Checkbox,
  message,
  Tooltip,
} from "antd";
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RadarChartOutlined,
  FunctionOutlined,
  RollbackOutlined,
  CodeSandboxOutlined,
} from "@ant-design/icons";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import ParkOutlinedIcon from "@mui/icons-material/ParkOutlined";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import CropDinIcon from "@mui/icons-material/CropDin";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import ResizableTableModal from "./ResizableTableModal";

import "react-resizable/css/styles.css";
const { Sider, Content } = Layout;

const Sidebar = lazy(() => import("./Sidebar"));
const DropArea = lazy(() => import("./DropArea"));
const ChartComponent = lazy(() => import("./ChartComponent"));
const CompareChartComponent = lazy(() => import("./CompareChartComponent"));

const graphTypes = [
  { key: "bar", label: "Bar Chart", icon: <BarChartOutlined /> },
  { key: "line", label: "Line Chart", icon: <LineChartOutlined /> },
  { key: "pie", label: "Pie Chart", icon: <PieChartOutlined /> },
  { key: "polarArea", label: "Polar Area Chart", icon: <RadarChartOutlined /> },
  { key: "radar", label: "Radar Chart", icon: <ParkOutlinedIcon /> },
  { key: "scatter", label: "Scatter Chart", icon: <ScatterPlotIcon /> },
  { key: "area", label: "Area Chart", icon: <CropDinIcon /> },
  { key: "bubble", label: "Bubble Chart", icon: <BubbleChartIcon /> },
];

const aggregationFunctions = [
  "Concat",
  "Count",
  "CountDistinct",
  "Mode",
  "Minimum",
  "Maximum",
  "Sum",
  "Average",
  "Median",
  "Range",
  "Attribute",
  "Percentage",
];

const Dashboard = () => {
  const [fileData, setFileData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [droppedHeaders, setDroppedHeaders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedGraphType, setSelectedGraphType] = useState("bar");
  const [selectedAggregation, setSelectedAggregation] = useState("");
  const [selectedHeaders, setSelectedHeaders] = useState([]);
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [checkedHeaders, setCheckedHeaders] = useState([]);
  const [socket, setSocket] = useState(null);
  const [containerHeight, setContainerHeight] = useState(600);
  const [containerWidth, setContainerWidth] = useState(1100);

  const onResize = (event, { element, size }) => {
    setContainerHeight(size.height);
    setContainerWidth(size.width);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (socket) socket.close();
      } else if (document.visibilityState === "visible") {
        connectWebSocket();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (socket) socket.close();
    };
  }, [socket]);

  const connectWebSocket = () => {
    const newSocket = new WebSocket("ws://localhost:3000");
    newSocket.onopen = () => console.log("WebSocket connected");
    newSocket.onclose = () => console.log("WebSocket disconnected");
    setSocket(newSocket);
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (socket) socket.close();
    };
  }, []);

  const handleFileUpload = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = e.target.result;
      if (file.type === "text/csv") {
        Papa.parse(fileData, {
          header: true,
          complete: (results) => {
            clearPreviousData();
            setFileData(results.data);
            setFilteredData(results.data);
            setHeaders(Object.keys(results.data[0] || {}));
          },
        });
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        const workbook = XLSX.read(fileData, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const [headerRow, ...contentRows] = data;
        clearPreviousData();
        setFileData(contentRows);
        setFilteredData(contentRows);
        setHeaders(headerRow);
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  const clearPreviousData = useCallback(() => {
    setDroppedHeaders([]);
    setShowCharts(false);
    setShowCompare(false);
    setSelectedHeaders([]);
    setCompareModalVisible(false);
    setCheckedHeaders([]);
  }, []);

  const handleHeaderDrop = useCallback((header) => {
    setDroppedHeaders((prev) => [...prev, header]);
  }, []);

  const handleFilterApply = useCallback(
    (header, filters) => {
      const newData = fileData.filter((row) => filters.includes(row[header]));
      setFilteredData(newData);
      setFilteredData((prevFilteredData) => {
        return prevFilteredData.map((row) => {
          const newRow = { ...row };
          if (!filters.includes(row[header])) {
            delete newRow[header];
          }
          return newRow;
        });
      });
    },
    [fileData]
  );

  const handleFilterClear = useCallback(() => {
    setFilteredData(fileData);
  }, [fileData]);

  const handleDeleteHeader = useCallback((header) => {
    setDroppedHeaders((prev) => prev.filter((h) => h !== header));
  }, []);

  const handleViewCharts = useCallback(() => {
    setShowCharts(true);
  }, []);

  const handleBackToTable = useCallback(() => {
    setShowCharts(false);
  }, []);

  const handleCompare = useCallback(() => {
    setCompareModalVisible(true);
  }, []);

  const handleCompareOk = useCallback(() => {
    if (checkedHeaders.length === 0) {
      message.warning("Please select at least one checkbox to continue.");
      return;
    }
    setSelectedHeaders(checkedHeaders);
    setShowCompare(true);
    setCompareModalVisible(false);
  }, [checkedHeaders]);

  const handleCompareCancel = useCallback(() => {
    setCompareModalVisible(false);
  }, []);

  const handleReset = useCallback(() => {
    setCheckedHeaders([]);
    setSelectedHeaders([]);
  }, []);

  const handleBackToCharts = useCallback(() => {
    setShowCompare(false);
  }, []);

  const handleCheckboxChange = useCallback((header, checked) => {
    setCheckedHeaders((prev) =>
      checked ? [...prev, header] : prev.filter((h) => h !== header)
    );
  }, []);

  const showModal = useCallback(() => {
    if (fileData.length === 0) {
      message.error(
        "No data uploaded. Please upload data to see the whole data."
      );
      return;
    }
    setIsModalVisible(true);
  }, [fileData]);

  const handleOk = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handleDownloadAll = useCallback(
    (format) => {
      if (fileData.length === 0) {
        message.error("No data uploaded. Please upload data to download.");
        return;
      }

      if (format === "csv") {
        const csv = Papa.unparse(fileData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        saveAs(blob, "all_data.csv");
      } else if (format === "xlsx") {
        const worksheet = XLSX.utils.json_to_sheet(fileData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        const blob = new Blob(
          [XLSX.write(workbook, { bookType: "xlsx", type: "array" })],
          { type: "application/octet-stream" }
        );
        saveAs(blob, "all_data.xlsx");
      } else {
        message.error("Unsupported format. Please select either CSV or XLSX.");
      }
    },
    [fileData]
  );

  const handleGraphTypeChange = useCallback(({ key }) => {
    setSelectedGraphType(key);
  }, []);

  const handleAggregationChange = useCallback(({ key }) => {
    setSelectedAggregation(key);
  }, []);

  const graphMenu = useMemo(
    () => (
      <Menu onClick={handleGraphTypeChange}>
        {graphTypes.map((graph) => (
          <Menu.Item key={graph.key} icon={graph.icon}>
            {graph.label}
          </Menu.Item>
        ))}
      </Menu>
    ),
    [handleGraphTypeChange]
  );

  const aggregationMenu = useMemo(
    () => (
      <Menu onClick={handleAggregationChange}>
        {aggregationFunctions.map((func) => (
          <Menu.Item key={func} icon={<FunctionOutlined />}>
            {func}
          </Menu.Item>
        ))}
      </Menu>
    ),
    [handleAggregationChange]
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Suspense fallback={<div>Loading...</div>}>
          <Sider width={250} className="site-layout-background" id="sidebar">
            <Sidebar
              headers={headers}
              onFileUpload={handleFileUpload}
              onHeaderDrop={handleHeaderDrop}
              onShowCharts={handleViewCharts}
              onShowModal={showModal}
              onClearData={clearPreviousData}
            />
          </Sider>
        </Suspense>
        <Layout style={{ marginLeft: 250 }}>
          <Content style={{ padding: "20px" }}>
            <Suspense fallback={<div>Loading...</div>}>
              <div id="drop-area">
                <DropArea
                  droppedHeaders={droppedHeaders}
                  onDrop={handleHeaderDrop}
                  fileData={fileData}
                  onFilterApply={handleFilterApply}
                  onFilterClear={handleFilterClear}
                  onDeleteHeader={handleDeleteHeader}
                />
              </div>
            </Suspense>
            {showCharts && (
              <div style={{ marginTop: "20px" }}>
                <Tooltip title="Select the type of graph you want to display">
                  <Dropdown overlay={graphMenu}>
                    <Button style={{ margin: "10px" }}>
                      <BarChartOutlined />
                      Select Graph Type
                    </Button>
                  </Dropdown>
                </Tooltip>
                <Tooltip title="Select the function for data aggregation">
                  <Dropdown overlay={aggregationMenu}>
                    <Button style={{ margin: "10px" }}>
                      <FunctionOutlined />
                      Select Aggregation Function
                    </Button>
                  </Dropdown>
                </Tooltip>
                <Tooltip title="Go back to the data table view">
                  <Button
                    onClick={handleBackToTable}
                    style={{ margin: "10px" }}
                  >
                    <RollbackOutlined />
                    Back to Table
                  </Button>
                </Tooltip>
                <Tooltip title="Compare different data sets">
                  <Button onClick={handleCompare} style={{ margin: "10px" }}>
                    <CodeSandboxOutlined />
                    Compare
                  </Button>
                </Tooltip>
              </div>
            )}
            {showCharts && !showCompare ? (
              <div className="chart-container">
                <Suspense fallback={<div>Loading...</div>}>
                  <ChartComponent
                    graphType={selectedGraphType}
                    aggregationFunction={selectedAggregation}
                    droppedHeaders={droppedHeaders}
                    fileData={filteredData}
                  />
                </Suspense>
              </div>
            ) : showCompare ? (
              <div className="chart-container">
                <Suspense fallback={<div>Loading...</div>}>
                  <CompareChartComponent
                    selectedHeaders={selectedHeaders}
                    fileData={fileData}
                    onBack={handleBackToCharts}
                  />
                </Suspense>
              </div>
            ) : (
              <Table
                dataSource={filteredData}
                columns={droppedHeaders.map((header) => ({
                  title: header,
                  dataIndex: header,
                }))}
                pagination={false}
                scroll={{ y: 500 }}
              />
            )}
            <ResizableTableModal
              isModalVisible={isModalVisible}
              handleOk={handleOk}
              handleCancel={handleCancel}
              handleDownloadAll={handleDownloadAll}
              fileData={fileData}
              headers={headers}
            />

            <Modal
              title="Select Headers to Compare"
              open={compareModalVisible}
              onOk={handleCompareOk}
              onCancel={handleCompareCancel}
              footer={[
                <Button key="reset" onClick={handleReset}>
                  Reset
                </Button>,
                <Button key="cancel" onClick={handleCompareCancel}>
                  Cancel
                </Button>,
                <Button key="ok" type="primary" onClick={handleCompareOk}>
                  OK
                </Button>,
              ]}
            >
              {headers.map((header) => (
                <Checkbox
                  key={header}
                  onChange={(e) =>
                    handleCheckboxChange(header, e.target.checked)
                  }
                  checked={checkedHeaders.includes(header)}
                >
                  {header}
                </Checkbox>
              ))}
            </Modal>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
