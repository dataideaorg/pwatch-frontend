'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Users, Target, Award, Handshake, Linkedin, Twitter, Facebook, ExternalLink, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  fetchWhoWeAre, 
  fetchOurStory, 
  fetchWhatSetsUsApart, 
  fetchPartners, 
  fetchTeamMembers,
  fetchPageHeroImage,
  WhoWeAre,
  OurStory,
  WhatSetsUsApart,
  Partner,
  TeamMember
} from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/** Convert YouTube watch / youtu.be URL to embed URL */
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url?.trim()) return null;
  try {
    const u = url.trim();
    const watchMatch = u.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    const shortMatch = u.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    if (u.includes('youtube.com/embed/')) return u;
    return null;
  } catch {
    return null;
  }
}

export default function AboutPage() {
  const [whoWeAre, setWhoWeAre] = useState<WhoWeAre | null>(null);
  const [ourStory, setOurStory] = useState<OurStory | null>(null);
  const [whatSetsUsApart, setWhatSetsUsApart] = useState<WhatSetsUsApart[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPartnerSlide, setCurrentPartnerSlide] = useState(0);
  const partnerCarouselRef = useRef<HTMLDivElement>(null);
  const [heroImage, setHeroImage] = useState<string>('/images/about.jpg');

  useEffect(() => {
    loadData();
    fetchPageHeroImage('about').then((data) => {
      if (data?.image) {
        setHeroImage(data.image);
      }
    });
  }, []);

  // Auto-slide partners carousel
  useEffect(() => {
    if (partners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentPartnerSlide((prev) => {
        const cardsPerView = getCardsPerView();
        const maxSlide = Math.max(0, Math.ceil(partners.length / cardsPerView) - 1);
        return (prev + 1) % (maxSlide + 1);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [partners.length]);

  const getCardsPerView = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth >= 1280) return 5;
    if (window.innerWidth >= 1024) return 4;
    if (window.innerWidth >= 768) return 3;
    return 2;
  };

  const getMaxSlide = () => {
    if (partners.length === 0) return 0;
    const cardsPerView = getCardsPerView();
    return Math.max(0, Math.ceil(partners.length / cardsPerView) - 1);
  };

  const goToPreviousPartner = () => {
    if (partners.length === 0) return;
    const maxSlide = getMaxSlide();
    setCurrentPartnerSlide((prev) => (prev - 1 + (maxSlide + 1)) % (maxSlide + 1));
  };

  const goToNextPartner = () => {
    if (partners.length === 0) return;
    const maxSlide = getMaxSlide();
    setCurrentPartnerSlide((prev) => (prev + 1) % (maxSlide + 1));
  };

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative mb-10 h-[400px] overflow-hidden rounded-2xl shadow-xl">
          <Image
            src={heroImage}
            alt="About Parliament Watch Uganda"
            fill
            className="object-cover"
            sizes="100vw"
            priority
            unoptimized={heroImage.startsWith('http')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 z-10 px-6 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 mb-3">
                <Info className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white/90">Parliament Watch Uganda</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-3">
                About Us
              </h1>
              <p className="text-base text-white/90 leading-relaxed sm:text-lg">
                Empowering citizens through transparency. We bridge the gap between Parliament and the people,
                making legislative processes accessible and understandable for all Ugandans.
              </p>
            </div>
          </div>
        </div>

        {/* Who We Are Section */}
        {whoWeAre && (
          <section className="mb-10">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#2d5016]" />
                  <h2 className="text-xl font-bold text-gray-900">{whoWeAre.title}</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Media Side */}
                {(whoWeAre.youtube_video_url || whoWeAre.image) && (
                  <div className="relative h-[350px] lg:h-[400px] bg-gray-900">
                    {getYouTubeEmbedUrl(whoWeAre.youtube_video_url || '') ? (
                      <iframe
                        src={getYouTubeEmbedUrl(whoWeAre.youtube_video_url!)!}
                        title={whoWeAre.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : whoWeAre.image ? (
                      <img
                        src={whoWeAre.image.startsWith('http') ? whoWeAre.image : `${API_BASE_URL.replace('/api', '')}${whoWeAre.image}`}
                        alt={whoWeAre.title}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                )}
                
                {/* Content Side */}
                <div className="p-6 lg:p-8 flex flex-col justify-center bg-[#fafaf8]">
                  <div
                    className="prose prose-lg max-w-none text-gray-700 prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#2d5016] prose-a:no-underline hover:prose-a:underline overflow-y-auto max-h-[320px]"
                    dangerouslySetInnerHTML={{ __html: whoWeAre.content }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Our Story Section */}
        {ourStory && (
          <section className="mb-10">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#2d5016]" />
                  <h2 className="text-xl font-bold text-gray-900">{ourStory.title}</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Content Side */}
                <div className="p-6 lg:p-8 flex flex-col justify-center bg-[#fafaf8] order-2 lg:order-1">
                  <div
                    className="prose prose-lg max-w-none text-gray-700 prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#2d5016] prose-a:no-underline hover:prose-a:underline overflow-y-auto max-h-[320px]"
                    dangerouslySetInnerHTML={{ __html: ourStory.content }}
                  />
                </div>

                {/* Media Side */}
                {(ourStory.youtube_video_url || ourStory.image) && (
                  <div className="relative h-[350px] lg:h-[400px] bg-gray-900 order-1 lg:order-2">
                    {getYouTubeEmbedUrl(ourStory.youtube_video_url || '') ? (
                      <iframe
                        src={getYouTubeEmbedUrl(ourStory.youtube_video_url!)!}
                        title={ourStory.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : ourStory.image ? (
                      <img
                        src={ourStory.image.startsWith('http') ? ourStory.image : `${API_BASE_URL.replace('/api', '')}${ourStory.image}`}
                        alt={ourStory.title}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* What Sets Us Apart Section */}
        {whatSetsUsApart.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">What Sets Us Apart</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {whatSetsUsApart.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#2d5016] to-[#1b3d26] rounded-lg flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                        {item.icon || (index + 1).toString().padStart(2, '0')}
                      </div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    </div>
                  </div>
                  <div className="p-4 bg-[#fafaf8]">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Our Partners Section */}
        {partners.length > 0 && (
          <section className="mb-10">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-[#2d5016]" />
                  <h2 className="text-xl font-bold text-gray-900">Our Partners</h2>
                </div>
              </div>
              <div className="p-6 bg-[#fafaf8]">
                <div className="relative">
                  {/* Navigation Buttons */}
                  <button
                    onClick={goToPreviousPartner}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 bg-white text-gray-700 rounded-full shadow-md hover:bg-[#2d5016] hover:text-white transition-all duration-200 flex items-center justify-center border border-gray-200"
                    aria-label="Previous partners"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={goToNextPartner}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 bg-white text-gray-700 rounded-full shadow-md hover:bg-[#2d5016] hover:text-white transition-all duration-200 flex items-center justify-center border border-gray-200"
                    aria-label="Next partners"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Carousel Container */}
                  <div 
                    ref={partnerCarouselRef}
                    className="overflow-hidden mx-6"
                  >
                    <div 
                      className="flex transition-transform duration-500 ease-out"
                      style={{
                        transform: `translateX(-${currentPartnerSlide * (100 / getCardsPerView())}%)`,
                      }}
                    >
                      {partners.map((partner) => (
                        <div
                          key={partner.id}
                          className="flex-shrink-0 px-2"
                          style={{ width: `${100 / getCardsPerView()}%` }}
                        >
                          <a
                            href={partner.website_url || '#'}
                            target={partner.website_url ? '_blank' : undefined}
                            rel={partner.website_url ? 'noopener noreferrer' : undefined}
                            className="block bg-white rounded-xl p-4 h-32 shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#2d5016]/30 transition-all duration-200 flex items-center justify-center group"
                          >
                            {partner.logo ? (
                              <img
                                src={partner.logo.startsWith('http') ? partner.logo : `${API_BASE_URL.replace('/api', '')}${partner.logo}`}
                                alt={partner.name}
                                className="max-h-16 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                              />
                            ) : (
                              <span className="text-gray-500 font-medium text-center text-sm">{partner.name}</span>
                            )}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dots Indicator */}
                  <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: getMaxSlide() + 1 }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPartnerSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentPartnerSlide
                            ? 'bg-[#2d5016] w-8'
                            : 'bg-gray-300 hover:bg-gray-400 w-2'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Our Team Section */}
        {teamMembers.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Our Team</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  {/* Photo */}
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8]">
                    {member.photo ? (
                      <img
                        src={member.photo.startsWith('http') ? member.photo : `${API_BASE_URL.replace('/api', '')}${member.photo}`}
                        alt={member.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2d5016] to-[#1b3d26]">
                        <span className="text-white text-4xl font-bold">{member.name.charAt(0)}</span>
                      </div>
                    )}
                    
                    {/* Social links on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <div className="flex gap-2">
                        {member.linkedin_url && (
                          <a
                            href={member.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-[#2d5016] hover:bg-[#2d5016] hover:text-white transition-colors shadow-lg"
                          >
                            <Linkedin size={16} />
                          </a>
                        )}
                        {member.twitter_url && (
                          <a
                            href={member.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-[#2d5016] hover:bg-[#2d5016] hover:text-white transition-colors shadow-lg"
                          >
                            <Twitter size={16} />
                          </a>
                        )}
                        {member.facebook_url && (
                          <a
                            href={member.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-[#2d5016] hover:bg-[#2d5016] hover:text-white transition-colors shadow-lg"
                          >
                            <Facebook size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 text-center bg-[#fafaf8]">
                    <h3 className="font-bold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-[#2d5016] font-medium mb-2">{member.title}</p>
                    {member.bio && (
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="bg-gradient-to-br from-[#2d5016] to-[#1b3d26] rounded-xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Join Us in Making a Difference
            </h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Whether you&apos;re a citizen seeking information, a researcher, or an organization looking to partner with us, we&apos;d love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact">
                <Button className="bg-white text-[#2d5016] hover:bg-gray-100 font-semibold px-6 py-2 rounded-lg shadow-md">
                  Get in Touch
                  <ExternalLink size={16} className="ml-2" />
                </Button>
              </Link>
              <Link href="/citizens-voice">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-6 py-2 rounded-lg">
                  Share Your Voice
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
