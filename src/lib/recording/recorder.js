/**
 * 오디오 녹음 관리 클래스
 */
export class AudioRecorder {
	constructor() {
		this.recorder = null;
		this.stream = null;
		this.chunks = [];
		this.isRecording = false;
		this.recordingTime = 0;
		this.timerInterval = null;
		this.audioContext = null;
		this.analyser = null;
		this.dataArray = null;
		this.animationFrame = null;
		this.eventHandlers = {
			onTimeUpdate: null,
			onRecordingComplete: null,
			onError: null
		};

		this.mimeCandidates = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm'];
		this.supportedMimeType =
			typeof MediaRecorder !== 'undefined'
				? this.mimeCandidates.find((type) => MediaRecorder.isTypeSupported(type))
				: null;
	}

	/**
	 * 녹음 시작
	 */
	async start() {
		if (this.isRecording) return;

		if (!navigator.mediaDevices?.getUserMedia) {
			throw new Error('이 브라우저에서는 마이크 접근을 지원하지 않습니다.');
		}

		try {
			this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const options = this.supportedMimeType ? { mimeType: this.supportedMimeType } : undefined;

			this.recorder = new MediaRecorder(this.stream, options);
			this.chunks = [];

			// 오디오 시각화 설정
			this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
			this.analyser = this.audioContext.createAnalyser();
			this.analyser.fftSize = 2048;
			const source = this.audioContext.createMediaStreamSource(this.stream);
			source.connect(this.analyser);
			this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

			// 타이머 시작
			this.recordingTime = 0;
			this.timerInterval = setInterval(() => {
				this.recordingTime++;
				if (this.eventHandlers.onTimeUpdate) {
					this.eventHandlers.onTimeUpdate(this.recordingTime);
				}
			}, 1000);

			this.recorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					this.chunks.push(event.data);
				}
			};

			this.recorder.onstop = () => {
				const blob = new Blob(this.chunks, { type: this.supportedMimeType ?? 'audio/webm' });
				this.isRecording = false;
				this.stopTimer();
				this.stopVisualization();
				this.stopStream();

				if (this.eventHandlers.onRecordingComplete) {
					this.eventHandlers.onRecordingComplete(blob);
				}
			};

			this.recorder.start();
			this.isRecording = true;
		} catch (err) {
			console.error('Recording error:', err);
			this.stopStream();
			if (this.eventHandlers.onError) {
				this.eventHandlers.onError(err);
			}
			throw err;
		}
	}

	/**
	 * 녹음 중지
	 */
	stop() {
		if (this.recorder && this.recorder.state !== 'inactive') {
			this.recorder.stop();
		}
	}

	/**
	 * 스트림 정리
	 */
	stopStream() {
		if (this.stream) {
			this.stream.getTracks().forEach((track) => track.stop());
			this.stream = null;
		}
	}

	/**
	 * 타이머 정리
	 */
	stopTimer() {
		if (this.timerInterval) {
			clearInterval(this.timerInterval);
			this.timerInterval = null;
		}
		this.recordingTime = 0;
	}

	/**
	 * 시각화 정리
	 */
	stopVisualization() {
		if (this.animationFrame) {
			cancelAnimationFrame(this.animationFrame);
			this.animationFrame = null;
		}
		if (this.audioContext) {
			this.audioContext.close();
			this.audioContext = null;
		}
	}

	/**
	 * 파형 데이터 가져오기 (시각화용)
	 */
	getWaveformData() {
		if (!this.analyser || !this.dataArray) return null;
		this.analyser.getByteTimeDomainData(this.dataArray);
		return this.dataArray;
	}

	/**
	 * Analyser 노드 접근 (읽기 전용)
	 */
	get analyser() {
		return this.audioContext ? this.analyser : null;
	}

	/**
	 * Data array 접근 (읽기 전용)
	 */
	get dataArray() {
		return this.dataArray;
	}

	/**
	 * 이벤트 핸들러 등록
	 */
	on(event, handler) {
		const eventKey = `on${event.charAt(0).toUpperCase() + event.slice(1)}`;
		if (this.eventHandlers[eventKey] !== undefined) {
			this.eventHandlers[eventKey] = handler;
		}
	}

	/**
	 * 정리
	 */
	cleanup() {
		this.stop();
		this.stopTimer();
		this.stopVisualization();
		this.stopStream();
	}
}

