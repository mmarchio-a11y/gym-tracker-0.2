import React, { useState, useEffect } from 'react';
// --- FIX: Import the CSS file so Tailwind loads ---
import './index.css'; 
import { 
  Dumbbell, 
  Calendar, 
  Utensils, 
  AlertTriangle, 
  Info, 
  Save, 
  Activity,
  Zap,
  Send,
  Timer,
  Calculator,
  Download,
  Upload,
  Home,
  TrendingUp,
  Scale,
  Moon,
  Sun,
  Target,
  ShoppingBag,
  Sparkles,
  ChefHat,
  MessageSquare,
  X
} from 'lucide-react';

// --- API Utility ---

const callGemini = async (prompt: string) => {
  const apiKey = "AIzaSyBY5ApNAdMEFwh1rL3iMdGu42Tzq4Zor0I"; // PASTE YOUR API KEY HERE IS IT SAVED?
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const delays = [1000, 2000, 4000];

  for (let i = 0; i <= delays.length; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "AI is taking a nap. Try again.";
    } catch (error) {
      if (i === delays.length) return "Connection failed. Please check your internet.";
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  }
};

// --- Types & Data ---

const TARGET_DATE = new Date('2026-02-09T00:00:00');
const START_DATE = new Date('2025-11-27T00:00:00');

const WEEKS = [
  { id: 1, label: 'Week 1: Re-Engage', dates: 'Nov 27 - Dec 3', phase: 1 },
  { id: 2, label: 'Week 2: Base Build', dates: 'Dec 4 - Dec 10', phase: 1 },
  { id: 3, label: 'Week 3: Progression', dates: 'Dec 11 - Dec 17', phase: 1 },
  { id: 4, label: 'Week 4: Volume', dates: 'Dec 18 - Dec 24', phase: 1 },
  { id: 5, label: 'Week 5: Xmas Flex', dates: 'Dec 25 - Dec 31', phase: 2 },
  { id: 6, label: 'Week 6: NYE Reset', dates: 'Jan 1 - Jan 7', phase: 2 },
  { id: 7, label: 'Week 7: Intensity', dates: 'Jan 8 - Jan 14', phase: 2 },
  { id: 8, label: 'Week 8: Peak Vol', dates: 'Jan 15 - Jan 21', phase: 2 },
  { id: 9, label: 'Week 9: Strength Peak', dates: 'Jan 22 - Jan 28', phase: 3 },
  { id: 10, label: 'Week 10: Taper Start', dates: 'Jan 29 - Feb 4', phase: 3 },
  { id: 11, label: 'Week 11: Brazil Ready', dates: 'Feb 5 - Feb 9', phase: 3 },
];

const PHASES: any = {
  1: { title: 'Base Building', focus: 'Volume & Form', desc: 'Re-establishing mind-muscle connection. 3-4 sets per exercise. Moderate weights, perfect control.' },
  2: { title: 'Intensification', focus: 'Strength & Density', desc: 'Heavier loads. Drop sets introduced. Supersets for density. This is the grind phase.' },
  3: { title: 'Peaking & Taper', focus: 'Definition & Recovery', desc: 'Maximal weights but lower volume to shed fatigue. Diet tightens up to reveal the work.' }
};

