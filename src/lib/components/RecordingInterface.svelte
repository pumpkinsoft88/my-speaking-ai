<!-- /src/lib/components/RecordingInterface.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { AudioRecorder } from '$lib/recording/recorder.js';
	import { formatTime } from '$lib/utils/timeFormatter.js';
	import WaveformCanvas from './WaveformCanvas.svelte';

	export let onError = null;
	export let onRecordingComplete = null;

	let recorder = null;
	let isRecording = false;
	let recordingTime = 0;
	let audioUrl = '';
	let audioElement = null;
	let isPlaying = false;
	let fileName = 'Voice waveform';
	let analyser = null;
	let dataArray = null;

	onMount(() => {
		recorder = new AudioRecorder();
		recorder.on('timeUpdate', (time) => {
			recordingTime = time;
		});
		recorder.on('recordingComplete', (blob) => {
			if (audioUrl) {
				URL.revokeObjectURL(audioUrl);
			}
			audioUrl = URL.createObjectURL(blob);
			if (onRecordingComplete) {
				onRecordingComplete(blob);
			}
		});
		recorder.on('error', (err) => {
			if (onError) {
				onError(err.message || '녹음 중 오류가 발생했습니다.');
			}
		});
	});

	// 녹음 중일 때 파형 데이터 업데이트
	$: if (isRecording && recorder && recorder.audioContext) {
		analyser = recorder.analyser;
		dataArray = recorder.dataArray;
	} else {
		analyser = null;
		dataArray = null;
	}

	onDestroy(() => {
		if (recorder) {
			recorder.cleanup();
		}
		if (audioUrl) {
			URL.revokeObjectURL(audioUrl);
		}
	});

	async function startRecording() {
		try {
			await recorder.start();
			isRecording = true;
		} catch (err) {
			if (onError) {
				onError(err.message);
			}
		}
	}

	function stopRecording() {
		recorder.stop();
		isRecording = false;
	}

	function playAudio() {
		if (audioElement) {
			audioElement.play();
			isPlaying = true;
		}
	}

	function pauseAudio() {
		if (audioElement) {
			audioElement.pause();
			isPlaying = false;
		}
	}

	function saveAudio() {
		if (audioUrl) {
			const a = document.createElement('a');
			a.href = audioUrl;
			a.download = `${fileName || 'recording'}.webm`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}
	}

	function deleteRecording() {
		if (audioUrl) {
			URL.revokeObjectURL(audioUrl);
			audioUrl = '';
		}
		recordingTime = 0;
		fileName = 'Voice waveform';
		isPlaying = false;
		if (audioElement) {
			audioElement.pause();
			audioElement.currentTime = 0;
		}
	}
</script>

<div class="space-y-6">
	<!-- 상태 표시 -->
	<div class="flex items-center justify-center gap-2">
		<div
			class="h-2.5 w-2.5 rounded-full {isRecording
				? 'animate-pulse bg-emerald-500'
				: audioUrl
					? 'bg-blue-500'
					: 'bg-slate-400'}"
		></div>
		<span class="text-sm font-medium text-slate-600">
			{isRecording ? '녹음 중...' : audioUrl ? '녹음 완료' : '녹음 대기 중'}
		</span>
	</div>

	<!-- 녹음 시간 -->
	{#if isRecording}
		<div class="text-center">
			<div class="text-3xl font-mono font-bold tabular-nums text-slate-800">
				{formatTime(recordingTime)}
			</div>
		</div>
	{/if}

	<!-- 파형 표시 영역 -->
	<div
		class="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-inner"
	>
		<!-- MIC 배지 -->
		<div
			class="absolute left-4 top-4 z-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg"
		>
			MIC
		</div>

		<!-- 상태 점 -->
		<div
			class="absolute right-4 top-4 z-10 h-3 w-3 rounded-full {isRecording
				? 'animate-pulse bg-emerald-400 shadow-lg shadow-emerald-400/50'
				: 'bg-slate-500'}"
		></div>

		<!-- 파형 캔버스 -->
		<WaveformCanvas {analyser} {dataArray} {isRecording} />

		<!-- Wave Form 텍스트 -->
		<div
			class="absolute bottom-4 left-4 z-10 text-sm font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
		>
			Wave Form
		</div>
	</div>

	<!-- 녹음 버튼 -->
	<button
		class="mx-auto flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-red-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-red-500/40 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
		on:click={isRecording ? stopRecording : startRecording}
		aria-label={isRecording ? '녹음 중지' : '녹음 시작'}
	>
		<svg
			class="h-5 w-5"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
			/>
		</svg>
		{isRecording ? '녹음 중지' : '녹음 시작'}
	</button>

	<!-- 재생 컨트롤 -->
	{#if audioUrl}
		<div
			class="mx-auto w-full max-w-xs space-y-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-lg"
		>
			<h3 class="text-center text-sm font-semibold text-slate-700">녹음 재생</h3>
			<audio
				bind:this={audioElement}
				class="w-full"
				controls
				src={audioUrl}
				on:ended={() => (isPlaying = false)}
			></audio>
			<div class="flex gap-3">
				<button
					class="flex-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:scale-105 hover:shadow-lg active:scale-95"
					on:click={saveAudio}
				>
					저장
				</button>
				<button
					class="flex-1 rounded-lg bg-gradient-to-r from-slate-400 to-slate-500 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:scale-105 hover:shadow-lg active:scale-95"
					on:click={deleteRecording}
				>
					삭제
				</button>
			</div>
		</div>
	{/if}
</div>

