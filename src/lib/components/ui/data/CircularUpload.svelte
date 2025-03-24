<script lang="ts">
  import { FileUp } from 'svelte-lucide';
  import { CustomSelect } from '$lib/components/ui/input';
  
  export let contentType: string | null = null;
  export let contentTypes: Array<{value: string, label: string}> = [];
  export let hideTypeSelect = false;
  export let supportedTypesText = '';
  export let onFileSelect: (event: Event) => Promise<any>;
  export let score = 0;
  export let gradeLetter = '';
  export let processedCount = 0;
  export let totalFiles = 0;
  export let progressColor: string = 'var(--interactive-color)';
  export let disabled = false;
  export let isComplete = false;
  
  let fileInput: HTMLInputElement;
  let files: File[] = [];
  let progress = 0;
  let isUploading = false;
  let currentStage = '';
  let noveltyScore: number | null = null;
  let isAnimating = false;
  let fileName: string = '';
  let currentFileIndex = 0;
  let currentFile: string = '';
  const rewindDuration = 300;

  let backendURL = import.meta.env.VITE_PYTHON_BACKEND_URL || 'http://localhost';
  let backendPort = import.meta.env.VITE_PYTHON_BACKEND_PORT || 8000;
  let backend = `${backendURL}:${backendPort}`;

  function handleClick() {
    if (!isUploading && noveltyScore === null) {
      fileInput.click();
    }
  }

  function getLetterGrade(score: number): string {
    const percentage = score * 100;
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  function getScoreColor(score: number): string {
    const percentage = score * 100;
    if (percentage >= 90) return 'var(--success)';
    if (percentage >= 80) return 'var(--info)';
    if (percentage >= 70) return 'var(--warning)';
    if (percentage >= 60) return 'var(--caution)';
    return 'var(--error)';
  }

  async function handleFileSelect(event: Event) {
    const inputFiles = (event.target as HTMLInputElement).files;
    if (!inputFiles?.length) return;
    
    // Only check contentType if hideTypeSelect is false
    if (!hideTypeSelect && !contentType) {
      alert("Please select a document type first.");
      return;
    }
    
    files = Array.from(inputFiles);
    isUploading = true;
    progress = 0;
    noveltyScore = null;
    currentFileIndex = 0;
    
    try {
        const eventSource = new EventSource(`${backend}/api/progress`);
        
        eventSource.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            
            if (data.score === null || data.score === undefined) {
                if (!isAnimating) {
                    // Handle new file detection
                    if (data.stage?.includes('Opening ')) {
                        const newFileName = data.stage.split('Opening ')[1].split('...')[0];
                        currentFile = newFileName;
                        currentFileIndex = files.findIndex(f => f.name === newFileName);
                        progress = 0;
                    }

                    // Always update progress and stage text
                    const newProgress = Number(data.progress?.toFixed(1) || 0);
                    progress = newProgress;
                    currentStage = data.stage || 'Processing...';
                }
            } else {
                // File complete
                noveltyScore = data.score;
                isAnimating = true;
                
                // Do rewind animation
                const startTime = performance.now();
                const startProgress = progress;
                
                function animate(currentTime: number) {
                    const elapsed = currentTime - startTime;
                    const remaining = Math.max(0, startProgress * (1 - elapsed / rewindDuration));
                    progress = remaining;
                    
                    if (elapsed < rewindDuration) {
                        requestAnimationFrame(animate);
                    } else {
                        // Reset for next file
                        progress = 0;
                        isAnimating = false;
                        currentFileIndex++;
                        
                        if (currentFileIndex < files.length) {
                            currentFile = files[currentFileIndex].name;
                            // Reset to initial stage
                            progress = 2;
                            currentStage = 'Starting up...';
                            
                            // Simulate the initial stages for each file
                            setTimeout(() => {
                                progress = 5;
                                currentStage = 'Loading analysis tools...';
                                setTimeout(() => {
                                    progress = 10;
                                    currentStage = 'Preparing document analysis...';
                                    setTimeout(() => {
                                        progress = 20;
                                        currentStage = 'Opening...';
                                    }, 300);
                                }, 300);
                            }, 300);
                        } else {
                            eventSource.close();
                            isUploading = false;
                            progress = score * 100;
                        }
                    }
                }
                
                requestAnimationFrame(animate);
            }
        };

        await onFileSelect(event);
        
    } catch (error) {
        console.error('Upload error:', error);
    }
  }

  $: dashOffset = 216 - (progress / 100) * 216;

  $: {
    if (score > 0 && !isUploading && !isAnimating) {
        progress = score * 100;
        noveltyScore = score;
    }
  }

  // Add this function to reset the component state
  export function reset() {
    progress = 0;
    isUploading = false;
    currentStage = '';
    noveltyScore = null;
    isAnimating = false;
    fileName = '';
  }
</script>

