/**
 * NETWORK ODYSSEY: THE COMPLETE 12-STAGE LAB
 * V5: Clean Headers & Restored Theory Demonstrations
 */

// --- GLOBAL STATE ---
let camTable = {}; 
let switchPorts = {};
let tableDisplay; 

// --- 1. WELCOME SCENE ---
class SceneWelcome extends Phaser.Scene {
    constructor() { super('SceneWelcome'); }
    create() {
        this.add.text(450, 200, "NETWORK ODYSSEY", { fontSize: '42px', fill: '#00ff00', fontFamily: 'Courier' }).setOrigin(0.5);
        this.add.text(450, 280, "A 12-Stage Journey through the OSI Model", { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
        createButton(this, 450, 400, "START", 0x00aa00, () => this.scene.start('Scene1'));
    }
}

// --- 2. THE SWITCH BASEMENT ---
class Scene1 extends Phaser.Scene {
    constructor() { super('Scene1'); }
    create() {
        initTooltips(this);
        // Feedback 1: No scene numbers in headers
        this.add.text(20, 20, "THE SWITCH BASEMENT (Layer 2)", { fontSize: '20px', fill: '#0f0' });
        camTable = {};
        
        const pcA = createDevice(this, 150, 300, "PC-A", "00:AA:01", 
            "END DEVICE: Generates data frames; CLICK to initiate a transfer; Connects to a Switch Port via Ethernet.");
        const pcB = createDevice(this, 150, 450, "PC-B", "00:BB:02", 
            "END DEVICE: Receives data frames; LISTENS for incoming MAC matches; Connects to Switch Port 2.");
        
        switchPorts['P1'] = createPort(this, 450, 300, "Port-1", 
            "SWITCH PORT: Physical ingress point; AUTOMATICALLY records source MACs; Links PC-A to the switch fabric.");
        switchPorts['P2'] = createPort(this, 450, 450, "Port-2", 
            "SWITCH PORT: Physical egress point; FORWARDS frames if destination is known; Links the switch fabric to PC-B.");
            
        drawWire(this, pcA, switchPorts['P1']);
        drawWire(this, pcB, switchPorts['P2']);
        
        this.add.graphics().fillStyle(0x111111).fillRect(600, 50, 250, 200).lineStyle(1, 0x00ff00).strokeRect(600, 50, 250, 200);
        tableDisplay = this.add.text(610, 60, "CAM TABLE:\nEmpty", {fontSize: '14px', fill: '#0f0', fontFamily: 'Courier'});
        pcA.on('pointerdown', () => this.transfer(pcA, pcB, 'P1', 'P2'));
    }
    transfer(src, dest, inP, outP) {
        let pkt = this.add.circle(src.x, src.y, 8, 0xffff00);
        this.tweens.add({ targets: pkt, x: switchPorts[inP].x, y: switchPorts[inP].y, duration: 600, onComplete: () => {
            if (!camTable[src.getData('mac')]) { camTable[src.getData('mac')] = inP; this.updateTable(); }
            if (camTable[dest.getData('mac')]) {
                this.tweens.add({ targets: pkt, x: dest.x, y: dest.y, duration: 800, onComplete: () => { pkt.destroy(); createNextButton(this, 'Scene1Exp'); }});
            } else {
                alert("DESTINATION UNKNOWN: Flooding all ports...");
                camTable[dest.getData('mac')] = outP; this.updateTable();
                pkt.destroy(); alert("MAC Learned via Flood. Try sending from PC-A again.");
            }
        }});
    }
    updateTable() {
        let s = "CAM TABLE:\n----------\n";
        for(let m in camTable) s += `${m} -> ${camTable[m]}\n`;
        tableDisplay.setText(s);
    }
}

// --- 3. THEORY: MAC LEARNING ---
class Scene1Exp extends Phaser.Scene {
    constructor() { super('Scene1Exp'); }
    create() {
        this.add.text(50, 50, "Theory: MAC Learning", { fontSize: '28px', fill: '#0f0', fontFamily: 'Courier' });
        const explanation = [
            "DETAILED BREAKDOWN:",
            "• At Layer 2 (Data Link), switches use physical MAC addresses to handle traffic.",
            "• LEARNING: When a frame arrives, the switch records the 'Source MAC' and its port.",
            "• FLOODING: If the destination is unknown, the switch broadcasts the frame to find the host.",
            "• FORWARDING: Once the destination is known, the switch sends data only to the relevant port."
        ];
        this.add.text(50, 120, explanation.join('\n\n'), { fontSize: '15px', lineSpacing: 5, wordWrap: { width: 800 } });

        // Feedback 2: Restored Demonstration
        this.add.text(450, 400, "[ DEMONSTRATION: SWITCH FLOODING ]", {fontSize: '14px', fill: '#888'}).setOrigin(0.5);
        const switchBox = this.add.rectangle(450, 480, 50, 50, 0x444444);
        const p1 = this.add.circle(350, 480, 5, 0x00ffff);
        const p2 = this.add.circle(550, 440, 5, 0x00ffff);
        const p3 = this.add.circle(550, 520, 5, 0x00ffff);
        
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                let pkt = this.add.circle(350, 480, 6, 0xffff00);
                this.tweens.add({ targets: pkt, x: 450, duration: 500, onComplete: () => {
                    // Flood effect
                    let pA = this.add.circle(450, 480, 6, 0xffff00);
                    let pB = this.add.circle(450, 480, 6, 0xffff00);
                    this.tweens.add({ targets: pA, x: 550, y: 440, duration: 500, onComplete: () => pA.destroy() });
                    this.tweens.add({ targets: pB, x: 550, y: 520, duration: 500, onComplete: () => pB.destroy() });
                    pkt.destroy();
                }});
            },
            loop: true
        });

