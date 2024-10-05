// Placeholder Supabase Context

import React, { createContext, useContext } from 'react';
import { supabase } from '../supabaseClient';

const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabaseClient = () => {
  return useContext(SupabaseContext);
};