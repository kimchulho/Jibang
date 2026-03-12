import { supabase } from './supabase';
import { getBonGwanHanjaFromAI } from './aiService';
import { BonGwan, JibangHistory } from '../types';

export const getBonGwanHanja = async (surname: string, bon_gwan: string): Promise<BonGwan> => {
  // 1. Search in DB
  const { data, error } = await supabase
    .from('jibang_bon_gwan')
    .select('*')
    .eq('surname', surname)
    .eq('bon_gwan', bon_gwan)
    .single();

  if (data) {
    return data;
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

  const { data: insertedData, error: insertError } = await supabase
    .from('jibang_bon_gwan')
    .insert([newBonGwan])
    .select()
    .single();

  if (insertError) {
    console.error('Error inserting BonGwan:', insertError);
    return newBonGwan; // Return anyway if insertion fails
  }

  return insertedData;
};

export const saveJibangHistory = async (history: Omit<JibangHistory, 'id' | 'created_at'>) => {
  const { error } = await supabase
    .from('jibang_history')
    .insert([history]);

  if (error) {
    console.error('Error saving history:', error);
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
