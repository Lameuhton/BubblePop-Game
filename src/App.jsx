import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // États du jeu
  const [bubbles, setBubbles] = useState([])          // Liste des bulles actives
  const [score, setScore] = useState(0)               // Score actuel
  const [gameStarted, setGameStarted] = useState(false) // État de démarrage du jeu
  const [isPaused, setIsPaused] = useState(false)     // État de pause
  const [highScore, setHighScore] = useState(0)       // Meilleur score
  const [level, setLevel] = useState(1)               // Niveau actuel
  const [combo, setCombo] = useState(0)               // Compteur de combo
  const [lastPopTime, setLastPopTime] = useState(0)   // Temps du dernier pop pour le calcul des combos
  const [timeLeft, setTimeLeft] = useState(60)        // Temps restant en secondes
  const [gameOver, setGameOver] = useState(false)     // État de fin de partie

  // Couleurs disponibles pour les bulles
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5']

  // Création d'une nouvelle bulle avec des propriétés aléatoires
  const createBubble = () => {
    const bubble = {
      id: Math.random(),                              // Identifiant unique
      x: Math.random() * (window.innerWidth - 100),   // Position X aléatoire
      y: Math.random() * (window.innerHeight - 100),  // Position Y aléatoire
      size: Math.random() * (80 - 30) + 30,          // Taille aléatoire entre 30 et 80
      color: colors[Math.floor(Math.random() * colors.length)], // Couleur aléatoire
      points: Math.floor(Math.random() * 3) + 1,      // Points: 1 à 3
    }
    setBubbles(prev => [...prev, bubble])
  }

  // Gestion du clic sur une bulle
  const popBubble = (bubble) => {
    // Supprime la bulle cliquée
    setBubbles(prev => prev.filter(b => b.id !== bubble.id))
    
    const now = Date.now()
    const timeDiff = now - lastPopTime
    
    // Système de combo: incrémente si moins d'une seconde entre deux pops
    if (timeDiff < 1000) {
      setCombo(prev => prev + 1)
    } else {
      setCombo(0)
    }
    
    // Calcul des points avec bonus de combo
    const comboPoints = Math.floor(combo / 3)         // Bonus tous les 3 combos
    const points = bubble.points + comboPoints
    
    // Mise à jour du score et du record
    setScore(prev => {
      const newScore = prev + points
      if (newScore > highScore) {
        setHighScore(newScore)
      }
      return newScore
    })
    
    setLastPopTime(now)
  }

  // Initialisation d'une nouvelle partie
  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setBubbles([])
    setIsPaused(false)
    setLevel(1)
    setCombo(0)
    setTimeLeft(60)
    setGameOver(false)
  }

  // Basculement de l'état de pause
  const togglePause = () => {
    setIsPaused(prev => !prev)
  }

  // Effet pour la création automatique des bulles
  useEffect(() => {
    if (gameStarted && !isPaused && !gameOver) {
      const interval = setInterval(createBubble, Math.max(1000 - (level * 100), 400))
      return () => clearInterval(interval)
    }
  }, [gameStarted, isPaused, level, gameOver])

  // Effet pour l'augmentation du niveau
  useEffect(() => {
    if (score > 0 && score % 10 === 0) {
      setLevel(prev => prev + 1)
    }
  }, [score])

  // Effet pour le compte à rebours
  useEffect(() => {
    if (gameStarted && !isPaused && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameOver(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [gameStarted, isPaused, gameOver])

  // Gestion des touches du clavier (espace pour pause)
  const handleKeyPress = (event) => {
    if (event.code === 'Space') {
      event.preventDefault()
      togglePause()
    }
  }

  // Effet pour l'écoute des touches du clavier
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div className="game-container">
      {/* Écran de démarrage */}
      {!gameStarted ? (
        <div className="start-screen">
          <h1>Bubble Pop!</h1>
          <p>Cliquez sur les bulles pour les faire éclater !</p>
          <p className="instructions">
            Espace = Pause<br/>
            Combo = Points bonus<br/>
            Temps limite: 60 secondes<br/>
            Record: {highScore}
          </p>
          <button className="start-button" onClick={startGame}>
            Commencer le jeu
          </button>
        </div>
      ) : (
        <>
          {/* Interface de jeu */}
          <div className="game-info">
            <div className="score">Score: {score}</div>
            <div className="level">Niveau: {level}</div>
            <div className="combo">Combo: {combo}</div>
            <div className="timer">Temps: {timeLeft}s</div>
            <button className="pause-button-top" onClick={togglePause}>
              {isPaused ? 'Reprendre' : 'Pause'}
            </button>
          </div>
          <button className="reset-button" onClick={() => setGameStarted(false)}>
            Réinitialiser
          </button>

          {/* Écran de pause ou de fin de partie */}
          {(isPaused || gameOver) && (
            <div className="pause-screen">
              <h2>{gameOver ? 'Partie terminée!' : 'PAUSE'}</h2>
              {gameOver ? (
                <>
                  <p>Score final: {score}</p>
                  <button className="start-button" onClick={startGame}>
                    Rejouer
                  </button>
                </>
              ) : (
                <>
                  <p>Cliquez sur le bouton "Reprendre" ou appuyez sur Espace pour continuer</p>
                  <button className="start-button" onClick={togglePause}>
                    Reprendre
                  </button>
                </>
              )}
            </div>
          )}

          {/* Affichage des bulles */}
          {!isPaused && !gameOver && bubbles.map(bubble => (
            <div
              key={bubble.id}
              className="bubble"
              style={{
                left: bubble.x,
                top: bubble.y,
                width: bubble.size,
                height: bubble.size,
                backgroundColor: bubble.color,
              }}
              onClick={() => popBubble(bubble)}
            >
              <span className="bubble-points">{bubble.points}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default App