"use client";

import { useState } from "react";
import { 
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const TEAM_MEMBER_DATA = {
  id: 1,
  name: "Jordan James",
  role: "Project Manager",
  status: "Ready",
  image: "/api/placeholder/120/120",
  skills: [
    { name: "Compliance", color: "bg-blue-100/80 text-blue-700" },
    { name: "PRM Magm", color: "bg-teal-100/80 text-teal-700" },
    { name: "Scheduling", color: "bg-purple-100/80 text-purple-700" }
  ],
  availability: {
    month: "June 2024",
    selectedDates: [11, 12, 13, 14, 15]
  },
  pastPerformance: "FAA Support Services",
  assignedRFPs: [
    "Navy Program Management",
    "Program Manager"
  ]
};

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function ProfileCard() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-2xl">
      <div className="flex items-center gap-6 mb-6">
        <div className="w-24 h-24 bg-blue-100/80 rounded-full flex items-center justify-center">
          <UserIcon className="w-12 h-12 text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{TEAM_MEMBER_DATA.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-700 font-medium">{TEAM_MEMBER_DATA.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AvailabilitySummaryCard() {
  return (
    <div className="bg-blue-50/80 backdrop-blur-md rounded-3xl p-6 border border-blue-200/40 shadow-xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center">
          <UserIcon className="w-6 h-6 text-blue-700" />
        </div>
        <div>
          <p className="text-blue-800 font-medium">
            Jordan looks available for the entire period of performance on this RFP.
          </p>
        </div>
      </div>
    </div>
  );
}

function SkillsCard() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills</h3>
      <div className="flex flex-wrap gap-2">
        {TEAM_MEMBER_DATA.skills.map((skill, index) => (
          <span key={index} className={`px-3 py-1 rounded-full text-sm font-medium ${skill.color}`}>
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function AvailabilityCalendarCard() {
  const [currentMonth, setCurrentMonth] = useState(5); // June
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

  const isSelectedDate = (day: number) => {
    return TEAM_MEMBER_DATA.availability.selectedDates.includes(day);
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Availability</h3>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 bg-gray-100/80 rounded-lg flex items-center justify-center hover:bg-gray-200/80 transition-all duration-200">
            <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
          </button>
          <span className="font-medium text-gray-800">
            {MONTHS[currentMonth]} {currentYear}
          </span>
          <button className="w-8 h-8 bg-gray-100/80 rounded-lg flex items-center justify-center hover:bg-gray-200/80 transition-all duration-200">
            <ChevronRightIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="text-center py-1 text-xs font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div key={index} className="w-8 h-8 flex items-center justify-center">
            {day && (
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                isSelectedDate(day) 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100/80"
              }`}>
                {day}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PastPerformanceCard() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Past Performance</h3>
      <p className="text-gray-700">{TEAM_MEMBER_DATA.pastPerformance}</p>
    </div>
  );
}

function AssignedRFPsCard() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Assigned RFPs</h3>
      <div className="space-y-2">
        {TEAM_MEMBER_DATA.assignedRFPs.map((rfp, index) => (
          <div key={index} className="flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{rfp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeamMemberProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/60 via-blue-50/40 to-indigo-100/60">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push('/staff')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Staff</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Team Member Profile</h1>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileCard />
            <AvailabilitySummaryCard />
            <SkillsCard />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <AvailabilityCalendarCard />
            <PastPerformanceCard />
            <AssignedRFPsCard />
          </div>
        </div>
      </div>
    </div>
  );
} 