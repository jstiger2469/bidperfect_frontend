// PRODUCTION-QUALITY CONNECTED DATA LAYER
// This represents the interconnected data that would come from a real database

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  position: string;
  email: string;
  phone: string;
  status: 'assigned' | 'pending' | 'available';
  badges: string[];
  clearanceLevel?: string;
  certifications: string[];
  hourlyRate: number;
  availability: number; // percentage
  image: string;
}

export interface Subcontractor {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  type: string;
  specialty: string[];
  rating: number;
  status: 'assigned' | 'available' | 'pending' | 'overbooked';
  readiness: number;
  capacity: string;
  licenses: string[];
  certifications: string[];
  insuranceStatus: 'valid' | 'expired' | 'pending';
  wageDeterminationCompliant: boolean;
  pastPerformanceScore: number;
  image: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  businessInfo: {
    ein: string;
    uei: string;
    naics: string[];
    cageCode?: string;
  };
}

export interface ComplianceRequirement {
  id: string;
  rfpId: string;
  requirementType: 'prime' | 'subcontractor';
  farClause: string;
  title: string;
  description: string;
  status: 'complete' | 'drafted' | 'pending' | 'review';
  response?: string;
  attachments: string[];
  dueDate: string;
  assignedTo?: string;
}

export interface PricingLineItem {
  id: string;
  clin: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  laborHours?: number;
  materialCost?: number;
  equipmentCost?: number;
  subcontractorId?: string;
  category: 'labor' | 'material' | 'equipment' | 'subcontractor' | 'travel' | 'overhead';
}

export interface ParsedSection {
  id: string;
  type: string;
  content: any;
  createdAt: string;
}

export interface RFP {
  id: string;
  title: string;
  agency: string;
  rfpNumber: string;
  dueDate: string;
  estimatedValue: string;
  readiness: number;
  status: 'draft' | 'in-progress' | 'submitted' | 'awarded';
  type: 'fixed-price' | 'cost-plus' | 'time-materials';
  description: string;
  location: string;
  performancePeriod: string;
  assignedTeamMembers: string[]; // TeamMember IDs
  selectedSubcontractors: string[]; // Subcontractor IDs
  pendingSubcontractors: string[]; // Subcontractor IDs
  complianceRequirements: string[]; // ComplianceRequirement IDs
  pricingLineItems: string[]; // PricingLineItem IDs
  parsedSections?: ParsedSection[]; // Parsed sections from backend
  documents: {
    originalRFP: string;
    attachments: string[];
    submittedProposal?: string;
  };
  scope: {
    pwsDescription: string;
    deliverables: string[];
    technicalRequirements: string[];
  };
  evaluationCriteria: {
    technical: number;
    price: number;
    pastPerformance: number;
    awardType: 'LPTA' | 'Best Value' | 'Tradeoff';
  };
}

// TEAM MEMBERS DATA
export const TEAM_MEMBERS: Record<string, TeamMember> = {
  "tm-001": {
    id: "tm-001",
    name: "Colleen",
    role: "Project Manager",
    position: "Principal PM",
    email: "colleen@company.com",
    phone: "(504) 555-0123",
    status: "assigned",
    badges: ["SECRET Clearance", "PMP"],
    clearanceLevel: "SECRET",
    certifications: ["PMP", "PRINCE2"],
    hourlyRate: 85,
    availability: 90,
    image: "/api/placeholder/60/60"
  },
  "tm-002": {
    id: "tm-002",
    name: "Ethan",
    role: "Cost Analyst",
    position: "Senior Estimator",
    email: "ethan@company.com", 
    phone: "(504) 555-0124",
    status: "assigned",
    badges: ["CCP"],
    certifications: ["CCP", "CVS"],
    hourlyRate: 75,
    availability: 85,
    image: "/api/placeholder/60/60"
  },
  "tm-003": {
    id: "tm-003",
    name: "Sarah",
    role: "Quality Manager",
    position: "Compliance Lead",
    email: "sarah@company.com",
    phone: "(504) 555-0125",
    status: "pending",
    badges: ["⚠️ Cert Expiring"],
    certifications: ["ISO 9001", "Six Sigma"],
    hourlyRate: 80,
    availability: 70,
    image: "/api/placeholder/60/60"
  },
  "tm-004": {
    id: "tm-004",
    name: "James",
    role: "Technical Writer",
    position: "Proposal Writer",
    email: "james@company.com",
    phone: "(504) 555-0126",
    status: "assigned",
    badges: [],
    certifications: ["Technical Writing", "Shipley"],
    hourlyRate: 65,
    availability: 95,
    image: "/api/placeholder/60/60"
  },
  "tm-005": {
    id: "tm-005",
    name: "Marcus",
    role: "Safety Officer",
    position: "HSE Manager",
    email: "marcus@company.com",
    phone: "(504) 555-0127",
    status: "available",
    badges: ["OSHA 30"],
    certifications: ["OSHA 30", "First Aid", "CPR"],
    hourlyRate: 70,
    availability: 60,
    image: "/api/placeholder/60/60"
  }
};

