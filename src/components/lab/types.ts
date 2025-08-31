export type CategoryId = 'playground' | 'utilities' | 'ai-studio';

export interface LabItem {
  title: string;
  description: string;
  imageUrl?: string;
  link: string;
  tags?: string[];
  status?: 'active' | 'coming-soon' | 'beta';
}

export interface LabCategory {
  id: CategoryId;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  items: LabItem[];
}

export interface LabData {
  categories: LabCategory[];
}
