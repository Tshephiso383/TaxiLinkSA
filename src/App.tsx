import React, { useEffect, useState } from 'react'
import { Phone, MessageSquare, Wifi, WifiOff, Send, Clock, MapPin, User, Star, ArrowLeft, Navigation, CreditCard, Calendar, Users, Zap, Shield } from 'lucide-react'

interface Driver {
  id: number;
  name: string;
  rating: number;
  phone: string;
  distance: string;
  eta: string;
  price: string;
  car?: string;
  available?: boolean;
}

interface Booking {
  id: number;
  from: string;
  to: string;
  status: string;
  method: string;
  price: string;
  driver: string;
  user?: string;
}

const DEFAULT_DRIVERS: Driver[] = [
  { id: 1, name: 'Thabo Mthembu', rating: 4.8, phone: '082 123 4567', distance: '2.1 km', eta: '3 min', price: 'R15' },
  { id: 2, name: 'Sarah Ndlovu', rating: 4.9, phone: '072 987 6543', distance: '3.2 km', eta: '5 min', price: 'R18' },
  { id: 3, name: 'John Sithole', rating: 4.7, phone: '083 456 7890', distance: '1.8 km', eta: '2 min', price: 'R12' }
];

const DEFAULT_HISTORY: Booking[] = [
  { id: 1, from: 'Pretoria CBD', to: 'Hatfield', status: 'completed', method: 'Online', price: 'R15', driver: 'Thabo M.' },
  { id: 2, from: 'Sandton', to: 'Rosebank', status: 'active', method: 'SMS', price: 'R25', driver: 'Sarah N.' },
]

