<script lang="ts">
  import { analyticsKey, drmConfig, playerKey } from '$lib/config';
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import type { PlayerConfig } from 'bitmovin-player';
  import type { DispatchEventType } from '$lib/utils';

  const dispatch = createEventDispatcher();
  export let dispatchEvent: (
    eventType: DispatchEventType,
    payload?: any,
  ) => void = (eventType, payload) => dispatch(eventType, payload);
  export let dash = '';
  export let hls = '';

  let player: any;
  let playerContainer: HTMLElement | null;
  export let imageIsPdf;
  export let imageIndex;

  const playerConfig: PlayerConfig = {
    key: playerKey,
    playback: {
      autoplay: false,
      muted: true,
      seeking: false,
    },
    analytics: {
      key: analyticsKey,
    },
    style: {
      height: imageIsPdf ? (imageIndex === 0 ? '5850px' : '5000px') : '800px',
      width: imageIsPdf ? '600px' : '600px',
    },
    events: {
      onError: function (data: any) {
        console.error('An error occurred:', data);
      },
      onPlaybackBlocked: function () {
        console.warn('Playback is blocked due to DRM restrictions.');
      },
      drmlicenseadded: function (drmLicense: any) {
        console.log(`drmlicenseadded:`, drmLicense);
        dispatchEvent('drm', drmLicense);
      },
      destroy: function () {
        dispatchEvent('destroyed');
      },
    },
    logs: {
      onLog: (logLevel: any, message: string, ...params: any[]) => {
        // console.log(`${logLevel}: ${message}\n ${params}`);
      },
    },
  };

  const sourceConfig = {
    dash,
    hls,
    drm: drmConfig,
  };

  onMount(async () => {
    // Import the library only on the client side
    if (typeof window !== 'undefined') {
      try {
        const { Player } = await import('bitmovin-player');

        player = new Player(playerContainer as HTMLElement, playerConfig);

        try {
          await player.load(sourceConfig);
          console.info('Successfully loaded source');
        } catch (error: any) {
          console.error('Error while loading source:', error);
        }
        dispatchEvent('playerloaded', player);
      } catch (error: any) {
        console.error('Error during dynamic import:', error);
      }
    }
  });

  onDestroy(async () => {
    if (player) {
      await player.destroy();
    }
  });
</script>

<div bind:this={playerContainer}>
  <slot />
</div>