        createNextButton(this, 'Scene2');
    }
}

// --- 4. GATEWAY ALPHA ---
class Scene2 extends Phaser.Scene {
    constructor() { super('Scene2'); }
    create() {
        initTooltips(this);
        this.add.text(20, 20, "GATEWAY ALPHA (Layer 3 Routing)", { fontSize: '20px', fill: '#0f0' });
        
        let r1 = createRouter(this, 150, 300, '192.168.1.1', 'Gateway', 
            "ROUTER: Layer 3 boundary device; SELECT a destination hop; Connects different subnets together.");
        let r2 = createRouter(this, 400, 150, '10.0.0.1', 'North Path', 
            "INTERMEDIATE HOP: High-speed relay; CLICK to select this path; Connects Gateway to Target via Fiber.");
        let r3 = createRouter(this, 400, 450, '10.0.0.2', 'South Path', 
            "INTERMEDIATE HOP: Congested copper link; CLICK to select this path; Connects Gateway to Target via older hardware.");
        let r4 = createRouter(this, 650, 300, '172.16.0.1', 'Target Server', 
            "DESTINATION HOST: Final IP endpoint; RECEIVES the IP packet; The end of the routing journey.");

        drawWire(this, r1, r2); drawWire(this, r1, r3); drawWire(this, r2, r4); drawWire(this, r3, r4);
        let p = this.add.rectangle(150, 300, 15, 15, 0xffff00);
        
        r2.on('pointerdown', () => {
            this.tweens.add({ targets: p, x: r2.x, y: r2.y, duration: 600, onComplete: () => {
                this.tweens.add({ targets: p, x: r4.x, y: r4.y, duration: 600, onComplete: () => createNextButton(this, 'Scene2Exp') });
            }});
        });

        r3.on('pointerdown', () => {
            this.tweens.add({ targets: p, x: r3.x, y: r3.y, duration: 1500, onComplete: () => {
                this.tweens.add({ targets: p, x: r4.x, y: r4.y, duration: 1500, onComplete: () => createNextButton(this, 'Scene2Exp') });
            }});
        });
    }
}

// --- 5. THEORY: IP ROUTING ---
class Scene2Exp extends Phaser.Scene {
    constructor() { super('Scene2Exp'); }
    create() {
        this.add.text(50, 50, "Theory: IP Routing", { fontSize: '28px', fill: '#0f0', fontFamily: 'Courier' });
        const explanation = [
            "DETAILED BREAKDOWN:",
            "• Routers use IP addresses to navigate data between different subnets.",
            "• PATH SELECTION: Routers use algorithms like OSPF or BGP to find the 'shortest' or 'fastest' path.",
            "• CONGESTION: As seen in the South Path, high traffic or low bandwidth increases delay.",
            "• GATEWAYS: The default gateway is the 'exit' for any packet leaving the local network."
        ];
        this.add.text(50, 120, explanation.join('\n\n'), { fontSize: '15px', lineSpacing: 5, wordWrap: { width: 800 } });
        createNextButton(this, 'Scene3');
    }
}

