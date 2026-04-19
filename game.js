/**
 * NETWORK ODYSSEY: 2D Adventure Logic
 * Features: TCP/UDP Physics, TTL, Routing, and Handshaking
 */

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#050a10', // Dark tech aesthetic
    physics: { default: 'arcade' },
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);

// Game State
let player;
let routers;
let wires;
let currentProtocol = 'TCP'; // Initial protocol
let ttl = 8;
let hudText;

function preload() {
    // We are using basic shapes, so no external assets are needed to start!
}

function create() {
    // 1. Create the UI / HUD
    const sidebar = this.add.graphics();
    sidebar.fillStyle(0x111111, 1);
    sidebar.fillRect(600, 0, 200, 600);

    hudText = this.add.text(610, 20, '', { fontSize: '14px', fill: '#00ff00', fontFamily: 'Courier' });

    // 2. Define our Network Nodes (Routers)
    routers = this.add.group();

    // The Basement (Level 1 Start)
    const r1 = createRouter(this, 100, 300, '192.168.1.1', 'The Basement');
    const r2 = createRouter(this, 300, 150, '10.0.0.5', 'Gateway Alpha');
    const r3 = createRouter(this, 300, 450, '10.0.0.9', 'Gateway Beta');
    const r4 = createRouter(this, 500, 300, '172.16.0.1', 'The Deep'); // Final Boss Gate

    // 3. Define Connections (Neighbors)
    r1.setData('neighbors', [r2, r3]);
    r2.setData('neighbors', [r1, r4]);
    r3.setData('neighbors', [r1, r4]);
    r4.setData('neighbors', [r2, r3]);

    // Draw Wires (Visual Edges)
    drawWire(this, r1, r2);
    drawWire(this, r1, r3);
    drawWire(this, r2, r4);
    drawWire(this, r3, r4);

    // 4. Create the Packet (Player)
    player = this.add.rectangle(100, 300, 20, 20, 0x00ffff);
    this.physics.add.existing(player);
    player.setData('currentNode', r1);

    // 5. Interaction: Clicking a Router to "Hop"
    this.input.on('gameobjectdown', (pointer, gameObject) => {
        if (gameObject.getData('type') === 'router') {
            attemptMove(this, gameObject);
        }
    });

    // 6. Protocol Toggle Buttons
    createButton(this, 620, 450, 'Use TCP', 0x0000ff, () => { currentProtocol = 'TCP'; });
    createButton(this, 620, 500, 'Use UDP', 0xff0000, () => { currentProtocol = 'UDP'; });

    updateHUD();
}

// --- LOGIC FUNCTIONS ---

function attemptMove(scene, targetRouter) {
    const currentNode = player.getData('currentNode');
    const neighbors = currentNode.getData('neighbors');

    if (neighbors.includes(targetRouter)) {
        if (currentProtocol === 'TCP') {
            // TCP HANDSHAKE SIMULATION
            console.log("TCP Handshake: SYN -> SYN/ACK -> ACK");
            // Add a small delay for reliability overhead
            scene.time.delayedCall(300, () => executeMove(scene, targetRouter));
        } else {
            // UDP: Move instantly and faster
            executeMove(scene, targetRouter, 200); 
        }
    } else {
        scene.cameras.main.shake(100, 0.005); // Error feedback
    }
}

function executeMove(scene, target, duration = 600) {
    ttl -= 1;
    
    scene.tweens.add({
        targets: player,
        x: target.x,
        y: target.y,
        duration: currentProtocol === 'UDP' ? 300 : 600, // UDP is faster
        onComplete: () => {
            player.setData('currentNode', target);
            updateHUD();
            checkWin(target);
        }
    });
}

function updateHUD() {
    hudText.setText([
        'PACKET INSPECTOR',
        '----------------',
        `PROTOCOL: ${currentProtocol}`,
        `TTL: ${ttl}`,
        `LOC: ${player.getData('currentNode').getData('ip')}`,
        '',
        currentProtocol === 'TCP' ? '🟦 RELIABLE\n(Slower/Handshake)' : '🟥 UNRELIABLE\n(Fast/No Guarantee)'
    ]);
}

function checkWin(node) {
    if (node.getData('ip') === '172.16.0.1') {
        alert("Success! Packet delivered to The Deep.");
        location.reload();
    }
    if (ttl <= 0) {
        alert("Game Over: TTL Expired (Packet Dropped)");
        location.reload();
    }
}

// --- HELPER UI FUNCTIONS ---

function createRouter(scene, x, y, ip, name) {
    const router = scene.add.circle(x, y, 15, 0x00ff00).setInteractive();
    router.setData('type', 'router');
    router.setData('ip', ip);
    router.setData('name', name);
    
    scene.add.text(x - 40, y + 20, name, { fontSize: '10px', fill: '#ffffff' });
    return router;
}

function drawWire(scene, start, end) {
    const line = new Phaser.Geom.Line(start.x, start.y, end.x, end.y);
    const graphics = scene.add.graphics();
    graphics.lineStyle(2, 0x333333);
    graphics.strokeLineShape(line);
}

function createButton(scene, x, y, label, color, callback) {
    const btn = scene.add.rectangle(x, y, 160, 40, color).setOrigin(0).setInteractive();
    scene.add.text(x + 10, y + 10, label, { fontSize: '14px', fill: '#fff' });
    btn.on('pointerdown', callback);
}

function update() {
    // Dynamic visual for the "Surprise Index" (Congestion)
    // Could add floating red particles here to represent traffic
}