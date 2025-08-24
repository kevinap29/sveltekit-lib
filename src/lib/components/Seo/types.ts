export interface SeoProps {
	title: string;
	description: string;
	url: string; // Canonical URL for the page
	type: 'website' | 'article' | 'profile'; // Type of content for SEO
	keywords: string[];
	image: string; // URL to an image for social sharing
	author?: string;
}
