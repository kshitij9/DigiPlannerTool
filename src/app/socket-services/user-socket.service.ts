import { Injectable } from '@angular/core';
import { GroupService } from '../user-board-services/group.service';
import { ShapeService } from '../user-board-services/shape.service';
import { fabric } from 'fabric';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class UserSocketService {
  roomId;
  constructor(
    private groupService: GroupService,
    private shapeService: ShapeService,
    private socketService: SocketService
  ) { }

  init(canvas, renderer, roomId) {
    this.roomId = roomId;
    this.socketService.joinRoom(this.roomId);

    this.socketService.socket.on('groupAltered', (data) => {
      document.getElementById('deleteBtn')?.remove();
      for (const obj of canvas.getObjects()) {
        if (obj instanceof fabric.Group) {
          if (obj.id === data.id) {
            obj.left = data.left;
            obj.top = data.top;
            obj.scaleX = data.scaleX;
            obj.scaleY = data.scaleY;
            obj.angle = data.angle || 0;
            this.groupService.moveLines(obj);
            obj.setCoords();
            canvas.renderAll();
          }
        }
      }
    });

    this.socketService.socket.on('addedObject', (data) => {
      if (data[0] === 'rect') {
        this.shapeService.addRectangle(canvas, renderer, data[1]);
      } else if (data[0] === 'ellipse') {
        this.shapeService.addEllipse(canvas, renderer, data[1]);
      } else if (data[0] === 'triangle'){
        this.shapeService.addTriangle(canvas, renderer, data[1]);
      } else if (data[0] === 'textBox'){
        this.shapeService.addTextBox(canvas, renderer, data[1]);
      } else if (data[0] === 'avatar') {
        this.shapeService.addAvatar(canvas,renderer);
      }
    });

    this.socketService.socket.on('modifiedObject', (data) => {
      const h = data[0];
      document.getElementById('deleteBtn')?.remove();
      let gr;
      for (const ob of canvas._objects) {
        if (ob.id === h) {
          gr = ob;
          break;
        }
      }
      const shape = gr._objects[0];
      const text = gr._objects[1];
      text.fill = text.fill;
      text.fontStyle = 'italic';
      shape.set('opacity', 0.7);
      text.set('text', 'Someone is editing');
      this.groupService.unGroup(gr, canvas);
      text.lockMovementX = false;
      text.lockMovementY = false;
    });

    this.socketService.socket.on('regrouping', (h: any) => {
      document.getElementById('deleteBtn')?.remove();
      let g: fabric.Group;
      for (const ob of this.groupService.selectedGroup){
        if (ob.id === h[1]){
          g = ob;
          break;
        }
      }
      const shape = g._objects[0];
      const text = g._objects[1];
      text.fill = g._objects[1].fill;
      text.fontStyle = 'normal';
      text.set('text', h[0]);
      shape.set('opacity', 1);
      this.groupService.regroup(shape, text, canvas, renderer);
    });

    this.socketService.socket.on('clearCanvas', (can) => {
      canvas.clear();
      this.shapeService.setBackground(canvas, 'assets');
      document.getElementById('deleteBtn')?.remove();
    });

    this.socketService.socket.on('colorChange', (data) => {
      let gr;
      for (const ob of canvas._objects) {
        if (ob.id === data[0]) {
          gr = ob;
          break;
        }
      }
      const text = gr._objects[1];
      const shape = gr._objects[0];
      this.groupService.unGroup(gr, canvas);
      shape.fill = data[1];
      this.groupService.regroup(shape, text, canvas, renderer);
    });

    this.socketService.socket.on('deleteGroup', (data) => {
      let gr;
      for (const ob of canvas._objects) {
        if (ob.id === data) {
          gr = ob;
          break;
        }
      }
      this.groupService.delete(canvas, gr);
    });

    this.socketService.socket.on('drawingLines', (data: any) => {
      const h = {
        f: data[0],
        s: data[1],
      };
      for (const obj of canvas._objects) {
        if (h.f === obj.id) {
          canvas.selectedElements.push(obj);
        }
        if(h.s === obj.id){
          canvas.selectedElements.push(obj);
        }
      }
      this.groupService.drawLineTwoPoints(canvas);
      canvas.selectedElements.splice(0, 2);
    });
  }
}
