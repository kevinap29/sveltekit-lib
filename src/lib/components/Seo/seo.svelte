<script lang="ts">
	import type { SeoProps } from './types.js';

	let { data }: { data: SeoProps } = $props();
	const { title, description, keywords, author, image, url, type = 'website' } = data;
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
	<meta name="twitter:title" content={title} />
	<meta name="description" content={description} />
	<meta property="og:description" content={description} />
	<meta name="twitter:description" content={description} />
	<meta name="keywords" content={keywords?.join(', ')} />
	<meta property="og:image" content={image} />
	<meta name="twitter:image" content={image} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="og:url" content={url} />
	<meta property="og:type" content={type} />

	{#if author}
		<meta name="author" content={author} />
		<meta property="article:author" content={author} />
	{/if}
</svelte:head>