const WORKOUTS: any = {
  thursday: {
    title: 'Thu: Arms & Vanity',
    focus: 'Hypertrophy & Pump',
    exercises: [
      { name: 'DB Lateral Raises', sets: 4, reps: '12-15', target: '8kg', notes: 'Strict. No swinging.' },
      { name: 'DB Skullcrushers', sets: 3, reps: '10-12', target: '10-12kg', notes: 'Elbows tucked.' },
      { name: 'Hammer Curls', sets: 3, reps: '10', target: '12.5kg', notes: 'Thickness.' },
      { name: 'DB Shrugs (High Rep)', sets: 3, reps: '20', target: '20kg+', notes: 'Pump focus.' },
      { name: 'Cable Tricep Push', sets: 3, reps: '12+', target: 'Pin 4-5', notes: 'Rope. Drop set on last.' },
      { name: 'Cable Bicep Curls', sets: 3, reps: '12+', target: 'Pin 3-4', notes: 'Constant tension.' },
    ]
  },
  friday: {
    title: 'Fri: Full Body Polish',
    focus: 'Athletics & Upper Chest',
    exercises: [
      { name: 'DB Incline Bench', sets: 3, reps: '10', target: '20kg', notes: 'Upper chest shelf.' },
      { name: 'Pull-ups', sets: 3, reps: 'Max', target: 'BW', notes: 'Beat last week.' },
      { name: 'DB Split Squats', sets: 3, reps: '10/leg', target: '10kg', notes: 'Stability.' },
      { name: 'DB Reverse Flys', sets: 3, reps: '15', target: '9kg', notes: 'Rear delts.' },
      { name: 'Plank', sets: 3, reps: '60s', target: 'BW', notes: 'Hard bracing.' },
    ]
  },
  monday: {
    title: 'Mon: Chest & Back',
    focus: 'Thickness & Density',
    exercises: [
      { name: 'DB Flat Bench Press', sets: 3, reps: '8-10', target: '22-24kg', notes: 'Heavy control. Station A.' },
      { name: 'DB One-Arm Row', sets: 3, reps: '10-12', target: '24kg', notes: 'Protect lower back. Station A.' },
      { name: 'DB Incline Flys', sets: 3, reps: '12-15', target: '10-12kg', notes: 'Focus on stretch. Station A.' },
      { name: 'Lat Pulldown', sets: 3, reps: '10-12', target: '45-50kg', notes: 'Wide Grip. Machine Zone.' },
      { name: 'Seated Cable Row', sets: 3, reps: '12', target: '59kg', notes: 'Squeeze blades. Machine Zone.' },
      { name: 'Face Pulls', sets: 3, reps: '15', target: '27kg', notes: 'Ext rotation. Machine Zone.' },
    ]
  },
  tuesday: {
    title: 'Tue: Legs + Shoulders',
    focus: 'Squat Strength & Power',
    exercises: [
      { name: 'Back Squat', sets: 3, reps: '8', target: '75kg', notes: 'Perfect depth. RPT style.' },
      { name: 'DB Shoulder Press', sets: 3, reps: '8-10', target: '14-16kg', notes: 'Seated. Full ROM.' },
      { name: 'Romanian Deadlift', sets: 3, reps: '10', target: '70kg', notes: 'STOP if flank hurts.' },
      { name: 'DB Shrugs', sets: 4, reps: '15', target: '24kg+', notes: '2 sec hold at top.' },
      { name: 'Leg Extension', sets: 3, reps: '15', target: 'Moderate', notes: 'Quad burnout.' },
      { name: 'Hanging Knee Raises', sets: 3, reps: '10-12', target: 'BW', notes: 'Core control.' },
    ]
  },
};

// --- Components ---

const SimpleLineChart = ({ data, color = "#2563eb", title }: {data: any[], color?: string, title: string}) => {
  if (!data || data.length < 2) return <div className="text-xs text-gray-400 p-4 text-center border border-dashed rounded">Not enough data for {title}</div>;

  const height = 150;
  const width = 300;
  const padding = 20;

  const maxVal = Math.max(...data.map(d => d.value));
  const minVal = Math.min(...data.map(d => d.value)) * 0.9;
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
    const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h4 className="text-sm font-bold text-gray-700 mb-2">{title}</h4>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          points={points}
        />
        {data.map((d, i) => {
          const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
          const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
          return <circle key={i} cx={x} cy={y} r="3" fill="white" stroke={color} strokeWidth="2" />;
        })}
      </svg>
    </div>
  );
};