const Splash = ({ onDone }: { onDone: () => void }) => {
  useEffect(() => {
    const t = setTimeout(() => onDone(), 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="text-3xl font-bold mb-2">🚕 TaxiLinkSA is live — your ride, your way!</div>
        <div className="text-sm text-gray-500 mt-2">Launching into the login screen…</div>
      </div>
    </div>
  );
}

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [user, setUser] = useState<{name:string, phone:string}|null>(null);
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    try {
      const raw = localStorage.getItem('taxilinksa_drivers');
      return raw ? JSON.parse(raw) : DEFAULT_DRIVERS;
    } catch { return DEFAULT_DRIVERS; }
  });
  const [history, setHistory] = useState<Booking[]>(() => {
    try {
      const raw = localStorage.getItem('taxilinksa_history');
      return raw ? JSON.parse(raw) : DEFAULT_HISTORY;
    } catch { return DEFAULT_HISTORY; }
  });

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('taxilinksa_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('taxilinksa_history', JSON.stringify(history));
  }, [history]);

  // simple app navigation
  const [view, setView] = useState<'login'|'home'|'booking'|'history'|'driver'>('login');
  const [bookingMode, setBookingMode] = useState<'online'|'sms'|'ussd'>('online');

  // booking states
  const [onlineBooking, setOnlineBooking] = useState({
    pickup: '', destination: '', time: 'now', passengers: 1, selectedDriver: null as Driver | null
  });
  const [offlineBooking, setOfflineBooking] = useState({
    pickup: '', destination: '', time: 'now', passengers: '1'
  });

  // login tabs
  const [activeTab, setActiveTab] = useState<'rider'|'driver'>('rider');

  const handleRiderLogin = (name:string, phone:string) => {
    const u = { name, phone };
    setUser(u);
    localStorage.setItem('taxilinksa_user', JSON.stringify(u));
    setView('home');
  }

  const handleDriverRegister = (d: Driver) => {
    setDrivers(prev => [...prev, { ...d, id: Date.now(), available: d.available ?? true }]);
    setView('driver');
  }

  useEffect(() => {
    const raw = localStorage.getItem('taxilinksa_user');
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const generateSMSCommand = () => {
    const { pickup, destination, time, passengers } = offlineBooking;
    if (!pickup || !destination) return 'Please fill in pickup and destination';
    return `BOOK ${pickup} TO ${destination} ${time.toUpperCase()} ${passengers}P`;
  };

  // UI components (trimmed for brevity but functional)
  const LoginScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-6 border rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Welcome to TaxiLinkSA</h2>
          <button className="text-sm underline text-blue-600" onClick={() => setActiveTab('driver')}>Driver Portal</button>
        </div>

        <div className="mb-4">
          <div className="flex border-b">
            <button className={`flex-1 py-2 ${activeTab==='rider' ? 'border-b-2 border-purple-600 font-semibold' : 'text-gray-600'}`} onClick={() => setActiveTab('rider')}>Rider</button>
            <button className={`flex-1 py-2 ${activeTab==='driver' ? 'border-b-2 border-purple-600 font-semibold' : 'text-gray-600'}`} onClick={() => setActiveTab('driver')}>Driver</button>
          </div>
        </div>

        {activeTab === 'rider' ? <RiderForm /> : <DriverForm />}
      </div>
    </div>
  );

  const RiderForm = () => {
    const [name,setName] = useState(user?.name || '');
    const [phone,setPhone] = useState(user?.phone || '');
    return (
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <label className="block text-sm font-medium">Phone</label>
        <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full p-2 border rounded mb-4" />
        <div className="flex gap-2">
          <button onClick={()=>handleRiderLogin(name,phone)} className="flex-1 py-2 rounded bg-gradient-to-r from-purple-600 to-blue-600 text-white">Continue as Rider</button>
          <button onClick={()=>{ setView('home'); setUser({name:'Guest', phone:''}); }} className="flex-1 py-2 rounded border">Proceed as Guest</button>
        </div>
      </div>
    )
  }

  const DriverForm = () => {
    const [name,setName] = useState('');
    const [car,setCar] = useState('');
    const [phone,setPhone] = useState('');
    const [available,setAvailable] = useState(true);
    return (
      <div>
        <label className="block text-sm font-medium">Driver Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <label className="block text-sm font-medium">Car Registration</label>
        <input value={car} onChange={e=>setCar(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <label className="block text-sm font-medium">Phone</label>
        <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <label className="flex items-center gap-2 text-sm mb-3"><input type="checkbox" checked={available} onChange={e=>setAvailable(e.target.checked)} /> Available</label>
        <div className="flex gap-2">
          <button onClick={()=>{ handleDriverRegister({ id: 0, name, phone, distance:'0 km', eta:'0 min', price:'R0', rating:5, car, available }); }} className="flex-1 py-2 rounded bg-gradient-to-r from-purple-600 to-blue-600 text-white">Register as Driver</button>
          <button onClick={()=>setActiveTab('rider')} className="flex-1 py-2 rounded border">Back</button>
        </div>
      </div>
    )
  }

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">TaxiLinkSA</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isOnline ? (<><Wifi className="h-4 w-4 text-green-200" /><span className="text-sm">Online</span></>) : (<><WifiOff className="h-4 w-4 text-red-200" /><span className="text-sm">Offline</span></>)}
            </div>
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-2">Your Ride, Your Way</h2>
          <p className="opacity-90">Book online, via SMS, or USSD - even without data!</p>
          <p className="mt-2">Welcome{user ? `, ${user.name}` : ''} 👋🏽</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div onClick={()=>{ setBookingMode('online'); setView('booking'); }} className="bg-white text-gray-800 rounded-xl p-6 cursor-pointer">
            <div className="flex items-center justify-between mb-4"><Wifi className="h-8 w-8 text-blue-600" /><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Available</span></div>
            <h3 className="text-xl font-bold mb-2">Online Booking</h3>
            <p className="text-sm">Full-featured booking with driver selection.</p>
          </div>

          <div onClick={()=>{ setBookingMode('sms'); setView('booking'); }} className="bg-white text-gray-800 rounded-xl p-6 cursor-pointer">
            <div className="flex items-center justify-between mb-4"><MessageSquare className="h-8 w-8 text-green-600" /><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Free SMS</span></div>
            <h3 className="text-xl font-bold mb-2">SMS Booking</h3>
            <p className="text-sm">Book via text message - perfect when data is expensive.</p>
          </div>

          <div onClick={()=>{ setBookingMode('ussd'); setView('booking'); }} className="bg-white text-gray-800 rounded-xl p-6 cursor-pointer">
            <div className="flex items-center justify-between mb-4"><Phone className="h-8 w-8 text-orange-600" /><span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">Completely Free</span></div>
            <h3 className="text-xl font-bold mb-2">USSD Menu</h3>
            <p className="text-sm">Dial *120*8294# from any phone.</p>
          </div>
        </div>

        <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Recent Bookings</h3>
            <button onClick={()=>setView('history')} className="text-sm underline">View All</button>
          </div>
          <div className="mt-4 space-y-3">
            {history.slice(0,2).map(b => (
              <div key={b.id} className="p-3 bg-white bg-opacity-5 rounded flex items-center justify-between">
                <div>
                  <p className="font-medium">{b.from} → {b.to}</p>
                  <p className="text-sm opacity-80">{b.driver} • {b.method}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{b.price}</p>
                  <p className="text-sm">{b.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const BookingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={()=>setView('home')} className="bg-white rounded-lg p-3 shadow-lg"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="text-2xl font-bold text-white">{bookingMode === 'online' ? 'Online Booking' : bookingMode === 'sms' ? 'SMS Booking' : 'USSD Booking'}</h1>
          <div></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {bookingMode === 'online' ? OnlineBookingInterface() : bookingMode === 'sms' ? SMSBookingInterface() : USSDInterface()}
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold">Quick Tips</h3>
              <p className="text-sm mt-2">Use landmarks for better pickup accuracy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const OnlineBookingInterface = () => (
    <div className="bg-white rounded-lg shadow-xl p-6 text-gray-800">
      {onlineBooking.selectedDriver ? (
        <div>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6">
            <h3 className="text-xl font-bold mb-2">Pretoria CBD → Hatfield</h3>
          </div>
          <h4 className="text-lg font-bold mb-4">Available Drivers</h4>
          <div className="space-y-3 mb-6">
            {drivers.map(driver => (
              <div key={driver.id} onClick={()=>setOnlineBooking({...onlineBooking, selectedDriver: driver})} className={`p-4 border rounded-lg cursor-pointer ${onlineBooking.selectedDriver?.id===driver.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{driver.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600"><Star className="h-4 w-4" />{driver.rating} • {driver.distance} • ETA: {driver.eta}</div>
                  </div>
                  <div className="text-right"><p className="text-lg font-bold text-blue-600">{driver.price}</p></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={()=>setOnlineBooking({...onlineBooking, selectedDriver: null})} className="flex-1 bg-gray-100 py-3 rounded">Back</button>
            <button onClick={()=>{ if (onlineBooking.selectedDriver) { setHistory(prev=>[{ id: Date.now(), from: onlineBooking.pickup || 'Unknown', to: onlineBooking.destination || 'Unknown', status:'active', method:'Online', price: onlineBooking.selectedDriver.price, driver: onlineBooking.selectedDriver.name, user: user?.name } , ...prev]); setView('home'); }}} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded">Confirm Booking</button>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-bold mb-6">Book Your Ride</h3>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Pickup Location</label>
              <input value={onlineBooking.pickup} onChange={e=>setOnlineBooking({...onlineBooking, pickup: e.target.value})} placeholder="Enter pickup location" className="w-full p-3 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Destination</label>
              <input value={onlineBooking.destination} onChange={e=>setOnlineBooking({...onlineBooking, destination: e.target.value})} placeholder="Where are you going?" className="w-full p-3 border rounded" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">When</label>
                <select value={onlineBooking.time} onChange={e=>setOnlineBooking({...onlineBooking, time: e.target.value})} className="w-full p-3 border rounded">
                  <option value="now">Now</option>
                  <option value="30min">In 30 min</option>
                  <option value="1hour">In 1 hour</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Passengers</label>
                <select value={onlineBooking.passengers} onChange={e=>setOnlineBooking({...onlineBooking, passengers: parseInt(e.target.value)})} className="w-full p-3 border rounded">
                  <option value={1}>1 person</option>
                  <option value={2}>2 people</option>
                  <option value={3}>3 people</option>
                </select>
              </div>
            </div>
          </div>
          <button onClick={()=>{ if (onlineBooking.pickup && onlineBooking.destination) { setOnlineBooking({...onlineBooking, selectedDriver: drivers[0]}); } }} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded">Find Drivers</button>
        </div>
      )}
    </div>
  )

  const SMSBookingInterface = () => (
    <div className="bg-white rounded-lg shadow-xl p-6 text-gray-800">
      <div className="flex items-center gap-3 mb-6"><MessageSquare className="h-6 w-6 text-blue-600" /><h3 className="text-xl font-bold">SMS Booking</h3></div>
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Pickup Location</label>
          <input value={offlineBooking.pickup} onChange={e=>setOfflineBooking({...offlineBooking, pickup: e.target.value})} className="w-full p-3 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Destination</label>
          <input value={offlineBooking.destination} onChange={e=>setOfflineBooking({...offlineBooking, destination: e.target.value})} className="w-full p-3 border rounded" />
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded mb-4">
        <h4 className="font-medium mb-2">SMS Command:</h4>
        <div className="bg-white p-3 border rounded font-mono text-sm">{generateSMSCommand()}</div>
        <p className="text-xs text-gray-600 mt-2">Send to: <strong>40404</strong> or dial <strong>*120*8294#</strong></p>
      </div>
      <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded flex items-center justify-center gap-2"><Send className="h-4 w-4" /> Send SMS Booking</button>
    </div>
  )

  const USSDInterface = () => {
    const [ussdStep, setUssdStep] = useState(0);
    const ussdSteps = [
      { text: "Welcome to TaxiLink\n1. Book a ride\n2. Check booking\n3. Cancel ride\n4. Help", options: ['1','2','3','4'] },
      { text: "Enter pickup location:", input: true },
      { text: "Enter destination:", input: true },
      { text: "When do you need the ride?\n1. Now\n2. In 30 min\n3. In 1 hour", options: ['1','2','3'] },
      { text: "How many passengers?\n1. 1 person\n2. 2-3 people\n3. 4+ people", options: ['1','2','3'] },
      { text: "Booking confirmed!\nDriver: Thabo M.\nETA: 5 minutes\nPrice: R15\n\nThank you for using TaxiLink!", final: true }
    ];
    return (
      <div className="bg-white rounded-lg shadow-xl p-6 text-gray-800">
        <div className="flex items-center gap-3 mb-6"><Phone className="h-6 w-6 text-green-600" /><h3 className="text-xl font-bold">USSD Menu</h3></div>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm mb-6 min-h-40">
          <div className="mb-4"><div className="flex justify-between text-xs"><span>TaxiLink USSD</span><span>Step {ussdStep+1}/{ussdSteps.length}</span></div><hr className="border-green-600 my-2" /></div>
          <div className="whitespace-pre-line">{ussdSteps[ussdStep].text}</div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {['1','2','3','4','5','6','7','8','9','*','0','#'].map(k=>(
            <button key={k} onClick={()=>{ if (ussdStep < ussdSteps.length -1) setUssdStep(ussdStep+1) }} className="bg-gray-200 p-3 rounded font-semibold">{k}</button>
          ))}
        </div>
        <div className="text-sm text-gray-600"><p><strong>Dial:</strong> *120*8294# (Free from all networks)</p></div>
      </div>
    )
  }

  const HistoryPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-4 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6"><button onClick={()=>setView('home')} className="bg-white rounded-lg p-3 shadow-lg"><ArrowLeft className="h-5 w-5" /></button><h1 className="text-2xl font-bold">Booking History</h1><div></div></div>
        <div className="bg-white rounded-lg p-6 text-gray-800">
          {history.map(b=>(
            <div key={b.id} className="p-3 border-b last:border-b-0">
              <p className="font-medium">{b.from} → {b.to}</p>
              <p className="text-sm">{b.driver} • {b.method}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const DriverDashboard = () => (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Driver Dashboard</h2>
        <p className="text-sm mb-4">You are marked as available. This is a placeholder dashboard for drivers.</p>
        <div className="space-y-2">
          {drivers.filter(d=>d.available).map(d=>(
            <div key={d.id} className="p-3 border rounded">
              <p className="font-semibold">{d.name} • {d.car || '—'}</p>
            </div>
          ))}
        </div>
        <div className="mt-4"><button onClick={()=>setView('home')} className="py-2 px-4 rounded bg-gradient-to-r from-purple-600 to-blue-600 text-white">Back to Home</button></div>
      </div>
    </div>
  )

  // main render
  if (showSplash) return <Splash onDone={()=>setShowSplash(false)} />
  if (view === 'login') return <LoginScreen />
  if (view === 'home') return <HomePage />
  if (view === 'booking') return <BookingPage />
  if (view === 'history') return <HistoryPage />
  if (view === 'driver') return <DriverDashboard />
  return <div />
}

export default App
