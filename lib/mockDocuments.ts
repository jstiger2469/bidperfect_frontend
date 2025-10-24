// Mock Document System with Real Content
export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'txt';
  size: string;
  lastModified: string;
  url: string;
  content?: string; // For display purposes
  status: 'uploaded' | 'draft' | 'missing';
  version: number;
}

export interface DocumentCategory {
  id: string;
  name: string;
  documents: Document[];
  required: boolean;
}

// Mock PDF/Document content for viewing
const generateMockPDFContent = (title: string, content: string) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body { font-family: 'Times New Roman', serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin: 20px 0; }
        .page-number { position: fixed; bottom: 20px; right: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <p>RFP-2024-GSA-003: HVAC Replacement - Kent Middle School</p>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
    </div>
    <div class="content">
        ${content}
    </div>
    <div class="page-number">Page 1</div>
</body>
</html>
  `;
};

export const MOCK_DOCUMENTS: Record<string, DocumentCategory> = {
  'technical-proposals': {
    id: 'technical-proposals',
    name: 'Technical Proposals',
    required: true,
    documents: [
      {
        id: 'tech-proposal-v2',
        name: 'Technical_Proposal_HVAC_v2.pdf',
        type: 'pdf',
        size: '2.4 MB',
        lastModified: '2024-07-15T10:30:00Z',
        url: '/api/documents/technical-proposal',
        status: 'uploaded',
        version: 2,
        content: generateMockPDFContent('Technical Proposal - HVAC Replacement', `
          <div class="section">
            <h2>1. Executive Summary</h2>
            <p>Our company proposes a comprehensive HVAC replacement solution for Kent Middle School, leveraging our 15+ years of experience in federal building maintenance and our proven track record with GSA projects.</p>
          </div>
          <div class="section">
            <h2>2. Technical Approach</h2>
            <h3>2.1 Removal of Existing Units</h3>
            <p>We will safely remove four existing rooftop HVAC units (Models RTU-15A, RTU-20B) using certified crane equipment and EPA-compliant refrigerant recovery procedures.</p>
            <h3>2.2 Installation of New Units</h3>
            <p>Installation of four Carrier 50TCQ units (SEER 16.5) with advanced controls and monitoring systems.</p>
          </div>
          <div class="section">
            <h2>3. Project Schedule</h2>
            <p>Total project duration: 120 calendar days from award date</p>
            <ul>
              <li>Mobilization and setup: Days 1-5</li>
              <li>Unit removal: Days 6-25</li>
              <li>New unit installation: Days 26-90</li>
              <li>Testing and commissioning: Days 91-115</li>
              <li>Final inspection and closeout: Days 116-120</li>
            </ul>
          </div>
        `)
      }
    ]
  },
  'past-performance': {
    id: 'past-performance',
    name: 'Past Performance',
    required: true,
    documents: [
      {
        id: 'past-perf-draft',
        name: 'Past_Performance_References_DRAFT.pdf',
        type: 'pdf',
        size: '1.8 MB',
        lastModified: '2024-07-12T14:20:00Z',
        url: '/api/documents/past-performance',
        status: 'draft',
        version: 1,
        content: generateMockPDFContent('Past Performance References', `
          <div class="section">
            <h2>Reference 1: GSA Building 402 HVAC Modernization</h2>
            <p><strong>Client:</strong> General Services Administration - Region 6</p>
            <p><strong>Contract Value:</strong> $185,000</p>
            <p><strong>Period:</strong> March 2022 - August 2022</p>
            <p><strong>Description:</strong> Complete replacement of rooftop HVAC systems in 45,000 sq ft federal office building.</p>
            <p><strong>Contact:</strong> Sarah Martinez, GSA Project Manager<br>
            Phone: (504) 555-0123 | Email: sarah.martinez@gsa.gov</p>
          </div>
          <div class="section">
            <h2>Reference 2: Orleans Parish School Board - Jefferson Elementary</h2>
            <p><strong>Client:</strong> Orleans Parish School Board</p>
            <p><strong>Contract Value:</strong> $142,000</p>
            <p><strong>Period:</strong> June 2023 - October 2023</p>
            <p><strong>Description:</strong> HVAC replacement and indoor air quality improvements during summer break.</p>
            <p><strong>Contact:</strong> Michael Thompson, Facilities Director<br>
            Phone: (504) 555-0456 | Email: mthompson@opsb.net</p>
          </div>
          <div class="section">
            <h2>Reference 3: Tulane University - Science Building HVAC</h2>
            <p><strong>Client:</strong> Tulane University</p>
            <p><strong>Contract Value:</strong> $220,000</p>
            <p><strong>Period:</strong> January 2023 - May 2023</p>
            <p><strong>Description:</strong> Energy-efficient HVAC system replacement with smart controls integration.</p>
            <p><strong>Contact:</strong> Dr. Jennifer Clark, Facilities Manager<br>
            Phone: (504) 555-0789 | Email: jclark@tulane.edu</p>
          </div>
        `)
      }
    ]
  },
  'pricing-documents': {
    id: 'pricing-documents',
    name: 'Pricing Documents',
    required: true,
    documents: [
      {
        id: 'pricing-sheet-v1',
        name: 'Pricing_Sheet_Final.xlsx',
        type: 'xlsx',
        size: '456 KB',
        lastModified: '2024-07-14T16:45:00Z',
        url: '/api/documents/pricing-sheet',
        status: 'uploaded',
        version: 1,
        content: `
          <div class="section">
            <h2>HVAC Replacement Project - Pricing Breakdown</h2>
            <table border="1" style="width:100%; border-collapse: collapse;">
              <tr style="background-color: #f0f0f0;">
                <th>CLIN</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Price</th>
              </tr>
              <tr>
                <td>0001</td>
                <td>Removal of existing HVAC units</td>
                <td>4 units</td>
                <td>$4,625.00</td>
                <td>$18,500.00</td>
              </tr>
              <tr>
                <td>0002</td>
                <td>Installation of new HVAC units</td>
                <td>4 units</td>
                <td>$13,800.00</td>
                <td>$55,200.00</td>
              </tr>
              <tr>
                <td>0003</td>
                <td>Electrical connections (subcontracted)</td>
                <td>4 connections</td>
                <td>$3,050.00</td>
                <td>$12,200.00</td>
              </tr>
              <tr>
                <td>0004</td>
                <td>Disposal and cleanup</td>
                <td>1 lot</td>
                <td>$15,138.00</td>
                <td>$15,138.00</td>
              </tr>
              <tr style="background-color: #e0e0e0; font-weight: bold;">
                <td colspan="4">TOTAL BASE PRICE</td>
                <td>$101,038.00</td>
              </tr>
              <tr>
                <td colspan="4">Overhead (22%)</td>
                <td>$22,228.36</td>
              </tr>
              <tr>
                <td colspan="4">Profit (12.5%)</td>
                <td>$15,408.30</td>
              </tr>
              <tr style="background-color: #d0d0d0; font-weight: bold;">
                <td colspan="4">TOTAL EVALUATED PRICE</td>
                <td>$138,674.66</td>
              </tr>
            </table>
          </div>
        `
      }
    ]
  },
  'compliance-certifications': {
    id: 'compliance-certifications',
    name: 'Compliance Certifications',
    required: true,
    documents: [
      {
        id: 'general-certs',
        name: 'General_Certifications.pdf',
        type: 'pdf',
        size: '1.2 MB',
        lastModified: '2024-07-10T09:15:00Z',
        url: '/api/documents/general-certs',
        status: 'uploaded',
        version: 1,
        content: generateMockPDFContent('General Certifications', `
          <div class="section">
            <h2>Small Business Administration (SBA) Certification</h2>
            <p><strong>Certification Number:</strong> SBA-2024-LA-00234</p>
            <p><strong>Type:</strong> Small Disadvantaged Business (SDB)</p>
            <p><strong>Valid Through:</strong> December 31, 2024</p>
          </div>
          <div class="section">
            <h2>Equal Employment Opportunity (EEO) Certification</h2>
            <p><strong>Certification Date:</strong> January 15, 2024</p>
            <p><strong>Valid Through:</strong> January 14, 2025</p>
            <p>This certifies compliance with EEO requirements under 41 CFR 60-1.4(a)</p>
          </div>
          <div class="section">
            <h2>EPA 608 Certification</h2>
            <p><strong>Technician:</strong> David Chen</p>
            <p><strong>Certification Level:</strong> Universal</p>
            <p><strong>Certificate Number:</strong> EPA-608-2023-45678</p>
            <p><strong>Expiration:</strong> March 15, 2027</p>
          </div>
        `)
      }
    ]
  },
  'insurance-documents': {
    id: 'insurance-documents',
    name: 'Insurance Documentation',
    required: true,
    documents: [
      {
        id: 'insurance-certs',
        name: 'Insurance_Certificates.pdf',
        type: 'pdf',
        size: '2.1 MB',
        lastModified: '2024-07-10T14:20:00Z',
        url: '/api/documents/insurance-certs',
        status: 'uploaded',
        version: 1,
        content: generateMockPDFContent('Insurance Certificates', `
          <div class="section">
            <h2>General Liability Insurance</h2>
            <p><strong>Insurer:</strong> Louisiana Mutual Insurance Company</p>
            <p><strong>Policy Number:</strong> GL-2024-567890</p>
            <p><strong>Coverage Amount:</strong> $2,000,000 per occurrence / $4,000,000 aggregate</p>
            <p><strong>Effective Period:</strong> January 1, 2024 - December 31, 2024</p>
          </div>
          <div class="section">
            <h2>Workers' Compensation Insurance</h2>
            <p><strong>Insurer:</strong> State Compensation Insurance Fund</p>
            <p><strong>Policy Number:</strong> WC-2024-123456</p>
            <p><strong>Coverage:</strong> Statutory Limits</p>
            <p><strong>Effective Period:</strong> January 1, 2024 - December 31, 2024</p>
          </div>
          <div class="section">
            <h2>Additional Insured Endorsement</h2>
            <p>General Services Administration is named as additional insured for contract RFP-2024-GSA-003</p>
          </div>
        `)
      }
    ]
  }
};

// Mock API endpoints for document viewing
export const createDocumentViewerUrl = (documentId: string): string => {
  return `data:text/html;charset=utf-8,${encodeURIComponent(
    MOCK_DOCUMENTS[Object.keys(MOCK_DOCUMENTS).find(key => 
      MOCK_DOCUMENTS[key].documents.some(doc => doc.id === documentId)
    ) || '']?.documents.find(doc => doc.id === documentId)?.content || 'Document not found'
  )}`;
};

export const getDocumentById = (docId: string): Document | null => {
  for (const category of Object.values(MOCK_DOCUMENTS)) {
    const doc = category.documents.find(d => d.id === docId);
    if (doc) return doc;
  }
  return null;
};

export const updateDocumentStatus = (docId: string, newStatus: Document['status']): void => {
  for (const category of Object.values(MOCK_DOCUMENTS)) {
    const doc = category.documents.find(d => d.id === docId);
    if (doc) {
      doc.status = newStatus;
      doc.lastModified = new Date().toISOString();
      if (newStatus === 'uploaded') {
        doc.version += 1;
      }
    }
  }
}; 