import { supabase } from './supabase';
import { getBonGwanHanjaFromAI } from './aiService';
import { BonGwan, JibangHistory } from '../types';

export const getBonGwanHanja = async (surname: string, bon_gwan: string): Promise<BonGwan> => {
  // 1. Search in DB
  try {
    const { data, error } = await supabase
      .from('jibang_surnames')
      .select('*')
      .eq('surname', surname)
      .eq('bon_gwan', bon_gwan)
      .single();

    if (data) {
      return data;
    }

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error('Supabase query error (jibang_surnames):', error);
    }
  } catch (err) {
    console.error('Unexpected error during BonGwan DB search:', err);
  }

  // 2. If not found, use AI
  console.log('BonGwan not found in DB, using AI...');
  const aiResult = await getBonGwanHanjaFromAI(surname, bon_gwan);

  // 3. Register in DB
  const newBonGwan: BonGwan = {
    surname,
    bon_gwan,
    hanja_surname: aiResult.hanja_surname,
    hanja_bon_gwan: aiResult.hanja_bon_gwan,
  };

  try {
    const { data: insertedData, error: insertError } = await supabase
      .from('jibang_surnames')
      .insert([newBonGwan])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting BonGwan into DB:', insertError);
      return newBonGwan; // Return anyway if insertion fails
    }

    return insertedData;
  } catch (err) {
    console.error('Unexpected error during BonGwan DB insertion:', err);
    return newBonGwan;
  }
};

export const saveJibangHistory = async (history: Omit<JibangHistory, 'id' | 'created_at'>) => {
  try {
    const { error } = await supabase
      .from('jibang_history')
      .insert([history]);

    if (error) {
      console.error('Error saving history to Supabase (jibang_history):', error);
    }
  } catch (err) {
    console.error('Unexpected error during history saving:', err);
  }
};

export const getClientIp = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP:', error);
    return 'unknown';
  }
};

export const getTotalJibangCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('jibang_history')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error getting total count:', error);
    return 0;
  }

  return count || 0;
};
