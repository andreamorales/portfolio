<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import Chart from 'chart.js/auto';
  import { HelpCircle } from 'lucide-svelte';
  import MetricCard from '$lib/components/ui/layout/MetricCard.svelte';

  export let grades: Array<{fileName: string, score: number}> = [];

  let chart: Chart | null = null;
  let canvas: HTMLCanvasElement;
  
  // Create event dispatcher to notify parent components when a point is clicked
  const dispatch = createEventDispatcher();

  function getLetterGrade(score: number): string {
    const percentage = score * 100;
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  function getComputedColor(variable: string): string {
    if (typeof window !== 'undefined') {
      const style = getComputedStyle(document.documentElement);
      return style.getPropertyValue(variable.replace('var(', '').replace(')', '')).trim();
    }
    return '#ffffff';
  }

  function getScoreColor(score: number): string {
    const percentage = score * 100;
    if (percentage >= 90) return getComputedColor('--success');
    if (percentage >= 80) return getComputedColor('--info');
    if (percentage >= 70) return getComputedColor('--warning');
    if (percentage >= 60) return getComputedColor('--caution');
    return getComputedColor('--error');
  }
  
  // Handle click events on chart points
  function handleChartClick(event: MouseEvent) {
    if (!chart) return;
    
    const points = chart.getElementsAtEventForMode(
      event,
      'nearest',
      { intersect: true },
      false
    );
    
    if (points.length) {
      const firstPoint = points[0];
      const dataIndex = firstPoint.index;
      const fileName = grades[dataIndex].fileName;
      
      console.log('Chart point clicked:', { fileName, dataIndex });
      
      // Dispatch an event with the selected file name
      dispatch('fileSelect', { fileName });
    }
  }

  function createChart() {
    if (!canvas) return;
    
    // Destroy existing chart if any
    if (chart) {
      chart.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const textColor = getComputedColor('--text-color');
    const bgColor = getComputedColor('--bg-color');

    // Create new chart
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: grades.map(g => g.fileName),
        datasets: [{
          data: grades.map(g => g.score * 100),
          borderColor: textColor,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          tension: 0.4,
          fill: false,
          pointBackgroundColor: grades.map(g => `${getScoreColor(g.score)}80`),
          pointBorderColor: grades.map(g => `${getScoreColor(g.score)}cc`),
          pointBorderWidth: 1,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: grades.map(g => `${getScoreColor(g.score)}cc`),
          pointHoverBorderColor: grades.map(g => `${getScoreColor(g.score)}cc`),
          pointStyle: 'circle',
          pointHoverBorderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        hover: {
          mode: 'nearest',
          intersect: false
        },
        onClick: (event, elements, chart) => {
          // This is handled by our custom click handler
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: getComputedColor('--inverse-bg-light'),
            titleColor: getComputedColor('--text-color'),
            bodyColor: getComputedColor('--text-color'),
            padding: 6,
            cornerRadius: 6,
            displayColors: false,
            yAlign: 'bottom',
            titleFont: {
              family: 'Recursive Variable',
              weight: 'bold',
              size: 10
            },
            bodyFont: {
              family: 'Recursive Variable',
              size: 10
            },
            callbacks: {
              title: (context) => {
                const fileName = grades[context[0].dataIndex].fileName;
                return fileName;
              },
              label: (context) => {
                const score = context.parsed.y / 100;
                return `Grade: ${getLetterGrade(score)}`;
              }
            },
            titleMarginBottom: 4,
            boxWidth: 35,
            boxPadding: 3
          }
        },
        scales: {
          y: {
            display: false,
            beginAtZero: true,
            max: 100,
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              callback: function(tickValue: string | number) {
                const value = Number(tickValue);
                if (!isNaN(value) && value < 70) {
                  return value * 0.15; // More extreme compression for failing grades
                }
                return tickValue;
              }
            },
            afterFit: function(scaleInstance: any) {
              const originalGetPixel = scaleInstance.getPixelForValue.bind(scaleInstance);
              scaleInstance.getPixelForValue = function(value: number) {
                if (typeof value === 'number' && value < 70) {
                  // More extreme compression for failing grades (15% of space)
                  return this.bottom - ((value / 70) * (this.bottom - this.top) * 0.15);
                } else {
                  // Expand passing grades to use 85% of space
                  const passingRange = this.bottom - this.top;
                  const passingValue = (typeof value === 'number' ? value : 0) - 70;
                  return this.bottom - (passingRange * 0.15) - (passingValue / 30 * passingRange * 0.85);
                }
              };
            }
          },
          x: {
            display: false,
            grid: {
              display: false
            }
          }
        },
        layout: {
          padding: {
            top: 20,
            bottom: 20
          }
        }
      },
      plugins: [{
        id: 'horizontalLine',
        beforeDraw: (chart) => {
          const ctx = chart.ctx;
          const yAxis = chart.scales.y;
          const xAxis = chart.scales.x;
          const y = yAxis.getPixelForValue(70);
          
          // Draw the line with text color at 20% opacity
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(xAxis.left, y);
          ctx.lineTo(xAxis.right, y);
          ctx.lineWidth = 1;
          ctx.strokeStyle = textColor;
          ctx.globalAlpha = 0.2;
          ctx.stroke();
          ctx.restore();
        }
      }]
    });
  }

  // Update chart when grades change
  $: {
    console.log('Grades updated:', grades);
    if (canvas && grades.length > 0) {
      createChart();
    }
  }

  onMount(() => {
    if (grades.length > 0) {
      createChart();
    }
  });

  onDestroy(() => {
    if (chart) chart.destroy();
  });
</script>

<div class="chart-container">
  <canvas bind:this={canvas} on:click={handleChartClick}></canvas>
</div>

<style>
  .chart-container {
    width: 100%;
    flex: 1;
    position: relative;
    padding: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  canvas {
    width: 100% !important;
    height: 100% !important;
    flex: 1;
    cursor: pointer;
  }
</style> 