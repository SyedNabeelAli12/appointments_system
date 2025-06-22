"use client";
import {
  CalendarIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  XIcon,
  SearchIcon,
  ChevronDownIcon,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function CalendarNavBar({
  view,
  onViewChange,
  onNewAppointment,
  onFilterChange,
  selectedDate,
  onDateChange,
          newAppointment,
        setAppointments
}) {
  const [showFilters, setShowFilters] = useState(false);

  // Separate categories array
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    category: "",
    dateFrom: "",
    dateTo: "",
    searchQuery: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories/labels");
        const result = await res.json();

        if (res.ok && result.labels) {
          // Normalize: support both `{ label }` or `{ id, name }`
          const formatted = result.labels.map((item, index) => ({
            id: item.id ?? index.toString(),
            name: item.name ?? item.label,
          }));
          console.log(formatted);

          setCategories(formatted);
        } else {
          console.error("Fehler beim Laden der Kategorien:", result.error);
        }
      } catch (err) {
        console.error("Fehler beim Abrufen der Kategorien:", err);
      }
    };

    fetchCategories();
  }, []);

  const handleFilterChange = (name, value) => {
    console.log(value);
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    // if (onFilterChange) {
    //   onFilterChange(newFilters);
    // }
  };

  const dateValue = selectedDate
    ? new Date(selectedDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return (
    <div className="relative">
      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm rounded-md">
        <div className="flex items-center space-x-4">
          <div className="flex items-center border rounded-md px-2 py-1 text-sm text-gray-700 bg-white">
            <CalendarIcon className="w-4 h-4 mr-1 text-gray-500" />
            {/* <input
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="bg-transparent focus:outline-none cursor-pointer"
            /> */}
            <input
              type="date"
              value={dateValue}
              disabled={view == "liste" ? true : false}
              // defaultValue={new Date().toISOString().split("T")[0]}
              onChange={(e) => onDateChange && onDateChange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center bg-gray-100 rounded-md overflow-hidden text-sm">
            {["Liste", "Woche", "Monat"].map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v.toLowerCase())}
                className={`px-3 py-1 ${
                  view === v.toLowerCase()
                    ? "bg-white shadow font-medium"
                    : "text-gray-500"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center border px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            <SlidersHorizontalIcon className="w-4 h-4 mr-1" />
            Termine filtern
          </button>
          <button
            onClick={onNewAppointment}
            className="flex items-center bg-black text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-800"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Neuer Termin
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-full right-0 mt-2 w-full md:w-96 bg-white border rounded-md shadow-lg z-10 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Filter</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategorie
              </label>
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black sm:text-sm rounded-md"
                >
                  <option value="">Alle Kategorien</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zeitraum
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center border rounded-md px-2 py-1 text-sm text-gray-700 bg-white">
                  <CalendarIcon className="w-4 h-4 mr-1 text-gray-500" />
                  <input
                    type="date"
                    disabled={(view == "liste") ? false : true}
                    value={filters.dateFrom}
                    onChange={(e) =>
                      handleFilterChange("dateFrom", e.target.value)
                    }
                    className="bg-transparent focus:outline-none cursor-pointer w-full"
                  />
                </div>
                <div className="flex items-center border rounded-md px-2 py-1 text-sm text-gray-700 bg-white">
                  <CalendarIcon className="w-4 h-4 mr-1 text-gray-500" />
                  <input
                    type="date"
        disabled={(view == "liste") ? false : true}
                    value={filters.dateTo}
                    onChange={(e) =>
                      handleFilterChange("dateTo", e.target.value)
                    }
                    className="bg-transparent focus:outline-none cursor-pointer w-full"
                  />
                </div>
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient suchen
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) =>
                    handleFilterChange("searchQuery", e.target.value)
                  }
                  className="focus:ring-black focus:border-black block w-full pl-9 sm:text-sm border border-gray-300 rounded-md py-2"
                  placeholder="Name oder ID"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  const cleared = {
                    category: "",
                    dateFrom: "",
                    dateTo: "",
                    searchQuery: "",
                  };
                  setFilters(cleared);
                  onFilterChange?.(cleared);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Zurücksetzen
              </button>
              <button
                onClick={() => {
                  setShowFilters(false);
                  onFilterChange?.(filters); // 🔥 Trigger appointments filtering
                }}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800"
              >
                Filter anwenden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
