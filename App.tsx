import React, { useState, useEffect } from 'react';
import { DailyEntry } from './types';
import { getEffectiveEntries, checkAndImputeMissingDays, nukeStorage } from './services/storageService';
import { getCoachAdvice } from './services/geminiService';
import DailyTargets from './components/DailyTargets';
import Dashboard from './components/Dashboard';
import HistoryList from './components/HistoryList';
import ExportPanel from './components/ExportPanel';
import PlanView from './components/PlanView';
import { APP_NAME } from './constants';

enum View {
  DASHBOARD = 'dashboard',
  PLAN = 'plan',
  DAILY = 'daily', // Replaces LOG
  HISTORY = 'history',
  EXPORT = 'export'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [entries, setEntries] = useState<Record<string, DailyEntry>>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [coachMessage, setCoachMessage] = useState<string | null>(null);
  const [isLoadingCoach, setIsLoadingCoach] = useState(false);

  // Initial Load
  useEffect(() => {
    checkAndImputeMissingDays();
    refreshData();
  }, []);

  const refreshData = () => {
    setEntries(getEffectiveEntries());
  };

  const handleSave = () => {
    refreshData();
    // Coach Reacts to new log if it's today
    handleCoachClick(); 
    setCurrentView(View.DASHBOARD);
  };

  const handleEditDate = (date: string) => {
    setSelectedDate(date);
    setCurrentView(View.DAILY);
  };

  const handleCoachClick = async () => {
    setIsLoadingCoach(true);
    const sortedList = (Object.values(entries) as DailyEntry[]).sort((a, b) => a.date.localeCompare(b.date));
    const advice = await getCoachAdvice(sortedList);
    setCoachMessage(advice);
    setIsLoadingCoach(false);
  };

  // Calculate day number (1-100)
  const sortedDates = Object.keys(entries).sort();
  const startDate = sortedDates.length > 0 ? new Date(sortedDates[0]) : new Date();
  const todayDate = new Date(selectedDate);
  const dayDiff = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  const dayNumber = dayDiff >= 0 ? dayDiff + 1 : 1;
  
  // Real today for plan highlighting
  const realToday = new Date();
  const realDayDiff = Math.floor((realToday.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  const realDayNumber = realDayDiff >= 0 ? realDayDiff + 1 : 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center font-bold text-white">IT</div>
            <h1 className="font-bold text-lg tracking-tight">{APP_NAME}</h1>
          </div>
          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            DAY {dayNumber} / 100
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        
        {/* Coach Banner */}
        {coachMessage && (
           <div className="mb-6 bg-slate-800 border-l-4 border-emerald-500 p-4 rounded shadow-lg animate-fade-in relative">
              <h4 className="text-xs font-bold text-emerald-400 uppercase mb-1">Coach Kamogawa says:</h4>
              <p className="text-sm italic text-slate-300">"{coachMessage}"</p>
              <button onClick={() => setCoachMessage(null)} className="absolute top-2 right-2 text-slate-600 hover:text-slate-400">×</button>
           </div>
        )}

        {currentView === View.DASHBOARD && <Dashboard entries={entries} />}
        
        {currentView === View.PLAN && (
          <PlanView 
            entries={entries} 
            currentDayNumber={realDayNumber} 
            onUpdate={refreshData}
          />
        )}

        {currentView === View.DAILY && (
          <DailyTargets 
            selectedDate={selectedDate} 
            existingEntry={entries[selectedDate]} 
            onSave={handleSave} 
            dayNumber={dayNumber}
          />
        )}

        {currentView === View.HISTORY && (
          <HistoryList entries={entries} onSelectDate={handleEditDate} />
        )}

        {currentView === View.EXPORT && (
          <ExportPanel entries={entries} />
        )}
      </main>

      {/* Mobile-Friendly Sticky Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-5xl mx-auto">
          <NavBtn 
            label="Dash" 
            active={currentView === View.DASHBOARD} 
            onClick={() => setCurrentView(View.DASHBOARD)} 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          />
           <NavBtn 
            label="Plan" 
            active={currentView === View.PLAN} 
            onClick={() => setCurrentView(View.PLAN)} 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
          />
          <NavBtn 
            label="Daily" 
            active={currentView === View.DAILY} 
            onClick={() => { setSelectedDate(new Date().toISOString().split('T')[0]); setCurrentView(View.DAILY); }} 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <NavBtn 
            label="History" 
            active={currentView === View.HISTORY} 
            onClick={() => setCurrentView(View.HISTORY)} 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
           <NavBtn 
            label="Coach" 
            active={false}
            onClick={handleCoachClick} 
            disabled={isLoadingCoach}
            icon={isLoadingCoach ? (
                <svg className="animate-spin w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            )}
          />
        </div>
      </nav>

       <div className="text-center mt-12 mb-4">
           <button onClick={() => { if(confirm("NUKE DATA?")) nukeStorage(); }} className="text-rose-900 text-[10px] hover:text-rose-500">RESET APP DATA</button>
       </div>

    </div>
  );
};

const NavBtn: React.FC<{ label: string, icon: React.ReactNode, active: boolean, onClick: () => void, disabled?: boolean }> = ({ label, icon, active, onClick, disabled }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`flex flex-col items-center justify-center w-full h-full transition-colors ${active ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'} ${disabled ? 'opacity-50' : ''}`}
  >
    {icon}
    <span className="text-[10px] uppercase font-bold mt-1">{label}</span>
  </button>
);

export default App;