// SUBCONTRACTORS DATA
export const SUBCONTRACTORS: Record<string, Subcontractor> = {
  "sub-001": {
    id: "sub-001",
    name: "Statewide HVAC",
    contactName: "Sarah Williams",
    email: "swilliams@statewidehvac.com",
    phone: "(504) 555-0198",
    type: "HVAC Contractor",
    specialty: ["HVAC Installation", "Rooftop Units", "Controls"],
    rating: 4.7,
    status: "assigned",
    readiness: 94,
    capacity: "+20%",
    licenses: ["HVAC License LA-12345", "EPA 608 Universal"],
    certifications: ["NATE Certified", "Trane Certified", "Carrier Certified"],
    insuranceStatus: "valid",
    wageDeterminationCompliant: true,
    pastPerformanceScore: 92,
    image: "/api/placeholder/60/60",
    address: {
      street: "1234 Industrial Blvd",
      city: "Baton Rouge",
      state: "LA",
      zip: "70808"
    },
    businessInfo: {
      ein: "72-1234567",
      uei: "ABC123DEF456",
      naics: ["238220"],
      cageCode: "1A2B3"
    }
  },
  "sub-002": {
    id: "sub-002",
    name: "Bay Electric Inc.",
    contactName: "Marcus Thompson",
    email: "mthompson@bayelectric.com", 
    phone: "(504) 555-0199",
    type: "Electrical Contractor",
    specialty: ["Electrical Installation", "Panel Upgrades", "Controls"],
    rating: 4.2,
    status: "pending",
    readiness: 88,
    capacity: "+15%",
    licenses: ["Electrical License LA-67890", "Master Electrician"],
    certifications: ["IBEW", "NECA Certified"],
    insuranceStatus: "valid",
    wageDeterminationCompliant: true,
    pastPerformanceScore: 85,
    image: "/api/placeholder/60/60",
    address: {
      street: "5678 Commerce Dr",
      city: "New Orleans",
      state: "LA", 
      zip: "70112"
    },
    businessInfo: {
      ein: "72-2345678",
      uei: "DEF456GHI789",
      naics: ["238210"],
      cageCode: "2C3D4"
    }
  },
  "sub-003": {
    id: "sub-003",
    name: "Reliable Mechanical",
    contactName: "David Rodriguez",
    email: "drodriguez@reliablemech.com",
    phone: "(504) 555-0200",
    type: "HVAC Specialist", 
    specialty: ["HVAC Maintenance", "Ductwork", "Retrofits"],
    rating: 3.9,
    status: "overbooked",
    readiness: 82,
    capacity: "-35%",
    licenses: ["HVAC License LA-11111", "Sheet Metal License"],
    certifications: ["SMACNA", "ASHRAE Member"],
    insuranceStatus: "valid",
    wageDeterminationCompliant: false,
    pastPerformanceScore: 78,
    image: "/api/placeholder/60/60",
    address: {
      street: "9012 Industrial Pkwy",
      city: "Shreveport",
      state: "LA",
      zip: "71101"
    },
    businessInfo: {
      ein: "72-3456789",
      uei: "GHI789JKL012",
      naics: ["238220"],
      cageCode: "3E4F5"
    }
  }
};

