'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

interface Position {
  x: number;
  y: number;
}

interface GameState {
  isPlaying: boolean;
  showInstructions: boolean;
  showAlert: boolean;
  showResults: boolean;
  gameOver: boolean;
  reactionTime: number;
  alertStartTime: number;
  waitingForAlert: boolean;
  isPressing: boolean;
  showResultBackground: boolean;
  resultBackgroundType: 'succeed' | 'soon';
  showModalWithDelay: boolean;
}

interface TimerState {
  currentTime: number;
  intervalId: NodeJS.Timeout | null;
}

type ReactionCategory = 'Lightning Fast' | 'Quick Reflexes' | 'Good Reaction';

export default function Home() {
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [timer, setTimer] = useState<TimerState>({
    currentTime: 0,
    intervalId: null
  });
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    showInstructions: true,
    showAlert: false,
    showResults: false,
    gameOver: false,
    reactionTime: 0,
    alertStartTime: 0,
    waitingForAlert: false,
    isPressing: false,
    showResultBackground: false,
    resultBackgroundType: 'succeed',
    showModalWithDelay: false,
  });

  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);

  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultDelayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const alarmMusicRef = useRef<HTMLAudioElement | null>(null);
  const buttonClickRef = useRef<HTMLAudioElement | null>(null);

  // Timer functions
  const startTimer = useCallback(() => {
    if (timer.intervalId) {
      clearInterval(timer.intervalId);
    }
    
    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setTimer(prev => ({ ...prev, currentTime: elapsed }));
    }, 10); // Update every 10ms for smooth display
    
    setTimer({ currentTime: 0, intervalId });
  }, [timer.intervalId]);

  const stopTimer = useCallback(() => {
    if (timer.intervalId) {
      clearInterval(timer.intervalId);
      setTimer(prev => ({ ...prev, intervalId: null }));
    }
  }, [timer.intervalId]);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTimer({ currentTime: 0, intervalId: null });
  }, [stopTimer]);



  // Initialize audio files
  useEffect(() => {
    // Initialize background music
    const bgMusic = new Audio('/sounds/bg-music.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3; // Lower volume for background
    bgMusic.preload = 'auto'; // Preload the audio
    bgMusicRef.current = bgMusic;

    // Initialize alarm music
    const alarmMusic = new Audio('/sounds/alarm-music.mp3');
    alarmMusic.loop = true;
    alarmMusic.volume = 0.7; // Higher volume for urgency
    alarmMusic.preload = 'auto';
    alarmMusicRef.current = alarmMusic;

    // Initialize button click sound
    const buttonClick = new Audio('/sounds/button-click.mp3');
    buttonClick.volume = 0.5;
    buttonClick.preload = 'auto';
    buttonClickRef.current = buttonClick;

    // Try to start background music immediately
    const startBgMusic = async () => {
      try {
        if (bgMusicRef.current) {
          await bgMusicRef.current.play();
        }
      } catch {
        // If autoplay fails, set up listeners for first user interaction
        const startOnFirstInteraction = () => {
          if (bgMusicRef.current) {
            bgMusicRef.current.play().catch(console.log);
          }
          // Remove listeners after first play
          document.removeEventListener('click', startOnFirstInteraction);
          document.removeEventListener('touchstart', startOnFirstInteraction);
          document.removeEventListener('keydown', startOnFirstInteraction);
        };

        document.addEventListener('click', startOnFirstInteraction);
        document.addEventListener('touchstart', startOnFirstInteraction);
        document.addEventListener('keydown', startOnFirstInteraction);
      }
    };

    startBgMusic();

    // Cleanup function
    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
      }
      if (alarmMusicRef.current) {
        alarmMusicRef.current.pause();
      }
    };
  }, []);

  // Audio control helpers
  const playButtonSound = useCallback(() => {
    if (buttonClickRef.current) {
      buttonClickRef.current.currentTime = 0.5; // Start from middle of sound (0.5 seconds)
      buttonClickRef.current.play().catch(console.log);
    }
  }, []);

  const pauseBgMusic = useCallback(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
    }
  }, []);

  const resumeBgMusic = useCallback(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.play().catch(console.log);
    }
  }, []);

  const startAlarmMusic = useCallback(() => {
    if (alarmMusicRef.current) {
      alarmMusicRef.current.currentTime = 0;
      alarmMusicRef.current.play().catch(console.log);
    }
  }, []);

  const stopAlarmMusic = useCallback(() => {
    if (alarmMusicRef.current) {
      alarmMusicRef.current.pause();
      alarmMusicRef.current.currentTime = 0;
    }
  }, []);

  // Mouse and touch movement tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        setMousePosition({ x: touch.clientX, y: touch.clientY });
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        setMousePosition({ x: touch.clientX, y: touch.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  // Click and touch animation
  const handlePointerDown = useCallback(() => {
    setIsClicking(true);
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsClicking(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('touchend', handlePointerUp);
    
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerUp]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timer.intervalId) {
        clearInterval(timer.intervalId);
      }
    };
  }, [timer.intervalId]);

  const getReactionCategory = useCallback((time: number): ReactionCategory => {
    if (time < 250) return 'Lightning Fast';
    if (time < 400) return 'Quick Reflexes';
    return 'Good Reaction';
  }, []);

  // Generate and copy result image to clipboard
  const generateResultImage = useCallback(async (reactionTime: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size (Twitter optimal: 1200x675)
    canvas.width = 1200;
    canvas.height = 675;

    // Load pixel font
    await document.fonts.load('16px "Press Start 2P"');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border with safe margins
    ctx.strokeStyle = '#0f3460';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Main title with better spacing
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    // Add text shadow effect
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillText('I\'m On My Way ($OMW)', canvas.width / 2, 120);
    ctx.fillText('in Solana', canvas.width / 2, 180);

    // Reaction time with better positioning
    ctx.fillStyle = '#00ff41';
    ctx.font = 'bold 72px "Press Start 2P", monospace';
    ctx.shadowColor = '#003300';
    ctx.shadowBlur = 3;
    ctx.fillText(`${reactionTime}ms`, canvas.width / 2, 300);

    // Category with safe spacing
    const category = getReactionCategory(reactionTime);
    ctx.fillStyle = '#f39c12';
    ctx.font = 'bold 32px "Press Start 2P", monospace';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 2;
    ctx.fillText(category, canvas.width / 2, 370);

    // Bottom text with margins
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Press Start 2P", monospace';
    ctx.fillText('Test your reaction time!', canvas.width / 2, 480);
    ctx.font = 'bold 20px "Press Start 2P", monospace';
    ctx.fillText('@omwsolana', canvas.width / 2, 530);

    // Generate URL for modal display
    const dataUrl = canvas.toDataURL('image/png');
    setResultImageUrl(dataUrl);

    return canvas;
  }, [getReactionCategory]);

  // Helper function to handle game end result with background animation and delay
  const handleGameResult = useCallback((type: 'succeed' | 'soon', reactionTime?: number) => {
    // First, show the result background and fade out the main background
    setGameState(prev => ({
      ...prev,
      showResultBackground: true,
      resultBackgroundType: type,
      showAlert: false, // Hide alert if showing
    }));

    // After 1.5 seconds, show the modal
    resultDelayTimeoutRef.current = setTimeout(async () => {
      if (type === 'succeed' && reactionTime !== undefined) {
        // Generate the result image when showing success modal
        await generateResultImage(reactionTime);
        setGameState(prev => ({
          ...prev,
          showResults: true,
          reactionTime: reactionTime,
          showModalWithDelay: true,
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          gameOver: true,
          showModalWithDelay: true,
        }));
      }
    }, 1500); // 1.5 second delay
  }, [generateResultImage]);

  // OMW button click/touch handler
  const handleOMWPointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    playButtonSound(); // Play sound when pressing OMW button
    setGameState(prev => ({ ...prev, isPressing: true }));
    
    if (gameState.isPlaying && gameState.waitingForAlert && !gameState.showAlert) {
      // Clicked OMW before alert - game over (TOO SOON)
      stopAlarmMusic();
      resumeBgMusic();
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = null;
      }
      resetTimer(); // Stop timer on game over
      
      // Use the new helper with delay and background change
      handleGameResult('soon');
      
    } else if (gameState.showAlert && gameState.isPlaying) {
      // Calculate reaction time using the timer (SUCCESS)
      const reactionTime = timer.currentTime;
      stopTimer(); // Stop the timer
      stopAlarmMusic(); // Stop alarm music
      resumeBgMusic(); // Resume background music
      
      setGameState(prev => ({
        ...prev,
        isPressing: false,
        waitingForAlert: false
      }));
      
      // Use the new helper with delay and background change
      handleGameResult('succeed', reactionTime);
    }
  }, [gameState.isPlaying, gameState.showAlert, gameState.waitingForAlert, timer.currentTime, resetTimer, stopTimer, playButtonSound, stopAlarmMusic, resumeBgMusic, handleGameResult]);

  const handleOMWPointerUp = useCallback(() => {
    setGameState(prev => ({ ...prev, isPressing: false }));
  }, []);

  // Game logic
  const startGame = useCallback(() => {
    playButtonSound(); // Play button sound
    
    // Ensure background music is playing when starting game
    if (bgMusicRef.current && bgMusicRef.current.paused) {
      bgMusicRef.current.play().catch(console.log);
    }
    
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      showInstructions: false,
      showAlert: false,
      showResults: false,
      gameOver: false,
      reactionTime: 0,
      waitingForAlert: true,
      isPressing: false,
      showResultBackground: false,  // Reset result background
      resultBackgroundType: 'succeed',  // Reset to default
      showModalWithDelay: false,  // Reset modal delay flag
    }));

    // Random delay before showing alert (3-8 seconds)
    const delay = Math.random() * 5000 + 3000;
    alertTimeoutRef.current = setTimeout(() => {
      pauseBgMusic(); // Pause background music
      startAlarmMusic(); // Start alarm music
      setGameState(prev => ({
        ...prev,
        showAlert: true,
        alertStartTime: Date.now()
      }));
      startTimer(); // Start the visual timer
    }, delay);
  }, [startTimer, pauseBgMusic, startAlarmMusic, playButtonSound]);

  const resetGame = () => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
      alertTimeoutRef.current = null;
    }
    
    if (resultDelayTimeoutRef.current) {
      clearTimeout(resultDelayTimeoutRef.current);
      resultDelayTimeoutRef.current = null;
    }
    
    resetTimer(); // Reset the timer
    stopAlarmMusic(); // Stop alarm music
    resumeBgMusic(); // Resume background music
    
    // Clear result image
    setResultImageUrl(null);
    
    setGameState({
      isPlaying: false,
      showInstructions: false,
      showAlert: false,
      showResults: false,
      gameOver: false,
      reactionTime: 0,
      alertStartTime: 0,
      waitingForAlert: false,
      isPressing: false,
      showResultBackground: false,
      resultBackgroundType: 'succeed',
      showModalWithDelay: false,
    });
  };

  const showInstructions = () => {
    playButtonSound(); // Play button sound
    
    // If game is in progress, reset it
    if (gameState.isPlaying || gameState.waitingForAlert || gameState.showAlert) {
      resetGame(); // This will stop timers, reset music, etc.
    }
    
    setGameState(prev => ({ ...prev, showInstructions: true }));
  };

  const formatTime = (ms: number) => {
    return `${ms}ms`;
  };

  // Copy image to clipboard
  const copyImageToClipboard = useCallback(async (reactionTime: number) => {
    try {
      const canvas = await generateResultImage(reactionTime);
      if (!canvas) {
        alert('Error generating image');
        return;
      }

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Error creating image');
          return;
        }

        try {
          // Modern clipboard API
          if (navigator.clipboard && window.ClipboardItem) {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            alert('✅ Image copied to clipboard! Paste it in your X post.');
          } else {
            // Fallback: create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `omw-result-${reactionTime}ms.png`;
            a.click();
            URL.revokeObjectURL(url);
            alert('📥 Image downloaded! Upload it to your X post.');
          }
        } catch (error) {
          console.error('Error copying to clipboard:', error);
          // Fallback: create download link
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `omw-result-${reactionTime}ms.png`;
              a.click();
              URL.revokeObjectURL(url);
              alert('📥 Image downloaded! Upload it to your X post.');
            }
          });
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating image. Please try again.');
    }
  }, [generateResultImage]);

  // Share on X (Twitter)
  const shareOnX = useCallback((reactionTime: number) => {
    const category = getReactionCategory(reactionTime);
    const gameUrl = `${window.location.origin}${window.location.pathname}`;
    
    const tweetText = `Just got ${reactionTime}ms (${category}) reaction time on @omwsolana game! 🚀⚡

Test your reflexes for $OMW - don't forget to grab a bag! 💰

Play now: ${gameUrl}

CA: CCk7zxbYt3zMLybZ2Civw6r4H9ZSiLts3HNmLcdvbonk

#OnMyWay #OMW #Solana #ReactionTest`;

    const encodedText = encodeURIComponent(tweetText);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    
    // Open in new window/tab - works on all platforms
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  }, [getReactionCategory]);

  // Calculate OMW button position (centered in the game area)
  const omwButtonPosition = {
    left: '50%',
    top: '60%',
    transform: 'translate(-50%, -50%)'
  };



  return (
    <>
      {/* Header */}
      <header className="game-header">
        <h1>$OMW Reaction Test</h1>
      </header>

      {/* Footer */}
      <footer className="game-footer">
        <a 
          href="https://x.com/xisk_99" 
          target="_blank" 
          rel="noopener noreferrer"
          className="footer-link"
        >
          Made by @xisk_99
        </a>
      </footer>

      <div className="game-container" ref={gameContainerRef}>
      {/* Background */}
      <Image
        src="/game/game-bg.png"
        alt="Game Background"
        fill
        className={`game-background ${gameState.showResultBackground ? 'fade-out' : 'fade-in'}`}
        priority
      />
      
      {/* Alert Background - fades in and out */}
      {gameState.showAlert && (
        <Image
          src="/game/bg-alert.png"
          alt="Alert Background"
          fill
          className="game-background alert-background"
        />
      )}

      {/* Result Background - shows succeed or soon */}
      {gameState.showResultBackground && (
        <Image
          src={`/game/bg-${gameState.resultBackgroundType}.png`}
          alt={`${gameState.resultBackgroundType} Background`}
          fill
          className="result-background"
        />
      )}

      {/* Custom cursor - hand */}
      <div 
        className={`game-cursor ${isClicking ? 'clicking' : ''}`}
        style={{
          left: mousePosition.x - 25,
          top: mousePosition.y - 25,
        }}
      >
        <Image
          src="/game/hand.png"
          alt="Hand cursor"
          width={50}
          height={50}
        />
      </div>

      {/* OMW Button */}
      <div
        className={`omw-button ${gameState.isPressing ? 'pressed' : ''}`}
        style={omwButtonPosition}
        onMouseDown={handleOMWPointerDown}
        onMouseUp={handleOMWPointerUp}
        onTouchStart={handleOMWPointerDown}
        onTouchEnd={handleOMWPointerUp}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={gameState.isPressing ? "/game/omw-pressed.png" : "/game/omw-idle.png"}
          alt="OMW Button"
          width={120}
          height={120}
        />
      </div>



      {/* Alert Overlay */}
      <div className={`alert-overlay ${gameState.showAlert ? 'active' : ''}`} />

      {/* Timer Display */}
      {gameState.showAlert && (
        <div className="timer-display active">
          {formatTime(timer.currentTime)}
        </div>
      )}

      {/* Instructions Button */}
      {!gameState.showInstructions && (
        <button 
          className="instructions-btn"
                  onClick={showInstructions}
        title="Instructions"
        >
          ?
        </button>
      )}

      {/* Instructions Modal */}
      {gameState.showInstructions && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>🚀 On My Way - Reaction Test</h2>
            <p><strong>Welcome, adventurer!</strong></p>
            <p>📋 <strong>Instructions:</strong></p>
            <p>• Move your cursor to control the hand</p>
            <p>• Keep your cursor over the &quot;OMW&quot; (On My Way) button</p>
            <p>• At any moment an <span style={{color: '#e74c3c'}}>ALERT SIGNAL</span> will appear</p>
            <p>• Your goal: Click the OMW button as fast as possible!</p>
            <p>⚠️ <strong>WARNING!</strong> If you click before the alert, you lose!</p>
            <p>🏆 Reaction categories:</p>
            <p>⚡ <strong>Lightning Fast:</strong> &lt; 250ms</p>
            <p>🏃 <strong>Quick Reflexes:</strong> 250-400ms</p>
            <p>👍 <strong>Good Reaction:</strong> &gt; 400ms</p>
            <div>
              <button className="btn" onClick={startGame}>
                🎮 Start Game!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {gameState.showResults && (
        <div className={`modal-overlay ${gameState.showModalWithDelay ? 'slide-up' : ''}`}>
          <div className={`modal-content ${gameState.showModalWithDelay ? 'slide-up' : ''}`}>
            {gameState.gameOver ? (
              <>
                <h2>💥 Game Over</h2>
                <p>You clicked too early!</p>
                <p>You must wait for the alert signal to appear.</p>
                <div>
                  <button className="btn" onClick={startGame}>
                    🔄 Try Again
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>🎯 Reaction Time!</h2>
                <p style={{fontSize: '2rem', color: '#f39c12', fontWeight: 'bold'}}>
                  {formatTime(gameState.reactionTime)}
                </p>
                <p style={{fontSize: '1.5rem', color: '#27ae60'}}>
                  <strong>{getReactionCategory(gameState.reactionTime)}</strong>
                </p>
                {gameState.reactionTime < 250 && (
                  <p>⚡ Amazing! You have lightning reflexes</p>
                )}
                {gameState.reactionTime >= 250 && gameState.reactionTime < 400 && (
                  <p>🏃 Excellent! Very good reaction speed</p>
                )}
                {gameState.reactionTime >= 400 && (
                  <p>👍 Well done! Keep practicing to improve</p>
                )}

                {/* Generated result image */}
                {resultImageUrl && (
                  <div style={{margin: '15px 0', textAlign: 'center'}}>
                    <img 
                      src={resultImageUrl} 
                      alt="Result sharing image" 
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        border: '2px solid #0f3460',
                        borderRadius: '0',
                        maxHeight: '200px',
                        objectFit: 'contain'
                      }}
                    />
                    <p style={{fontSize: '0.6rem', margin: '5px 0', color: '#ccc'}}>
                      Perfect for sharing on X!
                    </p>
                  </div>
                )}
                
                {/* Share buttons */}
                <div className="share-buttons">
                  <button 
                    className="btn-share" 
                    onClick={() => shareOnX(gameState.reactionTime)}
                  >
                    POST ON X
                  </button>
                  <button 
                    className="btn-share btn-copy" 
                    onClick={() => copyImageToClipboard(gameState.reactionTime)}
                  >
                    📋 COPY IMAGE
                  </button>
                </div>
                
                <div>
                  <button className="btn" onClick={startGame}>
                    🔄 Play Again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState.gameOver && !gameState.showResults && (
        <div className={`modal-overlay ${gameState.showModalWithDelay ? 'slide-up' : ''}`}>
          <div className={`modal-content ${gameState.showModalWithDelay ? 'slide-up' : ''}`}>
            <h2>💥 Too Soon!</h2>
            <p>You clicked before the alert signal appeared!</p>
            <p>You must wait for the alert to appear before clicking the OMW button.</p>
            <div>
              <button className="btn" onClick={startGame}>
                🔄 Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}