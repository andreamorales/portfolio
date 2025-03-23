<script lang="ts">
  import {
    isPdf,
    renderAllPdfPagesSingleImage,
    renderPdfPage,
    type DispatchEventType,
  } from '$lib/utils';
  import type { PDFDocumentProxy } from 'pdfjs-dist';
  import { createEventDispatcher, onMount } from 'svelte';

  export let imageData: string | ArrayBuffer = '';
  export let pdfData: string | ArrayBuffer = '';
  export let maxSize: number = 400;

  let canvasContainer: HTMLDivElement = document.createElement('div');
  let canvas: HTMLCanvasElement = document.createElement('canvas');
  let ctx: CanvasRenderingContext2D | null;
  let newImage = new Image();
  let pdf: PDFDocumentProxy;
  let PDFJS;

  const dispatch = createEventDispatcher();
  export let dispatchEvent: (
    eventType: DispatchEventType,
    payload?: any,
  ) => void = (eventType, payload) => dispatch(eventType, payload);

  onMount(async () => {
    if (isPdf(imageData)) {
      return renderPdf();
    }
    renderImage();
  });

  async function renderImage() {
    ctx = canvas.getContext('2d');
    newImage.addEventListener('load', (e) => {
      if (ctx) {
        let ratio = newImage.width / newImage.height;
        let imageWidth = maxSize;
        let imageHeight = maxSize;
        if (newImage.width >= newImage.height) {
          imageWidth = maxSize;
          imageHeight = imageWidth / ratio;
        } else {
          imageHeight = maxSize;
          imageWidth = imageHeight * ratio;
        }
        ctx.drawImage(
          newImage,
          0,
          0,
          newImage.width,
          newImage.height,
          maxSize / 2 - imageWidth / 2,
          maxSize / 2 - imageHeight / 2,
          imageWidth,
          imageHeight,
        );
      }
    });
    newImage.src = imageData.toString();
  }

  async function renderPdf() {
    PDFJS = await import('pdfjs-dist');
    PDFJS.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${PDFJS.version}/build/pdf.worker.min.mjs`;

    try {
      // Can be a URL where a PDF file is located, a typed array (Uint8Array)
      // already populated with data, or a parameter object.
      pdf = await PDFJS.getDocument(pdfData).promise;
      const { numPages } = pdf;

      // Batch render all pages if there are more than 1
      if (numPages > 1) {
        const renderedPages = await renderAllPdfPagesSingleImage(
          pdf,
          numPages,
          canvas,
          ctx,
        );
        dispatchEvent('pdfloaded', { pdf, numPages, renderedPages, ctx });
        return;
      }

      const pageOne = 1;
      const renderedPage = await renderPdfPage(pdf, pageOne);
      dispatchEvent('pdfloaded', {
        pdf,
        numPages,
        renderedPage,
        ctx,
      });
    } catch (error: any) {
      console.error('ERROR while getting document from imageData:', error);
    }
  }

  // Renders all pages of a PDF document.
  // returns a map of rendered pages
  async function renderAllPdfPages(pdf: PDFDocumentProxy, numPages: number) {
    let renderedPages = new Map();

    canvasContainer.removeChild(canvas);
    for (let i = 1; i <= numPages; i++) {
      const ret = (await renderPdfPage(pdf, i))!;
      renderedPages.set(ret.pageNumber, ret);
      canvasContainer.appendChild(ret.canvas);
    }
    return renderedPages;
  }
</script>

<div
  bind:this={canvasContainer}
  class={isPdf(imageData)
    ? 'flex flex-wrap gap-2 p-2 overflow-scroll max-h-[860px] max-w-[610px]'
    : 'flex-column-center max-h-[860px] max-w-[610px]'}
>
  <canvas bind:this={canvas} width="{maxSize}px" height="{maxSize}px" />
</div>

<style>
  ::-webkit-scrollbar {
    width: 4px;
    height: 2px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: var(--lightblue);
  }

  ::-webkit-scrollbar-track {
    background-color: transparent;
  }

  ::-webkit-scrollbar-corner {
    background-color: var(--lightblue);
  }
</style>
