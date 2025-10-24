"use client";

import { useState } from "react";
import { 
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const AVAILABILITY_DATA = [
  {
    id: 1,
    name: "John Doe",
    status: "Available",
    startDate: "2024-04-01",
    endDate: "2024-04-05",
    color: "bg-blue-200/80"
  },
  {
    id: 2,
    name: "John Doe",
    status: "Available",
    startDate: "2024-04-06",
    endDate: "2024-04-08",
    color: "bg-blue-200/80"
  },
  {
    id: 3,
    name: "Samantha Lee",
    status: "PTO",
    startDate: "2024-04-09",
    endDate: "2024-04-12",
    color: "bg-purple-200/80"
  },
  {
    id: 4,
    name: "Michael Protiolf",
    status: "Available",
    startDate: "2024-04-15",
    endDate: "2024-04-15",
    color: "bg-blue-200/80"
  },
  {
    id: 5,
    name: "Jennifer Davis",
    status: "Busy",
    startDate: "2024-04-16",
    endDate: "2024-04-19",
    color: "bg-blue-200/80"
  },
  {
    id: 6,
    name: "David Brown",
    status: "Available",
    startDate: "2024-04-22",
    endDate: "2024-04-26",
    color: "bg-blue-200/80"
  },
  {
    id: 7,
    name: "Sarah Wilson",
    status: "Available",
    startDate: "2024-04-29",
    endDate: "2024-04-30",
    color: "bg-purple-200/80"
  }
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function SpiritSidebar() {
  return (
    <div className="w-80 bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-2xl">
      {/* Spirit Chat */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100/80 rounded-full flex items-center justify-center">
            <span className="text-purple-700 font-bold">S</span>
          </div>
          <span className="font-semibold text-gray-800">Spirit</span>
        </div>
        <div className="bg-blue-50/80 rounded-2xl p-4">
          <p className="text-sm text-gray-700">Hello! How can I assist you?</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="space-y-2 mb-8">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-600 hover:bg-white/50 rounded-xl transition-all duration-200">
          <UserIcon className="w-5 h-5" />
          <span>Company Profile</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-blue-700 bg-blue-100/80 rounded-xl">
          <CalendarIcon className="w-5 h-5" />
          <span>Team Availability</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-600 hover:bg-white/50 rounded-xl transition-all duration-200">
          <DocumentTextIcon className="w-5 h-5" />
          <span>Document Hub</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-600 hover:bg-white/50 rounded-xl transition-all duration-200">
          <DocumentTextIcon className="w-5 h-5" />
          <span>RFP Workspace</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-600 hover:bg-white/50 rounded-xl transition-all duration-200">
          <CheckCircleIcon className="w-5 h-5" />
          <span>Compliance</span>
        </button>
      </div>

      {/* Bottom Spirit */}
      <div className="mt-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100/80 rounded-full flex items-center justify-center">
            <span className="text-purple-700 font-bold">S</span>
          </div>
          <span className="font-semibold text-gray-800">Spirit</span>
        </div>
        <div className="bg-blue-50/80 rounded-2xl p-4">
          <p className="text-sm text-gray-700">How can I assist you?</p>
        </div>
      </div>
    </div>
  );
}

function CalendarGrid() {
  const [currentMonth, setCurrentMonth] = useState(3); // April
  const [currentYear, setCurrentYear] = useState(2024);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getAvailabilityForDate = (day: number) => {
    const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return AVAILABILITY_DATA.filter(item => {
      const itemDate = new Date(item.startDate);
      const itemEndDate = new Date(item.endDate);
      const currentDate = new Date(date);
      return currentDate >= itemDate && currentDate <= itemEndDate;
    });
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-2xl">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Availability Calendar</h2>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-100/80 text-blue-700 rounded-xl hover:bg-blue-200/80 transition-all duration-200">
            Today
          </button>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button className="w-8 h-8 bg-gray-100/80 rounded-lg flex items-center justify-center hover:bg-gray-200/80 transition-all duration-200">
              <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="text-center py-2 text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div key={index} className="min-h-[80px] p-2 border border-gray-100/50 rounded-lg">
            {day && (
              <>
                <div className="text-sm font-medium text-gray-800 mb-1">{day}</div>
                <div className="space-y-1">
                  {getAvailabilityForDate(day).map((item) => (
                    <div 
                      key={item.id}
                      className={`text-xs p-1 rounded ${item.color} text-gray-700 truncate`}
                      title={`${item.name} - ${item.status}`}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AvailabilityPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/60 via-blue-50/40 to-indigo-100/60">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to RFP Library</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          <SpiritSidebar />
          <div className="flex-1">
            <CalendarGrid />
          </div>
        </div>
      </div>
    </div>
  );
} 