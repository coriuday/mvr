export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  published: boolean;
  author_id?: string;
  meta_title?: string;
  meta_description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}
