// Comprehensive Subcontractor Selection System
export interface SubcontractorOption {
  id: string;
  name: string;
  type: 'electrical' | 'hvac' | 'plumbing' | 'general';
  specialty: string[];
  rating: number;
  experience: string;
  location: string;
  capacity: string;
  pricing: {
    laborRate: number;
    markup: number;
    estimatedTotal: number;
    competitiveRank: number; // 1 = most competitive
  };
  qualifications: string[];
  pastPerformance: {
    projectName: string;
    value: number;
    year: number;
    clientRating: number;
  }[];
  availability: {
    startDate: string;
    duration: string;
    conflictRisk: 'low' | 'medium' | 'high';
  };
  complianceStatus: {
    insurance: boolean;
    licensing: boolean;
    bonding: boolean;
    security: boolean;
    osha: boolean;
    overallScore: number;
  };
  strengths: string[];
  concerns: string[];
  recommendationScore: number; // 0-100
}

export interface SubcontractorSelection {
  rfpId: string;
  category: string;
  requiredSpecialty: string;
  selectedSubcontractor: string | null;
  alternateOptions: string[];
  selectionCriteria: {
    priceWeight: number;
    qualityWeight: number;
    scheduleWeight: number;
    experienceWeight: number;
  };
  status: 'pending' | 'selected' | 'contracted' | 'backup-needed';
  notes: string;
  lastUpdated: string;
}

// Mock Subcontractor Database
export const SUBCONTRACTOR_DATABASE: SubcontractorOption[] = [
  // Electrical Subcontractors
  {
    id: 'sub-elec-001',
    name: 'Bay Electric Inc.',
    type: 'electrical',
    specialty: ['Commercial Electrical', 'HVAC Electrical', 'Controls'],
    rating: 4.8,
    experience: '25+ years commercial electrical work',
    location: 'New Orleans, LA (8 miles from site)',
    capacity: '+15% available',
    pricing: {
      laborRate: 85,
      markup: 15,
      estimatedTotal: 12200,
      competitiveRank: 1
    },
    qualifications: [
      'Louisiana Master Electrician License #ME-4421',
      'OSHA 30-hour Certified',
      'NECA Member',
      'IES Certified Controls Specialist'
    ],
    pastPerformance: [
      {
        projectName: 'Tulane Hospital Electrical Upgrade',
        value: 180000,
        year: 2023,
        clientRating: 4.9
      },
      {
        projectName: 'GSA Federal Building - 2nd Floor Renovation',
        value: 95000,
        year: 2022,
        clientRating: 4.7
      },
      {
        projectName: 'Orleans Parish School Board - Multiple Sites',
        value: 220000,
        year: 2023,
        clientRating: 4.8
      }
    ],
    availability: {
      startDate: '2024-08-01',
      duration: '30 days',
      conflictRisk: 'low'
    },
    complianceStatus: {
      insurance: true,
      licensing: true,
      bonding: true,
      security: true,
      osha: true,
      overallScore: 100
    },
    strengths: [
      'Proven GSA experience',
      'Local presence reduces travel costs',
      'Excellent safety record (0 incidents in 3 years)',
      'Strong HVAC electrical expertise'
    ],
    concerns: [
      'Slightly higher rate than competitors',
      'May be overbooked during peak season'
    ],
    recommendationScore: 95
  },
  {
    id: 'sub-elec-002',
    name: 'Statewide Electrical Services',
    type: 'electrical',
    specialty: ['Industrial Electrical', 'Power Systems', 'Emergency Services'],
    rating: 4.5,
    experience: '18 years industrial and commercial electrical',
    location: 'Metairie, LA (12 miles from site)',
    capacity: '+5% available',
    pricing: {
      laborRate: 78,
      markup: 18,
      estimatedTotal: 11800,
      competitiveRank: 2
    },
    qualifications: [
      'Louisiana Journeyman Electrician License #JE-7892',
      'OSHA 10-hour Certified',
      'IBEW Local 130 Member'
    ],
    pastPerformance: [
      {
        projectName: 'Port of New Orleans Electrical Systems',
        value: 340000,
        year: 2023,
        clientRating: 4.6
      },
      {
        projectName: 'Jefferson Parish Government Building',
        value: 125000,
        year: 2022,
        clientRating: 4.4
      }
    ],
    availability: {
      startDate: '2024-08-15',
      duration: '35 days',
      conflictRisk: 'medium'
    },
    complianceStatus: {
      insurance: true,
      licensing: true,
      bonding: true,
      security: false,
      osha: true,
      overallScore: 85
    },
    strengths: [
      'Lower pricing than Bay Electric',
      'Strong industrial experience',
      'Fast response time'
    ],
    concerns: [
      'Less experience with federal projects',
      'Missing security clearance',
      'Potential scheduling conflicts'
    ],
    recommendationScore: 72
  },
  {
    id: 'sub-elec-003',
    name: 'Gulf Coast Power Solutions',
    type: 'electrical',
    specialty: ['Power Distribution', 'Controls', 'Renewable Energy'],
    rating: 4.2,
    experience: '12 years commercial electrical and controls',
    location: 'Kenner, LA (18 miles from site)',
    capacity: '-10% overbooked',
    pricing: {
      laborRate: 72,
      markup: 22,
      estimatedTotal: 13500,
      competitiveRank: 3
    },
    qualifications: [
      'Louisiana Electrical Contractor License #EC-9934',
      'OSHA 30-hour Certified',
      'Schneider Electric Certified Partner'
    ],
    pastPerformance: [
      {
        projectName: 'Louis Armstrong Airport Terminal Electrical',
        value: 280000,
        year: 2022,
        clientRating: 4.3
      }
    ],
    availability: {
      startDate: '2024-09-01',
      duration: '45 days',
      conflictRisk: 'high'
    },
    complianceStatus: {
      insurance: true,
      licensing: true,
      bonding: false,
      security: true,
      osha: true,
      overallScore: 75
    },
    strengths: [
      'Strong controls expertise',
      'Airport security experience',
      'Latest technology focus'
    ],
    concerns: [
      'Currently overbooked',
      'Limited federal project experience',
      'Missing bonding requirements',
      'Later start date'
    ],
    recommendationScore: 58
  },
  // HVAC Subcontractors
  {
    id: 'sub-hvac-001',
    name: 'Statewide HVAC',
    type: 'hvac',
    specialty: ['Commercial HVAC', 'Energy Efficient Systems', 'Controls Integration'],
    rating: 4.9,
    experience: '22+ years commercial HVAC installations',
    location: 'New Orleans, LA (5 miles from site)',
    capacity: '+25% available',
    pricing: {
      laborRate: 95,
      markup: 12,
      estimatedTotal: 75600,
      competitiveRank: 1
    },
    qualifications: [
      'EPA 608 Universal Certification',
      'NATE Certified Technicians (4)',
      'OSHA 30-hour Certified',
      'Louisiana Mechanical Contractor License #MC-5567'
    ],
    pastPerformance: [
      {
        projectName: 'GSA Building 402 HVAC Modernization',
        value: 185000,
        year: 2022,
        clientRating: 4.9
      },
      {
        projectName: 'Orleans Parish School Board - Jefferson Elementary',
        value: 142000,
        year: 2023,
        clientRating: 4.8
      },
      {
        projectName: 'Tulane University Science Building',
        value: 220000,
        year: 2023,
        clientRating: 4.9
      }
    ],
    availability: {
      startDate: '2024-07-25',
      duration: '90 days',
      conflictRisk: 'low'
    },
    complianceStatus: {
      insurance: true,
      licensing: true,
      bonding: true,
      security: true,
      osha: true,
      overallScore: 100
    },
    strengths: [
      'Excellent GSA project history',
      'Local presence and quick response',
      'Certified energy efficiency specialists',
      'Perfect safety record'
    ],
    concerns: [],
    recommendationScore: 98
  }
];

