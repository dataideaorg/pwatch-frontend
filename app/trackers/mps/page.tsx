'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchMPs, fetchMPSummary, MP, MPSummary } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const PARTY_COLORS = ['#085e29', '#f97316', '#2563eb', '#9333ea', '#ef4444', '#14b8a6', '#f59e0b'];

export default function MPsPage() {
  const [mps, setMps] = useState<MP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedParties, setSelectedParties] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedSearchTerms, setSelectedSearchTerms] = useState<string[]>([]);
  const [partyFilterTerm, setPartyFilterTerm] = useState('');
  const [districtFilterTerm, setDistrictFilterTerm] = useState('');
  const [searchFilterTerm, setSearchFilterTerm] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [partyDropdownOpen, setPartyDropdownOpen] = useState(false);
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [summary, setSummary] = useState<MPSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const districtOptions = useMemo(() => {
    const set = new Set<string>();
    mps.forEach((mp) => {
      if (mp.district) set.add(mp.district);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [mps]);

  const searchOptions = useMemo(() => {
    const set = new Set<string>();
    mps.forEach((mp) => {
      if (mp.name) set.add(mp.name);
      if (mp.constituency) set.add(mp.constituency);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [mps]);

  useEffect(() => {
    loadMPs();
  }, [selectedSearchTerms, selectedParties, selectedDistricts]);

  useEffect(() => {
    loadMPSummary();
  }, []);

  const loadMPs = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedSearchTerms.length > 0) filters.search = selectedSearchTerms.join(' ');
      if (selectedParties.length > 0) filters.party = selectedParties.join(',');
      if (selectedDistricts.length > 0) filters.district = selectedDistricts.join(',');

      const data = await fetchMPs(1, 20, filters);
      setMps(data.results);
      setHasMore(data.next !== null);
      setTotalCount(data.count);
      setPage(1);
      setError(null);
    } catch (err) {
      setError('Failed to load Members of Parliament. Please try again later.');
      console.error('Error fetching MPs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMPSummary = async () => {
    try {
      setSummaryLoading(true);
      const data = await fetchMPSummary();
      setSummary(data);
      setSummaryError(null);
    } catch (err) {
      console.error('Error fetching MP summary:', err);
      setSummaryError('Failed to load summary data.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const goToPage = async (newPage: number) => {
    if (loadingMore) return;

    try {
      setLoadingMore(true);
      const filters: any = {};
      if (selectedSearchTerms.length > 0) filters.search = selectedSearchTerms.join(' ');
      if (selectedParties.length > 0) filters.party = selectedParties.join(',');
      if (selectedDistricts.length > 0) filters.district = selectedDistricts.join(',');

      const data = await fetchMPs(newPage, 20, filters);
      setMps(data.results);
      setHasMore(data.next !== null);
      setPage(newPage);
    } catch (err) {
      setError('Failed to load MPs.');
      console.error('Error fetching MPs:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadMPs();
  };

  const toggleSelection = (value: string, list: string[], setter: (v: string[]) => void) => {
    if (!value) return;
    setter(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="support" />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Loading Members of Parliament...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && mps.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="support" />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadMPs}
              className="mt-4 bg-[#085e29] text-white px-6 py-2 rounded-md hover:bg-[#064920] transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="support" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Members of Parliament
          </h1>
          <p className="text-gray-600">
            Browse and search for your representatives in Parliament
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {totalCount} {totalCount === 1 ? 'MP' : 'MPs'} found
          </p>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <p className="text-sm text-gray-500">Total MPs</p>
            {summaryLoading ? (
              <div className="h-8 w-20 mt-2 bg-gray-200 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.total_mps ?? 0}</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <p className="text-sm text-gray-500">Total Parties</p>
            {summaryLoading ? (
              <div className="h-8 w-20 mt-2 bg-gray-200 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.total_parties ?? 0}</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <p className="text-sm text-gray-500">Total Districts</p>
            {summaryLoading ? (
              <div className="h-8 w-20 mt-2 bg-gray-200 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.total_districts ?? 0}</p>
            )}
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by Name or Constituency
                </label>
                <DropdownMenu open={searchDropdownOpen} onOpenChange={setSearchDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between text-gray-600">
                      {selectedSearchTerms.length > 0
                        ? `${selectedSearchTerms.length} selected`
                        : 'Select names/constituencies'}
                      <span className="text-gray-400 text-xs ml-2">▼</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full" align="start" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DropdownMenuLabel>Search options</DropdownMenuLabel>
                    <div className="px-2 pb-2">
                      <Input
                        placeholder="Type to filter..."
                        value={searchFilterTerm}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSearchFilterTerm(e.target.value);
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className="h-9"
                        autoFocus
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <div className="max-h-64 overflow-y-auto">
                      {searchOptions
                        .filter((opt) => opt.toLowerCase().includes(searchFilterTerm.toLowerCase()))
                        .map((option) => (
                          <DropdownMenuCheckboxItem
                            key={option}
                            checked={selectedSearchTerms.includes(option)}
                            onCheckedChange={() =>
                              toggleSelection(option, selectedSearchTerms, setSelectedSearchTerms)
                            }
                          >
                            {option}
                          </DropdownMenuCheckboxItem>
                        ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Party
                </label>
                <DropdownMenu open={partyDropdownOpen} onOpenChange={setPartyDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between text-gray-600">
                      {selectedParties.length > 0 ? `${selectedParties.length} selected` : 'All Parties'}
                      <span className="text-gray-400 text-xs ml-2">▼</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full" align="start" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DropdownMenuLabel>Parties</DropdownMenuLabel>
                    <div className="px-2 pb-2">
                      <Input
                        placeholder="Type to filter..."
                        value={partyFilterTerm}
                        onChange={(e) => {
                          e.stopPropagation();
                          setPartyFilterTerm(e.target.value);
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className="h-9"
                        autoFocus
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <div className="max-h-64 overflow-y-auto">
                      {['nrm', 'nup', 'fdc', 'dp', 'independent', 'other']
                        .filter((p) => p.toLowerCase().includes(partyFilterTerm.toLowerCase()))
                        .map((party) => (
                          <DropdownMenuCheckboxItem
                            key={party}
                            checked={selectedParties.includes(party)}
                            onCheckedChange={() => toggleSelection(party, selectedParties, setSelectedParties)}
                          >
                            {party.toUpperCase()}
                          </DropdownMenuCheckboxItem>
                        ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by District
                </label>
                <DropdownMenu open={districtDropdownOpen} onOpenChange={setDistrictDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between text-gray-600">
                      {selectedDistricts.length > 0 ? `${selectedDistricts.length} selected` : 'All Districts'}
                      <span className="text-gray-400 text-xs ml-2">▼</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full" align="start" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DropdownMenuLabel>Districts</DropdownMenuLabel>
                    <div className="px-2 pb-2">
                      <Input
                        placeholder="Type to filter..."
                        value={districtFilterTerm}
                        onChange={(e) => {
                          e.stopPropagation();
                          setDistrictFilterTerm(e.target.value);
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className="h-9"
                        autoFocus
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <div className="max-h-64 overflow-y-auto">
                      {districtOptions
                        .filter((d) => d.toLowerCase().includes(districtFilterTerm.toLowerCase()))
                        .map((district) => (
                          <DropdownMenuCheckboxItem
                            key={district}
                            checked={selectedDistricts.includes(district)}
                            onCheckedChange={() =>
                              toggleSelection(district, selectedDistricts, setSelectedDistricts)
                            }
                          >
                            {district}
                          </DropdownMenuCheckboxItem>
                        ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#085e29] text-white px-6 py-2 rounded-md hover:bg-[#064920] transition-colors"
              >
                Search
              </button>
              {(selectedSearchTerms.length || selectedParties.length || selectedDistricts.length) ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSearchTerms([]);
                    setSelectedParties([]);
                    setSelectedDistricts([]);
                    setSearchFilterTerm('');
                    setPartyFilterTerm('');
                    setDistrictFilterTerm('');
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          </form>
        </div>

        {/* MPs Table and Party Distribution Chart */}
        {mps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No MPs found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* MPs Table */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Party
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Constituency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          District
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mps.map((mp) => (
                        <tr key={mp.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#085e29] to-[#064920] flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                  {mp.photo ? (
                                    <img
                                      src={mp.photo}
                                      alt={mp.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span>
                                      {mp.first_name[0]}
                                      {mp.last_name[0]}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {mp.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#085e29] text-white">
                              {mp.party}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{mp.constituency}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{mp.district}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {mp.phone_no && (
                                <div className="">{mp.phone_no}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/trackers/mps/${mp.id}`}
                              className="text-[#085e29] hover:text-[#064920] font-medium"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Controls */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {page} of {Math.ceil(totalCount / 20)} ({totalCount} total MPs)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1 || loadingMore}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={!hasMore || loadingMore}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loadingMore ? 'Loading...' : 'Next'}
                  </button>
                </div>
              </div>
            </div>

            {/* Party Distribution Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 self-start">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">Party Distribution</h3>
                <p className="text-sm text-gray-500">Share of MPs by political party</p>
              </div>

              {summaryLoading ? (
                <div className="h-72 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#085e29]" />
                </div>
              ) : summary && summary.party_distribution.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summary.party_distribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          dataKey="percentage"
                          nameKey="party"
                          paddingAngle={1}
                          label={({ value }) => `${value}%`}
                        >
                          {summary.party_distribution.map((entry, index) => (
                            <Cell key={entry.party} fill={PARTY_COLORS[index % PARTY_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, _name: string, payload: any) => {
                            const partyName = payload?.payload?.party || 'Party';
                            return [`${value}%`, partyName];
                          }}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {summary.party_distribution.map((item, index) => (
                      <div key={item.party} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: PARTY_COLORS[index % PARTY_COLORS.length] }}
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.party || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{item.count} MPs</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">
                  {summaryError || 'No party distribution data available.'}
                </p>
              )}
            </div>
          </div>
        )}

        {error && mps.length > 0 && (
          <div className="mt-4 text-center text-red-600">
            <p>{error}</p>
          </div>
        )}
      </main>
    </div>
  );
}