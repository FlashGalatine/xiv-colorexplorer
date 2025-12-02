import { showCameraPreviewModal } from '../camera-preview-modal';
import { ModalService, LanguageService, cameraService, ToastService } from '@services/index';
import { logger } from '@shared/logger';

// Mock Services
vi.mock('@services/index', () => ({
  ModalService: {
    show: vi.fn(),
    dismissTop: vi.fn(),
  },
  LanguageService: {
    t: vi.fn((key) => key),
  },
  cameraService: {
    hasCameraAvailable: vi.fn(),
    getAvailableCameras: vi.fn(() => []),
    createVideoElement: vi.fn(() => document.createElement('video')),
    startStream: vi.fn(),
    stopStream: vi.fn(),
    attachStreamToVideo: vi.fn(),
    getTrackSettings: vi.fn(),
    captureFrame: vi.fn(),
  },
  ToastService: {
    warning: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@shared/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('showCameraPreviewModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show warning if no camera available', async () => {
    vi.mocked(cameraService.hasCameraAvailable).mockReturnValue(false);

    await showCameraPreviewModal(vi.fn());

    expect(ToastService.warning).toHaveBeenCalled();
    expect(ModalService.show).not.toHaveBeenCalled();
  });

  it('should show modal if camera available', async () => {
    vi.mocked(cameraService.hasCameraAvailable).mockReturnValue(true);

    await showCameraPreviewModal(vi.fn());

    expect(ModalService.show).toHaveBeenCalled();
  });

  it('should start camera stream after delay', async () => {
    vi.mocked(cameraService.hasCameraAvailable).mockReturnValue(true);
    vi.mocked(cameraService.startStream).mockResolvedValue({} as MediaStream);

    await showCameraPreviewModal(vi.fn());

    vi.runAllTimers();

    expect(cameraService.startStream).toHaveBeenCalled();
  });

  it('should handle capture', async () => {
    vi.mocked(cameraService.hasCameraAvailable).mockReturnValue(true);
    vi.mocked(cameraService.startStream).mockResolvedValue({} as MediaStream);
    vi.mocked(cameraService.captureFrame).mockResolvedValue({
      blob: new Blob(),
      dataUrl: 'data:image/png;base64,',
    });

    const onCapture = vi.fn();
    await showCameraPreviewModal(onCapture);

    // Run timers to start camera
    vi.runAllTimers();
    await Promise.resolve();

    // Get the content passed to ModalService.show
    const options = vi.mocked(ModalService.show).mock.calls[0][0];
    const content = options.content as HTMLElement;
    const captureBtn = content.querySelector('#camera-capture-btn') as HTMLButtonElement;
    const video = content.querySelector('video') as HTMLVideoElement;

    // Simulate video playing to enable capture button
    video.dispatchEvent(new Event('playing'));

    expect(captureBtn.disabled).toBe(false);

    // Click capture
    captureBtn.click();

    // Wait for async handler
    await Promise.resolve();
    await Promise.resolve();

    expect(cameraService.captureFrame).toHaveBeenCalled();
    expect(onCapture).toHaveBeenCalled();
    expect(ModalService.dismissTop).toHaveBeenCalled();
  });

  it('should handle multiple cameras', async () => {
    vi.mocked(cameraService.hasCameraAvailable).mockReturnValue(true);
    vi.mocked(cameraService.getAvailableCameras).mockReturnValue([
      { deviceId: 'cam1', label: 'Camera 1', kind: 'videoinput', groupId: '1', toJSON: () => {} },
      { deviceId: 'cam2', label: 'Camera 2', kind: 'videoinput', groupId: '2', toJSON: () => {} },
    ]);

    await showCameraPreviewModal(vi.fn());

    // Run timers to start camera
    vi.runAllTimers();

    const options = vi.mocked(ModalService.show).mock.calls[0][0];
    const content = options.content as HTMLElement;
    const selector = content.querySelector('#camera-selector') as HTMLSelectElement;

    expect(selector).not.toBeNull();
    expect(selector.options.length).toBe(2);

    // Switch camera
    selector.value = 'cam2';
    selector.dispatchEvent(new Event('change'));

    expect(cameraService.stopStream).toHaveBeenCalled();
    expect(cameraService.startStream).toHaveBeenCalledWith('cam2');
  });

  it('should cleanup on close', async () => {
    vi.mocked(cameraService.hasCameraAvailable).mockReturnValue(true);

    await showCameraPreviewModal(vi.fn());

    expect(ModalService.show).toHaveBeenCalled();
    const options = vi.mocked(ModalService.show).mock.calls[0][0];

    // Ensure startStream runs to populate handlers (optional but good for coverage)
    vi.runAllTimers();

    // @ts-ignore
    options.onClose();

    expect(cameraService.stopStream).toHaveBeenCalled();
  });
});
