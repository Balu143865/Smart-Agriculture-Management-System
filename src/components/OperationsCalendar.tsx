import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Check, 
  CalendarDays,
  Droplet, 
  HeartHandshake,
  Sprout, 
  Tractor, 
  CheckCircle2, 
  Clock, 
  Filter, 
  MousePointerClick,
  Info,
  CalendarCheck,
  ShieldAlert,
  Beaker,
  AlertCircle
} from "lucide-react";
import { Crop, Farm } from "../types";

export interface FarmTask {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  category: "irrigation" | "fertilizer" | "weeding" | "disease_check" | "harvest_prep" | "other";
  status: "pending" | "completed";
  farmId?: string;
  cropId?: string;
}

interface OperationsCalendarProps {
  farms: Farm[];
  crops: Crop[];
  cTheme: {
    text: string;
    textMuted: string;
    textLight: string;
    bgAccent: string;
    borderAccent: string;
    buttonBg: string;
    sidebarActive: string;
  };
}

const CATEGORY_META = {
  irrigation: { label: "Irrigation 💧", icon: Droplet, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/40 border-sky-100 dark:border-sky-950" },
  fertilizer: { label: "Soil & Feed 🧪", icon: Beaker, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950/40 border-teal-100 dark:border-teal-950" },
  weeding: { label: "Weeding 🌾", icon: Sprout, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-950" },
  disease_check: { label: "Disease check 🛡️", icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-950" },
  harvest_prep: { label: "Harvest Prep 🚜", icon: Tractor, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-950" },
  other: { label: "General Admin 📋", icon: CalendarDays, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800" },
};

// Generate some high-quality real sample tasks initialized relative to user's local timeline (June 2026)
const getInitialTasks = (): FarmTask[] => {
  return [
    {
      id: "t1",
      title: "Optimized Drip Irrigation Cycle",
      description: "Perform visual check on mainline plumbing valves and run 2-hour drip system targeting Wheat block.",
      date: "2026-06-20",
      category: "irrigation",
      status: "completed",
      farmId: "f1",
      cropId: "c1"
    },
    {
      id: "t2",
      title: "Soil Chemistry NPK Sampling",
      description: "Extract deep core samples from California Central Block. Submit to agronomist to parse dynamic macro-nutrients ratios.",
      date: "2026-06-23",
      category: "fertilizer",
      status: "pending",
      farmId: "f1",
      cropId: "c2"
    },
    {
      id: "t3",
      title: "Tomato Weeding Control Plan",
      description: "Manual weeding between rows 14-36. Clear ground clutter around tomato shoots to prevent nutrient competition.",
      date: "2026-06-26",
      category: "weeding",
      status: "pending",
      farmId: "f1",
      cropId: "c2"
    },
    {
      id: "t4",
      title: "Assess Wheat Moisture Content",
      description: "Verify red wheat moisture content with hand probes ahead of reaping milestones to determine harvest window.",
      date: "2026-06-29",
      category: "harvest_prep",
      status: "pending",
      farmId: "f1",
      cropId: "c1"
    },
    {
      id: "t5",
      title: "Examine leaves for Downy Mildew",
      description: "Perform early dawn visual sweep across leaf undersides in Block B to note humidity stress signs.",
      date: "2026-06-24",
      category: "disease_check",
      status: "pending",
      farmId: "f1",
      cropId: "c2"
    }
  ];
};

export default function OperationsCalendar({ farms, crops, cTheme }: OperationsCalendarProps) {
  // Setup Calendar Month/Year viewport state
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(2026); // Match the system context timeline (June 2026)
  const [currentMonth, setCurrentMonth] = useState(5); // June (0-indexed)
  
  // Tasks state
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  
  // Selection and form inputs
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<keyof typeof CATEGORY_META>("irrigation");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskFarm, setNewTaskFarm] = useState("");
  const [newTaskCrop, setNewTaskCrop] = useState("");

  // Filters State
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterFarm, setFilterFarm] = useState<string>("all");

  // Load / Store tasks
  useEffect(() => {
    const saved = localStorage.getItem("agrismart_calendar_tasks");
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        setTasks(getInitialTasks());
      }
    } else {
      const initial = getInitialTasks();
      setTasks(initial);
      localStorage.setItem("agrismart_calendar_tasks", JSON.stringify(initial));
    }

    // Set default selected date as today in local format
    const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setSelectedDate(formattedToday);
    
    // Automatically match the calendar year and month to system time if in range
    if (today.getFullYear() === 2026) {
      setCurrentYear(2026);
      setCurrentMonth(today.getMonth());
    }
  }, []);

  // Sync state back to local storage on changes
  const saveTasks = (updatedTasks: FarmTask[]) => {
    setTasks(updatedTasks);
    localStorage.setItem("agrismart_calendar_tasks", JSON.stringify(updatedTasks));
  };

  // Quick navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSetToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setSelectedDate(formattedToday);
  };

  // Parse Crops database to generate dynamic milestones on the fly
  const cropMilestones = useMemo(() => {
    const milestones: Arr2StringKeyed = {};

    crops.forEach(crop => {
      // 1. Planting Milestone
      if (crop.plantedDate) {
        if (!milestones[crop.plantedDate]) milestones[crop.plantedDate] = [];
        milestones[crop.plantedDate].push({
          id: `planted-${crop.id}`,
          type: "planting",
          title: `🌱 Sown: ${crop.name}`,
          badgeText: `${crop.variety}`,
          details: `Planting date established on ${crop.plantedDate}. Area: ${crop.areaPlanted} Acres.`,
          color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40 border-blue-200/50 dark:border-blue-950",
          item: crop
        });
      }

      // 2. Harvest Milestone (Completed)
      if (crop.status === "harvested" && crop.harvestedDate) {
        if (!milestones[crop.harvestedDate]) milestones[crop.harvestedDate] = [];
        milestones[crop.harvestedDate].push({
          id: `harvested-${crop.id}`,
          type: "harvest",
          title: `🚜 Reaped: ${crop.name}`,
          badgeText: `Yield: ${crop.actualYield ?? crop.expectedYield} kg`,
          details: `Harvest reaped and completed on ${crop.harvestedDate}. Total field yields catalogued successfully.`,
          color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200/50 dark:border-emerald-950",
          item: crop
        });
      }

      // 3. Estimated Harvest Milestone (Upcoming/Active Crops)
      if (crop.status === "active" && crop.plantedDate) {
        // Calculate standard expected harvesting date (e.g. 90 days after planting)
        const plantDateObj = new Date(crop.plantedDate);
        if (!isNaN(plantDateObj.getTime())) {
          plantDateObj.setDate(plantDateObj.getDate() + 90);
          const estHarvestDate = `${plantDateObj.getFullYear()}-${String(plantDateObj.getMonth() + 1).padStart(2, "0")}-${String(plantDateObj.getDate()).padStart(2, "0")}`;
          
          if (!milestones[estHarvestDate]) milestones[estHarvestDate] = [];
          milestones[estHarvestDate].push({
            id: `est-harvest-${crop.id}`,
            type: "expected_harvest",
            title: `📅 Est. Harvest: ${crop.name}`,
            badgeText: `Est: ${crop.expectedYield} kg`,
            details: `Calculated standard 90-day physical development harvest window based on planted milestone (${crop.plantedDate}).`,
            color: "text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-905/45 border-teal-200/50 dark:border-teal-950",
            item: crop
          });
        }
      }
    });

    return milestones;
  }, [crops]);

  // Aggregate monthly calendar matrix
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells = [];

    // Previous Month padding cells
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYearIdx = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateString = `${prevYearIdx}-${String(prevMonthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      cells.push({
        day,
        isCurrentMonth: false,
        dateString,
      });
    }

    // Current Month active cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({
        day: d,
        isCurrentMonth: true,
        dateString,
      });
    }

    // Next Month padding cells to make typical 42-day viewport
    const totalCells = cells.length;
    const paddingNeeded = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
    for (let n = 1; n <= paddingNeeded; n++) {
      const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYearIdx = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateString = `${nextYearIdx}-${String(nextMonthIdx + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`;
      cells.push({
        day: n,
        isCurrentMonth: false,
        dateString,
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Apply filters to tasks list
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filterCategory !== "all" && task.category !== filterCategory) return false;
      if (filterStatus !== "all" && task.status !== filterStatus) return false;
      if (filterFarm !== "all" && task.farmId !== filterFarm) return false;
      return true;
    });
  }, [tasks, filterCategory, filterStatus, filterFarm]);

  // Map events per date (Filtered tasks + raw crop milestones)
  const cellEventsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};

    // First populate dynamic crop milestones
    Object.keys(cropMilestones).forEach(date => {
      map[date] = [...cropMilestones[date]];
    });

    // Populate filtered custom tasks
    filteredTasks.forEach(task => {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push({
        id: task.id,
        type: "task",
        title: task.title,
        badgeText: CATEGORY_META[task.category]?.label || "Task",
        details: task.description,
        isCompleted: task.status === "completed",
        rawTask: task,
      });
    });

    return map;
  }, [cropMilestones, filteredTasks]);

  // Create task operation
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedDate) return;

    const added: FarmTask = {
      id: "t_id_" + Date.now().toString(36),
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || "No detailed notes catalogued.",
      date: selectedDate,
      category: newTaskCategory,
      status: "pending",
      farmId: newTaskFarm || undefined,
      cropId: newTaskCrop || undefined
    };

    const updated = [...tasks, added];
    saveTasks(updated);

    // Reset fields
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskFarm("");
    setNewTaskCrop("");
  };

  // Toggle complete operation
  const handleToggleTaskStatus = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        return { ...t, status: (t.status === "pending" ? "completed" : "pending") as any };
      }
      return t;
    });
    saveTasks(updated);
  };

  // Delete task operation
  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveTasks(updated);
  };

  // Inspect particular day details for detail panel
  const inspectedDayEvents = useMemo(() => {
    const rawEvents = cellEventsByDate[selectedDate] || [];
    return rawEvents;
  }, [cellEventsByDate, selectedDate]);

  // Helper labels
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const parsedInspectedDateHTML = useMemo(() => {
    if (!selectedDate) return "Inspect Date";
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (isNaN(dateObj.getTime())) return selectedDate;
    return dateObj.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  }, [selectedDate]);

  return (
    <div id="operations_interactive_calendar" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-sm p-6 space-y-6">
      
      {/* 1. SECTION TITLES & FILTERS HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white font-display flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Interactive Scheduler & Farm Calendar
          </h2>
          <p className="text-xs text-slate-500">Coordinate sowed harvest milestones, crop developmental intervals, and field operations</p>
        </div>

        {/* Dynamic Controls / Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs w-full lg:w-auto">
          {/* Farm Filter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">Field</span>
            <span className="text-slate-300 dark:text-slate-800">|</span>
            <select 
              value={filterFarm} 
              onChange={(e) => setFilterFarm(e.target.value)}
              className="bg-transparent font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Fields</option>
              {farms.map(f => (
                <option key={f.id} value={f.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{f.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">Task</span>
            <span className="text-slate-300 dark:text-slate-800">|</span>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Tasks</option>
              {Object.entries(CATEGORY_META).map(([key, val]) => (
                <option key={key} value={key} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{val.label}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">Status</span>
            <span className="text-slate-300 dark:text-slate-800">|</span>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Statuses</option>
              <option value="pending" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">⚡ Pending</option>
              <option value="completed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">✓ Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. CHORE LAYOUT: 2-COLUMN RESPONSIVE WEB */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* CALENDAR COLUMN */}
        <div className="xl:col-span-8 space-y-4">
          
          {/* Calendar Viewport Header (Prev/Next/Month year) */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-1">
              <button 
                onClick={handlePrevMonth}
                className="p-1 px-2.5 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-white cursor-pointer transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1 px-2.5 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-white cursor-pointer transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              
              <button 
                onClick={handleSetToday}
                className="p-1 px-2 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-705 dark:text-white tracking-wide uppercase hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ml-1.5 transition-colors"
              >
                TODAY
              </button>
            </div>

            <div className="text-sm font-extrabold text-slate-900 dark:text-white font-display uppercase tracking-wider font-mono">
              {monthNames[currentMonth]} {currentYear}
            </div>

            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase hidden sm:block">
              {tasks.filter(t => t.status === "pending").length} remaining action node(s)
            </div>
          </div>

          {/* CALENDAR MATRIX VIEWER */}
          <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Days grid header */}
            <div className="grid grid-cols-7 bg-slate-100/60 dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800 text-center py-2 text-[10px] font-extrabold text-slate-400 font-mono tracking-wider uppercase">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days entries viewport */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80">
              {calendarCells.map((cell, index) => {
                const dayEvents = cellEventsByDate[cell.dateString] || [];
                const isSelected = selectedDate === cell.dateString;
                
                // Construct styles for the cells
                const isCurrentToday = 
                  today.getFullYear() === currentYear && 
                  today.getMonth() === currentMonth && 
                  today.getDate() === cell.day && cell.isCurrentMonth;

                return (
                  <div 
                    key={index}
                    onClick={() => setSelectedDate(cell.dateString)}
                    className={`min-h-[48px] sm:min-h-[64px] p-1 flex flex-col justify-between cursor-pointer select-none transition-all relative group
                      ${cell.isCurrentMonth ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white" : "bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-650"}
                      ${isSelected ? "ring-2 ring-emerald-500 ring-inset bg-emerald-500/5 dark:bg-emerald-500/5" : ""}
                      ${isCurrentToday ? "border border-emerald-500" : ""}
                      hover:bg-slate-50 dark:hover:bg-slate-850/30
                    `}
                  >
                    {/* Day number with badge flags */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-extrabold ${isCurrentToday ? "bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm" : ""}`}>
                        {cell.day}
                      </span>
                      
                      {/* Micro indicator dots if events present */}
                      {dayEvents.length > 0 && (
                        <div className="flex gap-0.5">
                          {dayEvents.map((evt, idx) => {
                            if (idx > 2) return null;
                            const dotColor = 
                              evt.type === "planting" ? "bg-blue-500" :
                              evt.type === "harvest" ? "bg-emerald-500" :
                              evt.type === "expected_harvest" ? "bg-teal-400" :
                              evt.isCompleted ? "bg-slate-350 dark:bg-slate-600" : "bg-rose-500";
                            return (
                              <span key={idx} className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Compact Events labels list (Hidden on super mobile, displays on md screens+) */}
                    <div className="mt-1 space-y-1 overflow-hidden flex-grow flex flex-col justify-end">
                      {dayEvents.slice(0, 2).map((evt, idx) => {
                        let textClass = "text-[9px] font-semibold tracking-tight truncate px-1 py-0.5 rounded border leading-tight block ";
                        let labelBg = "";
                        
                        if (evt.type === "planting") {
                          labelBg = "bg-blue-50/90 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-100 dark:border-blue-950/50";
                        } else if (evt.type === "harvest") {
                          labelBg = "bg-emerald-50/90 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/50";
                        } else if (evt.type === "expected_harvest") {
                          labelBg = "bg-teal-50/90 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400 border-teal-100 dark:border-teal-950/50";
                        } else {
                          // Regular task
                          labelBg = evt.isCompleted 
                            ? "bg-slate-100/95 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 border-slate-150 dark:border-slate-800/60 line-through" 
                            : "bg-rose-50/90 text-rose-700 dark:bg-rose-955/20 dark:text-rose-400 border-rose-100 dark:border-rose-950/50";
                        }

                        return (
                          <span 
                            key={evt.id} 
                            className={`${textClass} ${labelBg}`}
                            title={`${evt.title}: ${evt.details}`}
                          >
                            {evt.title}
                          </span>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[8px] font-mono text-slate-400 dark:text-slate-500 font-extrabold text-right pr-0.5 select-none">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Legend Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono py-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Planting Date 🌱</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Harvest reaped 🚜</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              <span>Est. Harvest Date 📅</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Custom Action Pending ⚡</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-350 dark:bg-slate-600" />
              <span>Custom Task Done ✓</span>
            </div>
          </div>
        </div>

        {/* SIDE BAR LAYOUT: DETAIL & FORM FIELD WRAPPERS */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* A. DETAIL PANEL FOR SELECTING DAYS */}
          <div className="bg-slate-50 dark:bg-slate-950 border-2 border-slate-100/90 dark:border-slate-800/80 rounded-[28px] p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <CalendarCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-xs font-mono font-extrabold tracking-widest text-slate-400 uppercase">Selected Inspector</h3>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight font-display">{parsedInspectedDateHTML}</h4>
              </div>
            </div>

            {/* Event Lists for Inspected Day */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {inspectedDayEvents.length === 0 ? (
                <div className="text-center py-6 text-slate-400 italic text-xs space-y-1">
                  <Info className="w-4 h-4 text-slate-300 mx-auto" />
                  <p>No operations scheduling indexed.</p>
                  <p className="text-[10px] text-slate-400/85">Click standard grid dates above to inspect coordinates or register tasks.</p>
                </div>
              ) : (
                inspectedDayEvents.map((evt) => {
                  const CategoryIcon = evt.rawTask ? CATEGORY_META[evt.rawTask.category]?.icon || Tractor : Tractor;
                  
                  return (
                    <motion.div 
                      key={evt.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-2xl border flex items-start gap-2.5 transition-all
                        ${evt.type === "planting" ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-950/60" : ""}
                        ${evt.type === "harvest" ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-950/60" : ""}
                        ${evt.type === "expected_harvest" ? "bg-teal-50/50 dark:bg-teal-955/15 border-teal-100 dark:border-teal-950/60" : ""}
                        ${evt.type === "task" ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 shadow-xs" : ""}
                      `}
                    >
                      {/* Checkbox selector for Tasks */}
                      {evt.type === "task" ? (
                        <button 
                          onClick={() => handleToggleTaskStatus(evt.id)}
                          className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center cursor-pointer transition-colors
                            ${evt.isCompleted 
                              ? "bg-slate-400 border-slate-400 text-white dark:bg-slate-600 dark:border-slate-600" 
                              : "border-slate-300 dark:border-slate-700 text-transparent hover:border-emerald-500"
                            }
                          `}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                      ) : (
                        <span className={`p-1 rounded-lg ${
                          evt.type === "planting" ? "bg-blue-50 dark:bg-blue-950/30" : "bg-emerald-50 dark:bg-emerald-950/30"
                        }`}>
                          <Sprout className={`w-3.5 h-3.5 ${
                            evt.type === "planting" ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"
                          }`} />
                        </span>
                      )}

                      <div className="flex-grow space-y-1 pr-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className={`text-xs font-bold leading-snug
                            ${evt.isCompleted ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-905 dark:text-white"}
                          `}>
                            {evt.title}
                          </h5>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono tracking-wide block uppercase
                            ${evt.type === "planting" ? "bg-blue-100/60 text-blue-800 dark:bg-blue-950 dark:text-blue-300" : ""}
                            ${evt.type === "harvest" ? "bg-emerald-100/60 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : ""}
                            ${evt.type === "expected_harvest" ? "bg-teal-100/65 text-teal-800 dark:bg-teal-950 dark:text-teal-300" : ""}
                            ${evt.type === "task" ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" : ""}
                          `}>
                            {evt.badgeText}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">{evt.details}</p>
                      </div>

                      {/* Trash action for tasks */}
                      {evt.type === "task" && (
                        <button 
                          onClick={() => handleDeleteTask(evt.id)}
                          className="text-slate-350 hover:text-rose-500 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-955/10 transition-colors cursor-pointer self-start shrink-0"
                          title="Purge Scheduled Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* B. CREATION FORM PANEL */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100/90 dark:border-slate-800/80 rounded-[28px] p-5.5 space-y-4 shadow-md">
            <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Schedule Farming Task</h3>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase font-mono tracking-wider">Task Title</label>
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  placeholder="E.g. Clean Drip Filters"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase font-mono tracking-wider">Label Category</label>
                  <select 
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="w-full h-[34px] px-3 py-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800 cursor-pointer"
                  >
                    {Object.entries(CATEGORY_META).map(([key, val]) => (
                      <option key={key} value={key} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase font-mono tracking-wider">Farming Target Date</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800 cursor-pointer"
                  />
                </div>
              </div>

              {/* Associations */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase font-mono tracking-wider">Associated field</label>
                  <select 
                    value={newTaskFarm}
                    onChange={(e) => setNewTaskFarm(e.target.value)}
                    className="w-full h-[34px] px-3 py-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800 cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">None</option>
                    {farms.map(f => (
                      <option key={f.id} value={f.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">{f.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase font-mono tracking-wider">Associated crop</label>
                  <select 
                    value={newTaskCrop}
                    onChange={(e) => setNewTaskCrop(e.target.value)}
                    className="w-full h-[34px] px-3 py-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800 cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">None</option>
                    {crops.map(c => (
                      <option key={c.id} value={c.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase font-mono tracking-wider">Task notes</label>
                <textarea 
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Record step-by-step target procedures..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800 focus:outline-none placeholder-slate-400 dark:placeholder-slate-600 resize-none font-semibold text-xs"
                />
              </div>

              <button 
                type="submit"
                disabled={!newTaskTitle.trim()}
                className={`w-full py-2 px-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all
                  ${!newTaskTitle.trim() 
                    ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed shadow-none" 
                    : `${cTheme.buttonBg} text-white cursor-pointer hover:-translate-y-0.5`
                  }
                `}
              >
                Insert Task Node
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}

// Simple type mapping interface for internal clean typing
interface Arr2StringKeyed {
  [key: string]: Array<{
    id: string;
    type: "planting" | "harvest" | "expected_harvest";
    title: string;
    badgeText: string;
    details: string;
    color: string;
    item: Crop;
  }>;
}