// ... existing TimerFloating and PlateCalculator ...
const TimerFloating = () => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);
  
    useEffect(() => {
      let interval: any = null;
      if (isActive && timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft(timeLeft - 1);
        }, 1000);
      } else if (timeLeft === 0) {
        setIsActive(false);
      }
      return () => clearInterval(interval);
    }, [isActive, timeLeft]);
  
    const startTimer = (seconds: number) => {
      setTimeLeft(seconds);
      setIsActive(true);
    };
  
    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };
  
    return (
      <div className="fixed bottom-4 right-4 bg-gray-900 text-white rounded-xl shadow-2xl p-4 z-50 w-48 border border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-sm flex items-center gap-2"><Timer size={14}/> Rest Timer</span>
          {isActive && <span className="text-xl font-mono font-bold text-blue-400">{formatTime(timeLeft)}</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => startTimer(60)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-xs py-2 rounded">60s</button>
          <button onClick={() => startTimer(90)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-xs py-2 rounded">90s</button>
          <button onClick={() => startTimer(120)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-xs py-2 rounded">120s</button>
        </div>
      </div>
    );
  };
  
  const PlateCalculator = ({ isOpen, onClose, weight }: {isOpen: boolean, onClose: any, weight: any}) => {
    if (!isOpen) return null;
    
    const calculatePlates = (weightInput: any) => {
        const w = parseFloat(weightInput);
        const bar = 20;
        if (w <= bar) return 'Just the bar';
        let remaining = (w - bar) / 2;
        const plates = [20, 15, 10, 5, 2.5, 1.25];
        const result: number[] = [];
        
        plates.forEach(plate => {
          while (remaining >= plate) {
            result.push(plate);
            remaining -= plate;
          }
        });
        
        return result.length > 0 ? result.join(' + ') : 'Micro-load needed';
    };
    const result = calculatePlates(weight);
  
    return (
      <div className="absolute top-10 right-0 bg-white shadow-xl border border-gray-200 p-4 rounded-lg z-20 w-48 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold text-xs text-gray-500 uppercase">Load One Side</h4>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
        </div>
        <div className="font-mono text-sm font-bold text-blue-600">{result}</div>
        <div className="text-[10px] text-gray-400 mt-1">Assumes 20kg Bar</div>
      </div>
    );
  };

// --- New Features: AI Components ---

const AIChef = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateRecipe = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    const prompt = `You are a sports nutritionist for an aesthetic athlete. Create a high-protein, simple, "Brazil Ready" recipe using these ingredients: ${ingredients}. Add a catchy title. Format in Markdown with bold titles. Keep it concise.`;
    const response = await callGemini(prompt);
    setRecipe(response);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100 shadow-sm">
      <h3 className="font-bold text-lg text-emerald-900 mb-2 flex items-center gap-2">
        <Sparkles size={18} className="text-emerald-500" />
        AI Fridge Raider
      </h3>
      <p className="text-xs text-emerald-700 mb-4">Enter your random ingredients, get a lean-gains recipe.</p>
      
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="e.g. Eggs, Spinach, Hot Sauce..."
          className="flex-1 border border-emerald-200 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          onKeyDown={(e) => e.key === 'Enter' && generateRecipe()}
        />
        <button 
          onClick={generateRecipe}
          disabled={loading}
          className="bg-emerald-600 text-white px-4 py-2 rounded font-bold text-xs hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? 'Cooking...' : <><ChefHat size={14}/> Generate</>}
        </button>
      </div>

      {recipe && (
        <div className="bg-white p-4 rounded border border-emerald-100 text-sm text-gray-700 whitespace-pre-wrap animate-in fade-in leading-relaxed">
          {recipe}
        </div>
      )}
    </div>
  );
};

const AICoachBriefing = ({ workout, phase }: {workout: any, phase: any}) => {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const getBriefing = async () => {
    setLoading(true);
    setIsOpen(true);
    const exercisesList = workout.exercises.map((e: any) => e.name).join(', ');
    const prompt = `You are an elite strength coach. The athlete is about to do this workout: [${exercisesList}] focusing on ${workout.focus}. Current Phase: ${phase}. Give a 30-second pre-game speech: provide 3 specific, short technical cues for the main lifts, and 1 short, intense hype line. Be concise.`;
    const response = await callGemini(prompt);
    setBriefing(response);
    setLoading(false);
  };

  if (!isOpen && !loading && !briefing) {
    return (
      <button 
        onClick={getBriefing}
        className="w-full mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm font-bold"
      >
        <Sparkles size={16} />
        Get Coach's Briefing
      </button>
    );
  }

  return (
    <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 relative animate-in slide-in-from-top-2">
      <button 
        onClick={() => { setIsOpen(false); setBriefing(null); }}
        className="absolute top-2 right-2 text-blue-300 hover:text-blue-500"
      >
        <X size={16} />
      </button>
      <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
        <MessageSquare size={16} />
        Coach Kai says:
      </h4>
      {loading ? (
        <div className="text-xs text-blue-500 animate-pulse">Analyzing workout structure...</div>
      ) : (
        <div className="text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">
          {briefing}
        </div>
      )}
    </div>
  );
};