// --- 6. THE VPN TUNNEL ---
class Scene3 extends Phaser.Scene {
    constructor() { super('Scene3'); }
    create() {
        initTooltips(this);
        this.add.text(20, 20, "THE VPN TUNNEL (Encapsulation)", { fontSize: '20px', fill: '#0f0' });
        this.enc = false; this.cap = false;

        createButton(this, 300, 250, "ENCRYPT", 0x0044ff, () => { this.enc = true; alert("Payload Scrambled!"); });
        createButton(this, 300, 350, "ENCAPSULATE", 0x00aa00, () => { if(this.enc) { this.cap = true; alert("VPN Header Added!"); } });
        
        let sniffer = this.add.circle(600, 300, 40, 0xff4444).setInteractive();
        setupHover(this, sniffer, "SNIFFER BOT: Malicious actor; CLICK to test your security; Scans traffic for plaintext data.");
        
        sniffer.on('pointerdown', () => {
            if(this.cap) { createNextButton(this, 'Scene3Exp'); }
            else alert("DATA STOLEN: You sent unprotected data!");
        });
    }
}

// --- 7. THEORY: ENCAPSULATION ---
class Scene3Exp extends Phaser.Scene {
    constructor() { super('Scene3Exp'); }
    create() {
        this.add.text(50, 50, "Theory: Encapsulation", { fontSize: '28px', fill: '#0f0', fontFamily: 'Courier' });
        const explanation = [
            "DETAILED BREAKDOWN:",
            "• ENCRYPTION: Secures the 'what' by scrambling the payload.",
            "• ENCAPSULATION: Secures the 'where' by hiding the original destination inside a new IP header.",
            "• VPN GATEWAY: The tunnel ends here, where the outer header is stripped.",
            "• PRIVACY: Your ISP only sees your connection to the VPN server, not the final destination."
        ];
        this.add.text(50, 120, explanation.join('\n\n'), { fontSize: '15px', lineSpacing: 5, wordWrap: { width: 800 } });
        createNextButton(this, 'Scene4');
    }
}

// --- 8. SURPRISE INDEX HAZARD ---
class Scene4 extends Phaser.Scene {
    constructor() { super('Scene4'); }
    create() {
        this.add.text(20, 20, "SURPRISE INDEX (Volatility Hazard)", { fontSize: '20px', fill: '#0f0' });
        this.add.text(450, 300, "NEWS FLASH: MARKET CRASH!\nNetwork Traffic Spiking...", {align:'center'}).setOrigin(0.5);
        for(let i=0; i<60; i++) {
            let spark = this.add.circle(Phaser.Math.Between(100, 800), Phaser.Math.Between(100, 500), 2, 0xff0000);
            this.tweens.add({ targets: spark, alpha: 0, duration: 250, repeat: -1 });
        }
        createNextButton(this, 'Scene4Exp');
    }
}

// --- 9. THEORY: NETWORK LATENCY ---
class Scene4Exp extends Phaser.Scene {
    constructor() { super('Scene4Exp'); }
    create() {
        this.add.text(50, 50, "Theory: Network Latency", { fontSize: '28px', fill: '#0f0', fontFamily: 'Courier' });
        const explanation = [
            "DETAILED BREAKDOWN:",
            "• CONGESTION: When traffic exceeds bandwidth, packets are placed in 'queues' increasing delay.",
            "• JITTER: Irregular arrival times of packets caused by varying levels of network congestion.",
            "• SURPRISE INDEX: Financial news triggers mass trading, creating 'micro-bursts' of traffic.",
            "• DROPPED PACKETS: If a router's buffer is full, it will drop new packets (Tail Drop)."
        ];
        this.add.text(50, 120, explanation.join('\n\n'), { fontSize: '15px', lineSpacing: 5, wordWrap: { width: 800 } });
        createNextButton(this, 'Scene5');
    }
}

// --- 10. THE 3-WAY HANDSHAKE ---
class Scene5 extends Phaser.Scene {
    constructor() { super('Scene5'); }
    create() {
        this.add.text(20, 20, "THE 3-WAY HANDSHAKE (TCP)", { fontSize: '20px', fill: '#0f0' });
        this.step = 0;
        let btn = createButton(this, 450, 400, "SEND SYN", 0x00ffff, () => {
            if(this.step === 0) { alert("SYN SENT!"); btn.setText("SEND ACK"); this.step = 1; }
            else { alert("ACK SENT! Handshake Complete."); createNextButton(this, 'Scene5Exp'); }
        });
    }
}

