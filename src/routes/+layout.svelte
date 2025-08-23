<script lang="ts">
	import '../app.css';
	import { LocalStorageState } from '$lib/states/index.js'
	import { setContext } from 'svelte';

	let { children } = $props();
	const hasLocalStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
	console.log(hasLocalStorage);
	const localStorageState = new LocalStorageState();
	localStorageState.init(hasLocalStorage ? localStorage : null);
	localStorageState.set('test', 'id');
	const getTest = localStorageState.get<string>('test');

	setContext('localStorageState', localStorageState);
</script>

{getTest.success ? getTest.data : 'no data'}
{@render children()}
