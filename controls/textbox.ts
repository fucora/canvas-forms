import { Control, ControlEventData } from '../core/control';
import { Event } from '../core/events';

// Fired when a textbox's text changes by user input.
export class TextboxChangeEventData extends ControlEventData {
  constructor(control: Control, readonly text: string) {
    super(control)
  }
}

class _Textbox extends Control {
  text: string;
  change: Event;
  protected elem: HTMLInputElement = null;

  constructor(text?: string) {
    super();

    this.text = text || '';
    this.change = new Event();
  }

  unpaint() {
    if (this.elem) {
      this.elem.remove();
      this.elem = null;
    }
  }

  paint(ctx: CanvasRenderingContext2D) {
    super.paint(ctx);

    if (this.elem && !this.form().allowDom(this)) {
      this.unpaint();
    }
    if (this.elem) {
      this.positionElem();
    }

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, this.w, this.h);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    ctx.strokeRect(0, 0, this.w, this.h);

    if (!this.elem) {
      ctx.font = this.getFont();
      ctx.textBaseline = 'middle';
      ctx.fillStyle = this.getColor();
      ctx.fillText(this.text, 3, this.h / 2);
    }
  }

  createElem() {
    this.elem = document.createElement('input');
    this.elem.type = 'text';
    this.elem.style.position = 'sticky';
    this.elem.style.boxSizing = 'border-box';
    this.elem.style.border = 'none';
    this.elem.style.background = 'none';
    this.elem.style.paddingLeft = '3px';
    this.elem.style.fontSize = this.form().surface.htmlunits(this.getFontSize()) + 'px';
    this.elem.style.fontFamily = this.getFontName();
    this.elem.value = this.text;
    this.elem.addEventListener('input', (ev) => {
      this.text = this.elem.value;
      this.change.fire(new TextboxChangeEventData(this, this.text));
    });
    this.elem.addEventListener('keypress', (ev) => {
      if (ev.keyCode === 13) {
        this.parent.submit();
      }
    });
    this.context().canvas.parentElement.appendChild(this.elem);
  }

  positionElem() {
    this.elem.style.left = this.form().surface.htmlunits(this.surfaceX()) + 'px';
    this.elem.style.top = this.form().surface.htmlunits(this.surfaceY()) + 'px';
    this.elem.style.width = this.form().surface.htmlunits(this.w) + 'px';
    this.elem.style.height = this.form().surface.htmlunits(this.h) + 'px';
  }

  removed() {
    this.unpaint();
  }
}

export class Textbox extends _Textbox {

  constructor(text?: string) {
    super(text);
  }

  paint(ctx: CanvasRenderingContext2D) {
    if (!this.elem && this.form().allowDom(this)) {
      this.createElem();
    }

    super.paint(ctx);
  }
}

export class FocusTextbox extends _Textbox {
  constructor(text?: string) {
    super(text);

    this.mousedown.add(() => {
      this.createElem();
      this.positionElem();
      this.elem.focus();
      this.repaint();
    });
  }
}