// --- Existing Components ---

const InstructionsPro = () => (
  <div className="space-y-6 animate-in slide-in-from-right duration-500">
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
        <AlertTriangle size={20} className="text-red-500" />
        Medical & Safety Protocols
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h4 className="font-bold text-red-900 mb-2">Right Flank / Abdomen</h4>
          <p className="text-sm text-red-800 mb-2">
            <strong>Trigger:</strong> Heavy axial loading (Squats/RDLs) or twisting.
          </p>
          <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
            <li>If dull pain starts: <strong>STOP immediately.</strong></li>
            <li>Swap RDLs for <em>Seated Leg Curls</em>.</li>
            <li>Swap Back Squats for <em>Leg Press</em>.</li>
            <li>Do not "push through" this specific pain.</li>
          </ul>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <h4 className="font-bold text-orange-900 mb-2">Heart Rate / Sensations</h4>
          <p className="text-sm text-orange-800 mb-2">
            <strong>Trigger:</strong> Maximum intensity intervals.
          </p>
          <ul className="list-disc list-inside text-xs text-orange-700 space-y-1">
            <li>Intervals should be <strong>85-90% effort</strong>, not 100%.</li>
            <li>If you feel "pumpless beats" or skipped beats: Stop running.</li>
            <li>Walk for 3 minutes. If it persists, end session.</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
        <Dumbbell size={20} className="text-blue-500" />
        Gym Flow & Logistics
      </h3>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full text-blue-600 font-bold text-xs">1</div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">Free Weights First</h4>
            <p className="text-xs text-gray-500">Secure a bench or rack immediately. Do all your DB and Barbell work here. Don't leave your station until done.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full text-blue-600 font-bold text-xs">2</div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">Machine Accessories</h4>
            <p className="text-xs text-gray-500">Move to cables/machines for the second half. It's easier to work in with others here if the gym is busy.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full text-blue-600 font-bold text-xs">3</div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">Supersets</h4>
            <p className="text-xs text-gray-500">If gym is empty, superset antagonist muscles (e.g., Chest/Back) to save time. If busy, do straight sets to avoid losing your spot.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Roadmap = () => {
  const currentWeekId = 1; // Logic to detect current week would go here

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">The 10-Week Strategy</h2>
        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold">Target: Feb 9</span>
      </div>

      <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
        {[1, 2, 3].map(phaseId => {
          const phase = PHASES[phaseId];
          const isCurrent = currentWeekId >= (phaseId === 1 ? 1 : phaseId === 2 ? 5 : 9) && currentWeekId <= (phaseId === 1 ? 4 : phaseId === 2 ? 8 : 11);
          
          return (
            <div key={phaseId} className={`ml-6 relative p-4 rounded-xl border ${isCurrent ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-200'}`}>
              <div className={`absolute -left-[31px] top-6 w-4 h-4 rounded-full border-2 ${isCurrent ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}></div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className={`font-bold ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>{phase.title}</h3>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    {phaseId === 1 ? 'Weeks 1-4' : phaseId === 2 ? 'Weeks 5-8' : 'Weeks 9-11'}
                  </span>
                </div>
                {isCurrent && <span className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded">CURRENT</span>}
              </div>
              <p className="text-sm text-gray-600 mb-3">{phase.desc}</p>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-100 p-2 rounded">
                <Target size={14} />
                Focus: {phase.focus}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 p-4 rounded-xl">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Calendar size={18} />
          Weekly Rhythm
        </h3>
        <div className="space-y-2">
          {['Mon: Chest & Back', 'Tue: Legs + Shoulders', 'Wed: Run (Intervals)', 'Thu: Arms & Vanity', 'Fri: Full Body Polish', 'Sat: Run (Steady)', 'Sun: REST'].map((day, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-gray-600 bg-white p-2 rounded border border-gray-100">
              <div className={`w-2 h-2 rounded-full ${day.includes('REST') ? 'bg-gray-300' : day.includes('Run') ? 'bg-green-400' : 'bg-blue-500'}`}></div>
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NutritionPro = ({ bodyStats }: {bodyStats: any[]}) => {
  const currentWeight = bodyStats.length > 0 ? parseFloat(bodyStats[bodyStats.length - 1].weight) : 78;
  const [weight, setWeight] = useState(currentWeight);
  const [mode, setMode] = useState('training'); // training | rest

  // Macro Logic
  const protein = Math.round(weight * 2.2);
  const fat = Math.round(weight * (mode === 'training' ? 0.8 : 1.0));
  const carbs = mode === 'training' ? Math.round(weight * 3.5) : Math.round(weight * 1.5);
  const calories = (protein * 4) + (carbs * 4) + (fat * 9);

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      
      {/* AI Chef Integration */}
      <AIChef />

      {/* Calculator */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calculator size={20} className="text-green-600" />
            Smart Macro Engine
          </h2>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
             <button 
               onClick={() => setMode('training')}
               className={`px-3 py-1 text-xs font-bold rounded ${mode === 'training' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
             >
               Training
             </button>
             <button 
               onClick={() => setMode('rest')}
               className={`px-3 py-1 text-xs font-bold rounded ${mode === 'rest' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
             >
               Rest
             </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
           <label className="text-sm text-gray-600">Current Weight:</label>
           <input 
             type="number" 
             value={weight}
             onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
             className="border rounded p-1 w-20 text-center font-bold"
           />
           <span className="text-sm text-gray-600">kg</span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-blue-50 p-2 rounded border border-blue-100">
            <div className="text-xs text-blue-600 mb-1">Protein</div>
            <div className="font-bold text-blue-900 text-lg">{protein}g</div>
          </div>
          <div className={`p-2 rounded border ${mode === 'training' ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
            <div className={`text-xs mb-1 ${mode === 'training' ? 'text-orange-600' : 'text-gray-500'}`}>Carbs</div>
            <div className={`font-bold text-lg ${mode === 'training' ? 'text-orange-900' : 'text-gray-700'}`}>{carbs}g</div>
          </div>
          <div className="bg-yellow-50 p-2 rounded border border-yellow-100">
            <div className="text-xs text-yellow-600 mb-1">Fats</div>
            <div className="font-bold text-yellow-900 text-lg">{fat}g</div>
          </div>
          <div className="bg-gray-100 p-2 rounded border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Cals</div>
            <div className="font-bold text-gray-800 text-lg">{calories}</div>
          </div>
        </div>
      </div>

      {/* Timing Strategy */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap size={20} className="text-yellow-500" />
          Supplement & Timing Strategy
        </h3>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
             <div className="mt-1 bg-yellow-100 p-1 rounded text-yellow-700"><Sun size={14} /></div>
             <div>
               <h4 className="font-bold text-sm text-gray-800">Morning</h4>
               <p className="text-xs text-gray-600">0.5L Water + Pinch of Salt. Coffee (Black).</p>
             </div>
          </div>
          <div className="flex gap-4 items-start">
             <div className="mt-1 bg-blue-100 p-1 rounded text-blue-700"><Dumbbell size={14} /></div>
             <div>
               <h4 className="font-bold text-sm text-gray-800">Pre-Workout (30m prior)</h4>
               <p className="text-xs text-gray-600">Banana or Rice Cakes (30g Carbs). Caffeine if needed.</p>
             </div>
          </div>
          <div className="flex gap-4 items-start">
             <div className="mt-1 bg-green-100 p-1 rounded text-green-700"><Activity size={14} /></div>
             <div>
               <h4 className="font-bold text-sm text-gray-800">Post-Workout</h4>
               <p className="text-xs text-gray-600">Whey Isolate (30g) + <strong>Creatine (5g)</strong>. Eat a real meal 60m later.</p>
             </div>
          </div>
          <div className="flex gap-4 items-start">
             <div className="mt-1 bg-purple-100 p-1 rounded text-purple-700"><Moon size={14} /></div>
             <div>
               <h4 className="font-bold text-sm text-gray-800">Evening</h4>
               <p className="text-xs text-gray-600">Magnesium Glycinate (Sleep). <strong>NAC (600mg)</strong> for Liver Support.</p>
             </div>
          </div>
        </div>
      </div>

       {/* Shopping List */}
       <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
          <ShoppingBag size={16} />
          High-ROI Shopping List
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
           <ul className="list-disc list-inside space-y-1">
             <li>Chicken Breast (Pre-cooked)</li>
             <li>White Fish / Salmon</li>
             <li>0% Greek Yogurt</li>
             <li>Egg Whites</li>
           </ul>
           <ul className="list-disc list-inside space-y-1">
             <li>Jasmine Rice (Microwave)</li>
             <li>Bananas / Berries</li>
             <li>Spinach / Zucchini</li>
             <li>Avocado / Olive Oil</li>
           </ul>
        </div>
      </div>
    </div>
  );
};

// ... existing HomeDashboard, Analytics, Tracker ...

const HomeDashboard = ({ consistency, daysLeft, bodyStats, setBodyStats }: {consistency: number, daysLeft: number, bodyStats: any[], setBodyStats: any}) => {
    const [weight, setWeight] = useState('');
    const [waist, setWaist] = useState('');
  
    const saveStats = () => {
      if (!weight && !waist) return;
      const newStats = [...bodyStats, { date: new Date().toISOString().split('T')[0], weight, waist }];
      setBodyStats(newStats);
      setWeight('');
      setWaist('');
      localStorage.setItem('michelangelo_body_stats', JSON.stringify(newStats));
    };
  
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        {/* Hero Countdown */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">Mission: Brazil</h2>
              <p className="text-blue-100 text-sm opacity-80">Feb 9th, 2026</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <span className="block text-2xl font-bold font-mono">{daysLeft}</span>
              <span className="text-[10px] uppercase tracking-wider opacity-80">Days Left</span>
            </div>
          </div>
          
          <div className="mt-6 flex gap-4">
            <div className="flex-1 bg-black/20 rounded p-3">
              <div className="text-xs opacity-70 mb-1">Consistency</div>
              <div className="text-lg font-bold">{consistency}%</div>
            </div>
            <div className="flex-1 bg-black/20 rounded p-3">
              <div className="text-xs opacity-70 mb-1">Current Phase</div>
              <div className="text-lg font-bold">Base</div>
            </div>
          </div>
        </div>
  
        {/* Quick Log Body Stats */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Scale size={20} className="text-blue-600"/>
            Body Stats Log
          </h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Weight (kg)</label>
              <input 
                type="number" 
                value={weight} 
                onChange={e => setWeight(e.target.value)}
                className="w-full border rounded p-2 text-sm" 
                placeholder="78.5"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Waist (cm)</label>
              <input 
                type="number" 
                value={waist} 
                onChange={e => setWaist(e.target.value)}
                className="w-full border rounded p-2 text-sm" 
                placeholder="85"
              />
            </div>
            <button 
              onClick={saveStats}
              className="bg-gray-900 text-white p-2 rounded hover:bg-gray-800"
            >
              <Save size={20} />
            </button>
          </div>
        </div>
  
        {/* Philosophy Card */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <h4 className="font-bold text-blue-900 mb-2 text-sm">Coach's Note</h4>
          <p className="text-xs text-blue-800 leading-relaxed">
            "Consistency beats intensity. You have {daysLeft} days. We are building density in the upper body while keeping the legs athletic. Don't skip the meals, don't skip the rest."
          </p>
        </div>
      </div>
    );
  };
  
  const Analytics = ({ logs, bodyStats }: {logs: any, bodyStats: any[]}) => {
    const weightData = bodyStats.map(s => ({ value: parseFloat(s.weight) })).filter(d => d.value);
  
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <h2 className="text-xl font-bold text-gray-800">Performance Trends</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <SimpleLineChart title="Body Weight Trend (kg)" data={weightData.length ? weightData : [{value: 78}, {value: 77.5}, {value: 77.2}]} color="#10b981" />
          <SimpleLineChart title="Squat Strength (Est. 1RM)" data={[{value: 85}, {value: 88}, {value: 90}, {value: 92}]} color="#3b82f6" />
          <SimpleLineChart title="RDL Volume Load" data={[{value: 2100}, {value: 2200}, {value: 2400}]} color="#f59e0b" />
        </div>
  
        <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-500 text-center">
          Charts update as you log more data in the Tracker and Home tabs.
        </div>
      </div>
    );
  };
  
  const Tracker = ({ logs, setLogs }: {logs: any, setLogs: any}) => {
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [activeCalc, setActiveCalc] = useState<{id: string, weight: any} | null>(null);
    const [toast, setToast] = useState('');
  
    const handleLogChange = (weekId: number, day: string, exerciseIdx: number, setIdx: number, field: string, value: any) => {
      const newLogs = { ...logs };
      if (!newLogs[weekId]) newLogs[weekId] = {};
      if (!newLogs[weekId][day]) newLogs[weekId][day] = {};
      if (!newLogs[weekId][day][exerciseIdx]) newLogs[weekId][day][exerciseIdx] = {};
      if (!newLogs[weekId][day][exerciseIdx][setIdx]) newLogs[weekId][day][exerciseIdx][setIdx] = {};
      
      newLogs[weekId][day][exerciseIdx][setIdx][field] = value;
      setLogs(newLogs);
    };
  
    const getLogValue = (weekId: number, day: string, exerciseIdx: number, setIdx: number, field: string) => {
      return logs[weekId]?.[day]?.[exerciseIdx]?.[setIdx]?.[field] || '';
    };
  
    const handleSubmitExercise = (weekId: number, day: string, exercise: any, exerciseIdx: number) => {
        const dayLogs = logs[weekId]?.[day]?.[exerciseIdx] || {};
        let logString = `Update for Gemini - Week ${weekId}, ${day} - ${exercise.name}:\n`;
        
        let hasData = false;
        // We now iterate up to 4 sets for submission
        Array.from({ length: 4 }).forEach((_, setIdx) => {
          const setLog = dayLogs[setIdx] || {};
          const weight = setLog.weight || '-';
          const reps = setLog.reps || '-';
          if (setLog.weight || setLog.reps) {
              logString += `Set ${setIdx + 1}: ${weight}kg x ${reps} reps\n`;
              hasData = true;
          }
        });
    
        if (!hasData) {
          setToast('Please log some data first!');
          setTimeout(() => setToast(''), 3000);
          return;
        }
    
        try {
            const textArea = document.createElement("textarea");
            textArea.value = logString;
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";
    
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
    
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
    
            if (successful) {
                setToast('Copied! Paste into chat.');
            } else {
                 setToast('Failed to copy.');
            }
        } catch (err) {
            setToast('Error copying.');
        }
        setTimeout(() => setToast(''), 3000);
      };
  
    return (
      <div className="relative pb-24">
        {toast && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full shadow-xl z-50 text-sm font-medium animate-bounce">
            {toast}
          </div>
        )}
  
        {/* Week Selector */}
        <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
          {WEEKS.map((week) => (
            <button
              key={week.id}
              onClick={() => setSelectedWeek(week.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedWeek === week.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {week.label}
            </button>
          ))}
        </div>
  
        <div className="space-y-8">
          {Object.entries(WORKOUTS).map(([dayKey, workout]: [string, any]) => (
            <div key={dayKey}>
              <div className="sticky top-0 bg-gray-50/95 backdrop-blur z-10 py-3 border-b border-gray-200 mb-3">
                <h3 className="font-bold text-lg text-gray-900">{workout.title}</h3>
                <p className="text-sm text-blue-600">{workout.focus}</p>
              </div>

              {/* AI Coach Briefing inserted here */}
              <AICoachBriefing workout={workout} phase={WEEKS[selectedWeek-1].phase} />
              
              {workout.exercises.map((ex: any, idx: number) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="max-w-[70%]">
                      <h4 className="font-bold text-gray-800">{ex.name}</h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block mt-1">{ex.notes}</span>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-semibold text-blue-600">Goal: {ex.target}</div>
                      <div className="text-gray-400">{ex.sets} x {ex.reps}</div>
                    </div>
                  </div>
  
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    {/* FORCED 4 SETS RENDER */}
                    {Array.from({ length: 4 }).map((_, setIdx) => {
                      const currentWeight = getLogValue(selectedWeek, dayKey, idx, setIdx, 'weight');
                      return (
                        <div key={setIdx} className="flex gap-2 items-center relative">
                          <span className="text-xs text-gray-400 w-8">Set {setIdx + 1}</span>
                          
                          <div className="relative flex-1">
                            <input 
                              type="number"
                              inputMode="decimal"
                              placeholder="kg"
                              className="w-full p-2 text-sm border rounded text-center"
                              value={currentWeight}
                              onChange={(e) => handleLogChange(selectedWeek, dayKey, idx, setIdx, 'weight', e.target.value)}
                            />
                            {/* Plate Calc Trigger */}
                            {currentWeight > 20 && (
                              <button 
                                onClick={() => setActiveCalc(activeCalc?.id === `${idx}-${setIdx}` ? null : { id: `${idx}-${setIdx}`, weight: currentWeight })}
                                className="absolute right-1 top-1.5 text-gray-400 hover:text-blue-600"
                              >
                                <Calculator size={14} />
                              </button>
                            )}
                            <PlateCalculator 
                              isOpen={activeCalc?.id === `${idx}-${setIdx}`} 
                              onClose={() => setActiveCalc(null)} 
                              weight={currentWeight} 
                            />
                          </div>
  
                          <input 
                            type="number"
                            inputMode="numeric"
                            placeholder="reps"
                            className="w-16 p-2 text-sm border rounded text-center"
                            value={getLogValue(selectedWeek, dayKey, idx, setIdx, 'reps')}
                            onChange={(e) => handleLogChange(selectedWeek, dayKey, idx, setIdx, 'reps', e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                  
                   <div className="mt-3 flex justify-end border-t border-gray-100 pt-3">
                      <button
                          onClick={() => handleSubmitExercise(selectedWeek, dayKey, ex, idx)}
                          className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-full hover:bg-blue-100 transition-colors active:scale-95"
                      >
                          <Send size={14} />
                          Submit to Chat
                      </button>
                    </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

// --- Main App ---

export default function TrainingDashboardV3() {
  const [activeTab, setActiveTab] = useState('home');
  const [logs, setLogs] = useState({});
  const [bodyStats, setBodyStats] = useState<any[]>([]);
  
  // Consistency logic
  const daysPassed = Math.floor((new Date().getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.ceil((TARGET_DATE.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const loggedDays = Object.keys(logs).length * 3; // Rough estimate of logged sessions
  const consistency = daysPassed > 0 ? Math.min(100, Math.round((loggedDays / daysPassed) * 100)) : 100;

  useEffect(() => {
    const savedLogs = localStorage.getItem('michelangelo_training_logs');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    
    const savedStats = localStorage.getItem('michelangelo_body_stats');
    if (savedStats) setBodyStats(JSON.parse(savedStats));
  }, []);

  useEffect(() => {
    localStorage.setItem('michelangelo_training_logs', JSON.stringify(logs));
  }, [logs]);

  const exportData = () => {
    const dataStr = JSON.stringify({ logs, bodyStats });
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `michelangelo_training_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
            const data = JSON.parse(result);
            if (data.logs) setLogs(data.logs);
            if (data.bodyStats) setBodyStats(data.bodyStats);
            alert('Data imported successfully!');
        }
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-16">
      {/* Header with Data Tools */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={() => setActiveTab('home')}>
            <div className="bg-blue-600 text-white p-1.5 rounded-lg cursor-pointer">
              <Activity size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Brazil Ready</h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Command Center</p>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={exportData} className="p-2 text-gray-500 hover:text-blue-600" title="Export JSON">
               <Download size={18} />
             </button>
             <label className="p-2 text-gray-500 hover:text-blue-600 cursor-pointer" title="Import JSON">
               <Upload size={18} />
               <input type="file" onChange={importData} className="hidden" accept=".json" />
             </label>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="max-w-3xl mx-auto px-4 flex gap-6 overflow-x-auto no-scrollbar border-t border-gray-100">
          {[
            { id: 'home', label: 'Mission', icon: Home },
            { id: 'tracker', label: 'Tracker', icon: Dumbbell },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'plan', label: 'Plan', icon: Calendar },
            { id: 'nutrition', label: 'Nutrition', icon: Utensils },
            { id: 'instructions', label: 'Docs', icon: Info },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {activeTab === 'home' && <HomeDashboard consistency={consistency} daysLeft={daysLeft} bodyStats={bodyStats} setBodyStats={setBodyStats} />}
        {activeTab === 'tracker' && <Tracker logs={logs} setLogs={setLogs} />}
        {activeTab === 'analytics' && <Analytics logs={logs} bodyStats={bodyStats} />}
        {activeTab === 'plan' && <Roadmap />}
        {activeTab === 'nutrition' && <NutritionPro bodyStats={bodyStats} />}
        {activeTab === 'instructions' && <InstructionsPro />}
      </main>

      {/* Global Tools */}
      <TimerFloating />
    </div>
  );
}