// COMPLIANCE REQUIREMENTS DATA
export const COMPLIANCE_REQUIREMENTS: Record<string, ComplianceRequirement> = {
  "comp-001": {
    id: "comp-001",
    rfpId: "rfp-003",
    requirementType: "prime",
    farClause: "FAR 52.204-21",
    title: "Basic Safeguarding of Covered Contractor Information Systems",
    description: "Contractor must safeguard covered defense information that resides in or transits through contractor information systems",
    status: "drafted",
    response: "Our company maintains NIST 800-171 compliance with documented policies and procedures for safeguarding covered contractor information systems. We conduct annual assessments and maintain current POA&Ms for any identified gaps.",
    attachments: ["NIST-800-171-Assessment.pdf", "Cybersecurity-Policy.pdf"],
    dueDate: "2024-04-15",
    assignedTo: "tm-003"
  },
  "comp-002": {
    id: "comp-002", 
    rfpId: "rfp-003",
    requirementType: "prime",
    farClause: "FAR 52.222-50",
    title: "Combating Trafficking in Persons",
    description: "Prohibition against trafficking in persons including forced labor",
    status: "complete",
    response: "Our company policy strictly prohibits trafficking in persons. We maintain zero tolerance policies and provide annual training to all employees on recognizing and reporting potential trafficking situations.",
    attachments: ["Anti-Trafficking-Policy.pdf", "Training-Records.pdf"],
    dueDate: "2024-04-15",
    assignedTo: "tm-003"
  },
  "comp-003": {
    id: "comp-003",
    rfpId: "rfp-003", 
    requirementType: "prime",
    farClause: "FAR 52.219-14",
    title: "Limitations on Subcontracting",
    description: "Requirements for subcontracting plan and limitations on work performed by subcontractors",
    status: "pending",
    attachments: [],
    dueDate: "2024-04-15",
    assignedTo: "tm-001"
  }
};

// PRICING LINE ITEMS DATA
export const PRICING_LINE_ITEMS: Record<string, PricingLineItem> = {
  "price-001": {
    id: "price-001",
    clin: "0001",
    description: "Project Management and Administration",
    quantity: 160,
    unitPrice: 80,
    totalPrice: 12800,
    laborHours: 160,
    category: "labor"
  },
  "price-002": {
    id: "price-002", 
    clin: "0002",
    description: "Technical Writing Services",
    quantity: 80,
    unitPrice: 65,
    totalPrice: 5200,
    laborHours: 80,
    category: "labor"
  },
  "price-003": {
    id: "price-003",
    clin: "0003", 
    description: "Quality Management",
    quantity: 40,
    unitPrice: 75,
    totalPrice: 3000,
    laborHours: 40,
    category: "labor"
  },
  "price-004": {
    id: "price-004",
    clin: "0004",
    description: "HVAC Removal and Installation - Statewide HVAC",
    quantity: 1,
    unitPrice: 58397,
    totalPrice: 58397,
    laborHours: 320,
    materialCost: 25000,
    equipmentCost: 8000,
    subcontractorId: "sub-001",
    category: "subcontractor"
  },
  "price-005": {
    id: "price-005",
    clin: "0005",
    description: "Electrical Connections and Panel Upgrades",
    quantity: 1,
    unitPrice: 18500,
    totalPrice: 18500,
    laborHours: 120,
    materialCost: 8000,
    equipmentCost: 2000,
    subcontractorId: "sub-002",
    category: "subcontractor"
  },
  "price-006": {
    id: "price-006",
    clin: "0006",
    description: "Travel and Per Diem",
    quantity: 1,
    unitPrice: 2000,
    totalPrice: 2000,
    category: "travel"
  },
  "price-007": {
    id: "price-007",
    clin: "0007",
    description: "Overhead (10%)",
    quantity: 1,
    unitPrice: 9790,
    totalPrice: 9790,
    category: "overhead"
  },
  "price-008": {
    id: "price-008",
    clin: "0008",
    description: "G&A (5%)",
    quantity: 1,
    unitPrice: 5445,
    totalPrice: 5445,
    category: "overhead"
  },
  "price-009": {
    id: "price-009",
    clin: "0009",
    description: "Profit (8%)",
    quantity: 1,
    unitPrice: 9131,
    totalPrice: 9131,
    category: "overhead"
  }
};

