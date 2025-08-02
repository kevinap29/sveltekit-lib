<script lang="ts">
	import { page } from "$app/state";

    let route = $state('')

    $effect(() => {
        const queryRoute = page.url.searchParams.get('r')

        if (queryRoute) {
            route = queryRoute
        }
    })
</script>

{#snippet showMessage(msg: string)}
    <p>{msg}</p>
{/snippet}

{#if route === ''}
    {@render showMessage('Tidak ada yg error')}
{:else}
    {#if route === 'admin'}
        {@render showMessage('Bukan Admin')}
    {/if}
{/if}

