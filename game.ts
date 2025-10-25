// Snake and Ladder Game - TypeScript Implementation

interface Player {
    id: number;
    name: string;
    position: number;
    score: number;
    color: string;
}

interface GameState {
    players: Player[];
    currentPlayerIndex: number;
    gameStarted: boolean;
    gameEnded: boolean;
    winner: Player | null;
}

interface SnakeLadder {
    start: number;
    end: number;
    type: 'snake' | 'ladder';
}

class SnakeLadderGame {
    private gameState: GameState;
    private board: HTMLElement;
    private dice: HTMLElement;
    private rollBtn: HTMLElement;
    private currentPlayerName: HTMLElement;
    private currentScore: HTMLElement;
    private currentPosition: HTMLElement;
    private playerCards: HTMLElement;
    private winnerModal: HTMLElement;
    private playAgainBtn: HTMLElement;
    private newGameBtn: HTMLElement;
    private resetBtn: HTMLElement;
    private playerSelection: HTMLElement;
    private gameBoard: HTMLElement;

    // Snake and Ladder positions
    private snakesAndLadders: SnakeLadder[] = [
        // Ladders (going up)
        { start: 2, end: 23, type: 'ladder' },
        { start: 4, end: 14, type: 'ladder' },
        { start: 8, end: 30, type: 'ladder' },
        { start: 21, end: 42, type: 'ladder' },
        { start: 28, end: 76, type: 'ladder' },
        { start: 50, end: 67, type: 'ladder' },
        { start: 71, end: 92, type: 'ladder' },
        { start: 80, end: 99, type: 'ladder' },
        
        // Snakes (going down)
        { start: 32, end: 10, type: 'snake' },
        { start: 36, end: 6, type: 'snake' },
        { start: 48, end: 26, type: 'snake' },
        { start: 62, end: 18, type: 'snake' },
        { start: 88, end: 24, type: 'snake' },
        { start: 95, end: 56, type: 'snake' },
        { start: 97, end: 78, type: 'snake' }
    ];

