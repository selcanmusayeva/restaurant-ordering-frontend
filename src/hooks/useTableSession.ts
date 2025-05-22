import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { setTableSession, clearTableSession } from '../store/slices/orderSlice';

interface TableSessionData {
  tableId: number;
  sessionId: string;
  tableUuid?: string; // Add tableUuid to store the unique identifier
  expiresAt: string;
}

export const useTableSession = (required: boolean = true) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tableSession } = useAppSelector((state) => state.order);
  
  useEffect(() => {
    // Check if there's a table session in local storage
    const storedSession = localStorage.getItem('tableSession');
    
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession) as TableSessionData;
        
        // Validate session expiry
        if (new Date(session.expiresAt) > new Date()) {
          dispatch(setTableSession({
            tableId: session.tableId,
            sessionId: session.sessionId,
            tableUuid: session.tableUuid
          }));
        } else {
          // Clear expired session
          localStorage.removeItem('tableSession');
          if (required) {
            navigate('/scan');
          }
        }
      } catch (error) {
        // Clear invalid session data
        localStorage.removeItem('tableSession');
        if (required) {
          navigate('/scan');
        }
      }
    } else if (required && !tableSession) {
      // Redirect to scan page if session is required but not available
      navigate('/scan');
    }
  }, [dispatch, navigate, required, tableSession]);
  
  const startSession = (tableId: number, sessionId: string, expiresAt: string, tableUuid?: string) => {
    // Save session to Redux
    dispatch(setTableSession({ tableId, sessionId, tableUuid }));
    
    // Save session to localStorage
    localStorage.setItem('tableSession', JSON.stringify({
      tableId,
      sessionId,
      tableUuid,
      expiresAt
    }));
  };
  
  const endSession = () => {
    // Clear session from Redux
    dispatch(clearTableSession());
    
    // Clear session from localStorage
    localStorage.removeItem('tableSession');
    
    // Redirect to scan page
    navigate('/scan');
  };
  
  return {
    tableSession,
    startSession,
    endSession,
    hasActiveSession: !!tableSession
  };
};

export default useTableSession; 