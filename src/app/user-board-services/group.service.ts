import { Injectable, Renderer2 } from '@angular/core';
import { fabric } from 'fabric';
import { ScalingService } from './scaling.service';
import { ConstantsService } from './constants.service';
import { SocketService } from '../socket-services/socket.service';
import { UserDatabaseService } from './user-database.service';
import { Subject } from 'rxjs/internal/Subject';
const TRI_WIDTH = 10;
const TRI_HEIGHT = 10;

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  selectedGroup: Array<fabric.Group> = [];
  givingId;
  currentUser;
  userEdit: Subject<boolean>;
  constructor(private scalingService: ScalingService, private constants: ConstantsService,
    private socketService: SocketService, private userDatabase: UserDatabaseService) {
    this.givingId = 0;
    this.currentUser = 'Unknown';
    this.userEdit = new Subject<boolean>();
  }

  makeLine(coords: fabric.Point, group1, group2) {

    const fromX = coords[0], fromY = coords[1], toX = coords[2], toY = coords[3];
    const lineEquation = this.getLineEquation(fromX, toX, fromY, toY);
    const toCoords = this.callibrationForShapes(toX, toY, group2.height/2, group2.width/2, lineEquation.slope, 
      lineEquation.constant, group2.shape, fromX, fromY);

    let line = new fabric.Line([fromX, fromY, toCoords.x, toCoords.y], {
      stroke: 'black',
      strokeWidth: 2,
      opacity: 0.6,
      selectable: false,
      preserveObjectStacking: true,
      toGroupCenter: {
        x: toX,
        y: toY
      }
    });
    line.triangle = new fabric.Triangle({
      left: line.x2,
      top: line.y2,
      angle: this.calcArrowAngle(line.x1, line.y1, line.x2, line.y2),
      originX: 'center',
      originY: 'center',
      hasBorders: false,
      hasControls: false,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      pointType: 'arrow_start',
      width: 10,
      height: 10,
      fill: 'red',
      selectable: false,
    });

    return line;
  }

  callibrationForShapes(
    toX: number, 
    toY: number, 
    height: number, 
    width: number, 
    slope: number,
    constant: number, 
    shape: string, 
    fromX: number, 
    fromY: number) {
    let toCoords;
    switch(shape) {
      case "ellipse":
        toCoords = this.callibrationForEllipse(toX, toY, height,
           width, slope,constant, fromX, fromY);
      break;

      case "rect":
        toCoords = this.callibrationForRectangle(toX, toY, fromX,
           fromY, width, height);
      break;

      case "triangle": 
        toCoords = this.callibrationForTriangle(toX, toY, height,
          width, slope,constant, fromX, fromY);
      break;
    }

    return toCoords;
  }

  calcArrowAngle(x1, y1, x2, y2) {
    var angle = 0,
      x, y;

    x = (x2 - x1);
    y = (y2 - y1);

    if (x === 0) {
      angle = (y === 0) ? 0 : (y > 0) ? Math.PI / 2 : Math.PI * 3 / 2;
    } else if (y === 0) {
      angle = (x > 0) ? 0 : Math.PI;
    } else {
      angle = (x < 0) ? Math.atan(y / x) + Math.PI : (y < 0) ? Math.atan(y / x) + (2 * Math.PI) : Math.atan(y / x);
    }

    return (angle * 180 / Math.PI + 90);
  }

  getLineEquation(x1, x2, y1, y2) {
    let slope = (y2-y1)/(x2-x1);
    let constant = (slope * -1 * x2) + y2;

    let line = {
      slope: slope,
      constant: constant
    }

    return line;
  }

  callibrationForEllipse(h, k, b, a, m, c, fromX, fromY) {
    const phi = c - k;
    const mu = c + m*h;
    const root1 = (b*b) + (a*a*m*m) - 2*m*phi*h - (phi*phi) - m*m*h*h;
    const root2 = (b*b) + (a*a*m*m) + 2*mu*k - k*k - mu*mu;
    let xCoord, yCoord;
    if(fromX < h){
      xCoord = (b*b*h - a*a*m*phi - Math.abs(a*b*Math.sqrt(root1)))/(b*b + a*a*m*m);
    } else {
      xCoord = (b*b*h - a*a*m*phi + Math.abs(a*b*Math.sqrt(root1)))/(b*b + a*a*m*m);
    }

    if(fromY < k){
      yCoord =  (b*b*mu + a*a*m*m*k - Math.abs( a*b*m*Math.sqrt(root2)))/(b*b + a*a*m*m);
    } else {
      yCoord =  (b*b*mu + a*a*m*m*k + Math.abs( a*b*m*Math.sqrt(root2)))/(b*b + a*a*m*m);
    }

    return {
      x: xCoord,
      y: yCoord
    } 
  }

  callibrationForRectangle(toX, toY, fromX, fromY,width, height) {
    let angle = this.calcArrowAngle(fromX, fromY, toX, toY);
    return {
      x: toX - ((width)*Math.cos((angle - 90) * Math.PI/ 180)),
      y: toY - ((height)*Math.sin((angle - 90) * Math.PI/ 180))
    }
  }

  callibrationForTriangle(toX, toY, height, width, slope,constant, fromX, fromY) {
    let leftVertex = {
      x: toX - width,
      y: toY - height
    };

    let rightVertex = {
      x: toX + width,
      y: toY - height
    };

    let topVertex = {
      x: toX,
      y: toY + height
    };

    let leftEdge = this.getLineEquation(leftVertex.x, topVertex.x, leftVertex.y, topVertex.y);
    let rightEdge = this.getLineEquation(topVertex.x, rightVertex.x, topVertex.y, rightVertex.y);
    let base = this.getLineEquation(leftVertex.x, rightVertex.x, leftVertex.y, rightVertex.y);
    let toCoords;
    // slope */= -1;
    if(slope < leftEdge.slope && slope > rightEdge.slope) {
      if(leftVertex.x > fromX) {
        toCoords = {
          x: toX - (width / 2),
          y: toY
        }
      } else {
        toCoords = {
          x: toX + (height/2) + 15,
          y: toY 
        }
      }

    } else if (slope > leftEdge.slope) {
      toCoords = {
        x: toX - (width / 2),
        y: toY + (height)
      }
    } else {
      toCoords = {
        x: toX,
        y: toY + (height)
      }
    }
    return toCoords;
  }

  createGroup(shape: fabric.Object, text: fabric.Itext, canvas: fabric.Canvas, x: number, y: number,
    connections: Array<{ name: string; line: fabric.Line; connectedWith: fabric.Group; i: any; }>,
    renderer: Renderer2, groupID: number, editing: boolean,
    angle: number, scaleX: number, scaleY: number, shapeType: string): fabric.Group {
    this.scalingService.scaleShapes(shape, text.getBoundingRect());
    const group = new fabric.Group([shape, text], {
      angle,
      scaleX,
      scaleY,
      left: x,
      top: y,
      connections,
      isEditable: true,
    });
    if (groupID === -1) {
      group.id = this.givingId;
      text.id = this.givingId;
      this.givingId += 1;
      canvas.givingId = this.givingId;
    }
    else {
      group.id = groupID;
      text.id = groupID;
    }
    group.type = 'group';
    group.editing = editing;
    group.setControlsVisibility(this.constants.HideControls);
    group.shape = shapeType;
    this.addEventListeners(canvas, group, renderer);
    canvas.add(group);
    this.userDatabase.sendingCanvas(canvas.toJSON(['id', 'connections', 'givingId', 'editing']));
    return group;
  }

  doubleClickEvent(obj, handler) {
    return () => {
      if (obj.clicked) {
        handler(obj);
      } else {
        obj.clicked = true;
        setTimeout(() => {
          obj.clicked = false;
        }, 500);
      }
    };
  }

  unGroup(group: fabric.Group, canvas: fabric.Canvas) {
    this.selectedGroup.push(group);
    group.editing = true;
    this.userDatabase.sendingCanvas(canvas.toJSON(['id', 'connections', 'givingId', 'editing']));
    const items = group._objects;
    group._restoreObjectsState();
    canvas.remove(group);
    for (const item of items) {
      canvas.add(item);
    }
    this.userEdit.next(true);
    canvas.renderAll();
  }

  regroup(shape: fabric.Object, text: fabric.IText,
    canvas: fabric.Canvas, renderer: Renderer2) {
    let g: fabric.Group;
    let u = 0;
    for (const ob of this.selectedGroup) {
      if (ob.id === text.id) {
        g = ob;
        break;
      }
      u++;
    }
    const groupCoord = g.getPointByOrigin(0, 0);
    canvas.remove(shape);
    canvas.remove(text);
    this.createGroup(
      shape,
      text,
      canvas,
      groupCoord.x,
      groupCoord.y,
      g.connections,
      renderer,
      g.id,
      false,
      g.angle,
      1,
      1,
      this.selectedGroup[0]._objects[0].type
    );
    this.selectedGroup.splice(u, 1);
    this.userEdit.next(false);
    this.userDatabase.sendingCanvas(canvas.toJSON(['id', 'connections', 'givingId', 'editing']));
  }

  drawLineTwoPoints(canvas: fabric.Canvas) {
    const group1 = canvas.selectedElements[0];
    const group2 = canvas.selectedElements[1];
    canvas.addChild = {
      start: group1
    }
    let line = this.makeLine([
      group1.getCenterPoint().x,
      group1.getCenterPoint().y,
      group2.getCenterPoint().x,
      group2.getCenterPoint().y,
    ], group1, group2);
    canvas.add(line, line.triangle);
    canvas.sendToBack(line);
    group1.connections.push({ name: 'p1', line, connectedGroup: group2.id });
    group2.connections.push({ name: 'p2', line, connectedGroup: group1.id });
    canvas.connect = false;
    canvas.connectButtonText = this.constants.connectText;
    this.userDatabase.sendingCanvas(canvas.toJSON(['id', 'connections', 'givingId', 'editing']));
  }

  moveLines(group: fabric.Group) {
    const newPoint = group.getCenterPoint();
    let groupHeight = group.height * group.scaleX, groupWidth = group.width * group.scaleY;
    for (const connection of group.connections) {
      if (connection.name === 'p1') {
        connection.line.set({
          x1: newPoint.x,
          y1: newPoint.y,
        });
        const lineEquation = this.getLineEquation(newPoint.x,connection.line.x2,newPoint.y,connection.line.y2);
        let toCoords = this.callibrationForShapes(connection.line.toGroupCenter.x,connection.line.toGroupCenter.y, groupHeight/2, groupWidth/2, lineEquation.slope, lineEquation.constant, group.shape, newPoint.x, newPoint.y);
        connection.line.set({
          x2: toCoords.x,
          y2: toCoords.y,
        });
        connection.line.triangle.set({
          left: connection.line.x2,
          top: connection.line.y2,
          angle: this.calcArrowAngle(connection.line.x1, connection.line.y1, connection.line.x2, connection.line.y2)
        })

      } else {
        const lineEquation = this.getLineEquation(connection.line.x1,newPoint.x,connection.line.y1,newPoint.y);
        connection.line.toGroupCenter.x = newPoint.x;
        connection.line.toGroupCenter.y = newPoint.y;
        let toCoords = this.callibrationForShapes(newPoint.x, newPoint.y, groupHeight/2, groupWidth/2, 
          lineEquation.slope, lineEquation.constant, group.shape, connection.line.x1,connection.line.y1);
        connection.line.set({
          x2: toCoords.x,
          y2: toCoords.y,
        });
        connection.line.triangle.set({
          left: connection.line.x2,
          top: connection.line.y2,
          angle: this.calcArrowAngle(connection.line.x1, connection.line.y1, connection.line.x2, connection.line.y2)
        });

      }
    }
  }

  delete(canvas: fabric.Canvas, gr?: fabric.Group) {
    let group;
    if (gr) {
      group = gr;
    } else {
      group = canvas.getActiveObject();
      this.socketService.deleteGroup(group.id, this.constants.roomID);
    }
    for (const connection of group.connections) {
      // tslint:disable-next-line: forin
      for (const index in connection.connectedGroup.connections) {
        const otherGroupConnections = connection.connectedGroup.connections;
        if (otherGroupConnections[index].connectedGroup === group) {
          otherGroupConnections.splice(index, 1);
        }
      }
      canvas.remove(connection.line);
    }
    canvas.remove(group);
    canvas.renderAll();
    this.userDatabase.sendingCanvas(canvas.toJSON(['id', 'connections', 'givingId', 'editing']));
  }

  addDeleteBtn(x: number, y: number, canvas: fabric.Canvas, renderer: Renderer2) {
    document.getElementById('deleteBtn')?.remove();
    const btnLeft = x - 10;
    const btnTop = y - 10;
    const delteBtn = renderer.createElement('img');
    delteBtn.id = 'deleteBtn';
    delteBtn.src = '../assets/icons8-delete.svg';
    delteBtn.style = `position:absolute;
    top:${btnTop}px;
    left:${btnLeft}px;
    cursor:pointer;
    width:20px;
    height:20px;`;
    renderer.appendChild(document.getElementsByClassName('canvas-container')[0], delteBtn);
    document.getElementById('deleteBtn').addEventListener('click', (event) => {
      this.delete(canvas);
    });
    this.userDatabase.sendingCanvas(canvas.toJSON(['id', 'connections', 'givingId', 'editing']));
  }

  addEventListeners(canvas: fabric.Canvas, group: fabric.Group, renderer: Renderer2) {
    group.on('selected', (e) => {
      this.addDeleteBtn(
        group.oCoords.tr.x,
        group.oCoords.tr.y,
        canvas,
        renderer
      );
    });

    group.on('modified', (e) => {
      this.addDeleteBtn(
        group.oCoords.tr.x,
        group.oCoords.tr.y,
        canvas,
        renderer
      );
    });

    group.on('scaling', (e) => {
      document.getElementById('deleteBtn')?.remove();
      if (group.connections.length > 0) {
        this.moveLines(group);
        canvas.renderAll();
      }
      this.socketService.sendGroup(group, this.constants.roomID);
    });

    group.on('moving', (e) => {
      document.getElementById('deleteBtn')?.remove();
      if (group.connections.length > 0) {
        this.moveLines(group);
        canvas.renderAll();
      }
      this.socketService.sendGroup(group, this.constants.roomID);
    });

    group.on('rotating', (e) => {
      document.getElementById('deleteBtn')?.remove();
      this.socketService.sendGroup(group, this.constants.roomID);
    });

    group.on('removed', (e) => {
      document.getElementById('deleteBtn')?.remove();
    });

    group.on(
      'mousedown',
      this.doubleClickEvent(group, () => {
        if (canvas.connect) {
          canvas.selectedElements.push(group);
          if (canvas.selectedElements.length === 2) {
            this.drawLineTwoPoints(canvas);
            this.socketService.drawLines({
              f: canvas.selectedElements[0].id,
              s: canvas.selectedElements[1].id,
              roomId: this.constants.roomID,
            });
            canvas.selectedElements.pop();
            canvas.selectedElements.pop();
          }
        } else {
          group.isEditable = false;
          this.socketService.somethingModified(group.id, this.currentUser, this.constants.roomID);
          this.unGroup(group, canvas);
          const text1 = group._objects[1];
          text1.lockMovementX = false;
          text1.lockMovementY = false;
          canvas.setActiveObject(text1);
          text1.enterEditing();
          text1.selectAll();
        }
      })
    );

    canvas.on('mouse:down', (e) => {
      if (!canvas.getActiveObject()) {
        document.getElementById('deleteBtn')?.remove();
      }
    });
  }
}
