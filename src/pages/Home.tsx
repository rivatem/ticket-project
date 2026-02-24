import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const Home = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`/api/events?search=${search}`);
        setEvents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [search]);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden bg-zinc-900">
        <img 
          src="https://picsum.photos/seed/concert/1920/1080" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          alt="Hero"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
          >
            Discover Unforgettable <span className="text-indigo-400 italic">Experiences</span>
          </motion.h1>
          <p className="text-zinc-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            The simplest way to find, book, and manage tickets for your favorite events.
          </p>
          
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search events, artists, or venues..."
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900">Featured Events</h2>
            <p className="text-zinc-500 mt-2">Handpicked experiences just for you</p>
          </div>
          <Link to="/events" className="text-indigo-600 font-semibold flex items-center hover:underline">
            View all <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-zinc-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((event) => (
              <motion.div 
                key={event.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-xl transition-all group"
              >
                <Link to={`/events/${event.id}`}>
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={event.bannerImage || `https://picsum.photos/seed/${event.id}/800/600`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={event.title}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      {event.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-zinc-500 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.startDate).toLocaleDateString('en-US', { 
                          month: 'short', day: 'numeric', year: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.venue}, {event.city}
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-zinc-100 flex justify-between items-center">
                      <span className="text-zinc-400 text-xs uppercase font-bold tracking-widest">Starting from</span>
                      <span className="text-lg font-bold text-zinc-900">KES 1,500</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-300">
            <Search className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-900">No events found</h3>
            <p className="text-zinc-500">Try adjusting your search or filters</p>
          </div>
        )}
      </main>
    </div>
  );
};
