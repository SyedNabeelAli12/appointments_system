"use client";
import { useState, useEffect, useCallback } from "react";
import WeeklyCalendarGrid from "../components/WeekView";
import ListView from "../components/ListView";
import AppointmentForm from "../components/AppointmentForm";
import CalendarNavBar from "../components/CalendarNavBar";
import MonthView from "../components/MonthView";
import {
  getEndOfMonth,
  getStartOfMonth,
  getStartOfWeek,
} from "../common/commonFunctions";
import { limit } from "../common/commonvar";

export default function CalendarPage() {
  const [appointments, setAppointments] = useState([]);
  const [weeklyAppointments, setWeeklyAppointments] = useState([]);
  const [monthlyAppointments, setMonthlyAppointments] = useState([]);
  const [view, setView] = useState("woche");
  const [showForm, setShowForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState(true);
  const [loading, setLoading] = useState(false); // loader state

  const [filters, setFilters] = useState({
    category: "",
    dateFrom: new Date().toISOString().split("T")[0],
    dateTo: "",
    searchQuery: "",
  });

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const fetchAppointments = useCallback(
    async (activeFilters = filters) => {
      setLoading(true);
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
            limit: limit,
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
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const fetchWeeklyAppointments = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.searchQuery, selectedDate]);

  const fetchMonthlyAppointments = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.searchQuery, selectedDate]);

  useEffect(() => {
    fetchAppointments();
  }, []);

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
    newAppointment,
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
            newAppointment={newAppointment}
            setNewAppointment={setNewAppointment}
          />
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* View Section */}
      {!loading && (
        <div className="px-4">
          {view === "woche" && (
            <WeeklyCalendarGrid
              appointments={weeklyAppointments}
              selectedDate={selectedDate}
              newAppointment={newAppointment}
              setNewAppointment={setNewAppointment}
            />
          )}
          {view === "liste" && (
            <ListView
              appointments={appointments}
              newAppointment={newAppointment}
              setNewAppointment={setNewAppointment}
            />
          )}
          {view === "monat" && (
            <MonthView
              appointments={monthlyAppointments}
              selectedDate={selectedDate}
              newAppointment={newAppointment}
              setNewAppointment={setNewAppointment}
            />
          )}
        </div>
      )}
    </div>
  );
}
