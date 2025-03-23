<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { chartColors } from '$lib/constants/chartColors';
  import { theme } from '$lib/stores/theme';

  export let value: number = 0;
  export let baselineValue: number = 0;
  export let id: string;
  export const layerMetrics: {
    direction_changes: number[];
    transform_magnitudes: number[];
    flow_scores: number[];
  } | null = null;
  export let allChunksLayerMetrics: Array<{
    direction_changes: number[];
    transform_magnitudes: number[];
    flow_scores: number[];
  }> = [];

  let chart: Chart | null = null;
  let canvas: HTMLCanvasElement;
  let width: number | undefined;
  let height: number | undefined;
  let gradient: CanvasGradient | undefined;
  let chartInitialized = false;

  $: displayValue = typeof value === 'number' ? value.toFixed(2) : '0.00';

  const getComputedColor = (varName: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  };

  const calculateAverageMetrics = () => {
    if (!allChunksLayerMetrics?.length) return null;

    const numTransitions = allChunksLayerMetrics[0].direction_changes.length;
    
    // Initialize arrays for summing up each layer transition
    const sumDirectionChanges = new Array(numTransitions).fill(0);
    const sumMagnitudes = new Array(numTransitions).fill(0);
    
    
    // Sum up values for each layer transition position
    allChunksLayerMetrics.forEach(chunk => {
      chunk.direction_changes.forEach((value, layerIndex) => {
        sumDirectionChanges[layerIndex] += value;
      });
      chunk.transform_magnitudes.forEach((value, layerIndex) => {
        sumMagnitudes[layerIndex] += value;
      });
    });

    const numChunks = allChunksLayerMetrics.length;
    const averages = {
      direction_changes: sumDirectionChanges.map(sum => sum / numChunks),
      transform_magnitudes: sumMagnitudes.map(sum => sum / numChunks),
      flow_scores: sumDirectionChanges.map((sum, i) => 
        (sum / numChunks) * (sumMagnitudes[i] / numChunks)
      )
    };
    
    return averages;
  };

  const updateChart = () => {
    if (!chart) return;

    try {
      const averageMetrics = calculateAverageMetrics();
      if (!averageMetrics) return;

      const directionData = [...averageMetrics.direction_changes];
      const magnitudeData = [...averageMetrics.transform_magnitudes];
      
      // Calculate the upper and lower bounds based on magnitude
      const upperData = directionData.map((d, i) => d + (magnitudeData[i] || 0) * 0.5);
      const lowerData = directionData.map((d, i) => d - (magnitudeData[i] || 0) * 0.5);
      
      // Update all datasets
      chart.data.datasets[0].data = upperData;
      chart.data.datasets[1].data = directionData;
      chart.data.datasets[2].data = lowerData;
      
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
      
      if (chart.options.scales?.y1) {
        chart.options.scales.y1.grid.color = $theme === 'light' ? 
          `${getComputedColor('--grey-darkest')}60` : 
          `${getComputedColor('--text-color')}10`;
        chart.options.scales.y1.title.color = $theme === 'light' ? 
          `${getComputedColor('--grey-darkest')}cc` : 
          `${getComputedColor('--text-color')}50`;
        chart.options.scales.y1.border.color = $theme === 'light' ? 
          `${getComputedColor('--grey-darkest')}60` : 
          `${getComputedColor('--text-color')}20`;
      }

      // Update tooltip colors
      if (chart.options.plugins?.tooltip) {
        chart.options.plugins.tooltip.backgroundColor = getComputedColor('--inverse-bg-light');
        chart.options.plugins.tooltip.titleColor = getComputedColor('--text-color');
        chart.options.plugins.tooltip.bodyColor = getComputedColor('--text-color');
      }
      
      if (chart.options.plugins?.title) {
        chart.options.plugins.title.text = displayValue;
      }
      
      // Force chart to redraw with new colors
      requestAnimationFrame(() => {
        if (chart) chart.update('none');
      });
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  };

  const hexToRgb = (hex: string) => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
  };

  const lerp = (start: number, end: number, amt: number) => {
    return (1 - amt) * start + amt * end;
  };

  const getColorForValue = (value: number, baseline: number) => {
    const threshold = 0.1; // Adjust this value to control how much difference is considered "similar"
    const diff = value - baseline;
    
    if (Math.abs(diff) < threshold) {
      return getComputedColor('--warning'); // Similar to baseline - yellow
    }
    return diff > 0 ? getComputedColor('--success') : getComputedColor('--error'); // Green for higher, red for lower
  };

  const getGradient = (ctx: CanvasRenderingContext2D, chartArea: any, data: (number | null)[]) => {
    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;
    
    if (!gradient || width !== chartWidth || height !== chartHeight) {
      width = chartWidth;
      height = chartHeight;
      gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
      
      // Create gradient stops based on data points
      if (data && data.length > 0) {
        data.forEach((value, index) => {
          if (value !== null) {
            const position = index / (data.length - 1);
            const color = getColorForValue(value, baselineValue);
            // Ensure we have a valid color before adding the stop
            if (color) {
              gradient?.addColorStop(position, color);
            }
          }
        });
      } else {
        // Fallback gradient using theme colors
        gradient.addColorStop(0, getComputedColor('--error'));    // Red
        gradient.addColorStop(0.5, getComputedColor('--warning')); // Yellow
        gradient.addColorStop(1, getComputedColor('--success'));   // Green
      }
    }
    
    return gradient;
  };

  onMount(() => {
    canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    const white = getComputedColor('--white');
    const greenLight = getComputedColor('--green-light');
    const redLight = getComputedColor('--red-light');

    try {
      chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: Array(11).fill(0).map((_, i) => `${i + 1} → ${i + 2}`),
          datasets: [
            {
              label: 'Flow Magnitude Upper',
              data: [],
              fill: '+1',
              backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return 'rgba(255,255,255,0.1)';
                
                const currentData = chart.data.datasets[1].data;
                const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
                
                if (currentData && currentData.length > 0) {
                  currentData.forEach((value, index) => {
                    if (value !== null && typeof value === 'number') {
                      const position = index / (currentData.length - 1);
                      const color = getColorForValue(value, baselineValue);
                      if (color) {
                        const { r, g, b } = hexToRgb(color);
                        gradient.addColorStop(position, `rgba(${r},${g},${b},0.1)`);
                      }
                    }
                  });
                } else {
                  // Fallback gradient
                  gradient.addColorStop(0, 'rgba(255,71,71,0.1)');  // Red with opacity
                  gradient.addColorStop(0.5, 'rgba(255,204,69,0.1)'); // Yellow with opacity
                  gradient.addColorStop(1, 'rgba(170,255,0,0.1)');   // Green with opacity
                }
                
                return gradient;
              },
              borderWidth: 0,
              pointRadius: 0,
              tension: 0.4,
              yAxisID: 'y1'
            },
            {
              label: 'Flow Direction',
              data: [],
              fill: false,
              borderColor: function(context) {
                const chart = context.chart;
                const {ctx, chartArea} = chart;
                
                if (!chartArea) {
                  return getComputedColor('--white');
                }
                
                const currentData = chart.data.datasets[1].data.map(val => typeof val === 'number' ? val : null);
                return getGradient(ctx, chartArea, currentData);
              },
              borderWidth: 3,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 4,
              pointBackgroundColor: function(context) {
                const value = context.raw;
                if (value === undefined || value === null) return 'transparent';
                return getColorForValue(Number(value), baselineValue);
              },
              pointBorderColor: 'transparent',
              pointHoverBackgroundColor: function(context) {
                const value = context.raw;
                if (value === undefined || value === null) return 'transparent';
                return getColorForValue(Number(value), baselineValue);
              },
              pointHoverBorderColor: 'transparent',
              pointStyle: 'circle',
              pointBorderWidth: 1,
              pointHoverBorderWidth: 1,
              yAxisID: 'y1'
            },
            {
              label: 'Flow Magnitude Lower',
              data: [],
              fill: '-1',
              backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return 'rgba(255,255,255,0.1)';
                
                const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                gradient.addColorStop(0, 'rgba(255,0,0,0.1)');    // Red with low opacity
                gradient.addColorStop(0.5, 'rgba(255,255,255,0.1)'); // White with low opacity
                gradient.addColorStop(1, 'rgba(0,255,0,0.1)');    // Green with low opacity
                return gradient;
              },
              borderWidth: 0,
              pointRadius: 0,
              tension: 0.4,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
          layout: {
            padding: {
              top: 48,
              left: 8,
              right: 8,
              bottom: 8
            }
          },
          scales: {
            x: {
              display: true,
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
                text: 'Model Layers',
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
            y1: {
              position: 'right',
              beginAtZero: false,
              min: -1,
              max: 1,
              display: true,
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
                text: 'Information Flow',
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
            legend: {
              display: false
            },
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
                title: () => '',
                label: (context) => {
                  if (context.datasetIndex !== 1) return '';
                  const layerIndex = context.dataIndex;
                  const averageMetrics = calculateAverageMetrics();
                  if (!averageMetrics) return '';
                  
                  return [
                    `Direction Change: ${averageMetrics.direction_changes[layerIndex].toFixed(3)}`,
                    `Magnitude: ${averageMetrics.transform_magnitudes[layerIndex].toFixed(3)}`
                  ];
                }
              }
            }
          }
        }
      });

      // Only populate with data if we have it
      if (allChunksLayerMetrics?.length) {
        updateChart();
      }
      
      chartInitialized = true;
      console.log(`InformationFlowChart [${id}] - Chart initialized`);
    } catch (error) {
      console.error('Error creating chart:', error);
    }

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  });

  // Add tracking of previous values to prevent unnecessary updates
  let prevValue = value;
  let prevBaselineValue = baselineValue;
  let prevLayerMetricsLength = allChunksLayerMetrics ? allChunksLayerMetrics.length : 0;
  
  // Only update the chart when values actually change
  $: if (chart && chartInitialized && 
         (value !== prevValue || 
          baselineValue !== prevBaselineValue || 
          (allChunksLayerMetrics && allChunksLayerMetrics.length !== prevLayerMetricsLength))) {
    console.log(`InformationFlowChart [${id}] - Values changed, updating chart`);
    prevValue = value;
    prevBaselineValue = baselineValue;
    prevLayerMetricsLength = allChunksLayerMetrics ? allChunksLayerMetrics.length : 0;
    updateChart();
  }

  // Subscribe to theme changes
  $: if ($theme && chart) {
    console.log(`Theme changed to ${$theme}, updating chart colors`);
    updateChart();
  }
</script>

<div class="chart-wrapper">
  <canvas {id}></canvas>
</div>

<style>
  @import '$lib/styles/chartStyles.css';
</style> 