    private playerColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];

    constructor() {
        this.gameState = {
            players: [],
            currentPlayerIndex: 0,
            gameStarted: false,
            gameEnded: false,
            winner: null
        };

        this.initializeElements();
        this.setupEventListeners();
        this.generateBoard();
    }

    private initializeElements(): void {
        this.board = document.getElementById('board') as HTMLElement;
        this.dice = document.getElementById('dice') as HTMLElement;
        this.rollBtn = document.getElementById('rollBtn') as HTMLElement;
        this.currentPlayerName = document.getElementById('currentPlayerName') as HTMLElement;
        this.currentScore = document.getElementById('currentScore') as HTMLElement;
        this.currentPosition = document.getElementById('currentPosition') as HTMLElement;
        this.playerCards = document.getElementById('playerCards') as HTMLElement;
        this.winnerModal = document.getElementById('winnerModal') as HTMLElement;
        this.playAgainBtn = document.getElementById('playAgainBtn') as HTMLElement;
        this.newGameBtn = document.getElementById('newGameBtn') as HTMLElement;
        this.resetBtn = document.getElementById('resetBtn') as HTMLElement;
        this.playerSelection = document.getElementById('playerSelection') as HTMLElement;
        this.gameBoard = document.getElementById('gameBoard') as HTMLElement;
    }

    private setupEventListeners(): void {
        // Player selection buttons
        document.querySelectorAll('.player-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const numPlayers = parseInt(target.dataset.players || '1');
                this.startGame(numPlayers);
            });
        });

        // Roll dice button
        this.rollBtn.addEventListener('click', () => {
            this.rollDice();
        });

        // Game control buttons
        this.newGameBtn.addEventListener('click', () => {
            this.showPlayerSelection();
        });

        this.resetBtn.addEventListener('click', () => {
            this.resetGame();
        });

        this.playAgainBtn.addEventListener('click', () => {
            this.hideWinnerModal();
            this.showPlayerSelection();
        });
    }

    private generateBoard(): void {
        this.board.innerHTML = '';
        
        // Generate 100 cells (10x10 grid)
        for (let i = 100; i >= 1; i--) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = i.toString();
            cell.id = `cell-${i}`;
            
            // Check if this cell has a snake or ladder
            const snakeLadder = this.snakesAndLadders.find(sl => sl.start === i);
            if (snakeLadder) {
                cell.classList.add(snakeLadder.type);
                cell.classList.add(`${snakeLadder.type}-indicator`);
            }
            
            this.board.appendChild(cell);
        }
    }

    private startGame(numPlayers: number): void {
        this.gameState.players = [];
        
        // Create players
        for (let i = 0; i < numPlayers; i++) {
            this.gameState.players.push({
                id: i + 1,
                name: `Player ${i + 1}`,
                position: 1,
                score: 0,
                color: this.playerColors[i]
            });
        }

        this.gameState.currentPlayerIndex = 0;
        this.gameState.gameStarted = true;
        this.gameState.gameEnded = false;
        this.gameState.winner = null;

        this.hidePlayerSelection();
        this.showGameBoard();
        this.updatePlayerCards();
        this.updateCurrentPlayer();
        this.updateGameStats();
        this.placePlayerTokens();
    }

    private hidePlayerSelection(): void {
        this.playerSelection.style.display = 'none';
    }

    private showPlayerSelection(): void {
        this.playerSelection.style.display = 'block';
        this.gameBoard.style.display = 'none';
        this.hideWinnerModal();
    }

    private showGameBoard(): void {
        this.gameBoard.style.display = 'block';
    }

    private hideWinnerModal(): void {
        this.winnerModal.style.display = 'none';
    }

    private showWinnerModal(winner: Player): void {
        const winnerText = document.getElementById('winnerText') as HTMLElement;
        winnerText.textContent = `${winner.name} Wins!`;
        this.winnerModal.style.display = 'flex';
    }

    private updatePlayerCards(): void {
        this.playerCards.innerHTML = '';
        
        this.gameState.players.forEach((player, index) => {
            const card = document.createElement('div');
            card.className = 'player-card';
            if (index === this.gameState.currentPlayerIndex) {
                card.classList.add('active');
            }
            
            card.innerHTML = `
                <div class="player-color" style="background-color: ${player.color}"></div>
                <h4>${player.name}</h4>
                <div class="player-score">Score: ${player.score}</div>
                <div class="player-position">Position: ${player.position}</div>
            `;
            
            this.playerCards.appendChild(card);
        });
    }

    private updateCurrentPlayer(): void {
        const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
        this.currentPlayerName.textContent = currentPlayer.name;
        this.currentPlayerName.style.color = currentPlayer.color;
    }

    private updateGameStats(): void {
        const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
        this.currentScore.textContent = currentPlayer.score.toString();
        this.currentPosition.textContent = currentPlayer.position.toString();
    }

    private placePlayerTokens(): void {
        // Remove existing tokens
        document.querySelectorAll('.player-token').forEach(token => {
            token.remove();
        });

        // Place tokens for all players
        this.gameState.players.forEach(player => {
            const cell = document.getElementById(`cell-${player.position}`);
            if (cell) {
                const token = document.createElement('div');
                token.className = `player-token player-${player.id}`;
                token.style.backgroundColor = player.color;
                cell.appendChild(token);
            }
        });
    }

    private rollDice(): void {
        if (this.gameState.gameEnded) return;

        // Disable roll button during animation
        (this.rollBtn as HTMLButtonElement).disabled = true;
        
        // Add rolling animation
        this.dice.classList.add('rolling');
        
        // Generate random dice value (1-6)
        const diceValue = Math.floor(Math.random() * 6) + 1;
        
        // Update dice display
        setTimeout(() => {
            this.dice.classList.remove('rolling');
            this.dice.textContent = diceValue.toString();
            
            // Move player
            this.movePlayer(diceValue);
            
            // Re-enable roll button
            (this.rollBtn as HTMLButtonElement).disabled = false;
        }, 1000);
    }

    private movePlayer(diceValue: number): void {
        const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
        const newPosition = Math.min(currentPlayer.position + diceValue, 100);
        
        // Update player position
        currentPlayer.position = newPosition;
        currentPlayer.score += diceValue;
        
        // Check for snake or ladder
        const snakeLadder = this.snakesAndLadders.find(sl => sl.start === newPosition);
        if (snakeLadder) {
            currentPlayer.position = snakeLadder.end;
            
            // Show snake/ladder effect
            this.showSnakeLadderEffect(snakeLadder, currentPlayer);
        }
        
        // Update UI
        this.updateGameStats();
        this.updatePlayerCards();
        this.placePlayerTokens();
        
        // Check for win condition
        if (currentPlayer.position >= 100) {
            this.gameState.gameEnded = true;
            this.gameState.winner = currentPlayer;
            setTimeout(() => {
                this.showWinnerModal(currentPlayer);
            }, 1000);
            return;
        }
        
        // Move to next player
        this.nextPlayer();
    }

    private showSnakeLadderEffect(snakeLadder: SnakeLadder, player: Player): void {
        const startCell = document.getElementById(`cell-${snakeLadder.start}`);
        const endCell = document.getElementById(`cell-${snakeLadder.end}`);
        
        if (startCell && endCell) {
            // Add visual effect
            startCell.style.animation = 'pulse 0.5s ease';
            endCell.style.animation = 'pulse 0.5s ease';
            
            setTimeout(() => {
                startCell.style.animation = '';
                endCell.style.animation = '';
            }, 500);
        }
    }

    private nextPlayer(): void {
        this.gameState.currentPlayerIndex = (this.gameState.currentPlayerIndex + 1) % this.gameState.players.length;
        this.updateCurrentPlayer();
        this.updateGameStats();
        this.updatePlayerCards();
    }

    private resetGame(): void {
        this.gameState.players.forEach(player => {
            player.position = 1;
            player.score = 0;
        });
        
        this.gameState.currentPlayerIndex = 0;
        this.gameState.gameEnded = false;
        this.gameState.winner = null;
        
        this.updateCurrentPlayer();
        this.updateGameStats();
        this.updatePlayerCards();
        this.placePlayerTokens();
        
        // Reset dice
        this.dice.textContent = '🎲';
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SnakeLadderGame();
});

// Add CSS animation for pulse effect
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

