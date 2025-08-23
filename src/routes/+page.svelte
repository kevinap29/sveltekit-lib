<script lang="ts">
	import { browser } from '$app/environment';
	import { JWTHelper } from '$lib/helpers/index.js';
	import { localStorageState } from '$lib/states/index.js'

	let token = $state('loading...');

	localStorageState.set('test', '12315123')

	async function getToken() {
		token = await JWTHelper.generate('test', { role: '', email: '' });
	}

	$effect(() => {
		const interval = setTimeout(async () => await getToken(), 2000);

		return () => {
			clearTimeout(interval);
		};
	});
</script>

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<p>{token}</p>
<form
	action="https://www.paypal.com/ncp/payment/GZKMJH6QPVGSC"
	method="post"
	target="_blank"
	style="display:inline-grid;justify-items:center;align-content:start;gap:0.5rem;"
>
	<input class="pp-GZKMJH6QPVGSC" type="submit" value="Buy Me Coffee" />
	<img src="https://www.paypalobjects.com/images/Debit_Credit.svg" alt="cards" />
	<section style="font-size: 0.75rem;">
		Powered by <img
			src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg"
			alt="paypal"
			style="height:0.875rem;vertical-align:middle;"
		/>
	</section>
</form>

<style>
	.pp-GZKMJH6QPVGSC {
		text-align: center;
		border: none;
		border-radius: 0.25rem;
		min-width: 11.625rem;
		padding: 0 2rem;
		height: 2.625rem;
		font-weight: bold;
		background-color: #ffd140;
		color: #000000;
		font-family: 'Helvetica Neue', Arial, sans-serif;
		font-size: 1rem;
		line-height: 1.25rem;
		cursor: pointer;
	}
</style>
