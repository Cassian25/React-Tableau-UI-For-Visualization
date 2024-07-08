Here's the updated project description for your GitHub repository, including the feature of dragging and dropping headers from the sidebar into a container area to show the data of the dropped headers:

---

# React Tableau-Like Data Visualization Tool

Welcome to the **React Tableau-Like Data Visualization Tool**! This project is a powerful, flexible, and interactive data visualization tool built with React.js, inspired by Tableau. It offers a wide range of features including various aggregation functions, dynamic charts, extensive data manipulation capabilities, and more.

## Features

- **Aggregation Functions**: Perform various aggregation functions such as Sum, Average, Count, Count Distinct, Mode, Minimum, Maximum, Median, Range, and Percentage on your data.
- **Dynamic Charts**: Support for multiple chart types including Bar, Line, Pie, Polar Area, Radar, Scatter, and Bubble charts.
- **Interactive Data Manipulation**: Drag-and-drop functionality for headers, adjustable modal and table sizes, and real-time updates.
- **Drag-and-Drop Headers**: Upload your dataset to display the headers in the sidebar. Drag and drop headers into the designated container area to create a table or chart with the dropped headers' data.
- **Filters**: Apply various filters to your data to refine and focus your analysis.
- **Clear Data**: Easily clear data to reset your workspace and start fresh.
- **Data Export**: Download your data in CSV or Excel format directly from the application.
- **Pop-ups**: Use pop-up modals to display detailed information or additional options.
- **Responsive Design**: Ensures a seamless experience across different devices and screen sizes.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your local development machine:

- Node.js
- npm (Node Package Manager)

### Installation

1. **Clone the repository**:
    ```sh
    git clone https://github.com/yourusername/react-tableau-like-tool.git
    cd react-tableau-like-tool
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Start the development server**:
    ```sh
    npm start
    ```

## Usage

1. **Upload Data**: Start by uploading your dataset. The tool accepts various formats and automatically parses your data.

2. **Choose Aggregation Functions**: Select the aggregation functions you want to apply to your data from the available options.

3. **Create Charts and Tables**: Drag and drop headers from the sidebar into the designated container area to create dynamic and interactive charts or tables with the dragged headers' data. Customize the chart types and view real-time updates as you manipulate your data.

4. **Apply Filters**: Use the filtering options to narrow down your data and focus on specific subsets.

5. **Clear Data**: Reset your workspace with the clear data option to remove all current data and start anew.

6. **Export Data**: Download your manipulated data in CSV or Excel format for further analysis or reporting.

7. **Use Pop-ups**: Utilize pop-up modals to display additional information or provide extra functionalities.

## Components

### `App.js`
The entry point of the application, responsible for setting up routing and lazy loading the `Dashboard` component.

### `Dashboard.js`
The main interface where users interact with the tool, upload data, and create visualizations.

### `Sidebar.js`
Displays the headers of the uploaded data, allowing users to drag and drop them into the container area.

### `ContainerArea.js`
The area where users can drop headers from the sidebar to create tables or charts.

### `ResizableTableModal.js`
A resizable modal that displays the uploaded data in a table format. It allows users to download data and provides a responsive interface.

### `ChartComponent.js`
Handles the rendering of various chart types using Chart.js. Supports multiple chart types and aggregation functions.

### `styles/ResizableTableModal.css`
Contains styles for the `ResizableTableModal` component, ensuring that the table has both vertical and horizontal lines.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to improve the project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgments

- Inspired by [Tableau](https://www.tableau.com/), a leading data visualization tool.
- Built using [React.js](https://reactjs.org/), a powerful JavaScript library for building user interfaces.
- Charting powered by [Chart.js](https://www.chartjs.org/).
- Data manipulation with [Math.js](https://mathjs.org/).
- UI components from [Ant Design](https://ant.design/).

---

With this tool, you can perform sophisticated data analysis and visualization directly in your web browser, leveraging the flexibility and power of React.js to create a truly dynamic user experience.
