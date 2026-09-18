import React from 'react';
import { Plane, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2">
              <Plane className="w-4 h-4 text-sky-600 transform -rotate-45" />
              <span>AeroIndex</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Airline fare intelligence, airfare price index benchmarking, and live flight bookings powered by Duffel API and Razorpay.
            </p>
          </div>

          <div>
            <h4 className="text-slate-900 font-semibold mb-2.5 text-xs uppercase tracking-wider">Tech Stack</h4>
            <ul className="space-y-1 text-slate-500 text-xs">
              <li>• React + Tailwind CSS</li>
              <li>• Node.js & Express API</li>
              <li>• Duffel Airline Flights Engine</li>
              <li>• Razorpay Payment Gateway</li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-semibold mb-2.5 text-xs uppercase tracking-wider">Capabilities</h4>
            <ul className="space-y-1 text-slate-500 text-xs">
              <li>• All Cabin Classes (Economy to First)</li>
              <li>• Interactive Aircraft Seat Selection</li>
              <li>• Real-Time Airfare Index Valuation</li>
              <li>• Instant Duffel Order & PNR</li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-semibold mb-2.5 text-xs uppercase tracking-wider">Verification</h4>
            <div className="flex items-center space-x-1.5 text-emerald-700 font-medium mb-1">
              <Shield className="w-4 h-4" />
              <span>Duffel Sandbox & Razorpay Test</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Live seat validation with cryptographic signature checkout.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px]">
          <p>© 2026 AeroIndex Platform. Airline Intelligence & Booking System.</p>
          <p className="mt-2 sm:mt-0">Designed & Developed by Arham Goyal</p>
        </div>
      </div>
    </footer>
  );
}
