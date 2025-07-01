import React, { useContext, useMemo } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, RotateCcw } from "lucide-react";
import { articleContext } from "../context/articleContext";

const Filters = ({ isDashboard = false, publisherId }) => {
  const {
    regionAvailable,
    selectedDate,
    setSelectedDate,
    selectedRegion,
    setSelectedRegion,
    publisherArray,
  } = useContext(articleContext);

  // Compute region options: remove "all" if any region other than "all" is selected
  const regionOptions = useMemo(() => {
    let baseOptions;
    if (isDashboard) {
      const publisherRegions =
        publisherArray.find((publisher) => publisher.id === publisherId)
          ?.regions || [];
      baseOptions = publisherRegions.map((region) => ({
        value: region,
        label: region.charAt(0).toUpperCase() + region.slice(1),
      }));
    } else {
      baseOptions = [...regionAvailable];
    }

    // If "all" is selected, show "all" option; otherwise, remove it
    if (selectedRegion.length === 1 && selectedRegion[0] === "all") {
      if (!baseOptions.some((opt) => opt.value === "all")) {
        baseOptions.unshift({ value: "all", label: "All Regions" });
      }
      return baseOptions;
    } else {
      // Remove "all" from options
      return baseOptions.filter((opt) => opt.value !== "all");
    }
  }, [regionAvailable, isDashboard, publisherArray, publisherId, selectedRegion]);

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

  const resetFilters = () => {
    setSelectedRegion(["all"]); // Reset to "all" regions
    setSelectedDate(new Date()); // Reset to today's date
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: '1px solid #e5e5e5',
      borderRadius: '0.5rem',
      padding: '0.25rem',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(14, 165, 233, 0.1)' : 'none',
      borderColor: state.isFocused ? '#0ea5e9' : '#e5e5e5',
      '&:hover': {
        borderColor: '#0ea5e9',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#e0f2fe',
      borderRadius: '0.375rem',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#0369a1',
      fontWeight: '500',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#0369a1',
      '&:hover': {
        backgroundColor: '#0ea5e9',
        color: 'white',
      },
    }),
  };
  
  return (
    <div className="bg-white rounded-xl shadow-card p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Region Filter */}
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Filter by Region
          </label>
          <Select
            options={regionOptions}
            isMulti
            value={regionOptions.filter((option) =>
              selectedRegion.includes(option.value)
            )}
            onChange={handleRegionChange}
            placeholder="Select regions..."
            styles={customSelectStyles}
            className="text-sm"
          />
        </div>

        {/* Date Filter */}
        <div className="flex-shrink-0">
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Select Date
          </label>
          <div className="relative">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              calendarClassName="shadow-lg border-0 rounded-xl"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex-shrink-0 lg:self-end">
          <button 
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-lg transition-colors duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;