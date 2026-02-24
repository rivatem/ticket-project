import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Clock, Info, ShieldCheck, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/api/events/${id}`);
        setEvent(res.data);
        if (res.data.ticketTypes?.length > 0) {
          setSelectedTicket(res.data.ticketTypes[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handlePurchase = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('pending');

    try {
      const res = await axios.post('/api/tickets/create', {
        eventId: parseInt(id!),
        ticketTypeId: selectedTicket.id,
        quantity,
        phoneNumber,
        attendees: Array(quantity).fill({ name: user.name, email: user.email })
      });

      // Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await axios.get(`/api/tickets/${res.data.orderId}/status`);
          if (statusRes.data.status === 'completed') {
            clearInterval(pollInterval);
            setPaymentStatus('success');
            setIsProcessing(false);
            setTimeout(() => navigate('/my-tickets'), 3000);
          } else if (statusRes.data.status === 'failed') {
            clearInterval(pollInterval);
            setPaymentStatus('error');
            setIsProcessing(false);
          }
        } catch (err) {
          clearInterval(pollInterval);
          setPaymentStatus('error');
          setIsProcessing(false);
        }
      }, 2000);

    } catch (err) {
      setPaymentStatus('error');
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center">Event not found</div>;

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Banner */}
      <div className="relative h-[400px]">
        <img 
          src={event.bannerImage || `https://picsum.photos/seed/${event.id}/1920/600`}
          className="w-full h-full object-cover"
          alt={event.title}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                {event.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">{event.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Info */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">About this event</h2>
              <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex items-start space-x-4">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">Date & Time</h4>
                  <p className="text-zinc-500 text-sm">
                    {new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-zinc-500 text-sm">
                    {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex items-start space-x-4">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">Location</h4>
                  <p className="text-zinc-500 text-sm">{event.venue}</p>
                  <p className="text-zinc-500 text-sm">{event.address}, {event.city}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Tickets */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm sticky top-24">
              <h3 className="text-xl font-bold text-zinc-900 mb-6">Select Tickets</h3>
              
              <div className="space-y-4 mb-8">
                {event.ticketTypes?.map((type: any) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedTicket(type)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      selectedTicket?.id === type.id 
                        ? 'border-indigo-600 bg-indigo-50/50' 
                        : 'border-zinc-100 hover:border-zinc-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-zinc-900">{type.name}</span>
                      <span className="text-indigo-600 font-bold">KES {type.price.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-zinc-500">{type.description || 'Standard entry'}</p>
                  </button>
                ))}
              </div>

              {selectedTicket && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl">
                    <span className="text-sm font-medium text-zinc-600">Quantity</span>
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center hover:bg-white transition-colors"
                      >-</button>
                      <span className="font-bold w-4 text-center">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(Math.min(selectedTicket.maxPerOrder, quantity + 1))}
                        className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center hover:bg-white transition-colors"
                      >+</button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">M-Pesa Phone Number</label>
                    <input 
                      type="text"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>

                  <div className="pt-4 border-t border-zinc-100">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-zinc-500">Total</span>
                      <span className="text-2xl font-bold text-zinc-900">KES {(selectedTicket.price * quantity).toLocaleString()}</span>
                    </div>
                    
                    <button 
                      onClick={handlePurchase}
                      disabled={isProcessing}
                      className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center"
                    >
                      {isProcessing ? 'Processing...' : 'Buy Tickets'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {isProcessing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              {paymentStatus === 'pending' && (
                <>
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 mb-2">Check your phone</h3>
                  <p className="text-zinc-500">We've sent an STK Push to <span className="font-bold text-zinc-900">{phoneNumber}</span>. Please enter your PIN to complete the purchase.</p>
                </>
              )}
              {paymentStatus === 'success' && (
                <>
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 mb-2">Payment Successful!</h3>
                  <p className="text-zinc-500">Your tickets have been generated. Redirecting to your tickets...</p>
                </>
              )}
              {paymentStatus === 'error' && (
                <>
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Info className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 mb-2">Payment Failed</h3>
                  <p className="text-zinc-500">Something went wrong. Please try again or contact support.</p>
                  <button 
                    onClick={() => setIsProcessing(false)}
                    className="mt-6 w-full bg-zinc-900 text-white py-3 rounded-xl font-bold"
                  >Close</button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
