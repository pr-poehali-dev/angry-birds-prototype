import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

type GameState = 'menu' | 'playing' | 'levels' | 'scores' | 'settings' | 'tutorial';

interface Bird {
  x: number;
  y: number;
  vx: number;
  vy: number;
  launched: boolean;
  active: boolean;
}

interface Pig {
  x: number;
  y: number;
  health: number;
  active: boolean;
}

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'wood' | 'stone' | 'ice';
  health: number;
  active: boolean;
}

interface Level {
  id: number;
  stars: number;
  unlocked: boolean;
  highScore: number;
}

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [birdsLeft, setBirdsLeft] = useState(3);
  const [bird, setBird] = useState<Bird>({ x: 100, y: 300, vx: 0, vy: 0, launched: false, active: true });
  const [pigs, setPigs] = useState<Pig[]>([
    { x: 600, y: 350, health: 100, active: true },
    { x: 700, y: 350, health: 100, active: true },
    { x: 650, y: 250, health: 100, active: true },
  ]);
  const [blocks, setBlocks] = useState<Block[]>([
    { x: 580, y: 320, width: 40, height: 60, type: 'wood', health: 100, active: true },
    { x: 620, y: 320, width: 40, height: 60, type: 'wood', health: 100, active: true },
    { x: 600, y: 260, width: 60, height: 20, type: 'wood', health: 100, active: true },
    { x: 680, y: 320, width: 40, height: 60, type: 'stone', health: 150, active: true },
    { x: 720, y: 320, width: 40, height: 60, type: 'stone', health: 150, active: true },
    { x: 700, y: 260, width: 60, height: 20, type: 'stone', health: 150, active: true },
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [trajectory, setTrajectory] = useState<{x: number, y: number}[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [levels] = useState<Level[]>([
    { id: 1, stars: 3, unlocked: true, highScore: 5000 },
    { id: 2, stars: 2, unlocked: true, highScore: 3500 },
    { id: 3, stars: 1, unlocked: true, highScore: 2000 },
    { id: 4, stars: 0, unlocked: false, highScore: 0 },
    { id: 5, stars: 0, unlocked: false, highScore: 0 },
    { id: 6, stars: 0, unlocked: false, highScore: 0 },
  ]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setBirdsLeft(3);
    setBird({ x: 100, y: 300, vx: 0, vy: 0, launched: false, active: true });
    setPigs([
      { x: 600, y: 350, health: 100, active: true },
      { x: 700, y: 350, health: 100, active: true },
      { x: 650, y: 250, health: 100, active: true },
    ]);
    setBlocks([
      { x: 580, y: 320, width: 40, height: 60, type: 'wood', health: 100, active: true },
      { x: 620, y: 320, width: 40, height: 60, type: 'wood', health: 100, active: true },
      { x: 600, y: 260, width: 60, height: 20, type: 'wood', health: 100, active: true },
      { x: 680, y: 320, width: 40, height: 60, type: 'stone', health: 150, active: true },
      { x: 720, y: 320, width: 40, height: 60, type: 'stone', health: 150, active: true },
      { x: 700, y: 260, width: 60, height: 20, type: 'stone', health: 150, active: true },
    ]);
  };

  useEffect(() => {
    if (!bird.active && !bird.launched) return;
    
    if (!bird.active && bird.launched) {
      const timer = setTimeout(() => {
        if (birdsLeft > 0) {
          setBirdsLeft(prev => prev - 1);
          setBird({ x: 100, y: 300, vx: 0, vy: 0, launched: false, active: true });
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [bird.active, bird.launched, birdsLeft]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#8BC34A';
      ctx.fillRect(0, 380, canvas.width, 20);

      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(80, 380);
      ctx.lineTo(100, 300);
      ctx.stroke();

      ctx.fillStyle = '#6B4423';
      ctx.fillRect(95, 295, 10, 10);

      if (bird.launched && bird.active) {
        setBird(prev => {
          const newX = prev.x + prev.vx;
          let newY = prev.y + prev.vy;
          let newVy = prev.vy + 0.5;
          let newVx = prev.vx * 0.99;

          if (newY >= 370) {
            newY = 370;
            newVy = -newVy * 0.3;
            newVx = newVx * 0.8;
            
            if (Math.abs(newVy) < 0.5 && Math.abs(newVx) < 0.5) {
              return { ...prev, vx: 0, vy: 0, active: false };
            }
          }

          if (newX > canvas.width || newX < 0 || newY > canvas.height) {
            return { ...prev, active: false };
          }

          return { ...prev, x: newX, y: newY, vx: newVx, vy: newVy };
        });

        setPigs(prevPigs => prevPigs.map(pig => {
          if (!pig.active) return pig;
          
          const dx = bird.x - pig.x;
          const dy = bird.y - pig.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 40) {
            const newHealth = pig.health - 50;
            if (newHealth <= 0) {
              setScore(prev => prev + 1000);
              return { ...pig, active: false };
            }
            return { ...pig, health: newHealth };
          }
          return pig;
        }));

        setBlocks(prevBlocks => prevBlocks.map(block => {
          if (!block.active) return block;
          
          if (
            bird.x > block.x && 
            bird.x < block.x + block.width &&
            bird.y > block.y && 
            bird.y < block.y + block.height
          ) {
            const damage = block.type === 'wood' ? 60 : block.type === 'stone' ? 40 : 80;
            const newHealth = block.health - damage;
            if (newHealth <= 0) {
              setScore(prev => prev + 500);
              return { ...block, active: false };
            }
            return { ...block, health: newHealth };
          }
          return block;
        }));
      }

      blocks.forEach(block => {
        if (!block.active) return;
        
        if (block.type === 'wood') {
          ctx.fillStyle = '#92400E';
          ctx.strokeStyle = '#78350F';
        } else if (block.type === 'stone') {
          ctx.fillStyle = '#78716C';
          ctx.strokeStyle = '#57534E';
        } else {
          ctx.fillStyle = '#E0F2FE';
          ctx.strokeStyle = '#BAE6FD';
        }
        
        ctx.fillRect(block.x, block.y, block.width, block.height);
        ctx.lineWidth = 2;
        ctx.strokeRect(block.x, block.y, block.width, block.height);
        
        if (block.type === 'wood') {
          ctx.strokeStyle = '#78350F';
          ctx.lineWidth = 1;
          for (let i = 0; i < block.height; i += 10) {
            ctx.beginPath();
            ctx.moveTo(block.x, block.y + i);
            ctx.lineTo(block.x + block.width, block.y + i);
            ctx.stroke();
          }
        }
      });

      if (trajectory.length > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        trajectory.forEach((point, i) => {
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(bird.x, bird.y, 22, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#7F1D1D';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(bird.x, bird.y, 22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(bird.x - 2, bird.y - 2, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bird.x + 6, bird.y - 6, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(bird.x + 8, bird.y - 6, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(bird.x + 9, bird.y - 8, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FCD34D';
      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bird.x + 18, bird.y - 2);
      ctx.lineTo(bird.x + 28, bird.y - 6);
      ctx.lineTo(bird.x + 28, bird.y + 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bird.x - 2, bird.y + 4);
      ctx.quadraticCurveTo(bird.x + 2, bird.y + 2, bird.x + 6, bird.y + 4);
      ctx.stroke();

      ctx.fillStyle = '#FCA5A5';
      ctx.beginPath();
      ctx.ellipse(bird.x - 8, bird.y + 2, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7F1D1D';
      ctx.lineWidth = 2;
      ctx.stroke();

      pigs.forEach(pig => {
        if (!pig.active) return;
        
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(pig.x, pig.y, 28, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#065F46';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pig.x, pig.y, 28, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(pig.x, pig.y - 2, 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#34D399';
        ctx.beginPath();
        ctx.arc(pig.x - 8, pig.y - 8, 10, 0, Math.PI * 2);
        ctx.arc(pig.x + 8, pig.y - 8, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pig.x - 8, pig.y - 8, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(pig.x + 8, pig.y - 8, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(pig.x - 8, pig.y - 8, 4, 0, Math.PI * 2);
        ctx.arc(pig.x + 8, pig.y - 8, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(pig.x - 7, pig.y - 10, 2, 0, Math.PI * 2);
        ctx.arc(pig.x + 9, pig.y - 10, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FDE047';
        ctx.strokeStyle = '#92400E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pig.x - 3, pig.y + 3);
        ctx.quadraticCurveTo(pig.x, pig.y + 6, pig.x + 3, pig.y + 3);
        ctx.stroke();

        ctx.fillStyle = '#065F46';
        ctx.beginPath();
        ctx.ellipse(pig.x - 2, pig.y + 8, 3, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(pig.x + 2, pig.y + 8, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#34D399';
        ctx.strokeStyle = '#065F46';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pig.x - 18, pig.y - 12, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(pig.x + 18, pig.y - 12, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const headbandY = pig.y - 20;
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(pig.x, pig.y, 28, Math.PI * 1.2, Math.PI * 1.8);
        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, bird, pigs, blocks, trajectory]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (bird.launched || !bird.active) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = x - bird.x;
    const dy = y - bird.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 30) {
      setIsDragging(true);
      setDragStart({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = 100 - x;
    const dy = 300 - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 100;
    
    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx);
      setBird(prev => ({
        ...prev,
        x: 100 - Math.cos(angle) * maxDistance,
        y: 300 - Math.sin(angle) * maxDistance
      }));
    } else {
      setBird(prev => ({ ...prev, x, y }));
    }

    const points = [];
    let simX = bird.x;
    let simY = bird.y;
    let simVx = (100 - bird.x) * 0.2;
    let simVy = (300 - bird.y) * 0.2;
    
    for (let i = 0; i < 30; i++) {
      points.push({ x: simX, y: simY });
      simVx *= 0.99;
      simVy += 0.5;
      simX += simVx;
      simY += simVy;
      if (simY >= 370) break;
    }
    setTrajectory(points);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setTrajectory([]);
    
    const vx = (100 - bird.x) * 0.2;
    const vy = (300 - bird.y) * 0.2;
    
    setBird(prev => ({
      ...prev,
      vx,
      vy,
      launched: true,
      x: 100,
      y: 300
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 flex items-center justify-center p-4">
      {gameState === 'menu' && (
        <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur shadow-2xl bounce-in">
          <div className="text-center space-y-8">
            <h1 className="text-6xl font-black text-primary drop-shadow-lg">
              ANGRY BIRDS
            </h1>
            
            <div className="space-y-3">
              <Button 
                onClick={startGame}
                className="w-full h-14 text-xl font-bold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Icon name="Play" className="mr-2" size={24} />
                Играть
              </Button>
              
              <Button 
                onClick={() => setGameState('levels')}
                className="w-full h-14 text-xl font-bold bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Icon name="Grid3x3" className="mr-2" size={24} />
                Уровни
              </Button>
              
              <Button 
                onClick={() => setGameState('scores')}
                className="w-full h-14 text-xl font-bold bg-secondary hover:bg-secondary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Icon name="Trophy" className="mr-2" size={24} />
                Рекорды
              </Button>
              
              <Button 
                onClick={() => setGameState('tutorial')}
                className="w-full h-14 text-xl font-bold bg-sky-500 hover:bg-sky-600 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Icon name="BookOpen" className="mr-2" size={24} />
                Обучение
              </Button>
              
              <Button 
                onClick={() => setGameState('settings')}
                variant="outline"
                className="w-full h-14 text-xl font-bold border-2 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Icon name="Settings" className="mr-2" size={24} />
                Настройки
              </Button>
            </div>
          </div>
        </Card>
      )}

      {gameState === 'playing' && (
        <div className="relative">
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-lg flex gap-6">
            <div className="flex items-center gap-2">
              <Icon name="Star" className="text-yellow-500" size={24} />
              <span className="text-2xl font-bold">{score}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐦</span>
              <span className="text-2xl font-bold">× {birdsLeft}</span>
            </div>
          </div>
          
          <Button
            onClick={() => setGameState('menu')}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur hover:bg-white shadow-lg"
            size="lg"
          >
            <Icon name="Home" size={24} />
          </Button>

          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="border-4 border-white rounded-3xl shadow-2xl cursor-pointer"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          
          <div className="mt-4 text-center bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-lg">
            <p className="text-lg font-semibold text-gray-700">
              Оттяни птицу и отпусти, чтобы запустить!
            </p>
          </div>
        </div>
      )}

      <Dialog open={gameState === 'levels'} onOpenChange={() => setGameState('menu')}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center">Выбор уровня</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 p-4">
            {levels.map(level => (
              <Button
                key={level.id}
                onClick={() => level.unlocked && startGame()}
                disabled={!level.unlocked}
                className="h-24 flex flex-col items-center justify-center gap-2 relative bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50"
              >
                <span className="text-2xl font-bold">{level.id}</span>
                {level.unlocked && (
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <Icon
                        key={i}
                        name="Star"
                        size={16}
                        className={i < level.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}
                      />
                    ))}
                  </div>
                )}
                {!level.unlocked && (
                  <Icon name="Lock" size={24} className="absolute" />
                )}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={gameState === 'scores'} onOpenChange={() => setGameState('menu')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center">Таблица рекордов</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 p-4">
            {levels.filter(l => l.highScore > 0).map((level, idx) => (
              <div key={level.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-xl">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-primary">#{idx + 1}</span>
                  <span className="font-semibold">Уровень {level.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Star" className="text-yellow-500 fill-yellow-500" size={20} />
                  <span className="text-xl font-bold">{level.highScore}</span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={gameState === 'settings'} onOpenChange={() => setGameState('menu')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center">Настройки</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <span className="font-semibold">Звук</span>
              <Icon name="Volume2" size={24} />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <span className="font-semibold">Музыка</span>
              <Icon name="Music" size={24} />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <span className="font-semibold">Вибрация</span>
              <Icon name="Smartphone" size={24} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={gameState === 'tutorial'} onOpenChange={() => setGameState('menu')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center">Как играть</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Оттяни птицу</h3>
                <p className="text-muted-foreground">Зажми птицу мышкой и оттяни назад</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Целься</h3>
                <p className="text-muted-foreground">Наведи траекторию на зелёных свинок</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Отпусти!</h3>
                <p className="text-muted-foreground">Отпусти мышку и смотри, как птица летит</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="Target" className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Цель</h3>
                <p className="text-muted-foreground">Уничтожь всех свинок и набери максимум очков!</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;