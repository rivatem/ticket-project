import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import axios from 'axios';
import { ShieldCheck, XCircle, Camera, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Scanner = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  const handleScan = async (data: any) => {
    if (data && scanning) {
      setScanning(false);
      setLoading(true);
      try {
        // Simulation: In a real app, we'd send the QR data to the backend
        // const res = await axios.post('/api/tickets/validate', { qrData: data.text });
        
        // Mock validation for demo
        setTimeout(() => {
          setResult({
            attendeeName: "John Doe",
            ticketType: "VIP",
            eventTitle: "Summer Music Festival",
            isValid: true
          });
          setLoading(false);
        }, 1000);
      } catch (err: any) {
        setError(err.response?.data?.message || "Invalid ticket");
        setLoading(false);
      }
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    setError("Could not access camera");
  };

  const resetScanner = () => {
    setResult(null);
    setError(null);
    setScanning(true);
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Ticket Scanner</h1>
          <p className="text-zinc-400">Scan attendee QR codes for validation</p>
        </div>

        <div className="relative aspect-square bg-black rounded-3xl overflow-hidden border-4 border-zinc-800 shadow-2xl">
          {scanning && (
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          
          {/* Scanning Overlay */}
          {scanning && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-10 border-2 border-indigo-500 rounded-2xl opacity-50 animate-pulse" />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-scan" />
            </div>
          )}

          <AnimatePresence>
            {(loading || result || error) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-zinc-900/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
              >
                {loading && (
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                )}

                {result && (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShieldCheck className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">Valid Ticket</h3>
                    <p className="text-zinc-400 mb-6">{result.attendeeName} • {result.ticketType}</p>
                    <div className="bg-white/5 rounded-2xl p-4 mb-8 text-left">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Event</p>
                      <p className="text-white font-medium">{result.eventTitle}</p>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Invalid Ticket</h3>
                    <p className="text-zinc-400 mb-8">{error}</p>
                  </motion.div>
                )}

                {!loading && (
                  <button 
                    onClick={resetScanner}
                    className="w-full bg-white text-zinc-900 py-4 rounded-2xl font-bold flex items-center justify-center"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" /> Scan Next
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <div className="flex items-center text-zinc-500 text-sm">
            <Camera className="w-4 h-4 mr-2" />
            Camera Active
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
