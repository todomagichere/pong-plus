import { Game } from './game';
import { GameConfig } from './gameConfig';

// Game configuration with default values
const gameConfig: GameConfig = {
  ballSpeed: 50,
  paddleSpeed: 800,
  ballAcceleration: 2,
  powerUpFrequency: 6
};

// Function to update value displays
function updateValueDisplay(sliderId: string, valueId: string, suffix: string = '') {
  const slider = document.getElementById(sliderId) as HTMLInputElement;
  const valueDisplay = document.getElementById(valueId) as HTMLElement;

  if (slider && valueDisplay) {
    slider.addEventListener('input', () => {
      valueDisplay.textContent = slider.value + suffix;

      // Update config based on slider ID
      switch(sliderId) {
        case 'ball-speed':
          gameConfig.ballSpeed = parseFloat(slider.value);
          break;
        case 'paddle-speed':
          gameConfig.paddleSpeed = parseFloat(slider.value);
          break;
        case 'ball-acceleration':
          gameConfig.ballAcceleration = parseFloat(slider.value);
          break;
        case 'powerup-frequency':
          gameConfig.powerUpFrequency = parseFloat(slider.value);
          break;
      }
    });
  }
}

// Function to apply preset configurations
function applyPreset(preset: 'slow' | 'medium' | 'fast' | 'extreme') {
  const ballSpeedSlider = document.getElementById('ball-speed') as HTMLInputElement;
  const paddleSpeedSlider = document.getElementById('paddle-speed') as HTMLInputElement;
  const ballAccelerationSlider = document.getElementById('ball-acceleration') as HTMLInputElement;
  const powerUpFrequencySlider = document.getElementById('powerup-frequency') as HTMLInputElement;

  switch(preset) {
    case 'slow':
      // Normal speed
      ballSpeedSlider.value = '25';
      paddleSpeedSlider.value = '600';
      ballAccelerationSlider.value = '1';
      powerUpFrequencySlider.value = '8';
      break;
    case 'medium':
      // Fast
      ballSpeedSlider.value = '150';
      paddleSpeedSlider.value = '800';
      ballAccelerationSlider.value = '2';
      powerUpFrequencySlider.value = '6';
      break;
    case 'fast':
      // Very fast
      ballSpeedSlider.value = '250';
      paddleSpeedSlider.value = '1200';
      ballAccelerationSlider.value = '4';
      powerUpFrequencySlider.value = '4';
      break;
    case 'extreme':
      // Extreme speed
      ballSpeedSlider.value = '450';
      paddleSpeedSlider.value = '1800';
      ballAccelerationSlider.value = '6';
      powerUpFrequencySlider.value = '2';
      break;
  }

  // Trigger events to update displays and config
  ballSpeedSlider.dispatchEvent(new Event('input'));
  paddleSpeedSlider.dispatchEvent(new Event('input'));
  ballAccelerationSlider.dispatchEvent(new Event('input'));
  powerUpFrequencySlider.dispatchEvent(new Event('input'));

  // Go back to settings screen
  showScreen('settings-screen');
}

// Function to switch between menu screens
function showScreen(screenId: string) {
  const screens = document.querySelectorAll('.menu-screen');
  screens.forEach(screen => {
    screen.classList.remove('active');
  });

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }
}

// Initialize the game when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const menuElement = document.getElementById('menu') as HTMLElement;
  const player1ScoreElement = document.getElementById('player1-score') as HTMLElement;
  const player2ScoreElement = document.getElementById('player2-score') as HTMLElement;
  const player1PowerUpsElement = document.getElementById('player1-power-ups') as HTMLElement;
  const player2PowerUpsElement = document.getElementById('player2-power-ups') as HTMLElement;

  // Set up value displays for sliders
  updateValueDisplay('ball-speed', 'ball-speed-value');
  updateValueDisplay('paddle-speed', 'paddle-speed-value');
  updateValueDisplay('ball-acceleration', 'ball-acceleration-value');
  updateValueDisplay('powerup-frequency', 'powerup-frequency-value', 's');

  // Set up button event listeners for menu navigation
  const startGameBtn = document.getElementById('start-game-btn') as HTMLButtonElement;
  const presetsBtn = document.getElementById('presets-btn') as HTMLButtonElement;
  const backToSettingsBtn = document.getElementById('back-to-settings-btn') as HTMLButtonElement;

  // Preset buttons
  const presetSlowBtn = document.getElementById('preset-slow') as HTMLButtonElement;
  const presetMediumBtn = document.getElementById('preset-medium') as HTMLButtonElement;
  const presetFastBtn = document.getElementById('preset-fast') as HTMLButtonElement;
  const presetExtremeBtn = document.getElementById('preset-extreme') as HTMLButtonElement;

  // Initialize the game with config
  let game: Game | null = null;

  // Menu navigation
  if (presetsBtn) {
    presetsBtn.addEventListener('click', () => {
      showScreen('presets-screen');
    });
  }

  if (backToSettingsBtn) {
    backToSettingsBtn.addEventListener('click', () => {
      showScreen('settings-screen');
    });
  }

  // Preset buttons
  if (presetSlowBtn) {
    presetSlowBtn.addEventListener('click', () => applyPreset('slow'));
  }

  if (presetMediumBtn) {
    presetMediumBtn.addEventListener('click', () => applyPreset('medium'));
  }

  if (presetFastBtn) {
    presetFastBtn.addEventListener('click', () => applyPreset('fast'));
  }

  if (presetExtremeBtn) {
    presetExtremeBtn.addEventListener('click', () => applyPreset('extreme'));
  }

  // Start game button
  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
      // Initialize the game with current configuration
      game = new Game(
        canvas,
        menuElement,
        player1ScoreElement,
        player2ScoreElement,
        player1PowerUpsElement,
        player2PowerUpsElement,
        gameConfig
      );

      game.start();
      menuElement.classList.add('hidden');
    });
  }

  // Set canvas dimensions
  const resizeCanvas = () => {
    const containerWidth = canvas.parentElement?.clientWidth || 800;
    const containerHeight = (canvas.parentElement?.clientHeight || 600) * 0.8;

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Notify game of resize
    if (game) {
      game.handleResize();
    }
  };

  // Initialize canvas size and listen for resize events
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
});
