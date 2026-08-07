'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CustomSelect } from '@/components/ui/CustomSelect';

type Period = {
  id: number;
  name: string;
  type: string;
  year: number;
  month: number;
  total_spent?: number;
};

type ModalType = null | 'select' | 'month' | 'trip';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 10 }, (_, i) => 2026 + i);

export default function DashboardPage() {
  const [username, setUsername] = useState<string | null>(null);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [modal, setModal] = useState<ModalType>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [monthYear, setMonthYear] = useState(2026);
  const [monthMonth, setMonthMonth] = useState(new Date().getMonth() + 1);
  const [monthDesc, setMonthDesc] = useState('');
  const [monthBudget, setMonthBudget] = useState('');

  const [tripName, setTripName] = useState('');
  const [tripDesc, setTripDesc] = useState('');
  const [tripStart, setTripStart] = useState('');
  const [tripEnd, setTripEnd] = useState('');
  const [tripBudget, setTripBudget] = useState('');

  const router = useRouter();

  const [tripStartDate, setTripStartDate] = useState<Date | null>(null);
  const [tripEndDate, setTripEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (tripStart) {
      setTripStartDate(new Date(tripStart));
    }
    if (tripEnd) {
      setTripEndDate(new Date(tripEnd));
    }
  }, [tripStart, tripEnd]);

  const handleStartDateChange = (date: Date | null) => {
    setTripStartDate(date);
    setTripStart(date ? date.toISOString().split('T')[0] : '');
  };

  const handleEndDateChange = (date: Date | null) => {
    setTripEndDate(date);
    setTripEnd(date ? date.toISOString().split('T')[0] : '');
  };

  useEffect(() => {
    const loadData = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) { 
        console.error(userError.message); 
        return; 
      }

      const user = userData.user;
      setUserId(user?.id ?? null);
      
      if (!user) return;
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error(profileError.message);
      } else {
        setUsername(profileData?.username ?? null);
      }
  
      const { data: periodsData, error: periodsError } = await supabase
        .from('periods')
        .select('*')
        .eq('user_id', user.id);

      if (periodsError) { 
        console.error(periodsError.message); 
        return; 
      }

      // Fetch total spent for each period
      const periodsWithSpent = await Promise.all(
        (periodsData || []).map(async (period) => {
          const { data: expensesData, error: expensesError } = await supabase
            .from('expenses')
            .select('amount')
            .eq('period_id', period.id);

          if (expensesError) {
            console.error(expensesError.message);
            return { ...period, total_spent: 0 };
          }

          const total_spent = expensesData?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
          return { ...period, total_spent };
        })
      );

      setPeriods(periodsWithSpent);
    };

    loadData();
  }, []);

  const closeModal = () => {
    setModal(null);
    setMonthDesc('');
    setMonthBudget('');
    setTripName('');
    setTripDesc('');
    setTripStart('');
    setTripEnd('');
    setTripBudget('');
  };

  const handleAddMonth = async () => {
    if (!userId) return;
    setLoading(true);

    const name = `${MONTHS[monthMonth - 1]} ${monthYear}`;

    const { data, error } = await supabase
      .from('periods')
      .insert({
        user_id: userId,
        name,
        type: 'month',
        year: monthYear,
        month: monthMonth,
        total_budget: monthBudget ? parseFloat(monthBudget) : null,
      })
      .select()
      .single();

    setLoading(false);
    if (error) { console.error(error.message); return; }
    setPeriods((prev) => [...prev, { ...data, total_spent: 0 }]);
    closeModal();
  };

  const handleAddTrip = async () => {
    if (!userId || !tripName) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('periods')
      .insert({
        user_id: userId,
        name: tripName,
        type: 'trip',
        year: tripStart ? new Date(tripStart).getFullYear() : new Date().getFullYear(),
        month: tripStart ? new Date(tripStart).getMonth() + 1 : new Date().getMonth() + 1,
        start_date: tripStart || null,
        end_date: tripEnd || null,
        total_budget: tripBudget ? parseFloat(tripBudget) : null,
      })
      .select()
      .single();

    setLoading(false);
    if (error) { console.error(error.message); return; }
    setPeriods((prev) => [...prev, { ...data, total_spent: 0 }]);
    closeModal();
  };

  const inputClass = "w-full bg-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30";
  const labelClass = "text-sm text-white/60 mb-1 block";

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-white/60 mt-2">Welcome, {username ?? 'Loading user...'}</p>

      <div className="mt-6 space-y-3">
        {periods.length === 0 ? (
          <p className="text-white/40">No periods yet.</p>
        ) : (
          periods.map((period) => (
            <div
              key={period.id}
              onClick={() => router.push(`/periods/${period.id}`)}
              className="bg-white/10 p-4 rounded-xl cursor-pointer hover:bg-white/20 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{period.name}</p>
                  <p className="text-sm text-white/60 mt-1 uppercase">
                    {period.type}
                  </p>
                </div>
                <p className="font-bold text-lg">
                  ₱{(period.total_spent || 0).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center">
        <button
          onClick={() => setModal('select')}
          className="bg-white text-black w-14 h-14 rounded-full shadow-lg text-2xl font-bold hover:bg-white/90 transition flex items-center justify-center"
        >
          <span><svg className='z-10 h-6 bg-blackt text-black' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" ></g><g id="SVGRepo_tracerCarrier"></g><g id="SVGRepo_iconCarrier"> <path d="M6 12H18M12 6V18" stroke="#000000" ></path> </g></svg></span>
        </button>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 z-40" onClick={closeModal} />
      )}

      {modal === 'select' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-175 bg-zinc-900 rounded-t-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold mb-2">Add Period</h2>
          <button
            onClick={() => setModal('month')}
            className="w-full bg-white/10 hover:bg-white/20 transition p-4 rounded-xl text-left"
          >
            <p className="font-semibold">📅 Month</p>
            <p className="text-sm text-white/50">Track expenses for a specific month</p>
          </button>
          <button
            onClick={() => setModal('trip')}
            className="w-full bg-white/10 hover:bg-white/20 transition p-4 rounded-xl text-left"
          >
            <p className="font-semibold">✈️ Trip</p>
            <p className="text-sm text-white/50">Track expenses for a trip or event</p>
          </button>
        </div>
      )}

      {modal === 'month' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-175 bg-zinc-900 rounded-t-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setModal('select')} className="text-white/50 hover:text-white transition">
              ← Back
            </button>
            <h2 className="text-lg font-bold">Add Month</h2>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Month</label>
              <CustomSelect
                value={monthMonth.toString()}
                onChange={(value) => setMonthMonth(Number(value))}
                options={MONTHS.map((month, index) => ({ id: index + 1, name: month }))}
                placeholder="Select month"
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Year</label>
              <CustomSelect
                value={monthYear.toString()}
                onChange={(value) => setMonthYear(Number(value))}
                options={YEARS.map((year) => ({ id: year, name: year.toString() }))}
                placeholder="Select year"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Total Budget (optional)</label>
            <input
              type="number"
              value={monthBudget}
              onChange={(e) => setMonthBudget(e.target.value)}
              placeholder="e.g. 15000"
              min="0"
              step="0.01"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Description (optional)</label>
            <input
              type="text"
              value={monthDesc}
              onChange={(e) => setMonthDesc(e.target.value)}
              placeholder="e.g. Tight budget month"
              className={inputClass}
            />
          </div>

          <button
            onClick={handleAddMonth}
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Add Month'}
          </button>
        </div>
      )}

      {modal === 'trip' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-175 bg-zinc-900 rounded-t-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setModal('select')} className="text-white/50 hover:text-white transition">
              ← Back
            </button>
            <h2 className="text-lg font-bold">Add Trip</h2>
          </div>

          <div>
            <label className={labelClass}>Trip Name</label>
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="e.g. Palawan Trip"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Total Budget (optional)</label>
            <input
              type="number"
              value={tripBudget}
              onChange={(e) => setTripBudget(e.target.value)}
              placeholder="e.g. 20000"
              min="0"
              step="0.01"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Description (optional)</label>
            <input
              type="text"
              value={tripDesc}
              onChange={(e) => setTripDesc(e.target.value)}
              placeholder="e.g. Summer vacation"
              className={inputClass}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Start Date</label>
              <DatePicker
                selected={tripStartDate}
                onChange={handleStartDateChange}
                placeholderText="Select start date"
                className={inputClass}
                popperPlacement="top-start"
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>End Date</label>
              <DatePicker
                selected={tripEndDate}
                onChange={handleEndDateChange}
                placeholderText="Select end date"
                className={inputClass}
                popperPlacement="top-start"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>

          <button
            onClick={handleAddTrip}
            disabled={loading || !tripName}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Add Trip'}
          </button>
        </div>
      )}
    </div>
  );
}