<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { chartColors } from '$lib/constants/chartColors';
  import { browser } from '$app/environment';
  import { theme } from '$lib/stores/theme';

  export let value: number = 0;
  export let baselineValue: number = 0;
  export let id: string;
  export let chunkScores: Array<{
    score: number;
    position: number;
    text: string;
  }> = [];

  let chart: Chart | null = null;
  let canvas: HTMLCanvasElement;
  let hoveredIndex = -1;

  $: displayValue = Math.abs(value).toFixed(4);

  const getComputedColor = (varName: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName.replace('var(', '').replace(')', '')).trim();
  };

  const getLineColor = (score: number) => {
    const difference = score - baselineValue;
    const threshold = Math.abs(baselineValue * 0.05);
    
    // Get base colors from chart colors, using darker variants in light mode
    let color;
    if (difference < threshold) {
      color = getComputedColor($theme === 'light' ? '--yellow-darker' : chartColors.predictionEntropy.current.warning);
    } else if (difference > threshold) {
      color = getComputedColor($theme === 'light' ? '--green-darker' : chartColors.predictionEntropy.current.success);
    } else {
      color = getComputedColor($theme === 'light' ? '--red-darker' : chartColors.predictionEntropy.current.error);
    }
    return color;
  };

  // Update point background color opacity based on theme
  const getPointBackgroundColor = (score: number) => {
    const baseColor = getLineColor(score);
    // Add opacity to hex color
    if (baseColor.startsWith('#')) {
      return $theme === 'light' ? `${baseColor}dd` : `${baseColor}80`; // dd = 87% opacity in light mode
    }
    return baseColor;
  };

  // Add function to get hover color
  const getHoverColor = (score: number) => {
    const baseColor = getLineColor(score);
    // Add opacity to hex color
    if (baseColor.startsWith('#')) {
      return $theme === 'light' ? baseColor : `${baseColor}cc`; // Full color in light mode
    }
    return baseColor;
  };

  function handleMouseLeave() {
    hoveredIndex = -1;
    if (chart) chart.draw();
  }

  function updateChart() {
    if (!chart) return;
    
    const dataPoints = chunkScores.length ? 
      [...chunkScores].sort((a, b) => a.position - b.position) : 
      [];
    
    // Log detailed information about the chunk scores
    console.log(`[AttentionPatternChart ${id}] Baseline value: ${baselineValue.toFixed(4)}`);
    console.log(`[AttentionPatternChart ${id}] Chunk scores:`, dataPoints.map(chunk => ({
      text: chunk.text.substring(0, 20) + (chunk.text.length > 20 ? '...' : ''),
      score: chunk.score.toFixed(4),
      difference: (chunk.score - baselineValue).toFixed(4),
      percentDiff: (((chunk.score - baselineValue) / baselineValue) * 100).toFixed(1) + '%',
      color: chunk.score > baselineValue * 1.05 ? 'green' : 
             chunk.score < baselineValue * 0.95 ? 'red' : 'yellow'
    })));
    
    chart.data.labels = Array(dataPoints.length).fill('');
    chart.data.datasets[0].data = dataPoints.map(chunk => chunk.score);
    chart.data.datasets[0].backgroundColor = dataPoints.map(chunk => getPointBackgroundColor(chunk.score));
    chart.data.datasets[0].hoverBackgroundColor = dataPoints.map(chunk => getHoverColor(chunk.score));
    chart.data.datasets[0].hoverBorderColor = dataPoints.map(chunk => getHoverColor(chunk.score));
    
    if (chart.options.plugins?.title) {
      chart.options.plugins.title.text = displayValue;
    }
    
    chart.update('none');
  }

  // $: {
  //   console.log('AttentionPattern data changed:', {
  //     hasChart: !!chart,
  //     chunkScoresLength: chunkScores.length,
  //     value,
  //     baselineValue
  //   });
  // }

  function initChart() {
    console.log('Initializing chart...');
    if (!browser) return;
    
    if (!canvas) {
      canvas = document.getElementById(id) as HTMLCanvasElement;
    }
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    if (chart) {
      chart.destroy();
    }

    // Create chart with empty data initially
    chart = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: [],
        datasets: [{
          data: [],
          fill: false,
          borderColor: getComputedColor($theme === 'light' ? '--grey-darkest' : '--interactive-color'),
          borderWidth: 0,
          pointRadius: 4,
          pointHoverRadius: 4,
          pointBackgroundColor: (context) => {
            const score = chunkScores[context.dataIndex]?.score || 0;
            return getPointBackgroundColor(score);
          },
          pointBorderColor: 'transparent',
          pointHoverBackgroundColor: (context) => {
            const score = chunkScores[context.dataIndex]?.score || 0;
            return getHoverColor(score);
          },
          pointHoverBorderColor: 'transparent',
          pointStyle: 'circle',
          pointBorderWidth: 1,
          pointHoverBorderWidth: 1,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        hover: {
          mode: 'nearest',
          intersect: false
        },
        onHover: (event, elements) => {
          if (elements && elements.length > 0) {
            hoveredIndex = elements[0].index;
          } else {
            hoveredIndex = -1;
          }
          if (chart) chart.draw();
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
          r: {
            display: false
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
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
                const chunk = chunkScores[context.dataIndex];
                const score = chunk.score || 0;
                const difference = score - baselineValue;
                const threshold = Math.abs(baselineValue * 0.05);
                
                // Debug log for tooltip
                console.log(`[AttentionPatternChart ${id}] Tooltip for index ${context.dataIndex}:`);
                console.log(`  Text: "${chunk.text.substring(0, 20)}..."`);
                console.log(`  Score: ${score.toFixed(4)}`);
                console.log(`  Baseline: ${baselineValue.toFixed(4)}`);
                console.log(`  Difference: ${difference.toFixed(4)}`);
                console.log(`  Threshold: ${threshold.toFixed(4)}`);
                
                let relationship = '';
                if (difference > threshold) {
                  relationship = `${((difference/baselineValue)*100).toFixed(0)}% above baseline`;
                } else if (difference < -threshold) {
                  relationship = `${(Math.abs(difference)/baselineValue*100).toFixed(0)}% below baseline`;
                } else {
                  relationship = 'Near baseline';
                }
                
                console.log(`  Relationship: ${relationship}`);
                
                return [
                  'Model is making connections with:',
                  `"${chunk.text}"`,
                  `Value: ${score.toFixed(4)} (${relationship})`
                ];
              }
            }
          }
        }
      },
      plugins: [{
        id: 'customLines',
        beforeDraw: (chart: any) => {
          if (!chunkScores.length) return;
          
          const ctx = chart.ctx;
          const centerX = chart.scales.r.xCenter as number;
          const centerY = chart.scales.r.yCenter as number;
          const meta = chart.getDatasetMeta(0);
          
          // Draw a single baseline circle instead of three concentric circles
          const baselineRadius = Math.min(chart.width, chart.height) * 0.25; // Radius for baseline circle
          
          // Draw the baseline circle with theme-aware color
          ctx.beginPath();
          ctx.arc(centerX, centerY, baselineRadius, 0, Math.PI * 2);
          ctx.strokeStyle = $theme === 'light' ? 
            `${getComputedColor('--grey-darkest')}60` : 
            'rgba(150, 150, 150, 0.2)';
          ctx.lineWidth = 0.75;
          ctx.setLineDash([2, 2]); // Add dotted line pattern
          ctx.stroke();
          ctx.setLineDash([]); // Reset line dash pattern for other drawings
          
          // Add baseline label with theme-aware color
          ctx.save();
          ctx.font = '10px Recursive Variable';
          ctx.fillStyle = $theme === 'light' ? 
            `${getComputedColor('--grey-darkest')}cc` : 
            'rgba(150, 150, 150, 0.6)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Position the label at the bottom of the circle
          const labelX = centerX;
          const labelY = centerY + baselineRadius + 15;
          
          ctx.fillText(`Baseline (${baselineValue.toFixed(4)})`, labelX, labelY);
          ctx.restore();
          
          // Draw color legend
          const legendX = chart.width - 90;
          const legendY = chart.height - 65;
          const legendWidth = 85;
          const legendHeight = 55;
          const legendPadding = 5;
          const itemHeight = 13;
          
          // Draw legend background with theme-aware color
          ctx.save();
          ctx.fillStyle = 'transparent'; // Remove grey background
          ctx.strokeStyle = 'transparent'; // Remove border
          ctx.lineWidth = 1;
          
          // Draw rounded rectangle (compatible with all browsers)
          const radius = 4;
          ctx.beginPath();
          ctx.moveTo(legendX + radius, legendY);
          ctx.lineTo(legendX + legendWidth - radius, legendY);
          ctx.quadraticCurveTo(legendX + legendWidth, legendY, legendX + legendWidth, legendY + radius);
          ctx.lineTo(legendX + legendWidth, legendY + legendHeight - radius);
          ctx.quadraticCurveTo(legendX + legendWidth, legendY + legendHeight, legendX + legendWidth - radius, legendY + legendHeight);
          ctx.lineTo(legendX + radius, legendY + legendHeight);
          ctx.quadraticCurveTo(legendX, legendY + legendHeight, legendX, legendY + legendHeight - radius);
          ctx.lineTo(legendX, legendY + radius);
          ctx.quadraticCurveTo(legendX, legendY, legendX + radius, legendY);
          ctx.closePath();
          
          ctx.fill();
          
          // Draw legend title with theme-aware color
          ctx.font = 'bold 10px Recursive Variable';
          ctx.fillStyle = $theme === 'light' ? 
            `${getComputedColor('--grey-darkest')}cc` : 
            'rgba(150, 150, 150, 0.7)';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText('Attention Level', legendX + legendPadding, legendY + legendPadding);
          
          // Draw legend items
          const colors = [
            { color: getComputedColor($theme === 'light' ? '--green-darker' : chartColors.predictionEntropy.current.success), label: 'Above baseline' },
            { color: getComputedColor($theme === 'light' ? '--yellow-darker' : chartColors.predictionEntropy.current.warning), label: 'Near baseline' },
            { color: getComputedColor($theme === 'light' ? '--red-darker' : chartColors.predictionEntropy.current.error), label: 'Below baseline' }
          ];
          
          colors.forEach((item, i) => {
            const itemY = legendY + legendPadding + 15 + (i * itemHeight);
            
            // Draw color box
            ctx.fillStyle = item.color;
            ctx.fillRect(legendX + legendPadding, itemY, 10, 8);
            
            // Draw label with theme-aware color
            ctx.font = '9px Recursive Variable';
            ctx.fillStyle = $theme === 'light' ? 
              `${getComputedColor('--grey-darkest')}cc` : 
              'rgba(150, 150, 150, 0.7)';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.label, legendX + legendPadding + 15, itemY + 4);
          });
          
          ctx.restore();
          
          // Draw the connection lines and add values at the tips
          meta.data.forEach((point: any, index: number) => {
            const score = chunkScores[index]?.score || 0;
            const text = chunkScores[index]?.text || '';
            
            // Debug log for each line
            if (index === 0) {
              console.log(`[AttentionPatternChart ${id}] Drawing lines with values:`);
            }
            console.log(`  Line ${index}: score=${score.toFixed(4)}, text="${text.substring(0, 15)}..."`);
            
            // Draw the line
            ctx.beginPath();
            ctx.strokeStyle = getLineColor(score);
            ctx.globalAlpha = hoveredIndex === -1 ? 1 : (hoveredIndex === index ? 1 : 0.2);
            ctx.lineWidth = 1.5;
            
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          });
          
          ctx.globalAlpha = 1;
        }
      }]
    });

    // Only populate with data if we have it
    if (chunkScores.length) {
      updateChart();
    }
    console.log('Chart initialized');
  }

  // Update reactive statement to only run in browser
  let prevValue = value;
  let prevChunkScoresLength = chunkScores.length;
  
  $: if (browser && !chart) {
    console.log(`AttentionPatternChart [${id}] - Initializing new chart`);
    initChart();
  } else if (chart && browser && (value !== prevValue || chunkScores.length !== prevChunkScoresLength)) {
    console.log(`AttentionPatternChart [${id}] - Value or chunks changed, updating chart:`, {
      oldValue: prevValue,
      newValue: value,
      oldChunksLength: prevChunkScoresLength,
      newChunksLength: chunkScores.length
    });
    prevValue = value;
    prevChunkScoresLength = chunkScores.length;
    requestAnimationFrame(() => updateChart());
  }

  // Only run onMount in browser
  onMount(() => {
    if (!browser) return;
    console.log(`AttentionPatternChart [${id}] - Component mounted`);
    
    // Force chart recreation
    if (chart) {
      chart.destroy();
      chart = null;
    }
    
    initChart();
  });

  // Add a function to validate the values displayed at the tips
  function validateDisplayedValues() {
    if (!chart || !chunkScores.length) return;
    
    console.log(`[AttentionPatternChart ${id}] Validating displayed values:`);
    console.log(`[AttentionPatternChart ${id}] Average value: ${value.toFixed(4)}`);
    console.log(`[AttentionPatternChart ${id}] Baseline value: ${baselineValue.toFixed(4)}`);
    
    // Calculate threshold
    const threshold = baselineValue * 0.05;
    console.log(`[AttentionPatternChart ${id}] Threshold (5% of baseline): ${threshold.toFixed(4)}`);
    
    // Log color thresholds
    console.log(`[AttentionPatternChart ${id}] Color thresholds:`);
    console.log(`  Green: > ${(baselineValue + threshold).toFixed(4)}`);
    console.log(`  Yellow: ${(baselineValue - threshold).toFixed(4)} to ${(baselineValue + threshold).toFixed(4)}`);
    console.log(`  Red: < ${(baselineValue - threshold).toFixed(4)}`);
  }

  // Call validation after chart is initialized
  $: if (chart && chunkScores.length) {
    validateDisplayedValues();
  }

  // Subscribe to theme changes
  $: if ($theme && chart) {
    console.log(`Theme changed to ${$theme}, updating chart colors`);
    updateChart();
  }
</script>

<div class="chart-wrapper" on:mouseleave={handleMouseLeave} role="img" aria-label="Attention Pattern Chart">
  <canvas {id}></canvas>
</div>

<style>
  @import '$lib/styles/chartStyles.css';
  
  .attention-pattern-gradient {
    bottom: 0;
    right: 0;
    width: 35px;
    height: 35px;
    background: linear-gradient(
      to left,
      var(--inverse-bg) 25%,
      transparent 100%
    );
  }
</style> 
