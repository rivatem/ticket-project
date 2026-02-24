import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Calendar, MapPin, Download, QrCode } from 'lucide-react';
import { motion } from 'motion/react';

export const MyTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get('/api/tickets/my-tickets');
        setTickets(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">My Tickets</h1>
          <p className="text-zinc-500 mt-2">Manage and view your upcoming event tickets</p>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-300">
            <Ticket className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-900">No tickets yet</h3>
            <p className="text-zinc-500 mb-8">You haven't purchased any tickets yet.</p>
            <Link to="/" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tickets.map((ticket) => (
              <motion.div 
                key={ticket.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-sm flex flex-col"
              >
                <div className="relative h-40">
                  <img 
                    src={ticket.bannerImage || `https://picsum.photos/seed/${ticket.eventId}/800/400`}
                    className="w-full h-full object-cover"
                    alt={ticket.eventTitle}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-lg font-bold text-white">{ticket.eventTitle}</h3>
                  </div>
                </div>
                
                <div className="p-6 flex-grow space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Ticket Type</p>
                      <p className="font-bold text-zinc-900">{ticket.ticketType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Price</p>
                      <p className="font-bold text-zinc-900">KES {ticket.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-zinc-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(ticket.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {ticket.venue}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex gap-3">
                    <button 
                      onClick={() => setSelectedTicket(ticket)}
                      className="flex-1 bg-zinc-900 text-white py-3 rounded-xl font-bold flex items-center justify-center hover:bg-zinc-800 transition-all"
                    >
                      <QrCode className="w-4 h-4 mr-2" /> View QR
                    </button>
                    <button className="p-3 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-all">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setSelectedTicket(null)} />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-zinc-900 mb-1">{selectedTicket.eventTitle}</h3>
              <p className="text-zinc-500 font-medium">{selectedTicket.ticketType} Ticket</p>
            </div>

            <div className="bg-zinc-50 p-6 rounded-[32px] mb-8 inline-block border-2 border-zinc-100">
              <img src={selectedTicket.qrCode} alt="QR Code" className="w-48 h-48" />
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-50 p-4 rounded-2xl text-left">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Attendee</p>
                <p className="font-bold text-zinc-900">{selectedTicket.attendeeName}</p>
              </div>
              <div className="bg-zinc-50 p-4 rounded-2xl text-left">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Ticket Number</p>
                <p className="font-mono font-bold text-zinc-900">{selectedTicket.ticketNumber}</p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedTicket(null)}
              className="mt-8 w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold"
            >Close</button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

import { Link } from 'react-router-dom';
