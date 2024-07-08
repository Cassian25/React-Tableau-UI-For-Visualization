import React, { useState } from "react";
import { Modal, Button, Tooltip, Table } from "antd";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

const ResizableTableModal = ({
  isModalVisible,
  handleOk,
  handleCancel,
  handleDownloadAll,
  fileData,
  headers,
}) => {
  const [containerHeight, setContainerHeight] = useState(650);
  const [containerWidth, setContainerWidth] = useState(1000);

  const onResize = (event, { element, size }) => {
    setContainerHeight(size.height);
    setContainerWidth(size.width);
  };

  return (
    <Modal
      title="Uploaded File Data"
      open={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={containerWidth + 50}
      height={containerHeight + 150}
      style={{ top: "50%", transform: "translateY(-50%)" }}
      footer={[
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <Tooltip title="Download the data in CSV format" key="downloadCSV">
            <Button onClick={() => handleDownloadAll("csv")}>
              Download CSV
            </Button>
          </Tooltip>

          <Tooltip title="Download the data in Excel format" key="downloadXLSX">
            <Button onClick={() => handleDownloadAll("xlsx")}>
              Download XLSX
            </Button>
          </Tooltip>

          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>
        </div>,
      ]}
    >
      <ResizableBox
        width={containerWidth}
        height={containerHeight}
        minConstraints={[300, 300]}
        maxConstraints={[1500, 1500]}
        onResize={onResize}
        resizeHandles={["se"]}
        style={{ border: "1px solid #ccc", padding: "10px" }}
      >
        <Table
          dataSource={fileData}
          columns={headers.map((header) => ({
            title: header,
            dataIndex: header,
            className: "table-cell-border",
          }))}
          pagination={true}
          style={{ width: "100%", height: "100%" }}
          scroll={{ y: containerHeight - 100 }}
        />
      </ResizableBox>
    </Modal>
  );
};

export default ResizableTableModal;
