import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import useTableSession from '../../hooks/useTableSession';

interface TableSessionRouteProps {
  children: React.ReactNode;
}

const TableSessionRoute: React.FC<TableSessionRouteProps> = ({ children }) => {
  const { tableId } = useParams<{ tableId?: string }>();
  const { hasActiveSession } = useTableSession(false);
  
  // Allow access if there is a tableId in the URL params or if there is an active session
  if (!hasActiveSession && !tableId) {
    // Redirect to scan page if no active table session exists and no tableId in URL
    return <Navigate to="/scan" replace />;
  }
  
  return <>{children}</>;
};

export default TableSessionRoute; 