// --- 11. THEORY: TCP HANDSHAKE ---
class Scene5Exp extends Phaser.Scene {
    constructor() { super('Scene5Exp'); }
    create() {
        this.add.text(50, 50, "Theory: TCP Handshake", { fontSize: '28px', fill: '#0f0', fontFamily: 'Courier' });
        const explanation = [
            "DETAILED BREAKDOWN:",
            "• SYN: The client synchronizes sequence numbers to start the session.",
            "• SYN-ACK: The server acknowledges the request and sends its own sequence number.",
            "• ACK: The final handshake step that confirms the connection is established.",
            "• RELIABILITY: TCP tracks every byte; if the handshake fails, no data is sent."
        ];
        this.add.text(50, 120, explanation.join('\n\n'), { fontSize: '15px', lineSpacing: 5, wordWrap: { width: 800 } });
        createNextButton(this, 'SceneFinish');
    }
}

// --- 12. MISSION COMPLETE ---
class SceneFinish extends Phaser.Scene {
    constructor() { super('SceneFinish'); }
    create() {
        this.add.rectangle(450, 300, 900, 600, 0x003300);
        this.add.text(450, 250, "MISSION COMPLETE", { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(450, 350, "You've mastered the OSI layers!\nCertified Network Engineer.", { fontSize: '18px', align: 'center' }).setOrigin(0.5);
    }
}

// --- UTILITIES ---
function initTooltips(s) {
    s.tooltipBox = s.add.graphics().setDepth(10).setVisible(false);
    s.tooltipText = s.add.text(0, 0, '', { fontSize: '12px', fill: '#fff', backgroundColor: '#000', padding: 8, wordWrap: { width: 220 }}).setDepth(11).setVisible(false);
}
function setupHover(s, o, t) {
    o.on('pointerover', (p) => {
        s.tooltipText.setText(t).setVisible(true).setPosition(p.x + 15, p.y + 15);
        s.tooltipBox.clear().fillStyle(0x000, 0.9).lineStyle(1, 0x0f0).fillRect(p.x+10, p.y+10, 240, 110).setVisible(true);
    });
    o.on('pointerout', () => { s.tooltipText.setVisible(false); s.tooltipBox.setVisible(false); });
}
function createDevice(s, x, y, n, m, d) {
    let c = s.add.circle(x, y, 22, 0x00ffff).setInteractive(); 
    c.setData({ mac: m, desc: d }); s.add.text(x-30, y+25, n); setupHover(s, c, d); return c;
}
function createPort(s, x, y, n, d) {
    let r = s.add.rectangle(x, y, 35, 35, 0x666666).setInteractive();
    s.add.text(x-20, y-35, n); setupHover(s, r, d); return r;
}
function createRouter(s, x, y, ip, n, d) {
    let c = s.add.circle(x, y, 22, 0x00ff00).setInteractive();
    s.add.text(x-25, y+30, n); setupHover(s, c, d); return c;
}
function createButton(s, x, y, txt, col, cb) {
    let b = s.add.rectangle(x, y, 200, 50, col).setInteractive();
    let t = s.add.text(x, y, txt).setOrigin(0.5);
    b.on('pointerdown', cb); return t;
}
function createNextButton(s, next) {
    let b = s.add.rectangle(800, 550, 120, 40, 0x00aa00).setInteractive();
    s.add.text(800, 550, "NEXT →").setOrigin(0.5);
    b.on('pointerdown', () => s.scene.start(next));
}
function drawWire(s, a, b) { s.add.graphics().lineStyle(3, 0x444444).strokeLineShape(new Phaser.Geom.Line(a.x, a.y, b.x, b.y)); }

const config = { type: Phaser.AUTO, width: 900, height: 600, backgroundColor: '#050a10', physics: { default: 'arcade' },
    scene: [SceneWelcome, Scene1, Scene1Exp, Scene2, Scene2Exp, Scene3, Scene3Exp, Scene4, Scene4Exp, Scene5, Scene5Exp, SceneFinish]
};
new Phaser.Game(config);