// RFPS DATA
export const RFPS: Record<string, RFP> = {
  "rfp-001": {
    id: "rfp-001",
    title: "Due April 22",
    agency: "US Department of Labor",
    rfpNumber: "DOL-2024-001",
    dueDate: "2024-04-22",
    estimatedValue: "$150,000 - $200,000",
    readiness: 82,
    status: "in-progress",
    type: "fixed-price",
    description: "Professional services for policy analysis and documentation",
    location: "Washington, DC",
    performancePeriod: "12 months",
    assignedTeamMembers: ["tm-001", "tm-004"],
    selectedSubcontractors: [],
    pendingSubcontractors: [],
    complianceRequirements: [],
    pricingLineItems: [],
    documents: {
      originalRFP: "DOL-2024-001-RFP.pdf",
      attachments: ["SOW.pdf", "Wage-Determination.pdf"]
    },
    scope: {
      pwsDescription: "Provide policy analysis and documentation services",
      deliverables: ["Policy Analysis Report", "Documentation Package"],
      technicalRequirements: ["Security Clearance", "DC Metro Access"]
    },
    evaluationCriteria: {
      technical: 40,
      price: 30,
      pastPerformance: 30,
      awardType: "Best Value"
    }
  },
  "rfp-002": {
    id: "rfp-002",
    title: "Engineering Services IDIQ",
    agency: "US Army Corps of Engineers",
    rfpNumber: "USACE-2024-IDIQ-002",
    dueDate: "2024-05-15",
    estimatedValue: "$2M - $5M",
    readiness: 57,
    status: "draft",
    type: "cost-plus",
    description: "Indefinite Delivery/Indefinite Quantity contract for engineering services",
    location: "Multiple CONUS locations",
    performancePeriod: "5 years",
    assignedTeamMembers: ["tm-001", "tm-002", "tm-003"],
    selectedSubcontractors: [],
    pendingSubcontractors: [],
    complianceRequirements: [],
    pricingLineItems: [],
    documents: {
      originalRFP: "USACE-IDIQ-RFP.pdf",
      attachments: ["Technical-Specs.pdf", "Past-Performance-Requirements.pdf"]
    },
    scope: {
      pwsDescription: "Provide comprehensive engineering services across multiple disciplines",
      deliverables: ["Engineering Studies", "Design Plans", "Construction Support"],
      technicalRequirements: ["PE License", "AutoCAD Proficiency", "USACE Experience"]
    },
    evaluationCriteria: {
      technical: 50,
      price: 25,
      pastPerformance: 25,
      awardType: "Best Value"
    }
  },
  "rfp-003": {
    id: "rfp-003",
    title: "HVAC Replacement - Kent Middle School",
    agency: "GSA Region 6",
    rfpNumber: "RFP-2024-GSA-003",
    dueDate: "2024-04-15",
    estimatedValue: "$85,000 - $130,000",
    readiness: 65,
    status: "in-progress",
    type: "fixed-price",
    description: "Removal and replacement of rooftop HVAC units at federal building location",
    location: "Kent Middle School, Louisiana",
    performancePeriod: "90 days",
    assignedTeamMembers: ["tm-001", "tm-002", "tm-003", "tm-004"],
    selectedSubcontractors: ["sub-001"],
    pendingSubcontractors: ["sub-002"],
    complianceRequirements: ["comp-001", "comp-002", "comp-003"],
    pricingLineItems: ["price-001", "price-002", "price-003", "price-004", "price-005", "price-006", "price-007", "price-008", "price-009"],
    documents: {
      originalRFP: "GSA-HVAC-RFP.pdf",
      attachments: ["Site-Plans.pdf", "HVAC-Specifications.pdf", "Wage-Determination-SCA.pdf"]
    },
    scope: {
      pwsDescription: "Installation of rooftop HVAC units at federal building locations. Region 6. The contractor will remove existing rooftop units, install new ones, and conform to federal codes and regulations.",
      deliverables: [
        "Removal of existing rooftop HVAC units",
        "Procurement and installation of new rooftop HVAC units", 
        "Startup and testing of installed units",
        "Disposal of removed units",
        "As-built documentation"
      ],
      technicalRequirements: [
        "EPA 608 Universal Certification",
        "Louisiana HVAC License",
        "Federal building security clearance",
        "OSHA 30 Training"
      ]
    },
    evaluationCriteria: {
      technical: 35,
      price: 40,
      pastPerformance: 25,
      awardType: "Best Value"
    }
  },
  "rfp-004": {
    id: "rfp-004",
    title: "Transportation Consulting",
    agency: "Florida Department of Transportation",
    rfpNumber: "FDOT-2024-004",
    dueDate: "2024-06-01",
    estimatedValue: "$300,000 - $500,000",
    readiness: 73,
    status: "in-progress",
    type: "time-materials",
    description: "Transportation planning and traffic analysis consulting services",
    location: "Statewide Florida",
    performancePeriod: "18 months",
    assignedTeamMembers: ["tm-001", "tm-002"],
    selectedSubcontractors: [],
    pendingSubcontractors: [],
    complianceRequirements: [],
    pricingLineItems: [],
    documents: {
      originalRFP: "FDOT-Transportation-RFP.pdf",
      attachments: ["Traffic-Study-Requirements.pdf", "DBE-Goals.pdf"]
    },
    scope: {
      pwsDescription: "Provide transportation planning and traffic analysis services",
      deliverables: ["Traffic Studies", "Planning Reports", "Recommendations"],
      technicalRequirements: ["PE License in Florida", "Traffic Analysis Software", "GIS Proficiency"]
    },
    evaluationCriteria: {
      technical: 45,
      price: 35,
      pastPerformance: 20,
      awardType: "Best Value"
    }
  },
  "rfp-005": {
    id: "rfp-005",
    title: "HVAC Modernization - Federal Building",
    agency: "GSA Region 8",
    rfpNumber: "GSA-2024-005",
    dueDate: "2024-03-30",
    estimatedValue: "$200,000 - $350,000",
    readiness: 94,
    status: "submitted",
    type: "fixed-price",
    description: "Modernization of HVAC systems in federal office building",
    location: "Denver, CO",
    performancePeriod: "120 days",
    assignedTeamMembers: ["tm-001", "tm-003", "tm-005"],
    selectedSubcontractors: ["sub-001", "sub-002"],
    pendingSubcontractors: [],
    complianceRequirements: [],
    pricingLineItems: [],
    documents: {
      originalRFP: "GSA-Modernization-RFP.pdf",
      attachments: ["Building-Plans.pdf", "Energy-Requirements.pdf"],
      submittedProposal: "GSA-2024-005-Proposal-FINAL.pdf"
    },
    scope: {
      pwsDescription: "Comprehensive HVAC system modernization including controls upgrade",
      deliverables: ["System Installation", "Controls Integration", "Energy Commissioning"],
      technicalRequirements: ["Colorado HVAC License", "Energy Efficiency Certification"]
    },
    evaluationCriteria: {
      technical: 40,
      price: 35,
      pastPerformance: 25,
      awardType: "Best Value"
    }
  }
};

