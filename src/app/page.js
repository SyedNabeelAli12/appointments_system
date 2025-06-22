"use client";
import { useState, useEffect, useCallback } from "react";
import WeeklyCalendarGrid from "./components/WeekView";
import ListView from "./components/ListView";
import AppointmentForm from "./components/AppointmentForm";
import CalendarNavBar from "./components/CalendarNavBar";
import MonthView from "./components/MonthView";

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStartOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0); // last day of previous month (current month)
  d.setHours(23, 59, 59, 999);
  return d;
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState([]); // for list view
  const [weeklyAppointments, setWeeklyAppointments] = useState([]); // for week view
  const [monthlyAppointments, setMonthlyAppointments] = useState([]); // for month view
  const [view, setView] = useState("woche");
  const [showForm, setShowForm] = useState(false);
  const [newAppointment,setNewAppointment] = useState(true)

  const [filters, setFilters] = useState({
    category: "",
    dateFrom: new Date().toISOString().split("T")[0],
    dateTo: "",
    searchQuery: "",
  });

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Fetch generic appointments for list view
  const fetchAppointments = useCallback(
    async (activeFilters = filters) => {
      try {
        const response = await fetch("/api/appointments/filter_limit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: activeFilters.category || undefined,
            dateFrom: activeFilters.dateFrom || undefined,
            dateTo: activeFilters.dateTo || undefined,
            lastName: activeFilters.searchQuery || undefined,
            order: "asc",
            limit:2
          }),
        });

        const result = await response.json();
        if (response.ok) {
          setAppointments(result.appointments || []);
        } else {
          console.error("Failed to fetch appointments:", result.error);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    },
    [filters]
  );

  // Fetch weekly appointments
  const fetchWeeklyAppointments = useCallback(async () => {
    try {
      const startOfWeek = getStartOfWeek(selectedDate);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const response = await fetch("/api/appointments/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: filters.category || undefined,
          lastName: filters.searchQuery || undefined,
          dateFrom: startOfWeek.toISOString(),
          dateTo: endOfWeek.toISOString(),
          order: "asc",
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setWeeklyAppointments(result.appointments || []);
      } else {
        console.error("Failed to fetch weekly appointments:", result.error);
        setWeeklyAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching weekly appointments:", error);
      setWeeklyAppointments([]);
    }
  }, [filters.category, filters.searchQuery, selectedDate]);

  // Fetch monthly appointments
  const fetchMonthlyAppointments = useCallback(async () => {
    try {
      const startOfMonth = getStartOfMonth(selectedDate);
      const endOfMonth = getEndOfMonth(selectedDate);

      const response = await fetch("/api/appointments/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: filters.category || undefined,
          lastName: filters.searchQuery || undefined,
          dateFrom: startOfMonth.toISOString(),
          dateTo: endOfMonth.toISOString(),
          order: "asc",
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMonthlyAppointments(result.appointments || []);
      } else {
        console.error("Failed to fetch monthly appointments:", result.error);
        setMonthlyAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching monthly appointments:", error);
      setMonthlyAppointments([]);
    }
  }, [filters.category, filters.searchQuery, selectedDate]);

  // Load list view appointments on mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  const loadOlderAppointments = async () => {
    if (!appointments.length) return;

    const oldestDate = appointments
      .map((a) => new Date(a.start))
      .sort((a, b) => a - b)[0]
      .toISOString();

    const res = await fetch("/api/appointments/filter_limit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...filters,
        referenceDate: oldestDate,
        direction: "before",
        order: "desc", // older comes first
        limit: 2,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      setAppointments((prev) => [...result.appointments.reverse(), ...prev]);
    }
  };

  const loadNewerAppointments = async () => {
    if (!appointments.length) return;

    const newestDate = appointments
      .map((a) => new Date(a.start))
      .sort((a, b) => b - a)[0]
      .toISOString();

    const res = await fetch("/api/appointments/filter_limit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...filters,
        referenceDate: newestDate,
        direction: "after",
        order: "asc",
        limit: 2,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      setAppointments((prev) => [...prev, ...result.appointments]);
    }
  };

  // Load weekly or monthly appointments when filters, date or view changes
  useEffect(() => {
    if (view === "woche") {
      fetchWeeklyAppointments();
    } else if (view === "monat") {
      fetchMonthlyAppointments();
    } else if (view === "liste") {
      fetchAppointments();
    }
  }, [
    fetchWeeklyAppointments,
    fetchMonthlyAppointments,
    fetchAppointments,
    view,
    newAppointment
  ]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchAppointments(newFilters);

    if (view === "woche") {
      fetchWeeklyAppointments();
    } else if (view === "monat") {
      fetchMonthlyAppointments();
    } else if (view === "liste") {
      fetchAppointments(newFilters);
    }
  };

  const handleNewAppointment = () => {
    setShowForm((prev) => !prev);
  };

  return (
    <div className="space-y-4">
      <CalendarNavBar
        view={view}
        onViewChange={setView}
        onNewAppointment={handleNewAppointment}
        onFilterChange={handleFilterChange}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {showForm && (
        <div className="px-4">
          <AppointmentForm
            onCreated={() => {
              fetchAppointments(filters);
              if (view === "woche") fetchWeeklyAppointments();
              if (view === "monat") fetchMonthlyAppointments();
            }}
                newAppointment = {newAppointment}
        setNewAppointment = {setNewAppointment}
          />
        </div>
      )}

      <div className="px-4">
        {view === "woche" && (
          <WeeklyCalendarGrid
            appointments={weeklyAppointments}
            selectedDate={selectedDate}
          />
        )}
        {view === "liste" && (
          <ListView
            appointments={appointments}
            onLoadOlder={loadOlderAppointments}
            onLoadNewer={loadNewerAppointments}
          />
        )}
        {view === "monat" && (
          <MonthView
            appointments={monthlyAppointments}
            selectedDate={selectedDate}
          />
        )}
      </div>
    </div>
  );
}
