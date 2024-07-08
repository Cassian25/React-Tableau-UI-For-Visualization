import React, { useState, useEffect, useRef } from "react";
import { Menu, Modal, Input, Checkbox, Button, message } from "antd";
import {
  DownloadOutlined,
  FilterOutlined,
  ClearOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Papa from "papaparse";
import { saveAs } from "file-saver";

const DropArea = ({
  droppedHeaders,
  onDrop,
  fileData,
  onFilterApply,
  onFilterClear,
  onDeleteHeader,
}) => {
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [selectedHeader, setSelectedHeader] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterValues, setFilterValues] = useState([]);
  const [displayedFilterValues, setDisplayedFilterValues] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const contextMenuRef = useRef(null);

  const handleDrop = (e) => {
    const header = e.dataTransfer.getData("text/plain");
    onDrop(header);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleContextMenu = (e, header) => {
    e.preventDefault();
    setContextMenuVisible(true);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setSelectedHeader(header);
  };

  const handleContextMenuClick = ({ key }) => {
    switch (key) {
      case "download":
        handleDownload(selectedHeader);
        break;
      case "filter":
        handleFilter(selectedHeader);
        break;
      case "clear":
        handleClearFilter(selectedHeader);
        break;
      case "delete":
        handleDelete(selectedHeader);
        break;
      default:
        break;
    }
    setContextMenuVisible(false);
  };

  const handleDownload = (header) => {
    const data = fileData.map((row) => ({ [header]: row[header] }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${header}.csv`);
  };

  const handleFilter = (header) => {
    const uniqueValues = [...new Set(fileData.map((row) => row[header]))];
    const filterValues = uniqueValues.map((value) => ({
      value,
      checked: selectedFilters.includes(value),
    }));
    setFilterValues(filterValues);
    setDisplayedFilterValues(filterValues);
    setSelectedFilters([]);
    setSearchQuery("");
    setFilterModalVisible(true);
  };

  const handleClearFilter = (header) => {
    if (!filtersApplied) {
      message.info("Nothing to clear.");
    } else {
      onFilterClear(header);
      setFiltersApplied(false);
      message.success("Filter cleared.");
    }
  };

  const handleDelete = (header) => {
    onDeleteHeader(header);
    message.success("Header deleted. Please drop any header for data.");
  };

  const handleFilterApply = () => {
    onFilterApply(selectedHeader, selectedFilters);
    setFiltersApplied(true);
    setFilterModalVisible(false);
  };

  const handleFilterReset = () => {
    setSelectedFilters([]);
    setFilterValues(filterValues.map((fv) => ({ ...fv, checked: false })));
  };

  const handleFilterCheckboxChange = (value, checked) => {
    const newSelectedFilters = checked
      ? [...selectedFilters, value]
      : selectedFilters.filter((filter) => filter !== value);
    setSelectedFilters(newSelectedFilters);
    setFilterValues(
      filterValues.map((fv) => (fv.value === value ? { ...fv, checked } : fv))
    );
    setDisplayedFilterValues(
      displayedFilterValues.map((fv) =>
        fv.value === value ? { ...fv, checked } : fv
      )
    );
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query) {
      const filtered = filterValues.filter(
        (fv) =>
          fv.value !== undefined &&
          fv.value !== null &&
          fv.value.toString().toLowerCase().includes(query.toLowerCase())
      );
      setDisplayedFilterValues(filtered);
    } else {
      setDisplayedFilterValues(filterValues);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target)
      ) {
        setContextMenuVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div
        className="drop-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onContextMenu={(e) => e.preventDefault()}
      >
        {droppedHeaders.map((header) => (
          <div
            key={header}
            className="dropped-header"
            onContextMenu={(e) => handleContextMenu(e, header)}
          >
            {header}
          </div>
        ))}
      </div>
      {contextMenuVisible && (
        <div
          className="context-menu-wrapper"
          style={{
            position: "absolute",
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
          ref={contextMenuRef}
        >
          <Menu className="context-menu" onClick={handleContextMenuClick}>
            <Menu.Item key="download" icon={<DownloadOutlined />}>
              Download
            </Menu.Item>
            <Menu.Item key="filter" icon={<FilterOutlined />}>
              Filter
            </Menu.Item>
            <Menu.Item key="clear" icon={<ClearOutlined />}>
              Clear Filter
            </Menu.Item>
            <Menu.Item key="delete" icon={<DeleteOutlined />}>
              Delete
            </Menu.Item>
          </Menu>
        </div>
      )}
      <Modal
        title={`Filter Data by ${selectedHeader}`}
        open={filterModalVisible}
        onCancel={() => setFilterModalVisible(false)}
        footer={[
          <Button key="apply" type="primary" onClick={handleFilterApply}>
            Apply
          </Button>,
          <Button key="cancel" onClick={() => setFilterModalVisible(false)}>
            Cancel
          </Button>,
        ]}
      >
        <Input.Search
          placeholder={`Search ${selectedHeader}`}
          onChange={handleSearch}
          value={searchQuery}
        />
        <Checkbox
          onChange={(e) => {
            const checked = e.target.checked;
            setSelectedFilters(
              checked ? filterValues.map((fv) => fv.value) : []
            );
            setFilterValues(filterValues.map((fv) => ({ ...fv, checked })));
            setDisplayedFilterValues(
              displayedFilterValues.map((fv) => ({ ...fv, checked }))
            );
          }}
          checked={selectedFilters.length === filterValues.length}
        >
          All
        </Checkbox>
        <div
          style={{ maxHeight: "300px", overflowY: "auto", marginTop: "10px" }}
        >
          {displayedFilterValues.length === 0 ? (
            <p>No matching items found for "{searchQuery}".</p>
          ) : (
            displayedFilterValues.map((fv) => (
              <div key={fv.value}>
                <Checkbox
                  checked={fv.checked}
                  onChange={(e) =>
                    handleFilterCheckboxChange(fv.value, e.target.checked)
                  }
                >
                  {fv.value}
                </Checkbox>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DropArea;
