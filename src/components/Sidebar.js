import React, { useEffect, useState, lazy, Suspense } from "react";
import { Upload, Button, message, Tooltip } from "antd";
import {
  UploadOutlined,
  PieChartTwoTone,
  DatabaseFilled,
} from "@ant-design/icons";
import Lottie from "lottie-react";
import animationData from "../Animation.json";

const LottieAnimation = lazy(() => import("lottie-react"));

const Sidebar = ({
  headers,
  onFileUpload,
  onShowCharts,
  onShowModal,
  onClearData,
}) => {
  const [showHeaders, setShowHeaders] = useState(false);
  const [headerItems, setHeaderItems] = useState([]);    
  const animationDuration = (animationData.op / animationData.fr) * 1000;

  const handleCustomRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
      onClearData();
      onFileUpload(file);
      message.success({
        content: "File uploaded successfully!",
        className: "custom-message",
        icon: (
          <Suspense fallback={<div>Loading animation...</div>}>
            <LottieAnimation
              animationData={animationData}
              style={{ width: 50, height: 50 }}
              loop={false}
            />
          </Suspense>
        ),
        style: {
          marginTop: "20px",
          fontSize: "16px",
        },
        duration: 6,
      });
      setTimeout(() => {
        setShowHeaders(true);
      }, animationDuration);
    }, 1000);
  };

  useEffect(() => {
    if (showHeaders) {
      const newHeaderItems = headers.map((header, index) => (
        <div
          key={header}
          draggable
          onDragStart={(e) => e.dataTransfer.setData("text/plain", header)}
          className="header-item"
          style={{
            padding: "5px",
            border: "1px solid #ccc",
            margin: "5px 0",
            cursor: "pointer",
          }}
        >
          {header}
        </div>
      ));
      setHeaderItems(newHeaderItems);

      const timeoutIds = newHeaderItems.map((_, index) =>
        setTimeout(() => {
          const elements = document.querySelectorAll(".header-item");
          if (elements[index]) {
            elements[index].classList.add("appear");
          }
        }, index * 100)
      );

      return () => {
        timeoutIds.forEach(clearTimeout);
      };
    }
  }, [showHeaders, headers]);

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "lightgrey",
        minHeight: "100vh",
        width: "250px",
      }}
    >
      <Upload
        name="file"
        headers={{ authorization: "authorization-text" }}
        beforeUpload={(file) => {
          const isCsvOrXlsx =
            file.type ===
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.type === "text/csv";
          if (!isCsvOrXlsx) {
            message.error("You can only upload CSV/XLSX files!");
          }
          return isCsvOrXlsx || Upload.LIST_IGNORE;
        }}
        customRequest={handleCustomRequest}
      >
        <Tooltip title="Upload data file">
          <Button icon={<UploadOutlined />}>Upload Data</Button>
        </Tooltip>
      </Upload>
      <div
        style={{
          margin: "20px 0",
          transition: "max-height 0.5s ease-in-out",
          maxHeight: showHeaders ? "150%" : "0",
          overflow: "hidden",
        }}
      >
        <h3>Headers</h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxHeight: "600px",
            overflowY: "auto",
          }}
        >
          {headerItems}
        </div>
      </div>
      <Button
        onClick={onShowCharts}
        style={{ margin: "10px" }}
        icon={<PieChartTwoTone />}
      >
        View Charts
      </Button>
      <Button
        onClick={onShowModal}
        style={{ margin: "10px" }}
        icon={<DatabaseFilled />}
      >
        Full Data
      </Button>
    </div>
  );
};

export default Sidebar;
