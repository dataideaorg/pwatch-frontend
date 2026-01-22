'use client';

import { useState, useEffect } from 'react';
import { 
  fetchWhoWeAre, 
  fetchOurStory, 
  fetchWhatSetsUsApart, 
  fetchPartners, 
  fetchTeamMembers,
  WhoWeAre,
  OurStory,
  WhatSetsUsApart,
  Partner,
  TeamMember
} from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function AboutPage() {
  const [whoWeAre, setWhoWeAre] = useState<WhoWeAre | null>(null);
  const [ourStory, setOurStory] = useState<OurStory | null>(null);
  const [whatSetsUsApart, setWhatSetsUsApart] = useState<WhatSetsUsApart[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [whoWeAreData, ourStoryData, whatSetsUsApartData, partnersData, teamData] = await Promise.all([
        fetchWhoWeAre(),
        fetchOurStory(),
        fetchWhatSetsUsApart(),
        fetchPartners(),
        fetchTeamMembers(),
      ]);
      setWhoWeAre(whoWeAreData);
      setOurStory(ourStoryData);
      setWhatSetsUsApart(whatSetsUsApartData);
      setPartners(partnersData);
      setTeamMembers(teamData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading about page data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016]"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={loadData}
              className="mt-4 px-4 py-2 bg-[#2d5016] text-white rounded-md hover:bg-[#1b3d26] transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Who We Are Section */}
        {whoWeAre && (
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              {whoWeAre.title}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {whoWeAre.image && (
                <div className="relative h-96 rounded-lg overflow-hidden">
                  <img
                    src={whoWeAre.image.startsWith('http') ? whoWeAre.image : `${API_BASE_URL.replace('/api', '')}${whoWeAre.image}`}
                    alt={whoWeAre.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div
                className="prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: whoWeAre.content }}
              />
            </div>
          </section>
        )}

        {/* Our Story Section */}
        {ourStory && (
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              {ourStory.title}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div
                className="prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: ourStory.content }}
              />
              {ourStory.image && (
                <div className="relative h-96 rounded-lg overflow-hidden">
                  <img
                    src={ourStory.image.startsWith('http') ? ourStory.image : `${API_BASE_URL.replace('/api', '')}${ourStory.image}`}
                    alt={ourStory.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* What Sets Us Apart Section */}
        {whatSetsUsApart.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              What Sets Us Apart
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {whatSetsUsApart.map((item, index) => (
                <div key={item.id} className="bg-[#fafaf8] rounded-lg p-6 shadow-lg border-2 border-gray-100 hover:border-[#2d5016] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-[#2d5016] rounded-full flex items-center justify-center text-white">
                      {item.icon ? (
                        <span className="text-2xl">{item.icon}</span>
                      ) : (
                        <span className="text-2xl font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Our Partners Section */}
        {partners.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              Our Partners
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-[#fafaf8] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center text-center"
                >
                  {partner.logo ? (
                    <a
                      href={partner.website_url || '#'}
                      target={partner.website_url ? '_blank' : undefined}
                      rel={partner.website_url ? 'noopener noreferrer' : undefined}
                      className="block w-full"
                    >
                      <img
                        src={partner.logo.startsWith('http') ? partner.logo : `${API_BASE_URL.replace('/api', '')}${partner.logo}`}
                        alt={partner.name}
                        className="w-full h-24 object-contain mb-4"
                      />
                    </a>
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center mb-4">
                      <span className="text-gray-400 font-semibold">{partner.name}</span>
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900 mb-2">{partner.name}</h3>
                  {partner.description && (
                    <p className="text-xs text-gray-600 line-clamp-3">{partner.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Our Team Section */}
        {teamMembers.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              Our Team
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-[#fafaf8] rounded-lg overflow-hidden shadow-xl group">
                  <div className="relative h-64 bg-gray-300">
                    {member.photo ? (
                      <img
                        src={`${API_BASE_URL.replace('/api', '')}${member.photo}`}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-4xl font-bold">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#2d5016] opacity-75" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-gray-800 mb-1">{member.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{member.title}</p>
                    {member.bio && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-3">{member.bio}</p>
                    )}
                    <div className="flex justify-center gap-2">
                      {member.linkedin_url && (
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center text-white hover:bg-[#2d5016] transition-colors"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                      {member.twitter_url && (
                        <a
                          href={member.twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center text-white hover:bg-[#2d5016] transition-colors"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                      )}
                      {member.facebook_url && (
                        <a
                          href={member.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center text-white hover:bg-[#2d5016] transition-colors"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