// Selection Management Functions
export const getSubcontractorsBySpecialty = (specialty: string): SubcontractorOption[] => {
  return SUBCONTRACTOR_DATABASE.filter(sub => 
    sub.specialty.some(s => s.toLowerCase().includes(specialty.toLowerCase())) ||
    sub.type === specialty.toLowerCase()
  ).sort((a, b) => b.recommendationScore - a.recommendationScore);
};

export const selectSubcontractor = (
  rfpId: string,
  category: string,
  subcontractorId: string,
  notes: string = ''
): SubcontractorSelection => {
  return {
    rfpId,
    category,
    requiredSpecialty: category,
    selectedSubcontractor: subcontractorId,
    alternateOptions: [],
    selectionCriteria: {
      priceWeight: 30,
      qualityWeight: 40,
      scheduleWeight: 20,
      experienceWeight: 10
    },
    status: 'selected',
    notes,
    lastUpdated: new Date().toISOString()
  };
};

export const calculateSelectionScore = (
  subcontractor: SubcontractorOption,
  criteria: SubcontractorSelection['selectionCriteria']
): number => {
  const priceScore = (4 - subcontractor.pricing.competitiveRank) * 25; // Higher rank = lower score
  const qualityScore = subcontractor.rating * 20;
  const scheduleScore = subcontractor.availability.conflictRisk === 'low' ? 100 : 
                       subcontractor.availability.conflictRisk === 'medium' ? 70 : 40;
  const experienceScore = subcontractor.pastPerformance.length * 20;
  
  return Math.round(
    (priceScore * criteria.priceWeight +
     qualityScore * criteria.qualityWeight +
     scheduleScore * criteria.scheduleWeight +
     experienceScore * criteria.experienceWeight) / 100
  );
};

export const getRecommendedSubcontractor = (specialty: string): SubcontractorOption | null => {
  const options = getSubcontractorsBySpecialty(specialty);
  return options.length > 0 ? options[0] : null;
};

export const compareSubcontractors = (subIds: string[]): SubcontractorOption[] => {
  return subIds.map(id => SUBCONTRACTOR_DATABASE.find(sub => sub.id === id)!)
    .filter(Boolean)
    .sort((a, b) => b.recommendationScore - a.recommendationScore);
}; 