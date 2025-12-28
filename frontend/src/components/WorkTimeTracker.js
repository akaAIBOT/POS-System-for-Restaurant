import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function WorkTimeTracker() {
  const [isWorking, setIsWorking] = useState(false);
  const [workLog, setWorkLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState('');

  useEffect(() => {
    checkWorkStatus();
  }, []);

  useEffect(() => {
    let interval;
    if (isWorking && workLog) {
      interval = setInterval(() => {
        const clockIn = new Date(workLog.clock_in);
        const now = new Date();
        const diff = now - clockIn;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        setElapsedTime(`${hours}ч ${minutes}м`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorking, workLog]);

  const checkWorkStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/work-logs/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setIsWorking(true);
          setWorkLog(data);
        }
      }
    } catch (error) {
      console.error('Error checking work status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/work-logs/clock-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsWorking(true);
        setWorkLog(data);
        toast.success('Rozpoczęto zmianę!');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Błąd rozpoczęcia zmiany');
      }
    } catch (error) {
      toast.error('Błąd rozpoczęcia zmiany');
    }
  };

  const handleClockOut = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/work-logs/clock-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        const data = await response.json();
        const clockIn = new Date(data.clock_in);
        const clockOut = new Date(data.clock_out);
        const hours = ((clockOut - clockIn) / 3600000).toFixed(2);
        
        setIsWorking(false);
        setWorkLog(null);
        setElapsedTime('');
        toast.success(`Koniec zmiany! Przepracowano: ${hours} godzin`);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Błąd zakończenia zmiany');
      }
    } catch (error) {
      toast.error('Błąd zakończenia zmiany');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {isWorking ? (
        <>
          <div className="text-right">
            <p className="text-sm opacity-90">Na zmianie</p>
            <p className="font-semibold">{elapsedTime}</p>
          </div>
          <button
            onClick={handleClockOut}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition shadow-lg font-semibold"
          >
            Zakończ zmianę
          </button>
        </>
      ) : (
        <button
          onClick={handleClockIn}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-lg font-semibold"
        >
          Rozpocznij zmianę
        </button>
      )}
    </div>
  );
}
