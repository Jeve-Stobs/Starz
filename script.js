const canvas = document.getElementById("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = 1600;
            canvas.height = 900;
            
            let lines = false;
            let vel = false;
            let clr = false;
            
            class Ball {
                static colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
            
                constructor(x, y, r) {
                    this.x = x;
                    this.y = y;
                    this.r = r;
                    
                    this.i = 0;
                    this.c = Ball.colors[this.i];
                    this.canChange = true;
                    this.boost = false;
                    
                    this.yv = 0;
                    this.xv = 0;
                }
                
                update(deltaTime) {
                    this.x += this.xv * deltaTime;
                    this.y += this.yv * deltaTime;
                    
                    this.xv *= 0.99;
                    this.yv *= 0.99;
                    
                    if (Math.abs(this.xv) < 8) this.xv = 0;
                    if (Math.abs(this.yv) < 8) this.yv = 0;
                    
                    if (this.xv < 8 && this.xv) this.xv += 4;
                    if (this.yv < 8 && this.yv) this.yv += 4;
                    if (this.xv > 8 && this.xv) this.xv -= 4;
                    if (this.yv > 8 && this.yv) this.yv -= 4;
                    
                    if (keys["KeyA"] || keys["ArrowLeft"]) this.xv -= 10;
                    if (keys["KeyD"] || keys["ArrowRight"]) this.xv += 10;
                    if (keys["KeyW"] || keys["ArrowUp"]) this.yv -= 10;
                    if (keys["KeyS"] || keys["ArrowDown"]) this.yv += 10;
                    
                    if (this.xv > 300) this.xv = 300;
                    if (this.xv < -300) this.xv = -300;
                    if (this.yv > 300) this.yv = 300;
                    if (this.yv < -300) this.yv = -300;
                    
                    if ((keys["KeyA"] && keys["KeyW"]) ||
                        (keys["KeyA"] && keys["KeyS"]) ||
                        (keys["KeyD"] && keys["KeyW"]) ||
                        (keys["KeyD"] && keys["KeyS"]) ||
                        (keys["ArrorLeft"] && keys["ArrowUp"]) ||
                        (keys["ArrowLeft"] && keys["ArrowDown"]) ||
                        (keys["ArrowRight"] && keys["ArrowUp"]) ||
                        (keys["ArrowRight"] && keys["ArrowDown"])
                    ) {
                        this.yv *= 0.985;
                        this.xv *= 0.985;
                    }
                    
                    if (keys["Space"] && this.canChange) {
                        this.i++;
                        this.c = Ball.colors[this.i % Ball.colors.length];
                        this.canChange = false;
                        this.boost = true;
                        setTimeout(() => this.canChange = true, 1500);
                        setTimeout(() => this.boost = false, 500);
                    }
                    
                    if (this.boost) {
                        this.xv *= 1.25;
                        this.yv *= 1.25;
                    }
                    
                    if (this.x + this.r < 0) {
                        this.x = canvas.width - this.r;
                    } else if (this.x - this.r > canvas.width) {
                        this.x = 0 + this.r;
                    }
                    
                    if (this.y + this.r < 0) {
                        this.y = canvas.height - this.r;
                    } else if (this.y - this.r > canvas.height) {
                        this.y = 0 + this.r;
                    }
                    
                    this.draw();
                }
                
                draw() {
                    ctx.fillStyle = this.c;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
                    ctx.closePath();
                    ctx.fill();
                    
                    if (vel) {
                        ctx.strokeStyle = this.c;
                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y);
                        ctx.lineTo(this.x + this.xv, this.y + this.yv);
                        ctx.closePath();
                        ctx.stroke();
                    }
                }
            }
            
            class Enemy {
                static enemies = [];
            
                constructor(x, y, c, tx, ty) {
                    this.x = x;
                    this.y = y;
                    this.c = c;
                    this.r = 8;
                    this.tx = tx;
                    this.ty = ty;
                }
            
                update(deltaTime) {
                    const dx = this.x - ball.x + this.tx;
                    const dy = this.y - ball.y + this.ty;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    
                    if (this.c === ball.c) {
                        this.x += dx / d;
                        this.y += dy / d;
                    } else {
                        this.x -= dx / d;
                        this.y -= dy / d;
                    }
                    
                    if (this.x + this.r < 0) {
                        this.x = canvas.width - this.r;
                    } else if (this.x - this.r > canvas.width) {
                        this.x = 0 + this.r;
                    }
                    
                    if (this.y + this.r < 0) {
                        this.y = canvas.height - this.r;
                    } else if (this.y - this.r > canvas.height) {
                        this.y = 0 + this.r;
                    }
                    
                    if (ball.boost) {
                        this.x += Math.random() * 2 - 1;
                        this.y += Math.random() * 2 - 1;
                    }
                    
                    this.draw();
                }
            
                draw() {
                    ctx.fillStyle = this.c;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
                    ctx.closePath();
                    ctx.fill();
                    
                    if (lines || (clr && this.c === ball.c)) {
                        ctx.strokeStyle = this.c;
                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y);
                        ctx.lineTo(ball.x - this.tx, ball.y - this.ty);
                        ctx.closePath();
                        ctx.stroke();
                    }
                }
            }
            
            const ball = new Ball(canvas.width / 2, canvas.height / 2, 18);
            
            let deltaTime = 0;
            let lastTime = 0;
            let pts = 0;
            let gameOver = false;
            let frame = 0;
            
            ctx.textAlign = "center";
            
            function animate(ms) {
                if (gameOver) return;
                
                const time = ms / 1000;
                deltaTime = time - lastTime;
                lastTime = time;
                
                ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ball.update(deltaTime);
                
                ctx.font = "16px monospace";
                ctx.fillStyle = "white";
                ctx.fillText(pts, ball.x, ball.y + ball.r / 2 - 3);
                
                Enemy.enemies.forEach((e, i) => {
                    e.update(deltaTime);
                    
                    if (Math.sqrt(Math.pow(e.x - ball.x, 2) + Math.pow(e.y - ball.y, 2)) < e.r + ball.r) {
                        if (ball.c === e.c) {
                            Enemy.enemies.splice(i, 1);
                            pts++;
                        } else {
                            gameOver = true;
                            cancelAnimationFrame(req);
                            ctx.font = "96px monospace";
                            ctx.fillStyle = "lightgreen";
                            ctx.fillText(`game over`, canvas.width / 2, canvas.height / 2);
                            ctx.font = "36px monospace";
                            ctx.fillText(`time: ${Math.floor(frame / 60)} seconds`, canvas.width / 2, canvas.height / 2 + 72);
                            ctx.fillText(`score: ${pts}`, canvas.width / 2, canvas.height / 2 + 128);
                            setTimeout(() => location.reload(), 2500);
                        }
                    }
                });
                
                req = requestAnimationFrame(animate);
                
                frame++;
            }
            
            let req = requestAnimationFrame(animate);
            
            const keys = {};
            
            document.addEventListener("keydown", (e) => {
                if (e.code === "KeyL") lines = !lines;
                if (e.code === "KeyV") vel = !vel;
                if (e.code === "KeyC") clr = !clr;
                keys[e.code] = true;
            });
            
            document.addEventListener("keyup", (e) => {
                delete keys[e.code];
            });
            
            let time = 2500;
            
            function spawn() {
                let x = Math.floor(Math.random() * (canvas.width - 16));
                let y = Math.floor(Math.random() * (canvas.height - 16));
                while (Math.sqrt(Math.pow(x - ball.x, 2) + Math.pow(y - ball.y, 2)) < 256) {
                    x = Math.floor(Math.random() * (canvas.width - 16));
                    y = Math.floor(Math.random() * (canvas.height - 16));
                }
                const enemy = new Enemy(
                    x, 
                    y, 
                    Ball.colors[Math.floor(Math.random() * Ball.colors.length)],
                    Math.round(Math.random() * ball.r * 16 - ball.r * 8),
                    Math.round(Math.random() * ball.r * 16 - ball.r * 8),
                );
                Enemy.enemies.push(enemy);
                time -= 50;
                if (time < 500) time = 500;
                setTimeout(spawn, time);
            }
            
            setTimeout(spawn, time);