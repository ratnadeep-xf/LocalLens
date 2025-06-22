import React, { useContext } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { articleContext } from "../context/articleContext";

const Filters = () => {
  const {
    regionOptions,
    selectedDate,
    setSelectedDate,
    selectedRegion,
    setSelectedRegion,
  } = useContext(articleContext);

  // Handle region selection change
  const handleRegionChange = (options) => {
    const values = options ? options.map((option) => option.value) : [];

    if (values.length > 0) {
      // Remove "all" if user selects specific regions
      const filteredValues = values.filter((val) => val !== "all");
      setSelectedRegion(filteredValues);
    } else {
      // Optional: You can default back to "all" if nothing is selected
      setSelectedRegion(["all"]);
    }
  };
  return (
    <div
      className="flex justify-between items-center bg-gray-100 p-4 rounded shadow-md"
      placeholder="Select Region"
    >
      <Select
        options={regionOptions}
        isMulti
        value={regionOptions.filter((option) =>
          selectedRegion.includes(option.value)
        )}
        onChange={handleRegionChange}
        placeholder="Select Region"
      />
      <div className="p-4">
        <label className="block mb-2 font-medium">Select a date:</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
          className="border rounded px-2 py-1"
          calendarClassName="p-2"
        />
      </div>
    </div>
  );
};

export default Filters;
