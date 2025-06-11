import { Scene } from 'phaser';

export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;

        // Add title
        this.add.text(centerX, centerY - 150, 'SMASH AND CRASH - A GENTLEMAN RACING GAME', {
            fontFamily: 'norwester',
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Add name input field
        const nameLabel = this.add.text(centerX, centerY - 100, 'ENTER YOUR NAME:', {
            fontFamily: 'norwester',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Create an HTML input element with a container div for better positioning
        const inputContainer = this.add.dom(centerX - 40, centerY - 70).createFromHTML(`
    <div style="
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 250px;
        text-align: center;
    ">
        <input
            type="text"
            name="nameField"
            placeholder="Your Name"
            maxlength="15"
            style="
                padding: 12px 15px;
                border: 3px solid #2c76c9;
                border-radius: 8px;
                background-color: rgba(255, 255, 255, 0.9);
                color: #2c76c9;
                width: 100%;
                font-size: 20px;
                text-align: center;
                font-family: norwester;
                outline: none;
                transition: all 0.3s ease;
            "
        >
    </div>
`);

        // After the name input container, add the number input
        const numberContainer = this.add.dom(centerX + 140, centerY - 70).createFromHTML(`
    <div style="
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        text-align: center;
    ">
        <input
            type="text"
            name="carNumber"
            placeholder="##"
            maxlength="2"
            style="
                padding: 12px 15px;
                border: 3px solid #2c76c9;
                border-radius: 8px;
                background-color: rgba(255, 255, 255, 0.9);
                color: #2c76c9;
                width: 100%;
                font-size: 20px;
                text-align: center;
                font-family: norwester;
                outline: none;
                transition: all 0.3s ease;
            "
        >
    </div>
`);

        // Get reference to the actual input element
        const nameInput = /** @type {HTMLInputElement} */ (inputContainer.getChildByName('nameField'));

        // Get reference to the number input element
        const numberInput = /** @type {HTMLInputElement} */ (numberContainer.getChildByName('carNumber'));

        // Set up input validation
        if (nameInput) {
            nameInput.addEventListener('input', (event) => {
                const inputElement = /** @type {HTMLInputElement} */ (event.target);
                let value = inputElement.value;

                // Only allow letters, numbers, and spaces
                value = value.replace(/[^A-Za-z0-9\s]/g, '');
                
                // Auto-capitalize first letter
                if (value && value !== value.charAt(0).toUpperCase() + value.slice(1)) {
                    value = value.charAt(0).toUpperCase() + value.slice(1);
                }

                inputElement.value = value;
            });

            // Add hover and focus effects
            nameInput.addEventListener('mouseenter', () => {
                nameInput.style.borderColor = '#3d8ae0';
            });
            nameInput.addEventListener('mouseleave', () => {
                if (document.activeElement !== nameInput) {
                    nameInput.style.borderColor = '#2c76c9';
                }
            });
            nameInput.addEventListener('focus', () => {
                nameInput.style.transform = 'scale(1.05)';
                nameInput.style.borderColor = '#3d8ae0';
                nameInput.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.3)';
            });
            nameInput.addEventListener('blur', () => {
                nameInput.style.transform = 'scale(1)';
                nameInput.style.borderColor = '#2c76c9';
                nameInput.style.boxShadow = 'none';
            });

            // Focus the input
            setTimeout(() => nameInput.focus(), 100);
        }

        // Set up number input validation
        if (numberInput) {
            numberInput.addEventListener('input', (event) => {
                const inputElement = /** @type {HTMLInputElement} */ (event.target);
                let value = inputElement.value;

                // Only allow numbers
                value = value.replace(/[^0-9]/g, '');
                
                // Limit to 2 digits
                if (value.length > 2) {
                    value = value.slice(0, 2);
                }

                inputElement.value = value;
            });

            // Add hover and focus effects
            numberInput.addEventListener('mouseenter', () => {
                numberInput.style.borderColor = '#3d8ae0';
            });
            numberInput.addEventListener('mouseleave', () => {
                if (document.activeElement !== numberInput) {
                    numberInput.style.borderColor = '#2c76c9';
                }
            });
            numberInput.addEventListener('focus', () => {
                numberInput.style.transform = 'scale(1.05)';
                numberInput.style.borderColor = '#3d8ae0';
                numberInput.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.3)';
            });
            numberInput.addEventListener('blur', () => {
                numberInput.style.transform = 'scale(1)';
                numberInput.style.borderColor = '#2c76c9';
                numberInput.style.boxShadow = 'none';
                
                // Pad with leading zero if single digit
                if (numberInput.value.length === 1) {
                    numberInput.value = '0' + numberInput.value;
                }
            });
        }

        // Create buttons with hover effects
        const buttonStyle = {
            fontFamily: 'DraftBeer',
            fontSize: '36px',
            color: '#ffffff',
            backgroundColor: '#2c76c9',
            padding: {
                left: 25,
                right: 25,
                top: 15,
                bottom: 15
            },
            fixedWidth: 300
        };
        
        // Add game mode selection header
        this.add.text(centerX, centerY - 20, 'SELECT GAME MODE', {
            fontFamily: 'norwester',
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // BOTS mode button (single player vs AI)
        const botsButton = this.add.text(centerX - 160, centerY + 40, 'BOTS', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => botsButton.setStyle({ backgroundColor: '#3d8ae0' }))
            .on('pointerout', () => botsButton.setStyle({ backgroundColor: '#2c76c9' }))
            .on('pointerdown', () => {
                const name = nameInput.value.trim() || 'Player';
                const number = numberInput.value.padStart(2, '0') || '00';
                this.registry.set('playerName', name);
                this.registry.set('carNumber', number);
                this.registry.set('gameMode', 'bots');
                this.scene.start('Game');
            });

        // MULTIPLAYER mode button (future implementation)
        const multiplayerButton = this.add.text(centerX + 160, centerY + 40, 'MULTIPLAYER', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => multiplayerButton.setStyle({ backgroundColor: '#3d8ae0' }))
            .on('pointerout', () => multiplayerButton.setStyle({ backgroundColor: '#2c76c9' }))
            .on('pointerdown', () => {
                // For now, show a "coming soon" message
                this.add.text(centerX, centerY + 120, 'MULTIPLAYER COMING SOON!', {
                    fontFamily: 'norwester',
                    fontSize: '20px',
                    color: '#ff6b6b',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
                
                // Remove the message after 2 seconds
                this.time.delayedCall(2000, () => {
                    this.scene.restart();
                });
            });
        
        // Derby mode button (keep existing functionality)
        const derbyButton = this.add.text(centerX, centerY + 140, 'Derby Mode', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => derbyButton.setStyle({ backgroundColor: '#3d8ae0' }))
            .on('pointerout', () => derbyButton.setStyle({ backgroundColor: '#2c76c9' }))
            .on('pointerdown', () => {
                const name = nameInput.value.trim() || 'Player';
                const number = numberInput.value.padStart(2, '0') || '00';
                this.registry.set('playerName', name);
                this.registry.set('carNumber', number);
                this.registry.set('gameMode', 'derby');
                this.scene.start('Derby');
                this.scene.start('Game');
            });

        // Handle Enter key to start BOTS mode as default
        inputContainer.addListener('keyup');
        inputContainer.on('keyup', (event) => {
            if (event.key === 'Enter') {
                const name = nameInput.value.trim() || 'Player';
                const number = numberInput.value.padStart(2, '0') || '00';
                this.registry.set('playerName', name);
                this.registry.set('carNumber', number);
                this.registry.set('gameMode', 'bots');
                this.scene.start('Game');
            }
        });

        // Derby mode button (keep existing functionality)
        const graphicTest = this.add.text(centerX, centerY + 140, 'Graphic Test', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => derbyButton.setStyle({ backgroundColor: '#3d8ae0' }))
            .on('pointerout', () => derbyButton.setStyle({ backgroundColor: '#2c76c9' }))
            .on('pointerdown', () => {
                const name = nameInput.value.trim() || 'Player';
                const number = numberInput.value.padStart(2, '0') || '00';
                this.registry.set('playerName', name);
                this.registry.set('carNumber', number);
                //this.registry.set('gameMode', 'derby');
                this.scene.start('Game');
            });
    }
}