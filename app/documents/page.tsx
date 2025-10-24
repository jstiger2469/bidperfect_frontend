"use client";

import { useState } from "react";
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  DocumentTextIcon,
  FolderIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  FunnelIcon,
  SparklesIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const DOCUMENT_CATEGORIES = [
  { id: "all", name: "All Documents", count: 47, icon: DocumentTextIcon },
  { id: "rfp", name: "RFP Documents", count: 12, icon: DocumentTextIcon },
  { id: "compliance", name: "Compliance", count: 8, icon: CheckCircleIcon },
  { id: "contracts", name: "Contracts", count: 6, icon: BuildingOfficeIcon },
  { id: "invoices", name: "Invoices", count: 15, icon: DocumentTextIcon },
  { id: "certifications", name: "Certifications", count: 4, icon: CheckCircleIcon },
  { id: "staff", name: "Staff Documents", count: 2, icon: UserIcon }
];

const DOCUMENTS_DATA = [
  {
    id: 1,
    name: "HVAC Replacement RFP.pdf",
    category: "rfp",
    size: "2.4 MB",
    uploaded: "2024-01-15",
    status: "Active",
    tags: ["HVAC", "GSA", "Federal"],
    type: "pdf",
    description: "Request for Proposal for HVAC replacement services at federal building locations"
  },
  {
    id: 2,
    name: "Company Compliance Matrix.xlsx",
    category: "compliance",
    size: "1.2 MB",
    uploaded: "2024-01-10",
    status: "Active",
    tags: ["Compliance", "Matrix", "Requirements"],
    type: "excel",
    description: "Comprehensive compliance matrix for government contracting requirements"
  },
  {
    id: 3,
    name: "Contract_47QFCA23D0001.pdf",
    category: "contracts",
    size: "3.1 MB",
    uploaded: "2024-01-05",
    status: "Active",
    tags: ["Contract", "Award", "Federal"],
    type: "pdf",
    description: "Signed contract for federal HVAC services"
  },
  {
    id: 4,
    name: "Invoice_2024_001.pdf",
    category: "invoices",
    size: "0.8 MB",
    uploaded: "2024-01-20",
    status: "Pending",
    tags: ["Invoice", "Payment", "CLIN"],
    type: "pdf",
    description: "Invoice for completed HVAC installation services"
  },
  {
    id: 5,
    name: "SEBD_Certification.pdf",
    category: "certifications",
    size: "1.5 MB",
    uploaded: "2023-12-15",
    status: "Active",
    tags: ["SEBD", "Certification", "State"],
    type: "pdf",
    description: "Small and Emerging Business Development certification"
  },
  {
    id: 6,
    name: "Jordan_James_Resume.pdf",
    category: "staff",
    size: "0.9 MB",
    uploaded: "2024-01-12",
    status: "Active",
    tags: ["Resume", "Project Manager", "Jordan"],
    type: "pdf",
    description: "Resume for Jordan James, Project Manager"
  }
];

const AI_INSIGHTS = [
  {
    type: "compliance",
    message: "5 documents require renewal within 90 days",
    icon: ExclamationTriangleIcon,
    color: "text-orange-600"
  },
  {
    type: "opportunity",
    message: "3 RFPs match your company's capabilities",
    icon: SparklesIcon,
    color: "text-blue-600"
  },
  {
    type: "deadline",
    message: "Invoice #2024_001 due for payment review",
    icon: ClockIcon,
    color: "text-yellow-600"
  }
];

function DocumentCard({ document }: { document: typeof DOCUMENTS_DATA[0] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100/80 text-green-700";
      case "Pending":
        return "bg-yellow-100/80 text-yellow-700";
      case "Expired":
        return "bg-red-100/80 text-red-700";
      default:
        return "bg-gray-100/80 text-gray-700";
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "excel":
        return "📊";
      case "word":
        return "📝";
      default:
        return "📄";
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100/80 rounded-xl flex items-center justify-center text-2xl">
            {getFileIcon(document.type)}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{document.name}</h3>
            <p className="text-gray-600 text-sm">{document.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
            {document.status}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span>{document.size}</span>
          <span>•</span>
          <span>Uploaded {document.uploaded}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {document.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100/80 text-gray-700 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-100/80 text-blue-700 rounded-lg hover:bg-blue-200/80 transition-all duration-200">
          <EyeIcon className="w-4 h-4" />
          <span className="text-sm">View</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 bg-gray-100/80 text-gray-700 rounded-lg hover:bg-gray-200/80 transition-all duration-200">
          <ArrowDownTrayIcon className="w-4 h-4" />
          <span className="text-sm">Download</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 bg-red-100/80 text-red-700 rounded-lg hover:bg-red-200/80 transition-all duration-200">
          <TrashIcon className="w-4 h-4" />
          <span className="text-sm">Delete</span>
        </button>
      </div>
    </div>
  );
}

function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
      <div className="space-y-2">
        {DOCUMENT_CATEGORIES.map((category) => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                selectedCategory === category.id
                  ? "bg-blue-100/80 text-blue-700"
                  : "text-gray-600 hover:bg-white/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{category.name}</span>
              </div>
              <span className="text-sm bg-white/80 px-2 py-1 rounded-full">
                {category.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AIInsightsPanel() {
  return (
    <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-md rounded-3xl p-6 border border-blue-200/40 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <SparklesIcon className="w-6 h-6 text-blue-700" />
        <h3 className="text-lg font-semibold text-gray-800">AI Insights</h3>
      </div>
      <div className="space-y-3">
        {AI_INSIGHTS.map((insight, index) => {
          const IconComponent = insight.icon;
          return (
            <div key={index} className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
              <IconComponent className={`w-5 h-5 ${insight.color}`} />
              <span className="text-sm text-gray-700">{insight.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredDocuments = DOCUMENTS_DATA.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Document Hub</h1>
            <p className="text-gray-600 mt-2">Centralized repository for all your documents and files</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200">
            <PlusIcon className="w-5 h-5" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents, tags, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="w-80 space-y-6">
            <CategoryFilter />
            <AIInsightsPanel />
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {filteredDocuments.length} Documents
              </h2>
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">Filter</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>

            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No documents found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 