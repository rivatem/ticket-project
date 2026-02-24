import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Image as ImageIcon, Plus, Trash2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'concert',
    bannerImage: '',
    startDate: '',
    endDate: '',
    venue: '',
    address: '',
    city: '',
    ticketTypes: [
      { name: 'Regular', price: 1000, quantity: 100, description: 'Standard entry' }
    ]
  });

  const handleAddTicketType = () => {
    setFormData({
      ...formData,
      ticketTypes: [...formData.ticketTypes, { name: '', price: 0, quantity: 0, description: '' }]
    });
  };

  const handleRemoveTicketType = (index: number) => {
    setFormData({
      ...formData,
      ticketTypes: formData.ticketTypes.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/events', formData);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">Create New Event</h1>
          <p className="text-zinc-500 mt-2">Fill in the details to publish your event on EventTix</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <section className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center">
              <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mr-3 text-sm">1</span>
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Event Title</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Summer Music Festival"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Category</label>
                  <select 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="concert">Concert</option>
                    <option value="conference">Conference</option>
                    <option value="workshop">Workshop</option>
                    <option value="sports">Sports</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Banner Image URL</label>
                  <input 
                    type="text"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://example.com/image.jpg"
                    value={formData.bannerImage}
                    onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Description</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tell people what your event is about..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Location & Time */}
          <section className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center">
              <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mr-3 text-sm">2</span>
              Location & Time
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Start Date & Time</label>
                <input 
                  type="datetime-local"
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">End Date & Time</label>
                <input 
                  type="datetime-local"
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Venue Name</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. KICC"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Address</label>
                  <input 
                    type="text"
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. City Square"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">City</label>
                  <input 
                    type="text"
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Nairobi"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Tickets */}
          <section className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-900 flex items-center">
                <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mr-3 text-sm">3</span>
                Ticket Types
              </h2>
              <button 
                type="button"
                onClick={handleAddTicketType}
                className="text-indigo-600 font-bold text-sm flex items-center hover:underline"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Type
              </button>
            </div>

            <div className="space-y-6">
              {formData.ticketTypes.map((type, index) => (
                <div key={index} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 relative group">
                  {formData.ticketTypes.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveTicketType(index)}
                      className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Name</label>
                      <input 
                        type="text"
                        required
                        className="w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. VIP"
                        value={type.name}
                        onChange={(e) => {
                          const newTypes = [...formData.ticketTypes];
                          newTypes[index].name = e.target.value;
                          setFormData({ ...formData, ticketTypes: newTypes });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Price (KES)</label>
                      <input 
                        type="number"
                        required
                        className="w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={type.price}
                        onChange={(e) => {
                          const newTypes = [...formData.ticketTypes];
                          newTypes[index].price = parseInt(e.target.value);
                          setFormData({ ...formData, ticketTypes: newTypes });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Quantity</label>
                      <input 
                        type="number"
                        required
                        className="w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={type.quantity}
                        onChange={(e) => {
                          const newTypes = [...formData.ticketTypes];
                          newTypes[index].quantity = parseInt(e.target.value);
                          setFormData({ ...formData, ticketTypes: newTypes });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-bold text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 flex items-center justify-center group"
          >
            {loading ? 'Publishing...' : (
              <>
                Publish Event <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
