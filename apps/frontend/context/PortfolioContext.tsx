"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { PortfolioData } from '@/lib/types';

interface ContextType {
  data: PortfolioData | null;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const PortfolioContext = createContext<ContextType>({
  data: null,
  loading: true,
  refreshData: async () => {},
});

export const PortfolioProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      const res = await api.get(`/portfolio?t=${Date.now()}`);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching context data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <PortfolioContext.Provider value={{ data, loading, refreshData }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => useContext(PortfolioContext);
