<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { chartColors } from '$lib/constants/chartColors';

  export let value: number = 0;
  export let baselineValue: number = 0;
  export let id: string;

  let chart: Chart;
  let canvas: HTMLCanvasElement;

  $: displayValue = typeof value === 'number' ? value.toFixed(2) : '0.00';

  const getComputedColor = (varName: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  };

  const updateChart = () => {
    if (chart) {
      // Create a stepped pattern for magnitude visualization
      const points = 8;
      const baselineData = Array(points).fill(baselineValue).map((val, i) => 
        val * (1 + Math.floor(i/2) * 0.1)
      );
      const currentData = Array(points).fill(value).map((val, i) => 
        val * (1 + Math.floor(i/2) * 0.1)
      );
      
      chart.data.datasets[0].data = baselineData;
      chart.data.datasets[1].data = currentData;
      chart.options.plugins.title.text = displayValue;
      chart.update();
    }
  };

  $: if (chart && (value !== undefined || baselineValue !== undefined)) {
    updateChart();
  }

  onMount(() => {
    canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;

    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: Array(8).fill(''),
        datasets: [
          {
            label: 'Baseline For Type of Document',
            data: Array(8).fill(baselineValue),
            borderColor: getComputedColor(chartColors.magnitude.baseline.line),
            backgroundColor: `${getComputedColor(chartColors.magnitude.baseline.line)}33`,
            borderWidth: 2,
            tension: 0,
            fill: true,
            pointRadius: 0,
            stepped: true
          },
          {
            label: 'Your Document',
            data: Array(8).fill(value),
            borderColor: getComputedColor(chartColors.magnitude.current.line),
            backgroundColor: `${getComputedColor(chartColors.magnitude.current.line)}33`,
            borderWidth: 3,
            tension: 0,
            fill: true,
            pointRadius: 0,
            stepped: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 64,
            left: -20,
            right: -20,
            bottom: -20
          }
        },
        scales: {
          x: { display: false },
          y: {
            display: false,
            min: 0,
            max: 1
          }
        },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: displayValue,
            color: getComputedColor('--inverse-content'),
            font: {
              family: 'Refract',
              size: 24,
              weight: 'normal'
            }
          }
        }
      }
    });

    return () => {
      if (chart) chart.destroy();
    };
  });
</script>

<div class="chart-wrapper">
  <canvas {id}></canvas>
</div>

<style>
  .chart-wrapper {
    position: absolute;
    inset: 0 0 0 -1px;
    overflow: hidden;
    border-radius: 210px 0 210px 0;
    margin: 0;
    padding: 0;
  }

  canvas {
    position: absolute;
    inset: 0;
    margin: 0;
    padding: 0;
    display: block;
  }
</style> 