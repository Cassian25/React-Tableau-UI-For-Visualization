import React from "react";

const HeaderPill = ({ header, onDrop }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", header);
  };

  return (
    <div className="header-pill" draggable onDragStart={handleDragStart}>
      {header}
    </div>
  );
};

export default HeaderPill;
