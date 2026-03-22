import { supabase } from './supabase';

export interface GraphNode {
  id: string;
  label: string;
  type: 'book' | 'note' | 'quote';
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  weight: number;
  label?: string;
}

export const generateIdeaGraphData = async (
  notes: any[],
  quotes: any[]
): Promise<{ nodes: GraphNode[], links: GraphLink[] }> => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: { action: 'generateIdeaGraphData', payload: { notes, quotes } }
    });

    if (error) throw error;
    return data || { nodes: [], links: [] };
  } catch (error) {
    console.error("Idea Graph Data Error:", error);
    return { nodes: [], links: [] };
  }
};
