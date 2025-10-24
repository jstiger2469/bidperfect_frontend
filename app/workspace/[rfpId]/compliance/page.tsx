'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  ExternalLink,
  Zap,
  Download,
  Upload
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useComplianceRequirements } from '@/lib/hooks';
import { useRFPData } from '@/lib/hooks';

interface ComplianceRow {
  id: string;
  section: string;
  requirement: string;
  coverage: 'Covered' | 'Partial' | 'Missing';
  artifacts: string[];
  anchors: string[];
  clauseFamily?: string;
  expiry?: string;
  evidence?: string;
}

export default function CompliancePage({ params }: { params: Promise<{ rfpId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rfpId, setRfpId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [coverageText, setCoverageText] = useState('');
  const [isCheckingCoverage, setIsCheckingCoverage] = useState(false);
  const [coverageResult, setCoverageResult] = useState<any>(null);

  // Extract RFP ID from params
  useEffect(() => {
    params.then(({ rfpId: extractedRfpId }) => {
      setRfpId(extractedRfpId);
    });
  }, [params]);

  const { data: rfpData, loading: rfpLoading } = useRFPData(rfpId);
  const { data: complianceData, loading: complianceLoading, refetch } = useComplianceRequirements(rfpData?.id || '');

  // Get the specific row from URL params
  const targetRow = searchParams.get('row');

  const getCoverageColor = (coverage: string) => {
    switch (coverage) {
      case 'Covered': return 'bg-green-100 text-green-800';
      case 'Partial': return 'bg-yellow-100 text-yellow-800';
      case 'Missing': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCoverageIcon = (coverage: string) => {
    switch (coverage) {
      case 'Covered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Partial': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'Missing': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleCheckCoverage = async () => {
    if (!coverageText.trim() || !rfpData?.id) return;
    
    setIsCheckingCoverage(true);
    try {
      const response = await fetch(`http://localhost:3001/rfp/${rfpData.id}/compliance/coverage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: coverageText })
      });
      const result = await response.json();
      setCoverageResult(result);
    } catch (error) {
      console.error('Coverage check failed:', error);
    } finally {
      setIsCheckingCoverage(false);
    }
  };

  const handleRefreshCompliance = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  const filteredRows = complianceData?.tieOut?.filter((row: any) => {
    const matchesSearch = !searchQuery || 
      row.requirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.section.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSection = selectedSection === 'all' || row.section === selectedSection;
    const matchesFamily = selectedFamily === 'all' || row.clauseFamily === selectedFamily;
    
    return matchesSearch && matchesSection && matchesFamily;
  }) || [];

  const sections = [...new Set(complianceData?.tieOut?.map((row: any) => row.section) || [])];
  const families = [...new Set(complianceData?.tieOut?.map((row: any) => row.clauseFamily).filter(Boolean) || [])];

  if (rfpLoading || complianceLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Compliance Matrix</h1>
                  <p className="text-sm text-gray-500">
                    {rfpData?.title || 'RFP Compliance Requirements'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefreshCompliance}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => router.push(`/workspace/${rfpId}/kanban`)}
                variant="outline"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Board
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search requirements..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Section Filter */}
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Sections</option>
                    {sections.map((section) => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>

                  {/* Family Filter */}
                  <select
                    value={selectedFamily}
                    onChange={(e) => setSelectedFamily(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Families</option>
                    {families.map((family) => (
                      <option key={family} value={family}>{family}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Rows */}
            <div className="space-y-4">
              {filteredRows.map((row: any, index: number) => (
                <motion.div
                  key={row.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 border rounded-lg ${
                    targetRow === row.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">{row.section}</Badge>
                        <Badge className={getCoverageColor(row.coverage)}>
                          {getCoverageIcon(row.coverage)}
                          {row.coverage}
                        </Badge>
                        {row.clauseFamily && (
                          <Badge variant="outline">{row.clauseFamily}</Badge>
                        )}
                        {row.expiry && (
                          <Badge variant="outline" className="text-orange-600">
                            Expires: {new Date(row.expiry).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-2">{row.requirement}</h3>
                      
                      {row.artifacts && row.artifacts.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Artifacts:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {row.artifacts.map((artifact: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {artifact}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {row.anchors && row.anchors.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Anchors:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {row.anchors.map((anchor: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                {anchor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {row.evidence && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                          <strong>Evidence:</strong> {row.evidence}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/workspace/${rfpId}/draft?node=${row.id}`)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Open in Draft
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/workspace/${rfpId}/kanban?row=${row.id}`)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Card
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Coverage Check */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Draft Coverage Check</CardTitle>
                <CardDescription>
                  Paste draft text to check coverage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={coverageText}
                  onChange={(e) => setCoverageText(e.target.value)}
                  placeholder="Paste your draft text here..."
                  className="w-full h-32 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                />
                
                <Button
                  onClick={handleCheckCoverage}
                  disabled={!coverageText.trim() || isCheckingCoverage}
                  className="w-full"
                >
                  {isCheckingCoverage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Check Coverage
                    </>
                  )}
                </Button>
                
                {coverageResult && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Coverage Summary:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Covered:</span>
                        <Badge className="bg-green-100 text-green-800">
                          {coverageResult.covered || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Partial:</span>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {coverageResult.partial || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Missing:</span>
                        <Badge className="bg-red-100 text-red-800">
                          {coverageResult.missing || 0}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Compliance Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Requirements:</span>
                    <span className="font-medium">{complianceData?.tieOut?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Covered:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {complianceData?.tieOut?.filter((r: any) => r.coverage === 'Covered').length || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Partial:</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {complianceData?.tieOut?.filter((r: any) => r.coverage === 'Partial').length || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Missing:</span>
                    <Badge className="bg-red-100 text-red-800">
                      {complianceData?.tieOut?.filter((r: any) => r.coverage === 'Missing').length || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