<div class="circular-container">
  <button 
    class="upload-circle" 
    class:uploading={isUploading}
    class:has-score={score > 0 && !isUploading}
    class:disabled={disabled}
    on:click={handleClick}
    on:keydown={(e) => e.key === 'Enter' && handleClick()}
    aria-label="Upload files"
    disabled={disabled}
  >
    <svg class="gauge-track" viewBox="0 0 100 100">
      <defs>
        <filter id="inset-shadow">
          <!-- Deepest inner shadow -->
          <feFlood flood-color="black" flood-opacity="0.95"/>
          <feComposite operator="out" in2="SourceGraphic"/>
          <feGaussianBlur stdDeviation="6"/>
          <feComposite operator="atop" in2="SourceGraphic"/>
          
          <!-- Medium depth shadow -->
          <feFlood flood-color="black" flood-opacity="0.8"/>
          <feComposite operator="out" in2="SourceGraphic"/>
          <feGaussianBlur stdDeviation="3"/>
          <feComposite operator="atop" in2="SourceGraphic"/>
          
          <!-- Sharp edge shadow -->
          <feFlood flood-color="black" flood-opacity="0.9"/>
          <feComposite operator="out" in2="SourceGraphic"/>
          <feGaussianBlur stdDeviation="0.5"/>
          <feComposite operator="atop" in2="SourceGraphic"/>
        </filter>
      </defs>
      <!-- Background track -->
      <circle 
        class="track"
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="rgba(0, 0, 0, 0.08)"
        stroke-width="8"
        stroke-linecap="round"
        stroke-dasharray="216 320"
        stroke-dashoffset="0"
        transform="rotate(115 50 50)"
        filter="url(#inset-shadow)"
      />
      <!-- Progress track -->
      {#if isUploading || noveltyScore !== null}
        <circle 
          class="progress-track"
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={isComplete ? getScoreColor(score) : 'var(--interactive-color)'}
          stroke-width="6"
          stroke-linecap="round"
          stroke-dasharray="216 320"
          stroke-dashoffset={dashOffset}
          transform="rotate(115 50 50)"
        />
      {/if}
    </svg>
    {#if !isUploading && noveltyScore === null && !isComplete}
      <div class="content">
        <FileUp size={48} strokeWidth={0.5} class="upload-icon" />
        {#if hideTypeSelect}
          <p class="supported-types-text">{supportedTypesText}</p>
        {:else}
          <CustomSelect 
            bind:value={contentType} 
            options={contentTypes} 
            size="small"
            placeholder="Select document type..."
            style="width: 180px;"
          />
        {/if}
      </div>
    {:else if isUploading}
      <div class="inner">
        <div class="stage-text">{currentStage}</div>
        {#if processedCount > 0 && totalFiles > 0}
          <div class="progress-info">
            <span class="processed-count">{processedCount}</span> of <span class="total-files">{totalFiles}</span>
          </div>
        {/if}
      </div>
    {:else}
      <div class="inner">
        <div class="grade">{gradeLetter}</div>
        {#if processedCount > 0 && totalFiles > 0}
          <div class="progress-info">
            <span class="processed-count">{processedCount}</span> of <span class="total-files">{totalFiles}</span>
          </div>
        {/if}
      </div>
    {/if}
    <input
      type="file"
      accept=".txt,.pdf,.html,.doc,.docx"
      bind:this={fileInput}
      on:change={handleFileSelect}
      style="display: none;"
      multiple
      disabled={isUploading || noveltyScore !== null}
    />
  </button>
  
  {#if isUploading && files[currentFileIndex]}
    <div class="file-info">
      <div class="file-name" title={files[currentFileIndex].name}>
        {files[currentFileIndex].name.length > 35 
          ? files[currentFileIndex].name.slice(0, 35) + '...' 
          : files[currentFileIndex].name}
      </div>
      <div class="file-count">
        {currentFileIndex + 1} of {files.length}
      </div>
    </div>
  {/if}
</div>

<style>
  .circular-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    gap: 1rem;
    flex: 1;
  }

  .upload-circle {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
  }

  .upload-circle.disabled {
    cursor: default;
  }

  .gauge-track {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
  }

  .track {
    opacity: 1;
    border: none;
    box-shadow: none;
    transition: opacity 0.2s ease-in-out;
  }

  .progress-track {
    transition: stroke-dashoffset 0.1s ease-in-out, stroke 0.3s ease-in-out;
  }

  .inner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .stage-text {
    font-size: 0.8rem;
    opacity: 0.8;
    text-align: center;
    max-width: 150px;
    font-family: var(--font-family);
    white-space: pre-line;
    line-height: 1.2;
    margin-bottom: 0.5rem;
  }

  .progress-info {
    font-size: 0.7rem;
    opacity: 0.7;
    text-align: center;
    font-family: var(--font-family);
  }

  .processed-count, .total-files {
    font-weight: 600;
  }

  .grade {
    font-size: 4rem;
    font-weight: bold;
    line-height: 1;
    margin-bottom: 0.5rem;
    font-family: var(--font-family-display);
  }

  .content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 80%;
    padding: 15px;
  }

  /* Add pointer cursor specifically for the upload icon and select */
  :global(.upload-icon),
  :global(select) {
    cursor: pointer;
  }

  .upload-circle.disabled :global(.upload-icon),
  .upload-circle.disabled :global(select) {
    opacity: 0.5;
    pointer-events: none;
    cursor: default;  /* Reset to default cursor when disabled */
  }

  .file-info {
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    width: 100%;
  }

  .file-name {
    font-size: 12px;
    color: var(--text-color);
    opacity: 0.8;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-count {
    font-size: 11px;
    color: var(--text-color);
    opacity: 0.6;
  }

  .placeholder-text {
    font-size: 0.9rem;
    color: var(--text-color);
    opacity: 0.7;
    text-align: center;
    margin-bottom: 8px;
  }

  .supported-types-text {
    font-size: 0.875rem;
    color: var(--text-color);
    opacity: 0.8;
    text-align: center;
  }
</style> 
