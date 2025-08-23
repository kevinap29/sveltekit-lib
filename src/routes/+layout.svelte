<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { LocalStorageState } from '$lib/states/index.js'
	import { setContext } from 'svelte';

	let { children } = $props();

	const localStorageState = new LocalStorageState();
	localStorageState.init(browser ? localStorage : null);
	localStorageState.set('test', '1234');

	setContext('localStorageState', localStorageState);
</script>

{@render children()}