// Helper functions to get connected data
export const getRFPById = (id: string): RFP | undefined => RFPS[id];
export const getSubcontractorById = (id: string): Subcontractor | undefined => SUBCONTRACTORS[id];
export const getTeamMemberById = (id: string): TeamMember | undefined => TEAM_MEMBERS[id];
export const getComplianceRequirementById = (id: string): ComplianceRequirement | undefined => COMPLIANCE_REQUIREMENTS[id];
export const getPricingLineItemById = (id: string): PricingLineItem | undefined => PRICING_LINE_ITEMS[id];

export const getRFPTeamMembers = (rfpId: string): TeamMember[] => {
  const rfp = getRFPById(rfpId);
  if (!rfp) return [];
  return rfp.assignedTeamMembers.map(id => getTeamMemberById(id)).filter(Boolean) as TeamMember[];
};

export const getRFPSelectedSubcontractors = (rfpId: string): Subcontractor[] => {
  const rfp = getRFPById(rfpId);
  if (!rfp) return [];
  return rfp.selectedSubcontractors.map(id => getSubcontractorById(id)).filter(Boolean) as Subcontractor[];
};

export const getRFPPendingSubcontractors = (rfpId: string): Subcontractor[] => {
  const rfp = getRFPById(rfpId);
  if (!rfp) return [];
  return rfp.pendingSubcontractors.map(id => getSubcontractorById(id)).filter(Boolean) as Subcontractor[];
};

export const getRFPComplianceRequirements = (rfpId: string): ComplianceRequirement[] => {
  const rfp = getRFPById(rfpId);
  if (!rfp) return [];
  return rfp.complianceRequirements.map(id => getComplianceRequirementById(id)).filter(Boolean) as ComplianceRequirement[];
};

export const getRFPPricingLineItems = (rfpId: string): PricingLineItem[] => {
  const rfp = getRFPById(rfpId);
  if (!rfp) return [];
  return rfp.pricingLineItems.map(id => getPricingLineItemById(id)).filter(Boolean) as PricingLineItem[];
};

export const calculateRFPTotalPrice = (rfpId: string): number => {
  const lineItems = getRFPPricingLineItems(rfpId);
  return lineItems.reduce((total, item) => total + item.totalPrice, 0);
};

export const getAllRFPs = (): RFP[] => Object.values(RFPS);
export const getAllSubcontractors = (): Subcontractor[] => Object.values(SUBCONTRACTORS);
export const getAllTeamMembers = (): TeamMember[] => Object.values(TEAM_MEMBERS); 