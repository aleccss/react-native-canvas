const scale = ratio => item => {
  if (typeof item === 'number') {
    return item * ratio;
  }
  return item;
};

/**
 * Extracted from https://github.com/component/autoscale-canvas
 * @param {Canvas} canvas 
 * @return {Canvas}
 */
window.autoScaleCanvas = function autoScaleCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const ratio = window.devicePixelRatio || 1;
  if (ratio != 1) {
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    canvas.width *= ratio;
    canvas.height *= ratio;
    ctx.scale(ratio, ratio);
    ctx.isPointInPath = (...args) =>
      CanvasRenderingContext2D.prototype.isPointInPath.apply(ctx, args.map(scale(ratio)));
  }
  return canvas;
};

function drawEllipse(ctx, x, y, w, h) {
    let k = 0.5522848;
    let ox = ((w / 2) * k);
    let oy = ((h / 2) * k);
    let xe = (x + w);
    let ye = (y + h);
    let xm = (x + (w / 2));
    let ym = (y + (h / 2));
    ctx.beginPath();
    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, (ym - oy), (xm - ox), y, xm, y);
    ctx.bezierCurveTo((xm + ox), y, xe, (ym - oy), xe, ym);
    ctx.bezierCurveTo(xe, (ym + oy), (xm + ox), ye, xm, ye);
    ctx.bezierCurveTo((xm - ox), ye, x, (ym + oy), x, ym);
    ctx.stroke();
}

function drawHandle(ctx, x, y) {
    let t = 12;
    ctx.lineWidth = 2;
    ctx.save();
    ctx.beginPath();
    ctx.translate(x - 6, y - 6);
    drawEllipse(ctx, 0, 0, t, t);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}

function drawHandles(ctx, x1, x2, y1, y2) {
    // small rectangles on corners
    drawHandle(ctx, x1, y1)
    drawHandle(ctx, x2, y1)
    drawHandle(ctx, x1, y2)
    drawHandle(ctx, x2, y2)

    // small rectangles on sides
    drawHandle(ctx, (((x2 - x1) / 2) + x1), y1);
    drawHandle(ctx, x1, (((y2 - y1) / 2) + y1));
    drawHandle(ctx, (((x2 - x1) / 2) + x1), y2);
    drawHandle(ctx, x2, (((y2 - y1) / 2) + y1));
}

function drawArrowHead(ctx, x, y, radians, color) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.save();
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.rotate(radians);
    ctx.moveTo(0, -8);
    ctx.lineTo(12, 30);
    ctx.lineTo(-12, 30);
    ctx.closePath();
    ctx.restore();
    ctx.fill();
}


CanvasRenderingContext2D.prototype.drawCircle = function(x1, y1, x2, y2, color, thickness) {
    this.lineWidth = thickness;
    this.strokeStyle = color;
    drawEllipse(this, x1, y1, (x2 - x1), (y2 - y1));
};

CanvasRenderingContext2D.prototype.drawCircleInEdit = function(x1, y1, x2, y2, color, thickness) {
    this.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawCircle(x1, y1, x2, y2, color, thickness);
    this.stroke();
    this.fillStyle = color;
    drawHandles(this, x1, x2, y1, y2);
};

CanvasRenderingContext2D.prototype.drawArrow = function(x1, y1, x2, y2, color, thickness) {
    this.lineWidth = thickness;
    this.strokeStyle = color;
    this.beginPath();
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.stroke();
    this.restore();

    let rad = Math.atan((y2 - y1) / (x2 - x1));
    let startRadians = rad + (((Math.PI / 180) * ((x2 > x1) ? -90 : 90)));
    drawArrowHead(this, x1, y1, startRadians, color);
};

CanvasRenderingContext2D.prototype.drawArrowInEdit = function(x1, y1, x2, y2, color, thickness) {
    this.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawArrow(x1, y1, x2, y2, color, thickness);
    this.fillStyle = color;
    drawHandle(this, x1, y1);
    drawHandle(this, x2, y2);
};

CanvasRenderingContext2D.prototype.drawRect = function(x1, y1, x2, y2, color, thickness) {
    this.strokeStyle = color;
    this.lineWidth = thickness;
    this.strokeRect(x1, y1, (x2 - x1), (y2 - y1), color, thickness);
};

CanvasRenderingContext2D.prototype.drawRectInEdit = function(x1, y1, x2, y2, color, thickness) {
    this.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.strokeStyle = color;
    this.lineWidth = thickness;
    this.strokeRect(x1, y1, (x2 - x1), (y2 - y1), color, thickness);
    this.fillStyle = color;
    drawHandles(this, x1, x2, y1, y2);
};

CanvasRenderingContext2D.prototype.drawOption = function(x1, y1, x2, y2, color, thickness) {
    this.strokeStyle = "black";
    this.lineWidth = thickness;
    this.save();
    this.fillStyle = color;
    drawEllipse(this, x1, y1, (x2 - x1), (y2 - y1));
    this.fill();
    this.restore();
};

CanvasRenderingContext2D.prototype.drawText = function(x1, y1, x2, y2, color, text) {
    this.fillStyle = color;
    this.font = "bold 30px Avenir Next";
    for (let i = 0; i < text.length; i++) {
        let item = text[i];
        let line = item.line;
        let size = item.size;
        let total = item.total;
        let x;
        if (text.length === 1 || ((x2 - x1) - size) === 0) {
            x = x1;
        } else {
            x = (x1 + (((x2 - x1) - size) / 2));
        }
        this.fillText(line, x, total);
    }
};
