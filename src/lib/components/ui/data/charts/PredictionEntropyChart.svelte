<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import Chart from 'chart.js/auto';
  import { chartColors } from '$lib/constants/chartColors';
  import { theme } from '$lib/stores/theme';

  export let value: number = 0;
  export let baselineValue: number = 0;
  export let id: string;
  export let variant: 'default' | 'compact' = 'default';
  export let borderTopLeft = '0px';
  export let borderTopRight = '0px';
  export let borderBottomRight = '0px';
  export let borderBottomLeft = '0px';
  export let chunkValues: Array<{entropy: number, text: string}> = [];

  let chart: Chart | null = null;
  let canvas: HTMLCanvasElement;
  let chartInitialized = false;

  $: displayValue = typeof value === 'number' ? value.toFixed(2) : '0.00';

  // Add console logs to track component lifecycle
  let prevValue = value;
  let prevBaselineValue = baselineValue;
  
  $: {
    console.log(`PredictionEntropyChart [${id}] value changed:`, value);
    console.log(`PredictionEntropyChart [${id}] baseline value:`, baselineValue);
    console.log(`PredictionEntropyChart [${id}] chart initialized:`, chartInitialized);
    
    // Force chart recreation when value changes significantly
    if (chartInitialized && chart && typeof value === 'number' && 
        (value !== prevValue || baselineValue !== prevBaselineValue)) {
      console.log(`PredictionEntropyChart [${id}] updating chart with new value:`, value);
      prevValue = value;
      prevBaselineValue = baselineValue;
      updateChart();
    }
  }

  // Subscribe to theme changes
  $: if ($theme && chart) {
    console.log(`Theme changed to ${$theme}, updating chart colors`);
    updateChart();
  }

  const getComputedColor = (varName: string) => {
    // Force recompute colors when called
    if (typeof document !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue(varName.replace('var(', '').replace(')', '')).trim();
    }
    return '#000000';
  };

  const getStatusColor = (current: number, baseline: number) => {
    const difference = Math.abs(current - baseline);
    const threshold = 0.05; // 5% difference threshold for "close"
    
    // Get base colors from chart colors, using darker variants in light mode
    let color;
    if (difference < threshold) {
      color = getComputedColor($theme === 'light' ? '--yellow-darker' : chartColors.predictionEntropy.current.warning);
    } else if (current > baseline) {
      color = getComputedColor($theme === 'light' ? '--green-darker' : chartColors.predictionEntropy.current.success);
    } else {
      color = getComputedColor($theme === 'light' ? '--red-darker' : chartColors.predictionEntropy.current.error);
    }
    return color;
  };

  // Update point background color opacity based on theme
  const getPointBackgroundColor = (value: number) => {
    const baseColor = getStatusColor(value, baselineValue);
    // Add opacity to hex color
    if (baseColor.startsWith('#')) {
      return $theme === 'light' ? `${baseColor}dd` : `${baseColor}80`; // dd = 87% opacity in light mode
    }
    return baseColor;
  };

  // Add function to get hover color
  const getHoverColor = (value: number) => {
    const baseColor = getStatusColor(value, baselineValue);
    // Add opacity to hex color
    if (baseColor.startsWith('#')) {
      return $theme === 'light' ? baseColor : `${baseColor}cc`; // Full color in light mode
    }
    return baseColor;
  };

  const createGradients = (ctx: CanvasRenderingContext2D, height: number) => {
    if (!ctx) return null;
    
    const baselineGradient = ctx.createLinearGradient(0, 0, 0, height);
    const currentGradient = ctx.createLinearGradient(0, 0, 0, height);

    const baselineColor = getComputedColor(chartColors.predictionEntropy.baseline.line);
    baselineGradient.addColorStop(0, `${baselineColor}20`);
    baselineGradient.addColorStop(1, `${baselineColor}00`);

    const currentColor = getStatusColor(value, baselineValue);
    currentGradient.addColorStop(0, `${currentColor}33`);
    currentGradient.addColorStop(1, `${currentColor}00`);

    return { 
      baselineGradient, 
      currentGradient, 
      baselineColor: `${baselineColor}40`,
      currentColor 
    };
  };

  const initChart = () => {
    if (!canvas || chartInitialized) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradients = createGradients(ctx, canvas.height);
    if (!gradients) return;

    // Use actual chunk values or fallback to average
    const entropyValues = chunkValues.length > 0 
      ? chunkValues.map(chunk => chunk.entropy)
      : Array(10).fill(value);

    const labels = chunkValues.length > 0
      ? chunkValues.map(chunk => chunk.text)
      : Array(10).fill('');

    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Baseline For Type of Document',
            data: Array(labels.length).fill(baselineValue),
            borderColor: `${getComputedColor('--text-color')}40`,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [2, 2],
            tension: 0,
            fill: false,
            pointRadius: 0,
            tooltip: {
              enabled: false
            }
          },
          {
            label: 'Your Document',
            data: entropyValues,
            borderColor: function(context) {
              const chart = context.chart;
              const {ctx, chartArea} = chart;
              
              if (!chartArea) {
                return getComputedColor('--white');
              }
              
              const currentData = chart.data.datasets[1].data.map(val => typeof val === 'number' ? val : null);
              return getGradient(ctx, chartArea, currentData);
            },
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            pointRadius: 4,
            pointBackgroundColor: (context) => {
              const value = context.raw;
              if (value === undefined || value === null) return 'transparent';
              return getPointBackgroundColor(Number(value));
            },
            pointBorderColor: 'transparent',
            pointHoverBackgroundColor: (context) => {
              const value = context.raw;
              if (value === undefined || value === null) return 'transparent';
              return getHoverColor(Number(value));
            },
            pointHoverBorderColor: 'transparent',
            pointStyle: 'circle',
            pointBorderWidth: 1,
            pointHoverBorderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: true
        },
        layout: {
          padding: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
          }
        },
        scales: {
          x: {
            display: true,
            offset: false,
            grid: {
              display: true,
              drawOnChartArea: true,
              drawTicks: false,
              color: $theme === 'light' ? 
                `${getComputedColor('--grey-darkest')}60` : 
                `${getComputedColor('--text-color')}10`,
              lineWidth: 1
            },
            ticks: {
              display: false
            },
            title: {
              display: true,
              text: 'Document Chunks',
              color: $theme === 'light' ? 
                `${getComputedColor('--grey-darkest')}cc` : 
                `${getComputedColor('--text-color')}50`,
              font: {
                family: 'Recursive Variable',
                size: 10
              },
              padding: {
                top: 10
              }
            },
            border: {
              color: $theme === 'light' ? 
                `${getComputedColor('--grey-darkest')}60` : 
                `${getComputedColor('--text-color')}20`
            }
          },
          y: {
            display: true,
            min: 0,
            max: Math.max(1, ...entropyValues, baselineValue) * 1.1,
            offset: false,
            grid: {
              display: false,
              color: $theme === 'light' ? 
                `${getComputedColor('--grey-darkest')}60` : 
                `${getComputedColor('--text-color')}10`,
              lineWidth: 1
            },
            ticks: {
              display: false
            },
            title: {
              display: true,
              text: 'Entropy',
              color: $theme === 'light' ? 
                `${getComputedColor('--grey-darkest')}cc` : 
                `${getComputedColor('--text-color')}50`,
              font: {
                family: 'Recursive Variable',
                size: 10
              },
              padding: {
                bottom: 10
              }
            },
            border: {
              color: $theme === 'light' ? 
                `${getComputedColor('--grey-darkest')}60` : 
                `${getComputedColor('--text-color')}20`
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            position: 'nearest',
            mode: 'index',
            intersect: false,
            backgroundColor: getComputedColor('--inverse-bg-light'),
            titleColor: getComputedColor('--text-color'),
            bodyColor: getComputedColor('--text-color'),
            padding: 8,
            cornerRadius: 8,
            displayColors: false,
            yAlign: 'bottom',
            titleFont: {
              family: 'Recursive Variable'
            },
            bodyFont: {
              family: 'Recursive Variable',
              size: 10
            },
            callbacks: {
              title: (context) => {
                if (chunkValues.length > 0) {
                  const chunk = chunkValues[context[0].dataIndex];
                  const truncatedText = chunk.text.length > 100 
                    ? chunk.text.substring(0, 100) + '...'
                    : chunk.text;
                  return `'${truncatedText}'`;
                }
                return '';
              },
              label: (context) => {
                if (context.datasetIndex === 1) {
                  const value = Number(context.raw);
                  const diff = value - baselineValue;
                  const threshold = Math.abs(baselineValue * 0.05);
                  
                  let relationship = '';
                  if (diff > threshold) {
                    relationship = `${((diff/baselineValue)*100).toFixed(0)}% above baseline`;
                  } else if (diff < -threshold) {
                    relationship = `${(Math.abs(diff)/baselineValue*100).toFixed(0)}% below baseline`;
                  } else {
                    relationship = 'Near baseline';
                  }
                  
                  return [
                    `Value: ${value.toFixed(4)} (${relationship})`
                  ];
                }
                return [];
              }
            }
          }
        }
      }
    });

    chartInitialized = true;
  };

  const updateChart = () => {
    if (!chart || !canvas || !chartInitialized) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use actual chunk values or fallback to average
    const entropyValues = chunkValues.length > 0 
      ? chunkValues.map(chunk => chunk.entropy)
      : Array(10).fill(value);

    const baselineData = Array(entropyValues.length).fill(baselineValue);
    
    chart.data.labels = chunkValues.length > 0
      ? chunkValues.map(chunk => chunk.text)
      : Array(entropyValues.length).fill('');
    
    // Update baseline line color
    chart.data.datasets[0].data = baselineData;
    chart.data.datasets[0].borderColor = `${getComputedColor('--text-color')}40`;
    chart.data.datasets[0].backgroundColor = 'transparent';
    
    // Update data points
    chart.data.datasets[1].data = entropyValues;
    
    // Update scales colors
    if (chart.options.scales?.x) {
      chart.options.scales.x.grid.color = $theme === 'light' ? 
        `${getComputedColor('--grey-darkest')}60` : 
        `${getComputedColor('--text-color')}10`;
      chart.options.scales.x.title.color = $theme === 'light' ? 
        `${getComputedColor('--grey-darkest')}cc` : 
        `${getComputedColor('--text-color')}50`;
      chart.options.scales.x.border.color = $theme === 'light' ? 
        `${getComputedColor('--grey-darkest')}60` : 
        `${getComputedColor('--text-color')}20`;
    }
    
    if (chart.options.scales?.y) {
      chart.options.scales.y.max = Math.max(1, ...entropyValues, baselineValue) * 1.1;
      chart.options.scales.y.grid.color = $theme === 'light' ? 
        `${getComputedColor('--grey-darkest')}60` : 
        `${getComputedColor('--text-color')}10`;
      chart.options.scales.y.title.color = $theme === 'light' ? 
        `${getComputedColor('--grey-darkest')}cc` : 
        `${getComputedColor('--text-color')}50`;
      chart.options.scales.y.border.color = $theme === 'light' ? 
        `${getComputedColor('--grey-darkest')}60` : 
        `${getComputedColor('--text-color')}20`;
    }

    // Update tooltip colors
    if (chart.options.plugins?.tooltip) {
      chart.options.plugins.tooltip.backgroundColor = getComputedColor('--inverse-bg-light');
      chart.options.plugins.tooltip.titleColor = getComputedColor('--text-color');
      chart.options.plugins.tooltip.bodyColor = getComputedColor('--text-color');
    }
    
    // Force chart to redraw with new colors
    requestAnimationFrame(() => {
      if (chart) chart.update('none');
    });
  };

  onMount(() => {
    console.log('PredictionEntropyChart mounted');
    canvas = document.getElementById(id) as HTMLCanvasElement;
    console.log('Canvas after mount:', canvas);
    
    if (canvas) {
      // Wait for next tick to ensure container dimensions are set
      setTimeout(() => {
        const parentWidth = canvas.parentElement?.clientWidth || 300;
        const parentHeight = variant === 'compact' ? 160 : 300;
        
        canvas.width = parentWidth;
        canvas.height = parentHeight;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        
        initChart();
      }, 0);
    }

    return () => {
      if (chart) {
        chart.destroy();
        chart = null;
        chartInitialized = false;
      }
    };
  });

  afterUpdate(() => {
    console.log('PredictionEntropyChart updated');
    if (chart && chartInitialized && (value !== undefined || baselineValue !== undefined)) {
      console.log('Updating chart with value:', value);
      updateChart();
    }
  });

  // Add the getGradient function from InformationFlowChart
  const getGradient = (ctx: CanvasRenderingContext2D, chartArea: any, data: (number | null)[]) => {
    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;
    
    let gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
    
    // Create gradient stops based on data points
    if (data && data.length > 0) {
      data.forEach((value, index) => {
        if (value !== null) {
          const position = index / (data.length - 1);
          const color = getStatusColor(value, baselineValue);
          gradient.addColorStop(position, color);
        }
      });
    } else {
      // Fallback gradient
      gradient.addColorStop(0, getComputedColor(chartColors.predictionEntropy.current.error));
      gradient.addColorStop(0.5, getComputedColor(chartColors.predictionEntropy.current.warning));
      gradient.addColorStop(1, getComputedColor(chartColors.predictionEntropy.current.success));
    }
    
    return gradient;
  };
</script>

<div 
  class="chart-wrapper" 
  class:compact={variant === 'compact'}
  style="border-radius: {borderTopLeft} {borderTopRight} {borderBottomRight} {borderBottomLeft}"
>
  <canvas bind:this={canvas} {id}></canvas>
</div>

<style>
  @import '$lib/styles/chartStyles.css';
</style> 