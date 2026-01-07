<!-- /src/lib/components/WaveformCanvas.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';

	let { 
		analyser = null,
		dataArray = null,
		isRecording = false
	} = $props();

	let canvas = null;
	let canvasContext = null;
	let animationFrame = null;

	const drawWaveform = () => {
		if (!canvas || !canvasContext) return;

		const rect = canvas.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;

		// 세련된 그라데이션 배경
		const gradient = canvasContext.createLinearGradient(0, 0, 0, height);
		gradient.addColorStop(0, '#0f172a');
		gradient.addColorStop(1, '#1e293b');
		canvasContext.fillStyle = gradient;
		canvasContext.fillRect(0, 0, width, height);

		// 녹음 중일 때만 파형 그리기
		if (isRecording && analyser && dataArray) {
			analyser.getByteTimeDomainData(dataArray);

			// 세련된 그라데이션 파형
			const waveGradient = canvasContext.createLinearGradient(0, 0, width, 0);
			waveGradient.addColorStop(0, '#34d399');
			waveGradient.addColorStop(0.5, '#10b981');
			waveGradient.addColorStop(1, '#059669');

			canvasContext.strokeStyle = waveGradient;
			canvasContext.lineWidth = 2.5;
			canvasContext.setLineDash([]);
			canvasContext.shadowColor = '#10b981';
			canvasContext.shadowBlur = 15;

			canvasContext.beginPath();
			const centerY = height / 2;
			const sliceWidth = width / dataArray.length;
			let x = 0;

			for (let i = 0; i < dataArray.length; i++) {
				const v = (dataArray[i] / 128.0) - 1.0;
				const y = centerY + v * (height / 2) * 0.9;

				if (i === 0) {
					canvasContext.moveTo(x, y);
				} else {
					canvasContext.lineTo(x, y);
				}
				x += sliceWidth;
			}

			canvasContext.stroke();
			canvasContext.shadowBlur = 0;
		} else {
			// 녹음 대기 중일 때 점선 표시
			const dashGradient = canvasContext.createLinearGradient(0, 0, width, 0);
			dashGradient.addColorStop(0, '#34d399');
			dashGradient.addColorStop(1, '#10b981');

			canvasContext.strokeStyle = dashGradient;
			canvasContext.lineWidth = 2.5;
			canvasContext.setLineDash([10, 6]);
			canvasContext.beginPath();
			canvasContext.moveTo(20, height / 2);
			canvasContext.lineTo(width - 20, height / 2);
			canvasContext.stroke();
			canvasContext.setLineDash([]);
		}
	};

	onMount(() => {
		if (canvas) {
			canvasContext = canvas.getContext('2d');
			const dpr = window.devicePixelRatio || 1;
			const rect = canvas.getBoundingClientRect();
			canvas.width = rect.width * dpr;
			canvas.height = rect.height * dpr;
			canvasContext.scale(dpr, dpr);
			canvas.style.width = rect.width + 'px';
			canvas.style.height = rect.height + 'px';
			drawWaveform();
		}
	});

	// 녹음 중일 때 애니메이션 루프 시작
	$effect(() => {
		if (isRecording && analyser && dataArray && canvasContext && !animationFrame) {
			const animate = () => {
				drawWaveform();
				if (isRecording && analyser) {
					animationFrame = requestAnimationFrame(animate);
				} else {
					animationFrame = null;
				}
			};
			animate();
		}

		// 녹음 중지 시 애니메이션 정리
		if (!isRecording && animationFrame) {
			cancelAnimationFrame(animationFrame);
			animationFrame = null;
			drawWaveform(); // 마지막으로 한 번 그리기
		}
	});

	onDestroy(() => {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
		}
	});
</script>

<div class="mt-10 h-52 w-full">
	<canvas bind:this={canvas} class="h-full w-full rounded-lg"></canvas>
</div>

