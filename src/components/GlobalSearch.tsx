import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Calendar, Stethoscope, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAppState } from '@/context/AppContext';

type SearchResult = {
  id: string;
  type: 'patient' | 'surgery' | 'intake' | 'schedule';
  title: string;
  subtitle: string;
  link: string;
};

export function GlobalSearch() {
  const navigate = useNavigate();
  const { viewingBranch } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch();
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, viewingBranch]);

  const performSearch = async () => {
    setLoading(true);
    const search = searchQuery.toLowerCase();

    try {
      // Run all queries in parallel for faster results
      const [patientsRes, surgeriesRes, intakesRes, schedulesRes] = await Promise.all([
        supabase
          .from('patients')
          .select('id, patient_id, firstname, lastname, contact_number')
          .eq('branch', viewingBranch)
          .or(`firstname.ilike.%${search}%,lastname.ilike.%${search}%,patient_id.ilike.%${search}%,contact_number.ilike.%${search}%`)
          .limit(5),
        
        supabase
          .from('surgeries')
          .select('id, scheduled_date, scheduled_time, procedure, patients!inner(firstname, lastname, patient_id)')
          .eq('branch', viewingBranch)
          .or(`procedure.ilike.%${search}%`)
          .limit(5),
        
        supabase
          .from('intakes')
          .select('id, stage, created_at, patients!inner(firstname, lastname, patient_id)')
          .eq('branch', viewingBranch)
          .eq('in_progress', true)
          .limit(5),
        
        supabase
          .from('schedules')
          .select('id, scheduled_date, scheduled_time, procedure_type, patients!inner(firstname, lastname)')
          .eq('branch', viewingBranch)
          .or(`procedure_type.ilike.%${search}%`)
          .limit(5)
      ]);

      const allResults: SearchResult[] = [];

      // Process patients
      if (patientsRes.data) {
        allResults.push(
          ...patientsRes.data.map((p) => ({
            id: p.id,
            type: 'patient' as const,
            title: `${p.firstname} ${p.lastname}`,
            subtitle: `ID: ${p.patient_id}`,
            link: `/information/${p.id}`,
          }))
        );
      }

      // Process surgeries
      if (surgeriesRes.data) {
        allResults.push(
          ...surgeriesRes.data.map((s: any) => ({
            id: s.id,
            type: 'surgery' as const,
            title: `${s.procedure} - ${s.patients.firstname} ${s.patients.lastname}`,
            subtitle: `${s.scheduled_date} at ${s.scheduled_time}`,
            link: `/surgery`,
          }))
        );
      }

      // Process intakes
      if (intakesRes.data) {
        allResults.push(
          ...intakesRes.data.map((i: any) => ({
            id: i.id,
            type: 'intake' as const,
            title: `${i.patients.firstname} ${i.patients.lastname} - ${i.stage}`,
            subtitle: `Patient ID: ${i.patients.patient_id}`,
            link: `/my-tasks`,
          }))
        );
      }

      // Process schedules
      if (schedulesRes.data) {
        allResults.push(
          ...schedulesRes.data.map((s: any) => ({
            id: s.id,
            type: 'schedule' as const,
            title: `${s.procedure_type} - ${s.patients.firstname} ${s.patients.lastname}`,
            subtitle: `${s.scheduled_date} at ${s.scheduled_time}`,
            link: `/scheduling`,
          }))
        );
      }

      setResults(allResults);
      setIsOpen(allResults.length > 0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (link: string) => {
    navigate(link);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      handleResultClick(results[0].link);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'patient':
        return <User className="h-4 w-4 text-primary" />;
      case 'surgery':
        return <Stethoscope className="h-4 w-4 text-error" />;
      case 'intake':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'schedule':
        return <Calendar className="h-4 w-4 text-success" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex-1 max-w-xl relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search patients, surgeries, schedules... (Press Enter)"
          className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent transition-all"
        />
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No results found
            </div>
          ) : (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result.link)}
                  className="w-full px-4 py-3 hover:bg-secondary transition-colors flex items-center gap-3 text-left"
                >
                  <div className="flex-shrink-0">{getIcon(result.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {result.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.subtitle}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground capitalize">
                      {result.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
